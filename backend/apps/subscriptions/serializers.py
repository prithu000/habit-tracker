"""
FORGE — Subscriptions Serializers
"""
from rest_framework import serializers
from apps.subscriptions.models import SubscriptionOrder, PaymentHistory


class CreateOrderSerializer(serializers.Serializer):
    plan_type = serializers.ChoiceField(
        choices=[("monthly", "Monthly"), ("6_month", "6 Month"), ("12_month", "12 Month")]
    )


class VerifyPaymentSerializer(serializers.Serializer):
    razorpay_order_id = serializers.CharField(max_length=100)
    razorpay_payment_id = serializers.CharField(max_length=100)
    razorpay_signature = serializers.CharField(max_length=256)
    plan_type = serializers.ChoiceField(
        choices=[("monthly", "Monthly"), ("6_month", "6 Month"), ("12_month", "12 Month")]
    )


class SubscriptionOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionOrder
        fields = [
            "id", "order_id", "plan_type", "amount_paisa",
            "currency", "status", "created_at",
        ]


class PaymentHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentHistory
        fields = [
            "id", "invoice_number", "order_id", "payment_id",
            "plan_type", "amount", "status",
            "billing_period_start", "billing_period_end",
            "paid_at", "metadata",
        ]
