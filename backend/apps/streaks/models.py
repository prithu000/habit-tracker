"""
FORGE — Streaks App Models
"""
from django.db import models
from django.contrib.auth import get_user_model
from apps.core.models import BaseModel

User = get_user_model()


class StreakRecord(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="streaks")
    routine = models.ForeignKey(
        "routines.Routine", on_delete=models.CASCADE,
        null=True, blank=True, related_name="streak_records"
    )  # null = overall streak
    current_streak = models.PositiveIntegerField(default=0)
    longest_streak = models.PositiveIntegerField(default=0)
    last_completed_date = models.DateField(null=True, blank=True)
    grace_period_used = models.BooleanField(default=False)

    class Meta:
        db_table = "streaks_streakrecord"
        unique_together = [("user", "routine")]
        indexes = [
            models.Index(fields=["user", "routine"]),
        ]

    def __str__(self):
        label = self.routine.name if self.routine else "Overall"
        return f"{self.user.email} — {label}: {self.current_streak} days"
