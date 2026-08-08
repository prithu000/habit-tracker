import logging
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.views import View
from django.utils import timezone
from .models import EmailLog

logger = logging.getLogger(__name__)

class TrackOpenView(View):
    """
    Returns a 1x1 transparent GIF and marks the email as opened.
    """
    def get(self, request, log_id):
        try:
            log = EmailLog.objects.get(id=log_id)
            if not log.opened:
                log.opened = timezone.now()
                log.status = EmailLog.Status.OPENED
                log.save(update_fields=['opened', 'status'])
        except EmailLog.DoesNotExist:
            pass

        # 1x1 transparent GIF
        pixel_data = b'GIF89a\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;'
        return HttpResponse(pixel_data, content_type='image/gif')

class TrackClickView(View):
    """
    Marks the email as clicked and redirects to the original URL.
    """
    def get(self, request, log_id):
        url = request.GET.get('url')
        if not url:
            raise Http404("Missing redirect URL")
            
        try:
            log = EmailLog.objects.get(id=log_id)
            if not log.clicked:
                log.clicked = timezone.now()
                # Status precedence: CLICKED > OPENED
                log.status = EmailLog.Status.CLICKED
                log.save(update_fields=['clicked', 'status'])
        except EmailLog.DoesNotExist:
            pass

        return HttpResponseRedirect(url)
