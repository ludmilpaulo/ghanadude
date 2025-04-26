from django.contrib import admin
from .models import Order, OrderItem, BulkOrder, BulkOrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("product", "quantity", "price", "selected_size", "dev_earnings")
    can_delete = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "total_price",
        "discount_amount",
        "status",
        "payment_method",
        "order_type",
        "is_dispatched",
        "created_at",
        "updated_at",
    )
    list_filter = ("status", "payment_method", "order_type", "is_dispatched", "created_at")
    search_fields = ("user__username", "user__email", "address", "city", "country", "pin_code")
    inlines = [OrderItemInline]
    date_hierarchy = "created_at"
    readonly_fields = ("created_at", "updated_at", "reward_applied", "invoice_url")
    autocomplete_fields = ("user", "coupon")
    list_select_related = ("user", "coupon")

    fieldsets = (
        ("Customer & Status", {"fields": ("user", "status", "is_dispatched", "pin_code")}),
        ("Payment & Pricing", {"fields": ("payment_method", "total_price", "discount_amount", "reward_applied", "delivery_fee", "vat_amount", "coupon")}),
        ("Order Details", {"fields": ("order_type", "address", "city", "postal_code", "country")}),
        ("Invoice", {"fields": ("invoice", "invoice_url")}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )


class BulkOrderItemInline(admin.TabularInline):
    model = BulkOrderItem
    extra = 0
    readonly_fields = ("product", "quantity", "price", "selected_size", "brand_logo_url", "custom_design_url", "dev_earnings")
    can_delete = False


@admin.register(BulkOrder)
class BulkOrderAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "total_price",
        "status",
        "order_type",
        "is_dispatched",
        "designer",
        "created_at",
    )
    list_filter = ("status", "order_type", "is_dispatched", "created_at")
    search_fields = ("user__username", "user__email", "address", "city", "country", "pin_code")
    date_hierarchy = "created_at"
    readonly_fields = ("created_at", "reward_applied")
    autocomplete_fields = ("user", "designer")
    inlines = [BulkOrderItemInline]

    fieldsets = (
        ("Customer & Status", {"fields": ("user", "status", "is_dispatched", "pin_code")}),
        ("Order Info", {"fields": ("order_type", "total_price", "reward_applied", "delivery_fee", "vat_amount")}),
        ("Shipping Details", {"fields": ("address", "city", "postal_code", "country")}),
        ("Design & Branding", {"fields": ("designer",)}),
        ("Timestamps", {"fields": ("created_at",)}),
    )


@admin.register(BulkOrderItem)
class BulkOrderItemAdmin(admin.ModelAdmin):
    list_display = ("id", "bulk_order", "product", "quantity", "price", "selected_size", "designer")
    list_filter = ("designer",)
    search_fields = ("bulk_order__user__username", "product__name")
    autocomplete_fields = ("bulk_order", "product", "designer")
    readonly_fields = ("brand_logo_url", "custom_design_url", "dev_earnings")

    fieldsets = (
        ("Bulk Order Item Details", {"fields": ("bulk_order", "product", "quantity", "price", "selected_size", "designer")}),
        ("Design Files", {"fields": ("brand_logo", "brand_logo_url", "custom_design", "custom_design_url")}),
        ("Financial", {"fields": ("dev_earnings",)}),
    )
