from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.emails.services import EmailService
import uuid
import time

User = get_user_model()

class Command(BaseCommand):
    help = "Sends all email templates to a test address."

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            default='prithuyoyo2003@gmail.com',
            help='Target email address'
        )

    def handle(self, *args, **options):
        target_email = options['email']
        self.stdout.write(self.style.WARNING(f"--- Starting SES Email Template Test for {target_email} ---"))
        
        user, _ = User.objects.get_or_create(
            email=target_email,
            defaults={"username": f"test_ses_{uuid.uuid4().hex[:8]}", "is_active": True, "display_name": "Test User"}
        )
        # Ensure email is updated if user existed
        if user.email != target_email:
            user.email = target_email
            user.save()

        templates_to_test = [
            ("Welcome to YOU VS YOU", "welcome"),
            ("Verify Your Email", "email_verification"),
            ("Password Reset", "password_reset"),
            ("Morning Motivation", "daily_morning"),
            ("Evening Reflection", "daily_night"),
            ("We noticed you missed today.", "retention/missed_1_day"),
            ("Your future self is waiting.", "retention/missed_2_days"),
            ("Return to the Arena.", "retention/missed_3_days"),
            ("Your streak can still be rebuilt.", "retention/missed_5_days"),
            ("Don't let your identity disappear.", "retention/missed_7_days"),
            ("You started for a reason.", "retention/missed_14_days"),
            ("Come back. Start again.", "retention/missed_30_days"),
            ("Weekly Report", "weekly_report"),
            ("Monthly Report", "monthly_report"),
            ("Subscription Activated", "subscription_activated"),
            ("Subscription Expiring", "subscription_expiring"),
            ("Subscription Expired", "subscription_expired"),
            ("Payment Success", "payment_success"),
            ("Payment Failed", "payment_failed"),
        ]

        context = {
            'user_name': user.display_name,
            'quote': 'Do not stop when you are tired. Stop when you are done.',
            'completed_tasks': 8,
            'missed_tasks': 2,
            'task_name': 'Deep Work Session',
            'amount': '$9.99',
            'invoice_number': 'INV-123456',
            'days_left': 3,
            'reset_url': 'https://youvsyou.site/reset?token=test',
            'verify_url': 'https://youvsyou.site/verify?token=test',
            'app_url': 'https://youvsyou.site',
            'settings_url': 'https://youvsyou.site/settings',
            'unsubscribe_url': 'https://youvsyou.site/unsubscribe',
        }

        success_count = 0
        start_time = time.time()
        
        for subject, template in templates_to_test:
            key = f"test_{template}_{uuid.uuid4()}"
            self.stdout.write(f"Queueing [{template}]...")
            result = EmailService.send_email_async(
                recipient=user.email,
                subject=subject,
                template_name=template,
                context=context,
                idempotency_key=key
            )
            if result:
                success_count += 1
                self.stdout.write(self.style.SUCCESS(f" -> Queued successfully."))
            else:
                self.stdout.write(self.style.ERROR(f" -> FAILED to queue."))
                
        duration = time.time() - start_time
        self.stdout.write(self.style.SUCCESS(f"\nCompleted: {success_count}/{len(templates_to_test)} emails queued in {duration:.2f} seconds."))
        self.stdout.write("Note: Check the Celery worker logs to see actual SES SMTP delivery statuses and Message-IDs.")
