"""
Management command to seed realistic arena leaderboard participants.
Uses Faker('en_IN') to generate realistic Indian names and staggers
lifetime XP along a realistic achievement curve.
"""
import random
import re
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from faker import Faker
from services.xp_service import XPService

User = get_user_model()


class Command(BaseCommand):
    help = "Seed realistic fake users for the Arena leaderboard with staggered lifetime XP"

    def add_arguments(self, parser):
        parser.add_argument(
            "--count",
            type=int,
            default=35,
            help="Number of seed users to create (default: 35)",
        )
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete all existing seed users before seeding",
        )

    def handle(self, *args, **options):
        count = options["count"]
        clear = options["clear"]

        if clear:
            deleted, _ = User.objects.filter(is_seed=True).delete()
            self.stdout.write(self.style.WARNING(f"Cleared {deleted} existing seed user(s)."))

        fake = Faker("en_IN")

        # Generate a realistic, staggered XP curve for 'count' users
        # 1st place: ~48,000 - 75,000 XP
        # Top 2-5: ~18,000 - 45,000 XP
        # Top 6-15: ~5,000 - 17,000 XP
        # Rest: ~400 - 4,500 XP
        xp_distribution = []
        for i in range(count):
            if i == 0:
                xp = random.randint(48000, 68000)
            elif i < 5:
                # Rank 2 to 5
                xp = random.randint(18000, 42000)
            elif i < 15:
                # Mid tier
                xp = random.randint(5500, 16500)
            else:
                # Long tail
                xp = random.randint(350, 4800)
            xp_distribution.append(xp)

        # Sort descending so top users are created with consistent ranks
        xp_distribution.sort(reverse=True)

        created_count = 0
        existing_emails = set(User.objects.values_list("email", flat=True))
        existing_usernames = set(User.objects.values_list("username", flat=True))

        for i in range(count):
            # Generate person name
            full_name = fake.name()
            # Clean name for username slug
            clean_name = re.sub(r"[^a-zA-Z0-9]", "", full_name.lower())
            if not clean_name:
                clean_name = f"warrior{random.randint(100, 9999)}"

            username = f"{clean_name[:12]}_{random.randint(10, 999)}"
            while username in existing_usernames:
                username = f"{clean_name[:10]}_{random.randint(1000, 99999)}"
            existing_usernames.add(username)

            email = f"seed_{username}@youvsyou.internal"
            while email in existing_emails:
                email = f"seed_{username}_{random.randint(100, 999)}@youvsyou.internal"
            existing_emails.add(email)

            xp = xp_distribution[i]
            level = XPService.calculate_level(xp)

            user = User.objects.create(
                email=email,
                username=username,
                display_name=full_name,
                total_xp=xp,
                current_level=level,
                is_seed=True,
                show_on_leaderboard=True,
                onboarding_completed=True,
                is_active=True,
            )
            # Set unguessable dummy password
            user.set_unusable_password()
            user.save()
            created_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully seeded {created_count} Arena participants (is_seed=True, show_on_leaderboard=True)."
            )
        )
