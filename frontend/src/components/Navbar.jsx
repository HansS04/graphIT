import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GraphITLogo from '../assets/graphIT-logo-web.png'; 
import GraphITLogo2 from '../assets/graphIT-logo-web2.png'; 

function Navbar({ user, onLogout }) {
  const [activeLink, setActiveLink] = useState('dashboard');
  const [isScrolled, setIsScrolled] = useState(false);

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', id: 'dashboard' },
    { name: 'Simulace', href: '/simulation', id: 'simulace' },
    { name: 'Import Dat', href: '/data', id: 'importdat' },
    { name: 'Export', href: '/export', id: 'export' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav 
      className={`
        sticky top-0 z-10
        transition-all duration-300 ease-in-out
        ${isScrolled 
            ? 'bg-graphit-dark-blue/50 backdrop-blur-lg shadow-lg rounded-lg extra-margin-nav' 
            : 'bg-graphit-dark-blue shadow-xl'
        }
      `}
    > 
      <div className="flex justify-between items-center ">
        <Link to="/" className="flex w-64">
          <img
            src={isScrolled ? GraphITLogo2 : GraphITLogo} 
            alt="GraphIT Logo" 
            className={`
              ${isScrolled 
                ? '  rounded-s-lg p-0 graphit-logo-mini' 
                : ' w-auto p-4 graphit-logo mx-auto' 
              }
            `} 
          />
        </Link>

        <div className="flex space-x-8 p-6 items-center">
          {user ? (
            <>
              {navLinks.map((link) => (
                <Link
                  key={link.id}
                  to={link.href}
                  onClick={() => setActiveLink(link.id)}
                  className={`
                    text-graphit-white             
                    text-lg
                    font-semibold
                    hover:text-graphit-light-blue
                    transition duration-300 ease-in-out
                    ${activeLink === link.id
                      ? 'border-b-2 border-graphit-turquoise pb-1 text-graphit-turquoise' 
                      : ''
                    }
                  `}
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex items-center space-x-4 ml-8">
                 <span className="text-graphit-white">Přihlášen jako: <strong className="text-graphit-turquoise">{user.email}</strong></span>
                 <button
                    onClick={onLogout}
                    className="bg-graphit-orange hover:bg-graphit-gold text-graphit-white font-bold py-2 px-4 rounded transition-colors duration-300 ease-in-out"
                  >
                    Odhlásit se
                  </button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <Link 
                to="/login"
                className="bg-graphit-turquoise hover:bg-graphit-gold text-graphit-white font-bold py-2 px-4 rounded transition-colors duration-300 ease-in-out"
              >
                Přihlásit se
              </Link>
              <Link 
                to="/about"
                className="bg-graphit-orange hover:bg-graphit-gold text-graphit-white font-bold py-2 px-4 rounded transition-colors duration-300 ease-in-out"
              >
                O nás
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;