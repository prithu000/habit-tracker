import requests, random, string
BASE_URL = "http://127.0.0.1:8000/api/v1"
email = f"test_{''.join(random.choices(string.ascii_lowercase, k=8))}@example.com"
password = "TestPassword123!"
res = requests.post(f"{BASE_URL}/auth/register/", json={"email": email, "password": password, "password_confirm": password, "display_name": "Test User", "timezone": "Asia/Kolkata"}).json()
token = res.get("data", {}).get("access") or res.get("tokens", {}).get("access")
headers = {"Authorization": f"Bearer {token}"}
r = requests.post(f"{BASE_URL}/routines/", json={"name": "Morning Power", "description": "Desc", "icon": "🌅", "color": "#FFD700", "time_of_day": "morning", "schedule": {"recurrence_type": "daily", "days_of_week": []}}, headers=headers)
print("ROUTINE RESPONSE:")
print(r.text)
