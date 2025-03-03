
from rest_framework import serializers
from .models import Brand, Category, Designer, Product, Image



class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = ["id", "image"]

class ProductSerializer(serializers.ModelSerializer):
    images = ImageSerializer(many=True, read_only=True)  # Read images when retrieving product
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(allow_empty_file=False, use_url=False), write_only=True
    )  # Accept multiple images on creation

    class Meta:
        model = Product
        fields = [
            "id", "name", "description", "price", "category", "brand", "stock", 
            "on_sale", "discount_percentage", "season", "images", "uploaded_images"
        ]

    def create(self, validated_data):
        uploaded_images = validated_data.pop("uploaded_images", [])  # Extract images from request
        product = Product.objects.create(**validated_data)

        for image in uploaded_images:
            Image.objects.create(product=product, image=image)

        return product



class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = '__all__'

class DesignerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Designer
        fields = '__all__'