from django.urls import path
from .dev_earnings import developer_earnings_summary, create_dev_payment, get_dev_payments
from .views import SiteSettingView, get_app_version

urlpatterns = [
    path('version/', get_app_version),
    path("site-settings/", SiteSettingView.as_view(), name="site-settings"),
    path('admin/dev-earnings/', developer_earnings_summary, name='developer-earnings'),
    path('admin/dev-payment/', create_dev_payment, name='create-dev-payment'),
    path('admin/dev-payments/', get_dev_payments, name='dev-payment-history'),
]
