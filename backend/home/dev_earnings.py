from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Sum, F, FloatField, ExpressionWrapper
from .models import DevPayment
from orders.models import OrderItem, BulkOrder

from django.db.models.functions import Cast
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import FloatField

from django.utils.dateparse import parse_date
from django.utils.timezone import now, timedelta
from django.db.models.functions import TruncMonth

@api_view(['GET'])
def developer_earnings_summary(request):
    print("🔄 Fetching developer earnings summary...")

    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')

    # Fallback to last 30 days
    if not start_date or not end_date:
        end_date = now()
        start_date = end_date - timedelta(days=30)
    else:
        start_date = parse_date(start_date)
        end_date = parse_date(end_date)

    # Regular and Bulk queries
    regular_qs = OrderItem.objects.filter(order__created_at__range=(start_date, end_date))
    bulk_qs = BulkOrder.objects.filter(created_at__range=(start_date, end_date))

    # Annotate earnings (decimal-safe)
    regular_qs = regular_qs.annotate(
        earnings=ExpressionWrapper(
            Cast(F('price'), FloatField()) *
            Cast(F('quantity'), FloatField()) *
            (Cast(F('product__percentage'), FloatField()) / 100),
            output_field=FloatField()
        )
    )

    bulk_qs = bulk_qs.annotate(
        earnings=ExpressionWrapper(
            Cast(F('product__price'), FloatField()) *
            Cast(F('quantity'), FloatField()) *
            (Cast(F('product__percentage'), FloatField()) / 100),
            output_field=FloatField()
        )
    )

    # Aggregate totals
    total_regular = regular_qs.aggregate(total=Sum('earnings'))['total'] or 0
    total_bulk = bulk_qs.aggregate(total=Sum('earnings'))['total'] or 0

    # Monthly breakdown (regular + bulk)
    regular_monthly = regular_qs.annotate(
        month=TruncMonth('order__created_at')
    ).values('month').annotate(total=Sum('earnings'))

    bulk_monthly = bulk_qs.annotate(
        month=TruncMonth('created_at')
    ).values('month').annotate(total=Sum('earnings'))

    # Merge monthly breakdown
    monthly_totals = {}
    for entry in regular_monthly:
        monthly_totals[entry['month'].strftime('%b %Y')] = entry['total']

    for entry in bulk_monthly:
        month_key = entry['month'].strftime('%b %Y')
        monthly_totals[month_key] = monthly_totals.get(month_key, 0) + entry['total']

    monthly_breakdown = [
        {"month": month, "total": round(total, 2)}
        for month, total in sorted(monthly_totals.items())
    ]

    # Per-order breakdown
    regular_orders = regular_qs.values(
        'order_id'
    ).annotate(earnings=Sum('earnings'))

    bulk_orders = bulk_qs.values(
        'id'
    ).annotate(earnings=Sum('earnings'))

    order_breakdown = [
        {"order_id": order["order_id"], "earnings": round(order["earnings"], 2), "type": "Regular"}
        for order in regular_orders
    ] + [
        {"order_id": order["id"], "earnings": round(order["earnings"], 2), "type": "Bulk"}
        for order in bulk_orders
    ]

    return Response({
        "regular_earnings": round(total_regular, 2),
        "bulk_earnings": round(total_bulk, 2),
        "total_earnings": round(total_regular + total_bulk, 2),
        "monthly_breakdown": monthly_breakdown,
        "order_breakdown": order_breakdown,
    })


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def create_dev_payment(request):
    amount = request.data.get('amount')
    invoice = request.FILES.get('invoice')
    note = request.data.get('note', '')

    if not amount or not invoice:
        return Response({"error": "Amount and invoice are required."}, status=400)

    payment = DevPayment.objects.create(
        amount=amount,
        invoice=invoice,
        note=note
    )
    return Response({"message": "Payment recorded."})
