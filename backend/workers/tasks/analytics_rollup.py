"""
FORGE — Analytics Rollup Celery Tasks
Runs daily to write DayLog and weekly to generate WeeklyInsights.
"""
from celery import shared_task
from datetime import date, timedelta
import logging

logger = logging.getLogger(__name__)


@shared_task(name="workers.tasks.analytics_rollup.run_daily_rollup")
def run_daily_rollup():
    """
    Runs at 00:05 UTC daily.
    Materializes yesterday's completions into DayLog for every user.
    """
    from django.contrib.auth import get_user_model
    from apps.routines.models import Routine, Task
    from apps.completions.models import Completion, DayLog
    from apps.rewards.models import XPTransaction
    from django.db.models import Count, Sum

    User = get_user_model()
    yesterday = date.today() - timedelta(days=1)

    users = User.objects.filter(is_active=True)
    for user in users:
        try:
            # Get all active tasks for scheduled routines
            routines = Routine.objects.filter(user=user, is_active=True)
            total_tasks = Task.objects.filter(routine__in=routines, is_active=True).count()

            completions = Completion.objects.filter(user=user, local_date=yesterday)
            completed_count = completions.count()

            xp = XPTransaction.objects.filter(
                user=user, created_at__date=yesterday
            ).aggregate(total=Sum("amount"))["total"] or 0

            # Count routines where all tasks were completed
            routines_done = 0
            for routine in routines:
                routine_tasks = list(Task.objects.filter(routine=routine, is_active=True).values_list("id", flat=True))
                if not routine_tasks:
                    continue
                done = completions.filter(task_id__in=routine_tasks).count()
                if done == len(routine_tasks):
                    routines_done += 1

            rate = round((completed_count / total_tasks * 100) if total_tasks else 0, 2)

            DayLog.objects.update_or_create(
                user=user,
                log_date=yesterday,
                defaults={
                    "tasks_scheduled": total_tasks,
                    "tasks_completed": completed_count,
                    "completion_rate": rate,
                    "xp_earned": xp,
                    "routines_completed": routines_done,
                },
            )
        except Exception as e:
            logger.error(f"DayLog rollup failed for user {user.id}: {e}")

    logger.info(f"Daily rollup complete for {users.count()} users.")


@shared_task(name="workers.tasks.analytics_rollup.generate_weekly_insights")
def generate_weekly_insights():
    """
    Runs on Sunday night.
    Generates WeeklyInsight records with trend analysis.
    """
    from django.contrib.auth import get_user_model
    from apps.completions.models import DayLog
    from apps.analytics.models import WeeklyInsight
    from apps.routines.models import Routine
    from django.db.models import Avg

    User = get_user_model()
    today = date.today()
    week_start = today - timedelta(days=7)

    INSIGHT_RULES = [
        (lambda avg: avg >= 90, "You're in a flow state. 90%+ consistency — this is what discipline looks like."),
        (lambda avg: avg >= 70, "Solid week. You showed up when it mattered."),
        (lambda avg: avg >= 50, "You're building the habit. Keep the momentum."),
        (lambda avg: avg < 50, "Rough week — and that's okay. Every day is a reset."),
    ]

    for user in User.objects.filter(is_active=True):
        try:
            logs = DayLog.objects.filter(user=user, log_date__range=[week_start, today])
            if not logs.exists():
                continue

            avg_rate = float(logs.aggregate(a=Avg("completion_rate"))["a"] or 0)
            total_xp = logs.aggregate(x=Avg("xp_earned"))["x"] or 0

            # Previous week comparison
            prev_week_start = week_start - timedelta(days=7)
            prev_logs = DayLog.objects.filter(user=user, log_date__range=[prev_week_start, week_start])
            prev_avg = float(prev_logs.aggregate(a=Avg("completion_rate"))["a"] or 0)

            if avg_rate > prev_avg + 5:
                trend = "improving"
            elif avg_rate < prev_avg - 5:
                trend = "declining"
            else:
                trend = "stable"

            # Best routine
            best_routine = None
            best_rate = 0
            for routine in Routine.objects.filter(user=user, is_active=True):
                from apps.completions.models import Completion
                from apps.routines.models import Task
                tasks = Task.objects.filter(routine=routine, is_active=True)
                if not tasks.exists():
                    continue
                done = Completion.objects.filter(
                    user=user, task__in=tasks, local_date__range=[week_start, today]
                ).count()
                possible = tasks.count() * 7
                rate = (done / possible * 100) if possible else 0
                if rate > best_rate:
                    best_rate = rate
                    best_routine = routine

            # Select insight text
            highlight = INSIGHT_RULES[-1][1]
            for condition, text in INSIGHT_RULES:
                if condition(avg_rate):
                    highlight = text
                    break

            WeeklyInsight.objects.update_or_create(
                user=user,
                week_start=week_start,
                defaults={
                    "best_routine": best_routine,
                    "completion_trend": trend,
                    "highlight_text": highlight,
                    "avg_completion_rate": avg_rate,
                    "total_xp_earned": int(total_xp),
                },
            )
        except Exception as e:
            logger.error(f"Weekly insight failed for user {user.id}: {e}")
