import os
from django.apps import apps
from django.db.models import FileField, ImageField
from .upload_file_to_supabase import upload_file_to_supabase


def sync_all_model_media_files():
    env = os.environ.get("DJANGO_ENV")
    if env != "prod":
        print("🛑 Not syncing media files outside of production.")
        return

    print("🔄 Scanning all model media files...")

    for model in apps.get_models():
        if model._meta.app_label == "contenttypes":
            continue  # skip built-in models

        file_fields = [f for f in model._meta.fields if isinstance(f, (FileField, ImageField))]
        if not file_fields:
            continue

        try:
            instances = model.objects.all()
        except Exception as e:
            print(f"⚠️ Could not fetch instances of {model.__name__}: {e}")
            continue

        for instance in instances:
            for field in file_fields:
                file = getattr(instance, field.name)
                if file and hasattr(file, "path"):
                    local_path = file.path
                    remote_path = file.name
                    if os.path.exists(local_path):
                        print(f"⬆️ Syncing: {remote_path}")
                        try:
                            upload_file_to_supabase(local_path, remote_path)
                        except Exception as e:
                            print(f"❌ Failed to upload {remote_path}: {e}")
