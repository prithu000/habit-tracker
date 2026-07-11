"""
FORGE — Routines App Models (Production)
Enhanced with validators and computed properties.
"""
from django.db import models
from django.contrib.auth import get_user_model
from apps.core.models import BaseModel
from apps.core.validators import (
    validate_hex_color, validate_emoji,
    validate_routine_name, validate_task_name,
    validate_duration_minutes, validate_sort_order,
    validate_days_of_week,
)

User = get_user_model()


class Routine(BaseModel):
    class TimeOfDay(models.TextChoices):
        MORNING   = "morning",   "Morning"
        AFTERNOON = "afternoon", "Afternoon"
        EVENING   = "evening",   "Evening"
        ANYTIME   = "anytime",   "Anytime"

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="routines"
    )
    name = models.CharField(
        max_length=100, validators=[validate_routine_name]
    )
    description = models.TextField(blank=True, default="")
    icon = models.CharField(
        max_length=10, default="⚡", validators=[validate_emoji]
    )
    color = models.CharField(
        max_length=7, default="#6C5EF8", validators=[validate_hex_color]
    )
    time_of_day = models.CharField(
        max_length=20,
        choices=TimeOfDay.choices,
        default=TimeOfDay.ANYTIME,
    )
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(
        default=0, validators=[validate_sort_order]
    )
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "routines_routine"
        ordering = ["sort_order", "created_at"]
        indexes = [
            models.Index(fields=["user", "is_active"]),
            models.Index(fields=["user", "time_of_day"]),
        ]

    def __str__(self):
        return f"{self.icon} {self.name} ({self.user.email})"

    @property
    def active_task_count(self) -> int:
        if hasattr(self, 'annotated_task_count'):
            return self.annotated_task_count
        return self.tasks.filter(is_active=True).count()

    @property
    def estimated_total_minutes(self) -> int:
        if hasattr(self, 'annotated_total_minutes'):
            return self.annotated_total_minutes
        from django.db.models import Sum
        result = self.tasks.filter(
            is_active=True, duration_minutes__isnull=False
        ).aggregate(total=Sum("duration_minutes"))["total"]
        return result or 0

    def is_scheduled_for(self, target_date) -> bool:
        """Returns True if this routine should appear on target_date."""
        schedule = getattr(self, "schedule", None)
        if not schedule:
            return True  # Default to daily if no schedule
        return schedule.is_scheduled_for(target_date)


class Task(BaseModel):
    routine = models.ForeignKey(
        Routine, on_delete=models.CASCADE, related_name="tasks"
    )
    name = models.CharField(
        max_length=200, validators=[validate_task_name]
    )
    description = models.TextField(blank=True, default="")
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
            models.Index(fields=["routine", "is_active"]),
        ]

    def __str__(self):
        return f"{self.name} [{self.routine.name}]"


class RoutineSchedule(BaseModel):
    class RecurrenceType(models.TextChoices):
        DAILY  = "daily",  "Every Day"
        WEEKLY = "weekly", "Specific Days"
        CUSTOM = "custom", "Custom Dates"

    routine = models.OneToOneField(
        Routine, on_delete=models.CASCADE, related_name="schedule"
    )
    recurrence_type = models.CharField(
        max_length=20,
        choices=RecurrenceType.choices,
        default=RecurrenceType.DAILY,
    )
    # [0..6] — 0=Monday, 6=Sunday
    days_of_week = models.JSONField(
        default=list, blank=True, validators=[validate_days_of_week]
    )
    start_date = models.DateField(auto_now_add=True)
    end_date = models.DateField(null=True, blank=True)

    class Meta:
        db_table = "routines_schedule"

    def __str__(self):
        return f"Schedule for {self.routine.name} [{self.recurrence_type}]"

    def is_scheduled_for(self, target_date) -> bool:
        """Return True if this routine is scheduled for target_date."""
        if self.end_date and target_date > self.end_date:
            return False
        # Prevent UTC timezone mismatch when created late at night in behind-UTC timezones
        # if self.start_date and target_date < self.start_date:
        #     return False
        if self.recurrence_type == self.RecurrenceType.DAILY:
            return True
        if self.recurrence_type == self.RecurrenceType.WEEKLY:
            return target_date.weekday() in (self.days_of_week or [])
        # CUSTOM: check specific dates list
        return False
