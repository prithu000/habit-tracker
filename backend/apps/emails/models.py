from django.db import models
from apps.core.models import BaseModel

class EmailLog(BaseModel):
    """
    Core log for tracking all outgoing transactional and automated emails.
    """
    class Status(models.TextChoices):
        QUEUED = "queued", "Queued"
        RETRYING = "retrying", "Retrying"
        SENT = "sent", "Sent"
        FAILED = "failed", "Failed"
        DELIVERED = "delivered", "Delivered"
        OPENED = "opened", "Opened"
        CLICKED = "clicked", "Clicked"
        BOUNCED = "bounced", "Bounced"
        SPAM = "spam", "Spam"
        COMPLAINED = "complained", "Complained"
        CANCELLED = "cancelled", "Cancelled"

    recipient = models.EmailField(db_index=True)
    template = models.CharField(max_length=100, db_index=True)
    subject = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.QUEUED, db_index=True)
    
    # Provider tracking
    provider_message_id = models.CharField(max_length=255, blank=True)
    error_message = models.TextField(blank=True)
    html_content = models.TextField(blank=True, help_text="The exact HTML payload sent.")
    
    # Behavior Tracking & Psychology
    subject_variation = models.ForeignKey("SubjectLineVariation", null=True, blank=True, on_delete=models.SET_NULL)
    segment = models.CharField(max_length=100, blank=True, help_text="User segment targeted (e.g., missed_3_days)")
    
    # Timing
    sent_at = models.DateTimeField(null=True, blank=True)
    opened = models.DateTimeField(null=True, blank=True)
    clicked = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "emails_emaillog"
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.status.upper()}] {self.template} to {self.recipient}"


class EmailIdempotency(BaseModel):
    """
    Guarantees emails (like morning motivation) are only ever sent once,
    even if Celery duplicates the task or the scheduler runs twice.
    """
    idempotency_key = models.CharField(max_length=255, unique=True)
    email_log = models.ForeignKey(EmailLog, null=True, blank=True, on_delete=models.SET_NULL)

    class Meta:
        db_table = "emails_emailidempotency"

    def __str__(self):
        return self.idempotency_key


class EmailTemplateConfig(BaseModel):
    """
    Tracks and manages templates for the Retention Engine.
    Allows disabling, archiving, and dynamic configuration.
    """
    name = models.CharField(max_length=100, unique=True, help_text="Internal name (e.g., missed_3_days)")
    description = models.TextField(blank=True)
    html_file_path = models.CharField(max_length=255, help_text="Path to HTML template, e.g., emails/retention/missed_3_days.html")
    is_active = models.BooleanField(default=True)
    variables_required = models.JSONField(default=list, blank=True, help_text="List of required context variables")

    class Meta:
        db_table = "emails_emailtemplateconfig"

    def __str__(self):
        return f"{self.name} ({'Active' if self.is_active else 'Disabled'})"


class SubjectLineVariation(BaseModel):
    """
    Stores up to 15 variations of a subject line per template for A/B testing and psychology optimization.
    """
    template_config = models.ForeignKey(EmailTemplateConfig, on_delete=models.CASCADE, related_name="subject_variations")
    subject_text = models.CharField(max_length=255)
    sent_count = models.PositiveIntegerField(default=0)
    open_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "emails_subjectlinevariation"
        ordering = ["-open_count"]

    def __str__(self):
        return self.subject_text

    @property
    def open_rate(self) -> float:
        if self.sent_count == 0:
            return 0.0
        return round((self.open_count / self.sent_count) * 100, 2)


class EmailBounceSuppress(BaseModel):
    """
    Permanent suppression list for hard bounces and spam complaints.

    Once an address is on this list, EmailService will never attempt to send
    to it again, protecting domain reputation and Brevo sending score.

    Populated automatically by the Brevo webhook handler.
    Admins can also manually add entries.
    """
    class Reason(models.TextChoices):
        HARD_BOUNCE = "hard_bounce", "Hard Bounce"
        SOFT_BOUNCE = "soft_bounce", "Soft Bounce"
        SPAM_COMPLAINT = "spam_complaint", "Spam Complaint"
        UNSUBSCRIBED = "unsubscribed", "Unsubscribed"
        MANUAL = "manual", "Manually Suppressed"
        BLOCKED = "blocked", "Blocked by Provider"

    email = models.EmailField(unique=True, db_index=True)
    reason = models.CharField(max_length=20, choices=Reason.choices, default=Reason.HARD_BOUNCE)
    provider_event = models.CharField(max_length=100, blank=True, help_text="Raw Brevo event name")
    notes = models.TextField(blank=True)

    class Meta:
        db_table = "emails_emailbouncesuppress"
        ordering = ["-created_at"]
        verbose_name = "Suppressed Email"
        verbose_name_plural = "Suppressed Emails"

    def __str__(self):
        return f"{self.email} ({self.get_reason_display()})"

    @classmethod
    def is_suppressed(cls, email: str) -> bool:
        """Check if an address is on the suppression list."""
        return cls.objects.filter(email__iexact=email).exists()

    @classmethod
    def suppress(cls, email: str, reason: str, provider_event: str = "") -> "EmailBounceSuppress":
        """Idempotent add to suppression list."""
        obj, _ = cls.objects.update_or_create(
            email=email.lower(),
            defaults={"reason": reason, "provider_event": provider_event}
        )
        return obj
