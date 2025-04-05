from ftplib import FTP
import os

# Use your cPanel **main FTP credentials**, NOT the limited sub-user
FTP_HOST = "ftp.ghanadude.com"
FTP_USER = "armlorph12@gmail.com"  # ← use cPanel account name, NOT email
FTP_PASS = "army2011"

def upload_file_to_cpanel(local_file_path: str, remote_file_path: str):
    """
    Upload a file relative to the FTP root (should be /home/ghanadud/public_html/media).
    remote_file_path = e.g. 'drug_images/DSC_3732.jpg'
    """
    try:
        with FTP(FTP_HOST) as ftp:
            ftp.login(user=FTP_USER, passwd=FTP_PASS)

            print("📍 Logged in. Current FTP root:", ftp.pwd())

            # Create nested directories
            folders = os.path.dirname(remote_file_path).split('/')
            for folder in folders:
                if folder:
                    try:
                        ftp.mkd(folder)
                        print(f"📁 Created folder: {folder}")
                    except Exception:
                        pass  # Folder may already exist
                    ftp.cwd(folder)

            with open(local_file_path, "rb") as file:
                ftp.storbinary(f"STOR {os.path.basename(remote_file_path)}", file)

            print(f"✅ Uploaded: {remote_file_path}")

    except Exception as e:
        print(f"❌ FTP upload failed for {remote_file_path}: {e}")
