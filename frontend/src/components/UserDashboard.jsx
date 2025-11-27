import React, { useState, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import WidgetWrapper from './WidgetWrapper';

const UserDashboard = ({ user }) => {
  const [widgets, setWidgets] = useState([]);

  // Drop zóna pro NOVÉ widgety z menu
  const [{ isOver, draggedItemType }, drop] = useDrop(() => ({
    accept: 'WIDGET', 
    drop: (item) => addWidget(item.type),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      draggedItemType: monitor.isOver() ? monitor.getItem()?.type : null,
    }),
  }));

  const addWidget = (type) => {
    setWidgets((prev) => [
      ...prev,
      { id: Date.now(), type, cols: 1, rows: 1 } 
    ]);
  };

  const removeWidget = (id) => {
    setWidgets((prev) => prev.filter((w) => w.id !== id));
  };

  const updateWidgetSize = (id, newCols, newRows) => {
    setWidgets((prev) => prev.map((w) => {
      if (w.id === id) {
        const safeCols = Math.max(1, Math.min(3, newCols));
        const safeRows = Math.max(1, Math.min(2, newRows));
        return { ...w, cols: safeCols, rows: safeRows };
      }
      return w;
    }));
  };

  // Přesouvání widgetů (Reorder)
  const moveWidget = useCallback((dragIndex, hoverIndex) => {
    setWidgets((prevWidgets) => {
      const newWidgets = [...prevWidgets];
      const [draggedWidget] = newWidgets.splice(dragIndex, 1);
      newWidgets.splice(hoverIndex, 0, draggedWidget);
      return newWidgets;
    });
  }, []);

  return (
    <div 
      ref={drop} 
      className="w-full h-full p-8 overflow-y-auto transition-colors duration-300" 
      // ZDE BYLA ZMĚNA: Odstraněno podmíněné 'bg-graphit-light-blue/5'
    >
      <div className="max-w-7xl mx-auto">
        
        {/* Hlavička */}
        <div className="bg-graphit-gray border border-graphit-gray-dark p-6 rounded-lg shadow-lg mb-8">
            <h1 className="text-2xl font-bold text-text-graphit-white">Můj Dashboard</h1>
            <p className="text-graphit-gray-light">Vítejte, {user?.email}</p>
        </div>

        {/* Mřížka widgetů */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-min pb-8">
            
            {widgets.map((widget, index) => (
              <WidgetWrapper 
                key={widget.id} 
                index={index}
                id={widget.id} 
                type={widget.type} 
                cols={widget.cols}
                rows={widget.rows}
                onRemove={removeWidget} 
                onResize={updateWidgetSize}
                onMove={moveWidget}
                isPlaceholder={false}
              />
            ))}

            {/* Stín pro NOVÉ widgety z menu (jen když táhnu z menu) */}
            {isOver && draggedItemType && draggedItemType !== 'DASHBOARD_ITEM' && (
              <WidgetWrapper 
                id="placeholder-new"
                type={draggedItemType}
                cols={1} rows={1}
                isPlaceholder={true}
                onRemove={()=>{}} onResize={()=>{}} onMove={()=>{}}
              />
            )}

            {widgets.length === 0 && !isOver && (
               <div className="col-span-full border-2 border-dashed border-graphit-gray-dark rounded-xl h-64 flex flex-col items-center justify-center text-graphit-gray-light">
                 <span className="text-4xl mb-2">👋</span>
                 <p>Zatím tu nic není.</p>
               </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;