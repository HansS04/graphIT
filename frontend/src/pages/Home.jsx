import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex-grow p-12 text-center bg-graphit-dark-blue text-graphit-white">
      <h1 className="text-5xl font-extrabold text-graphit-yellow mb-6 animate-fadeInDown">
        Vítejte v GraphIT App!
      </h1>
      <p className="text-xl text-graphit-white mb-8 max-w-2xl mx-auto animate-fadeInUp">
        Váš nástroj pro efektivní simulaci, analýzu a správu dat. Přihlašte se, abyste mohli začít pracovat.
      </p>
      <div className="flex justify-center space-x-4 animate-fadeInUp">
        <Link to="/login" className="bg-graphit-turquoise hover:bg-graphit-gold text-graphit-white font-bold py-3 px-6 rounded-lg shadow-md transition-colors duration-300">
          Přihlásit se
        </Link>
        <Link to="/about" className="bg-graphit-orange hover:bg-graphit-gold text-graphit-white font-bold py-3 px-6 rounded-lg shadow-md transition-colors duration-300">
          O nás
        </Link>
      </div>
    </div>
  );
};

export default Home;