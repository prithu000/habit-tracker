import logging
from typing import Optional
from django.conf import settings
from .models import EmailLog, EmailIdempotency, EmailBounceSuppress
from .tasks import send_email_task

logger = logging.getLogger(__name__)

FRONTEND_URL = "https://youvsyou.site"


class EmailService:
    """
    Central interface for all outgoing emails.
    All email sending in the application MUST go through this class.
    Enforces: idempotency, bounce suppression, Celery queuing.
    """

    @classmethod
    def send_email_async(
        cls,
        recipient: str,
        subject: str,
        template_name: str,
        context: dict,
        idempotency_key: Optional[str] = None,
        attachments: Optional[list] = None,
        segment: str = ""
    ) -> bool:
        """
        Queues an email for async delivery via Celery.
        Returns False if recipient is suppressed or idempotency key exists.
        """
        # Bounce / Spam suppression check
        if EmailBounceSuppress.is_suppressed(recipient):
            logger.warning(
                "Email suppressed for %s (bounce/spam/unsubscribe). Template: %s skipped.",
                recipient, template_name
            )
            return False

        # Idempotency check
        if idempotency_key:
            if EmailIdempotency.objects.filter(idempotency_key=idempotency_key).exists():
                logger.info(
                    "Email already queued/sent for idempotency key %s. Skipping.", idempotency_key
                )
                return False

        # Create log record
        email_log = EmailLog.objects.create(
            recipient=recipient,
            template=template_name,
            subject=subject,
            status=EmailLog.Status.QUEUED,
            segment=segment
        )

        # Create idempotency lock
        if idempotency_key:
            EmailIdempotency.objects.create(
                idempotency_key=idempotency_key,
                email_log=email_log
            )

        # Dispatch to Celery
        send_email_task.delay(
            email_log_id=str(email_log.id),
            context=context,
            attachments=attachments
        )
        return True

    @classmethod
    def send_email(cls, user, subject: str, template_name: str, context: dict,
                   idempotency_key: Optional[str] = None) -> bool:
        """Backwards-compatible wrapper accepting a user object or email string."""
        recipient = getattr(user, "email", str(user))
        return cls.send_email_async(
            recipient=recipient, subject=subject, template_name=template_name,
            context=context, idempotency_key=idempotency_key
        )

    # ── Transactional Wrappers ────────────────────────────────────────────────

    @classmethod
    def send_welcome_email(cls, user) -> bool:
        return cls.send_email_async(
            recipient=user.email,
            subject="Welcome to YOU VS YOU",
            template_name="welcome",
            context={
                "user_name": getattr(user, "display_name", None) or "User",
                "app_url": getattr(settings, "FRONTEND_URL", FRONTEND_URL),
            },
            segment="welcome"
        )

    @classmethod
    def send_email_verification(cls, user, verification_link: str) -> bool:
        return cls.send_email_async(
            recipient=user.email,
            subject="Verify Your Email -- YOU VS YOU",
            template_name="email_verification",
            context={
                "user_name": getattr(user, "display_name", None) or "User",
                "verification_link": verification_link,
            },
            segment="auth"
        )

    @classmethod
    def send_password_reset(cls, user, reset_link: str) -> bool:
        return cls.send_email_async(
            recipient=user.email,
            subject="Password Reset Request -- YOU VS YOU",
            template_name="password_reset",
            context={
                "user_name": getattr(user, "display_name", None) or "User",
                "reset_link": reset_link,
            },
            segment="auth"
        )

    @classmethod
    def send_payment_success(cls, user, invoice: Optional[dict] = None) -> bool:
        invoice = invoice or {}
        return cls.send_email_async(
            recipient=user.email,
            subject="Payment Successful -- YOU VS YOU",
            template_name="payment_success",
            context={
                "user_name": getattr(user, "display_name", None) or "User",
                "amount": invoice.get("amount_paid", 0) / 100,
                "currency": invoice.get("currency", "inr").upper(),
                "invoice_pdf": invoice.get("invoice_pdf", "#"),
                "app_url": getattr(settings, "FRONTEND_URL", FRONTEND_URL),
            },
            segment="billing"
        )

    @classmethod
    def send_payment_failed(cls, user, reason: str = "") -> bool:
        return cls.send_email_async(
            recipient=user.email,
            subject="Payment Failed -- Action Required",
            template_name="payment_failed",
            context={
                "user_name": getattr(user, "display_name", None) or "User",
                "reason": reason or "Your payment could not be processed.",
                "app_url": getattr(settings, "FRONTEND_URL", FRONTEND_URL),
            },
            segment="billing"
        )

    @classmethod
    def send_subscription_activated(cls, user) -> bool:
        return cls.send_email_async(
            recipient=user.email,
            subject="You Are Now Premium -- Welcome to the Arena",
            template_name="subscription_activated",
            context={
                "user_name": getattr(user, "display_name", None) or "User",
                "plan_name": getattr(user, "plan_type", "Premium"),
                "app_url": getattr(settings, "FRONTEND_URL", FRONTEND_URL),
            },
            segment="billing"
        )

    @classmethod
    def send_subscription_expiring(cls, user, days_remaining: int = 3) -> bool:
        return cls.send_email_async(
            recipient=user.email,
            subject=f"Your Subscription Expires in {days_remaining} Days",
            template_name="subscription_expiring",
            context={
                "user_name": getattr(user, "display_name", None) or "User",
                "days_remaining": days_remaining,
                "app_url": getattr(settings, "FRONTEND_URL", FRONTEND_URL),
            },
            segment="billing"
        )

    @classmethod
    def send_subscription_expired(cls, user) -> bool:
        return cls.send_email_async(
            recipient=user.email,
            subject="Your Subscription Has Ended -- Come Back Anytime",
            template_name="subscription_expired",
            context={
                "user_name": getattr(user, "display_name", None) or "User",
                "app_url": getattr(settings, "FRONTEND_URL", FRONTEND_URL),
            },
            segment="billing"
        )