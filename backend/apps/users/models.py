"""
FORGE — Users App
Custom User model, JWT auth, profile, onboarding.
"""
import uuid
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from apps.core.models import BaseModel


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
