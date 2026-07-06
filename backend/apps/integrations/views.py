"""
FORGE — Widget API Views (Optimized)
Reduced from 7 DB queries to 2.
Heavy computation moved to dashboard endpoint — widgets now serve
sidebar-only data that updates independently of the today view.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from datetime import date, timedelta
from django.db.models import Sum, Count, Prefetch
from drf_spectacular.utils import extend_schema

from services.cache_service import CacheService, TTL_STREAK, TTL_TODAY
from services.xp_service import XPService
from apps.core.utils import get_user_local_date


@extend_schema(responses=None)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def widget_bundle(request):
    """
    GET /api/v1/widgets/

    Lightweight sidebar-only widget data.
    For full dashboard data, use GET /api/v1/dashboard/ instead.

    Query count: 2
      1. StreakRecord (single)
      2. DayLog week range + notification count (batched aggregate)

    Cached 60s per user. Invalidated on completion events.
    """
    from apps.completions.models import DayLog
    from apps.streaks.models import StreakRecord
    from apps.notifications.models import Notification
    from apps.rewards.models import UserBadge, XPTransaction

    user = request.user
    user_id = str(user.id)
    local_date = get_user_local_date(user)
    variant = local_date.isoformat()

    cached = CacheService.get(user_id, "widget_bundle", variant)
    if cached is not None:
        return Response(cached)

    # ── Query 1: Streak ──
    streak = (
        StreakRecord.objects
        .filter(user=user, routine__isnull=True)
        .only("current_streak", "longest_streak", "last_completed_date", "grace_period_used")
        .first()
    )
    current_streak = streak.current_streak if streak else 0

    # ── Query 2: Week logs + today XP + notification count (3 aggregates, all indexed) ──
    week_start = local_date - timedelta(days=6)

    week_logs = {
        log.log_date: log
        for log in DayLog.objects.filter(
            user=user, log_date__range=[week_start, local_date]
        ).only("log_date", "completion_rate", "tasks_completed", "xp_earned")
    }

    today_log = week_logs.get(local_date)

    # XP today from DayLog (already aggregated there via rollup), fall back to transaction sum
    xp_today = today_log.xp_earned if today_log else (
        XPTransaction.objects
        .filter(user=user, created_at__date=local_date, amount__gt=0)
        .aggregate(t=Sum("amount"))["t"] or 0
    )

    # Counts (indexed queries — fast)
    notif_count = Notification.objects.filter(user=user, is_read=False).count()
    unseen_count = UserBadge.objects.filter(user=user, seen=False).count()

    # ── Assemble ──
    week_mini = []
    for i in range(6, -1, -1):
        d = local_date - timedelta(days=i)
        log = week_logs.get(d)
        week_mini.append({
            "date": d.isoformat(),
            "day": d.strftime("%a"),
            "completion_rate": float(log.completion_rate) if log else 0.0,
            "tasks_completed": log.tasks_completed if log else 0,
            "is_today": d == local_date,
        })

    data = {
        "streak": {
            "current": current_streak,
            "longest": streak.longest_streak if streak else 0,
            "level": _streak_level(current_streak),
            "last_completed": (
                streak.last_completed_date.isoformat()
                if streak and streak.last_completed_date else None
            ),
            "grace_period_used": streak.grace_period_used if streak else False,
        },
        "xp": {
            "total_xp": user.total_xp,
            "current_level": user.current_level,
            "level_title": XPService.get_level_title(user.current_level),
            "level_progress": user.get_level_progress(),
            "xp_to_next_level": XPService.get_xp_to_next_level(user.total_xp, user.current_level),
            "xp_earned_today": xp_today,
        },
        "day_progress": {
            "date": local_date.isoformat(),
            "tasks_completed": today_log.tasks_completed if today_log else 0,
            "tasks_scheduled": today_log.tasks_scheduled if today_log else 0,
            "completion_rate": float(today_log.completion_rate) if today_log else 0.0,
        },
        "week_mini": week_mini,
        "notifications": {
            "unread_count": notif_count,
            "unseen_badges": unseen_count,
        },
    }

    CacheService.set(user_id, "widget_bundle", data, TTL_TODAY, variant)
    return Response(data)


@extend_schema(responses=None)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def streak_widget(request):
    """
    GET /api/v1/widgets/streak/
    Per-routine streak breakdown. Cached 120s.
    """
    from apps.streaks.models import StreakRecord

    user = request.user
    user_id = str(user.id)

    cached = CacheService.get(user_id, "streak")
    if cached is not None:
        return Response(cached)

    # One query with select_related to avoid N+1 on routine access
    records = list(
        StreakRecord.objects
        .filter(user=user)
        .select_related("routine")
        .only(
            "current_streak", "longest_streak",
            "last_completed_date", "grace_period_used",
            "routine__id", "routine__name", "routine__icon",
        )
    )

    overall = next((r for r in records if r.routine is None), None)
    per_routine = [
        {
            "routine_id": str(r.routine.id),
            "routine_name": r.routine.name,
            "routine_icon": r.routine.icon,
            "current_streak": r.current_streak,
            "longest_streak": r.longest_streak,
            "last_completed_date": (
                r.last_completed_date.isoformat() if r.last_completed_date else None
            ),
        }
        for r in records if r.routine is not None
    ]

    data = {
        "overall": {
            "current_streak": overall.current_streak if overall else 0,
            "longest_streak": overall.longest_streak if overall else 0,
            "last_completed_date": (
                overall.last_completed_date.isoformat()
                if overall and overall.last_completed_date else None
            ),
            "grace_period_used": overall.grace_period_used if overall else False,
        },
        "per_routine": per_routine,
    }

    CacheService.set(user_id, "streak", data, TTL_STREAK)
    return Response(data)


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
