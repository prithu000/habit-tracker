"""
FORGE — Celery Application
"""
import os
from celery import Celery

# Respect whatever DJANGO_SETTINGS_MODULE is set in the environment.
# Default to production to be safe — devs should set it to development explicitly.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.production")

app = Celery("forge")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks(["workers.tasks"])

from celery.schedules import crontab

app.conf.beat_schedule = {
    "daily-auto-reset-midnight": {
        "task": "workers.tasks.os_tasks.daily_auto_reset_task",
        "schedule": crontab(hour=0, minute=0),  # 12:00 AM every day
    },
    "check-scheduled-reminders-hourly": {
        "task": "workers.tasks.os_tasks.send_scheduled_reminders_task",
        "schedule": crontab(minute=0),  # Every hour
    },
    "refresh-leaderboards-every-3-mins": {
        "task": "workers.tasks.cache_management.refresh_leaderboard_cache",
        "schedule": crontab(minute="*/3"),
    },
    # ==================== EMAIL TASKS ====================
    "daily-morning-hourly": {
        "task": "apps.emails.scheduler.schedule_morning_motivation",
        "schedule": crontab(minute=0),  # Every hour to hit different timezones
    },
    "daily-night-hourly": {
        "task": "apps.emails.scheduler.schedule_evening_reflection",
        "schedule": crontab(minute=0),
    },
    "inactive-recovery-midnight-utc": {
        "task": "apps.emails.scheduler.schedule_inactive_reminders",
        "schedule": crontab(hour=0, minute=0),  # Midnight UTC
    },
    # Note: Weekly/Monthly reports or other non-existent tasks are removed 
    # unless they are explicitly implemented elsewhere. We removed trial/reports 
    # tasks that were pointing to the deleted email_tasks.py.
}
