
from datetime import datetime, timedelta
from django.db.models import Sum, Count
from orders.models import Order
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut

import time

# Existing imports...

@api_view(['GET'])
def sales_summary(request):
    try:
        today = datetime.today()
        start_of_day = today.replace(hour=0, minute=0, second=0, microsecond=0)
        start_of_month = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        start_of_year = today.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)

        daily_sales = Order.objects.filter(created_at__gte=start_of_day).aggregate(total_sales=Sum('total_price'))['total_sales'] or 0
        monthly_sales = Order.objects.filter(created_at__gte=start_of_month).aggregate(total_sales=Sum('total_price'))['total_sales'] or 0
        yearly_sales = Order.objects.filter(created_at__gte=start_of_year).aggregate(total_sales=Sum('total_price'))['total_sales'] or 0

        return Response({
            'daily_sales': daily_sales,
            'monthly_sales': monthly_sales,
            'yearly_sales': yearly_sales,
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def user_statistics(request):
    try:
        most_purchases_user = Order.objects.values('user__username').annotate(total_spent=Sum('total_price')).order_by('-total_spent').first()
        if not most_purchases_user:
            most_purchases_user = {'user__username': 'None', 'total_spent': 0}

        return Response({
            'most_purchases_user': most_purchases_user['user__username'],
            'total_spent': most_purchases_user['total_spent'],
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET"])
def location_statistics(request):
    region = request.query_params.get("region", "country").lower()
    key = region if region in ["city", "country"] else "country"

    raw_stats = (
        Order.objects.values(key)
        .annotate(total_sales=Sum("total_price"))
        .order_by("-total_sales")
    )

    geolocator = Nominatim(user_agent="ghanadude-map")
    points = []

    def safe_geocode(name):
        try:
            return geolocator.geocode(name, timeout=10)
        except:
            time.sleep(1)
            return safe_geocode(name)

    for row in raw_stats:
        name = row.get(key)
        if not name:
            continue
        loc = safe_geocode(name)
        if loc:
            points.append({
                "name": name,
                "lat": loc.latitude,
                "lng": loc.longitude,
                "total_sales": float(row["total_sales"] or 0)
            })

    # Dynamically calculate thresholds
    max_val = max([p["total_sales"] for p in points], default=1)
    bins = 4
    step = max_val / bins
    colors = ["#c6dbef", "#6baed6", "#2171b5", "#08306b"]
    thresholds = [{
        "min": round(i * step, 2),
        "max": round((i + 1) * step, 2),
        "color": colors[i]
    } for i in range(bins)]

    return Response({
        "points": points,
        "thresholds": thresholds,
    })



    
@api_view(['GET'])
def sales_range(request):
    try:
        start = request.query_params.get('start')
        end = request.query_params.get('end')
        status = request.query_params.get('status')
        product_id = request.query_params.get('product_id')

        if not start or not end:
            return Response({"error": "Start and end dates required"}, status=400)

        qs = Order.objects.filter(created_at__range=(start, end))
        if status:
            qs = qs.filter(status=status)

        if product_id:
            qs = qs.filter(items__product_id=product_id).distinct()

        total_sales = qs.aggregate(total_sales=Sum('total_price'))['total_sales'] or 0

        return Response({"total_sales": total_sales}, status=200)

    except Exception as e:
        return Response({'error': str(e)}, status=400)
