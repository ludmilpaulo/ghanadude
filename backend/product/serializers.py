from rest_framework import serializers
from .models import Brand, Category, Designer, Product, Image, Wishlist


from .models import Product, Image, Category, Brand
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    user = (
        serializers.StringRelatedField()
    )  # or serializers.SerializerMethodField() for custom username

    class Meta:
        model = Review
        fields = ["id", "user", "comment", "rating", "created_at"]


class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = ["id", "image"]


class ProductSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source="category.name", read_only=True)
    sizes = serializers.SerializerMethodField()
    images = ImageSerializer(many=True, read_only=True)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(allow_empty_file=False, use_url=False),
        write_only=True,
        required=False,
    )

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "description",
            "price",
            "category",
            "brand",
            "stock",
            "on_sale",
            "bulk_sale",
            "discount_percentage",
            "season",
            "images",
            "uploaded_images",
            "sizes",
        ]

    def get_sizes(self, obj):
        return [size.name for size in obj.sizes.all()]

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["price"] = instance.price_with_markup
        return representation

    def create(self, validated_data):
        uploaded_images = validated_data.pop("uploaded_images", [])
        product = Product.objects.create(**validated_data)

        for image in uploaded_images:
            Image.objects.create(product=product, image=image)

        return product


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = "__all__"


class DesignerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Designer
        fields = "__all__"


class WishlistSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)  # Include full product details
    product_price = serializers.SerializerMethodField()

    class Meta:
        model = Wishlist
        fields = ["id", "user", "product", "product_price", "added_at"]

    def get_product_price(self, obj):
        return obj.product.price if obj.product and obj.product.price else 0.00
