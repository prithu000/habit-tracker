"""
FORGE — Streak / Chain Engine (Production)
Handles streak calculation with grace periods, milestone detection, per-routine tracking.
"""
from datetime import date, timedelta
from typing import Optional, Tuple
from django.db import transaction
import logging

logger = logging.getLogger(__name__)

STREAK_MILESTONES = [3, 7, 14, 21, 30, 60, 90, 100, 180, 200, 365]


class StreakService:
    """
    Chain Engine: manages current streak, longest streak, grace periods.
    Grace period: one missed day is allowed without breaking the streak.
    Grace is used at most ONCE per streak chain.
    """
    GRACE_PERIOD_DAYS = 1

    @staticmethod
    @transaction.atomic
    def record_completion(
        user,
        local_date: date,
        routine=None,
    ) -> Optional[int]:
        """
        Records a completion event and updates the streak.
        Called both for overall streak (routine=None) and per-routine.
        Returns the milestone hit (int) or None.
        """
        from apps.streaks.models import StreakRecord

        targets = [None]
        if routine is not None:
            targets.append(routine)

        milestone_hit = None

        for target in targets:
            record, _ = StreakRecord.objects.select_for_update().get_or_create(
                user=user, routine=target,
                defaults={"current_streak": 0, "longest_streak": 0},
            )

            old_streak = record.current_streak
            prev_date = record.last_completed_date

            if prev_date is None:
                # First ever completion
                record.current_streak = 1
                record.grace_period_used = False

            elif prev_date == local_date:
                # Already counted today — no change
                continue

            elif prev_date == local_date - timedelta(days=1):
                # Perfect consecutive day
                record.current_streak += 1
                record.grace_period_used = False  # Reset grace usage

            elif (
                prev_date == local_date - timedelta(days=2)
                and not record.grace_period_used
            ):
                # Grace period: 1 missed day, grace not yet used
                record.current_streak += 1
                record.grace_period_used = True
                logger.info(
                    "Grace period applied for user %s (routine=%s), streak=%d",
                    user.id, target, record.current_streak
                )

            else:
                # Streak broken
                logger.info(
                    "Streak broken for user %s (routine=%s). Was %d, restarting.",
                    user.id, target, record.current_streak
                )
                record.current_streak = 1
                record.grace_period_used = False

            record.last_completed_date = local_date

            if record.current_streak > record.longest_streak:
                record.longest_streak = record.current_streak

            record.save()

            # Check milestones — only for overall streak
            if target is None and record.current_streak in STREAK_MILESTONES:
                milestone_hit = record.current_streak
                StreakService._award_streak_milestone_xp(user, record.current_streak)

        return milestone_hit

    @staticmethod
    def _award_streak_milestone_xp(user, streak: int):
        """Award bonus XP for hitting a streak milestone."""
        from services.xp_service import XPService

        xp_map = {
            3:   20,
            7:   XPService.XP_REWARDS.get("streak_7", 100),
            14:  150,
            21:  200,
            30:  XPService.XP_REWARDS.get("streak_30", 300),
            60:  500,
            90:  750,
            100: XPService.XP_REWARDS.get("streak_100", 1000),
            180: 1500,
            200: 2000,
            365: 5000,
        }
        xp = xp_map.get(streak, 0)
        if xp > 0:
            XPService.award_xp(
                user=user,
                amount=xp,
                reason="streak_bonus",
                metadata={"streak_days": streak},
            )

    @staticmethod
    def get_streak_data(user) -> dict:
        """Returns full streak data for a user."""
        from apps.streaks.models import StreakRecord
        records = StreakRecord.objects.filter(user=user).select_related("routine")
        overall = next((r for r in records if r.routine is None), None)
        per_routine = [r for r in records if r.routine is not None]
        return {
            "overall": overall,
            "per_routine": per_routine,
        }

    @staticmethod
    def evaluate_broken_streaks(user, local_date: date):
        """
        Call this on app load / daily job.
        Checks if any streaks should be marked as broken.
        """
        from apps.streaks.models import StreakRecord
        cutoff = local_date - timedelta(days=2)
        broken = StreakRecord.objects.filter(
            user=user,
            current_streak__gt=0,
            last_completed_date__lt=cutoff,
        )
        for record in broken:
            logger.info(
                "Auto-breaking streak for user %s (routine=%s), was %d",
                user.id, record.routine_id, record.current_streak,
            )
            record.current_streak = 0
            record.grace_period_used = False
            record.save(update_fields=["current_streak", "grace_period_used", "updated_at"])
