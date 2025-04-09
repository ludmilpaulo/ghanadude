from django.urls import path

from .dev_earnings import developer_earnings_summary, create_dev_payment
from .views import get_app_version

urlpatterns = [
    path('version/', get_app_version),
    path('admin/dev-earnings/', developer_earnings_summary, name='developer-earnings'),
    path('admin/dev-payment/', create_dev_payment, name='developer-earnings'),
    ]

