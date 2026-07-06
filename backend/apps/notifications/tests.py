from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status

User = get_user_model()


class PersonalOperatingSystemNotificationsTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="test_notif_agent@forge.ai",
            password="SecurePassword123!",
            display_name="Notification Agent"
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_support_report_submission(self):
        """Test submitting a diagnostic issue report to rahul.business940@gmail.com."""
        url = reverse("os-support-report")
        payload = {
            "issue_type": "Bug Report",
            "title": "Radar chart test report",
            "description": "Testing automated email dispatch from QA suite.",
            "browser": "Mozilla/5.0 QA Agent",
            "version": "POS v2.0-QA",
            "logs": "No exceptions."
        }
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()["data"]
        self.assertIsInstance(data, dict)

    def test_pomodoro_email_trigger(self):
        """Test triggering focus session telemetry email notification."""
        url = reverse("os-pomodoro-email")
        payload = {
            "action": "start",
            "session_type": "deep_work",
            "duration": 25
        }
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()["data"]
        self.assertIsInstance(data, dict)

    def test_email_reminders_get_and_post(self):
        """Test retrieving and updating user email reminder schedules."""
        url = reverse("os-reminders")
        # GET
        get_res = self.client.get(url)
        self.assertEqual(get_res.status_code, status.HTTP_200_OK)
        get_data = get_res.json()["data"]
        self.assertIn("reminders", get_data)
        self.assertIsInstance(get_data["reminders"], list)

        # POST update with required fields
        post_payload = {
            "task_name": "Morning Neural Calibration",
            "deadline": "2026-12-31T08:00:00Z",
            "priority": "High",
            "frequency": "Daily"
        }
        post_res = self.client.post(url, post_payload, format="json")
        self.assertIn(post_res.status_code, [status.HTTP_200_OK, status.HTTP_201_CREATED])
        post_data = post_res.json()["data"]
        self.assertIsInstance(post_data, dict)
