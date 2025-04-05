from ftplib import FTP
import os

# FTP login details (cPanel user must have access to /public_html)
FTP_HOST = "ftp.ghanadude.com"
FTP_USER = "media@ghanadude.com"
FTP_PASS = "Maitland@2025"
REMOTE_ROOT = "/public_html/media"  # ✅ directly in the public folder

def upload_file_to_cpanel(local_file_path: str, remote_file_path: str):
    """
    Uploads a file to the cPanel public media folder via FTP, preserving folder structure.
    The `remote_file_path` is relative to /public_html/media
    """
    try:
        with FTP(FTP_HOST) as ftp:
            ftp.login(user=FTP_USER, passwd=FTP_PASS)

            # Navigate to /public_html/media/
            ftp.cwd(REMOTE_ROOT)

            # Create any subdirectories (e.g. product_images/)
            folders = os.path.dirname(remote_file_path).split('/')
            for folder in folders:
                if folder:
                    try:
                        ftp.mkd(folder)
                        print(f"📁 Created folder: {folder}")
                    except Exception:
                        pass  # Folder may already exist
                    ftp.cwd(folder)

            # Upload the actual file
            with open(local_file_path, "rb") as file:
                ftp.storbinary(f"STOR {os.path.basename(remote_file_path)}", file)

        print(f"✅ Uploaded to cPanel: {REMOTE_ROOT}/{remote_file_path}")
    except Exception as e:
        print(f"❌ FTP upload failed for {remote_file_path}: {e}")
