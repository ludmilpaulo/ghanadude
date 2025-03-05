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
    data = request.data.copy()

    # Handle category: Check if it's an ID or a new category
    category_input = data.get('category')
    if category_input.isdigit():  
        category = Category.objects.get(id=int(category_input))
    else:  
        category, created = Category.objects.get_or_create(name=category_input.strip())
    
    data['category'] = category.id  

    # Create product serializer
    serializer = ProductSerializer(data=data)
    if serializer.is_valid():
        product = serializer.save()

        # Handle images
        images = request.FILES.getlist('uploaded_images')
        for image in images:
            img = Image.objects.create(image=image)
            product.images.add(img)
        product.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
