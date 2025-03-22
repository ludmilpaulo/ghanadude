from django.contrib.auth.models import User
from .models import Product, Review
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .serializers import ReviewSerializer  # Make sure you have this serializer

@api_view(["GET"])
def get_product_reviews(request, product_id):
    try:
        product = Product.objects.get(id=product_id)
        reviews = Review.objects.filter(product=product).order_by("-created_at")
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data, status=200)
    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=404)



@api_view(["POST"])
def react_review(request, review_id):
    user_id = request.data.get("user_id")
    action = request.data.get("action")

    try:
        user = User.objects.get(id=user_id)
        review = Review.objects.get(id=review_id)

        if action == "like":
            review.dislikes.remove(user)
            review.likes.add(user)
        elif action == "dislike":
            review.likes.remove(user)
            review.dislikes.add(user)

        return Response({
            "likes": review.like_count(),
            "dislikes": review.dislike_count()
        }, status=200)
    except (User.DoesNotExist, Review.DoesNotExist):
        return Response({"error": "Invalid user or review"}, status=404)
    
    
@api_view(["POST"])
def create_review(request, product_id):
    user_id = request.data.get("user_id")
    rating = request.data.get("rating")
    comment = request.data.get("comment")

    if not all([user_id, rating, comment]):
        return Response({"error": "Missing fields"}, status=400)

    try:
        user = User.objects.get(id=user_id)
        product = Product.objects.get(id=product_id)
        Review.objects.create(user=user, product=product, rating=rating, comment=comment)
        return Response({"message": "Review created"}, status=201)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=404)

