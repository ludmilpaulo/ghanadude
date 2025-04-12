from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.contrib.auth.models import User
from .models import Wishlist
from product.models import Product
from .serializers import WishlistSerializer


@api_view(["GET"])
def wishlist_count(request):
    user_id = request.query_params.get("user_id")
    if not user_id:
        return Response(
            {"error": "User ID is required"}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.get(id=user_id)
        count = Wishlist.objects.filter(user=user).count()
        return Response({"count": count}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(["GET"])
def get_wishlist(request):
    user_id = request.query_params.get("user_id")
    if not user_id:
        return Response(
            {"error": "User ID is required"}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.get(id=user_id)
        wishlist_items = Wishlist.objects.filter(user=user)
        serializer = WishlistSerializer(wishlist_items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(["POST"])
def add_to_wishlist(request):
    user_id = request.data.get("user_id")
    product_id = request.data.get("product_id")

    if not user_id or not product_id:
        return Response(
            {"error": "User ID and Product ID are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        user = User.objects.get(id=user_id)
        product = Product.objects.get(id=product_id)
        wishlist_item, created = Wishlist.objects.get_or_create(
            user=user, product=product
        )

        if created:
            return Response(
                {"message": "Added to wishlist"}, status=status.HTTP_201_CREATED
            )
        else:
            return Response(
                {"message": "Already in wishlist"}, status=status.HTTP_200_OK
            )
    except (User.DoesNotExist, Product.DoesNotExist):
        return Response(
            {"error": "User or Product not found"}, status=status.HTTP_404_NOT_FOUND
        )


@api_view(["DELETE"])
def remove_from_wishlist(request, product_id):
    user_id = request.query_params.get("user_id")

    if not user_id:
        return Response(
            {"error": "User ID is required"}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.get(id=user_id)
        wishlist_item = Wishlist.objects.get(user=user, product_id=product_id)
        wishlist_item.delete()
        return Response({"message": "Removed from wishlist"}, status=status.HTTP_200_OK)
    except (User.DoesNotExist, Wishlist.DoesNotExist):
        return Response(
            {"error": "User or Wishlist item not found"},
            status=status.HTTP_404_NOT_FOUND,
        )
