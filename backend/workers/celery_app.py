"""
FORGE — Celery Application
"""

import os

from celery import Celery
from celery.schedules import crontab
from django.conf import settings

# Default to production unless explicitly overridden.
os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "config.settings.production",
)

app = Celery("forge")

# Load all CELERY_* settings from Django settings.
app.config_from_object(
    "django.conf:settings",
    namespace="CELERY",
)

# IMPORTANT:
# Discover tasks.py from every installed Django app.
# This will register:
# - apps.emails.tasks
# - apps.notifications.tasks
# - apps.users.tasks
# - any future app containing tasks.py
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)

app.conf.beat_schedule = {
    "daily-auto-reset-midnight": {
        "task": "workers.tasks.os_tasks.daily_auto_reset_task",
        "schedule": crontab(hour=0, minute=0),
    },

    "check-scheduled-reminders-hourly": {
        "task": "workers.tasks.os_tasks.send_scheduled_reminders_task",
        "schedule": crontab(minute=0),
    },

    "refresh-leaderboards-every-3-mins": {
        "task": "workers.tasks.cache_management.refresh_leaderboard_cache",
        "schedule": crontab(minute="*/3"),
    },

    # ================= EMAIL SCHEDULER =================

    "daily-morning-hourly": {
        "task": "apps.emails.scheduler.schedule_morning_motivation",
        "schedule": crontab(minute=0),
    },

    "daily-night-hourly": {
        "task": "apps.emails.scheduler.schedule_evening_reflection",
        "schedule": crontab(minute=0),
    },

    "inactive-recovery-midnight-utc": {
        "task": "apps.emails.scheduler.schedule_inactive_reminders",
        "schedule": crontab(hour=0, minute=0),
    },
}