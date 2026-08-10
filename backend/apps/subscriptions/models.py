"""
FORGE — Subscriptions & Billing Models
Tracks Razorpay orders, transaction history, and generated invoices.
"""
import uuid
from django.db import models
from django.conf import settings
from apps.core.models import BaseModel


class SubscriptionOffer(BaseModel):
    """
    A server-side controlled offer/sale with a real expiration date.
    """
    code = models.CharField(max_length=50, unique=True, db_index=True)
    name = models.CharField(max_length=100)
    discount_value = models.PositiveIntegerField(help_text="Discount amount in Paisa (e.g., 5000 = ₹50)")
    starts_at = models.DateTimeField()
    expires_at = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "subscriptions_offer"

    def __str__(self):
        return f"{self.name} ({self.code})"

    def is_valid(self) -> bool:
        from django.utils import timezone as django_timezone
        now = django_timezone.now()
        return self.is_active and self.starts_at <= now <= self.expires_at


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
    original_amount_paisa = models.PositiveIntegerField(null=True, blank=True)
    offer = models.ForeignKey(
        SubscriptionOffer,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )
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
