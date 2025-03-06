
from rest_framework import serializers
from .models import Brand, Category, Designer, Product, Image


from .models import Product, Image, Category, Brand

class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = ["id", "image"]
class ProductSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source="category.name", read_only=True)  
    images = ImageSerializer(many=True, read_only=True)  
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(allow_empty_file=False, use_url=False),
        write_only=True,
        required=False  # ✅ Make this field optional
    )  

    class Meta:
        model = Product
        price = serializers.DecimalField(max_digits=10, decimal_places=2)
        stock = serializers.IntegerField()
        fields = [
            "id", "name", "description", "price", "category", "brand", "stock", 
            "on_sale", "discount_percentage", "season", "images", "uploaded_images"
        ]

    def create(self, validated_data):
        uploaded_images = validated_data.pop("uploaded_images", [])  # Extract images if provided
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