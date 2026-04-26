import React from 'react';

// Jednotlivá položka v bočním menu reprezentující konkrétní typ nástroje/widgetu.
const SidebarItem = ({ type, label, icon }) => {
  
  // Obslužná funkce nativního Drag & Drop API. 
  // Při zahájení tažení uloží typ widgetu do přenosového úložiště dat.
  const handleDragStart = (e) => {
    e.dataTransfer.setData("widgetType", type);
  };

  return (
    <div
      // Aktivace možnosti přetahování prvku.
      draggable={true}
      onDragStart={handleDragStart}
      // Vizuální formátování definující vzhled "karty" nástroje v menu.
      className="p-3 mb-2 bg-graphit-dark-blue border border-graphit-gray-dark rounded hover:border-blue-500 cursor-grab active:cursor-grabbing text-graphit-gray-light flex items-center gap-3 transition-colors"
    >
      {/* Vykreslení ikony z knihovny lucide-react předané z nadřazené konfigurace. */}
      <div className="flex items-center justify-center text-blue-400">
        {icon}
      </div>
      {/* Textový název nástroje. */}
      <span className="font-semibold text-sm">{label}</span>
    </div>
  );
};

export default SidebarItem;