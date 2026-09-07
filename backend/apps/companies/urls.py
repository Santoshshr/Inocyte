from django.urls import path
from .views import CompanyDetailView, CompanyListCreateView, PublicCompanyListView

urlpatterns = [
    path("public/", PublicCompanyListView.as_view(), name="public-company-list"),
    path("", CompanyListCreateView.as_view(), name="company-list"),
    path("<uuid:pk>/", CompanyDetailView.as_view(), name="company-detail"),
]
