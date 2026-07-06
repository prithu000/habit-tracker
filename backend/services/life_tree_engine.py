"""
FORGE — Life Tree Engine
Computes tree stage, branch count, and seasonal state from user data.
"""
from datetime import date, timedelta
from typing import Dict
import math


TREE_STAGES = [
    {
        "stage":       1,
        "name":        "Seedling",
        "season":      "spring",
        "min_streak":  0,
        "max_streak":  6,
        "emoji":       "🌱",
        "description": "A seedling taking root. You have started something.",
    },
    {
        "stage":       2,
        "name":        "Sapling",
        "season":      "summer",
        "min_streak":  7,
        "max_streak":  13,
        "emoji":       "🌿",
        "description": "A young tree reaching for light. Momentum is building.",
    },
    {
        "stage":       3,
        "name":        "Young Tree",
        "season":      "summer",
        "min_streak":  14,
        "max_streak":  29,
        "emoji":       "🌳",
        "description": "Roots deepening, branches spreading. You're becoming someone.",
    },
    {
        "stage":       4,
        "name":        "Full Tree",
        "season":      "autumn",
        "min_streak":  30,
        "max_streak":  89,
        "emoji":       "🍂",
        "description": "A full tree in its prime. Your habits are your identity now.",
    },
    {
        "stage":       5,
        "name":        "Ancient Oak",
        "season":      "winter",
        "min_streak":  90,
        "max_streak":  364,
        "emoji":       "🌲",
        "description": "Ancient and unshakeable. You have become what you set out to be.",
    },
    {
        "stage":       6,
        "name":        "Eternal Forest",
        "season":      "transcendent",
        "min_streak":  365,
        "max_streak":  999999,
        "emoji":       "✨🌲",
        "description": "A year. A full cycle. You didn't just keep a streak — you changed your life.",
    },
]


class LifeTreeEngine:
    """
    Life Tree = visual metaphor for the user's overall consistency.
    Stage = driven by current streak.
    Branches = number of active routines.
    Leaves = today's completion count.
    """

    @staticmethod
    def get_tree_state(user) -> Dict:
        """
        Returns the complete tree state for rendering.
        """
        from apps.streaks.models import StreakRecord
        from apps.routines.models import Routine
        from apps.completions.models import Completion
        from apps.core.utils import get_user_local_date

        local_date = get_user_local_date(user)

        # Streak drives the stage
        overall = StreakRecord.objects.filter(
            user=user, routine__isnull=True
        ).first()
        current_streak = overall.current_streak if overall else 0
        longest_streak = overall.longest_streak if overall else 0

        # Active routines → branches
        active_routines = Routine.objects.filter(user=user, is_active=True)
        branch_count = active_routines.count()

        # Today's completions → leaves added today
        leaves_today = Completion.objects.filter(user=user, local_date=local_date).count()

        # Total completions ever → total leaf count
        total_leaves = Completion.objects.filter(user=user).count()

        # Determine stage
        stage = LifeTreeEngine._get_stage(current_streak)

        # Days until next stage
        days_to_next = LifeTreeEngine._days_to_next_stage(current_streak)

        # Health score (0-100): based on recent consistency
        health = LifeTreeEngine._compute_tree_health(user, local_date)

        return {
            "current_streak": current_streak,
            "longest_streak": longest_streak,
            "stage": stage["stage"],
            "stage_name": stage["name"],
            "season": stage["season"],
            "emoji": stage["emoji"],
            "description": stage["description"],
            "branch_count": branch_count,
            "leaves_today": leaves_today,
            "total_leaves": total_leaves,
            "health": health,
            "days_to_next_stage": days_to_next,
            "next_stage_name": LifeTreeEngine._get_next_stage_name(stage["stage"]),
            "branches": [
                {
                    "id": str(r.id),
                    "name": r.name,
                    "icon": r.icon,
                    "color": r.color,
                }
                for r in active_routines
            ],
        }

    @staticmethod
    def _get_stage(streak: int) -> dict:
        for s in reversed(TREE_STAGES):
            if streak >= s["min_streak"]:
                return s
        return TREE_STAGES[0]

    @staticmethod
    def _get_next_stage_name(current_stage_num: int) -> str:
        for s in TREE_STAGES:
            if s["stage"] == current_stage_num + 1:
                return s["name"]
        return "Eternal Forest"

    @staticmethod
    def _days_to_next_stage(streak: int) -> int:
        for s in TREE_STAGES:
            if streak < s["min_streak"]:
                return s["min_streak"] - streak
        return 0  # Already at max stage

    @staticmethod
    def _compute_tree_health(user, ref_date) -> float:
        """
        Tree health = avg completion rate of last 7 days.
        0 = dead, 100 = thriving.
        """
        from apps.completions.models import DayLog
        from django.db.models import Avg

        week_start = ref_date - timedelta(days=6)
        avg = DayLog.objects.filter(
            user=user, log_date__range=[week_start, ref_date]
        ).aggregate(a=Avg("completion_rate"))["a"]

        return round(float(avg or 0), 1)
