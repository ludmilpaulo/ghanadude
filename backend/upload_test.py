# upload_test.py

import os
from supabase import create_client

# Set these as needed or pull from your environment
SUPABASE_URL = "https://ucekkzhmdgmcenhvxary.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjZWtremhtZGdtY2VuaHZ4YXJ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDc1MDI2OSwiZXhwIjoyMDYwMzI2MjY5fQ.t-l64xWSTCZKe_4RvTNY2YNwaCCssuzLiwWsttCfVW0"
BUCKET_NAME = "ghanadude"

# File paths
local_file_path = os.path.join("statics", "logo.png")
remote_file_path = "product_images/test_upload.jpg"

local_file_path = os.path.join("statics", "logo.png")
remote_file_path = "product_images/test_upload.jpg"  # Change this if needed

# Create Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Ensure file exists
if not os.path.exists(local_file_path):
    raise FileNotFoundError(f"❌ File not found: {local_file_path}")

try:
    with open(local_file_path, "rb") as f:
        file_data = f.read()

    # Perform the upload
    response = supabase.storage.from_(BUCKET_NAME).upload(remote_file_path, file_data)

    if hasattr(response, "data") and response.data:
        print("✅ Upload successful!")
        print("🔗 Public URL:")
        print(f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{remote_file_path}")
    elif hasattr(response, "error") and response.error:
        print(f"❌ Upload failed: {response.error.message}")
    else:
        print("⚠️ Upload completed with unknown result")

except Exception as e:
    print(f"❌ Exception occurred: {e}")