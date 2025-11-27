import React from 'react';
import { useDrag } from 'react-dnd';

const SidebarItem = ({ type, label, icon }) => {
  // Hook useDrag nám umožní element "chytit"
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'WIDGET', // Identifikátor typu přetahovaného prvku
    item: { type }, // Data, která se přenáší (tady jen typ widgetu, např. 'KPI')
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`
        flex items-center gap-3 p-3 rounded-lg cursor-grab 
        bg-graphit-gray-dark border border-graphit-gray-dark 
        hover:border-graphit-turquoise hover:bg-graphit-gray
        transition-all duration-200
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
    >
      <span className="text-graphit-turquoise text-xl">{icon}</span>
      <span className="text-text-graphit-white font-medium">{label}</span>
    </div>
  );
};

export default SidebarItem;