import os
import sys
import cProfile
import pstats
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.auth import get_user_model
from apps.analytics.dashboard import _build_dashboard
from services.cache_service import CacheService
from django.utils import timezone

User = get_user_model()
user = User.objects.first()
local_date = timezone.localdate()

CacheService.invalidate_all(str(user.id))

profiler = cProfile.Profile()
profiler.enable()
data = _build_dashboard(user, local_date)
profiler.disable()

stats = pstats.Stats(profiler).sort_stats('cumtime')
stats.print_stats(30)
