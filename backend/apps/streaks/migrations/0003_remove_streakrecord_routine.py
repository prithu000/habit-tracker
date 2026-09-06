"""
Migration 0003: Remove per-routine streaks and routine FK from StreakRecord.
"""
from django.db import migrations, models


def delete_per_routine_streaks(apps, schema_editor):
    StreakRecord = apps.get_model("streaks", "StreakRecord")
    deleted, _ = StreakRecord.objects.filter(routine__isnull=False).delete()
    if deleted:
        import logging
        logging.getLogger(__name__).info("Migration 0003: deleted %d per-routine StreakRecords", deleted)


class Migration(migrations.Migration):

    dependencies = [
        ("streaks", "0002_initial"),
        ("routines", "0006_data_migrate_routine_to_task"),
    ]

    operations = [
        # 1. Delete per-routine streak rows
        migrations.RunPython(delete_per_routine_streaks, migrations.RunPython.noop),

        # 2. Remove old compound index
        migrations.RemoveIndex(
            model_name="streakrecord",
            name="streaks_str_user_id_88eb4a_idx",
        ),

        # 3. Alter unique together to user only
        migrations.AlterUniqueTogether(
            name="streakrecord",
            unique_together={("user",)},
        ),

        # 4. Remove routine FK
        migrations.RemoveField(
            model_name="streakrecord",
            name="routine",
        ),

        # 5. Add user-only index
        migrations.AddIndex(
            model_name="streakrecord",
            index=models.Index(fields=["user"], name="streaks_str_user_id_idx"),
        ),
    ]
