from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import AuditLog
from .permissions import IsSuperAdmin
from .serializers import (
    LoginSerializer,
    ProfileUpdateSerializer,
    RegisterSerializer,
    UserAdminSerializer,
    UserAdminCreateSerializer,
    UserSerializer,
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserSerializer(user).data,
                "tokens": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                },
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Django's authenticate() silently rejects inactive users (returns None)
        # before password checking even happens, which would make the is_active
        # check below unreachable. Look the user up directly so "wrong password"
        # and "deactivated account" stay distinguishable.
        try:
            user = User.objects.get(email__iexact=serializer.validated_data["email"])
        except User.DoesNotExist:
            user = None

        if user is None or not user.check_password(serializer.validated_data["password"]):
            return Response(
                {"status": "error", "message": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        if not user.is_active:
            return Response(
                {"status": "error", "message": "Account is deactivated."},
                status=status.HTTP_403_FORBIDDEN,
            )

        refresh = RefreshToken.for_user(user)
        return Response({
            "user": UserSerializer(user).data,
            "tokens": {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
        })


class LogoutView(APIView):
    def post(self, request):
        refresh_token = request.data.get("refresh")
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                pass  # Token already blacklisted or invalid
        return Response({"message": "Logged out."}, status=status.HTTP_200_OK)


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in ("PATCH", "PUT"):
            return ProfileUpdateSerializer
        return UserSerializer


# ── Admin User Management ─────────────────────────────
class UserListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsSuperAdmin]
    queryset = User.objects.all()
    search_fields = ["email", "first_name", "last_name"]
    ordering_fields = ["email", "created_at", "role"]
    filterset_fields = ["role", "is_active"]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return UserAdminCreateSerializer
        return UserSerializer

    def perform_create(self, serializer):
        # Force SUB_ADMIN role
        user = serializer.save(role=User.Role.SUB_ADMIN)
        AuditLog.objects.create(
            actor=self.request.user,
            target_user=user,
            action="SUB_ADMIN_CREATED"
        )


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsSuperAdmin]
    serializer_class = UserAdminSerializer
    queryset = User.objects.all()
    lookup_field = "pk"

    def perform_update(self, serializer):
        target_user = self.get_object()
        
        # Prevent self-deactivation/demotion via this endpoint
        if target_user == self.request.user:
            if serializer.validated_data.get("is_active") is False:
                raise ValidationError({"is_active": "You cannot deactivate your own account."})
            if serializer.validated_data.get("role") and serializer.validated_data.get("role") != "SUPERADMIN":
                raise ValidationError({"role": "You cannot remove your own Superadmin role."})

        # Prevent modification of OTHER Superadmins
        if target_user.role == "SUPERADMIN" and target_user != self.request.user:
            raise ValidationError({"role": "You cannot modify other Superadmins."})

        # Do not allow promoting to Superadmin through this API
        if serializer.validated_data.get("role") == "SUPERADMIN" and target_user.role != "SUPERADMIN":
            raise ValidationError({"role": "Cannot promote to Superadmin."})

        old_status = target_user.is_active
        updated_user = serializer.save()
        
        # Audit Log
        if old_status != updated_user.is_active:
            action = "SUB_ADMIN_ACTIVATED" if updated_user.is_active else "SUB_ADMIN_DEACTIVATED"
            AuditLog.objects.create(actor=self.request.user, target_user=updated_user, action=action)
        else:
            AuditLog.objects.create(actor=self.request.user, target_user=updated_user, action="SUB_ADMIN_UPDATED")

    def perform_destroy(self, instance):
        if instance == self.request.user:
            raise ValidationError("You cannot delete your own account.")
            
        if instance.role == "SUPERADMIN":
            raise ValidationError("You cannot delete a Superadmin account.")
            
        target_id = instance.id
        instance.delete()
        
        AuditLog.objects.create(
            actor=self.request.user,
            target_user=None,
            action=f"SUB_ADMIN_DELETED ({target_id})"
        )
