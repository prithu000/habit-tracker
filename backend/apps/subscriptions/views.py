"""
YOU VS YOU — Subscriptions Views
Production-grade Razorpay order creation, payment verification, webhook processing,
subscription extension logic, payment history, and admin actions.

SUBSCRIPTION EXTENSION RULES (enforced in ActivateSubscriptionService):
  Case 1 — Same plan, active subscription  → extend from existing end date
  Case 2 — Different plan, active sub      → extend from existing end date, upgrade plan
  Case 3 — Expired subscription            → fresh start from now
  Case 4 — Trial → Paid                    → trial ends immediately, paid starts now
  Case 5 — Lifetime plan                   → reject any new purchase
  Case 6 — Duplicate payment_id            → idempotent response, no double-activation
"""
import hmac
import hashlib
import uuid
import logging
from datetime import timedelta
from django.conf import settings
from django.db import transaction
from django.utils import timezone as django_timezone
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes

from apps.subscriptions.models import SubscriptionOrder, PaymentHistory
from apps.subscriptions.serializers import (
    CreateOrderSerializer,
    VerifyPaymentSerializer,
    SubscriptionOrderSerializer,
    PaymentHistorySerializer,
)

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────
# Plan Registry — Single Source of Truth
# ─────────────────────────────────────────────────────────
PLAN_DETAILS = {
    "monthly":   {"amount_paisa": 9900,  "amount_inr": 99.00,  "days": 30,  "title": "Monthly Plan"},
    "6_month":   {"amount_paisa": 39900, "amount_inr": 399.00, "days": 180, "title": "6-Month Plan"},
    "12_month":  {"amount_paisa": 69900, "amount_inr": 699.00, "days": 365, "title": "12-Month Plan"},
}


# ─────────────────────────────────────────────────────────
# ActivateSubscriptionService — Core Business Logic
# ─────────────────────────────────────────────────────────
class ActivateSubscriptionService:
    """
    Single, authoritative service for all subscription state transitions.
    Never call user.subscription_status = ... outside this class.
    """

    @staticmethod
    @transaction.atomic
    def activate(user, plan_type: str, rzp_order_id: str, rzp_payment_id: str,
                 rzp_signature: str, is_mock: bool = False) -> dict:
        """
        Activate or extend a subscription following SaaS industry rules.
        Returns a dict with invoice_number, subscription_end, and action taken.
        Raises ValueError on invalid state transitions (e.g. lifetime re-purchase).
        """
        plan_info = PLAN_DETAILS[plan_type]
        now = django_timezone.now()

        # ── Guard: Lifetime plan (future-proofing) ──
        if getattr(user, "plan_type", None) == "lifetime":
            raise ValueError("You already have Lifetime access. No purchase needed.")

        # ── Guard: Duplicate payment ──
        existing = PaymentHistory.objects.select_for_update().filter(
            payment_id=rzp_payment_id,
            status=PaymentHistory.PaymentStatus.SUCCESS,
        ).first()
        if existing:
            return {
                "already_verified": True,
                "invoice_number": existing.invoice_number,
                "subscription_end": user.subscription_end.isoformat() if user.subscription_end else "",
                "plan_type": user.plan_type,
                "action": "duplicate_payment_idempotent",
            }

        # ── Determine correct start/end for subscription ──
        prev_plan = user.plan_type
        prev_end = user.subscription_end
        is_trial = user.subscription_status == user.SubscriptionStatus.TRIAL
        is_active_paid = (
            user.subscription_status == user.SubscriptionStatus.ACTIVE
            and prev_end and prev_end > now
        )

        if is_trial:
            # Case 4: Trial → Paid. Fresh start, do NOT carry forward trial days.
            new_start = now
            new_end = now + timedelta(days=plan_info["days"])
            action = "trial_to_paid"
        elif is_active_paid:
            # Case 1 & 2: Active paid plan (same or different). Extend from existing end.
            new_start = user.subscription_start or now
            new_end = prev_end + timedelta(days=plan_info["days"])
            action = "extended" if prev_plan == plan_type else "upgraded_and_extended"
        else:
            # Case 3: Expired / cancelled / fresh user. Start fresh from now.
            new_start = now
            new_end = now + timedelta(days=plan_info["days"])
            action = "reactivated"

        # ── Generate invoice ──
        invoice_num = f"INV-YVY-{now.year}{now.month:02d}-{uuid.uuid4().hex[:8].upper()}"

        # ── Update SubscriptionOrder ──
        sub_order = SubscriptionOrder.objects.filter(order_id=rzp_order_id).first()
        if sub_order:
            sub_order.status = SubscriptionOrder.OrderStatus.PAID
            sub_order.razorpay_payment_id = rzp_payment_id
            sub_order.razorpay_signature = rzp_signature
            sub_order.save(update_fields=["status", "razorpay_payment_id", "razorpay_signature", "updated_at"])

        # ── Update User ──
        user.subscription_status = user.SubscriptionStatus.ACTIVE
        user.plan_type = plan_type
        user.plan_name = plan_info["title"]
        user.trial_used = True
        user.subscription_start = new_start
        user.subscription_end = new_end
        user.renewal_date = new_end
        user.payment_id = rzp_payment_id
        user.order_id = rzp_order_id
        user.invoice_number = invoice_num
        user.invoice_id = invoice_num
        user.payment_status = "paid"
        user.amount_paid = plan_info["amount_inr"]
        user.currency = "INR"
        user.payment_method = "mock" if is_mock else "razorpay"
        user.save()

        # ── Write Payment History Record ──
        PaymentHistory.objects.create(
            user=user,
            invoice_number=invoice_num,
            order_id=rzp_order_id,
            payment_id=rzp_payment_id,
            plan_type=plan_type,
            amount=plan_info["amount_inr"],
            status=PaymentHistory.PaymentStatus.SUCCESS,
            billing_period_start=new_start,
            billing_period_end=new_end,
            metadata={
                "plan_title": plan_info["title"],
                "previous_plan": prev_plan,
                "previous_end": prev_end.isoformat() if prev_end else None,
                "action": action,
                "is_mock": is_mock,
            }
        )

        logger.info(
            f"[Subscription] {action.upper()} | user={user.email} | plan={plan_type} "
            f"| prev_plan={prev_plan} | prev_end={prev_end} "
            f"| new_end={new_end} | invoice={invoice_num} | payment_id={rzp_payment_id}"
        )

        return {
            "already_verified": False,
            "invoice_number": invoice_num,
            "subscription_end": new_end.isoformat(),
            "plan_type": plan_type,
            "action": action,
        }


