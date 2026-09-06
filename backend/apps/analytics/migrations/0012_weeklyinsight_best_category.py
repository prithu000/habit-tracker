"""
Migration: Add best_category to WeeklyInsight, remove best_routine FK.
"""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("analytics", "0011_reportsettings"),
    ]

    operations = [
        # Add the new field
        migrations.AddField(
            model_name="weeklyinsight",
            name="best_category",
            field=models.CharField(
                blank=True,
                default="",
                help_text="Category slug with the highest completion rate this week.",
                max_length=20,
            ),
        ),
        # Remove the old FK
        migrations.RemoveField(
            model_name="weeklyinsight",
            name="best_routine",
        ),
    ]
