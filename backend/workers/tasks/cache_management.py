"""
FORGE — Celery Tasks: Cache Management
Pre-warming and invalidation tasks for scale.
"""
from workers.celery_app import app
import logging

logger = logging.getLogger(__name__)


@app.task(bind=True, max_retries=2)
def warm_user_dashboard_cache(self, user_id: str):
    """
    Pre-warms the dashboard cache for a user.
    Called by Celery Beat at midnight (user's timezone) to ensure
    the first request of the day is fast.
    """
    try:
        from django.contrib.auth import get_user_model
        from apps.analytics.dashboard import _build_dashboard
        from apps.core.utils import get_user_local_date
        from services.cache_service import CacheService, TTL_DASHBOARD

        User = get_user_model()
        user = User.objects.only(
            "id", "total_xp", "current_level", "timezone",
            "display_name", "avatar_url", "identity_statement", "onboarding_completed"
        ).get(id=user_id)

        local_date = get_user_local_date(user)
        data = _build_dashboard(user, local_date)
        CacheService.set(user_id, "dashboard", data, TTL_DASHBOARD, local_date.isoformat())
        logger.info("Dashboard cache warmed for user %s", user_id)
        return True
    except Exception as exc:
        logger.error("warm_user_dashboard_cache failed for %s: %s", user_id, exc)
        raise self.retry(exc=exc)


@app.task
def invalidate_all_dashboard_caches():
    """
    Called at midnight UTC to clear yesterday's date-keyed caches.
    This prevents stale "today" data from being served after midnight.

    Note: date-variant caches naturally expire, but this ensures
    correctness for users in UTC+X timezones who cross midnight.
    """
    from django.core.cache import cache
    from django.contrib.auth import get_user_model

    User = get_user_model()
    user_ids = User.objects.filter(is_active=True).values_list("id", flat=True)

    from services.cache_service import CacheService
    for user_id in user_ids:
        CacheService.invalidate_today(str(user_id))

    logger.info("Cleared dashboard caches for %d users", len(user_ids))


@app.task
def invalidate_analytics_caches_after_rollup():
    """
    Called after the daily DayLog rollup completes.
    Clears analytics caches so fresh data is served.
    """
    from django.contrib.auth import get_user_model
    from services.cache_service import CacheService

    User = get_user_model()
    # Only invalidate users who had activity today (saves Redis calls)
    from apps.completions.models import DayLog
    from datetime import date, timedelta
    yesterday = date.today() - timedelta(days=1)
    active_user_ids = (
        DayLog.objects
        .filter(log_date=yesterday, tasks_completed__gt=0)
        .values_list("user_id", flat=True)
        .distinct()
    )

    for user_id in active_user_ids:
        CacheService.invalidate_analytics(str(user_id))

    logger.info(
        "Analytics caches invalidated for %d active users", len(active_user_ids)
    )


@app.task
def refresh_leaderboard_cache():
    """
    Refreshes the shared Discipline League leaderboard cache every 3 minutes.
    This is a shared cache (not per-user) so it scales regardless of user count.
    """
    try:
        from apps.rewards.models import XPTransaction
        from apps.streaks.models import StreakRecord
        from django.db.models import Sum
        from datetime import date
        from services.cache_service import CacheService

        today = date.today()
        season = f"{today.strftime('%B')} {today.year}"

        month_start = today.replace(day=1)
        monthly_xp = (
            XPTransaction.objects
            .filter(created_at__date__gte=month_start, amount__gt=0)
            .values("user_id")
            .annotate(total_xp=Sum("amount"))
            .order_by("-total_xp")[:10]
        )

        leaderboard = []
        for i, entry in enumerate(monthly_xp):
            streak = (
                StreakRecord.objects
                .filter(user_id=entry["user_id"], routine__isnull=True)
                .only("current_streak")
                .first()
            )
            leaderboard.append({
                "rank": i + 1,
                "monthly_xp": entry["total_xp"],
                "current_streak": streak.current_streak if streak else 0,
            })

        CacheService.set_leaderboard(season, {
            "season": season,
            "leaderboard": leaderboard,
            "total_participants": monthly_xp.count(),
        })
        logger.info("Leaderboard cache refreshed for season: %s", season)
    except Exception as e:
        logger.error("refresh_leaderboard_cache failed: %s", e)
