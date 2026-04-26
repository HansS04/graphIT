from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from .. import models, schemas
from ..core import security as auth
from ..core.dependencies import get_db

router = APIRouter()

# API endpoint pro registraci nového uživatele. Tento endpoint přijímá data o novém uživateli, kontroluje, zda již neexistuje uživatel se stejným emailem, a pokud ne, vytvoří nového uživatele s hashovaným heslem a uloží ho do databáze.
@router.post("/register", response_model=schemas.UserInDB)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email exists")
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password, role=user.role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# API endpoint pro přihlášení uživatele. Tento endpoint přijímá přihlašovací údaje, ověřuje je proti databázi, a pokud jsou správné, generuje a vrací JWT token pro autentizaci v dalších požadavcích.
@router.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Bad credentials")
    access_token = auth.create_access_token(
        data={"sub": user.email, "role": user.role},
        expires_delta=timedelta(minutes=30)
    )
    return {"access_token": access_token, "token_type": "bearer"}