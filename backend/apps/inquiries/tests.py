from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .models import ContactInquiry

User = get_user_model()


def make_user(email, role):
    return User.objects.create_user(email=email, password="Str0ng-Passw0rd!", first_name="T", last_name="U", role=role)


class InquiryPermissionTests(APITestCase):
    def setUp(self):
        self.superadmin = make_user("super@inocyte.test", User.Role.SUPERADMIN)
        self.subadmin = make_user("sub@inocyte.test", User.Role.SUB_ADMIN)
        self.inquiry = ContactInquiry.objects.create(name="Jane Doe", email="jane@example.com", message="Hello")

    def test_public_submit_requires_no_auth(self):
        res = self.client.post("/api/inquiries/submit/", {
            "name": "Visitor", "email": "visitor@example.com", "message": "Hi there",
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_unauthenticated_cannot_list(self):
        res = self.client.get("/api/inquiries/")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_subadmin_can_list_and_view(self):
        self.client.force_authenticate(self.subadmin)
        res = self.client.get("/api/inquiries/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        res = self.client.get(f"/api/inquiries/{self.inquiry.id}/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["message"], "Hello")

    def test_subadmin_cannot_change_status(self):
        self.client.force_authenticate(self.subadmin)
        res = self.client.patch(f"/api/inquiries/{self.inquiry.id}/", {"status": "read"})
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_subadmin_cannot_delete(self):
        self.client.force_authenticate(self.subadmin)
        res = self.client.delete(f"/api/inquiries/{self.inquiry.id}/")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_superadmin_can_change_status(self):
        self.client.force_authenticate(self.superadmin)
        res = self.client.patch(f"/api/inquiries/{self.inquiry.id}/", {"status": "replied"})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.inquiry.refresh_from_db()
        self.assertEqual(self.inquiry.status, ContactInquiry.Status.REPLIED)

    def test_superadmin_delete_archives(self):
        self.client.force_authenticate(self.superadmin)
        res = self.client.delete(f"/api/inquiries/{self.inquiry.id}/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.inquiry.refresh_from_db()
        self.assertEqual(self.inquiry.status, ContactInquiry.Status.ARCHIVED)

    def test_search_filter(self):
        self.client.force_authenticate(self.superadmin)
        res = self.client.get("/api/inquiries/", {"search": "Jane"})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["count"], 1)
        res = self.client.get("/api/inquiries/", {"search": "Nobody"})
        self.assertEqual(res.data["count"], 0)
