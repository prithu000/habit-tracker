"""
FORGE — Subscriptions Admin with Enhanced Management
"""
from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from apps.subscriptions.models import SubscriptionOrder, PaymentHistory


@admin.register(SubscriptionOrder)
class SubscriptionOrderAdmin(admin.ModelAdmin):
    list_display = (
        "order_id_display", "user_email", "plan_badge", 
        "amount_display", "status_badge", "created_at"
    )
    list_filter = ("status", "plan_type", "created_at")
    search_fields = ("order_id", "user__email", "razorpay_payment_id", "user__display_name")
    readonly_fields = ("created_at", "updated_at")
    ordering = ["-created_at"]
    list_per_page = 50
    
    fieldsets = (
        ("Order Information", {
            "fields": ("order_id", "user", "plan_type", "status")
        }),
        ("Payment Details", {
            "fields": ("amount_paisa", "currency", "razorpay_payment_id", "razorpay_signature")
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at")
        }),
    )
    
    @admin.display(description="Order ID", ordering="order_id")
    def order_id_display(self, obj):
        """Display order ID with copy-friendly format"""
        return format_html(
            '<code style="background: #f3f4f6; padding: 2px 6px; border-radius: 3px; '
            'font-size: 11px; font-family: monospace;">{}</code>',
            obj.order_id
        )
    
    @admin.display(description="User", ordering="user__email")
    def user_email(self, obj):
        """Display user email"""
        return obj.user.email if obj.user else "N/A"
    
    @admin.display(description="Plan", ordering="plan_type")
    def plan_badge(self, obj):
        """Display plan type with color badge"""
        plan_colors = {
            "trial": "#9ca3af",
            "monthly": "#3b82f6",
            "6_month": "#8b5cf6",
            "12_month": "#10b981",
        }
        plan_labels = {
            "trial": "8-Day Free Trial",
            "monthly": "Monthly Plan (₹99)",
            "6_month": "6-Month Plan (₹399)",
            "12_month": "12-Month Plan (₹699)",
        }
        color = plan_colors.get(obj.plan_type, "#6b7280")
        label = plan_labels.get(obj.plan_type, obj.plan_type)
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; '
            'border-radius: 6px; font-weight: bold; font-size: 11px;">{}</span>',
            color, label
        )
    
    @admin.display(description="Amount", ordering="amount_paisa")
    def amount_display(self, obj):
        """Display amount in rupees"""
        rupees = obj.amount_paisa / 100
        return format_html(
            '<span style="font-weight: bold;">₹{}</span>',
            f"{rupees:.2f}"
        )
    
    @admin.display(description="Status", ordering="status")
    def status_badge(self, obj):
        """Display status with color badge"""
        status_config = {
            "created": {"color": "#f59e0b", "icon": "⏳", "label": "Created"},
            "paid": {"color": "#10b981", "icon": "✅", "label": "Paid"},
            "failed": {"color": "#ef4444", "icon": "❌", "label": "Failed"},
        }
        config = status_config.get(obj.status, {"color": "#6b7280", "icon": "❓", "label": obj.status})
        
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; '
            'border-radius: 6px; font-weight: bold; font-size: 11px;">{} {}</span>',
            config["color"], config["icon"], config["label"]
        )


@admin.register(PaymentHistory)
class PaymentHistoryAdmin(admin.ModelAdmin):
    list_display = (
        "invoice_number_display", "user_email", "plan_badge",
        "amount_display", "status_badge", "paid_at"
    )
    list_filter = ("status", "plan_type", "paid_at")
    search_fields = (
        "invoice_number", "order_id", "payment_id", 
        "user__email", "user__display_name"
    )
    readonly_fields = ("created_at", "updated_at", "paid_at")
    ordering = ["-paid_at"]
    list_per_page = 50
    
    fieldsets = (
        ("Invoice Information", {
            "fields": ("invoice_number", "user", "plan_type", "status")
        }),
        ("Payment Details", {
            "fields": (
                "amount", "order_id", "payment_id"
            )
        }),
        ("Billing Period", {
            "fields": ("billing_period_start", "billing_period_end"),
        }),
        ("Metadata", {
            "fields": ("metadata",),
            "classes": ("collapse",),
        }),
        ("Timestamps", {
            "fields": ("paid_at", "created_at", "updated_at")
        }),
    )
    
    @admin.display(description="Invoice #", ordering="invoice_number")
    def invoice_number_display(self, obj):
        """Display invoice number with styling"""
        return format_html(
            '<code style="background: #dbeafe; color: #1e40af; padding: 2px 8px; '
            'border-radius: 3px; font-weight: bold; font-size: 11px; '
            'font-family: monospace;">{}</code>',
            obj.invoice_number
        )
    
    @admin.display(description="User", ordering="user__email")
    def user_email(self, obj):
        """Display user email"""
        return obj.user.email if obj.user else "N/A"
    
    @admin.display(description="Plan", ordering="plan_type")
    def plan_badge(self, obj):
        """Display plan type with color badge"""
        plan_config = {
            "trial": {"color": "#9ca3af", "label": "Trial"},
            "monthly": {"color": "#3b82f6", "label": "Monthly"},
            "6_month": {"color": "#8b5cf6", "label": "6-Month"},
            "12_month": {"color": "#10b981", "label": "12-Month"},
        }
        config = plan_config.get(obj.plan_type, {"color": "#6b7280", "label": obj.plan_type})
        
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; '
            'border-radius: 6px; font-weight: bold; font-size: 11px;">{}</span>',
            config["color"], config["label"]
        )
    
    @admin.display(description="Amount", ordering="amount")
    def amount_display(self, obj):
        """Display amount with currency"""
        return format_html(
            '<span style="font-weight: bold; color: #10b981;">₹{}</span>',
            f"{obj.amount:.2f}"
        )
    
    @admin.display(description="Status", ordering="status")
    def status_badge(self, obj):
        """Display payment status with badge"""
        if obj.status == "success":
            return format_html(
                '<span style="background-color: #10b981; color: white; padding: 3px 10px; '
                'border-radius: 6px; font-weight: bold; font-size: 11px;">✅ SUCCESS</span>'
            )
        elif obj.status == "pending":
            return format_html(
                '<span style="background-color: #f59e0b; color: white; padding: 3px 10px; '
                'border-radius: 6px; font-weight: bold; font-size: 11px;">⏳ PENDING</span>'
            )
        elif obj.status == "failed":
            return format_html(
                '<span style="background-color: #ef4444; color: white; padding: 3px 10px; '
                'border-radius: 6px; font-weight: bold; font-size: 11px;">❌ FAILED</span>'
            )
        elif obj.status == "refunded":
            return format_html(
                '<span style="background-color: #6b7280; color: white; padding: 3px 10px; '
                'border-radius: 6px; font-weight: bold; font-size: 11px;">↩️ REFUNDED</span>'
            )
        else:
            return format_html(
                '<span style="background-color: #6b7280; color: white; padding: 3px 10px; '
                'border-radius: 6px; font-weight: bold; font-size: 11px;">❓ {}</span>',
                obj.status.upper()
            )
