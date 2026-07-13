"""
FORGE — Users Admin with Complete Subscription Management
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from django.utils import timezone
from django.contrib import messages
from datetime import timedelta
from apps.users.models import User
from apps.core.admin import ForgeBaseAdmin

from django.contrib.auth.forms import UserChangeForm as BaseUserChangeForm, UserCreationForm as BaseUserCreationForm

class UserChangeForm(BaseUserChangeForm):
    class Meta:
        model = User
        fields = "__all__"

class UserCreationForm(BaseUserCreationForm):
    class Meta:
        model = User
        fields = ("email",)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    form = UserChangeForm
    add_form = UserCreationForm
    model = User
    list_display = [
        "email", "display_name", "subscription_badge", "plan_display",
        "current_level", "total_xp", "is_active", "date_joined"
    ]
    list_filter = [
        "subscription_status", "plan_type", "is_active", "is_staff", 
        "onboarding_completed", "time_preference", "auto_renew"
    ]
    search_fields = ["email", "display_name", "username", "invoice_number", "order_id"]
    ordering = ["-date_joined"]
    readonly_fields = [
        "id", "date_joined", "updated_at", "last_login",
        "subscription_status_display", "trial_countdown_display",
        "premium_status_display", "next_billing_display"
    ]
    list_per_page = 50
    
    actions = [
        "grant_trial",
        "grant_1_month_premium",
        "grant_6_month_premium",
        "grant_12_month_premium",
        "end_trial",
        "expire_subscription",
        "cancel_subscription",
        "restore_subscription",
    ]

    fieldsets = (
        (None, {"fields": ("id", "email", "password")}),
        (_("Personal Info"), {"fields": ("display_name", "username", "avatar_url", "timezone")}),
        (_("FORGE Identity"), {"fields": ("identity_statement", "time_preference", "onboarding_completed")}),
        (_("Gamification"), {"fields": ("current_level", "total_xp")}),
        (_("💳 Subscription Management"), {
            "fields": (
                "subscription_status_display",
                "subscription_status",
                "plan_type",
                "plan_name",
                "trial_countdown_display",
                "premium_status_display",
                "auto_renew",
            ),
            "classes": ("wide",),
        }),
        (_("📅 Trial Dates"), {
            "fields": ("trial_start", "trial_end", "trial_used"),
        }),
        (_("📅 Subscription Dates"), {
            "fields": ("subscription_start", "subscription_end", "renewal_date", "next_billing_display"),
        }),
        (_("💰 Payment Information"), {
            "fields": (
                "payment_status",
                "amount_paid",
                "currency",
                "payment_method",
                "payment_id",
                "order_id",
                "invoice_number",
                "invoice_id",
            ),
        }),
        (_("🔄 Razorpay Integration"), {
            "fields": ("razorpay_customer_id", "razorpay_subscription_id"),
            "classes": ("collapse",),
        }),
        (_("Permissions"), {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        (_("Timestamps"), {"fields": ("date_joined", "updated_at", "last_login")}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "display_name", "password1", "password2"),
        }),
    )
    
    def save_model(self, request, obj, form, change):
        """Override save to invalidate cache when subscription changes"""
        # Check if subscription-related fields changed
        if change:  # Only for updates, not new users
            subscription_fields = [
                'subscription_status', 'plan_type', 'trial_end', 'subscription_end',
                'is_active', 'trial_start', 'subscription_start'
            ]
            changed_fields = form.changed_data
            subscription_changed = any(field in changed_fields for field in subscription_fields)
            
            if subscription_changed:
                now = timezone.now()
                
                if obj.subscription_status == User.SubscriptionStatus.TRIAL:
                    obj.plan_type = User.PlanType.TRIAL
                    obj.plan_name = "14-Day Free Trial"
                    # Enforce fresh trial dates
                    obj.trial_start = now
                    obj.trial_end = now + timedelta(days=14)
                    
                    # Clear ALL premium fields to prevent leaks
                    obj.subscription_start = None
                    obj.subscription_end = None
                    obj.renewal_date = None
                    
                    obj.payment_status = "trial"
                    obj.amount_paid = 0

                elif obj.subscription_status == User.SubscriptionStatus.ACTIVE:
                    obj.subscription_start = obj.subscription_start or now
                    
                    if obj.plan_type == User.PlanType.SIX_MONTH:
                        duration = timedelta(days=180)
                        price = 399.00
                    elif obj.plan_type == User.PlanType.TWELVE_MONTH:
                        duration = timedelta(days=365)
                        price = 699.00
                    else:
                        duration = timedelta(days=30)
                        price = 99.00
                        obj.plan_type = User.PlanType.MONTHLY
                        
                    # Complete state transition
                    obj.subscription_end = obj.subscription_start + duration
                    obj.renewal_date = obj.subscription_end
                    
                    # Clear ALL trial fields to prevent leaks
                    obj.trial_start = None
                    obj.trial_end = None
                    obj.trial_used = True
                    
                    obj.payment_status = "success"
                    obj.amount_paid = price
                    
                    plan_names = {
                        User.PlanType.MONTHLY: "Monthly Plan (₹99)",
                        User.PlanType.SIX_MONTH: "6-Month Plan (₹399)",
                        User.PlanType.TWELVE_MONTH: "12-Month Plan (₹699)",
                    }
                    obj.plan_name = plan_names.get(obj.plan_type, "Pro")

                elif obj.subscription_status == User.SubscriptionStatus.EXPIRED:
                    obj.trial_start = None
                    obj.trial_end = None
                    obj.subscription_start = None
                    obj.subscription_end = None
                    obj.renewal_date = None
                    obj.payment_status = "expired"
                    
                elif obj.subscription_status == User.SubscriptionStatus.CANCELLED:
                    obj.auto_renew = False

                # Invalidate all caches for this user
                from services.cache_service import CacheService
                CacheService.invalidate_all(str(obj.id))
                
                # Add message to admin
                self.message_user(
                    request,
                    f"✅ Subscription updated and cache cleared for {obj.email}",
                    messages.SUCCESS
                )
        
        super().save_model(request, obj, form, change)
    
    # ═══════════════════════════════════════════════════════════════
    # CUSTOM DISPLAY METHODS
    # ═══════════════════════════════════════════════════════════════
    
    @admin.display(description="Subscription", ordering="subscription_status")
    def subscription_badge(self, obj):
        """Display subscription status badge with emoji and color"""
        status = obj.subscription_status
        
        if status == User.SubscriptionStatus.ACTIVE:
            # Premium badges based on plan
            if obj.plan_type == User.PlanType.TWELVE_MONTH:
                return format_html(
                    '<span style="background-color: #10b981; color: white; padding: 3px 8px; '
                    'border-radius: 12px; font-weight: bold; font-size: 11px;">🟢 Premium Annual</span>'
                )
            elif obj.plan_type == User.PlanType.SIX_MONTH:
                return format_html(
                    '<span style="background-color: #10b981; color: white; padding: 3px 8px; '
                    'border-radius: 12px; font-weight: bold; font-size: 11px;">🟢 Premium 6-Mo</span>'
                )
            elif obj.plan_type == User.PlanType.MONTHLY:
                return format_html(
                    '<span style="background-color: #10b981; color: white; padding: 3px 8px; '
                    'border-radius: 12px; font-weight: bold; font-size: 11px;">🟢 Premium Monthly</span>'
                )
            else:
                return format_html(
                    '<span style="background-color: #10b981; color: white; padding: 3px 8px; '
                    'border-radius: 12px; font-weight: bold; font-size: 11px;">🟢 Premium Active</span>'
                )
        
        elif status == User.SubscriptionStatus.TRIAL:
            days_left = obj.get_trial_days_remaining()
            return format_html(
                '<span style="background-color: #f59e0b; color: white; padding: 3px 8px; '
                'border-radius: 12px; font-weight: bold; font-size: 11px;">🟡 Trial ({} days left)</span>',
                days_left
            )
        
        elif status == User.SubscriptionStatus.EXPIRED:
            return format_html(
                '<span style="background-color: #ef4444; color: white; padding: 3px 8px; '
                'border-radius: 12px; font-weight: bold; font-size: 11px;">🔴 Expired</span>'
            )
        
        elif status == User.SubscriptionStatus.CANCELLED:
            return format_html(
                '<span style="background-color: #6b7280; color: white; padding: 3px 8px; '
                'border-radius: 12px; font-weight: bold; font-size: 11px;">⚫ Cancelled</span>'
            )
        
        else:
            return format_html(
                '<span style="background-color: #9ca3af; color: white; padding: 3px 8px; '
                'border-radius: 12px; font-weight: bold; font-size: 11px;">⚪ Free</span>'
            )
    
    @admin.display(description="Plan", ordering="plan_type")
    def plan_display(self, obj):
        """Display plan type in compact format"""
        plan_map = {
            User.PlanType.TRIAL: "Trial",
            User.PlanType.MONTHLY: "₹99/mo",
            User.PlanType.SIX_MONTH: "₹399/6mo",
            User.PlanType.TWELVE_MONTH: "₹699/yr",
        }
        return plan_map.get(obj.plan_type, obj.plan_type)
    
    @admin.display(description="Subscription Status")
    def subscription_status_display(self, obj):
        """Rich display of subscription status with details"""
        status = obj.subscription_status
        html_parts = []
        
        # Main status badge
        if status == User.SubscriptionStatus.ACTIVE:
            html_parts.append(
                '<div style="margin-bottom: 10px;">'
                '<span style="background-color: #10b981; color: white; padding: 5px 12px; '
                'border-radius: 6px; font-weight: bold;">✅ ACTIVE PREMIUM</span>'
                '</div>'
            )
        elif status == User.SubscriptionStatus.TRIAL:
            html_parts.append(
                '<div style="margin-bottom: 10px;">'
                '<span style="background-color: #f59e0b; color: white; padding: 5px 12px; '
                'border-radius: 6px; font-weight: bold;">⏳ TRIAL ACTIVE</span>'
                '</div>'
            )
        elif status == User.SubscriptionStatus.EXPIRED:
            html_parts.append(
                '<div style="margin-bottom: 10px;">'
                '<span style="background-color: #ef4444; color: white; padding: 5px 12px; '
                'border-radius: 6px; font-weight: bold;">❌ EXPIRED</span>'
                '</div>'
            )
        elif status == User.SubscriptionStatus.CANCELLED:
            html_parts.append(
                '<div style="margin-bottom: 10px;">'
                '<span style="background-color: #6b7280; color: white; padding: 5px 12px; '
                'border-radius: 6px; font-weight: bold;">🚫 CANCELLED</span>'
                '</div>'
            )
        
        return format_html(''.join(html_parts))
    
    @admin.display(description="Trial Countdown")
    def trial_countdown_display(self, obj):
        """Display trial countdown with visual indicator"""
        if obj.subscription_status != User.SubscriptionStatus.TRIAL:
            return format_html('<span style="color: #9ca3af;">Not in trial</span>')
        
        if not obj.trial_end:
            return format_html('<span style="color: #9ca3af;">No trial end date</span>')
        
        days_left = obj.get_trial_days_remaining()
        hours_left = obj.get_trial_hours_remaining()
        
        if days_left > 3:
            color = "#10b981"  # Green
            icon = "✅"
        elif days_left > 1:
            color = "#f59e0b"  # Orange
            icon = "⚠️"
        else:
            color = "#ef4444"  # Red
            icon = "🚨"
        
        return format_html(
            '<div style="font-weight: bold; color: {}">'
            '{} {} days, {} hours remaining'
            '</div>'
            '<div style="font-size: 11px; color: #6b7280; margin-top: 4px;">'
            'Ends: {}'
            '</div>',
            color, icon, days_left, hours_left % 24, 
            obj.trial_end.strftime("%b %d, %Y %I:%M %p") if obj.trial_end else "N/A"
        )
    
    @admin.display(description="Premium Access")
    def premium_status_display(self, obj):
        """Display whether user has premium access"""
        has_premium = obj.is_premium_active()
        
        if has_premium:
            return format_html(
                '<span style="background-color: #10b981; color: white; padding: 4px 10px; '
                'border-radius: 6px; font-weight: bold; font-size: 12px;">✅ YES</span>'
            )
        else:
            return format_html(
                '<span style="background-color: #ef4444; color: white; padding: 4px 10px; '
                'border-radius: 6px; font-weight: bold; font-size: 12px;">❌ NO</span>'
            )
    
    @admin.display(description="Next Billing")
    def next_billing_display(self, obj):
        """Display next billing date if applicable"""
        if obj.subscription_status != User.SubscriptionStatus.ACTIVE:
            return format_html('<span style="color: #9ca3af;">N/A</span>')
        
        if obj.renewal_date:
            return format_html(
                '<div style="font-weight: bold;">{}</div>'
                '<div style="font-size: 11px; color: #6b7280; margin-top: 2px;">'
                'Auto-renew: {}'
                '</div>',
                obj.renewal_date.strftime("%b %d, %Y"),
                "✅ Yes" if obj.auto_renew else "❌ No"
            )
        elif obj.subscription_end:
            return format_html(
                '<div>Ends: {}</div>'
                '<div style="font-size: 11px; color: #6b7280; margin-top: 2px;">'
                'No auto-renew'
                '</div>',
                obj.subscription_end.strftime("%b %d, %Y")
            )
        else:
            return format_html('<span style="color: #9ca3af;">Not set</span>')
    # ═══════════════════════════════════════════════════════════════
    # ADMIN ACTIONS
    # ═══════════════════════════════════════════════════════════════
    
    @admin.action(description="✨ Grant 14-Day Trial")
    def grant_trial(self, request, queryset):
        """Grant 14-day trial to selected users"""
        count = 0
        for user in queryset:
            now = timezone.now()
            trial_end = now + timedelta(days=14)
            
            user.subscription_status = User.SubscriptionStatus.TRIAL
            user.plan_type = User.PlanType.TRIAL
            user.plan_name = "14-Day Free Trial"
            user.trial_start = now
            user.trial_end = trial_end
            user.trial_used = True
            user.subscription_start = None
            user.subscription_end = None
            user.renewal_date = None
            user.save()
            
            # Clear cache for this user
            from services.cache_service import CacheService
            CacheService.invalidate_all(str(user.id))
            
            count += 1
        
        self.message_user(
            request,
            f"✅ Successfully granted 14-day trial to {count} user(s). Trial expires in 14 days.",
            messages.SUCCESS
        )
    
    @admin.action(description="💎 Grant 1 Month Premium")
    def grant_1_month_premium(self, request, queryset):
        """Grant 1-month premium subscription to selected users"""
        count = 0
        for user in queryset:
            now = timezone.now()
            end_date = now + timedelta(days=30)
            
            user.subscription_status = User.SubscriptionStatus.ACTIVE
            user.plan_type = User.PlanType.MONTHLY
            user.plan_name = "Monthly Plan (₹99)"
            user.subscription_start = now
            user.subscription_end = end_date
            user.renewal_date = end_date
            user.trial_used = True  # Mark trial as used
            user.trial_start = None
            user.trial_end = None
            user.payment_status = "admin_granted"
            user.save()
            
            # Clear cache
            from services.cache_service import CacheService
            CacheService.invalidate_all(str(user.id))
            
            count += 1
        
        self.message_user(
            request,
            f"✅ Successfully granted 1-month premium to {count} user(s). Expires in 30 days.",
            messages.SUCCESS
        )
    
    @admin.action(description="💎 Grant 6 Month Premium")
    def grant_6_month_premium(self, request, queryset):
        """Grant 6-month premium subscription to selected users"""
        count = 0
        for user in queryset:
            now = timezone.now()
            end_date = now + timedelta(days=180)
            
            user.subscription_status = User.SubscriptionStatus.ACTIVE
            user.plan_type = User.PlanType.SIX_MONTH
            user.plan_name = "6-Month Plan (₹399)"
            user.subscription_start = now
            user.subscription_end = end_date
            user.renewal_date = end_date
            user.trial_used = True
            user.trial_start = None
            user.trial_end = None
            user.payment_status = "admin_granted"
            user.save()
            
            # Clear cache
            from services.cache_service import CacheService
            CacheService.invalidate_all(str(user.id))
            
            count += 1
        
        self.message_user(
            request,
            f"✅ Successfully granted 6-month premium to {count} user(s). Expires in 180 days.",
            messages.SUCCESS
        )
    
    @admin.action(description="💎 Grant 12 Month Premium")
    def grant_12_month_premium(self, request, queryset):
        """Grant 12-month premium subscription to selected users"""
        count = 0
        for user in queryset:
            now = timezone.now()
            end_date = now + timedelta(days=365)
            
            user.subscription_status = User.SubscriptionStatus.ACTIVE
            user.plan_type = User.PlanType.TWELVE_MONTH
            user.plan_name = "12-Month Plan (₹699)"
            user.subscription_start = now
            user.subscription_end = end_date
            user.renewal_date = end_date
            user.trial_used = True
            user.trial_start = None
            user.trial_end = None
            user.payment_status = "admin_granted"
            user.save()
            
            # Clear cache
            from services.cache_service import CacheService
            CacheService.invalidate_all(str(user.id))
            
            count += 1
        
        self.message_user(
            request,
            f"✅ Successfully granted 12-month premium to {count} user(s). Expires in 365 days.",
            messages.SUCCESS
        )
    
    @admin.action(description="⏹️ End Trial (Expire Immediately)")
    def end_trial(self, request, queryset):
        """End trial immediately and mark as expired"""
        count = 0
        for user in queryset:
            if user.subscription_status == User.SubscriptionStatus.TRIAL:
                now = timezone.now()
                user.subscription_status = User.SubscriptionStatus.EXPIRED
                user.trial_end = now  # Set trial end to now
                user.save()
                
                # Clear cache
                from services.cache_service import CacheService
                CacheService.invalidate_all(str(user.id))
                
                count += 1
        
        self.message_user(
            request,
            f"✅ Successfully ended trial for {count} user(s). Status changed to EXPIRED.",
            messages.SUCCESS
        )
    
    @admin.action(description="❌ Expire Subscription")
    def expire_subscription(self, request, queryset):
        """Expire subscription immediately"""
        count = 0
        for user in queryset:
            now = timezone.now()
            user.subscription_status = User.SubscriptionStatus.EXPIRED
            if user.subscription_end and user.subscription_end > now:
                user.subscription_end = now
            user.save()
            
            # Clear cache
            from services.cache_service import CacheService
            CacheService.invalidate_all(str(user.id))
            
            count += 1
        
        self.message_user(
            request,
            f"✅ Successfully expired subscription for {count} user(s).",
            messages.WARNING
        )
    
    @admin.action(description="🚫 Cancel Subscription")
    def cancel_subscription(self, request, queryset):
        """Cancel subscription (mark as cancelled)"""
        count = 0
        for user in queryset:
            user.subscription_status = User.SubscriptionStatus.CANCELLED
            user.auto_renew = False  # Disable auto-renew
            user.save()
            
            # Clear cache
            from services.cache_service import CacheService
            CacheService.invalidate_all(str(user.id))
            
            count += 1
        
        self.message_user(
            request,
            f"✅ Successfully cancelled subscription for {count} user(s). Auto-renew disabled.",
            messages.WARNING
        )
    
    @admin.action(description="♻️ Restore Subscription")
    def restore_subscription(self, request, queryset):
        """Restore expired or cancelled subscription"""
        count = 0
        for user in queryset:
            if user.subscription_status in [User.SubscriptionStatus.EXPIRED, User.SubscriptionStatus.CANCELLED]:
                # Check if they had a previous subscription
                if user.subscription_start and user.subscription_end:
                    now = timezone.now()
                    # Extend from now for remaining duration
                    if user.subscription_end > now:
                        # Still within period, just reactivate
                        user.subscription_status = User.SubscriptionStatus.ACTIVE
                    else:
                        # Was expired, need new dates (give 30 days)
                        user.subscription_start = now
                        user.subscription_end = now + timedelta(days=30)
                        user.renewal_date = user.subscription_end
                        user.subscription_status = User.SubscriptionStatus.ACTIVE
                else:
                    # No previous subscription, grant 30 days
                    now = timezone.now()
                    user.subscription_start = now
                    user.subscription_end = now + timedelta(days=30)
                    user.renewal_date = user.subscription_end
                    user.subscription_status = User.SubscriptionStatus.ACTIVE
                    user.plan_type = User.PlanType.MONTHLY
                    user.plan_name = "Monthly Plan (Restored)"
                
                user.save()
                
                # Clear cache
                from services.cache_service import CacheService
                CacheService.invalidate_all(str(user.id))
                
                count += 1
        
        self.message_user(
            request,
            f"✅ Successfully restored subscription for {count} user(s).",
            messages.SUCCESS
        )
