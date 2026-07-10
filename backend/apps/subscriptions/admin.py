"""
FORGE — Subscriptions Admin
"""
from django.contrib import admin
from apps.subscriptions.models import SubscriptionOrder, PaymentHistory


@admin.register(SubscriptionOrder)
class SubscriptionOrderAdmin(admin.ModelAdmin):
    list_display = ("order_id", "user", "plan_type", "amount_paisa", "status", "created_at")
    list_filter = ("status", "plan_type", "created_at")
    search_fields = ("order_id", "user__email", "razorpay_payment_id")


@admin.register(PaymentHistory)
class PaymentHistoryAdmin(admin.ModelAdmin):
    list_display = ("invoice_number", "user", "plan_type", "amount", "status", "paid_at")
    list_filter = ("status", "plan_type", "paid_at")
    search_fields = ("invoice_number", "order_id", "payment_id", "user__email")