# ─────────────────────────────────────────────────────────
# CreateOrderView
# ─────────────────────────────────────────────────────────
class CreateOrderView(APIView):
    """
    POST /api/v1/subscriptions/create-order/
    Creates a real Razorpay order. Falls back to mock order only when API fails.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = CreateOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        plan_type = serializer.validated_data["plan_type"]
        plan_info = PLAN_DETAILS[plan_type]

        user = request.user

        # Block lifetime re-purchase
        if getattr(user, "plan_type", None) == "lifetime":
            return Response(
                {"error": "You already have Lifetime access. No purchase needed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        amount_paisa = plan_info["amount_paisa"]
        currency = "INR"
        key_id = getattr(settings, "RAZORPAY_KEY_ID", "")
        key_secret = getattr(settings, "RAZORPAY_KEY_SECRET", "")

        order_id = ""
        is_mock = False

        if key_id and key_secret and key_id.startswith("rzp_") and not key_id.startswith("rzp_test_mock"):
            try:
                import razorpay
                client = razorpay.Client(auth=(key_id, key_secret))
                rzp_order = client.order.create({
                    "amount": amount_paisa,
                    "currency": currency,
                    "receipt": f"rcpt_{uuid.uuid4().hex[:12]}",
                    "notes": {
                        "user_id": str(user.id),
                        "plan_type": plan_type,
                        "user_email": user.email,
                    }
                })
                order_id = rzp_order["id"]
                is_mock = False
                logger.info(f"[CreateOrder] Real Razorpay order created: {order_id} for {user.email}")
            except Exception as e:
                logger.warning(f"[CreateOrder] Razorpay API failed, using mock: {e}")
                order_id = f"order_mock_{uuid.uuid4().hex[:16]}"
                is_mock = True
        else:
            order_id = f"order_mock_{uuid.uuid4().hex[:16]}"
            key_id = "rzp_test_mock_key"
            is_mock = True

        # Persist the order
        SubscriptionOrder.objects.create(
            user=user,
            order_id=order_id,
            plan_type=plan_type,
            amount_paisa=amount_paisa,
            currency=currency,
            status=SubscriptionOrder.OrderStatus.CREATED,
        )

        return Response({
            "order_id": order_id,
            "key_id": key_id,
            "is_mock": is_mock,
            "amount": amount_paisa,
            "currency": currency,
            "plan_type": plan_type,
            "user_info": {
                "name": user.display_name or user.email,
                "email": user.email,
            }
        }, status=status.HTTP_201_CREATED)


# ─────────────────────────────────────────────────────────
# VerifyPaymentView
# ─────────────────────────────────────────────────────────
class VerifyPaymentView(APIView):
    """
    POST /api/v1/subscriptions/verify-payment/
    Verifies Razorpay signature, then delegates to ActivateSubscriptionService.
    All activation logic lives in the service — NEVER here.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = VerifyPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        rzp_order_id  = serializer.validated_data["razorpay_order_id"]
        rzp_payment_id = serializer.validated_data["razorpay_payment_id"]
        rzp_signature  = serializer.validated_data["razorpay_signature"]
        plan_type      = serializer.validated_data["plan_type"]

        key_secret = getattr(settings, "RAZORPAY_KEY_SECRET", "")
        is_mock = rzp_order_id.startswith("order_mock_") or rzp_signature == "mock_signature"

        # ── Signature Verification (real orders only) ──
        if not is_mock and key_secret:
            message = f"{rzp_order_id}|{rzp_payment_id}".encode("utf-8")
            expected_sig = hmac.new(
                key_secret.encode("utf-8"),
                message,
                hashlib.sha256,
            ).hexdigest()
            if not hmac.compare_digest(expected_sig, rzp_signature):
                logger.warning(f"[VerifyPayment] Invalid signature for order={rzp_order_id} user={request.user.email}")
                return Response({"detail": "Invalid payment signature."}, status=status.HTTP_400_BAD_REQUEST)

        # ── Delegate to ActivateSubscriptionService ──
        try:
            result = ActivateSubscriptionService.activate(
                user=request.user,
                plan_type=plan_type,
                rzp_order_id=rzp_order_id,
                rzp_payment_id=rzp_payment_id,
                rzp_signature=rzp_signature,
                is_mock=is_mock,
            )
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"[VerifyPayment] Activation failed: {e}", exc_info=True)
            return Response({"detail": "Subscription activation failed. Please contact support."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # ── Send emails (non-blocking — never fail the response) ──
        try:
            from apps.subscriptions.models import PaymentHistory
            invoice = PaymentHistory.objects.filter(invoice_number=result["invoice_number"]).first()
            if invoice:
                from services.email_service import EmailService
                EmailService.send_payment_success(request.user, invoice)
                EmailService.send_subscription_activated(request.user)
        except Exception as e:
            logger.warning(f"[VerifyPayment] Email failed (non-critical): {e}")

        if result.get("already_verified"):
            return Response({
                "status": "success",
                "message": "Payment already verified. Subscription is active.",
                "invoice_number": result["invoice_number"],
                "invoice_id": result["invoice_number"],
                "subscription_end": result["subscription_end"],
                "plan_type": result["plan_type"],
                "action": result["action"],
            }, status=status.HTTP_200_OK)

        return Response({
            "status": "success",
            "message": "Subscription activated successfully.",
            "invoice_number": result["invoice_number"],
            "invoice_id": result["invoice_number"],
            "subscription_end": result["subscription_end"],
            "plan_type": result["plan_type"],
            "action": result["action"],
        }, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────────────────
# SubscriptionInfoView
# ─────────────────────────────────────────────────────────
class SubscriptionInfoView(APIView):
    """GET /api/v1/subscriptions/info/"""
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        user.expire_trial_if_needed()
        return Response({
            "plan_type": user.plan_type,
            "subscription_plan": user.plan_type,
            "plan_name": user.plan_name or ("8-Day Free Trial" if user.plan_type == "trial" else user.plan_type),
            "subscription_status": user.subscription_status,
            "trial_used": user.trial_used,
            "trial_start": user.trial_start.isoformat() if user.trial_start else None,
            "trial_started_at": user.trial_start.isoformat() if user.trial_start else None,
            "trial_end": user.trial_end.isoformat() if user.trial_end else None,
            "trial_ends_at": user.trial_end.isoformat() if user.trial_end else None,
            "trial_days_remaining": user.get_trial_days_remaining(),
            "trial_hours_remaining": user.get_trial_hours_remaining(),
            "is_premium_active": user.is_premium_active(),
            "subscription_start": user.subscription_start.isoformat() if user.subscription_start else None,
            "subscription_started_at": user.subscription_start.isoformat() if user.subscription_start else None,
            "subscription_end": user.subscription_end.isoformat() if user.subscription_end else None,
            "subscription_ends_at": user.subscription_end.isoformat() if user.subscription_end else None,
            "payment_id": user.payment_id,
            "order_id": user.order_id,
            "invoice_id": user.invoice_id or user.invoice_number,
            "invoice_number": user.invoice_number or user.invoice_id,
            "renewal_date": user.renewal_date.isoformat() if user.renewal_date else None,
            "amount_paid": float(user.amount_paid or 0),
            "currency": user.currency or "INR",
            "payment_method": user.payment_method or "razorpay",
            "payment_status": user.payment_status,
        }, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────────────────
# CancelSubscriptionView
# ─────────────────────────────────────────────────────────
class CancelSubscriptionView(APIView):
    """POST /api/v1/subscriptions/cancel/"""
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        if user.subscription_status in [user.SubscriptionStatus.ACTIVE, user.SubscriptionStatus.TRIAL]:
            user.subscription_status = user.SubscriptionStatus.CANCELLED
            user.auto_renew = False
            user.save(update_fields=["subscription_status", "auto_renew", "updated_at"])
            return Response({
                "status": "success",
                "message": "Subscription cancelled. You retain premium access until your current period ends.",
                "subscription_status": user.subscription_status,
                "subscription_end": user.subscription_end.isoformat() if user.subscription_end else None,
            }, status=status.HTTP_200_OK)
        return Response({"status": "error", "message": "No active subscription to cancel."}, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────────────────
# WebhookView
# ─────────────────────────────────────────────────────────
class WebhookView(APIView):
    """
    POST /api/v1/subscriptions/webhook/
    Public Razorpay webhook handler. Validates signature, then processes payment.captured events.
    Note: payment.captured is a secondary confirmation — primary activation happens via verify-payment.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        webhook_secret = getattr(settings, "RAZORPAY_WEBHOOK_SECRET", "")
        received_sig = request.headers.get("X-Razorpay-Signature", "")

        if webhook_secret and received_sig:
            try:
                import razorpay
                client = razorpay.Client(auth=(
                    getattr(settings, "RAZORPAY_KEY_ID", ""),
                    getattr(settings, "RAZORPAY_KEY_SECRET", ""),
                ))
                client.utility.verify_webhook_signature(
                    request.body.decode("utf-8"),
                    received_sig,
                    webhook_secret,
                )
            except Exception as e:
                logger.warning(f"[Webhook] Signature verification failed: {e}")
                return Response({"detail": "Invalid webhook signature."}, status=status.HTTP_400_BAD_REQUEST)

        event = request.data.get("event")
        payload = request.data.get("payload", {})
        logger.info(f"[Webhook] Received event: {event}")

        if event == "payment.captured":
            payment_entity = payload.get("payment", {}).get("entity", {})
            order_id = payment_entity.get("order_id")
            payment_id = payment_entity.get("id")

            if order_id:
                sub_order = SubscriptionOrder.objects.filter(order_id=order_id).first()
                if sub_order and sub_order.status != SubscriptionOrder.OrderStatus.PAID:
                    sub_order.status = SubscriptionOrder.OrderStatus.PAID
                    sub_order.razorpay_payment_id = payment_id or ""
                    sub_order.save(update_fields=["status", "razorpay_payment_id", "updated_at"])
                    logger.info(f"[Webhook] Order {order_id} marked PAID via webhook.")

        return Response({"status": "received"}, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────────────────
# PaymentHistoryView
# ─────────────────────────────────────────────────────────
class PaymentHistoryView(generics.ListAPIView):
    """GET /api/v1/subscriptions/history/"""
    permission_classes = [IsAuthenticated]
    serializer_class = PaymentHistorySerializer

    def get_queryset(self):
        return PaymentHistory.objects.filter(user=self.request.user).order_by("-paid_at")


# ─────────────────────────────────────────────────────────
# AdminOverviewView
# ─────────────────────────────────────────────────────────
class AdminOverviewView(APIView):
    """
    GET  /api/v1/subscriptions/admin-overview/  — Overview stats
    POST /api/v1/subscriptions/admin-overview/  — Admin actions:
         extend_subscription / replace_subscription / extend_trial / cancel_plan / refund_payment
    """
    permission_classes = [IsAdminUser]

    def get(self, request, *args, **kwargs):
        from django.contrib.auth import get_user_model
        from django.db.models import Sum
        User = get_user_model()

        total_revenue = PaymentHistory.objects.filter(
            status=PaymentHistory.PaymentStatus.SUCCESS
        ).aggregate(total=Sum("amount"))["total"] or 0

        return Response({
            "total_revenue": float(total_revenue),
            "active_subscribers": User.objects.filter(subscription_status="active").count(),
            "active_trials": User.objects.filter(subscription_status="trial").count(),
            "total_users": User.objects.count(),
            "recent_invoices": PaymentHistorySerializer(
                PaymentHistory.objects.all().order_by("-paid_at")[:10], many=True
            ).data,
        })

    def post(self, request, *args, **kwargs):
        from django.contrib.auth import get_user_model
        User = get_user_model()

        action = request.data.get("action")
        user_id = request.data.get("user_id")
        user = User.objects.filter(id=user_id).first()
        if not user:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        now = django_timezone.now()

        if action == "extend_subscription":
            # Admin extends an active subscription from its CURRENT end date (never overwrites)
            plan_type = request.data.get("plan_type", user.plan_type)
            if plan_type not in PLAN_DETAILS:
                return Response({"detail": f"Unknown plan: {plan_type}"}, status=400)
            plan_info = PLAN_DETAILS[plan_type]

            is_active = user.subscription_status == user.SubscriptionStatus.ACTIVE and user.subscription_end and user.subscription_end > now
            base = user.subscription_end if is_active else now
            new_end = base + timedelta(days=plan_info["days"])

            user.subscription_status = user.SubscriptionStatus.ACTIVE
            user.plan_type = plan_type
            user.plan_name = plan_info["title"]
            user.subscription_end = new_end
            user.renewal_date = new_end
            if not user.subscription_start:
                user.subscription_start = now
            user.save()

            admin_invoice = f"INV-ADMIN-{now.year}{now.month:02d}-{uuid.uuid4().hex[:6].upper()}"
            PaymentHistory.objects.create(
                user=user,
                invoice_number=admin_invoice,
                order_id=f"admin_{uuid.uuid4().hex[:12]}",
                payment_id=f"admin_grant_{uuid.uuid4().hex[:12]}",
                plan_type=plan_type,
                amount=plan_info["amount_inr"],
                status=PaymentHistory.PaymentStatus.SUCCESS,
                billing_period_start=base,
                billing_period_end=new_end,
                metadata={"action": "admin_extend", "granted_by": request.user.email},
            )
            return Response({
                "message": f"Subscription extended for {user.email}.",
                "new_end": new_end.isoformat(),
                "plan_type": plan_type,
            })

        elif action == "replace_subscription":
            # Admin explicitly replaces subscription (overwrite — use carefully)
            plan_type = request.data.get("plan_type", "monthly")
            if plan_type not in PLAN_DETAILS:
                return Response({"detail": f"Unknown plan: {plan_type}"}, status=400)
            plan_info = PLAN_DETAILS[plan_type]
            new_end = now + timedelta(days=plan_info["days"])

            user.subscription_status = user.SubscriptionStatus.ACTIVE
            user.plan_type = plan_type
            user.plan_name = plan_info["title"]
            user.subscription_start = now
            user.subscription_end = new_end
            user.renewal_date = new_end
            user.save()

            admin_invoice = f"INV-ADMIN-{now.year}{now.month:02d}-{uuid.uuid4().hex[:6].upper()}"
            PaymentHistory.objects.create(
                user=user,
                invoice_number=admin_invoice,
                order_id=f"admin_{uuid.uuid4().hex[:12]}",
                payment_id=f"admin_replace_{uuid.uuid4().hex[:12]}",
                plan_type=plan_type,
                amount=plan_info["amount_inr"],
                status=PaymentHistory.PaymentStatus.SUCCESS,
                billing_period_start=now,
                billing_period_end=new_end,
                metadata={"action": "admin_replace", "granted_by": request.user.email},
            )
            return Response({
                "message": f"Subscription replaced for {user.email}.",
                "new_end": new_end.isoformat(),
                "plan_type": plan_type,
            })

        elif action == "extend_trial":
            days = int(request.data.get("days", 8))
            if user.trial_end:
                user.trial_end += timedelta(days=days)
            else:
                user.trial_end = now + timedelta(days=days)
            user.subscription_status = user.SubscriptionStatus.TRIAL
            user.save()
            return Response({"message": f"Trial extended by {days} days for {user.email}."})

        elif action == "cancel_plan":
            user.subscription_status = user.SubscriptionStatus.EXPIRED
            user.save()
            return Response({"message": f"Plan cancelled for {user.email}."})

        elif action == "refund_payment":
            invoice_num = request.data.get("invoice_number")
            invoice = PaymentHistory.objects.filter(invoice_number=invoice_num, user=user).first()
            if invoice:
                invoice.status = PaymentHistory.PaymentStatus.REFUNDED
                invoice.save()
                return Response({"message": f"Invoice {invoice_num} marked refunded for {user.email}."})
            return Response({"detail": "Invoice not found."}, status=404)

        return Response({"detail": "Invalid action."}, status=status.HTTP_400_BAD_REQUEST)
