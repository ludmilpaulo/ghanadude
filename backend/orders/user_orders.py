from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework import status
from django.contrib.auth.models import User
from .models import Order, OrderItem, BulkOrder
from product.serializers import ProductSerializer
from product.models import Product
from .serializers import OrderItemSerializer, BulkOrderSerializer
# backend/orders/order_views.py





@api_view(['GET'])
@permission_classes([AllowAny])
def get_order_detail(request, order_id):
    try:
        order = Order.objects.get(pk=order_id, user=request.user)
        items = OrderItem.objects.filter(order=order).select_related('product')

        products = [
            {
                "id": item.product.id,
                "name": item.product.name,
                "quantity": item.quantity,
                "price": float(item.price),
                "image_url": item.product.images.first().image.url if item.product.images.exists() else '',
            }
            for item in items
        ]

        return Response({
            "id": order.id,
            "status": order.status,
            "total_price": str(order.total_price),
            "created_at": order.created_at,
            "products": products,
            "confirmed_at": order.created_at,
            "shipped_at": order.updated_at,
            "delivered_at": None  # You can dynamically update this
        })

    except Order.DoesNotExist:
        return Response({"error": "Order not found"}, status=404)


@api_view(['POST', 'GET'])
@permission_classes([AllowAny])
def get_user_orders(request):
    user_id = request.data.get('user_id')
    status_filter = request.data.get('status')

    if not user_id or not status_filter:
        return Response({'error': 'user_id and status are required.'}, status=400)

    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=404)

    paginator = PageNumberPagination()
    paginator.page_size = 10

    # Regular Orders
    orders = Order.objects.filter(user=user, status=status_filter).order_by('-created_at')
    result_page = paginator.paginate_queryset(orders, request)

    order_data = []
    for order in result_page:
        items = order.items.select_related('product').all()
        serialized_items = []
        for item in items:
            serialized_items.append({
                'product': ProductSerializer(item.product).data,
                'quantity': item.quantity,
                'price': item.price
            })
        order_data.append({
            'id': order.id,
            'status': order.status,
            'total_price': order.total_price,
            'created_at': order.created_at,
            'items': serialized_items,
            'type': 'regular',
        })

    # Bulk Orders
    bulk_orders = BulkOrder.objects.filter(user=user, status=status_filter).order_by('-created_at')
    serialized_bulk = [
        {
            'id': bo.id,
            'product': ProductSerializer(bo.product).data,
            'quantity': bo.quantity,
            'brand_logo': bo.brand_logo.url if bo.brand_logo else None,
            'custom_design': bo.custom_design.url if bo.custom_design else None,
            'created_at': bo.created_at,
            'type': 'bulk',
        }
        for bo in bulk_orders
    ]

    combined = order_data + serialized_bulk
    combined_sorted = sorted(combined, key=lambda x: x['created_at'], reverse=True)

    return paginator.get_paginated_response(combined_sorted)
