from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from datetime import timedelta

from . import models, schemas, auth, database
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

@app.on_event("startup")
def startup_event():
    models.Base.metadata.create_all(bind=database.engine)

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

    records = []
    for d in data:
        time_val = int(d.open_time)
        if time_val > 9999999999:
            time_val = time_val // 1000
            
        records.append({
            "time": time_val,
            "open": d.open,
            "high": d.high,
            "low": d.low,
            "close": d.close,
            "value": d.volume
        })
        
    return records

def extract_percentiles(price_paths, start_time):
    """
    Krok 3: Z matice (10000 x 72) vybere 3 hlavní linky a zabalí je pro Lightweight Charts.
    """
    # 95. percentil (Bullish)
    bull_line = np.percentile(price_paths, 95, axis=0)
    
    # 50. percentil (Average)
    avg_line = np.percentile(price_paths, 50, axis=0)
    
    # 5. percentil (Bearish)
    bear_line = np.percentile(price_paths, 5, axis=0)
    
    bull_data = []
    avg_data = []
    bear_data = []
    
    current_time = start_time
    
    for i in range(len(bull_line)):
        current_time += 3600  # Posun o 1 hodinu vpřed
        
        bull_data.append({"time": current_time, "value": float(bull_line[i])})
        avg_data.append({"time": current_time, "value": float(avg_line[i])})
        bear_data.append({"time": current_time, "value": float(bear_line[i])})
        
    return bull_data, avg_data, bear_data

def get_simulation_parameters(close_prices):
    """
    Krok 1: Přijme pole historických uzavíracích cen a spočítá parametry pro GBM.
    """

    prices = np.array(close_prices)
    
    log_returns = np.diff(np.log(prices))
    
    mu = np.mean(log_returns)
    
    sigma = np.std(log_returns)
    
    last_price = prices[-1]
    
    return mu, sigma, last_price

def run_monte_carlo(mu, sigma, last_price, days=3, num_simulations=10000):
    """
    Krok 2: Vygeneruje 10 000 možných budoucností pomocí modelu GBM.
    Vrací obrovskou matici cen (10000 řádků x 72 sloupců).
    """

    steps = days * 24 
    
    Z = np.random.standard_normal((num_simulations, steps))
    
    hourly_changes = np.exp((mu - 0.5 * sigma**2) + sigma * Z)
    
    price_paths = last_price * np.cumprod(hourly_changes, axis=1)
    
    return price_paths

@app.get("/api/predict/{symbol}")
def predict_price(symbol: str, days: int = 3, db: Session = Depends(get_db)):

    history = db.query(models.MarketData).filter(
        models.MarketData.symbol == symbol,
        models.MarketData.interval == "1h"
    ).order_by(models.MarketData.open_time.desc()).limit(500).all()

    if not history or len(history) < 10:
        raise HTTPException(status_code=404, detail="Nedostatek dat pro predikci")

    history.reverse()
    
    close_prices = [d.close for d in history]
    
    last_time = int(history[-1].open_time)
    if last_time > 9999999999:
        last_time = last_time // 1000

    mu, sigma, last_price = get_simulation_parameters(close_prices)
    
    price_paths = run_monte_carlo(mu, sigma, last_price, days=days, num_simulations=10000)
    
    bull_data, avg_data, bear_data = extract_percentiles(price_paths, last_time)

    return {
        "symbol": symbol,
        "last_price": last_price,
        "avg": avg_data,
        "bull": bull_data,
        "bear": bear_data
    }