from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status

User = get_user_model()


class PersonalOperatingSystemAnalyticsTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="test_pos_architect@forge.ai",
            password="SecurePassword123!",
            display_name="Master Architect"
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_life_score_endpoint(self):
        """Test the flagship 9-axis Life Score calculation and radar data endpoint."""
        url = reverse("os-life-score")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()["data"]
        self.assertIn("overall_score", data)
        self.assertIn("categories", data)
        self.assertIn("history", data)
        self.assertIn("ai_analysis", data)
        self.assertEqual(len(data["categories"]), 9)

    def test_motivation_endpoint(self):
        """Test the AI Neural motivation banner endpoint."""
        url = reverse("os-motivation")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()["data"]
        self.assertIn("should_show", data)
        self.assertIn("title", data)
        self.assertIn("motivation", data)
        self.assertIn("advice", data)

    def test_smart_reports_endpoint(self):
        """Test multi-timeframe executive telemetry reporting."""
        url = reverse("os-reports")
        response = self.client.get(url, {"timeframe": "weekly"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()["data"]
        self.assertIn("summary", data)
        self.assertIn("chart_data", data)
        self.assertIn("smart_statistics", data)
        self.assertIn("ai_summary", data["summary"])

    def test_timeline_endpoint(self):
        """Test historical chronological telemetry timeline."""
        url = reverse("os-timeline")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()["data"]
        self.assertIn("timeline", data)
        self.assertIsInstance(data["timeline"], list)
