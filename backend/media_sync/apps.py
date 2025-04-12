from django.apps import AppConfig


class MediaSyncConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "media_sync"

    def ready(self):
        import media_sync.signals  # auto-load signals on startup
