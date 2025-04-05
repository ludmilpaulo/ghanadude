from ftplib import FTP
import os

# FTP login details
FTP_HOST = "ftp.ghanadude.com"
FTP_USER = "media@ghanadude.com"
FTP_PASS = "Maitland@2025"
REMOTE_ROOT = "/"  # Already mapped to /public_html/media/ via FTP account

def upload_file_to_cpanel(local_file_path: str, remote_file_path: str):
    """
    Uploads a file to the cPanel media folder via FTP, preserving folder structure.
    """
    try:
        with FTP(FTP_HOST) as ftp:
            ftp.login(user=FTP_USER, passwd=FTP_PASS)

            # Create nested folders as needed
            folders = os.path.dirname(remote_file_path).split('/')
            for folder in folders:
                if folder:
                    try:
                        ftp.mkd(folder)
                    except:
                        pass  # Folder might already exist
                    ftp.cwd(folder)

            # Upload the file
            with open(local_file_path, "rb") as file:
                ftp.storbinary(f"STOR {os.path.basename(remote_file_path)}", file)

        print(f"✅ Uploaded to cPanel: {remote_file_path}")
    except Exception as e:
        print(f"❌ FTP upload failed for {remote_file_path}: {e}")
