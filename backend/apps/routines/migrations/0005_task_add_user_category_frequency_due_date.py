"""
Migration 0005 — Schema: add user FK, category, frequency, due_date to Task.

The user FK is nullable=True so that migration 0006 can backfill it.
Migration 0007 will make it NOT NULL after the backfill and after Routine is dropped.
"""
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("routines", "0004_routine_deleted_at_routine_is_deleted"),
    ]

    operations = [
        # 1. Add direct user FK (nullable initially — backfilled in 0006)
        migrations.AddField(
            model_name="task",
            name="user",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="tasks",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        # 2. Add category
        migrations.AddField(
            model_name="task",
            name="category",
            field=models.CharField(
                choices=[
                    ("fitness",       "Fitness"),
                    ("learning",      "Learning"),
                    ("work",          "Work"),
                    ("mental_health", "Mental Health"),
                    ("health",        "Health"),
                    ("sleep",         "Sleep"),
                    ("finance",       "Finance"),
                    ("personal",      "Personal"),
                    ("discipline",    "Discipline"),
                ],
                default="personal",
                max_length=20,
            ),
        ),
        # 3. Add frequency
        migrations.AddField(
            model_name="task",
            name="frequency",
            field=models.CharField(
                choices=[
                    ("daily",   "Daily"),
                    ("weekly",  "Weekly"),
                    ("anytime", "Anytime"),
                ],
                default="daily",
                max_length=10,
            ),
        ),
        # 4. Add due_date
        migrations.AddField(
            model_name="task",
            name="due_date",
            field=models.DateField(blank=True, null=True),
        ),
        # 5. Add indexes for the new user-scoped columns
        migrations.AddIndex(
            model_name="task",
            index=models.Index(
                fields=["user", "category", "is_active"],
                name="routines_task_user_cat_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="task",
            index=models.Index(
                fields=["user", "frequency", "is_active"],
                name="routines_task_user_freq_idx",
            ),
        ),
    ]
