from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Company

User = get_user_model()


def make_user(email, role):
    return User.objects.create_user(email=email, password="Str0ng-Passw0rd!", first_name="T", last_name="U", role=role)


class CompanyPermissionTests(APITestCase):
    def setUp(self):
        self.superadmin = make_user("super@inocyte.test", User.Role.SUPERADMIN)
        self.subadmin = make_user("sub@inocyte.test", User.Role.SUB_ADMIN)
        self.company = Company.objects.create(name="Nirogi Health", status=Company.Status.ACTIVE)

    def test_unauthenticated_is_401(self):
        res = self.client.get("/api/companies/")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_public_endpoint_requires_no_auth(self):
        res = self.client.get("/api/companies/public/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_subadmin_can_list(self):
        self.client.force_authenticate(self.subadmin)
        res = self.client.get("/api/companies/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_subadmin_cannot_create(self):
        self.client.force_authenticate(self.subadmin)
        res = self.client.post("/api/companies/", {"name": "New Co"})
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_subadmin_cannot_update(self):
        self.client.force_authenticate(self.subadmin)
        res = self.client.patch(f"/api/companies/{self.company.id}/", {"name": "Hacked"})
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_subadmin_cannot_delete(self):
        self.client.force_authenticate(self.subadmin)
        res = self.client.delete(f"/api/companies/{self.company.id}/")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_superadmin_can_create(self):
        self.client.force_authenticate(self.superadmin)
        res = self.client.post("/api/companies/", {"name": "New Co", "status": "upcoming"})
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_superadmin_update_and_soft_delete(self):
        self.client.force_authenticate(self.superadmin)
        res = self.client.patch(f"/api/companies/{self.company.id}/", {"tagline": "Updated"})
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        res = self.client.delete(f"/api/companies/{self.company.id}/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.company.refresh_from_db()
        self.assertEqual(self.company.status, Company.Status.ARCHIVED)
