import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';

// --- OBSAHY (beze změny) ---
const KPIContent = () => (
  <div className="flex flex-col items-center justify-center h-full text-text-graphit-white">
    <span className="text-graphit-gray-light text-sm">Celkový Zisk</span>
    <span className="text-4xl font-bold text-graphit-success mt-2">+25%</span>
  </div>
);
const ChartContent = () => (
  <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-graphit-gray-dark rounded bg-graphit-dark-blue/30 text-graphit-gray-light">
    Graf (Placeholder)
  </div>
);
const TableContent = () => (
  <div className="w-full h-full overflow-hidden text-center pt-10 text-graphit-gray-light">Tabulka...</div>
);

// --- HLAVNÍ KOMPONENTA ---

const WidgetWrapper = ({ id, index, type, cols, rows, onRemove, onResize, onMove, isPlaceholder }) => {
  const ref = useRef(null);

  // 1. DROP LOGIKA
  const [{ handlerId }, drop] = useDrop({
    accept: 'DASHBOARD_ITEM',
    collect(monitor) {
      return { handlerId: monitor.getHandlerId() };
    },
    hover(item, monitor) {
      if (!ref.current) return;
      
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      onMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  // 2. DRAG LOGIKA
  const [{ isDragging }, drag] = useDrag({
    type: 'DASHBOARD_ITEM',
    item: () => ({ id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  if (!isPlaceholder) {
    drag(drop(ref));
  }

  // Výpočet tříd
  const colSpanClass = { 1: 'col-span-1', 2: 'col-span-2', 3: 'col-span-3' }[cols] || 'col-span-1';
  const heightClass = { 1: 'h-[250px]', 2: 'h-[524px]' }[rows] || 'h-[250px]';

  // Zjistíme, zda má tento prvek vypadat jako STÍN
  const isShadow = isPlaceholder || isDragging;

  return (
    <div 
      ref={ref}
      data-handler-id={handlerId}
      className={`
        relative rounded-lg p-4 flex flex-col group
        ${colSpanClass} ${heightClass}
        
        ${isShadow 
          // STÍN: Statický (bez animate-pulse), jen rámeček a velmi jemné pozadí
          ? 'border-2 border-dashed border-graphit-turquoise/40 bg-graphit-turquoise/5' 
          // KARTA: Plná barva, stín
          : 'bg-graphit-gray border border-graphit-gray-dark shadow-lg hover:border-graphit-light-blue'
        }

        ${/* PŘECHODY: Jen když se netahá */ ''}
        ${!isDragging ? 'transition-all duration-200' : ''}
        
        ${!isPlaceholder ? 'cursor-grab active:cursor-grabbing' : ''}
      `}
    >
      
      {/* OBSAH WIDGETU */}
      {isShadow ? (
        <div className="w-full h-full flex items-center justify-center">
           <span className="text-graphit-turquoise uppercase text-sm font-bold tracking-wider opacity-60">
             {isDragging ? '' : `Sem dopadne ${type}`} {/* Při přesunu text schováme pro čistší vzhled */}
           </span>
        </div>
      ) : (
        <>
          {/* HLAVIČKA */}
          <div className="flex justify-between items-center mb-4 border-b border-graphit-gray-dark pb-2 select-none">
            <h3 className="font-bold text-text-graphit-white uppercase text-xs tracking-wider flex items-center gap-2">
              {type} <span className="text-[10px] text-gray-500 border border-gray-600 rounded px-1">{cols}x{rows}</span>
            </h3>
            
            {/* OVLÁDÁNÍ */}
            <div 
              className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              onMouseDown={(e) => e.stopPropagation()} 
            >
              <button onClick={() => onResize(id, cols >= 3 ? 1 : cols + 1, rows)} className="p-1 hover:bg-graphit-gray-dark rounded text-graphit-turquoise" title="Změnit šířku">↔</button>
              <button onClick={() => onResize(id, cols, rows >= 2 ? 1 : rows + 1)} className="p-1 hover:bg-graphit-gray-dark rounded text-graphit-turquoise" title="Změnit výšku">↕</button>
              <div className="h-4 w-[1px] bg-graphit-gray-dark mx-1"></div>
              <button onClick={() => onRemove(id)} className="p-1 hover:bg-red-900/30 rounded text-red-400">✕</button>
            </div>
          </div>

          {/* VLASTNÍ OBSAH */}
          <div className="flex-grow overflow-hidden relative">
            {(() => {
                switch (type) {
                case 'KPI': return <KPIContent />;
                case 'CHART': return <ChartContent />;
                case 'TABLE': return <TableContent />;
                default: return <div>Neznámý</div>;
                }
            })()}
          </div>
        </>
      )}
    </div>
  );
};

export default WidgetWrapper;