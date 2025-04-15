from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth.models import User
from decimal import Decimal
from .models import BulkOrderItem, Order, OrderItem, BulkOrder
from product.models import Product
from .order_email import send_invoice_email
import json

@api_view(["POST"])
@permission_classes([AllowAny])
def checkout(request):
    print("✅ Checkout request received")
    print("✅ Files received:", request.FILES)
    print("🎨 custom_design in FILES:", request.FILES.get("custom_design"))
    print("🧵 brand_logo in FILES:", request.FILES.get("brand_logo"))

    data = request.data
    print(f"📨 Request data: {data}")
    files = request.FILES

    order_type = data.get("order_type", "delivery")
    required_fields = [] if order_type == "collection" else ["address", "city", "postal_code", "country"]
    missing = [f for f in required_fields if not data.get(f)]
    if missing:
        print("❌ Missing required fields:", missing)
        return Response({"error": f'Missing fields: {", ".join(missing)}'}, status=400)

    try:
        user = User.objects.get(pk=data.get("user_id"))
    except User.DoesNotExist:
        print("❌ User not found with ID:", data.get("user_id"))
        return Response({"error": "User not found"}, status=404)

    reward_applied = Decimal(data.get("reward_applied", "0"))
    delivery_fee = Decimal(data.get("delivery_fee", "0"))
    vat_amount = Decimal(data.get("vat_amount", "0"))

    if reward_applied > 0:
        profile = user.profile
        profile.reward_balance = max(Decimal("0.00"), profile.reward_balance - reward_applied)
        profile.save()
        print(f"🎁 Applied reward: {reward_applied} | New balance: {profile.reward_balance}")

    try:
        items = json.loads(data.get("items", "[]"))
        print("📦 Parsed items from frontend:")
        for i, item in enumerate(items):
            print(f"  🔹 Item #{i + 1}: {item}")
    except json.JSONDecodeError:
        print("❌ Invalid JSON in items")
        return Response({"error": "Invalid items format"}, status=400)

    regular_items = []
    bulk_items = []

    for item in items:
        try:
            product = Product.objects.get(pk=item["id"])
            quantity = int(item.get("quantity", 0))
            selected_size = item.get("selectedSize", "")  # match frontend camelCase


            if quantity <= 0:
                return Response({"error": f"Invalid quantity for product ID {item.get('id')}"}, status=400)

            price = product.price
            if product.on_sale:
                discount = price * (Decimal(product.discount_percentage) / 100)
                price -= discount

            product.reduce_stock(quantity)

            item_data = {
                "product": product,
                "quantity": quantity,
                "price": price,
                "selected_size": selected_size,  # ✅
            }

            if item.get("is_bulk", False):
                print(f"🧵 Bulk item detected: {product.name} x{quantity} (Size: {selected_size})")
                bulk_items.append(item_data)
            else:
                print(f"📦 Regular item detected: {product.name} x{quantity} (Size: {selected_size})")
                regular_items.append(item_data)

        except Product.DoesNotExist:
            print(f"❌ Product not found: ID {item.get('id')}")
            return Response({"error": f"Product ID {item.get('id')} not found"}, status=404)

    # Add brand logo and custom design
    brand_logo = files.get("brand_logo")
    custom_design = files.get("custom_design")
    brand_logo_qty = int(data.get("brand_logo_qty", 0))
    custom_design_qty = int(data.get("custom_design_qty", 0))

    if brand_logo and brand_logo_qty > 0:
        print(f"🧵 Adding brand logo (qty {brand_logo_qty}) to bulk items")
        bulk_items.append({
            "product": None,
            "quantity": brand_logo_qty,
            "price": Decimal("0.00"),
            "brand_logo": brand_logo,
            "selected_size": "",  # ✅ optional default
        })

    if custom_design and custom_design_qty > 0:
        print(f"🎨 Adding custom design (qty {custom_design_qty}) to bulk items")
        bulk_items.append({
            "product": None,
            "quantity": custom_design_qty,
            "price": Decimal("0.00"),
            "custom_design": custom_design,
            "selected_size": "",  # ✅ optional default
        })

    order = None
    bulk_order = None

    if regular_items:
        regular_total = sum(item["price"] * item["quantity"] for item in regular_items)
        order = Order.objects.create(
            user=user,
            total_price=regular_total,
            reward_applied=reward_applied,
            address=data.get("address", ""),
            city=data.get("city", ""),
            postal_code=data.get("postal_code", ""),
            country=data.get("country", ""),
            payment_method=data.get("payment_method", "payfast"),
            status=data.get("status", "pending"),
            delivery_fee=delivery_fee,
            vat_amount=vat_amount,
            order_type=order_type,
        )
        for item in regular_items:
            OrderItem.objects.create(
                order=order,
                product=item["product"],
                quantity=item["quantity"],
                price=item["price"],
                selected_size=item.get("selected_size", ""),  # ✅
            )
        send_invoice_email(order)
        print(f"✅ Regular order created: #{order.id}")

    # Pick first actual product as reference for bulk_order.product (optional)
    bulk_order_product = next((item.get("product") for item in bulk_items if item.get("product")), None)

    if bulk_items:
        bulk_total = sum(item["price"] * item["quantity"] for item in bulk_items)
        bulk_quantity = sum(item["quantity"] for item in bulk_items)

        bulk_order = BulkOrder.objects.create(
            user=user,
            total_price=bulk_total,
            quantity=bulk_quantity,
            product=bulk_order_product,
            address=data.get("address", ""),
            city=data.get("city", ""),
            postal_code=data.get("postal_code", ""),
            country=data.get("country", ""),
            delivery_fee=delivery_fee,
            vat_amount=vat_amount,
            order_type=order_type,
        )

        for idx, item in enumerate(bulk_items):
            created_item = BulkOrderItem.objects.create(
                bulk_order=bulk_order,
                product=item.get("product"),
                quantity=item["quantity"],
                price=item["price"],
                brand_logo=item.get("brand_logo"),
                custom_design=item.get("custom_design"),
                selected_size=item.get("selected_size", ""),  # ✅
            )
            print(f"✅ BulkOrderItem #{idx + 1} created: {created_item.product or 'Design/Logo'} x{created_item.quantity}")
            if created_item.custom_design:
                print(f"   🎨 Design file saved at: {created_item.custom_design.url}")
            if created_item.brand_logo:
                print(f"   🧵 Logo file saved at: {created_item.brand_logo.url}")

        send_invoice_email(bulk_order)
        print(f"📦 Bulk order created: #{bulk_order.id}")

    response_data = {}
    if order:
        response_data["order_id"] = order.id
    if bulk_order:
        response_data["bulk_order_id"] = bulk_order.id

    print(f"📦 Final response: {response_data}")
    return Response(response_data, status=201)
