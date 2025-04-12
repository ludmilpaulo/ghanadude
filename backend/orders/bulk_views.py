from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User

from product.models import Product
from .models import Designer, BulkOrder


@api_view(["POST"])
@permission_classes([AllowAny])
def create_bulk_order(request):
    data = request.data
    user_id = data.get("user_id")
    product_id = data.get("product_id")
    quantity = int(data.get("quantity", 0))

    if quantity < 10:
        return Response(
            {"error": "The minimum bulk order quantity is 10."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    try:
        product = Product.objects.get(pk=product_id, bulk_sale=True)
    except Product.DoesNotExist:
        return Response(
            {"error": "Bulk ordering is not available for this product."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if product.stock < quantity:
        return Response(
            {"error": f"Insufficient stock. Only {product.stock} items left."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Handle optional designer selection
    designer = None
    designer_id = data.get("designer_id")
    if designer_id:
        try:
            designer = Designer.objects.get(pk=designer_id)
        except Designer.DoesNotExist:
            return Response(
                {"error": "Selected designer not found."},
                status=status.HTTP_400_BAD_REQUEST,
            )

    # Handle file uploads (brand logo and custom design)
    brand_logo = request.FILES.get("brand_logo")
    custom_design = request.FILES.get("custom_design")

    # Create BulkOrder
    bulk_order = BulkOrder.objects.create(
        user=user,
        product=product,
        quantity=quantity,
        brand_logo=brand_logo,
        custom_design=custom_design,
        designer=designer,
        status="Pending",
    )

    # Reduce product stock
    try:
        product.reduce_stock(quantity)
    except ValueError as e:
        bulk_order.delete()  # Clean up if error occurs
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    return Response(
        {"message": "Bulk order successfully created.", "bulk_order_id": bulk_order.id},
        status=status.HTTP_201_CREATED,
    )
