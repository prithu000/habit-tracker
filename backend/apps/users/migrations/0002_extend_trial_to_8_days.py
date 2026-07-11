# Generated migration for extending trial from 7 to 8 days

from django.db import migrations
from datetime import timedelta


def extend_active_trials(apps, schema_editor):
    """
    Extend active trials by 1 day (from 7 to 8 days total).
    Only affects users currently on trial who haven't expired.
    Paid subscriptions and expired trials remain unchanged.
    """
    User = apps.get_model('users', 'User')
    from django.utils import timezone
    
    now = timezone.now()
    
    # Only extend trials that are currently active (not expired)
    active_trial_users = User.objects.filter(
        subscription_status='trial',
        trial_end__gt=now  # Trial hasn't expired yet
    )
    
    updated_count = 0
    for user in active_trial_users:
        # Extend by 1 day
        user.trial_end = user.trial_end + timedelta(days=1)
        user.save(update_fields=['trial_end', 'updated_at'])
        updated_count += 1
    
    print(f"Extended {updated_count} active trial(s) by 1 day")


def reverse_extend_trials(apps, schema_editor):
    """
    Reverse migration: subtract 1 day from trials
    """
    User = apps.get_model('users', 'User')
    from django.utils import timezone
    
    now = timezone.now()
    
    # Only affect trials that are still active
    active_trial_users = User.objects.filter(
        subscription_status='trial',
        trial_end__gt=now
    )
    
    for user in active_trial_users:
        user.trial_end = user.trial_end - timedelta(days=1)
        user.save(update_fields=['trial_end', 'updated_at'])


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),  # Update this to your latest migration
    ]

    operations = [
        migrations.RunPython(extend_active_trials, reverse_extend_trials),
    ]
