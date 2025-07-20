# GraphIT_app/backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Vytvoření instance FastAPI aplikace
app = FastAPI()

# --- Nastavení CORS (Cross-Origin Resource Sharing) ---
# Toto je klíčové pro umožnění komunikace mezi vaším frontendem
# (který poběží na jiném portu/doméně, např. http://localhost:3000)
# a backendem (http://localhost:8000).
origins = [
    "http://localhost:3000",  # Povolí přístup z frontendové aplikace
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # Seznam povolených domén
    allow_credentials=True,      # Povolí odesílání cookies přes domény
    allow_methods=["*"],         # Povolí všechny HTTP metody (GET, POST, PUT, DELETE atd.)
    allow_headers=["*"],         # Povolí všechny hlavičky v požadavku
)

# --- Definice API endpointů ---

# Základní endpoint na kořenové URL ("/")
@app.get("/")
def read_root():
    """
    Jednoduchý endpoint pro ověření, že backend běží.
    """
    return {"message": "Hello from FastAPI Backend!"}

# Endpoint pro získání nějakých dat (prozatím statických)
# Zde budete později integrovat logiku s Pandas a databází
@app.get("/api/data")
def get_data():
    """
    Endpoint, který by v budoucnu vracel data pro vizualizaci.
    """
    # Zde byste normálně načítali a zpracovávali data pomocí Pandas
    # např. z databáze nebo souboru.
    # from pandas import DataFrame
    # df = DataFrame({'col1': [1, 2], 'col2': [3, 4]})
    # return df.to_dict(orient='records') # Příklad vrácení dat z Pandas DataFrame

    return {"data": "This is some data from backend (soon with Pandas!)."}