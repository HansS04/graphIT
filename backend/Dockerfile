# GraphIT/backend/Dockerfile

FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Kopírování celého kódu aplikace
# Zkopíruje obsah složky backend/app do /app uvnitř kontejneru
COPY ./app /app

# Příkaz pro spuštění Uvicorn serveru
# Důležité: Měníme main:app na app.main:app, protože v kontejneru
# je kód v adresáři /app, ale importy probíhají z main.py, který je v
# balíčku app. Proto je správný formát `jméno_balíčku.jméno_souboru:jméno_instance`
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]