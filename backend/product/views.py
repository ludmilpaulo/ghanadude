from rest_framework import viewsets
import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.core.exceptions import ObjectDoesNotExist
from .models import Image, Product, Category, Brand, Designer, Size
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
    data = request.data

    category, _ = Category.objects.get_or_create(name=data.get('category', 'Uncategorized').strip())
    brand, _ = Brand.objects.get_or_create(name=data.get('brand', 'ghanadue').strip())

    try:
        product = Product.objects.create(
            name=data['name'],
            description=data['description'],
            price=float(data['price']),
            stock=int(data['stock']),
            season=data.get('season', 'all_seasons'),
            category=category,
            brand=brand,
            on_sale=data.get('on_sale', 'false').lower() in ['true', '1'],
            discount_percentage=int(data.get('discount_percentage', 0)),
        )

        sizes_list = data.getlist('sizes', [])
        for size_name in sizes_list:
            size, _ = Size.objects.get_or_create(name=size_name.strip())
            product.sizes.add(size)

        for image in request.FILES.getlist('images'):
            img_instance = Image.objects.create(image=image)
            product.images.add(img_instance)

        product.save()

        serializer = ProductSerializer(product)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": "Failed to create product", "details": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def sizes_list(request):
    sizes = Size.objects.all()
    return Response([{'id': size.id, 'name': size.name} for size in sizes])


# views.py
@api_view(["GET"])
def related_products(request, product_id):
    try:
        current = Product.objects.get(id=product_id)
        related = Product.objects.filter(category=current.category).exclude(id=product_id)[:10]
        serializer = ProductSerializer(related, many=True)
        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response([], status=200)

