"""
FORGE — Users App Views (Production)
Auth, profile, stats, onboarding, password management.
"""
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from services.cache_service import CacheService
from drf_spectacular.utils import extend_schema

from apps.users.serializers import (
    UserRegistrationSerializer,
    UserProfileSerializer,
    UserProfileUpdateSerializer,
    OnboardingSerializer,
    PasswordChangeSerializer,
    UserStatsSerializer,
)
from apps.core.permissions import IsSelf

User = get_user_model()


# ─────────────────────────────────────────────────────────
# Registration
# ─────────────────────────────────────────────────────────

class RegisterView(generics.CreateAPIView):
    """
    POST /api/v1/auth/register/
    Creates a new user and returns JWT tokens.
    """
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle]

    @method_decorator(never_cache)
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "display_name": user.display_name,
                    "username": user.username,
                    "onboarding_completed": user.onboarding_completed,
                    "current_level": user.current_level,
                    "total_xp": user.total_xp,
                },
                "tokens": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                },
            },
            status=status.HTTP_201_CREATED,
        )


# ─────────────────────────────────────────────────────────
# Profile
# ─────────────────────────────────────────────────────────

class MeView(generics.RetrieveUpdateAPIView):
    """
    GET  /api/v1/users/me/   — Full profile
    PATCH /api/v1/users/me/  — Partial update
    """
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "patch", "head", "options"]

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method == "PATCH":
            return UserProfileUpdateSerializer
        return UserProfileSerializer

    def partial_update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return self.update(request, *args, **kwargs)

    def perform_update(self, serializer):
        serializer.save()
        CacheService.invalidate_today(str(self.request.user.id))


# ─────────────────────────────────────────────────────────
# Password Change
# ─────────────────────────────────────────────────────────

class PasswordChangeView(generics.GenericAPIView):
    """
    POST /api/v1/users/me/password/
    Changes user password. Requires current password.
    """
    serializer_class = PasswordChangeSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Blacklist all existing refresh tokens after password change
        # The user will need to log in again
        return Response(
            {"detail": "Password changed successfully. Please log in again."},
            status=status.HTTP_200_OK,
        )


# ─────────────────────────────────────────────────────────
# Stats
# ─────────────────────────────────────────────────────────

@extend_schema(responses=None)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_stats_view(request):
    """
    GET /api/v1/users/me/stats/
    Returns comprehensive aggregate stats for the current user.
    """
    from apps.streaks.models import StreakRecord
    from apps.rewards.models import UserBadge
    from apps.completions.models import Completion, DayLog
    from services.xp_service import XPService, LEVEL_THRESHOLDS
    from django.db.models import Count, Q
    from datetime import date

    user = request.user

    # Streak
    streak = StreakRecord.objects.filter(user=user, routine__isnull=True).first()

    # Completions
    total_completions = Completion.objects.filter(user=user).count()

    # Perfect days (100% completion rate)
    perfect_days = DayLog.objects.filter(user=user, completion_rate=100).count()

    # Days active (any completion)
    days_active = DayLog.objects.filter(user=user, tasks_completed__gt=0).count()

    # Member since
    from django.utils import timezone
    days_since_join = (timezone.now().date() - user.date_joined.date()).days

    # XP to next level
    next_idx = min(user.current_level, len(LEVEL_THRESHOLDS) - 1)
    xp_to_next = max(0, LEVEL_THRESHOLDS[next_idx] - user.total_xp)

    data = {
        "total_xp": user.total_xp,
        "current_level": user.current_level,
        "level_progress": user.get_level_progress(),
        "xp_to_next_level": xp_to_next,
        "current_streak": streak.current_streak if streak else 0,
        "longest_streak": streak.longest_streak if streak else 0,
        "total_badges": UserBadge.objects.filter(user=user).count(),
        "total_completions": total_completions,
        "perfect_days": perfect_days,
        "days_active": days_active,
        "member_since_days": days_since_join,
    }

    serializer = UserStatsSerializer(data)
    return Response(serializer.data)


# ─────────────────────────────────────────────────────────
# Onboarding
# ─────────────────────────────────────────────────────────

class OnboardingCompleteView(generics.GenericAPIView):
    """
    POST /api/v1/users/me/onboarding/complete/
    Completes onboarding and awards XP bonus.
    """
    serializer_class = OnboardingSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user

        if user.onboarding_completed:
            return Response(
                {"detail": "Onboarding already completed."},
                status=status.HTTP_200_OK,
            )

        serializer = self.get_serializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        CacheService.invalidate_today(str(user.id))

        return Response(
            UserProfileSerializer(user).data,
            status=status.HTTP_200_OK,
        )
