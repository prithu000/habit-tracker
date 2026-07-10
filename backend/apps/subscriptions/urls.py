"""
FORGE — Subscriptions URLs
"""
from django.urls import path
from apps.subscriptions.views import (
    CreateOrderView,
    VerifyPaymentView,
    WebhookView,
    PaymentHistoryView,
    AdminOverviewView,
    SubscriptionInfoView,
    CancelSubscriptionView,
)

urlpatterns = [
    path("create-order/", CreateOrderView.as_view(), name="subscription-create-order"),
    path("verify-payment/", VerifyPaymentView.as_view(), name="subscription-verify-payment"),
    path("verify/", VerifyPaymentView.as_view(), name="subscription-verify-alias"),
    path("webhook/", WebhookView.as_view(), name="subscription-webhook"),
    path("history/", PaymentHistoryView.as_view(), name="subscription-history"),
    path("admin-overview/", AdminOverviewView.as_view(), name="subscription-admin-overview"),
    path("info/", SubscriptionInfoView.as_view(), name="subscription-info"),
    path("cancel/", CancelSubscriptionView.as_view(), name="subscription-cancel"),
]

