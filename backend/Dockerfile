# GraphIT/backend/Dockerfile

# Použijeme oficiální Python obraz jako základ
# Verze 3.9-slim-buster je menší a vhodná pro produkci
FROM python:3.9-slim-buster

# Nastavíme pracovní adresář uvnitř kontejneru
WORKDIR /app

# Zkopírujeme soubor se závislostmi Pythonu do pracovního adresáře
COPY requirements.txt .

# Nainstalujeme Python závislosti. --no-cache-dir pro menší obraz
RUN pip install --no-cache-dir -r requirements.txt

# Zkopírujeme zbytek kódu aplikace do kontejneru
# Tečka na konci znamená "vše z aktuálního adresáře na hostu do WORKDIR v kontejneru"
COPY . .

# Specifikujeme příkaz, který se spustí při startu kontejneru.
# Uvicorn je ASGI server pro FastAPI.
# app.main:app znamená, že spustíme instanci 'app' z modulu 'main' uvnitř adresáře 'app'.
# --host 0.0.0.0 zajistí, že server naslouchá na všech rozhraních, aby byl dostupný zvenčí kontejneru.
# --port 8000 je port, na kterém bude backend naslouchat.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

# Otevření portu 8000 v kontejneru.
# Toto je spíše dokumentační, hlavní mapování portů se děje v docker-compose.yml.
EXPOSE 8000