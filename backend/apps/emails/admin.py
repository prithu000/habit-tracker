from django.contrib import admin
from django.urls import path
from django.shortcuts import render
from django.utils.html import format_html
from django.utils import timezone
from django.db.models import Count, Q, Avg, Sum
import uuid

from .models import EmailLog, EmailIdempotency, EmailTemplateConfig, SubjectLineVariation, EmailBounceSuppress
from .core import EmailSender


class SubjectLineVariationInline(admin.TabularInline):
    model = SubjectLineVariation
    extra = 1
    readonly_fields = ("sent_count", "open_count", "open_rate")


@admin.register(EmailTemplateConfig)
class EmailTemplateConfigAdmin(admin.ModelAdmin):
    list_display = ("name", "is_active", "total_sent", "average_open_rate")
    inlines = [SubjectLineVariationInline]
    search_fields = ("name", "description")

    def get_queryset(self, request):
        """Annotate queryset to avoid N+1 on subject_variations."""
        return super().get_queryset(request).annotate(
            _total_sent=Sum("subject_variations__sent_count"),
            _total_opened=Sum("subject_variations__open_count"),
        )

    def total_sent(self, obj):
        return obj._total_sent or 0
    total_sent.admin_order_field = "_total_sent"

    def average_open_rate(self, obj):
        sent = obj._total_sent or 0
        opened = obj._total_opened or 0
        if sent == 0:
            return "0%"
        return f"{round((opened / sent) * 100, 2)}%"


