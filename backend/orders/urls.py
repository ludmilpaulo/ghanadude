from django.urls import path, include

from .checkout_views import checkout, payfast_notify


from .payfast import initiate_payment

from rest_framework.routers import DefaultRouter
from revenue.views import location_statistics, sales_summary, user_statistics
from .views import OrderViewSet, OrderItemViewSet

router = DefaultRouter()
router.register(r'orders', OrderViewSet)
router.register(r'order-items', OrderItemViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('checkout/', checkout, name='checkout'),
    path('notify/', payfast_notify, name='payfast_notify'),
    
    path('sales-summary/', sales_summary, name='sales-summary'),
    path('user-statistics/', user_statistics, name='user-statistics'),
    path('location-statistics/', location_statistics, name='location-statistics'),
    path('payfast/initiate-payment/', initiate_payment, name='initiate_payment'),
    path('payfast/payment-notify/', payfast_notify, name='payfast_notify'),
]


