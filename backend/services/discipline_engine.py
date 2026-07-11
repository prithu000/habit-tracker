"""
FORGE — Discipline Score Engine
Calculates a composite "Discipline Score" (0-1000) based on multiple behavioral signals.
This is the single number that represents the user's overall discipline health.
"""
from datetime import date, timedelta
from typing import Dict, Tuple
from apps.core.utils import safe_percentage
import logging

logger = logging.getLogger(__name__)


# Score components and their weights (must sum to 100)
SCORE_WEIGHTS = {
    "consistency":    30,  # Avg completion rate (last 30 days)
    "streak":         25,  # Current streak factor
    "frequency":      20,  # Active days / 30
    "momentum":       15,  # Trend: last 7 days vs previous 7 days
    "perfect_days":   10,  # Perfect days / 30
}

assert sum(SCORE_WEIGHTS.values()) == 100


class DisciplineEngine:
    """
    Discipline Score = weighted composite of 5 behavioral signals.
    Score is always 0–1000.
    Grade: S (900+), A (750+), B (600+), C (450+), D (300+), F (<300)
    """

    @staticmethod
    def compute_score(user, reference_date: date = None) -> Dict:
        """
        Computes the full discipline profile for a user.
        Returns a dict with component scores and the composite score.
        """
        from apps.completions.models import DayLog
        from apps.streaks.models import StreakRecord
        from django.db.models import Avg, Count, Q

        ref = reference_date or date.today()
        window_30 = ref - timedelta(days=29)
        window_7_recent = ref - timedelta(days=6)
        window_7_prev_start = ref - timedelta(days=13)
        window_7_prev_end = ref - timedelta(days=7)

        # ── 1. Consistency: avg completion rate last 30 days ──
        logs_30 = DayLog.objects.filter(
            user=user, log_date__range=[window_30, ref]
        )
        avg_rate = float(logs_30.aggregate(a=Avg("completion_rate"))["a"] or 0)
        consistency_score = (avg_rate / 100) * SCORE_WEIGHTS["consistency"] * 10

        # ── 2. Streak: current streak (diminishing returns) ──
        streak_record = StreakRecord.objects.filter(
            user=user, routine__isnull=True
        ).first()
        current_streak = streak_record.current_streak if streak_record else 0
        # Logarithmic scale: 7-day streak = 50% max, 30-day = 80%, 100+ = 100%
        import math
        streak_factor = min(math.log1p(current_streak) / math.log1p(100), 1.0)
        streak_score = streak_factor * SCORE_WEIGHTS["streak"] * 10

        # ── 3. Frequency: active days / 30 ──
        active_days = logs_30.filter(tasks_completed__gt=0).count()
        frequency_score = (active_days / 30) * SCORE_WEIGHTS["frequency"] * 10

        # ── 4. Momentum: recent 7 vs previous 7 ──
        recent_avg = float(
            DayLog.objects.filter(
                user=user, log_date__range=[window_7_recent, ref]
            ).aggregate(a=Avg("completion_rate"))["a"] or 0
        )
        prev_avg = float(
            DayLog.objects.filter(
                user=user, log_date__range=[window_7_prev_start, window_7_prev_end]
            ).aggregate(a=Avg("completion_rate"))["a"] or 0
        )
        
        # FIX: For new users with no data, momentum should be 0, not 50%
        if prev_avg == 0 and recent_avg == 0:
            momentum_factor = 0  # No data = 0 momentum
        elif prev_avg == 0:
            momentum_factor = 0.5  # Neutral if no prior data but have recent
        else:
            momentum_factor = min(max(recent_avg / prev_avg, 0), 1.5) / 1.5
        momentum_score = momentum_factor * SCORE_WEIGHTS["momentum"] * 10

        # ── 5. Perfect days ──
        perfect_count = logs_30.filter(completion_rate=100).count()
        perfect_score = (perfect_count / 30) * SCORE_WEIGHTS["perfect_days"] * 10

        # ── Composite ──
        total = consistency_score + streak_score + frequency_score + momentum_score + perfect_score
        # Convert from 0-1000 scale to 0-100 scale for frontend compatibility
        composite = round(min(total / 10, 100), 1)

        grade, grade_label = DisciplineEngine._get_grade(composite * 10)  # Use 1000-scale for grading

        trend = "improving" if recent_avg > prev_avg + 5 else (
            "declining" if recent_avg < prev_avg - 5 else "stable"
        )

        return {
            "score": composite,
            "grade": grade,
            "grade_label": grade_label,
            "trend": trend,
            "components": {
                "consistency": round(consistency_score, 1),
                "streak": round(streak_score, 1),
                "frequency": round(frequency_score, 1),
                "momentum": round(momentum_score, 1),
                "perfect_days": round(perfect_score, 1),
            },
            "raw_data": {
                "avg_completion_rate": round(avg_rate, 1),
                "current_streak": current_streak,
                "active_days_last_30": active_days,
                "perfect_days_last_30": perfect_count,
                "recent_7_avg": round(recent_avg, 1),
                "prev_7_avg": round(prev_avg, 1),
            },
        }

    @staticmethod
    def _get_grade(score: float) -> Tuple[str, str]:
        if score >= 900:
            return "S", "Transcendent"
        if score >= 750:
            return "A", "Elite"
        if score >= 600:
            return "B", "Disciplined"
        if score >= 450:
            return "C", "Consistent"
        if score >= 300:
            return "D", "Growing"
        return "F", "Beginning"

    @staticmethod
    def get_dna_profile(user) -> Dict:
        """
        Computes the 'Discipline DNA' behavioral fingerprint.
        Returns 5 named attributes with their scores.
        """
        from apps.completions.models import DayLog, Completion
        from apps.routines.models import Routine
        from django.db.models import Avg, Count
        from django.utils import timezone as tz
        import pytz

        ref = date.today()
        window = ref - timedelta(days=29)

        # Consistency attribute (0-100)
        logs = DayLog.objects.filter(user=user, log_date__range=[window, ref])
        consistency = float(logs.aggregate(a=Avg("completion_rate"))["a"] or 0)

        # Early Bird: % of completions that happen before noon local time
        user_tz_str = user.timezone or "UTC"
        try:
            user_tz = pytz.timezone(user_tz_str)
        except Exception:
            user_tz = pytz.UTC

        completions = Completion.objects.filter(
            user=user, local_date__range=[window, ref]
        )
        total_c = completions.count()
        morning_c = sum(
            1 for c in completions
            if c.completed_at.astimezone(user_tz).hour < 12
        )
        early_bird = safe_percentage(morning_c, total_c)

        # Depth: avg tasks per active day
        active_days = logs.filter(tasks_completed__gt=0)
        avg_per_day = active_days.aggregate(a=Avg("tasks_completed"))["a"] or 0
        depth = min(float(avg_per_day) / 10 * 100, 100)  # Normalize: 10 tasks/day = 100%

        # Recovery: (days_active_after_miss / total_misses) * 100
        all_logs = list(logs.order_by("log_date").values("log_date", "tasks_completed"))
        recovery = DisciplineEngine._compute_recovery_rate(all_logs)

        # Perfectionism: perfect days / active days
        perfect = logs.filter(completion_rate=100).count()
        active = logs.filter(tasks_completed__gt=0).count()
        perfectionism = safe_percentage(perfect, active)

        return {
            "consistency":    round(consistency, 1),
            "early_bird":     round(early_bird, 1),
            "depth":          round(depth, 1),
            "recovery":       round(recovery, 1),
            "perfectionism":  round(perfectionism, 1),
            "dominant_trait": DisciplineEngine._dominant_trait({
                "consistency": consistency,
                "early_bird": early_bird,
                "depth": depth,
                "recovery": recovery,
                "perfectionism": perfectionism,
            }),
        }

    @staticmethod
    def _compute_recovery_rate(logs: list) -> float:
        """
        Percentage of missed days that were followed by an active day.
        """
        if len(logs) < 2:
            return 50.0
        misses = 0
        recoveries = 0
        for i, log in enumerate(logs[:-1]):
            if log["tasks_completed"] == 0:
                misses += 1
                if logs[i + 1]["tasks_completed"] > 0:
                    recoveries += 1
        return safe_percentage(recoveries, misses) if misses else 100.0

    @staticmethod
    def _dominant_trait(traits: dict) -> str:
        return max(traits, key=traits.get)
