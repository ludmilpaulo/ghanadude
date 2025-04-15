from ftplib import FTP
import os

# DO NOT load from env (just for now)
FTP_HOST = "ftp.ghanadude.com"
FTP_USER = "media_public@ghanadude.com"
FTP_PASS = "Maitland@2025"  # ✅ this works manually


def upload_file_to_cpanel(local_file_path: str, remote_file_path: str):
    try:
        with FTP(FTP_HOST) as ftp:
            ftp.login(FTP_USER, FTP_PASS)  # 👈 force direct login


            # create folder chain
            folders = os.path.dirname(remote_file_path).split("/")
            for folder in folders:
                if folder:
                    try:
                        ftp.mkd(folder)

                    except:
                        pass
                    ftp.cwd(folder)

            with open(local_file_path, "rb") as file:
                ftp.storbinary(f"STOR {os.path.basename(remote_file_path)}", file)


    except Exception as e:
        print(f"❌ FTP upload failed for {remote_file_path}: {e}")
