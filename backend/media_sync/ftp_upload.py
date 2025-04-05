from ftplib import FTP
import os

FTP_HOST = "ftp.ghanadude.com"
FTP_USER = "media@ghanadude.com"
FTP_PASS = "Maitland@2025"

def upload_file_to_cpanel(local_file_path: str, remote_file_path: str):
    """
    Upload file to FTP user root (already mapped to /public_html/media).
    `remote_file_path` is relative inside media, like 'drug_images/file.jpg'
    """
    try:
        with FTP(FTP_HOST) as ftp:
            ftp.login(user=FTP_USER, passwd=FTP_PASS)
            print("📍 Logged in, current dir:", ftp.pwd())

            # Create any nested directories
            folders = os.path.dirname(remote_file_path).split('/')
            for folder in folders:
                if folder:
                    try:
                        ftp.mkd(folder)
                        print(f"📁 Created folder: {folder}")
                    except:
                        pass  # Might already exist
                    ftp.cwd(folder)

            # Upload file
            with open(local_file_path, "rb") as file:
                ftp.storbinary(f"STOR {os.path.basename(remote_file_path)}", file)

        print(f"✅ Uploaded to cPanel: {remote_file_path}")
    except Exception as e:
        print(f"❌ FTP upload failed for {remote_file_path}: {e}")
