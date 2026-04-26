import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Načte připojovací řetězec k databázi z proměnných prostředí.
DATABASE_URL = os.getenv("DATABASE_URL")

# Vytvoří instanci Engine, která nízkoúrovňově zajišťuje spojení a komunikaci s databází.
engine = create_engine(DATABASE_URL)

# Nastaví továrnu pro vytváření izolovaných databázových relací (sessions) pro jednotlivé požadavky.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Definuje základní třídu, ze které musí dědit všechny ORM modely, aby je SQLAlchemy rozpoznalo jako databázové tabulky.
Base = declarative_base()