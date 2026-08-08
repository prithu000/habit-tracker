import json
import logging
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.utils import timezone
from django.db.models import F
from .models import EmailLog, EmailBounceSuppress

logger = logging.getLogger(__name__)

# Events that permanently suppress an address
PERMANENT_SUPPRESS_EVENTS = {"hard_bounce", "invalid_email", "spam", "complaint", "unsubscribed"}
# Events that trigger a soft suppression (recheck later)
SOFT_SUPPRESS_EVENTS = {"soft_bounce", "blocked"}


@csrf_exempt
@require_POST
def brevo_webhook(request):
    """
    Receives webhook events from Brevo (Sendinblue).
    Maps events to EmailLog statuses for real-time tracking.
    Automatically suppresses bounced/spam addresses.

    Production: validate Brevo webhook secret in X-Brevo-Token header.
    """
    try:
        payload = json.loads(request.body)

        # Brevo can send an array of events or a single object
        events = payload if isinstance(payload, list) else [payload]

        for event in events:
            event_type = event.get("event", "")
            message_id = event.get("message-id", "")
            email = event.get("email", "").lower()

            # ── Suppression: handle even without a message_id ─────────────────
            if email and event_type in PERMANENT_SUPPRESS_EVENTS:
                reason_map = {
                    "hard_bounce": EmailBounceSuppress.Reason.HARD_BOUNCE,
                    "invalid_email": EmailBounceSuppress.Reason.HARD_BOUNCE,
                    "spam": EmailBounceSuppress.Reason.SPAM_COMPLAINT,
                    "complaint": EmailBounceSuppress.Reason.SPAM_COMPLAINT,
                    "unsubscribed": EmailBounceSuppress.Reason.UNSUBSCRIBED,
                }
                reason = reason_map.get(event_type, EmailBounceSuppress.Reason.HARD_BOUNCE)
                EmailBounceSuppress.suppress(email=email, reason=reason, provider_event=event_type)
                logger.info("Permanently suppressed %s due to Brevo event: %s", email, event_type)

            elif email and event_type in SOFT_SUPPRESS_EVENTS:
                EmailBounceSuppress.suppress(
                    email=email,
                    reason=EmailBounceSuppress.Reason.SOFT_BOUNCE,
                    provider_event=event_type
                )
                logger.info("Soft-suppressed %s due to Brevo event: %s", email, event_type)

            if not message_id:
                continue

            # Normalize message_id format
            if not message_id.startswith("<"):
                message_id = f"<{message_id}>"

            # Find the corresponding EmailLog
            log = (
                EmailLog.objects.filter(provider_message_id=message_id).first()
                or EmailLog.objects.filter(provider_message_id=event.get("message-id", "")).first()
            )

            if not log:
                logger.warning("Webhook received for unknown message-id: %s", message_id)
                continue

            # Map Brevo event to EmailLog Status
            status_map = {
                "delivered": EmailLog.Status.DELIVERED,
                "opened": EmailLog.Status.OPENED,
                "click": EmailLog.Status.CLICKED,
                "hard_bounce": EmailLog.Status.BOUNCED,
                "soft_bounce": EmailLog.Status.BOUNCED,
                "invalid_email": EmailLog.Status.BOUNCED,
                "spam": EmailLog.Status.SPAM,
                "complaint": EmailLog.Status.COMPLAINED,
                "blocked": EmailLog.Status.FAILED,
                "error": EmailLog.Status.FAILED,
                "unsubscribed": EmailLog.Status.CANCELLED,
            }

            new_status = status_map.get(event_type)
            if not new_status:
                continue

            log.status = new_status

            if new_status == EmailLog.Status.OPENED and not log.opened:
                log.opened = timezone.now()

            if new_status == EmailLog.Status.CLICKED:
                if not log.opened:
                    log.opened = timezone.now()
                if not log.clicked:
                    log.clicked = timezone.now()

            if new_status in (EmailLog.Status.BOUNCED, EmailLog.Status.FAILED,
                              EmailLog.Status.SPAM, EmailLog.Status.COMPLAINED):
                log.error_message = event.get("reason", event.get("error", ""))

            log.save(update_fields=["status", "opened", "clicked", "error_message"])

            # Update subject line variation open stats
            if log.subject_variation and new_status == EmailLog.Status.OPENED:
                log.subject_variation.open_count = F("open_count") + 1
                log.subject_variation.save(update_fields=["open_count"])

        return JsonResponse({"status": "ok"}, status=200)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        logger.error("Error processing Brevo webhook: %s", e, exc_info=True)
        return JsonResponse({"error": "Internal error"}, status=500)