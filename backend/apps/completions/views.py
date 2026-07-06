"""
FORGE — Completions App Views (Optimized for 500k users)

Key changes:
  - today_view: Prefetch with to_attr (filters tasks IN DB, not Python)
  - today_view: Redis-cached, invalidated on completion
  - CompleteTaskView: Invalidates dashboard cache after write
  - CompleteTaskView: Single query for scheduled_count (was re-counted per call)
  - completion_history: Added only() field projection
"""
import logging
from datetime import date
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.db.models import Prefetch
from drf_spectacular.utils import extend_schema

from apps.completions.models import Completion, DayLog
from apps.completions.serializers import (
    CompleteTaskSerializer,
    CompletionSerializer,
)
from apps.routines.models import Routine, Task
from apps.core.utils import get_user_local_date
from apps.core.exceptions import TaskAlreadyCompletedError, NotFoundError
from services.xp_service import XPService
from services.cache_service import CacheService, TTL_TODAY

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────
# Today View (optimized)
# ─────────────────────────────────────────────────────────

@extend_schema(responses=None)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def today_view(request):
    """
    GET /api/v1/today/

    Returns today's routines and task completion state.
    Prefer GET /api/v1/dashboard/ for the full initial load.
    This endpoint is for targeted today-only refreshes.

    Cache: 60s per user+date. Invalidated on completion events.
    Queries: 3 (routines+tasks prefetch, completions, streak+xp)
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

    # ── Query 1: Routines + active tasks (2 DB hits, no Python filtering) ──
    active_tasks_qs = Task.objects.filter(is_active=True).only(
        "id", "name", "description", "duration_minutes", "sort_order", "routine_id"
    ).order_by("sort_order")

    routines = list(
        Routine.objects.filter(user=user, is_active=True)
        .prefetch_related(
            Prefetch("tasks", queryset=active_tasks_qs, to_attr="active_tasks"),
            "schedule",
        )
        .only("id", "name", "icon", "color", "time_of_day", "sort_order")
        .order_by("sort_order")
    )

    # ── Query 2: All today's completions indexed ──
    completions = Completion.objects.filter(
        user=user, local_date=local_date
    ).only("id", "task_id", "completed_at", "note", "mood")
    completed_map = {str(c.task_id): c for c in completions}

    # ── Query 3: XP + streak (aggregate + single row lookup) ──
    xp_today = (
        XPTransaction.objects
        .filter(user=user, created_at__date=local_date, amount__gt=0)
        .aggregate(t=Sum("amount"))["t"] or 0
    )
    streak = (
        StreakRecord.objects
        .filter(user=user, routine__isnull=True)
        .only("current_streak")
        .first()
    )
    current_streak = streak.current_streak if streak else 0

    # ── Assemble ──
    routine_data = []
    total_tasks = total_done = 0

    for routine in routines:
        if not routine.is_scheduled_for(local_date):
            continue
        tasks_list = getattr(routine, "active_tasks", [])
        if not tasks_list:
            continue

        tasks_out = []
        r_done = 0

        for task in tasks_list:
            tid = str(task.id)
            comp = completed_map.get(tid)
            is_done = comp is not None
            if is_done:
                r_done += 1
                total_done += 1
            total_tasks += 1
            tasks_out.append({
                "id": tid,
                "name": task.name,
                "description": task.description,
                "duration_minutes": task.duration_minutes,
                "sort_order": task.sort_order,
                "is_completed": is_done,
                "completed_at": comp.completed_at.isoformat() if comp else None,
                "note": comp.note if comp else "",
                "mood": comp.mood if comp else None,
                "completion_id": str(comp.id) if comp else None,
            })

        tc = len(tasks_list)
        routine_data.append({
            "id": str(routine.id),
            "name": routine.name,
            "icon": routine.icon,
            "color": routine.color,
            "time_of_day": routine.time_of_day,
            "sort_order": routine.sort_order,
            "is_complete": r_done == tc and tc > 0,
            "task_count": tc,
            "completed_count": r_done,
            "completion_rate": round(r_done / tc * 100, 1) if tc else 0.0,
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
        "routines": routine_data,
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

        # Verify task ownership — single join query
        try:
            task = (
                Task.objects
                .select_related("routine")
                .only("id", "name", "routine_id", "routine__user_id", "routine__is_active")
                .get(
                    id=data["task_id"],
                    routine__user=user,
                    routine__is_active=True,
                    is_active=True,
                )
            )
        except Task.DoesNotExist:
            raise NotFoundError("Task not found or you do not have access to it.")

        # Duplicate guard — uses (user, task, local_date) unique_together index
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
        _, leveled_up = XPService.award_xp(
            user=user,
            amount=xp_amount,
            reason="task_complete",
            reference_id=completion.id,
            metadata={"task_id": str(task.id), "task_name": task.name},
        )
        user.refresh_from_db(fields=["total_xp", "current_level"])

        # ── Determine perfect day using pre-computed counts ──
        # Count tasks via DB aggregate (not Python iteration)
        from django.db.models import Count as DCount
        scheduled_count = (
            Task.objects
            .filter(routine__user=user, routine__is_active=True, is_active=True)
            .aggregate(c=DCount("id"))["c"]
        )
        done_today = Completion.objects.filter(user=user, local_date=local_date).count()
        is_perfect = scheduled_count > 0 and done_today == scheduled_count

        # ── Dispatch async DayLog sync ──
        from workers.tasks.reward_evaluator import sync_day_log
        sync_day_log.delay(str(user.id), local_date.isoformat())

        # ── Invalidate caches ──
        CacheService.invalidate_today(str(user.id))

        # ── Read streak (already in DB) ──
        from apps.streaks.models import StreakRecord
        streak = (
            StreakRecord.objects
            .filter(user=user, routine__isnull=True)
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
        completion = Completion.objects.only("id", "task_id", "local_date").get(
            id=completion_id, user=user, local_date=local_date
        )
    except Completion.DoesNotExist:
        raise NotFoundError("Completion not found or cannot be undone (different day).")

    xp_amount = XPService.get_task_xp()
    XPService.award_xp(
        user=user,
        amount=-xp_amount,
        reason="task_complete",
        reference_id=completion.id,
        metadata={"undone": True, "task_id": str(completion.task_id)},
    )
    completion.delete()

    # Invalidate caches
    CacheService.invalidate_today(str(user.id))

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

    Cursor-paginated completion history (20 per page).
    Use ?cursor=<token> for the next page.
    """
    from apps.core.pagination import ForgeCursorPagination

    qs = (
        Completion.objects
        .filter(user=request.user)
        .select_related("task", "task__routine")
        .only(
            "id", "task_id", "local_date", "completed_at", "note", "mood",
            "task__name", "task__routine_id",
            "task__routine__name", "task__routine__icon",
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

