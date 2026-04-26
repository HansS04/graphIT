import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// Komponenta pro vytvoření nového uživatelského účtu v systému.
const Register = () => {
  // Inicializace stavů pro formulářová pole a stavy procesu (chyba, úspěch).
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Hook pro programové přesměrování uživatele mezi routami.
  const navigate = useNavigate();

  // Hlavní asynchronní funkce pro zpracování registračního formuláře.
  const handleRegister = async (e) => {
    e.preventDefault(); // Prevence výchozího odeslání formuláře.
    setError('');

    // Základní klientská validace shody hesel.
    if (password !== confirmPassword) {
      setError('Hesla se neshodují!');
      return;
    }

    try {
      // Odeslání registračních dat na backendové API.
      const response = await fetch('http://localhost:8000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: password,
          role: 'user' // Implicitní přiřazení základní uživatelské role.
        }),
      });

      // Kontrola úspěšnosti HTTP odpovědi a zpracování případných serverových chyb.
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Registrace selhala');
      }

      // Nastavení stavu úspěchu a inicializace odloženého přesměrování.
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      // Zachycení výjimky a zobrazení chybového hlášení uživateli.
      setError(err.message);
    }
  };

  return (
    <div className="flex justify-center items-center h-full w-full">
      {/* Hlavní kontejner registračního formuláře. */}
      <div className="bg-graphit-gray border border-graphit-gray-dark p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Registrace</h2>
        
        {/* Podmíněné zobrazení chybového bloku. */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        {/* Podmíněné zobrazení bloku s potvrzením úspěšné registrace. */}
        {success && (
          <div className="bg-green-500/20 border border-green-500 text-green-300 p-3 rounded mb-4 text-sm text-center">
            Registrace proběhla úspěšně! Přesměrovávám na přihlášení...
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Vstupní pole pro e-mailovou adresu. */}
          <div>
            <label className="block text-graphit-gray-light text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-graphit-dark-blue border border-graphit-gray-dark rounded px-3 py-2 text-white focus:outline-none focus:border-graphit-light-blue transition-colors"
              placeholder="Zadejte svůj email"
            />
          </div>

          {/* Vstupní pole pro heslo. */}
          <div>
            <label className="block text-graphit-gray-light text-sm font-semibold mb-2">Heslo</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-graphit-dark-blue border border-graphit-gray-dark rounded px-3 py-2 text-white focus:outline-none focus:border-graphit-light-blue transition-colors"
              placeholder="Zadejte heslo"
            />
          </div>

          {/* Pole pro opětovné zadání hesla za účelem validace. */}
          <div>
            <label className="block text-graphit-gray-light text-sm font-semibold mb-2">Potvrzení hesla</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full bg-graphit-dark-blue border border-graphit-gray-dark rounded px-3 py-2 text-white focus:outline-none focus:border-graphit-light-blue transition-colors"
              placeholder="Zadejte heslo znovu"
            />
          </div>

          <button
            type="submit"
            disabled={success}
            className="w-full bg-graphit-turquoise hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors mt-6 disabled:opacity-50"
          >
            Vytvořit účet
          </button>
        </form>

        {/* Navigační odkaz pro uživatele, kteří již disponují účtem. */}
        <div className="mt-6 text-center text-sm text-graphit-gray-light">
          Už máte účet?{' '}
          <Link to="/login" className="text-graphit-light-blue hover:text-white transition-colors">
            Přihlaste se zde
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;