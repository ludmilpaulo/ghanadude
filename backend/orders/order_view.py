from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth.models import User

from .models import Order, BulkOrder
from .serializers import OrderSerializer
from product.serializers import ProductSerializer

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['patch'], url_path='update-status')
    def update_status(self, request, pk=None):
        order = self.get_object()
        status_value = request.data.get('status')
        if status_value not in dict(Order.STATUS_CHOICES):
            return Response({"detail": "Invalid status."}, status=status.HTTP_400_BAD_REQUEST)
        order.status = status_value
        order.save()
        return Response(OrderSerializer(order).data)

    @action(detail=False, methods=['post'], url_path='user')
    def get_user_orders(self, request):
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

        # Regular orders
        orders = Order.objects.filter(user=user, status=status_filter).order_by('-created_at')
        result_page = paginator.paginate_queryset(orders, request)

        order_data = []
        for order in result_page:
            items = order.items.select_related('product').all()
            serialized_items = [{
                'product': ProductSerializer(item.product).data,
                'quantity': item.quantity,
                'price': item.price
            } for item in items]

            order_data.append({
                'id': order.id,
                'status': order.status,
                'total_price': order.total_price,
                'created_at': order.created_at,
                'items': serialized_items,
                'type': 'regular',
            })

        # Bulk orders
        bulk_orders = BulkOrder.objects.filter(user=user, status=status_filter).order_by('-created_at')
        serialized_bulk = [{
            'id': bo.id,
            'product': ProductSerializer(bo.product).data,
            'quantity': bo.quantity,
            'brand_logo': bo.brand_logo.url if bo.brand_logo else None,
            'custom_design': bo.custom_design.url if bo.custom_design else None,
            'created_at': bo.created_at,
            'type': 'bulk',
        } for bo in bulk_orders]

        combined = order_data + serialized_bulk
        combined_sorted = sorted(combined, key=lambda x: x['created_at'], reverse=True)

        return paginator.get_paginated_response(combined_sorted)
