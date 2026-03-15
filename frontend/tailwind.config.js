/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
        colors: {
            'text-graphit-white': '#ffffff',
            'graphit-dark-blue': '#1f2a40',
            'graphit-light-blue': '#2a687a',
            'graphit-orange': '#f47560',
            'graphit-yellow': '#f1e15b',
            'graphit-gold': '#d49b39',
            'graphit-turquoise': '#63aa82',
            'graphit-gray': {
                DEFAULT: '#454F5D',
                light: '#9FA6B2',
                dark: '#333B46',
    },
  }, 
    },
  },
  plugins: [],
}