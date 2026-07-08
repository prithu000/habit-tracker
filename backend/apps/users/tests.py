from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from unittest.mock import patch, MagicMock
import json as pyjson

User = get_user_model()


class AuthAndGoogleOAuthTests(APITestCase):
    def setUp(self):
        self.client = APIClient()

    @patch("urllib.request.urlopen")
    def test_google_auth_new_user_creation(self, mock_urlopen):
        """Test auto account creation via Google OAuth endpoint."""
        client_id = "test-google-client-id.apps.googleusercontent.com"
        payload_data = {
            "email": "google_test_user@gmail.com",
            "name": "Google Test User",
            "picture": "https://api.dicebear.com/7.x/avataaars/svg?seed=google",
            "aud": client_id
        }
        
        mock_resp = MagicMock()
        mock_resp.status = 200
        mock_resp.read.return_value = pyjson.dumps(payload_data).encode('utf-8')
        mock_resp.__enter__.return_value = mock_resp
        mock_urlopen.return_value = mock_resp

        url = reverse("auth-google")
        payload = {
            "email": "google_test_user@gmail.com",
            "name": "Google Test User",
            "picture": "https://api.dicebear.com/7.x/avataaars/svg?seed=google",
            "token": "simulated_oauth_token_12345"
        }
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json().get("data", response.json())
        self.assertIn("access", data)
        self.assertIn("refresh", data)
        self.assertIn("user", data)
        self.assertEqual(data["user"]["email"], "google_test_user@gmail.com")
        self.assertEqual(data["user"]["display_name"], "Google Test User")

        # Verify user persisted in database
        user = User.objects.get(email="google_test_user@gmail.com")
        self.assertTrue(user.is_active)
        self.assertTrue(getattr(user, "is_verified", True))

    @patch("urllib.request.urlopen")
    def test_google_auth_existing_user_login(self, mock_urlopen):
        """Test login via Google OAuth for an existing user account."""
        client_id = "test-google-client-id.apps.googleusercontent.com"
        payload_data = {
            "email": "existing_google_user@gmail.com",
            "name": "Existing User Updated",
            "picture": "https://api.dicebear.com/7.x/avataaars/svg?seed=existing",
            "aud": client_id
        }
        
        mock_resp = MagicMock()
        mock_resp.status = 200
        mock_resp.read.return_value = pyjson.dumps(payload_data).encode('utf-8')
        mock_resp.__enter__.return_value = mock_resp
        mock_urlopen.return_value = mock_resp

        existing_user = User.objects.create_user(
            email="existing_google_user@gmail.com",
            password="SecurePassword123!",
            display_name="Existing User"
        )
        url = reverse("auth-google")
        payload = {
            "email": "existing_google_user@gmail.com",
            "name": "Existing User Updated",
            "picture": "https://api.dicebear.com/7.x/avataaars/svg?seed=existing",
            "token": "simulated_oauth_token_67890"
        }
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json().get("data", response.json())
        self.assertEqual(data["user"]["id"], str(existing_user.id))
        self.assertEqual(data["user"]["email"], "existing_google_user@gmail.com")
