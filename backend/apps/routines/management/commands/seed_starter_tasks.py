from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.routines.services.starter_tasks import seed_starter_tasks_for_user

User = get_user_model()

class Command(BaseCommand):
    help = "Seed baseline starter tasks across all routine categories for users who have none (or all users with --force)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--force",
            action="store_true",
            help="Force seeding starter tasks even if the user already has tasks.",
        )
        parser.add_argument(
            "--email",
            type=str,
            help="Seed starter tasks only for a specific user email.",
        )

    def handle(self, *args, **options):
        force = options.get("force", False)
        email = options.get("email")

        qs = User.objects.filter(is_active=True)
        if email:
            qs = qs.filter(email=email)

        total = qs.count()
        self.stdout.write(f"Evaluating {total} user(s)...")

        seeded_users = 0
        total_tasks = 0

        for user in qs:
            tasks = seed_starter_tasks_for_user(user, force=force)
            if tasks:
                seeded_users += 1
                total_tasks += len(tasks)
                self.stdout.write(f"  + Seeded {len(tasks)} tasks for {user.email}")

        self.stdout.write(
            self.style.SUCCESS(
                f"Done! Seeded {total_tasks} starter tasks across {seeded_users} user(s)."
            )
        )
