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
from django.conf import settings
from django.views.decorators.cache import never_cache
from django.utils.decorators import method_decorator
from drf_spectacular.utils import extend_schema

from apps.users.serializers import (
    UserRegistrationSerializer,
    ForgeTokenObtainPairSerializer,
    get_enriched_user_dict,
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
                "user": get_enriched_user_dict(user),
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


@extend_schema(request=None, responses=None)
@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([AuthRateThrottle])
def google_auth_view(request):
    """
    POST /api/v1/auth/google/
    Accepts Google OAuth payload/token ({ email, name, picture, token }).
    Verifies token, auto-creates account if needed, sets email verified, imports profile picture/name,
    and returns standard Forge JWT session payload.
    """
    import uuid
    import os
    email = request.data.get("email")
    name = request.data.get("name")
    picture = request.data.get("picture")
    token = request.data.get("token")
    credential = request.data.get("credential")

    raw_token = credential or token
    if not raw_token:
        return Response(
            {"detail": "Google OAuth ID token (credential) is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    client_id = getattr(settings, "GOOGLE_CLIENT_ID", "") or os.environ.get("GOOGLE_CLIENT_ID", "")
    verified_payload = None

    # Method 1: Google oauth2 library (if installed)
    try:
        from google.oauth2 import id_token as google_id_token
        from google.auth.transport import requests as google_requests
        verified_payload = google_id_token.verify_oauth2_token(raw_token, google_requests.Request(), client_id)
    except Exception as e_lib:
        # Method 2: Official Google Tokeninfo Endpoint (standard fallback without extra dependencies)
        try:
            import urllib.request
            import json as pyjson
            url = f"https://oauth2.googleapis.com/tokeninfo?id_token={raw_token}"
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=10) as resp:
                if resp.status == 200:
                    verified_payload = pyjson.loads(resp.read().decode('utf-8'))
                    # Verify audience matches our Client ID
                    if verified_payload.get("aud") != client_id and verified_payload.get("azp") != client_id:
                        return Response({"detail": "Google OAuth token audience mismatch."}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e_net:
            return Response({"detail": "Invalid Google OAuth token or verification failed."}, status=status.HTTP_401_UNAUTHORIZED)

    if not verified_payload or not verified_payload.get("email"):
        return Response({"detail": "Invalid Google OAuth ID token or missing email."}, status=status.HTTP_401_UNAUTHORIZED)

    email = verified_payload.get("email")
    name = name or verified_payload.get("name") or email.split("@")[0]
    picture = picture or verified_payload.get("picture")

    user = User.objects.filter(email=email).first()
    if not user:
        username = email.split("@")[0] + "_" + str(uuid.uuid4())[:4]
        user = User.objects.create_user(
            username=username,
            email=email,
            display_name=name,
            password=uuid.uuid4().hex
        )
        if hasattr(user, "is_verified"):
            user.is_verified = True
        if picture and hasattr(user, "avatar_url"):
            user.avatar_url = picture
        user.save()
        
        # CRITICAL FIX: Send welcome email for Google OAuth registration
        # The post_save signal may not fire reliably for Google OAuth users
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"📧 GOOGLE AUTH EMAIL TRIGGER for {user.email}")
        
        try:
            from services.email_service import EmailService
            logger.info(f"   ↳ Calling EmailService.send_welcome_email()...")
            email_sent = EmailService.send_welcome_email(user)
            logger.info(f"   ↳ Result: {email_sent}")
            if email_sent:
                logger.info(f"✅ Welcome email sent to Google OAuth user: {user.email}")
            else:
                logger.warning(f"⚠️ Welcome email failed for Google OAuth user: {user.email}")
        except Exception as e:
            import traceback
            logger.error(f"❌ Failed to send welcome email to Google OAuth user {user.email}: {e}")
            logger.error(f"   ↳ Full traceback:\n{traceback.format_exc()}")
    else:
        # Link existing account: update avatar and verification status if not set
        if hasattr(user, "is_verified") and not user.is_verified:
            user.is_verified = True
        if picture and hasattr(user, "avatar_url") and not user.avatar_url:
            user.avatar_url = picture
        user.save()

    refresh = RefreshToken.for_user(user)
    return Response(
        {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": get_enriched_user_dict(user),
        },
        status=status.HTTP_200_OK,
    )
