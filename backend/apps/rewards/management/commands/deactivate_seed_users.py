"""
Management command to deactivate or delete seed users from the Arena leaderboard.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = "Deactivate (show_on_leaderboard=False) or delete all is_seed=True accounts"

    def add_arguments(self, parser):
        parser.add_argument(
            "--delete",
            action="store_true",
            help="Permanently delete all is_seed=True accounts instead of just hiding them",
        )
        parser.add_argument(
            "--reactivate",
            action="store_true",
            help="Re-enable visibility (show_on_leaderboard=True) for seed accounts",
        )

    def handle(self, *args, **options):
        delete = options["delete"]
        reactivate = options["reactivate"]

        seed_qs = User.objects.filter(is_seed=True)
        total_seed = seed_qs.count()

        if total_seed == 0:
            self.stdout.write(self.style.WARNING("No seed accounts (is_seed=True) found."))
            return

        if delete:
            deleted_count, _ = seed_qs.delete()
            self.stdout.write(
                self.style.SUCCESS(f"Permanently deleted {deleted_count} seed user account(s).")
            )
        elif reactivate:
            updated_count = seed_qs.update(show_on_leaderboard=True)
            self.stdout.write(
                self.style.SUCCESS(
                    f"Re-enabled show_on_leaderboard=True for {updated_count} seed user account(s)."
                )
            )
        else:
            updated_count = seed_qs.update(show_on_leaderboard=False)
            self.stdout.write(
                self.style.SUCCESS(
                    f"Set show_on_leaderboard=False for {updated_count} seed user account(s). "
                    "They are now excluded from the public leaderboard without being deleted."
                )
            )
