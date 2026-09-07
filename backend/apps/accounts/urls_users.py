from django.urls import path

from .views import ProfileView, UserDetailView, UserListCreateView

urlpatterns = [
    path("me/", ProfileView.as_view(), name="user-profile"),
    path("", UserListCreateView.as_view(), name="user-list"),
    path("<uuid:pk>/", UserDetailView.as_view(), name="user-detail"),
]
