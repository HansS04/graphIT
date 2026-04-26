import React from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { useDashboardState } from '../../../context/DashboardContext';
import WidgetRenderer from './WidgetRenderer';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

// Obalí základní responzivní mřížku tak, aby automaticky reagovala na změny šířky okna prohlížeče.
const ResponsiveGridLayout = WidthProvider(Responsive);

// Hlavní vizuální komponenta pro zobrazení a správu interaktivní plochy s widgety.
const DashboardGrid = () => {
  const { widgets, onLayoutChange, isLocked, removeWidget, onDropWidget } = useDashboardState();

  return (
    <div className="w-full min-h-[600px] relative z-10">
      
      {/* Zástupný prvek (placeholder), který se zobrazí pouze v případě, že na ploše nejsou aktivní žádné widgety. */}
      {widgets.length === 0 && (
        <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-graphit-gray-dark rounded-xl flex flex-col items-center justify-center text-graphit-gray-light bg-graphit-dark-blue/20">
          <span className="text-4xl mb-2">👋</span>
          <p>Začněte přidáním widgetů z levého menu.</p>
        </div>
      )}

      {/* Konfigurace samotné mřížky. Definuje zarážky (breakpoints) pro různé velikosti obrazovek, 
          chování při přesouvání/změně velikosti a zachytává prvky vhozené z vnějšího menu (onDrop). */}
      <ResponsiveGridLayout
        className="layout min-h-[600px]"
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 4 }}
        rowHeight={100}
        onLayoutChange={onLayoutChange}
        isDraggable={!isLocked}
        isResizable={!isLocked}
        draggableHandle=".drag-handle"
        margin={[24, 24]}
        containerPadding = {[0, 0]}
        isDroppable={!isLocked} 
        droppingItem={{ i: "__dropping-elem__", w: 6, h: 4 }}
        onDrop={(layout, layoutItem, _event) => {
          const type = _event.dataTransfer.getData("widgetType") || 'CHART';
          onDropWidget(type, layoutItem.x, layoutItem.y);
        }}
      >
        {/* Iterace přes všechny aktivní widgety uložené v globálním stavu a jejich vykreslení na příslušné souřadnice. */}
        {widgets.map((w) => (
          <div key={w.i} data-grid={{ x: w.x, y: w.y, w: w.w, h: w.h, minW: 3, minH: 2 }}>
            
            <div className="w-full h-full bg-graphit-gray border border-graphit-gray-dark rounded-lg flex flex-col relative overflow-hidden shadow-lg group">
              
              {/* Horní lišta okna. Slouží k uchopení a přesunu widgetu a obsahuje ovládací prvek pro jeho smazání. */}
              <div className="drag-handle h-10 bg-graphit-dark-blue/50 border-b border-graphit-gray-dark flex justify-between items-center px-4 cursor-grab active:cursor-grabbing">
                <span className="text-gray-300 font-semibold text-sm">
                  {w.type === 'CHART' ? `Graf: ${w.data?.symbol || 'BTCEUR'}` : 'Widget'}
                </span>
                {!isLocked && (
                  <button 
                    onMouseDown={(e) => e.stopPropagation()} 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeWidget(w.i);
                    }}
                    className="text-gray-500 hover:text-red-500 transition-colors z-50 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Kontejner, který dynamicky načítá a zobrazuje konkrétní obsah widgetu (graf, ovládání) podle jeho typu. */}
              <div className="flex-1 w-full h-full p-2 overflow-hidden relative">
                 <WidgetRenderer widget={w} />
              </div>

            </div>
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
};

export default DashboardGrid;