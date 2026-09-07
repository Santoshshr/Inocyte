from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from apps.accounts.permissions import IsSubAdminOrSuperAdmin

from .filters import CompanyFilter
from .models import Company, Industry
from .serializers import CompanyDetailSerializer, CompanyListSerializer, IndustrySerializer


class CompanyListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsSubAdminOrSuperAdmin]
    filterset_class = CompanyFilter
    search_fields = ["name", "tagline", "description"]
    ordering_fields = ["name", "display_order", "created_at", "status"]

    def get_queryset(self):
        return Company.objects.select_related("industry", "created_by").all()

    def get_serializer_class(self):
        if self.request.method == "POST":
            return CompanyDetailSerializer
        return CompanyListSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class CompanyDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsSubAdminOrSuperAdmin]
    serializer_class = CompanyDetailSerializer
    lookup_field = "pk"

    def get_queryset(self):
        return Company.objects.select_related("industry", "created_by").all()

    def destroy(self, request, *args, **kwargs):
        """Soft delete: archive instead of hard delete."""
        company = self.get_object()
        company.status = Company.Status.ARCHIVED
        company.save(update_fields=["status", "updated_at"])
        return Response({"message": "Company archived."}, status=status.HTTP_200_OK)


class PublicCompanyListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = CompanyListSerializer
    
    def get_queryset(self):
        return Company.objects.exclude(status=Company.Status.ARCHIVED).order_by("display_order", "-created_at")


# ── Industry Views ────────────────────────────────────
class IndustryListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsSubAdminOrSuperAdmin]
    serializer_class = IndustrySerializer
    queryset = Industry.objects.all()
    search_fields = ["name"]
    ordering_fields = ["name", "display_order"]


class IndustryDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsSubAdminOrSuperAdmin]
    serializer_class = IndustrySerializer
    queryset = Industry.objects.all()
    lookup_field = "pk"

    def destroy(self, request, *args, **kwargs):
        """Soft delete."""
        industry = self.get_object()
        industry.is_active = False
        industry.save(update_fields=["is_active", "updated_at"])
        return Response({"message": "Industry deactivated."}, status=status.HTTP_200_OK)
