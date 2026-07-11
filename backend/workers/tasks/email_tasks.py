"""
YOU VS YOU — Email Tasks
Scheduled Celery tasks for automated email notifications.
"""
from workers.celery_app import app
from services.email_service import EmailService
from django.contrib.auth import get_user_model
from datetime import date, timedelta
from django.utils import timezone
import logging
import random

User = get_user_model()
logger = logging.getLogger(__name__)


# =====================================================
# TRIAL REMINDER EMAILS
# =====================================================

@app.task(name='workers.tasks.email_tasks.send_trial_reminders')
def send_trial_reminders():
    """
    Send trial reminder emails at different intervals.
    Runs daily at 9 AM.
    """
    today = date.today()
    sent_count = 0
    
    try:
        # 3 days before expiry
        users_3d = User.objects.filter(
            trial_end=today + timedelta(days=3),
            subscription_status='trial'
        )
        for user in users_3d:
            if EmailService.send_trial_reminder(user, days_left=3):
                sent_count += 1
        
        # 1 day before expiry
        users_1d = User.objects.filter(
            trial_end=today + timedelta(days=1),
            subscription_status='trial'
        )
        for user in users_1d:
            if EmailService.send_trial_reminder(user, days_left=1):
                sent_count += 1
        
        # Expires today
        users_today = User.objects.filter(
            trial_end=today,
            subscription_status='trial'
        )
        for user in users_today:
            if EmailService.send_trial_reminder(user, days_left=0):
                sent_count += 1
        
        logger.info(f"Trial reminders sent: {sent_count}")
        return {"status": "success", "sent": sent_count}
    
    except Exception as e:
        logger.error(f"Error sending trial reminders: {str(e)}")
        return {"status": "error", "message": str(e)}


@app.task(name='workers.tasks.email_tasks.send_trial_expired_emails')
def send_trial_expired_emails():
    """
    Send trial expired emails to users whose trial ended.
    Runs daily at 10 AM.
    """
    today = date.today()
    sent_count = 0
    
    try:
        # Users whose trial expired yesterday
        users_expired = User.objects.filter(
            trial_end=today - timedelta(days=1),
            subscription_status='expired',
            trial_used=True
        )
        
        for user in users_expired:
            if EmailService.send_trial_expired(user):
                sent_count += 1
        
        logger.info(f"Trial expired emails sent: {sent_count}")
        return {"status": "success", "sent": sent_count}
    
    except Exception as e:
        logger.error(f"Error sending trial expired emails: {str(e)}")
        return {"status": "error", "message": str(e)}


# =====================================================
# DAILY MOTIVATION EMAILS
# =====================================================

MOTIVATIONAL_QUOTES = [
    "Show up. Do the work. Trust the process.",
    "Success is the sum of small efforts repeated day in and day out.",
    "You don't have to be great to start, but you have to start to be great.",
    "The only way to do great work is to love what you do.",
    "Don't watch the clock; do what it does. Keep going.",
    "The future depends on what you do today.",
    "Small progress is still progress.",
    "Your only limit is you.",
    "Success doesn't just find you. You have to go out and get it.",
    "Great things never come from comfort zones.",
    "Dream it. Believe it. Build it.",
    "The harder you work for something, the greater you'll feel when you achieve it.",
    "Stop doubting yourself. Work hard and make it happen.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "A year from now, you'll wish you had started today.",
]

PRODUCTIVITY_TIPS = [
    "Start with your hardest task first thing in the morning.",
    "Use the 2-minute rule: if it takes less than 2 minutes, do it now.",
    "Block time for deep work without distractions.",
    "Take regular breaks to maintain peak performance.",
    "Review your goals every morning before starting work.",
    "Use the Pomodoro Technique: 25 minutes focus, 5 minutes break.",
    "Write tomorrow's top 3 priorities before you sleep.",
    "Turn off notifications during focus time.",
    "Track your time to identify where you lose productivity.",
    "Create a shutdown ritual at the end of each workday.",
    "Batch similar tasks together for efficiency.",
    "Sleep 7-8 hours for optimal cognitive performance.",
    "Exercise daily to boost energy and focus.",
    "Stay hydrated - aim for 8 glasses of water daily.",
    "Eliminate one time-wasting activity today.",
]


