"""
FORGE — Routines Admin
"""
from django.contrib import admin
from apps.routines.models import Routine, Task, RoutineSchedule
from apps.core.admin import ForgeBaseAdmin


class TaskInline(admin.TabularInline):
    model = Task
    extra = 0
    fields = ["name", "duration_minutes", "sort_order", "is_active"]
    ordering = ["sort_order"]


class ScheduleInline(admin.StackedInline):
    model = RoutineSchedule
    extra = 0


@admin.register(Routine)
class RoutineAdmin(ForgeBaseAdmin):
    list_display = ["name", "user", "time_of_day", "active_task_count", "is_active", "created_at"]
    list_filter = ["is_active", "time_of_day"]
    search_fields = ["name", "user__email"]
    inlines = [ScheduleInline, TaskInline]
    ordering = ["-created_at"]


@admin.register(Task)
class TaskAdmin(ForgeBaseAdmin):
    list_display = ["name", "routine", "duration_minutes", "sort_order", "is_active"]
    list_filter = ["is_active", "routine__time_of_day"]
    search_fields = ["name", "routine__name"]
    ordering = ["routine", "sort_order"]
