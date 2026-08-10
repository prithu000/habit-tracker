import time
import logging
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Exists, OuterRef
from apps.emails.services import EmailService
from apps.emails.models import EmailBounceSuppress, EmailIdempotency

logger = logging.getLogger(__name__)
User = get_user_model()

class Command(BaseCommand):
    help = "Sends the Price Drop marketing campaign to eligible active users."

    def add_arguments(self, parser):
        parser.add_argument(
            "--campaign-id",
            type=str,
            default="price_drop_v1",
            help="Unique campaign identifier for idempotency."
        )
        parser.add_argument(
            "--segment",
            type=str,
            default="price_drop",
            help="Segment tag for analytics."
        )
        parser.add_argument(
            "--limit",
            type=int,
            default=0,
            help="Maximum number of users to process. 0 for no limit."
        )
        parser.add_argument(
            "--batch-size",
            type=int,
            default=100,
            help="Number of users to process per batch."
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Perform a dry run without actually queuing any emails."
        )

    def handle(self, *args, **options):
        campaign_id = options["campaign_id"]
        segment = options["segment"]
        limit = options["limit"]
        batch_size = options["batch_size"]
        is_dry_run = options["dry_run"]

        self.stdout.write(f"--- PREPARING CAMPAIGN: {campaign_id} ---")
        if is_dry_run:
            self.stdout.write(self.style.WARNING("!!! DRY RUN MODE ACTIVE !!! No emails will be queued."))

        # 1. Base Query: Active users with an email
        base_qs = User.objects.filter(is_active=True).exclude(email__exact="")
        total_active = base_qs.count()

        # 2. Get suppressed emails
        suppressed_emails = set(EmailBounceSuppress.objects.values_list("email", flat=True))

        # 3. Get already sent user IDs based on idempotency keys
        idempotency_qs = EmailIdempotency.objects.filter(
            idempotency_key__startswith=f"{campaign_id}:"
        ).values_list("idempotency_key", flat=True)
        
        already_sent_user_ids = set()
        for key in idempotency_qs:
            try:
                # Key format: campaign_id:user_id
                user_id_str = key.split(":")[-1]
                already_sent_user_ids.add(user_id_str)
            except Exception:
                pass

        # 4. Filter users
        eligible_qs = base_qs.exclude(email__in=suppressed_emails).exclude(id__in=already_sent_user_ids)
        
        total_eligible = eligible_qs.count()
        total_suppressed = len(suppressed_emails)
        total_already_sent = len(already_sent_user_ids)

        if limit > 0:
            eligible_qs = eligible_qs[:limit]
            total_eligible = eligible_qs.count()

        self.stdout.write(self.style.SUCCESS(f"Total Active Users: {total_active}"))
        self.stdout.write(self.style.WARNING(f"Suppressed Users (Global): {total_suppressed}"))
        self.stdout.write(self.style.WARNING(f"Users Already Sent (Campaign {campaign_id}): {total_already_sent}"))
        self.stdout.write(self.style.SUCCESS(f"Final Eligible Recipients: {total_eligible}"))

        if total_eligible == 0:
            self.stdout.write("No eligible users found. Exiting.")
            return

        if is_dry_run:
            self.stdout.write(self.style.WARNING("Dry run complete. Exiting without queuing."))
            return

        # 5. Process in batches
        queued = 0
        skipped = 0
        errors = 0

        self.stdout.write(f"Beginning queue dispatch in batches of {batch_size}...")

        # We evaluate the queryset ID list to safely iterate in chunks without offset issues if the DB changes
        eligible_user_ids = list(eligible_qs.values_list("id", flat=True))

        for i in range(0, len(eligible_user_ids), batch_size):
            batch_ids = eligible_user_ids[i:i + batch_size]
            batch_users = User.objects.filter(id__in=batch_ids)

            for user in batch_users:
                try:
                    success = EmailService.send_price_drop_email(
                        user=user,
                        campaign_id=campaign_id
                    )
                    if success:
                        queued += 1
                    else:
                        skipped += 1
                except Exception as e:
                    logger.error(f"Failed to queue price drop email for user {user.id}: {e}")
                    errors += 1

            self.stdout.write(f"Processed {min(i + batch_size, len(eligible_user_ids))} / {len(eligible_user_ids)}...")
            
            # Small delay to prevent hammering Redis/Celery excessively
            time.sleep(0.1)

        self.stdout.write(self.style.SUCCESS("--- CAMPAIGN DISPATCH COMPLETE ---"))
        self.stdout.write(f"Queued: {queued}")
        self.stdout.write(f"Skipped/Suppressed internally: {skipped}")
        self.stdout.write(f"Errors: {errors}")
