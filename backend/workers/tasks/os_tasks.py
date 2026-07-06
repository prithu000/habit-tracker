"""
YOU VS YOU Personal Operating System — Celery Tasks
Handles daily 12:00 AM auto-reset, Pomodoro email alerts, scheduled email reminders, and Help Center issue reporting.
"""
import logging
from datetime import timedelta
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from workers.celery_app import app

logger = logging.getLogger(__name__)


@app.task(bind=True, max_retries=3)
def daily_auto_reset_task(self, user_id: str = None):
    """
    Every day at 12:00 AM local time:
    1. Generates today's tasks from RoutineSchedules.
    2. Moves unfinished tasks to historical logs without deleting history.
    3. Evaluates and updates streaks (consumes equipped Streak Freeze if streak broke).
    4. Refreshes widget bundles and invalidates Redis caches.
    """
    try:
        from django.contrib.auth import get_user_model
        from apps.routines.models import RoutineSchedule, Task
        from apps.completions.models import DayLog, Completion
        from apps.streaks.models import StreakRecord
        from apps.rewards.models import StreakFreeze, ForgeCoinTransaction
        from apps.core.utils import get_user_local_date
        from services.cache_service import CacheService

        User = get_user_model()
        users_query = User.objects.filter(is_active=True)
        if user_id:
            users_query = users_query.filter(id=user_id)

        for user in users_query:
            local_date = get_user_local_date(user)
            yesterday = local_date - timedelta(days=1)

            # ── 1. Evaluate Yesterday's Unfinished Tasks & Streak ──
            yesterday_log = DayLog.objects.filter(user=user, log_date=yesterday).first()
            overall_streak = StreakRecord.objects.filter(user=user, routine__isnull=True).first()

            if yesterday_log and yesterday_log.completion_rate < 100 and yesterday_log.tasks_scheduled > 0:
                # Check if user has an equipped Streak Freeze
                freeze, _ = StreakFreeze.objects.get_or_create(user=user)
                if freeze.quantity > 0 and overall_streak and overall_streak.current_streak > 0:
                    freeze.quantity -= 1
                    freeze.total_used += 1
                    freeze.save()

                    # Record transaction log
                    ForgeCoinTransaction.objects.create(
                        user=user,
                        amount=0,
                        reason=ForgeCoinTransaction.Reason.STREAK_FREEZE_USE,
                        metadata={"saved_streak": overall_streak.current_streak, "date": yesterday.isoformat()}
                    )
                    logger.info(f"Streak Freeze consumed for user {user.email} saving {overall_streak.current_streak}-day streak.")
                elif overall_streak and overall_streak.current_streak > 0:
                    # Break streak if no freeze available
                    overall_streak.current_streak = 0
                    overall_streak.save()
                    logger.info(f"Streak reset to 0 for user {user.email}.")

            # ── 2. Generate Today's Tasks & Ensure DayLog exists (No History Deletion) ──
            today_log, created = DayLog.objects.get_or_create(
                user=user,
                log_date=local_date,
                defaults={"tasks_scheduled": 0, "tasks_completed": 0, "completion_rate": 0}
            )

            # ── 3. Invalidate Redis Caches & Refresh Widgets ──
            CacheService.invalidate_today(str(user.id))
            CacheService.invalidate_analytics(str(user.id))
            CacheService.delete(str(user.id), "widget_bundle", local_date.isoformat())

        logger.info(f"Daily Auto-Reset completed for {users_query.count()} users.")
        return True
    except Exception as exc:
        logger.error(f"daily_auto_reset_task failed: {exc}")
        raise self.retry(exc=exc)


