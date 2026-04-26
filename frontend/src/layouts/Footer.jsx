import React from 'react';

// Jednoduchá komponenta pro zobrazení patičky webové aplikace s aktuálním rokem a autorskými informacemi.
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full p-6 bg-text-graphit-white text-gray-800 text-center text-sm border-t border-gray-200">
      &copy; {currentYear} GraphIT by Jan Slivka
    </footer>
  );
};

export default Footer;