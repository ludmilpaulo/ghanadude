from ftplib import FTP
import os

FTP_HOST = "ftp.ghanadude.com"
FTP_USER = "media@ghanadude.com"
FTP_PASS = "Maitland@2025"
REMOTE_DIR = "/"  # Already mapped to /public_html/media/

def upload_file_to_cpanel(local_file_path: str, remote_filename: str):
    try:
        with FTP(FTP_HOST) as ftp:
            ftp.login(user=FTP_USER, passwd=FTP_PASS)
            ftp.cwd(REMOTE_DIR)
            with open(local_file_path, "rb") as file:
                ftp.storbinary(f"STOR {remote_filename}", file)
        print(f"✅ Uploaded {remote_filename}")
    except Exception as e:
        print(f"❌ FTP upload failed: {e}")
