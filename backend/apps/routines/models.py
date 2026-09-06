"""
YOU VS YOU — Flat Task Models
Task model with category, frequency, and direct user ownership.
"""
from django.db import models
from django.contrib.auth import get_user_model
from apps.core.models import BaseModel
from apps.core.validators import (
    validate_task_name,
    validate_duration_minutes,
    validate_sort_order,
)

User = get_user_model()


class Task(BaseModel):
    class Category(models.TextChoices):
        FITNESS       = "fitness",       "Fitness"
        LEARNING      = "learning",      "Learning"
        WORK          = "work",          "Work"
        MENTAL_HEALTH = "mental_health", "Mental Health"
        HEALTH        = "health",        "Health"
        SLEEP         = "sleep",         "Sleep"
        FINANCE       = "finance",       "Finance"
        PERSONAL      = "personal",      "Personal"
        DISCIPLINE    = "discipline",    "Discipline"

    class Frequency(models.TextChoices):
        DAILY   = "daily",   "Daily"
        WEEKLY  = "weekly",  "Weekly"
        ANYTIME = "anytime", "Anytime"

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="tasks"
    )
    name = models.CharField(
        max_length=200, validators=[validate_task_name]
    )
    description = models.TextField(blank=True, default="")
    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        default=Category.PERSONAL,
    )
    frequency = models.CharField(
        max_length=10,
        choices=Frequency.choices,
        default=Frequency.DAILY,
    )
    due_date = models.DateField(null=True, blank=True)
    duration_minutes = models.PositiveIntegerField(
        null=True, blank=True, validators=[validate_duration_minutes]
    )
    sort_order = models.PositiveIntegerField(
        default=0, validators=[validate_sort_order]
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "routines_task"
        ordering = ["sort_order", "created_at"]
        indexes = [
            models.Index(fields=["user", "category", "is_active"], name="routines_task_user_cat_idx"),
            models.Index(fields=["user", "frequency", "is_active"], name="routines_task_user_freq_idx"),
        ]

    def __str__(self):
        return f"{self.name} [{self.user.email}]"
