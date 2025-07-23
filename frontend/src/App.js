// GraphIT_app/frontend/src/App.js

import React, { useState, useEffect } from 'react';
import './index.css';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar'; // <-- Importujte novou Sidebar komponentu

function App() {
  const [backendMessage, setBackendMessage] = useState('');
  const [backendData, setBackendData] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Volání základního endpointu backendu
    fetch('http://localhost:8000/')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => setBackendMessage(data.message))
      .catch(err => {
        console.error("Chyba při volání základního endpointu backendu:", err);
        setError("Nepodařilo se připojit k backendu.");
      });

    // Volání endpointu /api/data
    fetch('http://localhost:8000/api/data')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => setBackendData(JSON.stringify(data)))
      .catch(err => {
        console.error("Chyba při volání /api/data:", err);
        setError("Nepodařilo se načíst data z backendu.");
      });

  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar /> {/* Hlavní navigační lišta nahoře */}

      {/* Hlavní obsah s bočním menu */}
      <div className="flex flex-1"> {/* flex-1 zajistí, že tato sekce vyplní zbývající výšku */}
        <Sidebar /> {/* Levý postranní panel s widgety */}

        {/* Hlavní pracovní plocha - zde bude dashboard atd. */}
        <main className="flex-grow p-6"> {/* flex-grow zajistí, že vyplní zbytek šířky */}
          <h1 className="text-4xl font-bold text-blue-600 mb-8">
            Vítejte v GraphIT App!
          </h1>
          {error && <p className="text-red-500 text-lg mb-4">{error}</p>}

          <div className="bg-white p-6 rounded-lg shadow-md mb-4 w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-2 text-gray-800">Zpráva z backendu:</h2>
            <p className="text-lg text-gray-700">{backendMessage || 'Načítám zprávu...'}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-2 text-gray-800">Data z backendu (/api/data):</h2>
            <p className="text-lg text-gray-700">{backendData || 'Načítám data...'}</p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;