import os
from django.core.management.base import BaseCommand
from supabase import create_client

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
BUCKET_NAME = "ghanadude"
MEDIA_ROOT = os.environ.get("MEDIA_ROOT", os.path.join("static_cdn", "media_root"))

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

class Command(BaseCommand):
    help = "Upload all media files from MEDIA_ROOT to Supabase Storage"

    def handle(self, *args, **options):
        if not SUPABASE_URL or not SUPABASE_KEY:
            self.stderr.write("❌ SUPABASE_URL or SUPABASE_KEY missing")
            return

        if not os.path.exists(MEDIA_ROOT):
            self.stderr.write(f"❌ MEDIA_ROOT not found: {MEDIA_ROOT}")
            return

        self.stdout.write(f"📂 Syncing all media from: {MEDIA_ROOT}")

        for root, _, files in os.walk(MEDIA_ROOT):
            for filename in files:
                local_path = os.path.join(root, filename)
                remote_path = os.path.relpath(local_path, MEDIA_ROOT).replace("\\", "/")

                try:
                    with open(local_path, "rb") as f:
                        file_data = f.read()
                    response = supabase.storage.from_(BUCKET_NAME).update(remote_path, file_data)

                    if hasattr(response, "data") and response.data:
                        self.stdout.write(f"✅ {remote_path}")
                    elif hasattr(response, "error") and response.error:
                        self.stderr.write(f"❌ {remote_path}: {response.error.message}")
                    else:
                        self.stdout.write(f"⚠️ Unknown result for {remote_path}")
                except Exception as e:
                    self.stderr.write(f"❌ Error uploading {remote_path}: {e}")
