// GraphIT_app/frontend/src/components/DraggableDashboardWidget.js

import React from 'react';
import { useDrag } from 'react-dnd';
import GlassyCard from './GlassyCard';

function DraggableDashboardWidget({ id, type, content }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'dashboardWidget',
    item: { id, type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`
        relative
        ${isDragging ? 'opacity-50 border-2 border-graphit-turquoise' : ''} {/* Použijte graphit-turquoise pro indikaci */}
        cursor-move
      `}
    >
      <GlassyCard>
        <h3 className="text-xl font-bold mb-2 text-graphit-light-blue">{type}</h3> {/* Text nadpisu widgetu */}
        <p className="text-text-graphit-white">{content}</p> {/* Obsah widgetu */}
        {/* Zde byste vykresloval skutečný obsah widgetu podle jeho typu */}
        {type === 'Karta Metrik' && (
          <div className="mt-2 text-sm text-graphit-yellow">Placeholder pro metriku.</div> 
        )}
        {type === 'Čárový Graf' && (
          <div className="mt-2 text-sm text-graphit-orange">Placeholder pro graf.</div>
        )}
        {/* ... další typy widgetů ... */}
      </GlassyCard>
    </div>
  );
}

export default DraggableDashboardWidget;