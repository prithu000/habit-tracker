"""
FORGE — Rewards Admin
"""
from django.contrib import admin
from apps.rewards.models import Badge, UserBadge, XPTransaction
from apps.core.admin import ForgeBaseAdmin


@admin.register(Badge)
class BadgeAdmin(ForgeBaseAdmin):
    list_display = ["slug", "name", "rarity", "xp_reward", "icon"]
    list_filter = ["rarity"]
    search_fields = ["slug", "name"]
    ordering = ["rarity", "name"]
    readonly_fields = ("id",)  # Badge doesn't have updated_at from BaseModel


@admin.register(UserBadge)
class UserBadgeAdmin(ForgeBaseAdmin):
    list_display = ["user", "badge", "seen", "created_at"]
    list_filter = ["seen", "badge__rarity"]
    search_fields = ["user__email", "badge__name"]
    ordering = ["-created_at"]


@admin.register(XPTransaction)
class XPTransactionAdmin(ForgeBaseAdmin):
    list_display = ["user", "amount", "reason", "created_at"]
    list_filter = ["reason"]
    search_fields = ["user__email"]
    ordering = ["-created_at"]
    readonly_fields = ["id", "user", "amount", "reason", "reference_id", "metadata", "created_at", "updated_at"]
