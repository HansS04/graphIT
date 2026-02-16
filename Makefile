.PHONY: up down reset build rebuild restart logs logs-backend shell pump

# 1. Spustí celou aplikaci na pozadí
up:
	sudo docker compose up -d

# 2. Zastaví a odstraní kontejnery (data v DB zůstanou)
down:
	sudo docker compose down

# 3. TVRDÝ RESET: Zastaví kontejnery, smaže databázi a znovu vše čistě spustí
reset:
	sudo docker compose down -v
	sudo docker compose up -d --build

# 4. Běžný build (když přidáš něco nového, použije cache)
build:
	sudo docker compose build

# 5. Vynucený build bez cache (řeší ten problém, co jsme měli předtím, že neviděl nový soubor)
rebuild:
	sudo docker compose build --no-cache
	sudo docker compose up -d

# 6. Restartuje běžící kontejnery
restart:
	sudo docker compose restart

# 7. Zobrazí živé logy ze všech kontejnerů (ukončíš přes Ctrl+C)
logs:
	sudo docker compose logs -f

# 8. Zobrazí logy pouze z backendu
logs-backend:
	sudo docker compose logs -f backend

# 9. Otevře ti příkazovou řádku přímo uvnitř backend kontejneru (užitečné pro debugování)
shell:
	sudo docker compose exec backend /bin/bash

# 10. Zkratka pro spuštění tvojí datové pumpy!
pump:
	sudo docker compose exec backend python -m app.data_pump
