"""
FORGE — Streaks App Models
"""
from django.db import models
from django.contrib.auth import get_user_model
from apps.core.models import BaseModel

User = get_user_model()


class StreakRecord(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="streaks")
    current_streak = models.PositiveIntegerField(default=0)
    longest_streak = models.PositiveIntegerField(default=0)
    last_completed_date = models.DateField(null=True, blank=True)
    grace_period_used = models.BooleanField(default=False)

    class Meta:
        db_table = "streaks_streakrecord"
        unique_together = [("user",)]
        indexes = [
            models.Index(fields=["user"], name="streaks_str_user_id_idx"),
        ]

    def __str__(self):
        return f"{self.user.email} — Overall: {self.current_streak} days"
