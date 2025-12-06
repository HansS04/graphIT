from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
from . import models, schemas, auth, database
from datetime import timedelta
import pandas as pd
import os
import glob

app = FastAPI()

# --- KONFIGURACE ---
origins = ["http://localhost", "http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

scheduler = BackgroundScheduler()

# --- DATOVÁ PIPELINE (ETL) ---

def import_csv_to_db(db: Session, file_path: str, symbol: str, interval: str):
    """
    Načte CSV se svíčkami (Klines), zkontroluje duplicity a uloží nové do DB.
    """
    filename = os.path.basename(file_path)
    try:
        # Načtení CSV (Binance formát bez hlavičky)
        df = pd.read_csv(file_path, names=["Open Time", "Open", "High", "Low", "Close", "Volume", "Close Time", "Q", "N", "TB", "TQ", "I"])
        
        # Konverze času z mikrosekund na sekundy
        df["open_time"] = df["Open Time"] // 1000000
        
        # Získáme existující časy z DB pro tento symbol (pro rychlou kontrolu duplicit)
        existing_times = set(
            t[0] for t in db.query(models.MarketData.open_time)
            .filter(models.MarketData.symbol == symbol, models.MarketData.interval == interval)
            .all()
        )
        
        inserted_count = 0
        skipped_count = 0
        
        for _, row in df.iterrows():
            t = int(row["open_time"])
            
            # Pokud čas v DB už je, přeskočíme ho
            if t in existing_times:
                skipped_count += 1
                continue

            # Pokud není, vložíme ho
            db_item = models.MarketData(
                symbol=symbol, 
                interval=interval, 
                open_time=t,
                open=float(row["Open"]), 
                high=float(row["High"]), 
                low=float(row["Low"]),
                close=float(row["Close"]), 
                volume=float(row["Volume"])
            )
            db.add(db_item)
            inserted_count += 1
        
        db.commit()
        
        # Logování výsledku
        if inserted_count > 0:
            print(f"✅ [{symbol}] {filename}: Nahráno {inserted_count} nových svíček. (Přeskočeno {skipped_count} duplicit)")
        elif skipped_count > 0:
            print(f"⚠️ [{symbol}] {filename}: Všechna data ({skipped_count}) už v DB jsou. Nic nového.")
            
    except Exception as e:
        print(f"❌ [{symbol}] {filename}: Chyba importu: {e}")
        db.rollback()

def scan_and_import_data():
    """
    Inteligentní skenování storage.
    Hledá CSV v podsložkách, detekuje symboly a ignoruje 'trades'.
    """
    storage_dirs = ["storage", "/app/storage", "../storage"]
    storage_dir = None
    for path in storage_dirs:
        if os.path.exists(path):
            storage_dir = path
            break
    if not storage_dir: 
        # print("Storage nenalezena.")
        return

    # Rekurzivní hledání všech CSV
    csv_files = glob.glob(os.path.join(storage_dir, "**", "*.csv"), recursive=True)
    
    if not csv_files:
        return

    db = database.SessionLocal()
    try:
        for file_path in csv_files:
            filename = os.path.basename(file_path).upper()
            
            # 1. FILTRACE: Ignorujeme soubory s obchody (trades)
            if "TRADE" in filename:
                continue

            # 2. DETEKCE SYMBOLU
            symbol = "UNKNOWN"
            possible_symbols = ["BTCEUR", "ETHEUR", "ETCEUR", "SOLEUR", "ADAEUR", "BTCUSD", "ETHUSD", "SOLUSD", "ADAUSD", "BTCUSDT", "ETHUSDT", "SOLUSDT"]
            
            parent_folder = os.path.basename(os.path.dirname(file_path)).upper()
            for s in possible_symbols:
                if s in filename or s in parent_folder:
                    symbol = s
                    break
            
            if symbol == "UNKNOWN": continue

            # 3. DETEKCE INTERVALU
            interval = "1h" # Default
            if "1M" in filename and "1MO" not in filename: interval = "1m"
            elif "1D" in filename: interval = "1d"
            elif "15M" in filename: interval = "15m"
            elif "4H" in filename: interval = "4h"
            
            # Spustíme import
            import_csv_to_db(db, file_path, symbol, interval)
            
    finally:
        db.close()

# --- STARTUP & SHUTDOWN ---

@app.on_event("startup")
def startup_event():
    models.Base.metadata.create_all(bind=database.engine)
    # Spustit import pravidelně (60s)
    scheduler.add_job(scan_and_import_data, 'interval', seconds=60)
    scheduler.start()
    # A také hned teď při startu
    scan_and_import_data()

@app.on_event("shutdown")
def shutdown_event():
    scheduler.shutdown()

def get_db():
    db = database.SessionLocal()
    try: yield db
    finally: db.close()

# --- AUTH ---

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = auth.decode_access_token(token)
    if not payload: raise HTTPException(status_code=401, detail="Invalid token")
    email: str = payload.get("sub")
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user: raise HTTPException(status_code=401, detail="User not found")
    return user

@app.post("/register", response_model=schemas.UserInDB)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user: raise HTTPException(status_code=400, detail="Email exists")
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password, role=user.role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Bad credentials")
    access_token = auth.create_access_token(data={"sub": user.email, "role": user.role}, expires_delta=timedelta(minutes=30))
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=schemas.UserInDB)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return {"email": current_user.email, "role": current_user.role}

