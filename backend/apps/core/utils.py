"""
FORGE — Core Utilities
Shared helpers used across all apps.
"""
import pytz
from datetime import date, datetime
from typing import Optional
from django.utils import timezone as django_tz
from django.contrib.auth import get_user_model


# ─────────────────────────────────────────────────────────
# Timezone Utilities
# ─────────────────────────────────────────────────────────

def get_user_timezone(user) -> pytz.BaseTzInfo:
    """Returns a validated pytz timezone for the user. Falls back to UTC."""
    try:
        return pytz.timezone(user.timezone)
    except Exception:
        return pytz.UTC


def get_user_local_date(user) -> date:
    """Returns today's date in the user's local timezone."""
    tz = get_user_timezone(user)
    return django_tz.now().astimezone(tz).date()


def get_user_local_datetime(user) -> datetime:
    """Returns current datetime in the user's local timezone."""
    tz = get_user_timezone(user)
    return django_tz.now().astimezone(tz)


def utc_now() -> datetime:
    """Returns current UTC-aware datetime."""
    return django_tz.now()


def localize_date(dt: datetime, user) -> date:
    """Convert a UTC datetime to the user's local date."""
    tz = get_user_timezone(user)
    return dt.astimezone(tz).date()


# ─────────────────────────────────────────────────────────
# String Utilities
# ─────────────────────────────────────────────────────────

def mask_email(email: str) -> str:
    """Returns e***@domain.com — for logs and public display."""
    parts = email.split("@")
    if len(parts) != 2:
        return email
    local = parts[0]
    return f"{local[0]}{'*' * (len(local) - 1)}@{parts[1]}"


def truncate(text: str, max_length: int = 100, suffix: str = "...") -> str:
    """Truncates text to max_length, appending suffix if cut."""
    if len(text) <= max_length:
        return text
    return text[: max_length - len(suffix)] + suffix


# ─────────────────────────────────────────────────────────
# Date Range Utilities
# ─────────────────────────────────────────────────────────

from datetime import timedelta


def get_date_range(start: date, end: date):
    """Yields each date from start to end inclusive."""
    current = start
    while current <= end:
        yield current
        current += timedelta(days=1)


def get_week_bounds(reference_date: Optional[date] = None):
    """Returns (monday, sunday) for the ISO week of reference_date."""
    ref = reference_date or date.today()
    monday = ref - timedelta(days=ref.weekday())
    sunday = monday + timedelta(days=6)
    return monday, sunday


def get_month_bounds(reference_date: Optional[date] = None):
    """Returns (first_day, last_day) for the month of reference_date."""
    import calendar
    ref = reference_date or date.today()
    first = ref.replace(day=1)
    last_day = calendar.monthrange(ref.year, ref.month)[1]
    last = ref.replace(day=last_day)
    return first, last


def get_year_bounds(year: Optional[int] = None):
    """Returns (jan_1, dec_31) for a given year."""
    y = year or date.today().year
    return date(y, 1, 1), date(y, 12, 31)


# ─────────────────────────────────────────────────────────
# Pagination Helpers
# ─────────────────────────────────────────────────────────

def paginate_queryset(queryset, request, paginator_class):
    """Helper to paginate and return response data."""
    paginator = paginator_class()
    page = paginator.paginate_queryset(queryset, request)
    return page, paginator


# ─────────────────────────────────────────────────────────
# Percentage Utility
# ─────────────────────────────────────────────────────────

def safe_percentage(numerator: int, denominator: int, decimals: int = 1) -> float:
    """Returns 0.0 if denominator is 0, else rounded percentage."""
    if not denominator:
        return 0.0
    return round((numerator / denominator) * 100, decimals)


# ─────────────────────────────────────────────────────────
# Model Helpers
# ─────────────────────────────────────────────────────────

def get_object_or_none(model, **kwargs):
    """Returns instance or None — never raises."""
    try:
        return model.objects.get(**kwargs)
    except model.DoesNotExist:
        return None
