from ftplib import FTP
import os

FTP_HOST = "ftp.ghanadude.com"
FTP_USER = "media@ghanadude.com"
FTP_PASS = "Maitland@2025"
REMOTE_ROOT = "."  # ✅ FTP user already lands in /public_html/media

def upload_file_to_cpanel(local_file_path: str, remote_file_path: str):
    try:
        with FTP(FTP_HOST) as ftp:
            ftp.login(user=FTP_USER, passwd=FTP_PASS)

            # 🔍 Log where we are
            print("📍 FTP at:", ftp.pwd())

            ftp.cwd(REMOTE_ROOT)

            # Create folders if needed
            folders = os.path.dirname(remote_file_path).split('/')
            for folder in folders:
                if folder:
                    try:
                        ftp.mkd(folder)
                        print(f"📁 Created folder: {folder}")
                    except Exception:
                        pass
                    ftp.cwd(folder)

            with open(local_file_path, "rb") as file:
                ftp.storbinary(f"STOR {os.path.basename(remote_file_path)}", file)

        print(f"✅ Uploaded to cPanel: {remote_file_path}")
    except Exception as e:
        print(f"❌ FTP upload failed for {remote_file_path}: {e}")
