from rest_framework import serializers
from .models import BulkOrder, BulkOrderItem, Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source="product.name")

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "order",
            "product",
            "product_name",
            "quantity",
            "price",
            "selected_size",
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user = serializers.ReadOnlyField(source="user.username")

    class Meta:
        model = Order
        fields = "__all__"
        read_only_fields = ("user", "created_at", "updated_at")


class BulkOrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source="product.name", default=None, read_only=True
    )
    brand_logo = serializers.SerializerMethodField()
    custom_design = serializers.SerializerMethodField()

    class Meta:
        model = BulkOrderItem
        fields = [
            "product_name",
            "quantity",
            "price",
            "brand_logo",
            "custom_design",
            "selected_size",
        ]

    def get_brand_logo(self, obj):
        return obj.brand_logo_url

    def get_custom_design(self, obj):
        return obj.custom_design_url


class BulkOrderSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source="user.username", read_only=True)
    designer_name = serializers.CharField(
        source="designer.name", default="", read_only=True
    )
    items = BulkOrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = BulkOrder
        fields = [
            "id",
            "user",
            "designer_name",
            "items",
            "status",
            "created_at",
            "address",
            "city",
            "postal_code",
            "country",
            "pin_code",
            "is_dispatched",
            "total_price",
            "order_type",
        ]
