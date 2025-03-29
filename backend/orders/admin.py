from django.contrib import admin
from .models import Order, OrderItem, BulkOrder

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product', 'quantity', 'price')
    can_delete = False

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'user', 'total_price', 'discount_amount', 'status', 
        'payment_method', 'created_at', 'updated_at'
    )
    list_filter = ('status', 'payment_method', 'created_at', 'updated_at')
    search_fields = ('user__username', 'user__email', 'address', 'city', 'country')
    inlines = [OrderItemInline]
    date_hierarchy = 'created_at'
    readonly_fields = ('created_at', 'updated_at', 'earned_points')
    autocomplete_fields = ('user', 'coupon')
    list_select_related = ('user', 'coupon')

    fieldsets = (
        ('Order Info', {
            'fields': (
                'user', 'status', 'payment_method', 'coupon', 'discount_amount'
            )
        }),
        ('Shipping Details', {
            'fields': ('address', 'city', 'postal_code', 'country')
        }),
        ('Pricing & Files', {
            'fields': ('total_price', 'invoice')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )

@admin.register(BulkOrder)
class BulkOrderAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'user', 'product', 'quantity', 'status', 
        'designer', 'created_at'
    )
    list_filter = ('status', 'created_at')
    search_fields = ('user__username', 'product__name')
    date_hierarchy = 'created_at'
    readonly_fields = ('created_at',)
    autocomplete_fields = ('user', 'product', 'designer')
    list_select_related = ('user', 'product', 'designer')

    fieldsets = (
        ('Bulk Order Details', {
            'fields': ('user', 'product', 'quantity', 'status')
        }),
        ('Designs & Files', {
            'fields': ('brand_logo', 'custom_design', 'designer')
        }),
        ('Metadata', {
            'fields': ('created_at',)
        }),
    )

