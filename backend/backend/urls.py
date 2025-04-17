from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from home.deep_link import deep_link_redirect
from home.views import app_redirect_view


urlpatterns = [
    path("", app_redirect_view, name="app-redirect"),
    path('deeplink/product/<int:product_id>/', deep_link_redirect, name='deep_link_product'),
    path("api/", include("home.urls")),
    path(
        "admin/", admin.site.urls, name="admin"
    ),  # Use original admin site here with unique namespace
    path("account/", include("account.urls")),
    path("product/", include("product.urls")),
    path("order/", include("orders.urls")),
    path("reward/", include("revenue.urls")),
    path(
        "ckeditor5/", include("django_ckeditor_5.urls"), name="ck_editor_5_upload_file"
    ),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
