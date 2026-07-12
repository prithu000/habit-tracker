"""
YOU VS YOU — Email Service
Handles all transactional and automated emails with premium HTML templates.
"""
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)


class EmailService:
    """Centralized email service for all YOU VS YOU notifications"""
    
    BRAND_NAME = "YOU VS YOU"
    BRAND_TAGLINE = "Personal Operating System"
    BRAND_COLOR = "#8b5cf6"  # Purple
    WEBSITE_URL = "https://youvsyou.site"
    
    @classmethod
    def send_email(
        cls,
        to_email: str,
        subject: str,
        template_name: str,
        context: Dict[str, Any],
        from_email: Optional[str] = None,
    ) -> bool:
        """
        Send an HTML email using a template.
        
        Args:
            to_email: Recipient email address
            subject: Email subject line
            template_name: Template name (without .html extension)
            context: Template context variables
            from_email: Override default FROM_EMAIL
            
        Returns:
            bool: True if sent successfully, False otherwise
        """
        logger.info(f"Sending email: {subject} to {to_email}")
        
        try:
            # Add brand context
            context.update({
                'brand_name': cls.BRAND_NAME,
                'brand_tagline': cls.BRAND_TAGLINE,
                'brand_color': cls.BRAND_COLOR,
                'website_url': cls.WEBSITE_URL,
                'current_year': timezone.now().year,
                'app_url': cls.WEBSITE_URL,
                'privacy_url': f'{cls.WEBSITE_URL}/privacy',
                'terms_url': f'{cls.WEBSITE_URL}/terms',
                'settings_url': f'{cls.WEBSITE_URL}/settings',
                'unsubscribe_url': f'{cls.WEBSITE_URL}/settings/email',
            })
            
            # Render HTML template
            html_content = render_to_string(f'emails/{template_name}.html', context)
            
            # Render Plain Text fallback
            try:
                plain_text = render_to_string(f'emails/{template_name}_text.txt', context)
            except Exception:
                # Absolute fallback if txt template is missing
                from django.utils.html import strip_tags
                plain_text = strip_tags(html_content)
                plain_text = f"{plain_text}\n\nPrivacy Policy: {cls.WEBSITE_URL}/privacy\nTerms of Service: {cls.WEBSITE_URL}/terms\n"
            
            # Create email with multipart/alternative
            email = EmailMultiAlternatives(
                subject=subject,
                body=plain_text,
                from_email=from_email or settings.DEFAULT_FROM_EMAIL,
                to=[to_email],
                reply_to=[settings.DEFAULT_FROM_EMAIL]
            )
            email.attach_alternative(html_content, "text/html")
            
            # Send email
            result = email.send(fail_silently=False)
            
            logger.info(f"Email sent successfully: {subject} to {to_email} (result={result})")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {type(e).__name__}: {str(e)}")
            return False
    
    # =====================================================
    # WELCOME & ONBOARDING EMAILS
    # =====================================================
    
    @classmethod
    def send_welcome_email(cls, user):
        """Send premium welcome email after registration"""
        return cls.send_email(
            to_email=user.email,
            subject="Welcome to YOU VS YOU",
            template_name='welcome',
            context={
                'user_name': user.display_name or user.email.split('@')[0],
                'dashboard_url': f'{cls.WEBSITE_URL}/dashboard',
                'help_url': f'{cls.WEBSITE_URL}/help',
            }
        )
    
    # =====================================================
    # SUBSCRIPTION & BILLING EMAILS
    # =====================================================
    
    @classmethod
    def send_trial_started(cls, user):
        """Send email when trial starts"""
        return cls.send_email(
            to_email=user.email,
            subject="Your Premium Trial has started",
            template_name='trial_started',
            context={
                'user_name': user.display_name or user.email.split('@')[0],
                'trial_days': 8,
                'trial_end_date': user.trial_end.strftime('%B %d, %Y') if user.trial_end else 'N/A',
            }
        )
    
    @classmethod
    def send_trial_reminder(cls, user, days_left: int):
        """Send reminder email before trial expires"""
        subject_map = {
            3: "Your Premium Trial ends in 3 days",
            1: "Your Premium Trial ends tomorrow",
            0: "Your Premium Trial ends today"
        }
        
        return cls.send_email(
            to_email=user.email,
            subject=subject_map.get(days_left, f"Your trial ends in {days_left} days"),
            template_name='trial_reminder',
            context={
                'user_name': user.display_name or user.email.split('@')[0],
                'days_left': days_left,
                'trial_end_date': user.trial_end.strftime('%B %d, %Y') if user.trial_end else 'N/A',
            }
        )
    
    @classmethod
    def send_trial_expired(cls, user):
        """Send email when trial expires"""
        return cls.send_email(
            to_email=user.email,
            subject="Your Premium Trial has ended",
            template_name='trial_expired',
            context={
                'user_name': user.display_name or user.email.split('@')[0],
            }
        )
    
    @classmethod
    def send_payment_success(cls, user, invoice):
        """Send email after successful payment"""
        plan_names = {
            'monthly': 'Monthly Pro Plan',
            '6_month': '6-Month Pro Plan',
            '12_month': '12-Month VIP Plan'
        }
        
        return cls.send_email(
            to_email=user.email,
            subject="Payment received successfully",
            template_name='payment_success',
            context={
                'user_name': user.display_name or user.email.split('@')[0],
                'invoice_number': invoice.invoice_number,
                'plan_name': plan_names.get(user.plan_type, user.plan_type),
                'amount': f"₹{invoice.amount}",
                'payment_date': invoice.paid_at.strftime('%B %d, %Y'),
                'subscription_start': user.subscription_start.strftime('%B %d, %Y'),
                'subscription_end': user.subscription_end.strftime('%B %d, %Y'),
            }
        )
    
    @classmethod
    def send_subscription_activated(cls, user):
        """Send email when subscription is activated"""
        return cls.send_email(
            to_email=user.email,
            subject="Your subscription has been activated",
            template_name='subscription_activated',
            context={
                'user_name': user.display_name or user.email.split('@')[0],
                'plan_type': user.plan_type,
                'subscription_end': user.subscription_end.strftime('%B %d, %Y') if user.subscription_end else 'N/A',
            }
        )
    
    # =====================================================
    # DAILY, WEEKLY, MONTHLY EMAILS
    # =====================================================
    
    @classmethod
    def send_daily_motivation(cls, user, stats: Dict[str, Any]):
        """Send daily morning motivation email"""
        return cls.send_email(
            to_email=user.email,
            subject=f"Daily Focus: {timezone.now().strftime('%B %d')}",
            template_name='daily_motivation',
            context={
                'user_name': user.display_name or user.email.split('@')[0],
                'date': timezone.now().strftime('%A, %B %d, %Y'),
                'current_streak': stats.get('current_streak', 0),
                'life_score': stats.get('life_score', 0),
                'quote': stats.get('quote', 'Show up. Do the work. Trust the process.'),
                'tip': stats.get('tip', 'Start with the hardest task first.'),
            }
        )
    
    @classmethod
    def send_weekly_summary(cls, user, stats: Dict[str, Any]):
        """Send weekly progress summary"""
        return cls.send_email(
            to_email=user.email,
            subject="Your Weekly Progress Summary",
            template_name='weekly_summary',
            context={
                'user_name': user.display_name or user.email.split('@')[0],
                'week_start': stats.get('week_start', ''),
                'week_end': stats.get('week_end', ''),
                'life_score': stats.get('life_score', 0),
                'discipline_score': stats.get('discipline_score', 0),
                'tasks_completed': stats.get('tasks_completed', 0),
                'workouts': stats.get('workouts', 0),
                'hydration': stats.get('hydration', 0),
                'best_achievement': stats.get('best_achievement', 'Keep going!'),
            }
        )
    
    @classmethod
    def send_monthly_report(cls, user, stats: Dict[str, Any]):
        """Send monthly growth report"""
        return cls.send_email(
            to_email=user.email,
            subject="Your Monthly Growth Report",
            template_name='monthly_report',
            context={
                'user_name': user.display_name or user.email.split('@')[0],
                'month': timezone.now().strftime('%B %Y'),
                'life_score': stats.get('life_score', 0),
                'best_habit': stats.get('best_habit', 'Consistency'),
                'improvement': stats.get('improvement', '+10% overall'),
                'current_streak': stats.get('current_streak', 0),
            }
        )


