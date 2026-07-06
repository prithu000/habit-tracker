"""
FORGE — Celery Tasks: Reward Evaluator
Async badge evaluation and daily rollup tasks.
"""
from workers.celery_app import app
import logging

logger = logging.getLogger(__name__)


@app.task(bind=True, max_retries=3, default_retry_delay=60)
def evaluate_badges(self, user_id: str):
    """
    Evaluate all achievement rules for a user.
    Called after every completion event.
    Idempotent — safe to retry.
    """
    try:
        from services.achievement_engine import AchievementEngine
        newly_awarded = AchievementEngine.evaluate(user_id)
        if newly_awarded:
            logger.info(
                "New badges awarded to user %s: %s",
                user_id, newly_awarded
            )
        return {"user_id": user_id, "new_badges": newly_awarded}
    except Exception as exc:
        logger.error("evaluate_badges failed for user %s: %s", user_id, exc)
        raise self.retry(exc=exc)


@app.task(bind=True, max_retries=2)
def sync_day_log(self, user_id: str, date_str: str):
    """
    Materializes a DayLog for the given user + date.
    Called after completions to keep DayLog up-to-date.
    """
    try:
        from django.contrib.auth import get_user_model
        from apps.completions.models import Completion, DayLog
        from apps.routines.models import Task
        from apps.rewards.models import XPTransaction
        from datetime import date as dt_date
        from django.db.models import Sum

        User = get_user_model()
        user = User.objects.get(id=user_id)
        log_date = dt_date.fromisoformat(date_str)

        # Tasks scheduled for that day
        tasks_scheduled = Task.objects.filter(
            routine__user=user, routine__is_active=True, is_active=True
        ).count()

        # Tasks completed
        tasks_completed = Completion.objects.filter(
            user=user, local_date=log_date
        ).count()

        completion_rate = (
            round(tasks_completed / tasks_scheduled * 100, 2)
            if tasks_scheduled else 0
        )

        # XP earned that day
        xp_earned = XPTransaction.objects.filter(
            user=user, created_at__date=log_date, amount__gt=0
        ).aggregate(total=Sum("amount"))["total"] or 0

        # Check if it's a streak day
        from apps.streaks.models import StreakRecord
        streak = StreakRecord.objects.filter(user=user, routine__isnull=True).first()
        is_streak_day = (
            streak is not None
            and streak.last_completed_date == log_date
            and streak.current_streak > 0
        )

        # Count completed routines
        from apps.routines.models import Routine
        routines_completed = 0
        for routine in Routine.objects.filter(user=user, is_active=True):
            routine_tasks = list(routine.tasks.filter(is_active=True).values_list("id", flat=True))
            if not routine_tasks:
                continue
            done = Completion.objects.filter(
                user=user, task__in=routine_tasks, local_date=log_date
            ).count()
            if done == len(routine_tasks):
                routines_completed += 1

        # Upsert DayLog
        DayLog.objects.update_or_create(
            user=user,
            log_date=log_date,
            defaults={
                "tasks_scheduled": tasks_scheduled,
                "tasks_completed": tasks_completed,
                "completion_rate": completion_rate,
                "xp_earned": xp_earned,
                "routines_completed": routines_completed,
                "is_streak_day": is_streak_day,
            },
        )

        logger.info(
            "DayLog synced: user=%s date=%s rate=%.1f%%",
            user_id, date_str, completion_rate
        )
        return {"user_id": user_id, "date": date_str, "rate": completion_rate}

    except Exception as exc:
        logger.error("sync_day_log failed for user %s, date %s: %s", user_id, date_str, exc)
        raise self.retry(exc=exc)


@app.task(bind=True, max_retries=2)
def generate_monthly_replay_cache(self, user_id: str, year: int, month: int):
    """
    Pre-generates Monthly Replay at month end. Stores in cache for fast retrieval.
    """
    try:
        from django.contrib.auth import get_user_model
        from services.monthly_replay_engine import MonthlyReplayEngine
        from django.core.cache import cache
        import json

        User = get_user_model()
        user = User.objects.get(id=user_id)
        data = MonthlyReplayEngine.generate(user, year=year, month=month)
        cache_key = f"monthly_replay:{user_id}:{year}:{month:02d}"
        cache.set(cache_key, json.dumps(data), timeout=60 * 60 * 24 * 35)  # 35 days
        logger.info("Monthly replay cached for user %s: %d/%d", user_id, year, month)
        return {"cached": True}

    except Exception as exc:
        logger.error("generate_monthly_replay_cache failed: %s", exc)
        raise self.retry(exc=exc)
