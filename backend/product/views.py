from rest_framework import viewsets
import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.core.exceptions import ObjectDoesNotExist
from .models import Image, Product, Category, Brand, Designer
from .serializers import ProductSerializer, CategorySerializer, BrandSerializer, DesignerSerializer
from django.db import transaction

logger = logging.getLogger(__name__)
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    
    @action(detail=True, methods=['post'])
    def reduce_stock(self, request, pk=None):
        product = get_object_or_404(Product, pk=pk)
        quantity = int(request.data.get('quantity', 1))
        try:
            product.reduce_stock(quantity)
            return Response({'status': 'stock reduced', 'new_stock': product.stock})
        except ValueError as e:
            return Response({'error': str(e)}, status=400)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer

class DesignerViewSet(viewsets.ModelViewSet):
    queryset = Designer.objects.all()
    serializer_class = DesignerSerializer



logger = logging.getLogger(__name__)
import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import Product, Category, Brand, Image
from .serializers import ProductSerializer




@api_view(['POST'])
@permission_classes([AllowAny])
def create_product(request):
    logger.info("Received data: %s", request.data)
    logger.debug("FILES data: %s", request.FILES)
    print(request.data)

    data = dict(request.data)

    # Ensure category selection/input works correctly
    category_input = data.get('category', [""])[0]  # Extract as string
    if category_input.isdigit():
        category = Category.objects.get(id=int(category_input))
    elif category_input == "other":
        category_name = data.get('description', ["Unnamed Category"])[0].strip()
        category, created = Category.objects.get_or_create(name=category_name)
    else:
        category, created = Category.objects.get_or_create(name=category_input.strip())

    # Handle brand (default to "ghanadue")
    if "brand" not in data or not data["brand"][0].strip():
        brand, _ = Brand.objects.get_or_create(name="ghanadue")
    else:
        brand = Brand.objects.get(id=int(data["brand"][0]))

    # Extract and convert other fields
    name = data.get("name", [""])[0]
    description = data.get("description", [""])[0]
    price = float(data.get("price", ["0"])[0])
    stock = int(data.get("stock", ["0"])[0])
    season = data.get("season", [""])[0]

    # Ensure on_sale and discount_percentage are extracted correctly
    on_sale = data.get("on_sale", ["false"])[0].lower() in ["true", "1"]
    discount_percentage = float(data.get("discount_percentage", ["0"])[0])

    try:
        # Create Product
        product = Product.objects.create(
            name=name,
            category=category,
            description=description,
            price=price,
            stock=stock,
            season=season,
            brand=brand,
            on_sale=on_sale,
            discount_percentage=discount_percentage,
        )

        # Handle uploaded images properly
        uploaded_images = request.FILES.getlist('images')
        logger.debug("Received Images: %s", uploaded_images)

        if not uploaded_images:
            logger.warning("No images received!")

        for image in uploaded_images:
            img_instance = Image.objects.create(image=image)  # Create Image instance
            product.images.add(img_instance)  # Link Image to Product

        product.save()  # Save product to update ManyToMany relationship

        # Reload product to include images in the serializer
        product.refresh_from_db()

        # Serialize the product to return response
        serializer = ProductSerializer(product)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    except Exception as e:
        logger.error("Error creating product: %s", str(e))
        return Response({"error": "Failed to create product", "details": str(e)}, status=status.HTTP_400_BAD_REQUEST)




