"""
FORGE — Completions App Views (Flat Task Edition)

Routine/RoutineSchedule references removed.
Tasks are now queried directly by `user` FK.
Dashboard groups tasks by `category` instead of routine.
"""
import logging
from datetime import date
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from drf_spectacular.utils import extend_schema

from apps.completions.models import Completion, DayLog
from apps.completions.serializers import (
    CompleteTaskSerializer,
    CompletionSerializer,
)
from apps.routines.models import Task
from apps.core.utils import get_user_local_date
from apps.core.exceptions import TaskAlreadyCompletedError, NotFoundError
from services.xp_service import XPService
from services.cache_service import CacheService, TTL_TODAY

logger = logging.getLogger(__name__)

# Human-readable category labels
CATEGORY_LABELS = {
    "fitness":       "Fitness",
    "learning":      "Learning",
    "work":          "Work",
    "mental_health": "Mental Health",
    "health":        "Health",
    "sleep":         "Sleep",
    "finance":       "Finance",
    "personal":      "Personal",
    "discipline":    "Discipline",
}

# ─────────────────────────────────────────────────────────
# Today View (optimized, category-grouped)
# ─────────────────────────────────────────────────────────

@extend_schema(responses=None)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def today_view(request):
    """
    GET /api/v1/today/

    Returns today's tasks grouped by category with completion state.
    Prefer GET /api/v1/dashboard/ for the full initial load.

    Cache: 60s per user+date. Invalidated on completion events.
    Queries: 3 (tasks, completions, streak+xp)
    """
    from apps.rewards.models import XPTransaction
    from apps.streaks.models import StreakRecord
    from django.db.models import Sum

    user = request.user
    user_id = str(user.id)
    local_date = get_user_local_date(user)
    variant = local_date.isoformat()

    cached = CacheService.get(user_id, "today", variant)
    if cached is not None:
        return Response(cached)

    # ── Query 1: All active tasks for this user ──
    tasks = list(
        Task.objects.filter(user=user, is_active=True)
        .only("id", "name", "description", "duration_minutes", "sort_order", "category", "frequency")
        .order_by("category", "sort_order")
    )

    # ── Query 2: All today's completions indexed ──
    completions = Completion.objects.filter(
        user=user, local_date=local_date
    ).only("id", "task_id", "completed_at", "note", "mood")
    completed_map = {str(c.task_id): c for c in completions}

    # ── Query 3: XP + streak ──
    xp_today = XPService.get_xp_earned_for_date(user, local_date)
    streak = (
        StreakRecord.objects
        .filter(user=user)
        .only("current_streak")
        .first()
    )
    current_streak = streak.current_streak if streak else 0

    # ── Group tasks by category ──
    from collections import defaultdict
    category_map = defaultdict(list)
    for task in tasks:
        category_map[task.category].append(task)

    categories_out = []
    total_tasks = total_done = 0

    for category, cat_tasks in sorted(category_map.items()):
        tasks_out = []
        cat_done = 0

        for task in sorted(cat_tasks, key=lambda t: t.sort_order):
            tid = str(task.id)
            comp = completed_map.get(tid)
            is_done = comp is not None
            if is_done:
                cat_done += 1
                total_done += 1
            total_tasks += 1
            tasks_out.append({
                "id": tid,
                "name": task.name,
                "description": task.description,
                "duration_minutes": task.duration_minutes,
                "sort_order": task.sort_order,
                "category": task.category,
                "frequency": task.frequency,
                "is_completed": is_done,
                "completed_at": comp.completed_at.isoformat() if comp else None,
                "note": comp.note if comp else "",
                "mood": comp.mood if comp else None,
                "completion_id": str(comp.id) if comp else None,
            })

        tc = len(cat_tasks)
        categories_out.append({
            "category": category,
            "label": CATEGORY_LABELS.get(category, category.title()),
            "is_complete": cat_done == tc and tc > 0,
            "task_count": tc,
            "completed_count": cat_done,
            "completion_rate": round(cat_done / tc * 100, 1) if tc else 0.0,
            "tasks": tasks_out,
        })

    completion_rate = round(total_done / total_tasks * 100, 1) if total_tasks else 0.0
    data = {
        "date": local_date.isoformat(),
        "stats": {
            "total_tasks": total_tasks,
            "completed_tasks": total_done,
            "completion_rate": completion_rate,
            "is_perfect_day": total_tasks > 0 and total_done == total_tasks,
            "xp_earned_today": xp_today,
            "current_streak": current_streak,
        },
        "categories": categories_out,
        # Kept for any legacy consumers that may read `routines` — empty list signals migration
        "routines": [],
    }

    CacheService.set(user_id, "today", data, TTL_TODAY, variant)
    return Response(data)


# ─────────────────────────────────────────────────────────
# Task Completion (with cache invalidation)
# ─────────────────────────────────────────────────────────

