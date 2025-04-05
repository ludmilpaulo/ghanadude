from django.urls import path, include

from .coupon_views import redeem_rewards, get_user_rewards, get_user_coupons
from revenue.views import location_statistics, sales_summary, user_statistics


urlpatterns = [
    path('rewards/', get_user_rewards, name='user-rewards'), 
    path('sales-summary/', sales_summary, name='sales-summary'),
    path('user-statistics/', user_statistics, name='user-statistics'),
    path('location-statistics/', location_statistics, name='location-statistics'),
]


