# utils/supabase.py

SUPABASE_PUBLIC_BASE = "https://ucekkzhmdgmcenhvxary.supabase.co/storage/v1/object/public/ghanadude"

def get_public_supabase_url(file_field):
    if file_field and hasattr(file_field, "name"):
        return f"{SUPABASE_PUBLIC_BASE}/{file_field.name}"
    return None
