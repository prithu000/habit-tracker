from django.conf import settings
from django.urls import reverse

class EmailTracker:
    """
    Generates tracking URLs for emails (opens and clicks).
    """

    @staticmethod
    def get_pixel_url(email_log_id: int) -> str:
        """
        Generates an invisible 1x1 pixel URL for tracking opens.
        """
        backend_url = getattr(settings, "BACKEND_URL", "https://api.youvsyou.site")
        return f"{backend_url}/api/v1/emails/track/open/{email_log_id}/"

    @staticmethod
    def wrap_link(email_log_id: int, original_url: str) -> str:
        """
        Wraps a URL to track clicks.
        """
        from urllib.parse import urlencode
        backend_url = getattr(settings, "BACKEND_URL", "https://api.youvsyou.site")
        base_url = f"{backend_url}/api/v1/emails/track/click/{email_log_id}/"
        query = urlencode({'url': original_url})
        return f"{base_url}?{query}"
