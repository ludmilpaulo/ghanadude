# media_sync/apps.py
from django.apps import AppConfig

class MediaSyncConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "media_sync"

    def ready(self):
        # import the module so Django registers @receiver handlers
        import media_sync.signals  # noqa
