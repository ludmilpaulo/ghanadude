from django.urls import path, include
from revenue.views import location_statistics, sales_summary, user_statistics


urlpatterns = [
   
    path('sales-summary/', sales_summary, name='sales-summary'),
    path('user-statistics/', user_statistics, name='user-statistics'),
    path('location-statistics/', location_statistics, name='location-statistics'),
]