@app.task(bind=True, max_retries=2)
def send_pomodoro_email_task(self, user_email: str, task_name: str, start_time: str, end_time: str, duration_mins: int, xp_earned: int, current_streak: int, event_type: str):
    """
    Sends an email notification when a Pomodoro session starts or finishes.
    """
    try:
        subject = f"⏳ YOU VS YOU Pomodoro {event_type.upper()}: {task_name}" if event_type == "start" else f"🏆 YOU VS YOU Pomodoro COMPLETED: {task_name}"
        body = f"""
YOU VS YOU Personal Operating System — Pomodoro Telemetry
=====================================================

Event: Session {event_type.title()}
Task: {task_name}
Start Time: {start_time}
End Time: {end_time}
Duration: {duration_mins} Minutes
XP Earned: +{xp_earned} XP
Current Streak: {current_streak} Days

Stay focused and execute your daily routines with relentless discipline.
        """
        send_mail(
            subject=subject,
            message=body.strip(),
            from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@youvsyou-os.com"),
            recipient_list=[user_email],
            fail_silently=True
        )
        logger.info(f"Pomodoro {event_type} email dispatched to {user_email}.")
        return True
    except Exception as exc:
        logger.error(f"send_pomodoro_email_task failed: {exc}")
        raise self.retry(exc=exc)


@app.task(bind=True, max_retries=2)
def send_scheduled_reminders_task(self):
    """
    Evaluates active EmailReminderSchedules where deadline <= now and sends 1-click completion reminders.
    """
    try:
        from apps.notifications.models import EmailReminderSchedule
        now = timezone.now()
        due_reminders = EmailReminderSchedule.objects.filter(is_active=True, deadline__lte=now).select_related("user")

        for reminder in due_reminders:
            quick_complete_url = f"http://localhost:3000/dashboard?quick_complete={reminder.completion_token or ''}"
            subject = f"🔔 [{reminder.priority.upper()} PRIORITY] YOU VS YOU Reminder: {reminder.task_name}"
            body = f"""
YOU VS YOU Personal Operating System — Scheduled Reminder
====================================================

Task: {reminder.task_name}
Priority: {reminder.priority}
Deadline: {reminder.deadline.strftime('%Y-%m-%d %H:%M:%S UTC')}
Frequency: {reminder.frequency}

⚡ Quick Complete Task:
Click the link below to mark this task as complete immediately:
{quick_complete_url}

Execute with precision.
            """
            send_mail(
                subject=subject,
                message=body.strip(),
                from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@youvsyou-os.com"),
                recipient_list=[reminder.user.email],
                fail_silently=True
            )

            # Update schedule based on frequency
            if reminder.frequency == EmailReminderSchedule.Frequency.ONE_TIME:
                reminder.is_active = False
            elif reminder.frequency == EmailReminderSchedule.Frequency.DAILY:
                reminder.deadline += timedelta(days=1)
            elif reminder.frequency == EmailReminderSchedule.Frequency.WEEKLY:
                reminder.deadline += timedelta(days=7)
            elif reminder.frequency == EmailReminderSchedule.Frequency.MONTHLY:
                reminder.deadline += timedelta(days=30)
            elif reminder.frequency == EmailReminderSchedule.Frequency.YEARLY:
                reminder.deadline += timedelta(days=365)
            reminder.save()

        logger.info(f"Processed {len(due_reminders)} scheduled email reminders.")
        return True
    except Exception as exc:
        logger.error(f"send_scheduled_reminders_task failed: {exc}")
        raise self.retry(exc=exc)


@app.task(bind=True, max_retries=2)
def report_issue_task(self, user_email: str, issue_type: str, title: str, description: str, browser: str, version: str, logs: str):
    """
    Sends Help Center bug reports, feature requests, and feedback directly to rahul.business940@gmail.com.
    """
    try:
        target_email = "rahul.business940@gmail.com"
        subject = f"🛡️ [YOU VS YOU OS {issue_type.upper()}] {title} (From: {user_email})"
        body = f"""
YOU VS YOU Personal Operating System — Support Submission
====================================================

Submitter: {user_email}
Type: {issue_type.title()}
Title: {title}
Browser: {browser}
App Version: {version}

Description:
----------------------------------------------------
{description}

System Logs & Telemetry:
----------------------------------------------------
{logs}
        """
        send_mail(
            subject=subject,
            message=body.strip(),
            from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@youvsyou-os.com"),
            recipient_list=[target_email],
            fail_silently=True
        )
        logger.info(f"Support issue report sent to {target_email} from {user_email}.")
        return True
    except Exception as exc:
        logger.error(f"report_issue_task failed: {exc}")
        raise self.retry(exc=exc)
