from django.db import models
from django.contrib.auth import get_user_model
from apps.core.models import BaseModel

User = get_user_model()


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


# EmailLog and EmailIdempotency have been migrated to apps/emails


class NotificationPreference(BaseModel):
    """Granular user control over all communication channels."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="notification_preferences")
    
    # Email Preferences
    morning_mail_enabled = models.BooleanField(default=True)
    night_mail_enabled = models.BooleanField(default=True)
    weekly_report_enabled = models.BooleanField(default=True)
    monthly_report_enabled = models.BooleanField(default=True)
    marketing_mail_enabled = models.BooleanField(default=True)
    recovery_mail_enabled = models.BooleanField(default=True)
    trial_mail_enabled = models.BooleanField(default=True)
    
    # Web Push Preferences
    push_notifications_enabled = models.BooleanField(default=False)
    push_subscription_info = models.JSONField(default=dict, blank=True)
    
    class Meta:
        db_table = "notifications_notificationpreference"

    def __str__(self):
        return f"Preferences for {self.user.email}"

