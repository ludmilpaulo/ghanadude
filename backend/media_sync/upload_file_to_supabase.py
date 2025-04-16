import os
from supabase import create_client


def upload_file_to_supabase(local_file_path: str, remote_file_path: str):
    SUPABASE_URL = os.environ.get("SUPABASE_URL")
    SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

    if not SUPABASE_URL or not SUPABASE_KEY:
        print("❌ Missing SUPABASE_URL or SUPABASE_KEY")
        return

    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    try:
        with open(local_file_path, "rb") as f:
            file_data = f.read()

        # Use update() to overwrite existing files
        response = supabase.storage.from_("ghanadude").update(
            remote_file_path, file_data
        )

        if hasattr(response, "error") and response.error:
            print(
                f"❌ Supabase upload failed for {remote_file_path}: {response.error.message}"
            )
        else:
            print(f"✅ Supabase upload successful: {remote_file_path}")

    except Exception as e:
        print(f"❌ Supabase upload failed for {remote_file_path}: {e}")
