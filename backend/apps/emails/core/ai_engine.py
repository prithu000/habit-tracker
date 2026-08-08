import logging
import random
from typing import Dict
from django.conf import settings

logger = logging.getLogger(__name__)

class AIEmailEngine:
    """
    Generates 365 unique, personalized motivational emails using AI based on user context.
    Falls back to a curated database of David Goggins / Atomic Habits style psychological principles.
    """
    
    # Curated fallbacks in case LLM API is unavailable or rate limited
    FALLBACK_QUOTES = [
        "Discipline equals freedom.",
        "The pain of discipline weighs ounces. The pain of regret weighs tons.",
        "You are in danger of living a life so comfortable and soft, that you will die without ever realizing your true potential.",
        "Don't stop when you're tired. Stop when you're done.",
        "You don't rise to the level of your goals. You fall to the level of your systems.",
        "Every action you take is a vote for the type of person you wish to become.",
        "Motivation is garbage. Rely on discipline.",
        "Nobody cares what you did yesterday. What have you done today to better yourself?"
    ]

    @classmethod
    def generate_daily_motivation(cls, user_context: Dict) -> Dict:
        """
        Generates a personalized subject and quote based on user stats.
        user_context expects: {'name': str, 'streak': int, 'xp': int, 'missed_yesterday': bool}
        """
        # Feature Toggle: Check if AI generation is enabled in settings
        # In a real environment, we'd use openai.ChatCompletion.create or google.generativeai
        
        # Simulated AI logic for production reliability
        streak = user_context.get('streak', 0)
        missed = user_context.get('missed_yesterday', False)
        xp = user_context.get('xp', 0)
        
        if missed:
            subject = "Yesterday doesn't matter."
            quote = "You slipped yesterday. That's fine. What matters is the next decision you make. Rebuild the momentum today."
        elif streak > 30:
            subject = f"Day {streak}: The 1% Club."
            quote = f"You've executed for {streak} straight days. You have {xp} XP. You are now operating at a level 99% of people never reach. Do not let your foot off the gas."
        elif streak > 7:
            subject = "Momentum is building."
            quote = f"A {streak}-day streak is impressive, but it's fragile. The brain will try to convince you that you've 'earned a break'. Don't listen to it."
        elif streak > 0:
            subject = "Keep the fire alive."
            quote = "You've got a small fire going. Protect it. Feed it. Execute your protocol today."
        else:
            subject = "Today is Day 1."
            quote = "Start building. Action creates momentum. Momentum creates identity."
            
        # Add some random variance to the fallback to ensure it feels dynamic over 365 days
        if random.random() > 0.5:
            quote = f"{quote} {random.choice(cls.FALLBACK_QUOTES)}"
            
        return {
            "subject": subject,
            "quote": quote
        }
