import os
import secrets

class Settings:
    PROJECT_NAME = "GraphIT"
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./graphit.db")
    # Pokud není nastavený SECRET_KEY v .env, vygenerujeme si náhodný
    SECRET_KEY = os.getenv("SECRET_KEY") or secrets.token_urlsafe(32)
    ALGORITHM = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES = 30

settings = Settings()