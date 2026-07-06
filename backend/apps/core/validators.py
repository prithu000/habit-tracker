"""
FORGE — Core Validators
Reusable field-level and object-level validators.
"""
import re
import pytz
from django.core.exceptions import ValidationError


def validate_hex_color(value: str):
    """Validates a CSS hex color string like #RRGGBB."""
    if not re.match(r"^#[0-9A-Fa-f]{6}$", value):
        raise ValidationError(
            f"'{value}' is not a valid hex color. Expected format: #RRGGBB"
        )


def validate_emoji(value: str):
    """Validates that the field contains at most 2 Unicode characters (emoji)."""
    if len(value) > 4:  # Allow multi-codepoint emoji
        raise ValidationError("Icon must be a single emoji (max 4 characters).")


def validate_timezone(value: str):
    """Validates a IANA timezone string."""
    if value not in pytz.all_timezones_set:
        raise ValidationError(
            f"'{value}' is not a valid timezone. "
            "Use a value from the IANA timezone database (e.g. 'Asia/Kolkata')."
        )


def validate_mood_score(value: int):
    """Validates a mood score is within 1–5."""
    if not (1 <= value <= 5):
        raise ValidationError("Mood score must be between 1 and 5.")


def validate_identity_statement(value: str):
    """Validates the identity statement has meaningful content."""
    cleaned = value.strip()
    if len(cleaned) < 10:
        raise ValidationError(
            "Identity statement must be at least 10 characters. "
            "Tell us who you are becoming."
        )
    if len(cleaned) > 300:
        raise ValidationError("Identity statement must not exceed 300 characters.")


def validate_display_name(value: str):
    """Display name must be 1–100 chars, no only-whitespace."""
    cleaned = value.strip()
    if not cleaned:
        raise ValidationError("Display name cannot be blank.")
    if len(cleaned) > 100:
        raise ValidationError("Display name must not exceed 100 characters.")


def validate_routine_name(value: str):
    """Routine name: 1–100 chars."""
    cleaned = value.strip()
    if not cleaned:
        raise ValidationError("Routine name cannot be blank.")
    if len(cleaned) > 100:
        raise ValidationError("Routine name must not exceed 100 characters.")


def validate_task_name(value: str):
    """Task name: 1–200 chars."""
    cleaned = value.strip()
    if not cleaned:
        raise ValidationError("Task name cannot be blank.")
    if len(cleaned) > 200:
        raise ValidationError("Task name must not exceed 200 characters.")


def validate_duration_minutes(value: int):
    """Duration must be between 0 and 1440 minutes (24 hours)."""
    if value < 0:
        raise ValidationError("Duration cannot be negative.")
    if value > 1440:
        raise ValidationError("Duration cannot exceed 1440 minutes (24 hours).")


def validate_sort_order(value: int):
    """Sort order must be non-negative."""
    if value < 0:
        raise ValidationError("Sort order must be a non-negative integer.")


def validate_days_of_week(value: list):
    """Validates a list of integers representing weekdays (0=Monday..6=Sunday)."""
    if not isinstance(value, list):
        raise ValidationError("days_of_week must be a list.")
    for day in value:
        if day not in range(7):
            raise ValidationError(
                f"Invalid day value: {day}. Must be 0 (Mon) through 6 (Sun)."
            )
    if len(set(value)) != len(value):
        raise ValidationError("days_of_week must not contain duplicates.")


def validate_password_strength(value: str):
    """
    Enforces: min 8 chars, at least 1 digit, at least 1 letter.
    Not overly strict — we want low friction.
    """
    if len(value) < 8:
        raise ValidationError("Password must be at least 8 characters long.")
    if not any(c.isdigit() for c in value):
        raise ValidationError("Password must contain at least one number.")
    if not any(c.isalpha() for c in value):
        raise ValidationError("Password must contain at least one letter.")
