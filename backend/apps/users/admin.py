"""
FORGE — Users Admin
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from apps.users.models import User
from apps.core.admin import ForgeBaseAdmin


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    model = User
    list_display = [
        "email", "display_name", "username", "current_level",
        "total_xp", "onboarding_completed", "is_active", "date_joined"
    ]
    list_filter = ["is_active", "is_staff", "onboarding_completed", "time_preference"]
    search_fields = ["email", "display_name", "username"]
    ordering = ["-date_joined"]
    readonly_fields = ["id", "date_joined", "updated_at", "last_login"]
    list_per_page = 50

    fieldsets = (
        (None, {"fields": ("id", "email", "password")}),
        (_("Personal Info"), {"fields": ("display_name", "username", "avatar_url", "timezone")}),
        (_("FORGE Identity"), {"fields": ("identity_statement", "time_preference", "onboarding_completed")}),
        (_("Gamification"), {"fields": ("current_level", "total_xp")}),
        (_("Permissions"), {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        (_("Timestamps"), {"fields": ("date_joined", "updated_at", "last_login")}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "display_name", "password1", "password2"),
        }),
    )
