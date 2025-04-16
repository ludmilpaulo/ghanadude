from django.apps import AppConfig


class MediaSyncConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "media_sync"

    def ready(self):
        import media_sync.signals  # type: ignore[reportUnusedImport]
        from media_sync.signals import sync_all_model_media_files

        sync_all_model_media_files()
