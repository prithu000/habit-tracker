"""
FORGE — Users App Serializers (Production)
Full validation, custom error messages, nested representations.
"""
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from drf_spectacular.utils import extend_schema_field
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from apps.core.validators import (
    validate_timezone,
    validate_identity_statement,
    validate_display_name,
    validate_password_strength,
)

User = get_user_model()


# ─────────────────────────────────────────────────────────
# JWT Token
# ─────────────────────────────────────────────────────────

class ForgeTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Injects enriched user data into JWT payload."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["email"] = user.email
        token["display_name"] = user.display_name
        token["username"] = user.username
        token["onboarding_completed"] = user.onboarding_completed
        token["level"] = user.current_level
        token["timezone"] = user.timezone
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Flatten to match register response: { access, refresh, user }
        return {
            "access": data["access"],
            "refresh": data["refresh"],
            "user": {
                "id": str(self.user.id),
                "email": self.user.email,
                "display_name": self.user.display_name,
                "username": self.user.username,
                "onboarding_completed": self.user.onboarding_completed,
                "current_level": self.user.current_level,
                "total_xp": self.user.total_xp,
                "avatar_url": self.user.avatar_url,
            },
        }


# ─────────────────────────────────────────────────────────
# Registration
# ─────────────────────────────────────────────────────────

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
    )
    password_confirm = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
    )

    class Meta:
        model = User
        fields = ["email", "display_name", "password", "password_confirm"]
        extra_kwargs = {
            "email": {"required": True},
            "display_name": {"required": False, "default": ""},
        }

    def validate_email(self, value):
        email = value.lower().strip()
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )
        return email

    def validate_display_name(self, value):
        if value:
            validate_display_name(value)
        return value.strip() if value else ""

    def validate_password(self, value):
        validate_password_strength(value)
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError(
                {"password_confirm": "Passwords do not match."}
            )
        return attrs

    def create(self, validated_data):
        email = validated_data["email"]
        # Auto-generate unique username from email
        base = email.split("@")[0].lower()
        base = "".join(c for c in base if c.isalnum() or c in ("_", "."))[:30]
        username = base
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base}{counter}"
            counter += 1

        display_name = validated_data.get("display_name") or base.capitalize()

        return User.objects.create_user(
            email=email,
            username=username,
            display_name=display_name,
            password=validated_data["password"],
        )


# ─────────────────────────────────────────────────────────
# Profile
# ─────────────────────────────────────────────────────────

class UserProfileSerializer(serializers.ModelSerializer):
    level_progress = serializers.SerializerMethodField()
    xp_to_next_level = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "email", "username", "display_name", "avatar_url",
            "timezone", "onboarding_completed", "identity_statement",
            "time_preference", "current_level", "total_xp",
            "level_progress", "xp_to_next_level", "date_joined",
        ]
        read_only_fields = [
            "id", "email", "current_level", "total_xp",
            "onboarding_completed", "date_joined",
        ]

    def validate_display_name(self, value):
        if value:
            validate_display_name(value)
        return value.strip()

    def validate_timezone(self, value):
        validate_timezone(value)
        return value

    def validate_identity_statement(self, value):
        if value:
            validate_identity_statement(value)
        return value.strip()

    def validate_username(self, value):
        cleaned = value.strip().lower()
        qs = User.objects.filter(username=cleaned)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("This username is already taken.")
        if len(cleaned) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters.")
        if not cleaned.replace("_", "").replace(".", "").isalnum():
            raise serializers.ValidationError(
                "Username may only contain letters, numbers, underscores, and dots."
            )
        return cleaned

    @extend_schema_field(float)
    def get_level_progress(self, obj):
        return obj.get_level_progress()

    @extend_schema_field(int)
    def get_xp_to_next_level(self, obj):
        from services.xp_service import XPService, LEVEL_THRESHOLDS
        next_idx = min(obj.current_level, len(LEVEL_THRESHOLDS) - 1)
        return max(0, LEVEL_THRESHOLDS[next_idx] - obj.total_xp)


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Separate serializer for PATCH — only mutable fields."""

    class Meta:
        model = User
        fields = [
            "display_name", "username", "avatar_url",
            "timezone", "identity_statement", "time_preference",
        ]

    def validate_display_name(self, value):
        if value:
            validate_display_name(value)
        return value.strip()

    def validate_timezone(self, value):
        validate_timezone(value)
        return value

    def validate_identity_statement(self, value):
        if value:
            validate_identity_statement(value)
        return value.strip()

    def validate_username(self, value):
        cleaned = value.strip().lower()
        qs = User.objects.filter(username=cleaned).exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("This username is already taken.")
        return cleaned


# ─────────────────────────────────────────────────────────
# Onboarding
# ─────────────────────────────────────────────────────────

class OnboardingSerializer(serializers.ModelSerializer):
    """
    Completes user onboarding.
    Required: identity_statement.
    Optional: timezone, time_preference.
    """
    identity_statement = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = ["identity_statement", "time_preference", "timezone"]

    def validate_identity_statement(self, value):
        validate_identity_statement(value)
        return value.strip()

    def validate_timezone(self, value):
        validate_timezone(value)
        return value

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.onboarding_completed = True
        instance.save(update_fields=list(validated_data.keys()) + ["onboarding_completed", "updated_at"])
        return instance


# ─────────────────────────────────────────────────────────
# Password Change
# ─────────────────────────────────────────────────────────

class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True, style={"input_type": "password"})
    new_password = serializers.CharField(write_only=True, min_length=8, style={"input_type": "password"})
    new_password_confirm = serializers.CharField(write_only=True, style={"input_type": "password"})

    def validate_current_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate_new_password(self, value):
        validate_password_strength(value)
        return value

    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError(
                {"new_password_confirm": "Passwords do not match."}
            )
        return attrs

    def save(self):
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save(update_fields=["password"])

        # Blacklist all outstanding tokens for this user.
        # This forces all other sessions to re-authenticate.
        try:
            from rest_framework_simplejwt.token_blacklist.models import (
                OutstandingToken, BlacklistedToken
            )
            tokens = OutstandingToken.objects.filter(user=user)
            for token in tokens:
                BlacklistedToken.objects.get_or_create(token=token)
        except Exception:
            pass  # Token blacklist app may not be active in all environments

        return user



# ─────────────────────────────────────────────────────────
# User Stats (read-only aggregate)
# ─────────────────────────────────────────────────────────

class UserStatsSerializer(serializers.Serializer):
    total_xp = serializers.IntegerField()
    current_level = serializers.IntegerField()
    level_progress = serializers.FloatField()
    xp_to_next_level = serializers.IntegerField()
    current_streak = serializers.IntegerField()
    longest_streak = serializers.IntegerField()
    total_badges = serializers.IntegerField()
    total_completions = serializers.IntegerField()
    perfect_days = serializers.IntegerField()
    days_active = serializers.IntegerField()
    member_since_days = serializers.IntegerField()
