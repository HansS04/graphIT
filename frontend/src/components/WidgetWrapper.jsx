import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useDashboardState } from '../context/DashboardContext';
import SmartChartWidget from './SmartChartWidget';

const KPIContent = () => (
  <div className="flex flex-col items-center justify-center h-full text-text-graphit-white">
    <span className="text-graphit-gray-light text-sm">Celkový Zisk</span>
    <span className="text-4xl font-bold text-graphit-success mt-2">+25%</span>
  </div>
);

const TableContent = () => (
  <div className="w-full h-full overflow-hidden text-center pt-10 text-graphit-gray-light">Tabulka...</div>
);

const ControlContent = () => {
  const { state, updateSymbol } = useDashboardState();
  const markets = ['BTCEUR', 'ETHEUR', 'SOLUSD'];

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <h4 className="text-text-graphit-white text-sm font-bold uppercase tracking-wider">Vyberte trh</h4>
      <div className="flex flex-wrap justify-center gap-2">
        {markets.map((sym) => (
          <button
            key={sym}
            onClick={() => updateSymbol(sym)}
            className={`px-3 py-1 rounded text-sm font-bold transition-all ${
              state.symbol === sym 
                ? 'bg-graphit-turquoise text-white shadow-lg' 
                : 'bg-graphit-dark-blue text-gray-400 hover:bg-graphit-gray-dark hover:text-white'
            }`}
          >
            {sym}
          </button>
        ))}
      </div>
      <p className="text-[10px] text-gray-500">Změna se projeví ve všech grafech.</p>
    </div>
  );
};

const WidgetWrapper = ({ id, index, type, cols, rows, onRemove, onResize, onMove, isPlaceholder }) => {
  const ref = useRef(null);

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

  const colSpanClass = { 1: 'col-span-1', 2: 'col-span-2', 3: 'col-span-3' }[cols] || 'col-span-1';
  const heightClass = { 1: 'h-[250px]', 2: 'h-[524px]' }[rows] || 'h-[250px]';
  const isShadow = isPlaceholder || isDragging;

  return (
    <div 
      ref={ref}
      data-handler-id={handlerId}
      className={`
        relative rounded-lg p-4 flex flex-col group
        ${colSpanClass} ${heightClass}
        ${isShadow 
          ? 'border-2 border-dashed border-graphit-turquoise/40 bg-graphit-turquoise/5' 
          : 'bg-graphit-gray border border-graphit-gray-dark shadow-lg hover:border-graphit-light-blue'
        }
        ${!isDragging ? 'transition-all duration-200' : ''}
        ${!isPlaceholder ? 'cursor-grab active:cursor-grabbing' : ''}
      `}
    >
      {isShadow ? (
        <div className="w-full h-full flex items-center justify-center">
           <span className="text-graphit-turquoise uppercase text-sm font-bold tracking-wider opacity-60">
             {isDragging ? '' : `Sem dopadne ${type}`}
           </span>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4 border-b border-graphit-gray-dark pb-2 select-none">
            <h3 className="font-bold text-text-graphit-white uppercase text-xs tracking-wider flex items-center gap-2">
              {type} <span className="text-[10px] text-gray-500 border border-gray-600 rounded px-1">{cols}x{rows}</span>
            </h3>
            
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

          <div className="flex-grow overflow-hidden relative">
            {(() => {
                switch (type) {
                case 'KPI': return <KPIContent />;
                case 'CHART': return <SmartChartWidget />;
                case 'CONTROLS': return <ControlContent />;
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