@app.task(name='workers.tasks.email_tasks.send_daily_motivation_emails')
def send_daily_motivation_emails():
    """
    Send daily motivation emails at 6 AM user time.
    Runs daily at 6 AM server time.
    """
    sent_count = 0
    
    try:
        # Get users who want daily emails and have active subscription
        users = User.objects.filter(
            subscription_status__in=['trial', 'active']
        )
        
        # Filter by email preferences if field exists
        if hasattr(User, 'email_daily_motivation'):
            users = users.filter(email_daily_motivation=True)
        
        for user in users:
            # Get random quote and tip
            quote = random.choice(MOTIVATIONAL_QUOTES)
            tip = random.choice(PRODUCTIVITY_TIPS)
            

            stats = {
                'current_streak': 0,  # Calculate from user data
                'life_score': 0,      # Calculate from user metrics
                'quote': quote,
                'tip': tip,
            }
            
            if EmailService.send_daily_motivation(user, stats):
                sent_count += 1
        
        logger.info(f"Daily motivation emails sent: {sent_count}")
        return {"status": "success", "sent": sent_count}
    
    except Exception as e:
        logger.error(f"Error sending daily motivation emails: {str(e)}")
        return {"status": "error", "message": str(e)}


# =====================================================
# WEEKLY SUMMARY EMAILS
# =====================================================

@app.task(name='workers.tasks.email_tasks.send_weekly_summaries')
def send_weekly_summaries():
    """
    Send weekly summary emails every Monday at 8 AM.
    """
    sent_count = 0
    
    try:
        # Get users with active subscription
        users = User.objects.filter(subscription_status='active')
        
        # Filter by email preferences if field exists
        if hasattr(User, 'email_weekly_summary'):
            users = users.filter(email_weekly_summary=True)
        
        # Calculate week start and end
        today = timezone.now().date()
        week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6)
        
        for user in users:

            stats = {
                'week_start': week_start.strftime('%B %d'),
                'week_end': week_end.strftime('%B %d, %Y'),
                'life_score': 0,
                'discipline_score': 0,
                'tasks_completed': 0,
                'workouts': 0,
                'hydration': 0,
                'best_achievement': 'Consistent execution this week!',
            }
            
            if EmailService.send_weekly_summary(user, stats):
                sent_count += 1
        
        logger.info(f"Weekly summary emails sent: {sent_count}")
        return {"status": "success", "sent": sent_count}
    
    except Exception as e:
        logger.error(f"Error sending weekly summaries: {str(e)}")
        return {"status": "error", "message": str(e)}


# =====================================================
# MONTHLY REPORT EMAILS
# =====================================================

@app.task(name='workers.tasks.email_tasks.send_monthly_reports')
def send_monthly_reports():
    """
    Send monthly growth reports on the 1st day of each month at 9 AM.
    """
    sent_count = 0
    
    try:
        # Get users with active subscription
        users = User.objects.filter(subscription_status='active')
        
        # Filter by email preferences if field exists
        if hasattr(User, 'email_monthly_report'):
            users = users.filter(email_monthly_report=True)
        
        # Get previous month name
        last_month = timezone.now().date() - timedelta(days=1)
        month_name = last_month.strftime('%B %Y')
        
        for user in users:

            stats = {
                'month': month_name,
                'life_score': 78,
                'best_habit': 'Daily Exercise',
                'improvement': '+12% Life Score',
                'current_streak': 0,
            }
            
            if EmailService.send_monthly_report(user, stats):
                sent_count += 1
        
        logger.info(f"Monthly report emails sent: {sent_count}")
        return {"status": "success", "sent": sent_count}
    
    except Exception as e:
        logger.error(f"Error sending monthly reports: {str(e)}")
        return {"status": "error", "message": str(e)}


# =====================================================
# MANUAL TEST TASKS (for development)
# =====================================================

@app.task(name='workers.tasks.email_tasks.test_send_email')
def test_send_email(user_id: int, email_type: str):
    """
    Manually test sending an email to a specific user.
    Usage: test_send_email.delay(user_id=1, email_type='daily_motivation')
    """
    try:
        user = User.objects.get(id=user_id)
        
        if email_type == 'daily_motivation':
            stats = {
                'current_streak': 5,
                'life_score': 82,
                'quote': random.choice(MOTIVATIONAL_QUOTES),
                'tip': random.choice(PRODUCTIVITY_TIPS),
            }
            result = EmailService.send_daily_motivation(user, stats)
        
        elif email_type == 'trial_reminder':
            result = EmailService.send_trial_reminder(user, days_left=3)
        
        elif email_type == 'trial_started':
            result = EmailService.send_trial_started(user)
        
        elif email_type == 'trial_expired':
            result = EmailService.send_trial_expired(user)
        
        else:
            return {"status": "error", "message": f"Unknown email type: {email_type}"}
        
        return {"status": "success" if result else "failed", "email_type": email_type, "user": user.email}
    
    except User.DoesNotExist:
        return {"status": "error", "message": f"User {user_id} not found"}
    except Exception as e:
        logger.error(f"Error testing email: {str(e)}")
        return {"status": "error", "message": str(e)}
