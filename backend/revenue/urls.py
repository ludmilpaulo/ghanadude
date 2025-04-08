from django.urls import path, include

from .top_products_by_month import city_sales_by_product, top_products_by_month, top_users_by_spending

from .coupon_views import get_user_rewards, get_user_coupons
from revenue.views import location_statistics, sales_range, sales_summary, user_statistics


urlpatterns = [
    path('sales_range/', sales_range, name='sales-range'), 
    path('rewards/', get_user_rewards, name='user-rewards'),
    path("city-sales-by-product/", city_sales_by_product),
    path("top_products_by_month/", top_products_by_month, name="top-products-by-month"),
    path("user/top-spenders/", top_users_by_spending),
    path('sales-summary/', sales_summary, name='sales-summary'),
    path('user-statistics/', user_statistics, name='user-statistics'),
    path('location-statistics/', location_statistics, name='location-statistics'),
]


