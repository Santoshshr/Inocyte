from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.accounts.permissions import IsSubAdminOrSuperAdmin

from .models import ContactInquiry
from .serializers import InquiryDetailSerializer, InquiryListSerializer, InquirySubmitSerializer


class InquiryListView(generics.ListAPIView):
    permission_classes = [IsSubAdminOrSuperAdmin]
    serializer_class = InquiryListSerializer
    queryset = ContactInquiry.objects.all()
    search_fields = ["name", "email", "subject"]
    ordering_fields = ["created_at", "status"]
    filterset_fields = ["status"]


class InquiryDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsSubAdminOrSuperAdmin]
    serializer_class = InquiryDetailSerializer
    queryset = ContactInquiry.objects.all()
    lookup_field = "pk"

    def destroy(self, request, *args, **kwargs):
        """Soft delete: archive."""
        inquiry = self.get_object()
        inquiry.status = ContactInquiry.Status.ARCHIVED
        inquiry.save(update_fields=["status", "updated_at"])
        return Response({"message": "Inquiry archived."}, status=status.HTTP_200_OK)


class InquirySubmitView(generics.CreateAPIView):
    """Public endpoint for contact form submissions."""
    permission_classes = [AllowAny]
    serializer_class = InquirySubmitSerializer
