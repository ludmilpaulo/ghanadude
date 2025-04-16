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
from .serializers import (
    ProductSerializer,
    CategorySerializer,
    BrandSerializer,
    DesignerSerializer,
)
from django.db import transaction

logger = logging.getLogger(__name__)


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    @action(detail=True, methods=["post"])
    def reduce_stock(self, request, pk=None):
        product = get_object_or_404(Product, pk=pk)
        quantity = int(request.data.get("quantity", 1))
        try:
            product.reduce_stock(quantity)
            return Response({"status": "stock reduced", "new_stock": product.stock})
        except ValueError as e:
            return Response({"error": str(e)}, status=400)


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


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from .models import Product, Category, Brand, Size, Image
from .serializers import ProductSerializer


@api_view(["POST"])
@permission_classes([AllowAny])
def create_product(request):
    data = request.data
    print("📥 Step 1: Received product creation request.")

    try:
        # Step 2: Handle Category
        category_name = data.get("category", "Uncategorized").strip()
        category, created_cat = Category.objects.get_or_create(name=category_name)
        print(
            f"📦 Step 2: Category '{category_name}' → {'created' if created_cat else 'found'}"
        )

        # Step 3: Handle Brand
        brand_name = data.get("brand", "ghanadue").strip()
        brand, created_brand = Brand.objects.get_or_create(name=brand_name)
        print(
            f"🏷️ Step 3: Brand '{brand_name}' → {'created' if created_brand else 'found'}"
        )

        # Step 4: Parse booleans and numbers
        bulk_sale = str(data.get("bulk_sale", "false")).lower() in ["true", "1"]
        on_sale = str(data.get("on_sale", "false")).lower() in ["true", "1"]
        discount_percentage = int(data.get("discount_percentage", 0))
        print(
            f"🔢 Step 4: bulk_sale={bulk_sale}, on_sale={on_sale}, discount={discount_percentage}"
        )

        # Step 5: Set percentage
        percentage = 3 if bulk_sale else 4
        print(f"📊 Step 5: Applied percentage = {percentage}")

        # Step 6: Create Product
        product = Product.objects.create(
            name=data["name"],
            description=data["description"],
            price=float(data["price"]),
            stock=int(data["stock"]),
            season=data.get("season", "all_seasons"),
            category=category,
            brand=brand,
            on_sale=on_sale,
            bulk_sale=bulk_sale,
            discount_percentage=discount_percentage,
            percentage=percentage,
        )
        print(f"🛠️ Step 6: Product '{product.name}' created with ID {product.id}")

        # Step 7: Add sizes
        sizes_list = data.getlist("sizes", [])
        print(f"🧩 Step 7: Attaching sizes: {sizes_list}")
        for size_name in sizes_list:
            size, _ = Size.objects.get_or_create(name=size_name.strip())
            product.sizes.add(size)
        print(f"✅ Step 7: Sizes linked to product.")

        # Step 8: Add images
        images = request.FILES.getlist("images")
        print(f"🖼️ Step 8: Found {len(images)} image(s) to upload.")
        for image in images:
            img_instance = Image.objects.create(image=image)
            product.images.add(img_instance)
        print("✅ Step 8: Images saved and linked to product.")

        # Step 9: Save again just in case
        product.save()
        print("💾 Step 9: Final save completed.")

        # Step 10: Serialize and return
        serializer = ProductSerializer(product)
        print("📤 Step 10: Sending success response.")
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    except Exception as e:
        print("❌ Error occurred during product creation:", str(e))
        return Response(
            {
                "error": "Failed to create product",
                "details": str(e),
                "debug": {
                    "category": data.get("category"),
                    "brand": data.get("brand"),
                    "price": data.get("price"),
                    "stock": data.get("stock"),
                    "images": [f.name for f in request.FILES.getlist("images")],
                    "sizes": data.getlist("sizes", []),
                },
            },
            status=status.HTTP_400_BAD_REQUEST,
        )


@api_view(["GET"])
@permission_classes([AllowAny])
def sizes_list(request):
    sizes = Size.objects.all()
    return Response([{"id": size.id, "name": size.name} for size in sizes])


# views.py
@api_view(["GET"])
def related_products(request, product_id):
    try:
        current = Product.objects.get(id=product_id)
        related = Product.objects.filter(category=current.category).exclude(
            id=product_id
        )[:10]
        serializer = ProductSerializer(related, many=True)
        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response([], status=200)
