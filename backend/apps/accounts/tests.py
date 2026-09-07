from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


def make_user(email, role, **extra):
    return User.objects.create_user(
        email=email, password="Str0ng-Passw0rd!", first_name="Test", last_name="User", role=role, **extra
    )


class LoginTests(APITestCase):
    def setUp(self):
        self.user = make_user("super@inocyte.test", User.Role.SUPERADMIN)

    def test_login_success_returns_tokens(self):
        res = self.client.post("/api/auth/login/", {"email": "super@inocyte.test", "password": "Str0ng-Passw0rd!"})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("access", res.data["tokens"])
        self.assertIn("refresh", res.data["tokens"])

    def test_login_wrong_password_is_401(self):
        res = self.client.post("/api/auth/login/", {"email": "super@inocyte.test", "password": "wrong"})
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_inactive_user_is_403(self):
        make_user("inactive@inocyte.test", User.Role.SUB_ADMIN, is_active=False)
        res = self.client.post("/api/auth/login/", {"email": "inactive@inocyte.test", "password": "Str0ng-Passw0rd!"})
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)


class UserManagementPermissionTests(APITestCase):
    def setUp(self):
        self.superadmin = make_user("super@inocyte.test", User.Role.SUPERADMIN)
        self.subadmin = make_user("sub@inocyte.test", User.Role.SUB_ADMIN)
        self.other_superadmin = make_user("super2@inocyte.test", User.Role.SUPERADMIN)

    def test_unauthenticated_is_401(self):
        res = self.client.get("/api/users/")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_subadmin_cannot_list_users(self):
        self.client.force_authenticate(self.subadmin)
        res = self.client.get("/api/users/")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_subadmin_cannot_create_subadmin(self):
        self.client.force_authenticate(self.subadmin)
        res = self.client.post("/api/users/", {
            "email": "new@inocyte.test", "first_name": "A", "last_name": "B", "password": "Str0ng-Passw0rd!",
        })
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_superadmin_can_create_subadmin_forced_role(self):
        self.client.force_authenticate(self.superadmin)
        res = self.client.post("/api/users/", {
            "email": "new@inocyte.test", "first_name": "A", "last_name": "B", "password": "Str0ng-Passw0rd!",
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        created = User.objects.get(email="new@inocyte.test")
        self.assertEqual(created.role, User.Role.SUB_ADMIN)

    def test_superadmin_can_deactivate_subadmin(self):
        self.client.force_authenticate(self.superadmin)
        res = self.client.patch(f"/api/users/{self.subadmin.id}/", {"is_active": False})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.subadmin.refresh_from_db()
        self.assertFalse(self.subadmin.is_active)

    def test_superadmin_cannot_self_deactivate(self):
        self.client.force_authenticate(self.superadmin)
        res = self.client.patch(f"/api/users/{self.superadmin.id}/", {"is_active": False})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_superadmin_cannot_modify_other_superadmin(self):
        self.client.force_authenticate(self.superadmin)
        res = self.client.patch(f"/api/users/{self.other_superadmin.id}/", {"first_name": "Hacked"})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_superadmin_cannot_delete_self(self):
        self.client.force_authenticate(self.superadmin)
        res = self.client.delete(f"/api/users/{self.superadmin.id}/")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_superadmin_cannot_delete_other_superadmin(self):
        self.client.force_authenticate(self.superadmin)
        res = self.client.delete(f"/api/users/{self.other_superadmin.id}/")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_superadmin_can_delete_subadmin(self):
        self.client.force_authenticate(self.superadmin)
        res = self.client.delete(f"/api/users/{self.subadmin.id}/")
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(id=self.subadmin.id).exists())
