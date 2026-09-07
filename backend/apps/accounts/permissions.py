from rest_framework import permissions


class IsSuperAdmin(permissions.BasePermission):
    """Only SUPERADMIN users (Full access)."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "SUPERADMIN"


class IsSubAdminOrSuperAdmin(permissions.BasePermission):
    """SUB_ADMIN for read-only (GET), SUPERADMIN for full access."""

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
            
        if request.user.role == "SUPERADMIN":
            return True
            
        if request.user.role == "SUB_ADMIN":
            return request.method in permissions.SAFE_METHODS
            
        return False
