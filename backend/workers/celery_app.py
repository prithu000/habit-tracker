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
}
