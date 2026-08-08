import logging
from celery import shared_task
from apps.emails.models import EmailLog
from apps.emails.core import EmailBuilder, EmailSender

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3, name="apps.emails.tasks.send_email_task")
def send_email_task(self, email_log_id: int, context: dict, attachments: list = None):
    """
    Renders and sends the email using the core architecture.
    """
    try:
        log = EmailLog.objects.get(id=email_log_id)
    except EmailLog.DoesNotExist:
        logger.error(f"EmailLog {email_log_id} not found.")
        return

    if log.status not in [EmailLog.Status.QUEUED, EmailLog.Status.RETRYING]:
        logger.info(f"EmailLog {email_log_id} is already in state {log.status}. Skipping.")
        return

    try:
        # 1. Build Content
        content = EmailBuilder.build_content(log.template, context)
        
        # Save HTML payload for admin debugging and true resends
        log.html_content = content["html"]
        log.save(update_fields=['html_content'])

        # 2. Send Email
        EmailSender.send(
            email_log=log,
            html_content=content["html"],
            text_content=content["text"],
            attachments=attachments
        )

    except Exception as e:
        logger.error(f"Failed to process email {email_log_id}: {str(e)}")
        # Sender will have marked it FAILED. We re-mark it RETRYING before queueing again if we have retries.
        if self.request.retries < self.max_retries:
            log.status = EmailLog.Status.RETRYING
            log.save(update_fields=['status'])
            
            # Exponential backoff: 60s, 300s, 1500s
            self.retry(exc=e, countdown=60 * (5 ** self.request.retries))
        else:
            logger.error(f"Max retries exceeded for email {email_log_id}")
