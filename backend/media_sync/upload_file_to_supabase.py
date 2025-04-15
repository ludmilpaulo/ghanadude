from supabase import create_client
import os

SUPABASE_URL = "https://ucekkzhmdgmcenhvxary.supabase.co"
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")  # Store this in your .env securely

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def upload_file_to_supabase(local_file_path: str, remote_file_path: str):
    try:
        with open(local_file_path, "rb") as f:
            supabase.storage.from_("ghanadude").upload(
                remote_file_path, f,
                file_options={
                    "cacheControl": "3600",
                    "upsert": True
                }
            )
            print(f"✅ Uploaded to Supabase: {remote_file_path}")
    except Exception as e:
        print(f"❌ Supabase upload failed for {remote_file_path}: {e}")
