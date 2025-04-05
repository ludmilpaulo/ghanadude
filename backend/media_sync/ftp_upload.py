from ftplib import FTP
import os

FTP_HOST = "ftp.ghanadude.com"
FTP_USER = "media_public@ghanadude.com"
FTP_PASS = "Maitland@2025"

def upload_file_to_cpanel(local_file_path: str, remote_file_path: str):
    """
    Uploads a file to the FTP home: /public_html/media/
    `remote_file_path` should be relative to media (e.g. 'drug_images/file.jpg')
    """
    try:
        with FTP(FTP_HOST) as ftp:
            ftp.login(user=FTP_USER, passwd=FTP_PASS)
            print("✅ Logged in to FTP")
            print("📍 Starting in:", ftp.pwd())

            # Create subfolders if needed
            folders = os.path.dirname(remote_file_path).split('/')
            for folder in folders:
                if folder:
                    try:
                        ftp.mkd(folder)
                        print(f"📁 Created folder: {folder}")
                    except Exception:
                        pass  # Already exists
                    ftp.cwd(folder)

            # Upload the file
            with open(local_file_path, "rb") as file:
                ftp.storbinary(f"STOR {os.path.basename(remote_file_path)}", file)

            print(f"✅ Uploaded: {remote_file_path}")

    except Exception as e:
        print(f"❌ FTP upload failed: {e}")
