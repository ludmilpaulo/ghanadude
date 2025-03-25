from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Product, Category, Brand, Designer, Wishlist, Image,
    Review, Size
)

# Inline for Images inside ProductAdmin
class ImageInline(admin.TabularInline):
    model = Product.images.through
    extra = 1

# Inline for Reviews
class ReviewInline(admin.TabularInline):
    model = Review
    extra = 0
    readonly_fields = ('user', 'rating', 'comment', 'created_at')

# Inline for Designers inside BrandAdmin
class DesignerInline(admin.TabularInline):
    model = Designer
    extra = 1

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'category', 'brand', 'price_display', 'stock',
        'on_sale', 'discount_percentage', 'season', 'image_display'
    )
    list_filter = ('category', 'brand', 'on_sale', 'season')
    search_fields = ('name', 'description')
    ordering = ('name',)
    inlines = [ImageInline, ReviewInline]
    filter_horizontal = ('sizes',)
    readonly_fields = ('image_preview',)

    fieldsets = (
        (None, {
            'fields': ('name', 'description', 'category', 'brand', 'sizes')
        }),
        ('Pricing & Stock', {
            'fields': ('price', 'stock', 'on_sale', 'discount_percentage', 'season')
        }),
        ('Images', {
            'fields': ('image_preview',)
        }),
    )

    def price_display(self, obj):
        return f"R{obj.price:.2f}"
    price_display.short_description = 'Price'

    def image_display(self, obj):
        if obj.images.exists():
            return format_html('<img src="{}" width="50" height="50" style="border-radius:5px;" />',
                               obj.images.first().image.url)
        return "No Image"
    image_display.short_description = 'Product Image'

    def image_preview(self, obj):
        imgs = obj.images.all()
        if not imgs:
            return "No image uploaded."
        return format_html(''.join(
            f'<img src="{img.image.url}" width="60" height="60" style="margin:2px;border-radius:5px;" />'
            for img in imgs
        ))
    image_preview.short_description = "Preview Images"


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)
    ordering = ('name',)


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ('name', 'logo_tag')
    search_fields = ('name',)
    inlines = [DesignerInline]

    def logo_tag(self, obj):
        if obj.logo:
            return format_html('<img src="{}" width="60" height="40" />', obj.logo.url)
        return "No Logo"
    logo_tag.short_description = 'Logo'


@admin.register(Designer)
class DesignerAdmin(admin.ModelAdmin):
    list_display = ('name', 'brand')
    list_filter = ('brand',)
    search_fields = ('name',)


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'added_at')
    list_filter = ('added_at',)
    search_fields = ('user__username', 'product__name')
    ordering = ('-added_at',)


@admin.register(Image)
class ImageAdmin(admin.ModelAdmin):
    list_display = ('image_tag', 'created_at', 'get_products')
    list_filter = ('created_at',)
    search_fields = ('image',)

    def image_tag(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="60" height="60" style="border-radius:5px;" />', obj.image.url)
        return "No Image"
    image_tag.short_description = 'Image'

    def get_products(self, obj):
        return ", ".join(p.name for p in obj.product_set.all())
    get_products.short_description = 'Products'


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'rating', 'like_count', 'dislike_count', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('user__username', 'product__name', 'comment')
    readonly_fields = ('like_count', 'dislike_count')

    def like_count(self, obj):
        return obj.likes.count()
    def dislike_count(self, obj):
        return obj.dislikes.count()


@admin.register(Size)
class SizeAdmin(admin.ModelAdmin):
    list_display = ('name',)
    ordering = ('name',)
