from django.http import QueryDict  # Import QueryDict
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
        # Extract only non-file data safely
        data = {key: value for key, value in request.data.items() if key != 'uploaded_images'}

        # ✅ Convert on_sale to boolean
        if 'on_sale' in data:
            data['on_sale'] = data['on_sale'].lower() == 'true' if isinstance(data['on_sale'], str) else data['on_sale']

        # ✅ Convert discount_percentage to an integer
        if 'discount_percentage' in data:
            try:
                data['discount_percentage'] = int(data['discount_percentage'])
                if not (0 <= data['discount_percentage'] <= 100):
                    return Response({"error": "Discount percentage must be between 0 and 100."}, status=status.HTTP_400_BAD_REQUEST)
            except ValueError:
                return Response({"error": "Invalid discount percentage."}, status=status.HTTP_400_BAD_REQUEST)

        # ✅ Convert sizes to a list
        if 'sizes' in data and isinstance(data['sizes'], str):
            data['sizes'] = data['sizes'].split(',')

        # ✅ Handle category (ensure foreign key is set)
        if 'category' in data:
            category, created = Category.objects.get_or_create(name=data['category'])
            data['category'] = category.id

        # ✅ Serialize and validate product data (excluding images)
        serializer = ProductSerializer(product, data=data, context={'request': request})

        if serializer.is_valid():
            product = serializer.save()

            # ✅ Process uploaded images separately
            uploaded_images = request.FILES.getlist('uploaded_images')
            if uploaded_images:
                product.images.clear()  # Remove old images
                for image in uploaded_images:
                    Image.objects.create(product=product, image=image)

            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
