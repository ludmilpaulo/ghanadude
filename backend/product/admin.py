from django.contrib import admin
from django.utils.html import format_html
from .models import Product, Category, Brand, Designer, Wishlist, Image

class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'brand', 'price', 'stock', 'on_sale', 'discount_percentage', 'season', 'image_display')
    list_filter = ('category', 'brand', 'on_sale', 'season')
    search_fields = ('name', 'description')
    ordering = ('name',)

    def image_display(self, obj):
        # Display the first image or "No Image"
        if obj.images.exists():
            return format_html('<img src="{}" width="50" height="50" style="border-radius:5px;"/>', obj.images.first().image.url)
        return "No Image"
    image_display.short_description = 'Product Image'

class ImageAdmin(admin.ModelAdmin):
    list_display = ('image', 'created_at', 'get_products')  # Use a custom method
    search_fields = ('image',)
    list_filter = ('created_at',)

    def get_products(self, obj):
        return ", ".join([p.name for p in obj.product_set.all()])  # Fetch related products

    get_products.short_description = 'Products'  # Set a readable column name


admin.site.register(Product, ProductAdmin)
admin.site.register(Category)
admin.site.register(Brand)
admin.site.register(Designer)
admin.site.register(Wishlist)
admin.site.register(Image, ImageAdmin)
