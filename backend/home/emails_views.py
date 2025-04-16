from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from utils.supabase import SUPABASE_PUBLIC_BASE
from product.models import Product
from .models import AppVersion


@api_view(["POST"])
def send_promotional_email(request):
    print("🔥 Hit send_promotional_email view!")

    # Step 1: Get product ID from request
    product_id = request.data.get("product_id")
    print(f"📦 Received product_id: {product_id}")

    if not product_id:
        print("❌ No product_id provided in request")
        return Response(
            {"error": "Missing product_id"}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Step 2: Fetch the product
        product = Product.objects.get(id=product_id)
        print(f"✅ Found product: {product.name}")
        first_image = product.images.first()
        image_url = ""

        if first_image and first_image.image:
            file_path = first_image.image.name  # e.g., 'product_images/shoe.png'
            image_url = f"{SUPABASE_PUBLIC_BASE}/{file_path}"
            print(f"✅ Supabase image URL: {image_url}")
        else:

            print(f"✅ Found image of product: {image_url}")

    except Product.DoesNotExist:
        print("❌ Product not found in database")
        return Response(
            {"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND
        )

    # Step 3: Fetch all active users
    users = get_user_model().objects.filter(is_active=True)
    print(f"👥 Found {users.count()} active users")

    # Step 4: Get app store URLs (safely)
    ios_version = AppVersion.objects.filter(platform="ios").first()
    ios_url = ios_version.store_url if ios_version else ""
    if ios_url:
        print(f"📱 iOS store URL: {ios_url}")
    else:
        print("⚠️ No iOS version found")

    android_version = AppVersion.objects.filter(platform="android").first()
    android_url = android_version.store_url if android_version else ""
    if android_url:
        print(f"🤖 Android store URL: {android_url}")
    else:
        print("⚠️ No Android version found")

    # Step 5: Loop through users and send email
    for user in users:
        print(f"✉️ Sending email to: {user.email}")
        html_content = render_to_string(
            "emails/promotional_template.html",
            {
                "username": user.username,
                "product": product,
                "image_url": image_url,
                "ios_url": ios_url,
                "android_url": android_url,
            },
        )

        email = EmailMultiAlternatives(
            subject=f"🔥 Discover {product.name} – Just for You!",
            body=strip_tags(html_content),
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email],
        )
        email.attach_alternative(html_content, "text/html")
        email.send()
        print(f"✅ Email sent to: {user.email}")

    print("🎉 All promotional emails sent successfully")
    return Response(
        {"message": "Promotional emails sent successfully"}, status=status.HTTP_200_OK
    )
