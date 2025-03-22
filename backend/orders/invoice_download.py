from django.http import FileResponse, Http404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Order

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_invoice(request, order_id):
    try:
        order = Order.objects.get(pk=order_id, user=request.user)
        if not order.invoice:
            raise Http404("Invoice not found")
        return FileResponse(order.invoice, content_type='application/pdf', filename=f'invoice_{order.id}.pdf')
    except Order.DoesNotExist:
        raise Http404("Order not found")

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_order(request, order_id):
    try:
        order = Order.objects.get(pk=order_id, user=request.user)
        if order.status not in ['Pending', 'Processing']:
            return Response({'detail': 'Order cannot be cancelled'}, status=400)

        order.status = 'Cancelled'
        order.save()
        return Response({'detail': 'Order cancelled'}, status=200)
    except Order.DoesNotExist:
        return Response({'detail': 'Order not found'}, status=404)
