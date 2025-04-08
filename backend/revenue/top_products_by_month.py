from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum
from orders.models import Order, OrderItem
from datetime import datetime
from collections import defaultdict
from django.utils.timezone import make_aware
import calendar
from django.contrib.auth.models import User
from dateutil.parser import parse as parse_datetime





@api_view(['GET'])
def top_products_by_month(request):
    try:
        # Step 1: Get and log incoming query params
        start = request.query_params.get('start')
        end = request.query_params.get('end')
        status_filter = request.query_params.get('status')
        category = request.query_params.get('category')

        print("🔎 Incoming Params:", start, end, status_filter, category)

        if not start or not end:
            return Response({"error": "Start and end dates are required."}, status=400)

        # Step 2: Parse and log dates
        start_date = parse_datetime(start)
        end_date = parse_datetime(end)
        print("📅 Parsed Dates:", start_date, end_date)

        # Step 3: Fetch and filter OrderItems
        qs = OrderItem.objects.select_related('product', 'order').prefetch_related('product__images') \
            .filter(order__created_at__range=(start_date, end_date))

        if status_filter and status_filter != "All":
            qs = qs.filter(order__status=status_filter)

        if category:
            qs = qs.filter(product__category__slug=category)

        print("✅ Filtered OrderItems count:", qs.count())

        # Step 4: Group by month and accumulate sales
        monthly_sales = defaultdict(lambda: defaultdict(lambda: {'total': 0, 'product': None}))

        for item in qs:
            created = item.order.created_at
            key = f"{created.strftime('%b')}-{created.year}"  # e.g. "Jan-2024"
            pid = item.product.id
            monthly_sales[key][pid]['total'] += item.price
            monthly_sales[key][pid]['product'] = item.product

        # Step 5: Determine top-selling product per month
        result = []
        for month_key, products in monthly_sales.items():
            if not products:
                continue
            top = max(products.items(), key=lambda x: x[1]['total'])
            product_obj = top[1]['product']
            image_url = None
            if product_obj.images.exists():
                image = product_obj.images.first()
                if image and image.image:
                    image_url = request.build_absolute_uri(image.image.url)

            result.append({
                "month": month_key,
                "product_id": product_obj.id,
                "product_name": product_obj.name,
                "product_image": image_url,
                "total_sales": top[1]['total'],
            })

        # Step 6: Sort by month and print result
        def sort_key(item):
            month_abbr, year = item['month'].split('-')
            month_num = list(calendar.month_abbr).index(month_abbr)
            return (int(year), month_num)

        result.sort(key=sort_key)
        print("📦 Final top products:", result)

        return Response(result, status=200)

    except Exception as e:
        print("❌ ERROR in top_products_by_month:", str(e))
        return Response({'error': str(e)}, status=500)




@api_view(["GET"])
def top_users_by_spending(request):
    top_users = User.objects.annotate(
        total_spent=Sum("orders__total_price")
    ).filter(total_spent__gt=0).order_by("-total_spent")[:10]

    data = [
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "total_spent": round(u.total_spent or 0, 2),
        }
        for u in top_users
    ]
    return Response(data)


@api_view(["GET"])
def city_sales_by_product(request):
    product_id = request.query_params.get("product")
    if not product_id:
        return Response({"error": "Product ID is required"}, status=400)

    stats = (
        Order.objects.filter(products__id=product_id)
        .values("city")
        .annotate(total_sales=Sum("total_price"))
        .order_by("-total_sales")
    )
    return Response(stats)

@api_view(["GET"])
def city_products(request):
    city = request.query_params.get("city")
    if not city:
        return Response({"error": "City required"}, status=400)

    top_items = (
        Order.objects.filter(city__iexact=city)
        .values("products__name", "products__images__image")
        .annotate(total_sales=Sum("total_price"))
        .order_by("-total_sales")[:5]
    )

    return Response([
        {
            "name": item["products__name"],
            "image": item["products__images__image"],
            "sales": float(item["total_sales"]),
        }
        for item in top_items if item["products__name"]
    ])
