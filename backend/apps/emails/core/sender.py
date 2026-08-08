import logging
import uuid
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.utils import timezone
from email.utils import formatdate
from apps.emails.models import EmailLog
from .tracking import EmailTracker

logger = logging.getLogger(__name__)

class EmailSender:
    """
    Responsible for actually dispatching the email via SMTP/API.
    """

    @staticmethod
    def send(email_log: EmailLog, html_content: str, text_content: str, attachments: list = None) -> bool:
        """
        Sends the email and updates the EmailLog status.
        """
        try:
            # Append tracking pixel to HTML content
            pixel_url = EmailTracker.get_pixel_url(email_log.id)
            tracking_img = f'<img src="{pixel_url}" width="1" height="1" alt="" style="display:none;" />'
            if "</body>" in html_content:
                html_content = html_content.replace("</body>", f"{tracking_img}\n</body>")
            else:
                html_content += tracking_img

            # Generate Message-ID and Date
            domain = settings.DEFAULT_FROM_EMAIL.split("@")[-1].replace(">", "")
            message_id = f"<{uuid.uuid4()}@{domain}>"
            date_str = formatdate(localtime=False)

            # Extra headers for deliverability (SES/Brevo)
            frontend_url = getattr(settings, "FRONTEND_URL", "https://youvsyou.site")
            headers = {
                "Message-ID": message_id,
                "Date": date_str,
                "Auto-Submitted": "auto-generated",
                "Precedence": "bulk",
                "Feedback-ID": f"transactional:youvsyou:{email_log.template}",
                "X-Mailer": "YOU VS YOU Engine",
                "List-Unsubscribe": f"<{frontend_url}/unsubscribe>",
                "X-Entity-Ref-ID": str(email_log.id),
            }

            # Create email
            email_msg = EmailMultiAlternatives(
                subject=email_log.subject,
                body=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[email_log.recipient],
                reply_to=[settings.DEFAULT_FROM_EMAIL],
                headers=headers
            )
            email_msg.attach_alternative(html_content, "text/html")

            # Handle attachments
            if attachments:
                for attachment in attachments:
                    email_msg.attach(attachment['filename'], attachment['content'], attachment['mimetype'])

            # Send it
            email_msg.send(fail_silently=False)
            
            # Update Log
            email_log.status = EmailLog.Status.SENT
            email_log.sent_at = timezone.now()
            email_log.provider_message_id = message_id
            email_log.save(update_fields=['status', 'sent_at', 'provider_message_id'])
            
            logger.info(f"✅ Successfully sent '{email_log.template}' email to {email_log.recipient}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to send email {email_log.id}: {e}")
            email_log.status = EmailLog.Status.FAILED
            email_log.error_message = str(e)
            email_log.save(update_fields=['status', 'error_message'])
            raise e
