import os
import sys
import time
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from services.cache_service import CacheService

User = get_user_model()
user = User.objects.first()
if not user:
    print("No user found in database.")
    sys.exit(1)

client = APIClient()
client.force_authenticate(user=user)

endpoints = [
    ('Dashboard API', '/api/v1/dashboard/'),
    ('Reports API (daily)', '/api/v1/analytics/reports/?timeframe=daily&format=json'),
    ('Reports API (weekly)', '/api/v1/analytics/reports/?timeframe=weekly&format=json'),
    ('Reports API (monthly)', '/api/v1/analytics/reports/?timeframe=monthly&format=json'),
    ('Analytics API (weekly)', '/api/v1/analytics/weekly/'),
    ('Life Score API', '/api/v1/life-score/'),
    ('Discipline API', '/api/v1/analytics/discipline-score/'),
]

print("=== BASELINE MEASUREMENTS (UNCACHED) ===")
CacheService.invalidate_all(str(user.id))

for name, url in endpoints:
    t0 = time.time()
    try:
        res = client.get(url, HTTP_HOST='127.0.0.1')
        dt = round((time.time() - t0) * 1000, 2)
        if res.status_code != 200:
            print(f"{name:<25} status={res.status_code} time={dt}ms -> {res.content[:200]}")
        else:
            print(f"{name:<25} status={res.status_code} time={dt}ms")
    except Exception as e:
        dt = round((time.time() - t0) * 1000, 2)
        print(f"{name:<25} EXCEPTION={e} time={dt}ms")
