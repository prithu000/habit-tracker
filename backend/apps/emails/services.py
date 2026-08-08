import logging
import uuid
from typing import Optional
from django.conf import settings
from .models import EmailLog, EmailIdempotency
from .tasks import send_email_task

logger = logging.getLogger(__name__)

class EmailService:
    """
    Central interface for all outgoing emails.
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
        Queues an email for asynchronous delivery via Celery.
        """
        # Idempotency check
        if idempotency_key:
            if EmailIdempotency.objects.filter(idempotency_key=idempotency_key).exists():
                logger.info(f"Email already queued or sent for key {idempotency_key}. Skipping.")
                return False

        # Create log record
        email_log = EmailLog.objects.create(
            recipient=recipient,
            template=template_name,
            subject=subject,
            status=EmailLog.Status.QUEUED,
            segment=segment
        )

        # Create idempotency lock if provided
        if idempotency_key:
            EmailIdempotency.objects.create(
                idempotency_key=idempotency_key,
                email_log=email_log
            )

        # Dispatch Celery Task
        # context must be JSON serializable
        # We pass attachments as a list of dicts (needs to be serializable, meaning b64 encoded content if binary)
        send_email_task.delay(email_log_id=email_log.id, context=context, attachments=attachments)

        return True
        
    @classmethod
    def send_email(
        cls, 
        user, 
        subject: str, 
        template_name: str, 
        context: dict, 
        idempotency_key: Optional[str] = None
    ) -> bool:
        """
        Convenience wrapper for backwards compatibility with tests and old views.
        Usually passes a `user` object instead of a string recipient.
        """
        recipient = getattr(user, 'email', str(user))
        return cls.send_email_async(
            recipient=recipient,
            subject=subject,
            template_name=template_name,
            context=context,
            idempotency_key=idempotency_key
        )

    @classmethod
    def send_welcome_email(cls, user) -> bool:
        """Sends the initial welcome onboarding email."""
        context = {
            "user_name": getattr(user, 'display_name', 'User'),
            "app_url": getattr(settings, "FRONTEND_URL", "https://youvsyou.site"),
        }
        return cls.send_email_async(
            recipient=user.email,
            subject="Welcome to YOU VS YOU",
            template_name="welcome",
            context=context,
            segment="welcome"
        )
        
    @classmethod
    def send_email_verification(cls, user, verification_link: str) -> bool:
        context = {
            "user_name": getattr(user, 'display_name', 'User'),
            "verification_link": verification_link
        }
        return cls.send_email_async(
            recipient=user.email,
            subject="Verify Your Email",
            template_name="email_verification",
            context=context,
            segment="auth"
        )
        
    @classmethod
    def send_password_reset(cls, user, reset_link: str) -> bool:
        context = {
            "user_name": getattr(user, 'display_name', 'User'),
            "reset_link": reset_link
        }
        return cls.send_email_async(
            recipient=user.email,
            subject="Password Reset Request",
            template_name="password_reset",
            context=context,
            segment="auth"
        )
        
    @classmethod
    def send_payment_success(cls, user, invoice: dict = None) -> bool:
        context = {
            "user_name": getattr(user, 'display_name', 'User'),
            "amount": invoice.get('amount_paid', 0) / 100 if invoice else 0,
            "currency": invoice.get('currency', 'usd').upper() if invoice else "USD",
            "invoice_pdf": invoice.get('invoice_pdf', '#') if invoice else "#"
        }
        return cls.send_email_async(
            recipient=user.email,
            subject="Payment Successful - YOU VS YOU",
            template_name="payment_success",
            context=context,
            segment="billing"
        )
        
    @classmethod
    def send_subscription_activated(cls, user) -> bool:
        context = {
            "user_name": getattr(user, 'display_name', 'User'),
            "plan_name": getattr(user, 'plan_type', 'Premium'),
            "app_url": getattr(settings, "FRONTEND_URL", "https://youvsyou.site"),
        }
        return cls.send_email_async(
            recipient=user.email,
            subject="Welcome to Premium - Subscription Activated",
            template_name="subscription_activated",
            context=context,
            segment="billing"
        )
