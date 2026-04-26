import React, { useState } from 'react';
import { login } from '../services/api';

// Komponenta zajišťující sběr přihlašovacích údajů a správu autentizačního procesu.
const Login = ({ onLoginSuccess }) => {
  // Inicializace stavových proměnných pro správu formulářových dat a chybových hlášení.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  // Obslužná funkce pro zpracování odeslaného formuláře.
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevence výchozího odeslání formuláře prohlížečem.
    setError(null);
    try {
      // Asynchronní požadavek na autentizační službu.
      const token = await login(email, password);
      // Uložení obdrženého JWT tokenu do lokálního úložiště pro účely autorizace budoucích požadavků.
      localStorage.setItem('access_token', token);
      // Notifikace nadřazené komponenty o úspěšném přihlášení.
      onLoginSuccess();
    } catch (err) {
      // Zachycení a zobrazení chybové zprávy v případě neúspěchu.
      setError(err.message);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      {/* Definice formuláře s navázáním na obslužnou funkci handleSubmit. */}
      <form 
        onSubmit={handleSubmit} 
        className="w-full max-w-md bg-graphit-gray border border-graphit-gray-dark p-8 rounded-lg shadow-2xl"
      >
        <h2 className="text-3xl font-bold mb-8 text-center text-text-graphit-white">
          Login
        </h2>
        
        {/* Podmíněné vykreslení chybového bloku při existenci neplatného pokusu o přihlášení. */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-3 rounded relative mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Vstupní pole pro e-mailovou adresu (řízený komponent). */}
        <div className="mb-6">
          <label className="block text-text-graphit-white text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            className="w-full bg-graphit-gray-dark text-text-graphit-white placeholder-graphit-gray-light border border-graphit-gray-dark rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-graphit-turquoise focus:border-transparent transition-all"
            id="email"
            type="email"
            placeholder="vas.email@priklad.cz"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Vstupní pole pro heslo se skrytým formátem textu. */}
        <div className="mb-8">
          <label className="block text-text-graphit-white text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            className="w-full bg-graphit-gray-dark text-text-graphit-white placeholder-graphit-gray-light border border-graphit-gray-dark rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-graphit-turquoise focus:border-transparent transition-all"
            id="password"
            type="password"
            placeholder="******************"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            className="w-full bg-graphit-turquoise hover:bg-graphit-gold text-text-graphit-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-300 shadow-lg"
            type="submit"
          >
            Přihlásit se
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;