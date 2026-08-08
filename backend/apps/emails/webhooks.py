import json
import logging
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.utils import timezone
from django.db.models import F
from .models import EmailLog

logger = logging.getLogger(__name__)

@csrf_exempt
@require_POST
def brevo_webhook(request):
    """
    Receives webhook events from Brevo (Sendinblue).
    Maps events to EmailLog statuses for real-time tracking.
    """
    # NOTE: In production, we should validate Brevo IPs and/or a query secret
    
    try:
        payload = json.loads(request.body)
        
        # Brevo can send an array of events or a single object
        events = payload if isinstance(payload, list) else [payload]
        
        for event in events:
            event_type = event.get('event')
            message_id = event.get('message-id')
            email = event.get('email')
            
            if not message_id:
                # Sometimes Brevo might send events without message-id, try to use tags or ignore
                continue
                
            # Clean message_id if Brevo stripped brackets
            if not message_id.startswith('<'):
                message_id = f'<{message_id}>'
                
            # Find the corresponding EmailLog
            log = EmailLog.objects.filter(provider_message_id=message_id).first()
            if not log:
                # Fallback: maybe Brevo didn't strip brackets, or they did, so let's try exact match without brackets
                raw_message_id = event.get('message-id')
                log = EmailLog.objects.filter(provider_message_id=raw_message_id).first()
                
            if not log:
                logger.warning(f"Webhook received for unknown message-id: {message_id}")
                continue
                
            # Map Brevo event to EmailLog Status
            # Brevo events: request, delivered, opened, click, soft_bounce, hard_bounce, invalid_email, spam, deferred, blocked, unsubscribed
            status_map = {
                'delivered': EmailLog.Status.DELIVERED,
                'opened': EmailLog.Status.OPENED,
                'click': EmailLog.Status.CLICKED,
                'hard_bounce': EmailLog.Status.BOUNCED,
                'soft_bounce': EmailLog.Status.BOUNCED,
                'invalid_email': EmailLog.Status.BOUNCED,
                'spam': EmailLog.Status.SPAM,
                'complaint': EmailLog.Status.COMPLAINED,
                'blocked': EmailLog.Status.FAILED,
                'error': EmailLog.Status.FAILED,
            }
            
            new_status = status_map.get(event_type)
            if new_status:
                log.status = new_status
                
                if new_status == EmailLog.Status.OPENED and not log.opened:
                    log.opened = timezone.now()
                    
                if new_status == EmailLog.Status.CLICKED and not log.clicked:
                    # They must have opened it if they clicked it
                    if not log.opened:
                        log.opened = timezone.now()
                    log.clicked = timezone.now()
                    
                if new_status in (EmailLog.Status.BOUNCED, EmailLog.Status.FAILED, EmailLog.Status.SPAM):
                    log.error_message = event.get('reason', '')
                    
                log.save(update_fields=['status', 'opened', 'clicked', 'error_message'])
                
                # Update aggregate subject line variation stats
                if log.subject_variation:
                    variation = log.subject_variation
                    if new_status == EmailLog.Status.OPENED:
                        variation.open_count = F('open_count') + 1
                        variation.save(update_fields=['open_count'])
                        
        return JsonResponse({"status": "success"}, status=200)
        
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        logger.error(f"Error processing Brevo webhook: {e}")
        return JsonResponse({"error": str(e)}, status=500)
