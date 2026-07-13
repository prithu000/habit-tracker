"""
FORGE — Custom DRF Permissions
"""
from rest_framework.permissions import BasePermission, IsAuthenticated


class IsOwner(BasePermission):
    """
    Object-level permission: only the owner of an object may access it.
    Assumes the model has a `user` field.
    """
    message = "You do not have permission to access this resource."

    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


class IsOwnerOrReadOnly(BasePermission):
    """
    Safe methods allowed for all authenticated users.
    Write methods only for the owner.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return True
        return obj.user == request.user


class OnboardingComplete(BasePermission):
    """
    Restricts access to users who have completed onboarding.
    """
    message = "Please complete onboarding to access this feature."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.onboarding_completed


class IsAuthenticatedAndOnboarded(BasePermission):
    """
    Combines IsAuthenticated + OnboardingComplete.
    """
    message = "Authentication and onboarding required."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.onboarding_completed


class IsRoutineOwner(IsOwner):
    """
    Specifically for Routine objects.
    Also covers Task access through routine ownership.
    """
    message = "You do not own this routine."


class IsSelf(BasePermission):
    """
    For user-profile endpoints: only the user themselves.
    """
    def has_object_permission(self, request, view, obj):
        return obj == request.user


class HasPremiumAccessPermission(BasePermission):
    """
    FORGE — Authoritative DRF Permission enforcing subscription & trial gating.
    If the user's trial has ended and they have no active paid subscription,
    access is denied (HTTP 403 Forbidden).
    """
    message = "Your 14-day Premium Trial has ended. Upgrade to continue."
    code = "SUBSCRIPTION_REQUIRED"

    def has_permission(self, request, view):
        from services.subscription_service import SubscriptionService
        from rest_framework.exceptions import PermissionDenied

        if not request.user or not request.user.is_authenticated:
            return False

        if SubscriptionService.has_premium_access(request.user):
            return True

        raise PermissionDenied(
            detail="Your 14-day Premium Trial has ended. Upgrade to continue.",
            code="SUBSCRIPTION_REQUIRED"
        )
