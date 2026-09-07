from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .models import SiteSetting

User = get_user_model()


def make_user(email, role):
    return User.objects.create_user(email=email, password="Str0ng-Passw0rd!", first_name="T", last_name="U", role=role)


class SettingsPermissionTests(APITestCase):
    def setUp(self):
        self.superadmin = make_user("super@inocyte.test", User.Role.SUPERADMIN)
        self.subadmin = make_user("sub@inocyte.test", User.Role.SUB_ADMIN)
        # The data migration already seeds this key — reuse it instead of colliding on the unique constraint.
        self.setting, _ = SiteSetting.objects.get_or_create(
            key="contact_email", defaults={"group": SiteSetting.Group.CONTACT, "value": ""}
        )

    def test_unauthenticated_is_401(self):
        res = self.client.get("/api/settings/")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_subadmin_can_read(self):
        self.client.force_authenticate(self.subadmin)
        res = self.client.get("/api/settings/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_subadmin_cannot_write(self):
        self.client.force_authenticate(self.subadmin)
        res = self.client.patch(f"/api/settings/{self.setting.key}/", {"value": "x@y.com"})
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_subadmin_cannot_bulk_update(self):
        self.client.force_authenticate(self.subadmin)
        res = self.client.patch("/api/settings/bulk-update/", {
            "settings": [{"key": "contact_email", "value": "x@y.com"}]
        }, format="json")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_superadmin_bulk_update_valid(self):
        self.client.force_authenticate(self.superadmin)
        res = self.client.patch("/api/settings/bulk-update/", {
            "settings": [{"key": "contact_email", "value": "hello@inocyte.test"}]
        }, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.setting.refresh_from_db()
        self.assertEqual(self.setting.value, "hello@inocyte.test")

    def test_superadmin_bulk_update_invalid_email_rejected(self):
        self.client.force_authenticate(self.superadmin)
        res = self.client.patch("/api/settings/bulk-update/", {
            "settings": [{"key": "contact_email", "value": "not-an-email"}]
        }, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_superadmin_bulk_update_unknown_key_rejected(self):
        self.client.force_authenticate(self.superadmin)
        res = self.client.patch("/api/settings/bulk-update/", {
            "settings": [{"key": "does_not_exist", "value": "x"}]
        }, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
