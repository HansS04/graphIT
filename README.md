# GraphIT

Webová analytická platforma pro vizualizaci historických dat a predikci vývoje kryptoměn. Bakalářská práce – Jan Slivka, VŠB-TUO FEI, 2026.

---

## Co to je

GraphIT je fullstack webová aplikace postavená na architektuře klient-server. Uživatel si na interaktivním dashboardu skládá analytické widgety pomocí Drag & Drop – od svíčkových grafů až po predikci budoucího vývoje pomocí Monte Carlo simulace.

**Tech stack:**
- **Frontend** – React, Lightweight Charts (TradingView)
- **Backend** – Python, FastAPI, SQLAlchemy
- **Databáze** – PostgreSQL
- **Infrastruktura** – Docker, Docker Compose

---

## Struktura projektu

```
graphIT/
├── backend/
│   └── app/
│       ├── api/          # Routy a endpointy (auth, market, presets...)
│       ├── services/     # Byznys logika (ETL pumpa, Monte Carlo)
│       └── core/         # Konfigurace, bezpečnost, závislosti
├── frontend/
│   └── src/
│       ├── features/     # Moduly podle funkce (dashboard, prediction)
│       ├── pages/        # Hlavní obrazovky
│       ├── components/   # Sdílené UI komponenty
│       ├── context/      # Globální stav aplikace
│       └── services/     # Komunikace s API
├── docker-compose.yml
├── Makefile
└── .env                  # Proměnné prostředí (neverzovat!)
```

---

## Požadavky

- [Docker](https://www.docker.com/) + Docker Compose
- `make` (na Windows lze použít Git Bash nebo WSL)

---

## Spuštění

### 1. Klonování repozitáře

```bash
git clone https://github.com/HansS04/graphIT.git
cd graphIT
```

### 2. Konfigurace prostředí

Vytvoř soubor `.env` v kořeni projektu (viz příklad níže):

```env
POSTGRES_USER=graphit
POSTGRES_PASSWORD=graphit
POSTGRES_DB=graphit
SECRET_KEY=your-secret-key
```

### 3. Spuštění aplikace

```bash
make up
```

Tím se sestaví a spustí všechny kontejnery na pozadí. Aplikace bude dostupná na:

| Služba | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger docs | http://localhost:8000/docs |
| pgAdmin | http://localhost:5050 |

---

## Makefile – přehled příkazů

```bash
make up             # Spustí všechny kontejnery na pozadí
make down           # Bezpečně zastaví všechny kontejnery
make reset          # Tvrdý reset – smaže volumes a sestaví vše od nuly
make logs-backend   # Zobrazí live logy backendu
make pump           # Spustí ETL datovou pumpu (stažení dat z Binance)
```

> **Tip:** ETL pumpu lze po přihlášení spustit také přímo z administrátorského panelu v aplikaci.

---

## Jak to funguje

1. **ETL pumpa** stáhne historická OHLCV data z Binance Vision a uloží je do PostgreSQL.
2. **Backend (FastAPI)** vystavuje REST API – načítá tržní data a počítá Monte Carlo simulace pomocí NumPy.
3. **Frontend (React)** vykresluje interaktivní svíčkové grafy a predikce. Dashboard si každý uživatel přizpůsobuje sám pomocí Drag & Drop widgetů, jejichž rozložení se ukládá do databáze.

### Uživatelské role

| Role | Možnosti |
|---|---|
| **Analytik** | Dashboard, grafy, predikce, přepínání trhů |
| **Administrátor** | Vše výše + správa ETL pumpy, pgAdmin, Swagger |

---

## Zastavení a reset

```bash
make down     # Zastaví aplikaci (data zůstanou zachována)
make reset    # Kompletní reset včetně smazání databáze
```