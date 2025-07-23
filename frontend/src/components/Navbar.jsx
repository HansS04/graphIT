// GraphIT_app/frontend/src/components/Navbar.js

import React, { useState } from 'react';
import GraphITLogo from '../assets/graphIT_logo.png'; // <-- Zde zkontrolujte cestu k vašemu logu

function Navbar() {
  // Použijeme stav pro simulaci aktivního odkazu
  const [activeLink, setActiveLink] = useState('dashboard'); // Výchozí aktivní odkaz

  const navLinks = [
    { name: 'Dashboard', href: '#dashboard', id: 'dashboard' },
    { name: 'Simulace', href: '#simulation', id: 'simulace' },
    { name: 'Import Dat', href: '#data', id: 'importdat' },
    { name: 'Export', href: '#export', id: 'export' },
  ];

  return (
    // Pozadí navbaru: tmavě modrá z loga
    <nav className="bg-graphit-dark-blue p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo aplikace s obrázkem a textem */}
        <a href="/" className="flex items-center space-x-3"> {/* Zvětšena mezera mezi logem a textem */}
          <img src={GraphITLogo} alt="GraphIT Logo" className="h-20 w-auto" /> {/* Upravte výšku loga dle potřeby (např. h-10 pro 40px) */}
          <span className="text-graphit-white text-3xl font-bold tracking-wider">GraphIT</span> {/* Text "GraphIT" */}
        </a>

        {/* Navigační odkazy */}
        <div className="flex space-x-8"> {/* Zvětšena mezera mezi odkazy */}
          {navLinks.map((link) => (
            <a
              key={link.id} // Klíč pro React, důležité při mapování
              href={link.href}
              onClick={() => setActiveLink(link.id)} // Nastaví aktivní odkaz při kliknutí
              className={`
                text-graphit-white             // Základní barva textu
                text-lg                        // Větší velikost písma
                font-semibold                  // Polotučné písmo
                hover:text-graphit-light-blue  // Efekt při najetí myší
                transition duration-300 ease-in-out
                ${activeLink === link.id
                  ? 'border-b-2 border-graphit-green pb-1 text-graphit-green' 
                  : ''
                }
              `}
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Zde by mohly být další prvky jako ikony pro nastavení, uživatelský profil atd. */}
      </div>
    </nav>
  );
}

export default Navbar;