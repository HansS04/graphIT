import os
import requests
import zipfile
import hashlib
import time
import shutil
import pandas as pd
from datetime import datetime

from app.database import SessionLocal
from app import models

SYMBOLS = ["BTCEUR", "ETHEUR"]
INTERVAL = "1h"
START_YEAR = 2025 # Nastaveno na 2025, abys měl dostatek dat pro graf
START_MONTH = 1
STORAGE_DIR = "./temp_storage"
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
    print(f"[INFO] Stahuji: {url}")
    try:
        response = requests.get(url, stream=True)
        if response.status_code != 200: 
            return False
        with open(local_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        return True
    except Exception as e:
        print(f"[ERROR] Chyba stahování: {e}")
        return False

def verify_checksum(zip_path, checksum_path):
    print("[INFO] Kontroluji checksum (SHA256)...")
    try:
        with open(checksum_path, 'r') as f:
            expected_hash = f.read().split()[0].strip()
        sha256 = hashlib.sha256()
        with open(zip_path, 'rb') as f:
            while True:
                data = f.read(65536)
                if not data: break
                sha256.update(data)
        return expected_hash == sha256.hexdigest()
    except Exception as e:
        print(f"[ERROR] Chyba kontroly checksumu: {e}")
        return False

def process_data():
    periods = generate_monthly_periods()
    print(f"[INFO] Start Datové Pumpy. Režim: MarketData + Compressed záloha.")
    
    db = SessionLocal()
    os.makedirs(STORAGE_DIR, exist_ok=True)

    try:
        for symbol in SYMBOLS:
            for year, month in periods:
                filename_base = f"{symbol}-{INTERVAL}-{year}-{month}"
                zip_name = f"{filename_base}.zip"
                
                # Zkontrolujeme, jestli už tento ZIP nemáme v zálohách
                existing_file = db.query(models.CompressedFile).filter(models.CompressedFile.filename == zip_name).first()
                if existing_file:
                    print(f"[SKIP] {zip_name} už je kompletně v databázi, přeskakuji.")
                    continue

                local_zip = os.path.join(STORAGE_DIR, zip_name)
                local_checksum = os.path.join(STORAGE_DIR, f"{zip_name}.CHECKSUM")
                
                url_zip = f"{BASE_URL}/{symbol}/{INTERVAL}/{zip_name}"
                url_checksum = f"{BASE_URL}/{symbol}/{INTERVAL}/{zip_name}.CHECKSUM"

                # 1. STAŽENÍ SOUBORŮ
                if not download_file(url_zip, local_zip): continue
                if not download_file(url_checksum, local_checksum):
                    if os.path.exists(local_zip): os.remove(local_zip)
                    continue

                # 2. KONTROLA CHECKSUMU
                if verify_checksum(local_zip, local_checksum):
                    try:
                        # 3. ZPRACOVÁNÍ A ODESLÁNÍ DO MARKET_DATA
                        print(f"[DB] Čtu CSV a odesílám data do market_data...")
                        with zipfile.ZipFile(local_zip, 'r') as zip_ref:
                            csv_filename = zip_ref.namelist()[0]
                            with zip_ref.open(csv_filename) as csv_file:
                                df = pd.read_csv(csv_file, header=None, names=["Open Time", "Open", "High", "Low", "Close", "Volume", "Close Time", "Q", "N", "TB", "TQ", "I"])
                                
                                existing_times = set(t[0] for t in db.query(models.MarketData.open_time).filter(models.MarketData.symbol == symbol, models.MarketData.interval == INTERVAL).all())
                                
                                inserted_count = 0
                                for _, row in df.iterrows():
                                    t = int(row["Open Time"] // 1000) # Unix timestamp (sekundy)
                                    if t in existing_times: continue
                                    
                                    db_item = models.MarketData(
                                        symbol=symbol, interval=INTERVAL, open_time=t,
                                        open=float(row["Open"]), high=float(row["High"]), low=float(row["Low"]),
                                        close=float(row["Close"]), volume=float(row["Volume"])
                                    )
                                    db.add(db_item)
                                    inserted_count += 1

                        # 4. ODESLÁNÍ ZIPU DO COMPRESSED (Záloha)
                        print(f"[DB] Odesílám ZIP zálohu do compressed...")
                        with open(local_zip, 'rb') as f:
                            zip_data = f.read()
                        
                        new_db_file = models.CompressedFile(symbol=symbol, filename=zip_name, file_data=zip_data)
                        db.add(new_db_file)
                        
                        # Potvrzení obou operací do databáze najednou
                        db.commit()
                        print(f"[SUCCESS] {zip_name} zpracován! {inserted_count} svíček přidáno.")
                        
                    except Exception as e:
                        print(f"[ERROR] Nastala chyba při ukládání do DB: {e}")
                        db.rollback() # Pokud něco selže, data se neuloží ani do jedné tabulky

                # 5. SMAZÁNÍ V LOKÁLU A PŘECHOD NA DALŠÍ
                if os.path.exists(local_zip): os.remove(local_zip)
                if os.path.exists(local_checksum): os.remove(local_checksum)
                print(f"[CLEANUP] Lokální soubory smazány.\n")
                
                time.sleep(0.3) # Krátká pauza pro Binance API

        # Úklid celé složky na samotný závěr
        if os.path.exists(STORAGE_DIR):
            shutil.rmtree(STORAGE_DIR)

    finally:
        db.close()
        print("-" * 60)
        print("[INFO] Datová Pumpa úspěšně dokončila běh.")

if __name__ == "__main__":
    process_data()