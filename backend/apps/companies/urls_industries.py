from django.urls import path
from .views import IndustryDetailView, IndustryListCreateView

urlpatterns = [
    path("", IndustryListCreateView.as_view(), name="industry-list"),
    path("<uuid:pk>/", IndustryDetailView.as_view(), name="industry-detail"),
]
