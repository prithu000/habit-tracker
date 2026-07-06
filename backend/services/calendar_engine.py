"""
FORGE — Calendar Engine
Generates 365-day heatmap data and per-day snapshots.
"""
from datetime import date, timedelta
from typing import List, Dict
from apps.core.utils import safe_percentage, get_date_range
import logging

logger = logging.getLogger(__name__)


class CalendarEngine:
    """
    Produces the data needed by the GitHub-style heatmap calendar.
    Uses DayLog materialized data for speed.
    Falls back to real-time computation for days not yet in DayLog.
    """

    @staticmethod
    def get_heatmap(user, year: int = None) -> List[Dict]:
        """
        Returns 365 days of completion data for the heatmap.
        Result: [{ date, completion_rate, tasks_completed, tasks_scheduled, level }]
        Level 0-5 maps to heatmap intensity.
        """
        from apps.completions.models import DayLog
        from django.utils import timezone

        today = date.today()
        if year:
            start = date(year, 1, 1)
            end = date(year, 12, 31)
        else:
            end = today
            start = end - timedelta(days=364)

        # Fetch materialized logs
        logs = DayLog.objects.filter(
            user=user,
            log_date__range=[start, end],
        ).values("log_date", "completion_rate", "tasks_completed", "tasks_scheduled")

        log_map = {l["log_date"]: l for l in logs}

        result = []
        for day in get_date_range(start, end):
            if day in log_map:
                log = log_map[day]
                rate = float(log["completion_rate"])
            else:
                # Future or no data
                rate = 0.0
                log = {"tasks_completed": 0, "tasks_scheduled": 0}

            level = CalendarEngine._rate_to_level(rate)
            is_future = day > today

            result.append({
                "date": day.isoformat(),
                "completion_rate": rate,
                "tasks_completed": log.get("tasks_completed", 0),
                "tasks_scheduled": log.get("tasks_scheduled", 0),
                "level": level,
                "is_today": day == today,
                "is_future": is_future,
            })

        return result

    @staticmethod
    def _rate_to_level(rate: float) -> int:
        """Maps completion rate to heatmap intensity level 0-5."""
        if rate == 0:
            return 0
        if rate < 25:
            return 1
        if rate < 50:
            return 2
        if rate < 75:
            return 3
        if rate < 100:
            return 4
        return 5  # Perfect day

    @staticmethod
    def get_day_detail(user, target_date: date) -> Dict:
        """
        Returns detailed data for a specific day (used on calendar click).
        """
        from apps.completions.models import Completion, DayLog

        completions = Completion.objects.filter(
            user=user, local_date=target_date
        ).select_related("task", "task__routine")

        day_log = DayLog.objects.filter(user=user, log_date=target_date).first()

        return {
            "date": target_date.isoformat(),
            "completion_rate": float(day_log.completion_rate) if day_log else 0.0,
            "tasks_completed": day_log.tasks_completed if day_log else len(completions),
            "tasks_scheduled": day_log.tasks_scheduled if day_log else 0,
            "xp_earned": day_log.xp_earned if day_log else 0,
            "completions": [
                {
                    "task_name": c.task.name,
                    "routine_name": c.task.routine.name,
                    "routine_icon": c.task.routine.icon,
                    "completed_at": c.completed_at.isoformat(),
                    "note": c.note,
                    "mood": c.mood,
                }
                for c in completions
            ],
        }

    @staticmethod
    def get_monthly_grid(user, year: int, month: int) -> Dict:
        """
        Returns a month's data in a calendar grid format.
        Used for monthly view.
        """
        import calendar
        from apps.completions.models import DayLog

        first_day = date(year, month, 1)
        last_day_num = calendar.monthrange(year, month)[1]
        last_day = date(year, month, last_day_num)

        logs = DayLog.objects.filter(
            user=user, log_date__range=[first_day, last_day]
        ).values("log_date", "completion_rate", "tasks_completed", "is_streak_day")

        log_map = {l["log_date"]: l for l in logs}

        weeks = []
        current_week = []

        # Pad start of first week with None
        first_weekday = first_day.weekday()  # 0=Mon
        for _ in range(first_weekday):
            current_week.append(None)

        for day_num in range(1, last_day_num + 1):
            day = date(year, month, day_num)
            log = log_map.get(day)
            current_week.append({
                "date": day.isoformat(),
                "day": day_num,
                "completion_rate": float(log["completion_rate"]) if log else 0.0,
                "tasks_completed": log["tasks_completed"] if log else 0,
                "is_streak_day": log["is_streak_day"] if log else False,
                "level": CalendarEngine._rate_to_level(float(log["completion_rate"]) if log else 0),
            })

            if len(current_week) == 7:
                weeks.append(current_week)
                current_week = []

        if current_week:
            # Pad end
            while len(current_week) < 7:
                current_week.append(None)
            weeks.append(current_week)

        return {
            "year": year,
            "month": month,
            "month_name": calendar.month_name[month],
            "weeks": weeks,
        }
