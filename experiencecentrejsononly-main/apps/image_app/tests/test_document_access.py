from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from rest_framework.test import APITestCase
from rest_framework import status
from apps.image_app.models import Document
from django.conf import settings
import tempfile
import os
import configparser
from cryptography.fernet import Fernet


@override_settings(
    DATABASES={"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": ":memory:"}},
    MEDIA_ROOT=tempfile.gettempdir(),
)
class DocumentAccessTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.owner = User.objects.create_user(username="owner", password="pass")
        self.default_user = User.objects.create_user(username="default", password="pass", user_type="default")
        self.power_user = User.objects.create_user(username="power", password="pass", user_type="power")

        upload = SimpleUploadedFile("test.pdf", b"filecontent", content_type="application/pdf")
        self.document = Document.objects.create(
            userid=self.owner,
            file_path="uploads/test.pdf",
            file=upload,
            json_data={},
            entry_date=timezone.now().date(),
        )

        config = configparser.ConfigParser()
        config.read(os.path.join(settings.BASE_DIR, "apps", "image_app", "config.properties"))
        key = config.get("Input", "FERNET_KEY")
        self.fernet = Fernet(key.encode())
        self.encrypted_id = self.fernet.encrypt(str(self.document.id).encode()).decode()

    def test_default_user_cannot_retrieve_others_document(self):
        self.client.force_authenticate(user=self.default_user)
        url = reverse("get-document-by-id", args=[self.encrypted_id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_power_user_cannot_retrieve_others_document(self):
        self.client.force_authenticate(user=self.power_user)
        url = reverse("get-document-by-id", args=[self.encrypted_id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_default_user_cannot_filter_others_documents(self):
        self.client.force_authenticate(user=self.default_user)
        url = reverse("filtered-documents")
        data = {"userid": self.owner.id, "date": self.document.entry_date.isoformat()}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_power_user_cannot_filter_others_documents(self):
        self.client.force_authenticate(user=self.power_user)
        url = reverse("filtered-documents")
        data = {"userid": self.owner.id, "date": self.document.entry_date.isoformat()}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_filtered_documents_invalid_userid_returns_bad_request(self):
        self.client.force_authenticate(user=self.owner)
        url = reverse("filtered-documents")
        data = {"userid": "not-an-int", "date": self.document.entry_date.isoformat()}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Invalid user ID", response.data.get("error", ""))
