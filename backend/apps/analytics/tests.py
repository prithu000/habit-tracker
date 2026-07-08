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

    def test_score_engine_calculations(self):
        """Test direct ScoreEngine 2.0 calculations, anti-gaming penalties, and 9-axis radar."""
        from datetime import date
        from services.score_engine import ScoreEngine
        from apps.completions.models import DayLog
        local_date = date.today()

        # 1. Verify Initialization state (0 tracked days -> Rule 2, 3, 4, 8)
        life_data = ScoreEngine.get_life_score_data(self.user, local_date, force_refresh=True)
        self.assertIn("overall_score", life_data)
        self.assertIn("confidence_pct", life_data)
        self.assertIn("trend", life_data)
        self.assertIn("breakdown", life_data)
        self.assertEqual(life_data["overall_score"], 0)
        self.assertTrue(life_data.get("is_initializing", False))

        disc_data = ScoreEngine.get_discipline_score(self.user, local_date, force_refresh=True)
        self.assertIn("score", disc_data)
        self.assertIn("grade", disc_data)
        self.assertEqual(disc_data["score"], 0)
        self.assertTrue(disc_data.get("is_initializing", False))

        radar_data = ScoreEngine.get_radar_diagnostic(self.user, local_date)
        self.assertIn("axes", radar_data)
        self.assertEqual(len(radar_data["axes"]), 9)
        self.assertTrue(radar_data.get("is_initializing", False))

        dim_data = ScoreEngine.get_dimensional_breakdown(self.user, local_date)
        self.assertEqual(len(dim_data), 9)
        self.assertEqual(dim_data[0]["score"], 0)

        # 2. Verify Active state (after logging meaningful activity)
        from apps.analytics.models import DailyOSMetrics
        DayLog.objects.create(user=self.user, log_date=local_date, tasks_scheduled=5, tasks_completed=5)
        DailyOSMetrics.objects.update_or_create(user=self.user, date=local_date, defaults={"water_ml": 2500, "study_mins": 60, "workout_exercises": 5})
        active_life = ScoreEngine.get_life_score_data(self.user, local_date, force_refresh=True)
        self.assertTrue(50 <= active_life["overall_score"] <= 100)
        self.assertFalse(active_life.get("is_initializing", False))

        active_disc = ScoreEngine.get_discipline_score(self.user, local_date, force_refresh=True)
        self.assertTrue(50 <= active_disc["score"] <= 100)
        self.assertFalse(active_disc.get("is_initializing", False))

        active_dim = ScoreEngine.get_dimensional_breakdown(self.user, local_date)
        self.assertEqual(len(active_dim), 9)
        self.assertIn("ai_insight", active_dim[0])
        self.assertIn("recommendation", active_dim[0])
