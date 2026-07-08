import os
import sys
import cProfile
import pstats
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from services.cache_service import CacheService

User = get_user_model()
user = User.objects.first()

client = APIClient()
client.force_authenticate(user=user)

CacheService.invalidate_all(str(user.id))

profiler = cProfile.Profile()
profiler.enable()
res = client.get('/api/v1/dashboard/', HTTP_HOST='127.0.0.1')
profiler.disable()

stats = pstats.Stats(profiler).sort_stats('cumtime')
stats.print_stats(30)
