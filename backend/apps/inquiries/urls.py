from django.urls import path
from .views import InquiryDetailView, InquiryListView, InquirySubmitView

urlpatterns = [
    path("", InquiryListView.as_view(), name="inquiry-list"),
    path("submit/", InquirySubmitView.as_view(), name="inquiry-submit"),
    path("<uuid:pk>/", InquiryDetailView.as_view(), name="inquiry-detail"),
]
