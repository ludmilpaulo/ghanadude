from django.urls import path
from .views import get_app_version

urlpatterns = [
    path('version/', get_app_version),
    ]

