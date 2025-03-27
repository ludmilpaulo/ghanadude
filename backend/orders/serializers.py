from rest_framework import serializers
from .models import BulkOrder, Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')

    class Meta:
        model = OrderItem
        fields = ['id', 'order', 'product', 'product_name', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')
        


class BulkOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = BulkOrder
        fields = '__all__'
        read_only_fields = ['user', 'status', 'created_at']