class CompleteTaskView(APIView):
    """
    POST /api/v1/today/complete/
    Marks a task as completed. Invalidates dashboard + today cache.
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(request=CompleteTaskSerializer, responses=None)
    @transaction.atomic
    def post(self, request):
        serializer = CompleteTaskSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        user = request.user
        local_date = get_user_local_date(user)

        # Verify task ownership via direct user FK
        try:
            task = (
                Task.objects
                .only("id", "name", "user_id", "category")
                .get(
                    id=data["task_id"],
                    user=user,
                    is_active=True,
                )
            )
        except Task.DoesNotExist:
            raise NotFoundError("Task not found or you do not have access to it.")

        # Duplicate guard
        if Completion.objects.filter(task=task, user=user, local_date=local_date).exists():
            raise TaskAlreadyCompletedError()

        # Create completion
        completion = Completion.objects.create(
            task=task,
            user=user,
            local_date=local_date,
            note=data.get("note", ""),
            mood=data.get("mood"),
            duration_actual=data.get("duration_actual"),
        )

        # Award XP
        xp_amount = XPService.get_task_xp()
        new_total_xp, leveled_up = XPService.award_xp(
            user=user,
            amount=xp_amount,
            reason="task_complete",
            reference_id=completion.id,
            metadata={"task_id": str(task.id), "task_name": task.name},
            local_date=local_date,
            task=task,
        )
        user.refresh_from_db(fields=["total_xp", "current_level"])

        # ── Perfect day check ──
        from django.db.models import Count as DCount
        scheduled_count = (
            Task.objects
            .filter(user=user, is_active=True)
            .aggregate(c=DCount("id"))["c"]
        )
        done_today = Completion.objects.filter(user=user, local_date=local_date).count()
        is_perfect = scheduled_count > 0 and done_today == scheduled_count

        # ── Sync DayLog ──
        from workers.tasks.reward_evaluator import sync_day_log
        try:
            sync_day_log(str(user.id), local_date.isoformat())
        except Exception:
            try:
                sync_day_log.delay(str(user.id), local_date.isoformat())
            except Exception:
                pass

        # ── Invalidate caches ──
        CacheService.invalidate_all(str(user.id))
        CacheService.delete(str(user.id), f"life_score_2:{local_date.isoformat()}")
        CacheService.delete(str(user.id), f"discipline_score_2:{local_date.isoformat()}")

        # ── Read streak ──
        from apps.streaks.models import StreakRecord
        streak = (
            StreakRecord.objects
            .filter(user=user)
            .only("current_streak")
            .first()
        )

        # ── Unseen badges ──
        from apps.rewards.models import UserBadge
        unseen = list(
            UserBadge.objects
            .filter(user=user, seen=False)
            .select_related("badge")
            .values("badge__slug", "badge__name", "badge__icon", "badge__rarity")
        )

        return Response(
            {
                "completion_id": str(completion.id),
                "xp_earned": xp_amount,
                "xp_earned_today": XPService.get_xp_earned_for_date(user, local_date),
                "total_xp": user.total_xp,
                "current_level": user.current_level,
                "leveled_up": leveled_up,
                "level_progress": user.get_level_progress(),
                "current_streak": streak.current_streak if streak else 0,
                "is_perfect_day": is_perfect,
                "perfect_day_bonus_xp": 50 if is_perfect else 0,
                "new_badges": unseen,
            },
            status=status.HTTP_201_CREATED,
        )


# ─────────────────────────────────────────────────────────
# Undo Completion
# ─────────────────────────────────────────────────────────

@extend_schema(responses=None)
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def undo_completion(request, completion_id):
    """DELETE /api/v1/today/complete/{completion_id}/"""
    user = request.user
    local_date = get_user_local_date(user)

    try:
        completion = Completion.objects.select_related("task").only(
            "id", "task_id", "local_date", "task__id"
        ).get(id=completion_id, user=user, local_date=local_date)
    except Completion.DoesNotExist:
        raise NotFoundError("Completion not found or cannot be undone (different day).")

    XPService.rollback_xp(
        user=user,
        task=completion.task,
        local_date=local_date,
    )
    completion.delete()

    from workers.tasks.reward_evaluator import sync_day_log
    try:
        sync_day_log(str(user.id), local_date.isoformat())
    except Exception:
        pass

    CacheService.invalidate_all(str(user.id))
    CacheService.delete(str(user.id), f"life_score_2:{local_date.isoformat()}")
    CacheService.delete(str(user.id), f"discipline_score_2:{local_date.isoformat()}")

    return Response({"detail": "Completion undone successfully."}, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────────────────
# Completion History
# ─────────────────────────────────────────────────────────

@extend_schema(responses=None)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def completion_history(request):
    """
    GET /api/v1/today/history/?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD
    """
    from apps.core.pagination import ForgeCursorPagination

    qs = (
        Completion.objects
        .filter(user=request.user)
        .select_related("task")
        .only(
            "id", "task_id", "local_date", "completed_at", "note", "mood",
            "task__name", "task__category",
        )
        .order_by("-completed_at")
    )

    date_from = request.query_params.get("date_from")
    date_to = request.query_params.get("date_to")
    if date_from:
        qs = qs.filter(local_date__gte=date_from)
    if date_to:
        qs = qs.filter(local_date__lte=date_to)

    paginator = ForgeCursorPagination()
    page = paginator.paginate_queryset(qs, request)
    return paginator.get_paginated_response(
        CompletionSerializer(page, many=True).data
    )
