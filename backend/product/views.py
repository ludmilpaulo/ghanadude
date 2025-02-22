from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import Product, Category, Brand, Designer
from .serializers import ProductSerializer, CategorySerializer, BrandSerializer, DesignerSerializer

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