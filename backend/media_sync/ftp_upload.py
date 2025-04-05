from ftplib import FTP
import os

FTP_HOST = "ftp.ghanadude.com"
FTP_USER = "media_public@ghanadude.com"
FTP_PASS = "Maitland@2025"

def upload_file_to_cpanel(local_file_path: str, remote_file_path: str):
    """
    Uploads file relative to / (which is already mapped to /public_html/media)
    Example remote_file_path: 'drug_images/DSC_3732.jpg'
    """
    try:
        with FTP(FTP_HOST) as ftp:
            ftp.login(user=FTP_USER, passwd=FTP_PASS)
            print("✅ Logged in to FTP")
            print("📍 Starting in directory:", ftp.pwd())

            # 👇 DO NOT TRY TO CWD into public_html/media — you're already there
            # Create folders step-by-step
            folders = os.path.dirname(remote_file_path).split('/')
            for folder in folders:
                if folder:
                    try:
                        ftp.mkd(folder)
                        print(f"📁 Created folder: {folder}")
                    except Exception:
                        pass  # already exists
                    ftp.cwd(folder)

            # Upload the file
            with open(local_file_path, "rb") as file:
                ftp.storbinary(f"STOR {os.path.basename(remote_file_path)}", file)

        print(f"✅ Uploaded: {remote_file_path}")

    except Exception as e:
        print(f"❌ FTP upload failed for {remote_file_path}: {e}")