@app.get("/admin/panel")
def admin_panel(current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Nemáte oprávnění.")
    return {"message": f"Vítejte v admin panelu, {current_user.email}!"}

# --- PRESETS (DASHBOARDY) ---

@app.post("/api/presets", response_model=schemas.Preset)
def create_preset(preset: schemas.PresetCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_preset = models.DashboardPreset(name=preset.name, layout=preset.layout, user_id=current_user.id)
    db.add(db_preset)
    db.commit()
    db.refresh(db_preset)
    return db_preset

@app.put("/api/presets/{preset_id}", response_model=schemas.Preset)
def update_preset(preset_id: int, preset: schemas.PresetCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_preset = db.query(models.DashboardPreset).filter(models.DashboardPreset.id == preset_id, models.DashboardPreset.user_id == current_user.id).first()
    if not db_preset: raise HTTPException(status_code=404, detail="Preset not found")
    db_preset.name = preset.name
    db_preset.layout = preset.layout
    db.commit()
    db.refresh(db_preset)
    return db_preset

@app.get("/api/presets", response_model=list[schemas.Preset])
def get_presets(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.DashboardPreset).filter(models.DashboardPreset.user_id == current_user.id).all()

@app.delete("/api/presets/{preset_id}")
def delete_preset(preset_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    preset = db.query(models.DashboardPreset).filter(models.DashboardPreset.id == preset_id, models.DashboardPreset.user_id == current_user.id).first()
    if not preset: raise HTTPException(status_code=404, detail="Not found")
    db.delete(preset)
    db.commit()
    return {"message": "Deleted"}

# --- MARKET DATA API (Čtení z DB) ---

@app.get("/api/market-data/{symbol}")
def get_market_data(symbol: str, db: Session = Depends(get_db)):
    """
    Vrátí data pro graf přímo z DATABÁZE.
    """
    # Dotaz do DB, seřazeno podle času, filtrujeme natvrdo 1h (prozatím)
    data = db.query(models.MarketData).filter(
        models.MarketData.symbol == symbol,
        models.MarketData.interval == "1h" 
    ).order_by(models.MarketData.open_time.asc()).all()
    
    # DEBUG VÝPIS: Uvidíte v terminálu, kolik dat se posílá
    print(f"📊 API: Pro symbol {symbol} odesílám {len(data)} svíček.")

    if not data: 
        return []

    # Formátování pro frontend
    return [
        {
            "time": d.open_time,
            "open": d.open,
            "high": d.high,
            "low": d.low,
            "close": d.close,
            "value": d.volume
        } 
        for d in data
    ]