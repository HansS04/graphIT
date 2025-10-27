# Přejdeme na plnou, stabilnější Debian image
FROM python:3.9 

WORKDIR /app

COPY requirements.txt .

# Instalace Python balíčků. Většina nativních rozšíření se teď nainstaluje bez problémů.
# Pokud by přesto psycopg2-binary vyžadoval libpq-dev, stačí přidat:
# RUN apt-get update && apt-get install -y libpq-dev 
RUN pip install --no-cache-dir -r requirements.txt

COPY ./app /app

# Spouštěcí příkaz
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]