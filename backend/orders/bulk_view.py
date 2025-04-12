from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status, viewsets

from .models import BulkOrder
from .serializers import BulkOrderSerializer


class BulkOrderViewSet(viewsets.ModelViewSet):
    queryset = BulkOrder.objects.all()
    serializer_class = BulkOrderSerializer

    @action(detail=True, methods=["patch"], url_path="update-status")
    def update_status(self, request, pk=None):
        order = self.get_object()
        status_value = request.data.get("status")

        if status_value not in dict(BulkOrder.STATUS_CHOICES):
            return Response(
                {"detail": "Invalid status."}, status=status.HTTP_400_BAD_REQUEST
            )

        order.status = status_value
        order.save()
        return Response(BulkOrderSerializer(order).data)