@admin.register(EmailLog)
class EmailLogAdmin(admin.ModelAdmin):
    list_display = (
        "recipient", 
        "template", 
        "subject", 
        "status", 
        "segment",
        "created_at", 
        "opened_status",
        "clicked_status"
    )
    list_filter = (
        "status",
        "template",
        "segment",
        "created_at",
    )
    search_fields = (
        "recipient", 
        "subject", 
        "provider_message_id",
        "error_message"
    )
    readonly_fields = (
        "created_at", 
        "updated_at",
        "sent_at",
        "opened",
        "clicked",
        "html_preview"
    )
    
    actions = ["resend_emails", "cancel_emails"]
    
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('test-center/', self.admin_site.admin_view(self.test_center_view), name='email_test_center'),
        ]
        return custom_urls + urls

    def changelist_view(self, request, extra_context=None):
        """
        Inject analytics into the changelist view.
        """
        response = super().changelist_view(request, extra_context)
        
        try:
            qs = response.context_data['cl'].queryset
        except (AttributeError, KeyError):
            return response
            
        total = qs.count()
        delivered = qs.filter(status=EmailLog.Status.DELIVERED).count() + qs.filter(status=EmailLog.Status.OPENED).count() + qs.filter(status=EmailLog.Status.CLICKED).count()
        opened = qs.filter(status__in=[EmailLog.Status.OPENED, EmailLog.Status.CLICKED]).count()
        clicked = qs.filter(status=EmailLog.Status.CLICKED).count()
        bounced = qs.filter(status=EmailLog.Status.BOUNCED).count()
        spam = qs.filter(status=EmailLog.Status.SPAM).count()
        
        delivery_rate = round((delivered / total * 100), 2) if total > 0 else 0
        open_rate = round((opened / delivered * 100), 2) if delivered > 0 else 0
        click_rate = round((clicked / opened * 100), 2) if opened > 0 else 0
        
        # Top Templates
        top_templates = qs.values('template').annotate(
            count=Count('id')
        ).order_by('-count')[:5]

        extra_context = extra_context or {}
        extra_context['email_stats'] = {
            'total': total,
            'delivered': delivered,
            'opened': opened,
            'clicked': clicked,
            'bounced': bounced,
            'spam': spam,
            'delivery_rate': delivery_rate,
            'open_rate': open_rate,
            'click_rate': click_rate,
            'top_templates': top_templates
        }
        
        response.context_data.update(extra_context)
        # We override the template to include the dashboard at the top
        self.change_list_template = "admin/emails/emaillog_changelist.html"
        return response

    def test_center_view(self, request):
        """
        Custom Test Center UI View
        """
        if request.method == "POST":
            target_email = request.POST.get("target_email")
            template = request.POST.get("template_name")
            
            # Simple context for tests
            context = {
                "user_name": "Test User",
                "current_streak": 5,
                "total_xp": 150,
                "days_missed": 3,
                "longest_streak": 12,
                "app_url": "https://youvsyou.site",
                "quote": "This is a test AI quote.",
            }
            
            if template == "all":
                # In production, we'd trigger a celery task or the management command
                # For this demo UI, we'll just queue the welcome email
                EmailSender.send(
                    email_log=EmailLog.objects.create(
                        recipient=target_email, template="welcome", subject="Test", status="queued"
                    ),
                    html_content="<h1>Test</h1>",
                    text_content="Test"
                )
                self.message_user(request, f"Sequence test initiated for {target_email}.")
            else:
                from apps.emails.services import EmailService
                EmailService.send_email_async(
                    recipient=target_email,
                    subject=f"Test: {template}",
                    template_name=template,
                    context=context,
                    segment="test_center"
                )
                self.message_user(request, f"Test email queued for {target_email}.")
                
        context = dict(
            self.admin_site.each_context(request),
            title="Email Test Center",
            templates=EmailTemplateConfig.objects.filter(is_active=True)
        )
        return render(request, "admin/emails/test_center.html", context)
    
    def opened_status(self, obj):
        return bool(obj.opened)
    opened_status.boolean = True
    opened_status.short_description = "Opened"

    def clicked_status(self, obj):
        return bool(obj.clicked)
    clicked_status.boolean = True
    clicked_status.short_description = "Clicked"

    def html_preview(self, obj):
        if obj.html_content:
            return format_html(
                '<iframe srcdoc="{}" width="100%" height="600px" style="border:1px solid #ccc; background:#fff; border-radius:8px;"></iframe>',
                obj.html_content
            )
        return "No HTML content available."
    html_preview.short_description = "HTML Preview"
    
    @admin.action(description="Resend selected emails (via Celery queue)")
    def resend_emails(self, request, queryset):
        """Re-queues failed/cancelled emails through the proper Celery pipeline."""
        from apps.emails.services import EmailService
        from apps.emails.core.builder import EmailBuilder
        count = 0
        skipped = 0

        for log in queryset:
            # Only re-send emails that have stored HTML content
            if not log.html_content:
                skipped += 1
                continue

            # Rebuild context from stored HTML (best effort)
            context = {"user_name": "User", "app_url": "https://youvsyou.site"}

            # Queue through service (checks bounce suppression automatically)
            queued = EmailService.send_email_async(
                recipient=log.recipient,
                subject=f"[RESEND] {log.subject}",
                template_name=log.template,
                context=context,
                segment=log.segment or "admin_resend"
            )
            if queued:
                count += 1
            else:
                skipped += 1

        msg = f"Queued {count} email(s) for resend."
        if skipped:
            msg += f" Skipped {skipped} (suppressed or missing HTML)."
        self.message_user(request, msg)
        
    @admin.action(description="Cancel selected queued/retrying emails")
    def cancel_emails(self, request, queryset):
        updated = queryset.filter(status__in=[EmailLog.Status.QUEUED, EmailLog.Status.RETRYING]).update(status=EmailLog.Status.CANCELLED)
        self.message_user(request, f"Successfully cancelled {updated} emails.")


@admin.register(EmailIdempotency)
class EmailIdempotencyAdmin(admin.ModelAdmin):
    list_display = ("idempotency_key", "created_at")
    search_fields = ("idempotency_key",)
    readonly_fields = ("created_at", "updated_at")


@admin.register(EmailBounceSuppress)
class EmailBounceSuppressAdmin(admin.ModelAdmin):
    list_display = ("email", "reason", "provider_event", "created_at")
    list_filter = ("reason",)
    search_fields = ("email", "notes")
    readonly_fields = ("created_at", "updated_at")
    ordering = ("-created_at",)

    actions = ["remove_from_suppression_list"]

    @admin.action(description="Remove selected from suppression list (re-enable delivery)")
    def remove_from_suppression_list(self, request, queryset):
        count, _ = queryset.delete()
        self.message_user(request, f"Removed {count} address(es) from suppression list.")

