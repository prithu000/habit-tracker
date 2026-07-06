from django.db import models
from django.contrib.auth import get_user_model
from apps.core.models import BaseModel

User = get_user_model()


class Notification(BaseModel):
    class NotifType(models.TextChoices):
        STREAK = "streak", "Streak"
        BADGE = "badge", "Badge"
        MILESTONE = "milestone", "Milestone"
        REMINDER = "reminder", "Reminder"
        SYSTEM = "system", "System"

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=200)
    body = models.TextField()
    notif_type = models.CharField(max_length=20, choices=NotifType.choices, default=NotifType.SYSTEM)
    is_read = models.BooleanField(default=False)
    action_url = models.CharField(max_length=200, blank=True)

    class Meta:
        db_table = "notifications_notification"
        ordering = ["-created_at"]


class EmailReminderSchedule(BaseModel):
    class Frequency(models.TextChoices):
        ONE_TIME = "One Time", "One Time"
        DAILY = "Daily", "Daily"
        WEEKLY = "Weekly", "Weekly"
        MONTHLY = "Monthly", "Monthly"
        YEARLY = "Yearly", "Yearly"

    class Priority(models.TextChoices):
        LOW = "Low", "Low"
        MEDIUM = "Medium", "Medium"
        HIGH = "High", "High"
        URGENT = "Urgent", "Urgent"

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="email_reminders")
    task_name = models.CharField(max_length=200)
    priority = models.CharField(max_length=20, choices=Priority.choices, default=Priority.MEDIUM)
    frequency = models.CharField(max_length=20, choices=Frequency.choices, default=Frequency.DAILY)
    deadline = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    completion_token = models.UUIDField(null=True, blank=True)

    class Meta:
        db_table = "notifications_emailreminderschedule"
        ordering = ["deadline"]

    def __str__(self):
        return f"{self.user.email} — {self.task_name} ({self.frequency})"

