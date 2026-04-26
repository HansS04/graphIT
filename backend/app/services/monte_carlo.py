import numpy as np

# Z velké matice všech simulací vybere 3 hlavní křivky (optimistickou, průměrnou a pesimistickou) a připraví je pro graf.
def extract_percentiles(price_paths, start_time):
    bull_line = np.percentile(price_paths, 95, axis=0)
    avg_line = np.percentile(price_paths, 50, axis=0)
    bear_line = np.percentile(price_paths, 5, axis=0)
    bull_data, avg_data, bear_data = [], [], []
    current_time = start_time
    for i in range(len(bull_line)):
        current_time += 3600
        bull_data.append({"time": current_time, "value": float(bull_line[i])})
        avg_data.append({"time": current_time, "value": float(avg_line[i])})
        bear_data.append({"time": current_time, "value": float(bear_line[i])})
    return bull_data, avg_data, bear_data

# Z historických cen vypočítá základní parametry pro budoucí simulaci: trend (mu), volatilitu (sigma) a startovací cenu.
def get_simulation_parameters(close_prices):
    prices = np.array(close_prices)
    log_returns = np.diff(np.log(prices))
    mu = np.mean(log_returns)
    sigma = np.std(log_returns)
    last_price = prices[-1]
    return mu, sigma, last_price

# Samotná Monte Carlo simulace. Na základě vypočítaného trendu a volatility vygeneruje matici tisíců náhodných scénářů vývoje ceny.
def run_monte_carlo(mu, sigma, last_price, days=3, num_simulations=10000):
    steps = days * 24 
    Z = np.random.standard_normal((num_simulations, steps))
    hourly_changes = np.exp((mu - 0.5 * sigma**2) + sigma * Z)
    price_paths = last_price * np.cumprod(hourly_changes, axis=1)
    return price_paths