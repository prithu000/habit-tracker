"""
FORGE — Completions App Models
Completion events and aggregated DayLog.
"""
from django.db import models
from django.contrib.auth import get_user_model
from apps.core.models import BaseModel
from apps.routines.models import Task

User = get_user_model()


class Completion(BaseModel):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="completions")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="completions")
    completed_at = models.DateTimeField(auto_now_add=True)
    local_date = models.DateField()  # User-timezone-aware date
    note = models.TextField(blank=True)
    mood = models.PositiveSmallIntegerField(null=True, blank=True)  # 1–5
    duration_actual = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        db_table = "completions_completion"
        unique_together = [("task", "user", "local_date")]  # One completion per task per day
        indexes = [
            models.Index(fields=["user", "local_date"]),
        ]

    def __str__(self):
        return f"{self.user.email} ✓ {self.task.name} on {self.local_date}"


class DayLog(BaseModel):
    """Materialized daily aggregate — written by Celery rollup task."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="day_logs")
    log_date = models.DateField()
    tasks_scheduled = models.PositiveIntegerField(default=0)
    tasks_completed = models.PositiveIntegerField(default=0)
    completion_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    xp_earned = models.PositiveIntegerField(default=0)
    routines_completed = models.PositiveIntegerField(default=0)
    is_streak_day = models.BooleanField(default=False)

    class Meta:
        db_table = "completions_daylog"
        unique_together = [("user", "log_date")]
        indexes = [
            models.Index(fields=["user", "-log_date"]),
        ]

    def __str__(self):
        return f"{self.user.email} — {self.log_date} ({self.completion_rate}%)"
