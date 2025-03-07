from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from .models import Product, Category, Image
from .serializers import ProductSerializer

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def product_detail(request, pk):
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ProductSerializer(product, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'PUT':
        data = request.data.copy()

        # Handle category
        category_name = data.get('category')
        category, created = Category.objects.get_or_create(name=category_name)
        data['category'] = category.id

        # Handle on_sale and discount_percentage
        on_sale = data.get('on_sale')
        discount_percentage = data.get('discount_percentage')

        # Ensure discount_percentage is valid (between 0 and 100)
        if discount_percentage:
            try:
                discount_percentage = int(discount_percentage)
                if discount_percentage < 0 or discount_percentage > 100:
                    return Response({"error": "Discount percentage must be between 0 and 100."}, status=status.HTTP_400_BAD_REQUEST)
            except ValueError:
                return Response({"error": "Invalid discount percentage."}, status=status.HTTP_400_BAD_REQUEST)
        data['on_sale'] = on_sale
        data['discount_percentage'] = discount_percentage

        serializer = ProductSerializer(product, data=data, context={'request': request})

        if serializer.is_valid():
            product = serializer.save()

            # Handle images
            images = request.FILES.getlist('images')
            if images:
                product.images.clear()  # Remove old images
                for image in images:
                    img = Image.objects.create(image=image)
                    product.images.add(img)
                product.save()

            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
