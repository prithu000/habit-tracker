from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()

class Command(BaseCommand):
    help = "Safely migrates all TRIAL users to FREE. ACTIVE paid users remain untouched."

    def handle(self, *args, **options):
        self.stdout.write("Starting migration to Freemium model...")

        with transaction.atomic():
            # Get all users with TRIAL status
            trial_users = User.objects.filter(subscription_status="trial")
            count = trial_users.count()

            self.stdout.write(f"Found {count} users on TRIAL status.")

            # Bulk update
            updated = trial_users.update(
                subscription_status="free",
                plan_type="free",
                plan_name="Free Plan"
            )

            self.stdout.write(self.style.SUCCESS(f"Successfully converted {updated} users to FREE."))

            # Ensure we don't accidentally touch ACTIVE or CANCELLED users that have active premium
            active_users = User.objects.filter(subscription_status="active").count()
            self.stdout.write(self.style.SUCCESS(f"Untouched: {active_users} ACTIVE users."))
            
            expired_users = User.objects.filter(subscription_status="expired").count()
            self.stdout.write(self.style.SUCCESS(f"Untouched: {expired_users} EXPIRED users."))

        self.stdout.write(self.style.SUCCESS("Migration complete!"))
