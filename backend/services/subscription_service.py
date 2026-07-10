"""
FORGE — Centralized Subscription Verification Helper
Authoritative access check for premium features.
Never duplicate subscription logic. Use this helper everywhere.
"""
from django.utils import timezone as django_timezone


class SubscriptionService:
    """
    Authoritative service to check if a user has premium access (active trial or active paid plan).
    """
    @classmethod
    def has_premium_access(cls, user) -> bool:
        if not user or not getattr(user, "is_authenticated", False):
            return False
        if getattr(user, "is_superuser", False) or getattr(user, "is_staff", False):
            return True

        if hasattr(user, "expire_trial_if_needed"):
            user.expire_trial_if_needed()

        status = getattr(user, "subscription_status", "").lower()
        now = django_timezone.now()

        if status == "active":
            sub_end = getattr(user, "subscription_end", None) or getattr(user, "subscription_ends_at", None)
            if not sub_end or now <= sub_end:
                return True

        if status == "trial":
            trial_end = getattr(user, "trial_end", None) or getattr(user, "trial_ends_at", None)
            if trial_end and now <= trial_end:
                return True

        return False

    @classmethod
    def hasPremiumAccess(cls, user) -> bool:
        return cls.has_premium_access(user)
