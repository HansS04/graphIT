import React, { useState } from 'react';
import { login } from '../api';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const token = await login(email, password);
      localStorage.setItem('access_token', token);
      onLoginSuccess();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-start justify-center  bg-text-graphit-white p-12">
      <form onSubmit={handleSubmit} className="bg-graphit-light-blue p-8 rounded-lg shadow-xl w-full max-w-sm">
        <h2 className="text-3xl font-bold mb-6 text-center text-graphit-white">Přihlášení</h2>
        {error && <div className="bg-red-600 text-white px-4 py-3 rounded relative mb-4">{error}</div>}
        <div className="mb-4">
          <label className="block text-graphit-white text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            className="shadow appearance-none border-2 border-graphit-light-blue rounded w-full py-2 px-3 text-graphit-dark-blue leading-tight focus:outline-none focus:shadow-outline"
            id="email"
            type="email"
            placeholder="vas.email@priklad.cz"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label className="block text-graphit-white text-sm font-bold mb-2" htmlFor="password">
            Heslo
          </label>
          <input
            className="shadow appearance-none border-2 border-graphit-light-blue rounded w-full py-2 px-3 text-graphit-dark-blue mb-3 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            type="password"
            placeholder="******************"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-graphit-turquoise hover:bg-graphit-gold text-graphit-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-300"
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