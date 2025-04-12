from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import Brand, Product, Category, Image
from .serializers import ProductSerializer


@api_view(["GET", "PUT", "DELETE"])
@permission_classes([AllowAny])
def product_detail(request, pk):
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        print(f"❌ Product with ID {pk} not found.")
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        print(f"📦 GET request for product {pk}")
        serializer = ProductSerializer(product, context={"request": request})
        return Response(serializer.data)

    elif request.method == "PUT":
        print(f"🛠 PUT request received for product {pk}")
        print("📥 Raw incoming data:", dict(request.data))
        print("📦 Uploaded files:", request.FILES)

        # Extract non-file fields
        data = {
            key: value
            for key, value in request.data.items()
            if key != "uploaded_images"
        }
        print("✅ Cleaned non-file data:", data)

        # Convert booleans
        if "on_sale" in data:
            data["on_sale"] = (
                data["on_sale"].lower() == "true"
                if isinstance(data["on_sale"], str)
                else data["on_sale"]
            )
            print("🔁 on_sale parsed as:", data["on_sale"])

        if "bulk_sale" in data:
            data["bulk_sale"] = (
                data["bulk_sale"].lower() == "true"
                if isinstance(data["bulk_sale"], str)
                else data["bulk_sale"]
            )
            print("🔁 bulk_sale parsed as:", data["bulk_sale"])

        # Parse discount
        if "discount_percentage" in data:
            try:
                data["discount_percentage"] = int(data["discount_percentage"])
                if not (0 <= data["discount_percentage"] <= 100):
                    print("❌ Discount out of range")
                    return Response(
                        {"error": "Discount percentage must be between 0 and 100."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                print("🔁 Discount % parsed:", data["discount_percentage"])
            except ValueError:
                print("❌ Invalid discount percentage value")
                return Response(
                    {"error": "Invalid discount percentage."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Handle sizes
        if "sizes" in data:
            if isinstance(data["sizes"], str):
                data["sizes"] = data["sizes"].split(",")
            print("🔁 Sizes parsed:", data["sizes"])

        # Convert category name to ID
        if "category" in data:
            category, created = Category.objects.get_or_create(name=data["category"])
            data["category"] = category.id
            print(f"🔁 Category set to ID: {data['category']} (created={created})")

        # ✅ Ensure brand is present
        if "brand" not in data:
            brand, _ = Brand.objects.get_or_create(name="ghanadude")
            data["brand"] = brand.id
            print(f"🧬 Default brand set to ID: {brand.id}")

        # Serialize and validate
        serializer = ProductSerializer(product, data=data, context={"request": request})
        if serializer.is_valid():
            product = serializer.save()
            print("✅ Product updated successfully")

            # Handle uploaded images
            uploaded_images = request.FILES.getlist("uploaded_images")
            print("📷 Uploaded image files:", uploaded_images)
            if uploaded_images:
                product.images.clear()
                for image in uploaded_images:
                    img_obj = Image.objects.create(image=image)
                    product.images.add(img_obj)
                    print(f"✅ Image {img_obj.image.url} added to product")

            return Response(serializer.data)

        print("❌ Serializer errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "DELETE":
        print(f"🗑 Deleting product {pk}")
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
