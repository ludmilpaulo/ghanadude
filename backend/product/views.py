from rest_framework import viewsets
import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import Image, Product, Category, Brand, Designer
from .serializers import ProductSerializer, CategorySerializer, BrandSerializer, DesignerSerializer
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
    
    
@api_view(['POST'])
@permission_classes([AllowAny])
def create_product(request):
    logger.debug("POST request received")
    logger.debug("POST data: %s", request.data)
    logger.debug("FILES data: %s", request.FILES)

    data = request.data.copy()

    # Handle category
    category_input = data.get('category')
    if category_input.isdigit():
        category = Category.objects.get(id=int(category_input))
    else:
        category, created = Category.objects.get_or_create(name=category_input.strip())

    data['category'] = category.id

    # Handle brand (default to 'ghanadue')
    if "brand" not in data or not data["brand"].strip():
        try:
            default_brand = Brand.objects.get(name="ghanadue")
        except Brand.DoesNotExist:
            default_brand = Brand.objects.create(name="ghanadue")
        data["brand"] = default_brand.id

    # Debugging uploaded images
    uploaded_images = request.FILES.getlist('uploaded_images')
    logger.debug("Uploaded Images: %s", uploaded_images)

    # Create product
    serializer = ProductSerializer(data=data)
    if serializer.is_valid():
        product = serializer.save()

        for image in uploaded_images:
            img = Image.objects.create(image=image)
            product.images.add(img)
        product.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    logger.debug("Validation Errors: %s", serializer.errors)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


