# dev_earnings.py
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from django.db.models import Sum, F, FloatField, ExpressionWrapper
from django.db.models.functions import Cast, TruncMonth
from django.utils.dateparse import parse_date
from django.utils.timezone import now, timedelta
from orders.models import OrderItem, BulkOrder
from .models import DevPayment
from .serializers import DevPaymentSerializer

@api_view(['GET'])
def developer_earnings_summary(request):
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')

    if not start_date or not end_date:
        end_date = now()
        start_date = end_date - timedelta(days=30)
    else:
        start_date = parse_date(start_date)
        end_date = parse_date(end_date)

    regular_qs = OrderItem.objects.filter(order__created_at__range=(start_date, end_date))
    bulk_qs = BulkOrder.objects.filter(created_at__range=(start_date, end_date))

    regular_qs = regular_qs.annotate(
        earnings=ExpressionWrapper(
            Cast(F('price'), FloatField()) *
            Cast(F('quantity'), FloatField()) *
            Cast(F('product__percentage'), FloatField()) / 100,
            output_field=FloatField()
        )
    )

    bulk_qs = bulk_qs.annotate(
        earnings=ExpressionWrapper(
            Cast(F('product__price'), FloatField()) *
            Cast(F('quantity'), FloatField()) *
            Cast(F('product__percentage'), FloatField()) / 100,
            output_field=FloatField()
        )
    )

    total_regular = regular_qs.aggregate(total=Sum('earnings'))['total'] or 0
    total_bulk = bulk_qs.aggregate(total=Sum('earnings'))['total'] or 0

    monthly_data = {}
    for entry in regular_qs.annotate(month=TruncMonth('order__created_at')).values('month').annotate(total=Sum('earnings')):
        key = entry['month'].strftime('%b %Y')
        monthly_data[key] = entry['total']

    for entry in bulk_qs.annotate(month=TruncMonth('created_at')).values('month').annotate(total=Sum('earnings')):
        key = entry['month'].strftime('%b %Y')
        monthly_data[key] = monthly_data.get(key, 0) + entry['total']

    monthly_breakdown = [{"month": month, "total": round(total, 2)} for month, total in monthly_data.items()]

    regular_orders = regular_qs.values('order_id').annotate(earnings=Sum('earnings'))
    bulk_orders = bulk_qs.values('id').annotate(earnings=Sum('earnings'))

    order_breakdown = [
        {"order_id": o["order_id"], "earnings": round(o["earnings"], 2), "type": "Regular"}
        for o in regular_orders
    ] + [
        {"order_id": o["id"], "earnings": round(o["earnings"], 2), "type": "Bulk"}
        for o in bulk_orders
    ]

    paid_to_dev = DevPayment.objects.aggregate(total=Sum('amount'))['total'] or 0
    paid_to_dev_float = float(paid_to_dev)

    remaining_earnings = total_regular + total_bulk - paid_to_dev_float



    return Response({
        "regular_earnings": round(total_regular, 2),
        "bulk_earnings": round(total_bulk, 2),
        "total_earnings": round(total_regular + total_bulk, 2),
        "paid_to_dev": round(paid_to_dev_float, 2),
        "remaining_earnings": round(remaining_earnings, 2),
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

    payment = DevPayment.objects.create(amount=amount, invoice=invoice, note=note)
    return Response({"message": "Payment recorded."}, status=201)

@api_view(['GET'])
def get_dev_payments(request):
    payments = DevPayment.objects.order_by('-created_at')
    serializer = DevPaymentSerializer(payments, many=True)
    return Response(serializer.data)
