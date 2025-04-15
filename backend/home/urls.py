from django.urls import path

from .app_settings import app_version_list, app_version_update, site_settings_view

from .dispatch_views import dispatch_order

from .emails_views import send_promotional_email
from .dev_earnings import (
    developer_earnings_summary,
    create_dev_payment,
    get_dev_payments,
)
from .views import SiteSettingView, get_app_version

urlpatterns = [
    path("version/", get_app_version),
    path("dispatch-order/", dispatch_order, name="dispatch_order"),
    path("site-settings/", SiteSettingView.as_view(), name="site-settings"),
    path("send-promotional-email/", send_promotional_email),
    path("admin/dev-earnings/", developer_earnings_summary, name="developer-earnings"),
    path("admin/dev-payment/", create_dev_payment, name="create-dev-payment"),
    path("admin/dev-payments/", get_dev_payments, name="dev-payment-history"),
    path("settings/site/", site_settings_view),
    path("settings/app-versions/", app_version_list),
    path("settings/app-versions/<int:pk>/", app_version_update),
]
