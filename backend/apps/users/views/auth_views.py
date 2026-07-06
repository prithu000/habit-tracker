"""
FORGE — Auth Views (Production)
All auth endpoints in one place.

Response contract for registration and login:
{
  "access": "...",
  "refresh": "...",
  "user": { id, email, display_name, onboarding_completed, current_level, total_xp, avatar_url }
}
"""
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.views.decorators.cache import never_cache
from django.utils.decorators import method_decorator
from drf_spectacular.utils import extend_schema

from apps.users.serializers import (
    UserRegistrationSerializer,
    ForgeTokenObtainPairSerializer,
)

User = get_user_model()


class AuthRateThrottle(ScopedRateThrottle):
    scope = "auth"


class RegisterView(generics.CreateAPIView):
    """
    POST /api/v1/auth/register/
    Rate-limited to 10/minute (auth scope).
    Returns JWT tokens immediately — no separate login step needed.
    """
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
    throttle_classes = [AuthRateThrottle]

    @method_decorator(never_cache)
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "display_name": user.display_name,
                    "username": user.username,
                    "onboarding_completed": user.onboarding_completed,
                    "current_level": user.current_level,
                    "total_xp": user.total_xp,
                    "avatar_url": user.avatar_url,
                },
            },
            status=status.HTTP_201_CREATED,
        )


class ForgeTokenObtainPairView(TokenObtainPairView):
    """
    POST /api/v1/auth/login/
    Returns access, refresh, and enriched user object.
    Rate-limited to 10/minute.
    """
    serializer_class = ForgeTokenObtainPairSerializer
    throttle_classes = [AuthRateThrottle]


@extend_schema(request=None, responses=None)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([AuthRateThrottle])
def logout_view(request):
    """
    POST /api/v1/auth/logout/
    Blacklists the provided refresh token.
    Body: { "refresh": "<token>" }
    """
    refresh_token = request.data.get("refresh")
    if not refresh_token:
        return Response(
            {"detail": "Refresh token is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
    except Exception:
        # Token already invalid — still return 200 (idempotent logout)
        pass
    return Response({"detail": "Logged out successfully."}, status=status.HTTP_200_OK)
