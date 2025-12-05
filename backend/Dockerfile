# Přejdeme na plnou, stabilnější Debian image
FROM python:3.9

# Nastavíme pracovní adresář
WORKDIR /app

# Nejdříve zkopírujeme requirements (kvůli cachování vrstev Dockeru)
COPY requirements.txt .

# Instalace závislostí
RUN pip install --no-cache-dir -r requirements.txt

# Zkopírujeme VŠE ze složky backend (tedy složku 'app', případně 'storage', atd.)
COPY . .

# Pokud chcete mít jistotu, že složka storage existuje (volitelné, Python to udělá taky)
# RUN mkdir -p storage

# Spouštěcí příkaz
# Pozor: Protože jsme zkopírovali vše, cesta k modulu je stále 'app.main:app'
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]