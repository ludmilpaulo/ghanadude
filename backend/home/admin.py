from django.contrib import admin
from django.utils.html import format_html
from .models import SiteMeta, AppVersion, DevPayment, SiteSetting


@admin.register(SiteMeta)
class SiteMetaAdmin(admin.ModelAdmin):
    list_display = ("__str__", "logo_preview", "updated_at")
    readonly_fields = ("logo_preview",)
    fieldsets = (
        (None, {
            "fields": ("logo", "logo_preview")
        }),
        ("Social Media Links", {
            "fields": (
                "facebook_url", "twitter_url", "instagram_url", "youtube_url",
                "linkedin_url", "whatsapp_url", "tiktok_url", "pinterest_url",
                "snapchat_url", "telegram_url"
            )
        }),
        ("Meta", {
            "fields": ("updated_at",),
        }),
    )

    def logo_preview(self, obj):
        if obj.logo:
            return format_html('<img src="{}" width="100" style="object-fit:contain;" />', obj.logo.url)
        return "No logo uploaded"
    logo_preview.short_description = "Logo Preview"


@admin.register(AppVersion)
class AppVersionAdmin(admin.ModelAdmin):
    list_display = ("platform", "latest_version", "store_url", "force_update", "updated_at")
    list_filter = ("platform", "force_update")
    search_fields = ("platform", "latest_version")


@admin.register(DevPayment)
class DevPaymentAdmin(admin.ModelAdmin):
    list_display = ("__str__", "amount", "created_at", "note", "invoice_link")
    list_filter = ("created_at",)
    search_fields = ("note",)
    readonly_fields = ("invoice_link",)

    def invoice_link(self, obj):
        if obj.invoice:
            return format_html('<a href="{}" target="_blank">View Invoice</a>', obj.invoice.url)
        return "-"
    invoice_link.short_description = "Invoice File"


@admin.register(SiteSetting)
class SiteSettingAdmin(admin.ModelAdmin):
    list_display = (
        "__str__",
        "brand_price", "custom_price", "delivery_fee",
        "estimatedWeight", "internationalRate",
        "vat_percentage", "country"
    )
    fieldsets = (
        ("Pricing", {
            "fields": ("brand_price", "custom_price", "delivery_fee")
        }),
        ("Delivery Settings", {
            "fields": ("estimatedWeight", "internationalRate")
        }),
        ("Tax & Location", {
            "fields": ("vat_percentage", "address", "country")
        }),
    )
