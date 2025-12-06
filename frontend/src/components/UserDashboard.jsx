import React from 'react';
import { useDrop } from 'react-dnd';
import WidgetWrapper from './WidgetWrapper';
import { useDashboardState } from '../context/DashboardContext';

const UserDashboard = ({ user }) => {
  const { 
    widgets, addWidget, removeWidget, updateWidgetSize, moveWidget, isLocked 
  } = useDashboardState();

  const [{ isOver, draggedItemType }, drop] = useDrop(() => ({
    accept: 'WIDGET', // Přijímáme nové widgety z menu
    drop: (item) => addWidget(item.type),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      draggedItemType: monitor.isOver() ? monitor.getItem()?.type : null,
    }),
  }));

  return (
    <div 
      ref={drop} 
      className="w-full h-full p-8 overflow-y-auto blender-grid-bg transition-colors duration-300"
    >
      <div className="max-w-[1600px] mx-auto pb-40">
        
        {/* HLAVIČKA */}
        <div className="bg-graphit-gray border border-graphit-gray-dark p-6 rounded-lg shadow-lg mb-8 flex justify-between items-center relative z-20">
            <div>
                <h1 className="text-2xl font-bold text-text-graphit-white">Můj Dashboard</h1>
                <p className="text-graphit-gray-light">Vítejte, {user?.email}</p>
            </div>
            {isLocked && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                    🔒 Read-Only
                </div>
            )}
        </div>

        {/* MŘÍŽKA WIDGETŮ */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-min pb-8">
            
            {widgets.map((widget, index) => (
              <WidgetWrapper 
                key={widget.id} 
                index={index} 
                id={widget.id} 
                type={widget.type} 
                cols={widget.cols} 
                rows={widget.rows}
                data={widget.data} // Data widgetu (např. symbol pro graf)
                onRemove={removeWidget} 
                onResize={updateWidgetSize} 
                onMove={moveWidget}
                isPlaceholder={false}
                isLocked={isLocked}
              />
            ))}
            
            {/* Stín pro NOVÉ widgety z menu */}
            {isOver && draggedItemType && draggedItemType !== 'DASHBOARD_ITEM' && (
              <WidgetWrapper 
                id="placeholder-new"
                type={draggedItemType}
                cols={draggedItemType === 'CHART' ? 2 : 1} 
                rows={draggedItemType === 'CHART' ? 2 : 1}
                isPlaceholder={true}
                onRemove={()=>{}} onResize={()=>{}} onMove={()=>{}}
              />
            )}
            
            {widgets.length === 0 && !isOver && (
               <div className="col-span-full border-2 border-dashed border-graphit-gray-dark rounded-xl h-64 flex flex-col items-center justify-center text-graphit-gray-light bg-graphit-dark-blue/20">
                 <span className="text-4xl mb-2">👋</span>
                 <p>Začněte přetažením widgetů z levého menu.</p>
               </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;