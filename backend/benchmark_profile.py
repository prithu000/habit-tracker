import os
import sys
import time
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from django.db import connection, reset_queries
from services.cache_service import CacheService

User = get_user_model()
user = User.objects.first()

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

print("=== PROFILING DB QUERIES AND TIMINGS (UNCACHED) ===")
for name, url in endpoints:
    CacheService.invalidate_all(str(user.id))
    reset_queries()
    t0 = time.time()
    try:
        res = client.get(url, HTTP_HOST='127.0.0.1')
        dt = round((time.time() - t0) * 1000, 2)
        q_count = len(connection.queries)
        q_time = round(sum(float(q['time']) for q in connection.queries) * 1000, 2)
        print(f"{name:<25} status={res.status_code} total_time={dt}ms db_queries={q_count} db_time={q_time}ms")
    except Exception as e:
        dt = round((time.time() - t0) * 1000, 2)
        print(f"{name:<25} EXCEPTION={e} total_time={dt}ms db_queries={len(connection.queries)}")
