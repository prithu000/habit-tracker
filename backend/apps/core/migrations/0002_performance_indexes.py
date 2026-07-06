"""
FORGE — Performance Indexes Migration
Adds composite indexes for the most frequently queried columns.

Design rationale:
  - (user, local_date) on Completion: primary hot-path filter
  - (user, log_date)   on DayLog: all analytics queries
  - (user, routine)    on StreakRecord: dashboard query
  - (user, is_read)    on Notification: unread count
  - (user, seen)       on UserBadge: unseen badge check
  - (user, is_active)  on Routine: today view filter
  - (routine, is_active) on Task: task prefetch filter
  - (user, amount)     on XPTransaction: filtered aggregates
"""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        # These depend on the initial migrations of each app
        ("completions", "0001_initial"),
        ("streaks", "0001_initial"),
        ("notifications", "0001_initial"),
        ("rewards", "0001_initial"),
        ("routines", "0001_initial"),
    ]

    operations = [
        # ── Completion ──
        migrations.AddIndex(
            model_name="completion",
            index=models.Index(
                fields=["user", "local_date"],
                name="completions_user_date_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="completion",
            index=models.Index(
                fields=["task", "user", "local_date"],
                name="completions_task_user_date_idx",
            ),
        ),

        # ── DayLog ──
        migrations.AddIndex(
            model_name="daylog",
            index=models.Index(
                fields=["user", "log_date"],
                name="daylog_user_date_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="daylog",
            index=models.Index(
                fields=["user", "completion_rate"],
                name="daylog_user_rate_idx",
            ),
        ),

        # ── StreakRecord ──
        migrations.AddIndex(
            model_name="streakrecord",
            index=models.Index(
                fields=["user", "routine"],
                name="streak_user_routine_idx",
            ),
        ),

        # ── Notification ──
        migrations.AddIndex(
            model_name="notification",
            index=models.Index(
                fields=["user", "is_read"],
                name="notif_user_read_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="notification",
            index=models.Index(
                fields=["user", "created_at"],
                name="notif_user_created_idx",
            ),
        ),

        # ── UserBadge ──
        migrations.AddIndex(
            model_name="userbadge",
            index=models.Index(
                fields=["user", "seen"],
                name="userbadge_user_seen_idx",
            ),
        ),

        # ── Routine ──
        migrations.AddIndex(
            model_name="routine",
            index=models.Index(
                fields=["user", "is_active", "sort_order"],
                name="routine_user_active_order_idx",
            ),
        ),

        # ── Task ──
        migrations.AddIndex(
            model_name="task",
            index=models.Index(
                fields=["routine", "is_active", "sort_order"],
                name="task_routine_active_order_idx",
            ),
        ),

        # ── XPTransaction ──
        migrations.AddIndex(
            model_name="xptransaction",
            index=models.Index(
                fields=["user", "amount"],
                name="xp_user_amount_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="xptransaction",
            index=models.Index(
                fields=["user", "created_at"],
                name="xp_user_created_idx",
            ),
        ),
    ]
