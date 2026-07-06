"""
FORGE — Completions Admin
"""
from django.contrib import admin
from apps.completions.models import Completion, DayLog
from apps.core.admin import ForgeBaseAdmin


@admin.register(Completion)
class CompletionAdmin(ForgeBaseAdmin):
    list_display = ["user", "task", "local_date", "mood", "completed_at"]
    list_filter = ["local_date", "mood"]
    search_fields = ["user__email", "task__name"]
    ordering = ["-completed_at"]
    date_hierarchy = "local_date"


@admin.register(DayLog)
class DayLogAdmin(ForgeBaseAdmin):
    list_display = [
        "user", "log_date", "tasks_completed", "tasks_scheduled",
        "completion_rate", "xp_earned", "is_streak_day"
    ]
    list_filter = ["is_streak_day"]
    search_fields = ["user__email"]
    ordering = ["-log_date"]
    date_hierarchy = "log_date"
