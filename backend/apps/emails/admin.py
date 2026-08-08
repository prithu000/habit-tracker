from django.contrib import admin
from django.urls import path
from django.shortcuts import render
from django.utils.html import format_html
from django.utils import timezone
from django.db.models import Count, Q, Avg
import uuid

from .models import EmailLog, EmailIdempotency, EmailTemplateConfig, SubjectLineVariation
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

    def total_sent(self, obj):
        return sum(v.sent_count for v in obj.subject_variations.all())

    def average_open_rate(self, obj):
        variations = obj.subject_variations.all()
        if not variations:
            return "0%"
        total_sent = sum(v.sent_count for v in variations)
        if total_sent == 0:
            return "0%"
        total_opened = sum(v.open_count for v in variations)
        return f"{round((total_opened / total_sent) * 100, 2)}%"


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
    
    @admin.action(description="Resend selected emails")
    def resend_emails(self, request, queryset):
        count = 0
        for log in queryset:
            if not log.html_content:
                self.message_user(request, f"Skipped {log.id} - missing HTML content.", level="WARNING")
                continue
                
            new_log = EmailLog.objects.create(
                recipient=log.recipient,
                template=log.template,
                subject=f"[RESEND] {log.subject}",
                status=EmailLog.Status.QUEUED,
                html_content=log.html_content,
                segment=log.segment
            )
            
            try:
                from django.utils.html import strip_tags
                EmailSender.send(
                    email_log=new_log,
                    html_content=new_log.html_content,
                    text_content=strip_tags(new_log.html_content)
                )
                count += 1
            except Exception as e:
                self.message_user(request, f"Failed to resend {log.id}: {e}", level="ERROR")
                
        self.message_user(request, f"Successfully resent {count} emails.")
        
    @admin.action(description="Cancel selected queued/retrying emails")
    def cancel_emails(self, request, queryset):
        updated = queryset.filter(status__in=[EmailLog.Status.QUEUED, EmailLog.Status.RETRYING]).update(status=EmailLog.Status.CANCELLED)
        self.message_user(request, f"Successfully cancelled {updated} emails.")


@admin.register(EmailIdempotency)
class EmailIdempotencyAdmin(admin.ModelAdmin):
    list_display = ("idempotency_key", "created_at")
    search_fields = ("idempotency_key",)
    readonly_fields = ("created_at", "updated_at")
