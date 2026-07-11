"""
FORGE — Users App Signals
Auto-triggered on user model events.
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model

User = get_user_model()


@receiver(post_save, sender=User)
def on_user_created(sender, instance, created, **kwargs):
    """
    When a new user is created:
    1. Create their overall StreakRecord
    2. Award a login bonus XP (5 XP for first sign-up)
    3. Send welcome notification
    """
    import logging
    logger = logging.getLogger(__name__)
    
    logger.info(f"🔔 SIGNAL FIRED: on_user_created for {instance.email} (created={created})")
    
    if not created:
        logger.info(f"   ↳ Skipping - user not newly created")
        return
    
    logger.info(f"   ↳ NEW USER DETECTED: {instance.email}")

    # Import here to avoid circular imports
    from apps.streaks.models import StreakRecord
    
    # Initialize 8-Day Full Featured Free Trial
    from django.utils import timezone as django_timezone
    from datetime import timedelta
    now = django_timezone.now()
    if not instance.trial_start:
        instance.trial_start = now
        instance.trial_end = now + timedelta(days=8)
        instance.subscription_status = instance.SubscriptionStatus.TRIAL
        instance.plan_type = instance.PlanType.TRIAL
        instance.save(update_fields=["trial_start", "trial_end", "subscription_status", "plan_type"])

    # Create the overall (non-routine-specific) streak record
    StreakRecord.objects.get_or_create(user=instance, routine=None)

    # Welcome notification
    pass
    
    # Send premium welcome email
    from services.email_service import EmailService
    
    # CRITICAL: Print user details before email
    
    logger.info(f"📧 EMAIL TRIGGER REACHED for {instance.email}")
    logger.info(f"   ↳ Recipient: {instance.email}")
    logger.info(f"   ↳ Display Name: {instance.display_name}")
    logger.info(f"   ↳ Calling EmailService.send_welcome_email()...")
    
    try:
        email_sent = EmailService.send_welcome_email(instance)
        logger.info(f"   ↳ EmailService returned: {email_sent}")
        if not email_sent:
            logger.error(f"❌ Welcome email failed to send to {instance.email} - EmailService returned False")
    except Exception as e:
        import traceback
        logger.error(f"❌ CRITICAL: Failed to send welcome email to {instance.email}")
        logger.error(f"   ↳ Exception: {type(e).__name__}: {str(e)}")
        logger.error(f"   ↳ Full traceback:\n{traceback.format_exc()}")
        
        # Create admin notification for failed email
        try:
            pass
        except:
            pass  # Don't break user creation if notification fails


@receiver(post_save, sender=User)
def on_onboarding_completed(sender, instance, created, update_fields, **kwargs):
    """
    When a user completes onboarding:
    Award 50 XP onboarding bonus.
    """
    if created:
        return
    if update_fields and "onboarding_completed" not in update_fields:
        return
    if not instance.onboarding_completed:
        return

    from services.xp_service import XPService
    from apps.rewards.models import XPTransaction

    # Avoid duplicate bonuses
    already_awarded = XPTransaction.objects.filter(
        user=instance, reason=XPTransaction.Reason.MILESTONE,
        metadata__event="onboarding_complete",
    ).exists()

    if not already_awarded:
        XPService.award_xp(
            user=instance,
            amount=50,
            reason="milestone",
            metadata={"event": "onboarding_complete"},
        )
