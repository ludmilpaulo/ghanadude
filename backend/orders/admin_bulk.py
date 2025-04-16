from rest_framework.decorators import api_view, permission_classes

from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import BulkOrder
from .serializers import BulkOrderSerializer


@api_view(["GET"])
@permission_classes([AllowAny])
def get_bulk_orders(request):
    bulk_orders = BulkOrder.objects.select_related("user", "designer").prefetch_related(
        "items__product"
    )
    serializer = BulkOrderSerializer(
        bulk_orders, many=True, context={"request": request}
    )
    return Response(serializer.data)
