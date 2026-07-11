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


def get_enriched_user_dict(user):
    """
    Get user dict with fresh computed properties.
    CRITICAL: Always expire trial first to ensure is_premium_active is correct.
    """
    user.expire_trial_if_needed()
    
    # Recompute premium status after expiry check
    is_premium = user.is_premium_active()
    
    return {
        "id": str(user.id),
        "email": user.email,
        "display_name": user.display_name,
        "username": user.username,
        "onboarding_completed": user.onboarding_completed,
        "current_level": user.current_level,
        "total_xp": user.total_xp,
        "avatar_url": user.avatar_url,
        "timezone": user.timezone,
        "identity_statement": user.identity_statement,
        "time_preference": user.time_preference,
        "trial_start": user.trial_start.isoformat() if user.trial_start else None,
        "trial_started_at": user.trial_start.isoformat() if user.trial_start else None,
        "trial_end": user.trial_end.isoformat() if user.trial_end else None,
        "trial_ends_at": user.trial_end.isoformat() if user.trial_end else None,
        "plan_type": user.plan_type,
        "subscription_plan": user.plan_type,
        "subscription_status": user.subscription_status,
        "subscription_start": user.subscription_start.isoformat() if user.subscription_start else None,
        "subscription_started_at": user.subscription_start.isoformat() if user.subscription_start else None,
        "subscription_end": user.subscription_end.isoformat() if user.subscription_end else None,
        "subscription_ends_at": user.subscription_end.isoformat() if user.subscription_end else None,
        "renewal_date": user.renewal_date.isoformat() if user.renewal_date else (user.trial_end.isoformat() if user.trial_end else None),
        "trial_days_remaining": user.get_trial_days_remaining(),
        "trial_hours_remaining": user.get_trial_hours_remaining(),
        "is_premium_active": is_premium,  # Fresh computed value
    }


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
        from django.contrib.auth import authenticate
        from rest_framework.exceptions import AuthenticationFailed

        email = attrs.get("email") or attrs.get("username")
        password = attrs.get("password")
        if email:
            email_clean = email.lower().strip()
            user_exists = User.objects.filter(email=email_clean).first()
            if not user_exists:
                raise AuthenticationFailed("No account found with this email.")
            if not user_exists.has_usable_password():
                raise AuthenticationFailed("This email is already linked with Google Sign-In.")

            user_auth = authenticate(request=self.context.get("request"), username=email_clean, password=password)
            if not user_auth:
                raise AuthenticationFailed("Incorrect password.")
            if not user_auth.is_active:
                raise AuthenticationFailed("No account found with this email.")
        else:
            raise AuthenticationFailed("Please provide both email and password.")

        data = super().validate(attrs)
        return {
            "access": data["access"],
            "refresh": data["refresh"],
            "user": get_enriched_user_dict(self.user),
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
    trial_days_remaining = serializers.SerializerMethodField()
    trial_hours_remaining = serializers.SerializerMethodField()
    is_premium_active = serializers.SerializerMethodField()
    trial_started_at = serializers.ReadOnlyField()
    trial_ends_at = serializers.ReadOnlyField()
    subscription_started_at = serializers.ReadOnlyField()
    subscription_ends_at = serializers.ReadOnlyField()
    subscription_plan = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            "id", "email", "username", "display_name", "avatar_url",
            "timezone", "onboarding_completed", "identity_statement",
            "time_preference", "current_level", "total_xp",
            "level_progress", "xp_to_next_level", "date_joined",
            "trial_start", "trial_end", "plan_type", "subscription_status",
            "subscription_start", "subscription_end", "renewal_date",
            "trial_days_remaining", "trial_hours_remaining", "is_premium_active",
            "trial_started_at", "trial_ends_at", "subscription_started_at",
            "subscription_ends_at", "subscription_plan",
        ]
        read_only_fields = [
            "id", "email", "current_level", "total_xp",
            "onboarding_completed", "date_joined",
            "trial_start", "trial_end", "plan_type", "subscription_status",
            "subscription_start", "subscription_end", "renewal_date",
            "trial_days_remaining", "trial_hours_remaining", "is_premium_active",
            "trial_started_at", "trial_ends_at", "subscription_started_at",
            "subscription_ends_at", "subscription_plan",
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

    @extend_schema_field(int)
    def get_trial_days_remaining(self, obj):
        return obj.get_trial_days_remaining()

    @extend_schema_field(int)
    def get_trial_hours_remaining(self, obj):
        return obj.get_trial_hours_remaining()

    @extend_schema_field(bool)
    def get_is_premium_active(self, obj):
        return obj.is_premium_active()


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

    def validate_time_preference(self, value):
        val = value.strip().lower()
        valid_choices = [c[0] for c in User.TimeOfDayPreference.choices]
        if val not in valid_choices:
            raise serializers.ValidationError(f"{value} is not a valid time preference.")
        return val

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
