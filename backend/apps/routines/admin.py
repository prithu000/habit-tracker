"""
FORGE — Routines Admin (Tasks only)
"""
from django.contrib import admin
from apps.routines.models import Task
from apps.core.admin import ForgeBaseAdmin


@admin.register(Task)
class TaskAdmin(ForgeBaseAdmin):
    list_display = ["name", "user", "category", "frequency", "duration_minutes", "sort_order", "is_active"]
    list_filter = ["is_active", "category", "frequency"]
    search_fields = ["name", "user__email"]
    ordering = ["user", "category", "sort_order"]
