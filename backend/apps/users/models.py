"""
FORGE — Users App
Custom User model, JWT auth, profile, onboarding.
"""
import uuid
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from apps.core.models import BaseModel


from django.utils import timezone as django_timezone

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    FORGE custom user model.
    Identity statement is the emotional core of onboarding.
    """
    class TimeOfDayPreference(models.TextChoices):
        MORNING = "morning", "Morning Person"
        AFTERNOON = "afternoon", "Afternoon Person"
        EVENING = "evening", "Evening Person"
        NIGHT = "night", "Night Owl"
        FLEXIBLE = "flexible", "Flexible"

    class PlanType(models.TextChoices):
        TRIAL = "trial", "7-Day Free Trial"
        MONTHLY = "monthly", "Monthly Plan (₹99)"
        SIX_MONTH = "6_month", "6-Month Plan (₹399)"
        TWELVE_MONTH = "12_month", "12-Month Plan (₹699)"

    class SubscriptionStatus(models.TextChoices):
        TRIAL = "trial", "Trial Active"
        ACTIVE = "active", "Subscription Active"
        EXPIRED = "expired", "Trial/Plan Expired"
        CANCELLED = "cancelled", "Cancelled"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=50, unique=True, blank=True)
    display_name = models.CharField(max_length=100, blank=True)
    avatar_url = models.TextField(blank=True)

    # Timezone (used for local_date calculations)
    timezone = models.CharField(max_length=64, default="UTC")

    # Onboarding
    onboarding_completed = models.BooleanField(default=False)
    identity_statement = models.TextField(blank=True, help_text="I am someone who…")
    time_preference = models.CharField(
        max_length=20,
        choices=TimeOfDayPreference.choices,
        default=TimeOfDayPreference.FLEXIBLE,
    )

    # Gamification
    current_level = models.PositiveIntegerField(default=1)
    total_xp = models.PositiveIntegerField(default=0)

    # Subscription & Trial Telemetry
    trial_start = models.DateTimeField(null=True, blank=True)
    trial_end = models.DateTimeField(null=True, blank=True)
    trial_used = models.BooleanField(default=False)
    plan_type = models.CharField(
        max_length=20,
        choices=PlanType.choices,
        default=PlanType.TRIAL,
    )
    plan_name = models.CharField(max_length=50, blank=True, default="7-Day Free Trial")
    subscription_status = models.CharField(
        max_length=20,
        choices=SubscriptionStatus.choices,
        default=SubscriptionStatus.TRIAL,
    )
    subscription_start = models.DateTimeField(null=True, blank=True)
    subscription_end = models.DateTimeField(null=True, blank=True)
    payment_id = models.CharField(max_length=100, blank=True)
    order_id = models.CharField(max_length=100, blank=True)
    invoice_number = models.CharField(max_length=100, blank=True)
    invoice_id = models.CharField(max_length=100, blank=True)
    renewal_date = models.DateTimeField(null=True, blank=True)
    payment_status = models.CharField(max_length=50, default="pending")
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    currency = models.CharField(max_length=10, default="INR")
    payment_method = models.CharField(max_length=50, blank=True, default="razorpay")

    # Future Recurring Subscription Support
    razorpay_customer_id = models.CharField(max_length=100, blank=True)
    razorpay_subscription_id = models.CharField(max_length=100, blank=True)
    auto_renew = models.BooleanField(default=True)

    # Metadata
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    class Meta:
        db_table = "users_user"
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return self.email

    @property
    def first_name(self):
        parts = self.display_name.split(" ", 1)
        return parts[0] if parts else ""

    def get_level_progress(self):
        """Returns XP progress within current level (0-100%)."""
        from services.xp_service import XPService
        return XPService.get_level_progress(self.total_xp, self.current_level)

    def expire_trial_if_needed(self):
        """Checks if trial has expired and updates status cleanly."""
        now = django_timezone.now()
        if self.subscription_status == self.SubscriptionStatus.TRIAL and self.trial_end:
            if now > self.trial_end:
                self.subscription_status = self.SubscriptionStatus.EXPIRED
                self.save(update_fields=["subscription_status", "updated_at"])
        elif self.subscription_status == self.SubscriptionStatus.ACTIVE and self.subscription_end:
            if now > self.subscription_end:
                self.subscription_status = self.SubscriptionStatus.EXPIRED
                self.save(update_fields=["subscription_status", "updated_at"])

    def get_trial_days_remaining(self) -> int:
        """Returns exact full days remaining in trial (0 if < 24 hours or expired)."""
        self.expire_trial_if_needed()
        if self.subscription_status != self.SubscriptionStatus.TRIAL or not self.trial_end:
            return 0
        now = django_timezone.now()
        if now >= self.trial_end:
            return 0
        total_sec = (self.trial_end - now).total_seconds()
        if total_sec <= 0:
            return 0
        return max(0, int(total_sec // 86400))

    def get_trial_hours_remaining(self) -> int:
        """Returns exact full hours remaining in trial (0 if expired)."""
        self.expire_trial_if_needed()
        if self.subscription_status != self.SubscriptionStatus.TRIAL or not self.trial_end:
            return 0
        now = django_timezone.now()
        if now >= self.trial_end:
            return 0
        total_sec = (self.trial_end - now).total_seconds()
        if total_sec <= 0:
            return 0
        return max(0, int(total_sec // 3600))

    def is_premium_active(self) -> bool:
        """Checks if user has an active trial or paid subscription."""
        self.expire_trial_if_needed()
        if self.is_superuser or self.is_staff:
            return True
        return self.subscription_status in (self.SubscriptionStatus.TRIAL, self.SubscriptionStatus.ACTIVE)

    # Authoritative Property Aliases
    @property
    def trial_started_at(self):
        return self.trial_start

    @trial_started_at.setter
    def trial_started_at(self, value):
        self.trial_start = value

    @property
    def trial_ends_at(self):
        return self.trial_end

    @trial_ends_at.setter
    def trial_ends_at(self, value):
        self.trial_end = value

    @property
    def subscription_started_at(self):
        return self.subscription_start

    @subscription_started_at.setter
    def subscription_started_at(self, value):
        self.subscription_start = value

    @property
    def subscription_ends_at(self):
        return self.subscription_end

    @subscription_ends_at.setter
    def subscription_ends_at(self, value):
        self.subscription_end = value

    @property
    def subscription_plan(self):
        return self.plan_type

    @subscription_plan.setter
    def subscription_plan(self, value):
        self.plan_type = value
