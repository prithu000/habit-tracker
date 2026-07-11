"""
FORGE — Celery Application
"""
import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")

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
    "daily-motivation-6am": {
        "task": "workers.tasks.email_tasks.send_daily_motivation_emails",
        "schedule": crontab(hour=6, minute=0),  # 6:00 AM daily
    },
    "trial-reminders-9am": {
        "task": "workers.tasks.email_tasks.send_trial_reminders",
        "schedule": crontab(hour=9, minute=0),  # 9:00 AM daily
    },
    "trial-expired-10am": {
        "task": "workers.tasks.email_tasks.send_trial_expired_emails",
        "schedule": crontab(hour=10, minute=0),  # 10:00 AM daily
    },
    "weekly-summary-monday-8am": {
        "task": "workers.tasks.email_tasks.send_weekly_summaries",
        "schedule": crontab(day_of_week=1, hour=8, minute=0),  # Monday 8:00 AM
    },
    "monthly-report-1st-9am": {
        "task": "workers.tasks.email_tasks.send_monthly_reports",
        "schedule": crontab(day_of_month=1, hour=9, minute=0),  # 1st day of month, 9:00 AM
    },
}
