import os
from supabase import create_client
from dotenv import load_dotenv

# Load .env only if running outside Django (e.g., local dev shell)
if os.getenv("SUPABASE_KEY") is None:
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    load_dotenv(os.path.join(BASE_DIR, ".env"))


def upload_file_to_supabase(local_file_path: str, remote_file_path: str):
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")

    if not SUPABASE_URL or not SUPABASE_KEY:
        print("❌ Missing SUPABASE_URL or SUPABASE_KEY")
        return

    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    try:
        with open(local_file_path, "rb") as f:
            file_data = f.read()
        supabase.storage.from_("ghanadude").upload(
            remote_file_path, file_data, {"upsert": True}
        )
        print(f"✅ Uploaded to Supabase: {remote_file_path}")
    except Exception as e:
        print(f"❌ Supabase upload failed for {remote_file_path}: {e}")
