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
        from apps.rewards.models import StreakFreeze
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
def send_pomodoro_email_task(self, user_email: str, task_name: str, start_time: str, end_time: str, duration_mins: int, xp_earned: int, current_streak: int, event_type: str, session_type: str = "pomodoro"):
    """
    Sends an executive email notification when focus sessions or breaks start, finish, or complete.
    Supports 7 distinct templates: Pomodoro Start/Complete, Short Break Start/Complete, Long Break Start/Complete, Focus Session Finished.
    """
    try:
        st = session_type.lower()
        et = event_type.lower()

        if et == "finished" or st == "finished":
            subject = f"🎯 [FOCUS PROTOCOL FINISHED] Total Session Mastery Logged: {task_name}"
            protocol_title = "Focus Protocol Completely Executed"
            quote = "Deep work is the superpower of the 21st century. Your cognitive stamina separates you from the crowd."
        elif "short" in st or "shortbreak" in st:
            if et == "start":
                subject = f"☕ [SHORT BREAK INITIATED] Cognitive Rest Protocol (5 Mins)"
                protocol_title = "Short Break Initiated — Cognitive Recovery"
                quote = "Step away from the screen. Hydrate, breathe, and let your neural circuits synthesize the data."
            else:
                subject = f"⚡ [BREAK COMPLETED] Return to Battle! Focus Session Resuming"
                protocol_title = "Short Break Completed — Re-Engage Protocol"
                quote = "The rest period has concluded. Re-enter the flow state immediately without hesitation."
        elif "long" in st or "longbreak" in st:
            if et == "start":
                subject = f"🧘 [LONG BREAK INITIATED] Deep Neural Restoration (15 Mins)"
                protocol_title = "Long Break Initiated — Deep Restoration"
                quote = "High-performance systems require structured cool-downs. Stretch, walk outside, and restore your energy reserves."
            else:
                subject = f"🔥 [REST COMPLETE] Re-Engage Protocol! You Vs You"
                protocol_title = "Long Break Completed — Mission Resuming"
                quote = "Your energy is restored. Lock back into the objective with relentless focus and precision."
        else:
            # Standard Pomodoro session
            if et == "start":
                subject = f"⏳ [POMODORO INITIATED] Focus Sprint: {task_name}"
                protocol_title = f"25-Minute Deep Focus Sprint Initiated"
                quote = "Eliminate all distractions. Single-tasking at high intensity is the path to elite execution."
            else:
                subject = f"🏆 [POMODORO COMPLETED] Victory Logged: +{xp_earned} XP Generated!"
                protocol_title = f"Pomodoro Sprint Successfully Executed"
                quote = "Another block of deep work conquered. Consistency over time builds unbeatable momentum."

        body = f"""
YOU VS YOU Personal Operating System — Focus Telemetry
=====================================================

{protocol_title.upper()}
-----------------------------------------------------
Target Objective : {task_name}
Protocol Mode    : {session_type.upper()} ({duration_mins} Minutes)
Start Timestamp  : {start_time}
End Timestamp    : {end_time}
XP Generated     : +{xp_earned} XP
Active Streak    : {current_streak} Days

=====================================================
AI EXECUTIVE COACHING:
"{quote}"
=====================================================

-----------------------------------------------------
YOU VS YOU
The Personal Operating System
Engineer Your Best Self.
Every action compounds.
        """
        send_mail(
            subject=subject,
            message=body.strip(),
            from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@youvsyou-os.com"),
            recipient_list=[user_email],
            fail_silently=True
        )
        logger.info(f"Focus telemetry email ({session_type}/{event_type}) dispatched to {user_email}.")
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

-----------------------------------------------------
YOU VS YOU
The Personal Operating System
Engineer Your Best Self.
Every action compounds.
            """
            try:
                send_mail(
                    subject=subject,
                    message=body.strip(),
                    from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@youvsyou-os.com"),
                    recipient_list=[reminder.user.email],
                    fail_silently=False
                )
                
                logger.info(
                    f"Email Sent Successfully | Planner ID: {reminder.id} | Execution Time: {now.isoformat()} | "
                    f"Recipient: {reminder.user.email} | Subject: {subject} | Status: success"
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

            except Exception as e:
                logger.error(
                    f"Email Failed | Planner ID: {reminder.id} | Execution Time: {now.isoformat()} | "
                    f"Recipient: {reminder.user.email} | Subject: {subject} | Status: failed | Failure reason: {str(e)}"
                )

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

-----------------------------------------------------
YOU VS YOU
The Personal Operating System
Engineer Your Best Self.
Every action compounds.
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
