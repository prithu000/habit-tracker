"""
FORGE — Subscriptions & Billing Models
Tracks Razorpay orders, transaction history, and generated invoices.
"""
import uuid
from django.db import models
from django.conf import settings
from apps.core.models import BaseModel


class SubscriptionOrder(BaseModel):
    """
    Represents a checkout order initiated by the user before payment completion.
    """
    class OrderStatus(models.TextChoices):
        CREATED = "created", "Created"
        PAID = "paid", "Paid"
        FAILED = "failed", "Failed"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="subscription_orders",
    )
    order_id = models.CharField(max_length=100, unique=True, db_index=True)
    plan_type = models.CharField(max_length=20)  # monthly, 6_month, 12_month
    amount_paisa = models.PositiveIntegerField()
    currency = models.CharField(max_length=10, default="INR")
    status = models.CharField(
        max_length=20,
        choices=OrderStatus.choices,
        default=OrderStatus.CREATED,
    )
    razorpay_payment_id = models.CharField(max_length=100, blank=True)
    razorpay_signature = models.TextField(blank=True)

    class Meta:
        db_table = "subscriptions_order"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Order {self.order_id} ({self.user.email} - {self.plan_type})"


class PaymentHistory(BaseModel):
    """
    Represents a finalized payment and official billing invoice.
    """
    class PaymentStatus(models.TextChoices):
        SUCCESS = "success", "Success"
        FAILED = "failed", "Failed"
        REFUNDED = "refunded", "Refunded"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="payment_history",
    )
    invoice_number = models.CharField(max_length=100, unique=True, db_index=True)
    order_id = models.CharField(max_length=100, db_index=True)
    payment_id = models.CharField(max_length=100, db_index=True)
    plan_type = models.CharField(max_length=20)
    amount = models.DecimalField(max_digits=10, decimal_places=2)  # In INR (e.g. 99.00)
    status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.SUCCESS,
    )
    billing_period_start = models.DateTimeField()
    billing_period_end = models.DateTimeField()
    paid_at = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = "subscriptions_payment_history"
        ordering = ["-paid_at"]

    def __str__(self):
        return f"Invoice {self.invoice_number} ({self.user.email} - ₹{self.amount})"
