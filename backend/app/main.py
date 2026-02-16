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
import numpy as np

app = FastAPI()

origins = ["http://localhost", "http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

scheduler = BackgroundScheduler()

def import_csv_to_db(db: Session, file_path: str, symbol: str, interval: str):
    filename = os.path.basename(file_path)
    try:
        df = pd.read_csv(file_path, names=["Open Time", "Open", "High", "Low", "Close", "Volume", "Close Time", "Q", "N", "TB", "TQ", "I"])
        df["open_time"] = df["Open Time"] // 1000000
        
        existing_times = set(
            t[0] for t in db.query(models.MarketData.open_time)
            .filter(models.MarketData.symbol == symbol, models.MarketData.interval == interval)
            .all()
        )
        
        inserted_count = 0
        for _, row in df.iterrows():
            t = int(row["open_time"])
            if t in existing_times:
                continue

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
        if inserted_count > 0:
            print(f"[{symbol}] {filename}: Imported {inserted_count} new candles.")
            
    except Exception as e:
        print(f"[{symbol}] {filename}: Import error: {e}")
        db.rollback()

def scan_and_import_data():
    storage_dirs = ["storage", "/app/storage", "../storage"]
    storage_dir = None
    for path in storage_dirs:
        if os.path.exists(path):
            storage_dir = path
            break
    if not storage_dir: return

    csv_files = glob.glob(os.path.join(storage_dir, "**", "*.csv"), recursive=True)
    
    if not csv_files: return

    db = database.SessionLocal()
    try:
        for file_path in csv_files:
            filename = os.path.basename(file_path).upper()
            if "TRADE" in filename: continue

            symbol = "UNKNOWN"
            possible_symbols = ["BTCEUR", "ETHEUR", "ETCEUR", "SOLEUR", "ADAEUR", "BTCUSD", "ETHUSD", "SOLUSD", "ADAUSD", "BTCUSDT", "ETHUSDT", "SOLUSDT"]
            
            parent_folder = os.path.basename(os.path.dirname(file_path)).upper()
            for s in possible_symbols:
                if s in filename or s in parent_folder:
                    symbol = s
                    break
            
            if symbol == "UNKNOWN": continue

            interval = "1h"
            if "1M" in filename and "1MO" not in filename: interval = "1m"
            elif "1D" in filename: interval = "1d"
            elif "15M" in filename: interval = "15m"
            elif "4H" in filename: interval = "4h"
            
            import_csv_to_db(db, file_path, symbol, interval)
    finally:
        db.close()

@app.on_event("startup")
def startup_event():
    models.Base.metadata.create_all(bind=database.engine)
    scheduler.add_job(scan_and_import_data, 'interval', seconds=60)
    scheduler.start()
    scan_and_import_data()

@app.on_event("shutdown")
def shutdown_event():
    scheduler.shutdown()

def get_db():
    db = database.SessionLocal()
    try: yield db
    finally: db.close()

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
    return current_user

@app.get("/admin/panel")
def admin_panel(current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Nemáte oprávnění.")
    return {"message": f"Vítejte v admin panelu, {current_user.email}!"}

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

@app.get("/api/market-data/{symbol}")
def get_market_data(symbol: str, db: Session = Depends(get_db)):
    data = db.query(models.MarketData).filter(
        models.MarketData.symbol == symbol,
        models.MarketData.interval == "1h" 
    ).order_by(models.MarketData.open_time.asc()).all()
    
    if not data: return []

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

@app.get("/api/predict/{symbol}")
def predict_price(symbol: str, days: int = 7, db: Session = Depends(get_db)):
    history = db.query(models.MarketData).filter(
        models.MarketData.symbol == symbol,
        models.MarketData.interval == "1h"
    ).order_by(models.MarketData.open_time.desc()).limit(500).all()

    if not history or len(history) < 10:
        raise HTTPException(status_code=404, detail="Nedostatek dat pro predikci")

    history.reverse()
    
    close_prices = [d.close for d in history]
    last_close = close_prices[-1]
    last_time = history[-1].open_time

    returns = np.diff(np.log(close_prices))
    drift = np.mean(returns)
    stdev = np.std(returns)

    future_steps = days * 24 
    
    prediction_avg = []
    prediction_bull = []
    prediction_bear = []

    current_avg = last_close
    current_bull = last_close
    current_bear = last_close
    current_time = last_time

    for _ in range(future_steps):
        current_time += 3600
        
        current_avg = current_avg * (1 + drift)
        current_bull = current_bull * (1 + drift + (stdev * 0.5))
        current_bear = current_bear * (1 + drift - (stdev * 0.5))

        prediction_avg.append({"time": current_time, "value": current_avg})
        prediction_bull.append({"time": current_time, "value": current_bull})
        prediction_bear.append({"time": current_time, "value": current_bear})

    return {
        "symbol": symbol,
        "last_price": last_close,
        "avg": prediction_avg,
        "bull": prediction_bull,
        "bear": prediction_bear
    }