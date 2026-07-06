"""
FORGE — Monthly Replay Engine
Generates the "Spotify Wrapped"-style end-of-month summary.
"""
from datetime import date
from typing import Dict, List, Optional
from apps.core.utils import get_month_bounds, safe_percentage
import calendar
import logging

logger = logging.getLogger(__name__)


class MonthlyReplayEngine:
    """
    Generates a structured "Monthly Replay" — a narrative data object
    consumed by the frontend to render animated story slides.
    """

    @staticmethod
    def generate(user, year: int, month: int) -> Dict:
        """
        Generates the complete monthly replay for a given year/month.
        """
        from apps.completions.models import DayLog, Completion
        from apps.rewards.models import XPTransaction, UserBadge
        from apps.routines.models import Routine, Task
        from apps.streaks.models import StreakRecord
        from django.db.models import Avg, Sum, Max, Count, Q

        first_day, last_day = get_month_bounds(date(year, month, 1))
        month_name = calendar.month_name[month]

        # ── Core stats ──
        logs = DayLog.objects.filter(user=user, log_date__range=[first_day, last_day])
        total_completions = Completion.objects.filter(
            user=user, local_date__range=[first_day, last_day]
        ).count()
        active_days = logs.filter(tasks_completed__gt=0).count()
        perfect_days = logs.filter(completion_rate=100).count()
        avg_rate = float(logs.aggregate(a=Avg("completion_rate"))["a"] or 0)
        total_xp = logs.aggregate(x=Sum("xp_earned"))["x"] or 0

        # ── Streak during month ──
        # Find the max streak within the month from DayLog dates
        streak_record = StreakRecord.objects.filter(
            user=user, routine__isnull=True
        ).first()
        current_streak = streak_record.current_streak if streak_record else 0
        longest_streak = streak_record.longest_streak if streak_record else 0

        # ── Best and worst day ──
        best_log = logs.order_by("-completion_rate", "-tasks_completed").first()
        worst_log = logs.filter(tasks_completed__gt=0).order_by("completion_rate").first()

        # ── Best day of week ──
        from django.db.models import F
        day_stats = {}
        for log in logs.filter(tasks_completed__gt=0):
            weekday = log.log_date.weekday()
            if weekday not in day_stats:
                day_stats[weekday] = []
            day_stats[weekday].append(float(log.completion_rate))
        best_weekday = None
        best_weekday_avg = 0
        for wd, rates in day_stats.items():
            avg = sum(rates) / len(rates)
            if avg > best_weekday_avg:
                best_weekday_avg = avg
                best_weekday = wd

        # ── Best routine ──
        best_routine = None
        best_routine_rate = 0
        for routine in Routine.objects.filter(user=user, is_active=True):
            tasks = Task.objects.filter(routine=routine, is_active=True)
            if not tasks.exists():
                continue
            done = Completion.objects.filter(
                user=user,
                task__in=tasks,
                local_date__range=[first_day, last_day],
            ).count()
            possible = tasks.count() * (last_day - first_day).days + tasks.count()
            rate = safe_percentage(done, possible)
            if rate > best_routine_rate:
                best_routine_rate = rate
                best_routine = routine

        # ── Badges earned this month ──
        badges_this_month = UserBadge.objects.filter(
            user=user,
            created_at__date__range=[first_day, last_day],
        ).select_related("badge")

        # ── XP transactions ──
        xp_breakdown = (
            XPTransaction.objects.filter(
                user=user, created_at__date__range=[first_day, last_day], amount__gt=0
            )
            .values("reason")
            .annotate(total=Sum("amount"), count=Count("id"))
            .order_by("-total")
        )

        # ── Narrative copy ──
        narrative = MonthlyReplayEngine._generate_narrative(
            month_name=month_name,
            total_completions=total_completions,
            avg_rate=avg_rate,
            perfect_days=perfect_days,
            active_days=active_days,
            current_streak=current_streak,
            user=user,
        )

        weekday_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

        return {
            "year": year,
            "month": month,
            "month_name": month_name,
            "generated_at": date.today().isoformat(),
            "headline": {
                "total_completions": total_completions,
                "active_days": active_days,
                "total_days_in_month": (last_day - first_day).days + 1,
                "avg_completion_rate": round(avg_rate, 1),
                "perfect_days": perfect_days,
                "total_xp": total_xp,
                "current_streak": current_streak,
                "longest_streak_ever": longest_streak,
            },
            "highlights": {
                "best_day": {
                    "date": best_log.log_date.isoformat() if best_log else None,
                    "completion_rate": float(best_log.completion_rate) if best_log else 0,
                    "tasks_completed": best_log.tasks_completed if best_log else 0,
                },
                "worst_day": {
                    "date": worst_log.log_date.isoformat() if worst_log else None,
                    "completion_rate": float(worst_log.completion_rate) if worst_log else 0,
                } if worst_log else None,
                "best_day_of_week": weekday_names[best_weekday] if best_weekday is not None else None,
                "best_day_of_week_avg": round(best_weekday_avg, 1),
                "best_routine": {
                    "name": best_routine.name,
                    "icon": best_routine.icon,
                    "consistency_rate": round(best_routine_rate, 1),
                } if best_routine else None,
            },
            "badges_earned": [
                {
                    "slug": ub.badge.slug,
                    "name": ub.badge.name,
                    "icon": ub.badge.icon,
                    "rarity": ub.badge.rarity,
                    "earned_at": ub.created_at.isoformat(),
                }
                for ub in badges_this_month
            ],
            "xp_breakdown": list(xp_breakdown),
            "narrative": narrative,
            "identity_statement": user.identity_statement,
            "shareable": MonthlyReplayEngine._build_share_card(
                user=user,
                month_name=month_name,
                year=year,
                total_completions=total_completions,
                avg_rate=avg_rate,
            ),
        }

    @staticmethod
    def _generate_narrative(
        month_name, total_completions, avg_rate,
        perfect_days, active_days, current_streak, user
    ) -> List[Dict]:
        """
        Returns a list of story slides with copy.
        """
        slides = [
            {
                "slide": 1,
                "type": "title",
                "title": f"Your {month_name}",
                "subtitle": "YOU VS YOU Report",
            },
            {
                "slide": 2,
                "type": "stat",
                "headline": f"{total_completions:,}",
                "label": "tasks completed this month",
                "subtext": "Every one of them a kept promise.",
            },
            {
                "slide": 3,
                "type": "stat",
                "headline": f"{round(avg_rate, 0):.0f}%",
                "label": "average daily completion rate",
                "subtext": MonthlyReplayEngine._rate_copy(avg_rate),
            },
        ]

        if perfect_days > 0:
            slides.append({
                "slide": 4,
                "type": "highlight",
                "headline": f"{perfect_days}",
                "label": f"perfect day{'s' if perfect_days > 1 else ''}",
                "subtext": "Days you kept every single promise.",
            })

        if current_streak >= 7:
            slides.append({
                "slide": 5,
                "type": "streak",
                "headline": f"🔥 {current_streak} days",
                "label": "current streak",
                "subtext": "You are unstoppable.",
            })

        if user.identity_statement:
            slides.append({
                "slide": len(slides) + 1,
                "type": "identity",
                "headline": f'"{user.identity_statement}"',
                "label": "This month, you lived this.",
                "subtext": None,
            })

        return slides

    @staticmethod
    def _rate_copy(rate: float) -> str:
        if rate >= 90:
            return "Elite consistency. You are in a flow state."
        if rate >= 70:
            return "Solid month. You showed up when it mattered."
        if rate >= 50:
            return "You're building the habit. Keep going."
        return "Every month is a chance to reset. Next month is yours."

    @staticmethod
    def _build_share_card(user, month_name, year, total_completions, avg_rate) -> Dict:
        return {
            "title": f"YOU VS YOU — {month_name} {year}",
            "name": user.display_name or "A Contender",
            "stat1": f"{total_completions} tasks completed",
            "stat2": f"{round(avg_rate)}% completion rate",
            "identity": user.identity_statement or "",
            "tagline": "Be the exception.",
        }
