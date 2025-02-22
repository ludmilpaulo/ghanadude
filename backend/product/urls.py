from django.urls import path
from .views import ProductViewSet, CategoryViewSet, BrandViewSet, DesignerViewSet

urlpatterns = [
    path('products/', ProductViewSet.as_view({'get': 'list', 'post': 'create'}), name='product-list'),
    path('roducts/<int:pk>/', ProductViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='product-detail'),
    path('products/<int:pk>/reduce_stock/', ProductViewSet.as_view({'post': 'reduce_stock'}), name='reduce-stock'),
    path('categories/', CategoryViewSet.as_view({'get': 'list', 'post': 'create'}), name='category-list'),
    path('categories/<int:pk>/', CategoryViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='category-detail'),
    path('brands/', BrandViewSet.as_view({'get': 'list', 'post': 'create'}), name='brand-list'),
    path('brands/<int:pk>/', BrandViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='brand-detail'),
    path('designers/', DesignerViewSet.as_view({'get': 'list', 'post': 'create'}), name='designer-list'),
    path('designers/<int:pk>/', DesignerViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='designer-detail'),
]
