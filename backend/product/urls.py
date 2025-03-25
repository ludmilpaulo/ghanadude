from django.urls import path

from .reviews import get_product_reviews, react_review

from .wishlist import add_to_wishlist, get_wishlist, remove_from_wishlist, wishlist_count

from .update import product_detail
from .views import ProductViewSet, CategoryViewSet, BrandViewSet, DesignerViewSet, create_product, related_products, sizes_list

urlpatterns = [
    path('products/create/', create_product, name='create-product'),
    path('products/detail/<int:pk>/', product_detail, name='product_detail'),
    path('products/', ProductViewSet.as_view({'get': 'list', 'post': 'create'}), name='product-list'),
    path('sizes/', sizes_list, name='sizes_list'),
    path('products/<int:pk>/', ProductViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='product-detail'),
    path('products/<int:pk>/reduce_stock/', ProductViewSet.as_view({'post': 'reduce_stock'}), name='reduce-stock'),
    path('categories/', CategoryViewSet.as_view({'get': 'list', 'post': 'create'}), name='category-list'),
    path('categories/<int:pk>/', CategoryViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='category-detail'),
    path('brands/', BrandViewSet.as_view({'get': 'list', 'post': 'create'}), name='brand-list'),
    path('brands/<int:pk>/', BrandViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='brand-detail'),
    path('designers/', DesignerViewSet.as_view({'get': 'list', 'post': 'create'}), name='designer-list'),
    path('designers/<int:pk>/', DesignerViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='designer-detail'),
    path("wishlist/", get_wishlist),
    path("wishlist/count/", wishlist_count),
    path("wishlist/add/", add_to_wishlist),
    path("wishlist/remove/<int:product_id>/", remove_from_wishlist),
    path("products/related/<int:product_id>/", related_products),
    path('products/<int:product_id>/reviews/', get_product_reviews, name='get_product_reviews'),
    path("reviews/<int:review_id>/react/", react_review),

]
