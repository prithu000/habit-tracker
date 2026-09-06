"""
Migration 0007 — DESTRUCTIVE: Drop Routine and RoutineSchedule tables.

Prerequisites (must be run BEFORE this migration):
  - 0005: schema — added user FK, category, frequency, due_date to Task
  - 0006: data  — backfilled Task.user, Task.category, Task.frequency from Routine
  - streaks 0003: removed per-routine streaks and Routine FK from StreakRecord
  - analytics 0004: removed best_routine FK from WeeklyInsight

This migration:
  1. Makes Task.user NOT NULL (enforces direct user ownership)
  2. Removes index routines_ta_routine_3c1fc6_idx on Task(routine, is_active)
  3. Removes Task.routine FK
  4. Drops RoutineSchedule table
  5. Drops Routine table
"""
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("routines", "0006_data_migrate_routine_to_task"),
        ("streaks",  "0003_remove_streakrecord_routine"),
        ("analytics", "0012_weeklyinsight_best_category"),
    ]

    operations = [
        # ── 1. Make Task.user NOT NULL ──────────────────────────────────────
        migrations.AlterField(
            model_name="task",
            name="user",
            field=models.ForeignKey(
                on_delete=models.CASCADE,
                related_name="tasks",
                to=settings.AUTH_USER_MODEL,
            ),
        ),

        # ── 2. Remove Task(routine, is_active) index ────────────────────────
        migrations.RemoveIndex(
            model_name="task",
            name="routines_ta_routine_3c1fc6_idx",
        ),

        # ── 3. Remove Task.routine FK ───────────────────────────────────────
        migrations.RemoveField(
            model_name="task",
            name="routine",
        ),

        # ── 4. Drop RoutineSchedule ─────────────────────────────────────────
        migrations.DeleteModel(
            name="RoutineSchedule",
        ),

        # ── 5. Drop Routine ──────────────────────────────────────────────────
        migrations.DeleteModel(
            name="Routine",
        ),
    ]
