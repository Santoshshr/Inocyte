from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["email", "first_name", "last_name", "password", "password_confirm"]

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            "id", "email", "first_name", "last_name", "full_name",
            "role", "is_active", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "email", "created_at", "updated_at"]


class UserAdminSerializer(serializers.ModelSerializer):
    """Superadmin edits a sub-admin's details and status."""
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            "id", "email", "first_name", "last_name", "full_name",
            "role", "is_active", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "email", "role", "created_at", "updated_at"]


class UserAdminCreateSerializer(serializers.ModelSerializer):
    """Superadmin creates a sub-admin. Role is always forced to SUB_ADMIN."""
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        # role is intentionally excluded — it's set to SUB_ADMIN in perform_create
        fields = ["email", "first_name", "last_name", "password"]

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["first_name", "last_name"]
