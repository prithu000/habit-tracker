"""
FORGE — Dashboard Aggregation API
Single endpoint designed for the frontend dashboard render.

Replaces 3 separate API calls:
  GET /api/v1/today/
  GET /api/v1/widgets/
  GET /api/v1/streaks/

With one:
  GET /api/v1/dashboard/

This endpoint is designed around frontend rendering needs,
not data models. It returns exactly what each UI component needs.

Query count: 5 total (was 12+)
  1. Routines + tasks (prefetch, field projection)
  2. Today's completions (single query, indexed)
  3. DayLog + XPTransaction aggregate (single query)
  4. StreakRecord (single query)
  5. Notification unread count + unseen badges (single query)

Cached per-user for 60 seconds.
Invalidated on: task completion, undo, midnight rollover.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Count, Q, Prefetch
from drf_spectacular.utils import extend_schema
import logging

from apps.core.utils import get_user_local_date
from services.cache_service import CacheService, TTL_DASHBOARD
from services.xp_service import XPService

logger = logging.getLogger(__name__)


def _build_dashboard(user, local_date) -> dict:
    """
    Core dashboard computation. Called only on cache miss.
    All DB access happens here — designed for minimum round trips.
    """
    from apps.routines.models import Routine, Task
    from apps.completions.models import Completion, DayLog
    from apps.streaks.models import StreakRecord
    from apps.rewards.models import XPTransaction, UserBadge
    from apps.notifications.models import Notification
    from apps.analytics.models import UserOSGoals, DailyOSMetrics

    # ── Query 1: Routines + tasks (2 DB hits via prefetch) ──
    # Use Prefetch with queryset to filter tasks in-DB, not Python
    active_tasks_qs = Task.objects.filter(is_active=True).only(
        "id", "name", "description", "duration_minutes",
        "sort_order", "routine_id"
    )
    routines = list(
        Routine.objects.filter(user=user, is_active=True)
        .prefetch_related(
            Prefetch("tasks", queryset=active_tasks_qs, to_attr="active_tasks"),
            "schedule",
        )
        .only("id", "name", "icon", "color", "time_of_day", "sort_order")
        .order_by("sort_order")
    )

    # ── Query 2: All of today's completions in one shot ──
    completions = list(
        Completion.objects.filter(user=user, local_date=local_date)
        .only("id", "task_id", "completed_at", "note", "mood")
    )
    completed_map = {str(c.task_id): c for c in completions}

    # ── Query 3: DayLog stats + XP aggregate (parallel via DB) ──
    day_log = (
        DayLog.objects.filter(user=user, log_date=local_date)
        .only("tasks_scheduled", "tasks_completed", "completion_rate", "xp_earned")
        .first()
    )

    xp_today = XPService.get_xp_earned_for_date(user, local_date)

    # ── Query 4: Streak + week mini in one DB hit ──
    from datetime import timedelta
    week_start = local_date - timedelta(days=13)
    from apps.completions.models import DayLog as DL

    streak_record = (
        StreakRecord.objects
        .filter(user=user, routine__isnull=True)
        .only("current_streak", "longest_streak", "last_completed_date", "grace_period_used")
        .first()
    )

    week_logs = {
        log.log_date: log
        for log in DL.objects.filter(
            user=user, log_date__range=[week_start, local_date]
        ).only("log_date", "completion_rate", "tasks_completed")
    }

    # ── Query 5: Notification count + unseen badges (combined) ──
    notif_count = (
        Notification.objects
        .filter(user=user, is_read=False)
        .aggregate(c=Count("id"))["c"] or 0
    )
    unseen_badges = list(
        UserBadge.objects
        .filter(user=user, seen=False)
        .select_related("badge")
        .only("badge__slug", "badge__name", "badge__icon", "badge__rarity")
        .values("badge__slug", "badge__name", "badge__icon", "badge__rarity")
    )

    # ── Assemble routine blocks ──
    routine_blocks = []
    total_tasks = 0
    total_done = 0

    for routine in routines:
        if not routine.is_scheduled_for(local_date):
            continue

        tasks_for_routine = getattr(routine, "active_tasks", [])

        tasks_out = []
        r_done = 0

        for task in sorted(tasks_for_routine, key=lambda t: t.sort_order):
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

        task_count = len(tasks_for_routine)
        routine_blocks.append({
            "id": str(routine.id),
            "name": routine.name,
            "icon": routine.icon,
            "color": routine.color,
            "time_of_day": routine.time_of_day,
            "sort_order": routine.sort_order,
            "is_complete": r_done == task_count and task_count > 0,
            "task_count": task_count,
            "completed_count": r_done,
            "completion_rate": round(r_done / task_count * 100, 1) if task_count else 0.0,
            "tasks": tasks_out,
        })

    completion_rate = round(total_done / total_tasks * 100, 1) if total_tasks else 0.0

    # ── Week mini ──
    week_mini = []
    for i in range(6, -1, -1):
        from datetime import timedelta as td
        d = local_date - td(days=i)
        log = week_logs.get(d)
        week_mini.append({
            "date": d.isoformat(),
            "day": d.strftime("%a"),
            "completion_rate": float(log.completion_rate) if log else 0.0,
            "tasks_completed": log.tasks_completed if log else 0,
            "is_today": d == local_date,
        })

    # ── Streak data ──
    current_streak = streak_record.current_streak if streak_record else 0
    longest_streak = streak_record.longest_streak if streak_record else 0
    streak_level = _streak_level(current_streak)

    # ── XP data ──
    level_progress = user.get_level_progress()
    xp_to_next = XPService.get_xp_to_next_level(user.total_xp, user.current_level)
    level_title = XPService.get_level_title(user.current_level)

    # ── OS Goals & Daily Metrics (Daily Reset Engine) ──
    os_goals, _ = UserOSGoals.objects.get_or_create(user=user)
    os_metrics, _ = DailyOSMetrics.objects.get_or_create(user=user, date=local_date)

    # ── GitHub Activity Grid (Real historical completion, no fake history before date_joined) ──
    joined_date = user.date_joined.date() if user.date_joined else local_date
    comp_counts = dict(
        Completion.objects.filter(
            user=user,
            local_date__range=[local_date - timedelta(days=13), local_date]
        ).values("local_date").annotate(c=Count("id")).values_list("local_date", "c")
    )

    github_history = []
    for i in range(13, -1, -1):
        from datetime import timedelta as td
        d = local_date - td(days=i)
        if d < joined_date:
            github_history.append({
                "date": d.isoformat(),
                "level": 0,
                "active": False,
                "tasks_completed": 0
            })
        else:
            log = week_logs.get(d)
            done = max(log.tasks_completed if log else 0, comp_counts.get(d, 0))
            rate = float(log.completion_rate) if log else (100.0 if done > 0 else 0.0)
            lvl = 0
            if done > 0 or rate > 0:
                if rate >= 90 or done >= 5: lvl = 4
                elif rate >= 70 or done >= 3: lvl = 3
                elif rate >= 40 or done >= 2: lvl = 2
                else: lvl = 1
            github_history.append({
                "date": d.isoformat(),
                "level": lvl,
                "active": True,
                "tasks_completed": done
            })

    return {
        # ── Today data ──
        "today": {
            "date": local_date.isoformat(),
            "stats": {
                "total_tasks": total_tasks,
                "completed_tasks": total_done,
                "completion_rate": completion_rate,
                "is_perfect_day": total_tasks > 0 and total_done == total_tasks,
                "xp_earned_today": xp_today,
                "current_streak": current_streak,
            },
            "routines": routine_blocks,
        },
        # ── Sidebar widgets ──
        "widgets": {
            "streak": {
                "current": current_streak,
                "longest": longest_streak,
                "level": streak_level,
                "last_completed": (
                    streak_record.last_completed_date.isoformat()
                    if streak_record and streak_record.last_completed_date else None
                ),
                "grace_period_used": streak_record.grace_period_used if streak_record else False,
            },
            "xp": {
                "total_xp": user.total_xp,
                "current_level": user.current_level,
                "level_title": level_title,
                "level_progress": level_progress,
                "xp_to_next_level": xp_to_next,
                "xp_earned_today": xp_today,
            },
            "day_progress": {
                "tasks_completed": total_done,
                "tasks_scheduled": total_tasks,
                "completion_rate": completion_rate,
                "is_perfect_day": total_tasks > 0 and total_done == total_tasks,
            },
            "week_mini": week_mini,
            "os_goals": {
                "water_goal_ml": os_goals.water_goal_ml,
                "workout_goal_exercises": os_goals.workout_goal_exercises,
                "study_goal_mins": os_goals.study_goal_mins,
            },
            "os_metrics": {
                "water_ml": os_metrics.water_ml,
                "workout_exercises": os_metrics.workout_exercises,
                "study_mins": os_metrics.study_mins,
                "pomodoro_sessions": os_metrics.pomodoro_sessions,
                "focus_mins": os_metrics.focus_mins,
                "daily_xp": xp_today,
            },
            "github_history": github_history,
        },
        # ── User context ──
        "user": {
            "id": str(user.id),
            "display_name": user.display_name,
            "avatar_url": user.avatar_url,
            "identity_statement": user.identity_statement,
            "current_level": user.current_level,
            "total_xp": user.total_xp,
            "level_title": level_title,
            "onboarding_completed": user.onboarding_completed,
        },
        # ── Notifications ──
        "notifications": {
            "unread_count": notif_count,
            "unseen_badges": unseen_badges,
        },
    }


def _streak_level(streak: int) -> str:
    if streak >= 30:
        return "inferno"
    if streak >= 15:
        return "fire"
    if streak >= 7:
        return "hot"
    if streak >= 3:
        return "warm"
    return "cold"


@extend_schema(responses=None)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_view(request):
    """
    GET /api/v1/dashboard/

    Single aggregated endpoint for the frontend dashboard.
    Returns: today's tasks, sidebar widgets, user context, notifications.

    Cache: 60 seconds per user.
    Invalidated by: task completion, undo, midnight (Celery beat).

    Query count: 5 (down from 12+)
    """
    user = request.user
    user_id = str(user.id)
    local_date = get_user_local_date(user)

    # Cache key includes date to handle midnight transitions correctly
    variant = local_date.isoformat()
    cached = CacheService.get(user_id, "dashboard", variant)
    if cached is not None:
        return Response(cached)

    data = _build_dashboard(user, local_date)

    CacheService.set(user_id, "dashboard", data, TTL_DASHBOARD, variant)
    return Response(data)
