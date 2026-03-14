import React from 'react';

const SidebarItem = ({ type, label, icon }) => {
  const handleDragStart = (e) => {
    e.dataTransfer.setData("widgetType", type);
  };

  return (
    <div
      draggable={true}
      onDragStart={handleDragStart}
      className="p-3 mb-2 bg-graphit-dark-blue border border-graphit-gray-dark rounded hover:border-blue-500 cursor-grab active:cursor-grabbing text-graphit-gray-light flex items-center gap-3 transition-colors"
    >
      <div className="flex items-center justify-center text-blue-400">
        {icon}
      </div>
      <span className="font-semibold text-sm">{label}</span>
    </div>
  );
};

export default SidebarItem;