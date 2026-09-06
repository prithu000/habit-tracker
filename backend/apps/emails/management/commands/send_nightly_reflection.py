from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.emails.scheduler import send_evening_reflection_to_user

User = get_user_model()

class Command(BaseCommand):
    help = "Dispatch the 10 PM nightly consistency reflection email to all users (or a specific user via --email)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--email",
            type=str,
            help="Send only to this specific user email.",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Simulate and print details without dispatching email.",
        )

    def handle(self, *args, **options):
        email = options.get("email")
        dry_run = options.get("dry_run", False)

        qs = User.objects.filter(is_active=True)
        if email:
            qs = qs.filter(email=email)

        total = qs.count()
        self.stdout.write(f"Evaluating {total} user(s) for Nightly 10 PM Reflection...")

        dispatched = 0
        for user in qs:
            if dry_run:
                self.stdout.write(f"[DRY-RUN] Would send nightly consistency email to {user.email}")
                dispatched += 1
            else:
                success = send_evening_reflection_to_user(user)
                if success:
                    dispatched += 1
                    self.stdout.write(self.style.SUCCESS(f"  ✓ Dispatched nightly reflection to {user.email}"))
                else:
                    self.stdout.write(self.style.WARNING(f"  ! Skipped or failed for {user.email}"))

        self.stdout.write(
            self.style.SUCCESS(
                f"Completed. Dispatched nightly reflection to {dispatched} user(s)."
            )
        )
