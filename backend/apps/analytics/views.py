"""
FORGE — Analytics App Views (Optimized)
All expensive views are now Redis-cached.

Cache strategy:
  weekly:   300s  (changes on DayLog rollup, not every completion)
  monthly:  600s  (changes nightly)
  year:    1800s  (changes nightly)
  heatmap: 3600s  (only changes at midnight)
  score:    600s
  dna:      600s
  replay:  86400s (generated once per month)
  tree:     300s
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from apps.core.permissions import HasPremiumAccessPermission
from datetime import date
import logging
from drf_spectacular.utils import extend_schema

from services.cache_service import (
    CacheService,
    TTL_ANALYTICS_W, TTL_ANALYTICS_M, TTL_ANALYTICS_Y,
    TTL_HEATMAP, TTL_DNA, TTL_LIFE_TREE, TTL_REPLAY,
    cache_response,
)
from apps.core.utils import get_user_local_date

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────
# Weekly Analytics
# ─────────────────────────────────────────────────────────

@extend_schema(responses=None)
@api_view(["GET"])
@permission_classes([IsAuthenticated, HasPremiumAccessPermission])
def weekly_analytics(request):
    """GET /api/v1/analytics/weekly/?date=YYYY-MM-DD — Cached 300s"""
    from apps.completions.models import DayLog
    from apps.streaks.models import StreakRecord
    from django.db.models import Avg, Sum
    from apps.core.utils import get_week_bounds, get_date_range

    user = request.user
    date_str = request.query_params.get("date", "")

    # Cache key variant includes the requested date
    user_id = str(user.id)
    variant = date_str or get_user_local_date(user).isoformat()
    cached = CacheService.get(user_id, "analytics_weekly", variant)
    if cached is not None:
        return Response(cached)

    if date_str:
        try:
            ref_date = date.fromisoformat(date_str)
        except ValueError:
            return Response(
                {"error": "Invalid date format. Use YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST,
            )
    else:
        ref_date = get_user_local_date(user)

    monday, sunday = get_week_bounds(ref_date)

    # All 7 days in one query
    logs = list(
        DayLog.objects.filter(user=user, log_date__range=[monday, sunday])
        .only("log_date", "completion_rate", "tasks_completed", "tasks_scheduled",
              "xp_earned", "is_streak_day")
        .order_by("log_date")
    )
    log_map = {l.log_date: l for l in logs}

    days = []
    for day in get_date_range(monday, sunday):
        log = log_map.get(day)
        days.append({
            "date": day.isoformat(),
            "day_name": day.strftime("%A"),
            "completion_rate": float(log.completion_rate) if log else 0.0,
            "tasks_completed": log.tasks_completed if log else 0,
            "tasks_scheduled": log.tasks_scheduled if log else 0,
            "xp_earned": log.xp_earned if log else 0,
            "is_streak_day": log.is_streak_day if log else False,
        })

    # Aggregates across the full 7-day calendar period
    avg_rate = round(sum(float(l.completion_rate) for l in logs) / 7.0, 1) if logs else 0.0
    total_xp = sum(l.xp_earned for l in logs)
    total_done = sum(l.tasks_completed for l in logs)
    active_days = sum(1 for l in logs if l.tasks_completed > 0)
    perfect_days = sum(1 for l in logs if float(l.completion_rate) == 100)
    best_log = max(logs, key=lambda l: l.completion_rate, default=None)

    # Previous week comparison — one extra query (cached separately)
    from datetime import timedelta
    prev_monday = monday - timedelta(days=7)
    prev_sunday = monday - timedelta(days=1)
    prev_logs = DayLog.objects.filter(
        user=user, log_date__range=[prev_monday, prev_sunday]
    ).only("completion_rate")
    prev_avg = (
        sum(float(l.completion_rate) for l in prev_logs) / prev_logs.count()
        if prev_logs.exists() else 0.0
    )

    streak = (
        StreakRecord.objects
        .filter(user=user, routine__isnull=True)
        .only("current_streak")
        .first()
    )

    data = {
        "period": {"start": monday.isoformat(), "end": sunday.isoformat(), "type": "weekly"},
        "summary": {
            "avg_completion_rate": round(avg_rate, 1),
            "total_xp_earned": total_xp,
            "total_tasks_completed": total_done,
            "active_days": active_days,
            "perfect_days": perfect_days,
            "trend_vs_previous": round(avg_rate - prev_avg, 1),
            "current_streak": streak.current_streak if streak else 0,
            "best_day": best_log.log_date.isoformat() if best_log else None,
            "best_day_rate": float(best_log.completion_rate) if best_log else 0.0,
        },
        "days": days,
    }

    CacheService.set(user_id, "analytics_weekly", data, TTL_ANALYTICS_W, variant)
    return Response(data)


# ─────────────────────────────────────────────────────────
# Monthly Analytics
# ─────────────────────────────────────────────────────────

@extend_schema(responses=None)
@api_view(["GET"])
@permission_classes([IsAuthenticated, HasPremiumAccessPermission])
def monthly_analytics(request):
    """GET /api/v1/analytics/monthly/?year=2026&month=7 — Cached 600s"""
    from apps.completions.models import DayLog, Completion
    from apps.routines.models import Routine, Task
    from django.db.models import Avg, Sum, Count
    from apps.core.utils import get_month_bounds, safe_percentage
    from services.calendar_engine import CalendarEngine

    user = request.user
    user_id = str(user.id)

    try:
        year = int(request.query_params.get("year", date.today().year))
        month = int(request.query_params.get("month", date.today().month))
        if not (1 <= month <= 12) or year < 2020:
            raise ValueError
    except (TypeError, ValueError):
        return Response({"error": "Invalid year or month."}, status=status.HTTP_400_BAD_REQUEST)

    variant = f"{year}-{month:02d}"
    cached = CacheService.get(user_id, "analytics_monthly", variant)
    if cached is not None:
        return Response(cached)

    first_day, last_day = get_month_bounds(date(year, month, 1))
    logs = list(
        DayLog.objects.filter(user=user, log_date__range=[first_day, last_day])
        .only("log_date", "completion_rate", "tasks_completed", "xp_earned", "is_streak_day")
    )

    # Aggregates across exact calendar days of the month
    month_days = (last_day - first_day).days + 1
    avg_rate = round(sum(float(l.completion_rate) for l in logs) / max(1, month_days), 1) if logs else 0.0
    total_xp = sum(l.xp_earned for l in logs)
    total_tasks = sum(l.tasks_completed for l in logs)
    active_days = sum(1 for l in logs if l.tasks_completed > 0)
    perfect_days = sum(1 for l in logs if float(l.completion_rate) == 100)

    # Routine breakdown — uses annotated aggregate, not Python loops
    routine_stats = (
        Completion.objects
        .filter(user=user, local_date__range=[first_day, last_day])
        .values("task__routine_id", "task__routine__name", "task__routine__icon")
        .annotate(done=Count("id"))
        .order_by("-done")
    )
    routines_breakdown = [
        {
            "routine_id": str(r["task__routine_id"]),
            "routine_name": r["task__routine__name"],
            "routine_icon": r["task__routine__icon"],
            "tasks_completed": r["done"],
        }
        for r in routine_stats
    ]

    # Day-of-week averages (in Python from already-fetched logs)
    weekday_buckets = {}
    for log in logs:
        wd = log.log_date.weekday()
        weekday_buckets.setdefault(wd, []).append(float(log.completion_rate))
    day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    weekday_chart = [
        {
            "day": day_names[i],
            "avg_completion_rate": round(
                sum(weekday_buckets[i]) / len(weekday_buckets[i]), 1
            ) if i in weekday_buckets else 0.0,
        }
        for i in range(7)
    ]

    calendar_grid = CalendarEngine.get_monthly_grid(user, year, month)

    data = {
        "period": {"year": year, "month": month, "start": first_day.isoformat(), "end": last_day.isoformat()},
        "summary": {
            "avg_completion_rate": round(avg_rate, 1),
            "total_xp_earned": total_xp,
            "total_tasks_completed": total_tasks,
            "active_days": active_days,
            "perfect_days": perfect_days,
            "total_days": (last_day - first_day).days + 1,
        },
        "routines_breakdown": routines_breakdown,
        "weekday_averages": weekday_chart,
        "calendar_grid": calendar_grid,
    }

    CacheService.set(user_id, "analytics_monthly", data, TTL_ANALYTICS_M, variant)
    return Response(data)


# ─────────────────────────────────────────────────────────
# Year Analytics
# ─────────────────────────────────────────────────────────

@extend_schema(responses=None)
@api_view(["GET"])
@permission_classes([IsAuthenticated, HasPremiumAccessPermission])
def year_analytics(request):
    """GET /api/v1/analytics/year/?year=2026 — Cached 1800s"""
    from apps.completions.models import DayLog
    from apps.streaks.models import StreakRecord
    from services.calendar_engine import CalendarEngine
    import calendar as cal_module

    user = request.user
    user_id = str(user.id)
    year = int(request.query_params.get("year", date.today().year))
    variant = str(year)

    cached = CacheService.get(user_id, "analytics_year", variant)
    if cached is not None:
        return Response(cached)

    # Single query for all year logs
    logs = list(
        DayLog.objects.filter(user=user, log_date__year=year)
        .only("log_date", "completion_rate", "tasks_completed", "xp_earned")
    )

    # Monthly breakdown in Python (faster than 12 DB queries)
    monthly_buckets = {}
    for log in logs:
        m = log.log_date.month
        monthly_buckets.setdefault(m, []).append(log)

    monthly = []
    for m in range(1, 13):
        m_logs = monthly_buckets.get(m, [])
        days_in_m = cal_module.monthrange(year, m)[1]
        avg = (
            sum(float(l.completion_rate) for l in m_logs) / days_in_m
            if m_logs else 0.0
        )
        xp = sum(l.xp_earned for l in m_logs)
        monthly.append({
            "month": m,
            "month_name": cal_module.month_abbr[m],
            "avg_completion_rate": round(avg, 1),
            "xp_earned": xp,
            "active_days": sum(1 for l in m_logs if l.tasks_completed > 0),
            "perfect_days": sum(1 for l in m_logs if float(l.completion_rate) == 100),
        })

    total_xp = sum(l.xp_earned for l in logs)
    active_days = sum(1 for l in logs if l.tasks_completed > 0)
    perfect_days = sum(1 for l in logs if float(l.completion_rate) == 100)
    days_in_y = 366 if cal_module.isleap(year) else 365
    avg_year = round(sum(float(l.completion_rate) for l in logs) / days_in_y, 1) if logs else 0.0

    streak = (
        StreakRecord.objects
        .filter(user=user, routine__isnull=True)
        .only("longest_streak")
        .first()
    )
    heatmap = CalendarEngine.get_heatmap(user, year=year)

    data = {
        "year": year,
        "summary": {
            "total_xp_earned": total_xp,
            "active_days": active_days,
            "perfect_days": perfect_days,
            "avg_completion_rate": round(avg_year, 1),
            "longest_streak": streak.longest_streak if streak else 0,
        },
        "monthly_chart": monthly,
        "heatmap": heatmap,
    }

    CacheService.set(user_id, "analytics_year", data, TTL_ANALYTICS_Y, variant)
    return Response(data)


# ─────────────────────────────────────────────────────────
# Heatmap
# ─────────────────────────────────────────────────────────

@extend_schema(responses=None)
@api_view(["GET"])
@permission_classes([IsAuthenticated, HasPremiumAccessPermission])
def heatmap_view(request):
    """GET /api/v1/analytics/heatmap/?year=2026 — Cached 1h"""
    from services.calendar_engine import CalendarEngine

    user = request.user
    user_id = str(user.id)
    year = request.query_params.get("year")
    year_int = int(year) if year else None
    variant = str(year_int or "rolling")

    cached = CacheService.get(user_id, "heatmap", variant)
    if cached is not None:
        return Response({"heatmap": cached})

    data = CalendarEngine.get_heatmap(user, year=year_int)
    CacheService.set(user_id, "heatmap", data, TTL_HEATMAP, variant)
    return Response({"heatmap": data})


@extend_schema(operation_id="analytics_heatmap_day_detail", responses=None)
@api_view(["GET"])
@permission_classes([IsAuthenticated, HasPremiumAccessPermission])
def heatmap_day_detail(request, date_str):
    """GET /api/v1/analytics/heatmap/{date}/"""
    from services.calendar_engine import CalendarEngine
    try:
        target_date = date.fromisoformat(date_str)
    except ValueError:
        return Response({"error": "Invalid date format."}, status=400)
    # Day detail is not cached — too granular and low traffic
    return Response(CalendarEngine.get_day_detail(request.user, target_date))


# ─────────────────────────────────────────────────────────
# Discipline Score
# ─────────────────────────────────────────────────────────

@extend_schema(responses=None)
@api_view(["GET"])
@permission_classes([IsAuthenticated, HasPremiumAccessPermission])
def discipline_score(request):
    """GET /api/v1/analytics/discipline-score/ — Cached 600s"""
    from services.discipline_engine import DisciplineEngine

    user = request.user
    user_id = str(user.id)

    cached = CacheService.get(user_id, "discipline_score")
    if cached is not None:
        return Response(cached)

    data = DisciplineEngine.compute_score(user)
    CacheService.set(user_id, "discipline_score", data, 600)
    return Response(data)


@extend_schema(responses=None)
@api_view(["GET"])
@permission_classes([IsAuthenticated, HasPremiumAccessPermission])
def discipline_dna(request):
    """GET /api/v1/analytics/discipline-dna/ — Cached 600s"""
    from services.discipline_engine import DisciplineEngine

    user = request.user
    user_id = str(user.id)

    cached = CacheService.get(user_id, "dna")
    if cached is not None:
        return Response(cached)

    data = DisciplineEngine.get_dna_profile(user)
    CacheService.set(user_id, "dna", data, TTL_DNA)
    return Response(data)


# ─────────────────────────────────────────────────────────
# Monthly Replay
# ─────────────────────────────────────────────────────────

@extend_schema(responses=None)
@api_view(["GET"])
@permission_classes([IsAuthenticated, HasPremiumAccessPermission])
def monthly_replay(request):
    """GET /api/v1/analytics/replay/?year=2026&month=6 — Cached 24h"""
    from services.monthly_replay_engine import MonthlyReplayEngine

    user = request.user
    user_id = str(user.id)

    try:
        year = int(request.query_params.get("year", date.today().year))
        month = int(request.query_params.get("month", date.today().month - 1 or 12))
        if not (1 <= month <= 12):
            raise ValueError
    except (TypeError, ValueError):
        return Response({"error": "Invalid year or month."}, status=400)

    variant = f"{year}-{month:02d}"
    cached = CacheService.get(user_id, "replay", variant)
    if cached is not None:
        return Response(cached)

    data = MonthlyReplayEngine.generate(user, year=year, month=month)
    CacheService.set(user_id, "replay", data, TTL_REPLAY, variant)
    return Response(data)


# ─────────────────────────────────────────────────────────
# Life Tree
# ─────────────────────────────────────────────────────────

@extend_schema(responses=None)
@api_view(["GET"])
@permission_classes([IsAuthenticated, HasPremiumAccessPermission])
def life_tree(request):
    """GET /api/v1/analytics/life-tree/ — Cached 300s"""
    from services.life_tree_engine import LifeTreeEngine

    user = request.user
    user_id = str(user.id)

    cached = CacheService.get(user_id, "life_tree")
    if cached is not None:
        return Response(cached)

    data = LifeTreeEngine.get_tree_state(user)
    CacheService.set(user_id, "life_tree", data, TTL_LIFE_TREE)
    return Response(data)
