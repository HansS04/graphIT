import os
import requests
import zipfile
import hashlib
import time
import shutil  # Přidáno pro mazání složek
from datetime import datetime

from app.database import SessionLocal
from app import models

SYMBOLS = ["BTCEUR", "ETHEUR"]
INTERVAL = "1h"
START_YEAR = 2026
START_MONTH = 1
STORAGE_DIR = "./temp_storage"  # Přejmenováno na temp, aby bylo jasné, že je to dočasné
BASE_URL = "https://data.binance.vision/data/spot/monthly/klines"

def generate_monthly_periods():
    periods = []
    current_year = START_YEAR
    current_month = START_MONTH
    now = datetime.now()
    
    while (current_year < now.year) or (current_year == now.year and current_month < now.month):
        periods.append((current_year, f"{current_month:02d}"))
        if current_month == 12:
            current_month = 1
            current_year += 1
        else:
            current_month += 1
    return periods

def download_file(url, local_path):
    print(f"[INFO] Downloading: {url}")
    try:
        response = requests.get(url, stream=True)
        if response.status_code == 404:
            print(f"[WARN] File not found (404): {url}")
            return False
        if response.status_code != 200:
            print(f"[ERROR] HTTP Error {response.status_code} for {url}")
            return False

        with open(local_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        return True
    except Exception as e:
        print(f"[ERROR] Connection failed: {str(e)}")
        return False

def verify_checksum(zip_path, checksum_path):
    print("[INFO] Verifying integrity (SHA256)...")
    try:
        with open(checksum_path, 'r') as f:
            expected_hash = f.read().split()[0].strip()
    except Exception as e:
        print(f"[ERROR] Could not read checksum file: {str(e)}")
        return False

    sha256 = hashlib.sha256()
    try:
        with open(zip_path, 'rb') as f:
            while True:
                data = f.read(65536)
                if not data: break
                sha256.update(data)
    except Exception as e:
        print(f"[ERROR] Verification failed: {str(e)}")
        return False
    
    if expected_hash == sha256.hexdigest():
        print("[INFO] Checksum verified.")
        return True
    return False

def process_data():
    periods = generate_monthly_periods()
    print(f"[INFO] Starting Data Pump. Spoléháme výhradně na DB.")
    
    db = SessionLocal()
    # Vytvoříme dočasný adresář, pokud neexistuje
    os.makedirs(STORAGE_DIR, exist_ok=True)

    try:
        for symbol in SYMBOLS:
            for year, month in periods:
                filename_base = f"{symbol}-{INTERVAL}-{year}-{month}"
                zip_name = f"{filename_base}.zip"
                
                # --- KONTROLA EXISTENCE V DB ---
                existing_file = db.query(models.CompressedFile).filter(
                    models.CompressedFile.filename == zip_name
                ).first()
                
                if existing_file:
                    print(f"[SKIP] {zip_name} is already in Database.")
                    continue

                # Cesty pro dočasné soubory
                local_zip = os.path.join(STORAGE_DIR, zip_name)
                local_checksum = os.path.join(STORAGE_DIR, f"{zip_name}.CHECKSUM")
                
                # Stahování
                url_zip = f"{BASE_URL}/{symbol}/{INTERVAL}/{zip_name}"
                url_checksum = f"{BASE_URL}/{symbol}/{INTERVAL}/{zip_name}.CHECKSUM"

                if not download_file(url_zip, local_zip): continue
                if not download_file(url_checksum, local_checksum):
                    if os.path.exists(local_zip): os.remove(local_zip)
                    continue

                # Verifikace a uložení
                if verify_checksum(local_zip, local_checksum):
                    print(f"[DB] Saving {zip_name} to Database...")
                    with open(local_zip, 'rb') as f:
                        zip_data = f.read()
                    
                    new_db_file = models.CompressedFile(
                        symbol=symbol,
                        filename=zip_name,
                        file_data=zip_data
                    )
                    db.add(new_db_file)
                    db.commit()
                    print(f"[SUCCESS] {zip_name} archived and disk cleared.")

                if os.path.exists(local_zip): os.remove(local_zip)
                if os.path.exists(local_checksum): os.remove(local_checksum)
                
                time.sleep(0.3)

        if os.path.exists(STORAGE_DIR):
            shutil.rmtree(STORAGE_DIR)
            print("[INFO] Temporary storage directory removed.")

    finally:
        db.close()
        print("-" * 60)
        print("[INFO] Data Pump finished.")

if __name__ == "__main__":
    process_data()