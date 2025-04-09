# revenue/admin.py (or wherever your Coupon model is)

from django.contrib import admin
from .models import Coupon
from django.utils import timezone
from django.contrib import messages
import uuid
from datetime import timedelta



class ExpirationStatusFilter(admin.SimpleListFilter):
    title = 'Expiration Status'
    parameter_name = 'expiration_status'

    def lookups(self, request, model_admin):
        return (
            ('valid', 'Valid'),
            ('expired', 'Expired'),
        )

    def queryset(self, request, queryset):
        now = timezone.now()
        if self.value() == 'valid':
            return queryset.filter(expires_at__gt=now)
        elif self.value() == 'expired':
            return queryset.filter(expires_at__lt=now)
        return queryset

@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ('code', 'user', 'value', 'is_redeemed', 'created_at', 'expires_at')
    list_filter = ('is_redeemed', ExpirationStatusFilter, 'created_at')
    search_fields = ('code', 'user__username', 'user__email')
    autocomplete_fields = ('user',)
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)

    @admin.action(description="Generate 5 unique coupons for each selected user")
    def generate_coupons(self, request, queryset):
        created = 0
        for user in queryset:
            for _ in range(5):
                Coupon.objects.create(
                    code=str(uuid.uuid4())[:8].upper(),
                    user=user,
                    value=50.00,
                    expires_at=timezone.now() + timedelta(days=30)
                )
                created += 1
        self.message_user(request, f"{created} coupons generated.", level=messages.SUCCESS)

    actions = ['generate_coupons']
