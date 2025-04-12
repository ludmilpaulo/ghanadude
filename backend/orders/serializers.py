from rest_framework import serializers
from .models import BulkOrder, Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source="product.name")

    class Meta:
        model = OrderItem
        fields = ["id", "order", "product", "product_name", "quantity", "price"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user = serializers.ReadOnlyField(source="user.username")

    class Meta:
        model = Order
        fields = "__all__"
        read_only_fields = ("user", "created_at", "updated_at")


class BulkOrderSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source="user.username", read_only=True)
    product_name = serializers.CharField(source="product.name", read_only=True)
    designer_name = serializers.CharField(
        source="designer.name", default="", read_only=True
    )
    brand_logo_url = serializers.ImageField(source="brand_logo", read_only=True)
    custom_design_url = serializers.ImageField(source="custom_design", read_only=True)

    class Meta:
        model = BulkOrder
        fields = [
            "id",
            "user",
            "product_name",
            "quantity",
            "designer_name",
            "brand_logo_url",
            "custom_design_url",
            "status",
            "created_at",
            "address",
            "city",
            "postal_code",
            "country",  # 🏠 Shipping address
            "pin_code",
            "is_dispatched",
            "total_price",
            "order_type",  # 📦 Dispatch info
        ]
