"""
FORGE — XP Service (Production)
Complete level progression system with 15 levels.
"""
from typing import Tuple, Optional
import logging

logger = logging.getLogger(__name__)

# Cumulative XP required to START each level
LEVEL_THRESHOLDS = [
    0,       # Level 1
    100,     # Level 2
    250,     # Level 3
    500,     # Level 4
    900,     # Level 5
    1_400,   # Level 6
    2_100,   # Level 7
    3_000,   # Level 8
    4_200,   # Level 9
    5_700,   # Level 10
    7_500,   # Level 11
    9_800,   # Level 12
    12_600,  # Level 13
    16_000,  # Level 14
    20_000,  # Level 15 — Master
]

LEVEL_TITLES = {
    1:  "Spark",
    2:  "Kindler",
    3:  "Builder",
    4:  "Forger",
    5:  "Disciplined",
    6:  "Consistent",
    7:  "Relentless",
    8:  "Unshakeable",
    9:  "Iron-Willed",
    10: "Legendary",
    11: "Master",
    12: "Grand Master",
    13: "Sage",
    14: "Titan",
    15: "Transcendent",
}

XP_REWARDS = {
    "task_complete":     10,
    "perfect_day":       50,
    "streak_7":         100,
    "streak_14":        200,
    "streak_30":        300,
    "streak_100":     1_000,
    "login_bonus":        5,
    "milestone":         75,
    "onboarding":        50,
    "badge_common":      20,
    "badge_rare":        50,
    "badge_epic":       100,
    "badge_legendary":  250,
}


class XPService:

    @staticmethod
    def get_xp_earned_for_date(user, local_date) -> int:
        """
        Single source of truth for total XP earned by a user on a given local date.
        Queries candidates across +- 2 UTC days and performs exact metadata / local timestamp checking.
        Database-agnostic (works flawlessly on SQLite and PostgreSQL).
        """
        from apps.rewards.models import XPTransaction
        from apps.core.utils import localize_date
        from datetime import timedelta

        date_str = str(local_date)

        candidate_txs = XPTransaction.objects.filter(
            user=user,
            amount__gt=0,
            created_at__date__gte=local_date - timedelta(days=2),
            created_at__date__lte=local_date + timedelta(days=2),
        )

        total = 0
        for tx in candidate_txs:
            meta = tx.metadata if isinstance(tx.metadata, dict) else {}
            if meta.get("local_date") == date_str or meta.get("date") == date_str:
                total += tx.amount
            elif "local_date" not in meta and "date" not in meta:
                try:
                    if localize_date(tx.created_at, user) == local_date:
                        total += tx.amount
                except Exception:
                    if tx.created_at.date() == local_date:
                        total += tx.amount

        return total


    @staticmethod
    def award_xp(
        user,
        amount: int,
        reason: str,
        reference_id=None,
        metadata: Optional[dict] = None,
        local_date=None,
    ) -> Tuple[int, bool]:
        """
        Awards XP to a user. Records the transaction and synchronizes daily metrics.
        Returns (new_total_xp, leveled_up).
        """
        from apps.rewards.models import XPTransaction

        if amount == 0:
            return user.total_xp, False

        if local_date is None:
            from apps.core.utils import get_user_local_date
            local_date = get_user_local_date(user)

        meta = dict(metadata or {})
        if "local_date" not in meta and local_date:
            meta["local_date"] = str(local_date)

        XPTransaction.objects.create(
            user=user,
            amount=amount,
            reason=reason,
            reference_id=reference_id,
            metadata=meta,
        )

        old_level = user.current_level
        user.total_xp = max(0, user.total_xp + amount)  # Never go below 0
        new_level = XPService.calculate_level(user.total_xp)
        user.current_level = new_level
        user.save(update_fields=["total_xp", "current_level", "updated_at"])

        # Synchronize DayLog and DailyOSMetrics with single source of truth
        if local_date:
            today_xp = XPService.get_xp_earned_for_date(user, local_date)
            try:
                from apps.completions.models import DayLog
                DayLog.objects.filter(user=user, log_date=local_date).update(xp_earned=today_xp)
            except Exception:
                pass
            try:
                from apps.analytics.models import DailyOSMetrics
                DailyOSMetrics.objects.filter(user=user, date=local_date).update(daily_xp=today_xp)
            except Exception:
                pass

        leveled_up = new_level > old_level
        if leveled_up:
            logger.info(
                "User %s leveled up: %d → %d (Total XP: %d)",
                user.id, old_level, new_level, user.total_xp,
            )
            XPService._on_level_up(user, old_level, new_level)

        return user.total_xp, leveled_up

    @staticmethod
    def _on_level_up(user, old_level: int, new_level: int):
        """Handles level-up side effects: notification, bonus XP."""
        from apps.notifications.models import Notification
        title = LEVEL_TITLES.get(new_level, f"Level {new_level}")
        Notification.objects.create(
            user=user,
            title=f"⚡ Level Up! You're now {title}",
            body=(
                f"You reached Level {new_level}. "
                f"Every task you complete builds the person you promised yourself you'd be."
            ),
            notif_type=Notification.NotifType.MILESTONE,
            action_url="/achievements",
        )

    @staticmethod
    def calculate_level(total_xp: int) -> int:
        """Returns the level for a given XP total."""
        level = 1
        for i, threshold in enumerate(LEVEL_THRESHOLDS):
            if total_xp >= threshold:
                level = i + 1
        return min(level, len(LEVEL_THRESHOLDS))

    @staticmethod
    def get_level_progress(total_xp: int, current_level: int) -> float:
        """Returns 0.0–100.0 progress within the current level."""
        level_idx = current_level - 1
        if level_idx >= len(LEVEL_THRESHOLDS) - 1:
            return 100.0
        current_threshold = LEVEL_THRESHOLDS[level_idx]
        next_threshold = LEVEL_THRESHOLDS[level_idx + 1]
        xp_in_level = total_xp - current_threshold
        xp_needed = next_threshold - current_threshold
        return round(min((xp_in_level / xp_needed) * 100, 100.0), 2)

    @staticmethod
    def get_task_xp() -> int:
        return XP_REWARDS["task_complete"]

    @staticmethod
    def get_badge_xp(rarity: str) -> int:
        return XP_REWARDS.get(f"badge_{rarity}", 20)

    @staticmethod
    def get_level_title(level: int) -> str:
        return LEVEL_TITLES.get(level, f"Level {level}")

    @staticmethod
    def get_xp_to_next_level(total_xp: int, current_level: int) -> int:
        next_idx = min(current_level, len(LEVEL_THRESHOLDS) - 1)
        return max(0, LEVEL_THRESHOLDS[next_idx] - total_xp)
