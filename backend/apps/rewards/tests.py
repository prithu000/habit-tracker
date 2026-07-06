from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from apps.rewards.models import ForgeCoinTransaction

User = get_user_model()


class PersonalOperatingSystemRewardsTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="test_rewards_master@forge.ai",
            password="SecurePassword123!",
            display_name="Rewards Master"
        )
        # Give user 1000 FORGE Coins for store purchases
        ForgeCoinTransaction.objects.create(
            user=self.user,
            amount=1000,
            reason="QA Initial Endowment"
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_coins_endpoint(self):
        """Test FORGE Coins balance and transaction ledger."""
        url = reverse("os-coins")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()["data"]
        self.assertIn("balance", data)
        self.assertIn("transactions", data)
        self.assertEqual(data["balance"], 1000)

    def test_store_listing_and_purchase(self):
        """Test listing FORGE exchange items and simulating item purchase."""
        url = reverse("os-store")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()["data"]
        self.assertIn("items", data)
        self.assertIn("streak_freezes", data)
        self.assertIn("balance", data)
        self.assertTrue(len(data["items"]) > 0)

        # Test purchase POST (buying streak_freeze for 100 coins)
        first_item_id = data["items"][0]["id"]
        post_response = self.client.post(url, {"item_id": first_item_id}, format="json")
        self.assertEqual(post_response.status_code, status.HTTP_200_OK)
        post_data = post_response.json()["data"]
        self.assertIn("message", post_data)
        self.assertEqual(post_data["new_balance"], 900)

    def test_leagues_endpoint(self):
        """Test competitive arena division standings and leaderboard."""
        url = reverse("os-leagues")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()["data"]
        self.assertIn("user_league", data)
        self.assertIn("leaderboard", data)
        self.assertIn("scope", data)
        self.assertIn("division", data["user_league"])

    def test_hardcore_achievements_endpoint(self):
        """Test 100+ hardcore trophy room telemetry."""
        url = reverse("os-achievements-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()["data"]
        self.assertIn("unlocked_count", data)
        self.assertIn("total", data)
        self.assertIn("achievements", data)
        self.assertTrue(len(data["achievements"]) >= 5)

    def test_streak_freeze_use(self):
        """Test activating a streak freeze crest."""
        url = reverse("os-streak-freeze")
        response = self.client.post(url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()["data"]
        self.assertIn("status", data)
        self.assertIn("quantity", data)
