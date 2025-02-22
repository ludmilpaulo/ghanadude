# admin.py
from django.contrib import admin
from django.utils.html import format_html
from .models import Product, Category, Brand, Designer, Wishlist

class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'brand', 'price', 'stock', 'on_sale', 'discount_percentage', 'season', 'image_display')
    list_filter = ('category', 'brand', 'on_sale', 'season')
    search_fields = ('name', 'description')
    ordering = ('name',)
    
    def image_display(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="50" height="50" style="border-radius:5px;"/>', obj.image.url)
        return "No Image"
    image_display.allow_tags = True
    image_display.short_description = 'Product Image'

class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

class BrandAdmin(admin.ModelAdmin):
    list_display = ('name', 'logo_display')
    search_fields = ('name',)
    
    def logo_display(self, obj):
        if obj.logo:
            return format_html('<img src="{}" width="50" height="50" style="border-radius:5px;"/>', obj.logo.url)
        return "No Logo"
    logo_display.allow_tags = True
    logo_display.short_description = 'Brand Logo'

class DesignerAdmin(admin.ModelAdmin):
    list_display = ('name', 'brand')
    search_fields = ('name', 'brand__name')

class WishlistAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'added_at')
    search_fields = ('user__username', 'product__name')
    list_filter = ('added_at',)

admin.site.site_header = "Ghanadude Admin Panel"
admin.site.site_title = "Ghana dude Admin"
admin.site.index_title = "Welcome to the Ghanadue Administration"

admin.site.register(Product, ProductAdmin)
admin.site.register(Category, CategoryAdmin)
admin.site.register(Brand, BrandAdmin)
admin.site.register(Designer, DesignerAdmin)
admin.site.register(Wishlist, WishlistAdmin)
