from django.urls import path, include

from .payfast_notify import payfast_notify

from .bulk_view import BulkOrderViewSet

from .admin_bulk import get_bulk_orders

from .order_view import OrderViewSet
from orders.user_orders import get_order_detail, get_user_orders
from orders.bulk_views import create_bulk_order

from .invoice_download import cancel_order, download_invoice

from .checkout_views import checkout


from rest_framework.routers import DefaultRouter
from revenue.views import location_statistics, sales_summary, user_statistics
from .views import OrderItemViewSet

router = DefaultRouter()
router.register(r"orders", OrderViewSet)
router.register(r"order-items", OrderItemViewSet)
router.register(r"bulk-orders", BulkOrderViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("checkout/", checkout, name="checkout"),
    path("admin/bulk-orders/", get_bulk_orders),
    path("orders/<int:order_id>/", get_order_detail, name="order-detail"),
    path("notify/", payfast_notify, name="payfast_notify"),
    path("bulk-orders/create/", create_bulk_order, name="create_bulk_order"),
    path("sales-summary/", sales_summary, name="sales-summary"),
    path("user-statistics/", user_statistics, name="user-statistics"),
    path("location-statistics/", location_statistics, name="location-statistics"),
    path("orders/<int:order_id>/invoice/", download_invoice, name="download-invoice"),
    path("orders/<int:order_id>/cancel/", cancel_order, name="cancel-order"),
    path("payfast/payment-notify/", payfast_notify, name="payfast_notify"),
]
