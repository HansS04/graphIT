/** @type {import('tailwindcss').Config} */
module.exports = {
  // Definice cest k souborům pro analýzu a optimalizaci výsledného CSS (PurgeCSS).
  content: [
    "./src/**/*.{js,jsx}",
    "./public/index.html"
  ],
  theme: {
    // Rozšíření výchozího designového systému o specifické barvy projektu.
    extend: {
        colors: {
            // Unifikovaná bílá pro textové řetězce
            'text-graphit-white': '#ffffff',
            // Primární barvy pro strukturální prvky (panely, navigace)
            'graphit-dark-blue': '#1f2a40',
            'graphit-light-blue': '#2a687a',
            // Akcentní barvy pro grafy, predikce a interaktivní prvky
            'graphit-orange': '#f47560',
            'graphit-yellow': '#f1e15b',
            'graphit-gold': '#d49b39',
            'graphit-turquoise': '#63aa82',
            // Víceúrovňová definice šedi pro jemné stínování a ohraničení
            'graphit-gray': {
                DEFAULT: '#454F5D',
                light: '#9FA6B2',
                dark: '#333B46',
            },
        }, 
    },
  },
  // Prostor pro přidání dodatečných Tailwind pluginů (např. formy, typografie).
  plugins: [],
}