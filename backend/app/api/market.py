from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models
from ..core.dependencies import get_db
from ..services.monte_carlo import get_simulation_parameters, run_monte_carlo, extract_percentiles

router = APIRouter()

# ---------------------------------------------------------
# Historická data (OHLCV) pro klientské grafy
# ---------------------------------------------------------
@router.get("/market-data/{symbol}")
def get_market_data(symbol: str, db: Session = Depends(get_db)):
    # Načtení hodinových svíček seřazených chronologicky
    data = db.query(models.MarketData).filter(
        models.MarketData.symbol == symbol,
        models.MarketData.interval == "1h" 
    ).order_by(models.MarketData.open_time.asc()).all()
    
    if not data:
        return []
        
    records = []
    for d in data:
        # Transformace UNIX času z milisekund na sekundy pro frontend knihovny
        time_val = int(d.open_time)
        if time_val > 9999999999:
            time_val = time_val // 1000
            
        # Přebalení datové struktury (záměna 'volume' za 'value' pro kompatibilitu s grafem)
        records.append({
            "time": time_val,
            "open": d.open,
            "high": d.high,
            "low": d.low,
            "close": d.close,
            "value": d.volume
        })
    return records


# ---------------------------------------------------------
# Kvantitativní analýza: Stochastická simulace budoucí ceny
# ---------------------------------------------------------
@router.get("/predict/{symbol}")
def predict_price(symbol: str, days: int = 3, db: Session = Depends(get_db)):
    # Načtení 500 nejnovějších svíček pro výpočet aktuální volatility trhu
    history = db.query(models.MarketData).filter(
        models.MarketData.symbol == symbol,
        models.MarketData.interval == "1h"
    ).order_by(models.MarketData.open_time.desc()).limit(500).all()
    
    if not history or len(history) < 10:
        raise HTTPException(status_code=404, detail="Nedostatek historických dat pro simulaci.")
        
    history.reverse()  # Obnova chronologického pořadí
    close_prices = [d.close for d in history]
    
    # Získání času poslední svíčky
    last_time = int(history[-1].open_time)
    if last_time > 9999999999:
        last_time = last_time // 1000
        
    # Výpočet driftu a volatility na základě historických dat
    mu, sigma, last_price = get_simulation_parameters(close_prices)
    
    # Vygenerování matice 10 000 náhodných cenových scénářů
    price_paths = run_monte_carlo(mu, sigma, last_price, days=days, num_simulations=10000)
    
    # Agregace dat pro odlehčení datového přenosu klienta
    bull_data, avg_data, bear_data = extract_percentiles(price_paths, last_time)
    
    return {
        "symbol": symbol,
        "last_price": last_price,
        "avg": avg_data,
        "bull": bull_data,
        "bear": bear_data
    }