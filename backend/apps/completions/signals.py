"""
FORGE — Completions Signals
Triggered after every Completion save — runs the chain of XP, streak, badge evaluation.
"""
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from apps.completions.models import Completion
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Completion)
def on_completion_saved(sender, instance, created, **kwargs):
    """
    After a new Completion is created:
    1. Award XP (via XPService)
    2. Update streaks (via StreakService)
    3. Check for perfect day
    4. Evaluate badges (async Celery task)
    5. Send streak-related notification if milestone hit
    """
    if not created:
        return  # Only on new completions

    user = instance.user
    local_date = instance.local_date

    try:
        # 1. Streak update
        from services.streak_service import StreakService
        milestone = StreakService.record_completion(
            user=user,
            local_date=local_date,
            routine=instance.task.routine,
        )

        # 2. Check for perfect day and award bonus
        from apps.completions.models import Completion as C, DayLog
        from apps.routines.models import Task
        from services.xp_service import XPService

        # Count tasks scheduled for today vs completed
        from apps.core.utils import get_user_timezone
        import pytz
        from django.utils import timezone as dtz

        scheduled_tasks = Task.objects.filter(
            routine__user=user,
            routine__is_active=True,
            is_active=True,
        ).count()
        completed_today = C.objects.filter(user=user, local_date=local_date).count()

        if scheduled_tasks > 0 and completed_today == scheduled_tasks:
            # Perfect day! Award bonus XP
            already_awarded = DayLog.objects.filter(
                user=user, log_date=local_date, is_streak_day=True
            ).exists()
            if not already_awarded:
                XPService.award_xp(
                    user=user,
                    amount=50,
                    reason="perfect_day",
                    reference_id=instance.id,
                    metadata={"date": str(local_date)},
                )

        # 3. Send milestone notification
        if milestone:
            from apps.notifications.models import Notification
            Notification.objects.create(
                user=user,
                title=f"🔥 {milestone}-Day Streak!",
                body=f"You've kept your streak alive for {milestone} days in a row. This is who you are.",
                notif_type=Notification.NotifType.STREAK,
                action_url="/analytics",
            )

        # 4. Async badge evaluation
        from workers.tasks.reward_evaluator import evaluate_badges
        evaluate_badges.delay(str(user.id))

    except Exception as e:
        logger.error(
            "Error in on_completion_saved for completion %s: %s",
            instance.id, e, exc_info=True
        )
