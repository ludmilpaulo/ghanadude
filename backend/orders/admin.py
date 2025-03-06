from django.contrib import admin
from .models import OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 1
    readonly_fields = ('drug', 'quantity', 'price')

class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'total_price', 'status', 'created_at', 'updated_at')
    list_filter = ('status', 'created_at', 'updated_at')
    search_fields = ('user__username', 'user__email', 'address', 'city', 'postal_code', 'country')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [OrderItemInline]
    fieldsets = (
        (None, {
            'fields': ('user', 'total_price', 'status')
        }),
        ('Shipping Information', {
            'fields': ('address', 'city', 'postal_code', 'country')
        }),
        ('Payment Information', {
            'fields': ('payment_method',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )


