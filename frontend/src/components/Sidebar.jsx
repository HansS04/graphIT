import React, { useState } from 'react';
import SidebarItem from './SidebarItem';

const CATEGORIES = [
  {
    id: 'analytika',
    label: 'Analytika',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    items: [
      { type: 'CONTROLS', label: 'Přepínač Trhů', icon: '🎛️' },
      { type: 'KPI', label: 'Karta Metrik', icon: '★' },
      { type: 'TABLE', label: 'Tabulka Dat', icon: '▤' }
    ]
  },
  {
    id: 'grafy',
    label: 'Grafy',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>
    ),
    items: [
      { type: 'CHART', label: 'Svíčkový Graf', icon: '📈' },
    ]
  },
  {
    id: 'simulace',
    label: 'Simulace',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    items: [
      { type: 'SIMULATION', label: 'Simulační Modul', icon: '⚙️' }
    ]
  }
];

function Sidebar() {
  const [activeCategory, setActiveCategory] = useState('analytika');

  const toggleCategory = (id) => {
    if (activeCategory === id) {
      setActiveCategory(null);
    } else {
      setActiveCategory(id);
    }
  };

  const currentItems = CATEGORIES.find(c => c.id === activeCategory)?.items || [];

  return (
    <div className="flex h-full shadow-xl z-30 relative">
      <div className="w-20 h-full bg-graphit-dark-blue flex flex-col items-center py-6 gap-6 border-r border-graphit-gray-dark z-40">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => toggleCategory(cat.id)}
            className={`
              p-3 rounded-xl transition-all duration-200 group relative
              ${activeCategory === cat.id 
                ? 'bg-graphit-turquoise text-white shadow-lg shadow-graphit-turquoise/20' 
                : 'text-gray-400 hover:bg-graphit-gray hover:text-white'
              }
            `}
            title={cat.label}
          >
            {cat.icon}
            <span className="absolute left-14 bg-graphit-dark-blue text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-graphit-gray-dark z-50">
              {cat.label}
            </span>
          </button>
        ))}
      </div>

      <div 
        className={`
          h-full bg-graphit-gray border-r border-graphit-gray-dark overflow-hidden transition-all duration-300 ease-in-out flex flex-col
          ${activeCategory ? 'w-64 opacity-100' : 'w-0 opacity-0'}
        `}
      >
        <div className="p-6 min-w-[16rem]">
          <h2 className="text-text-graphit-white font-bold mb-6 uppercase text-sm tracking-widest border-b border-graphit-gray-dark pb-2">
            {CATEGORIES.find(c => c.id === activeCategory)?.label || 'Menu'}
          </h2>
          
          <div className="flex flex-col gap-3">
            {currentItems.map((item) => (
              <SidebarItem 
                key={item.type} 
                type={item.type} 
                label={item.label} 
                icon={item.icon} 
              />
            ))}
          </div>
          
          {currentItems.length === 0 && activeCategory && (
            <p className="text-sm text-graphit-gray-light italic">Žádné nástroje v této kategorii.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;