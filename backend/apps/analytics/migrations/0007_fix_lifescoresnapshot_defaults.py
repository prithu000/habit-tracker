# Generated manually 2026-07-10
# Critical fix for BUG #1: New user discipline score incorrectly shows 75 instead of 0

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('analytics', '0006_alter_lifescoresnapshot_title'),
    ]

    operations = [
        migrations.AlterField(
            model_name='lifescoresnapshot',
            name='fitness_score',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='lifescoresnapshot',
            name='learning_score',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='lifescoresnapshot',
            name='work_score',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='lifescoresnapshot',
            name='mental_health_score',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='lifescoresnapshot',
            name='health_score',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='lifescoresnapshot',
            name='sleep_score',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='lifescoresnapshot',
            name='finance_score',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='lifescoresnapshot',
            name='personal_score',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='lifescoresnapshot',
            name='discipline_score',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='lifescoresnapshot',
            name='overall_score',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='lifescoresnapshot',
            name='title',
            field=models.CharField(choices=[('Excellent', 'Excellent'), ('Good', 'Good'), ('Average', 'Average'), ('Poor', 'Poor'), ('Critical', 'Critical'), ('Initializing', 'Initializing'), ('Lost', 'Lost'), ('Improving', 'Improving'), ('Consistent', 'Consistent'), ('Elite', 'Elite'), ('Legend', 'Legend')], default='Initializing', max_length=30),
        ),
        migrations.AlterField(
            model_name='lifescoresnapshot',
            name='ai_analysis',
            field=models.TextField(blank=True, default='Complete your first day to unlock your Personal Operating System analytics.'),
        ),
    ]
