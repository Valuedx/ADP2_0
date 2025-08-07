from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.test import TestCase, override_settings
from django.urls import reverse
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework.test import APITestCase


@override_settings(
    DATABASES={"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": ":memory:"}}
)
class PasswordResetConfirmViewTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="testpass123"
        )
        self.uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        self.token = default_token_generator.make_token(self.user)
        self.url = reverse("password-reset-confirm")

    @override_settings(FRONTEND_URL="http://frontend.example.com")
    def test_get_redirects_to_frontend_when_token_valid(self):
        response = self.client.get(self.url, {"uid": self.uid, "token": self.token})
        expected_url = (
            f"http://frontend.example.com/password-reset-confirm?uid={self.uid}&token={self.token}"
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response["Location"], expected_url)

    def test_get_missing_parameters_returns_400(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 400)


@override_settings(
    DATABASES={"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": ":memory:"}}
)
class CanProcessDocumentTests(TestCase):
    def test_zero_max_documents_allows_processing(self):
        User = get_user_model()
        user = User.objects.create_user(
            username="docuser", email="doc@example.com", password="testpass123", max_documents_allowed=0
        )
        can_process, _ = user.can_process_document()
        self.assertTrue(can_process)

