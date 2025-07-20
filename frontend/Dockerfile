# GraphIT/frontend/Dockerfile

# Použijeme oficiální Node.js obraz jako základ
# Verze 18-alpine je menší a efektivnější
FROM node:18-alpine

# Nastavíme pracovní adresář uvnitř kontejneru
WORKDIR /app

# Zkopírujeme package.json a package-lock.json (nebo yarn.lock)
# Tyto soubory definují závislosti Node.js
COPY package.json ./

# Nainstalujeme Node.js závislosti
RUN npm install

# Zkopírujeme zbytek kódu aplikace
COPY . .

# Příkaz, který se spustí při startu kontejneru.
# 'npm start' obvykle spustí vývojový server Reactu.
# Pro produkci byste místo 'npm start' měli 'npm run build' a pak servírovat statické soubory přes Nginx/Apache.
CMD ["npm", "start"]

# Otevření portu 3000 v kontejneru, což je výchozí port pro React development server.
EXPOSE 3000