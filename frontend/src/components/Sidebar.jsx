import React, { useState } from 'react';
import SidebarItem from './SidebarItem';
import { WIDGET_CATEGORIES } from './WidgetConfig';

function Sidebar() {
  const [activeCategory, setActiveCategory] = useState(WIDGET_CATEGORIES[0]?.id || null);
  
  const toggleCategory = (id) => { 
    activeCategory === id ? setActiveCategory(null) : setActiveCategory(id); 
  };
  
  const currentCategory = WIDGET_CATEGORIES.find(c => c.id === activeCategory);
  const currentItems = currentCategory?.items || [];

  return (
    <div className="flex h-full shadow-xl z-30 relative">
      
      <div className="w-20 h-full bg-graphit-dark-blue flex flex-col items-center py-6 gap-6 border-r border-graphit-gray-dark z-40">
        {WIDGET_CATEGORIES.map((cat) => (
          <button 
            key={cat.id} 
            onClick={() => toggleCategory(cat.id)} 
            className={`p-3 rounded-xl transition-all duration-200 group relative ${
              activeCategory === cat.id 
                ? 'bg-graphit-turquoise text-white shadow-lg shadow-graphit-turquoise/20' 
                : 'text-gray-400 hover:bg-graphit-gray hover:text-white'
            }`} 
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
        className={`h-full bg-graphit-gray border-r border-graphit-gray-dark overflow-hidden transition-all duration-300 ease-in-out flex flex-col ${
          activeCategory ? 'w-64 opacity-100' : 'w-0 opacity-0'
        }`}
      >
        <div className="p-6 min-w-[16rem]">
          <h2 className="text-text-graphit-white font-bold mb-6 uppercase text-sm tracking-widest border-b border-graphit-gray-dark pb-2">
            {currentCategory?.label || 'Menu'}
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