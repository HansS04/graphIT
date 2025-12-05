from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from . import models, schemas, auth, database
from datetime import timedelta
import pandas as pd
import os

app = FastAPI()

# Nastavení CORS (aby frontend mohl komunikovat s backendem)
origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializace databáze při startu
@app.on_event("startup")
def create_db_tables():
    models.Base.metadata.create_all(bind=database.engine)

# Závislost pro získání DB session
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- AUTENTIZACE A UŽIVATELÉ ---

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Nelze ověřit přihlašovací údaje",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = auth.decode_access_token(token)
    if not payload:
        raise credentials_exception
    email: str = payload.get("sub")
    role: str = payload.get("role")
    if email is None or role is None:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

@app.post("/register", response_model=schemas.UserInDB)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email již existuje.")
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password, role=user.role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Špatné uživatelské jméno nebo heslo.")
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email, "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=schemas.UserInDB)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return {"email": current_user.email, "role": current_user.role}

@app.get("/admin/panel")
def admin_panel(current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Nemáte oprávnění.")
    return {"message": f"Vítejte v admin panelu, {current_user.email}!"}

# --- MARKET DATA API (CSV + PANDAS) ---

@app.get("/api/market-data/{symbol}")
def get_market_data(symbol: str):
    """
    Načte data pro graf ze složky 'storage' na základě symbolu (např. BTCEUR).
    Očekává CSV formát z Binance Klines.
    """
    
    # Cesta ke složce storage (v Dockeru je to /app/storage)
    # Zkontrolujeme více možných cest pro jistotu
    possible_storage_paths = ["storage", "/app/storage", "../storage"]
    storage_dir = None
    
    for path in possible_storage_paths:
        if os.path.exists(path):
            storage_dir = path
            break
            
    if not storage_dir:
        # Pokud složka neexistuje, vytvoříme ji, aby aplikace nespadla, ale vrátíme prázdná data
        try:
            os.makedirs("storage", exist_ok=True)
            print("Varování: Složka 'storage' nebyla nalezena, vytvořena nová.")
            return []
        except Exception as e:
            print(f"Chyba při hledání storage: {e}")
            return []

    # Hledání souboru, který obsahuje náš symbol (case-insensitive)
    found_file_path = None
    try:
        for filename in os.listdir(storage_dir):
            if symbol.upper() in filename.upper() and filename.endswith(".csv"):
                found_file_path = os.path.join(storage_dir, filename)
                break
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chyba při čtení adresáře: {str(e)}")

    if not found_file_path:
        print(f"Soubor pro symbol '{symbol}' nebyl v '{storage_dir}' nalezen.")
        # Můžete zde vrátit 404, nebo prázdné pole (aby frontend neřval chybu)
        raise HTTPException(status_code=404, detail=f"Data pro symbol {symbol} nebyla nalezena. Nahrajte prosím CSV do složky storage.")

    # Zpracování CSV pomocí Pandas
    try:
        # Definice sloupců (Binance CSV nemá hlavičku)
        columns = [
            "Open Time", "Open", "High", "Low", "Close", "Volume",
            "Close Time", "Quote Asset Volume", "Number of Trades",
            "Taker Buy Base Asset Volume", "Taker Buy Quote Asset Volume", "Ignore"
        ]
        
        df = pd.read_csv(found_file_path, names=columns)
        
        # Převod času z mikrosekund na sekundy (Lightweight Charts vyžaduje sekundy)
        # 1759276800000000 (us) -> 1759276800 (s)
        df["time"] = df["Open Time"] // 1000000 
        
        # Přejmenování sloupců pro frontend (musí být malá písmena: open, high, low, close)
        df = df.rename(columns={
            "Open": "open",
            "High": "high",
            "Low": "low",
            "Close": "close"
        })
        
        # Seřazení podle času (graf to vyžaduje)
        df = df.sort_values("time")
        
        # Výběr pouze potřebných sloupců a převod na list slovníků (JSON)
        result = df[["time", "open", "high", "low", "close"]].to_dict(orient="records")
        
        return result
        
    except Exception as e:
        print(f"CHYBA PŘI ZPRACOVÁNÍ CSV: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chyba při zpracování souboru: {str(e)}")