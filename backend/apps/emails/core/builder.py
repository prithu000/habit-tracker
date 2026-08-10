import logging
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings

logger = logging.getLogger(__name__)

class EmailBuilder:
    """
    Responsible for constructing the email content (HTML and plain text).
    """

    @staticmethod
    def build_content(template_name: str, context: dict) -> dict:
        """
        Renders the template and returns HTML and plain text versions.
        """
        html_template = f"html/{template_name}.html"
        
        frontend_url = getattr(settings, "FRONTEND_URL", "https://youvsyou.site")
        # Add global settings to context
        context.update({
            "settings_url": f"{frontend_url}/settings/notifications",
            "unsubscribe_url": f"{frontend_url}/unsubscribe",
            "frontend_url": frontend_url,
            "logo_url": f"{frontend_url}/logo.png",
        })

        try:
            from django.template.exceptions import TemplateDoesNotExist
            html_content = render_to_string(html_template, context)
        except TemplateDoesNotExist:
            logger.warning(f"Template {html_template} not found. Falling back to system_alert.html")
            context['header_title'] = context.get('subject', 'System Alert')
            context['message'] = context.get('quote', 'This is an automated notification.')
            html_content = render_to_string("emails/system_alert.html", context)
            
        try:
            text_content = strip_tags(html_content)
            
            return {
                "html": html_content,
                "text": text_content,
            }
        except Exception as e:
            logger.error(f"Failed to build email content for template {template_name}: {e}")
            raise
