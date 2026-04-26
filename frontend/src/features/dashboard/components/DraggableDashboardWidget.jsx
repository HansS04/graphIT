import React from 'react';
import { useDrag } from 'react-dnd';
import GlassyCard from './GlassyCard';

// Komponenta představující uchopitelný a přesouvatelný prvek na nástěnce.
function DraggableDashboardWidget({ id, type, content }) {
  
  // Inicializace Drag & Drop logiky. Definuje typ přenášeného prvku a data (id, type), 
  // která budou předána do cílové oblasti při puštění prvku.
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'dashboardWidget',
    item: { id, type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      // Navázání reference knihovny react-dnd na fyzický DOM element.
      ref={drag}
      // Dynamické formátování: pokud je prvek tažen, aplikuje se poloprůhlednost a barevný okraj pro vizuální indikaci.
      className={`
        relative
        ${isDragging ? 'opacity-50 border-2 border-graphit-turquoise' : ''} 
        cursor-move
      `}
    >
      {/* Využití existujícího kontejneru pro zachování konzistentního designu (glassmorphism). */}
      <GlassyCard>
        <h3 className="text-xl font-bold mb-2 text-graphit-light-blue">{type}</h3>
        <p className="text-text-graphit-white">{content}</p>
        
        {/* Podmíněné vykreslení specifického obsahu na základě typu widgetu. */}
        {type === 'Karta Metrik' && (
          <div className="mt-2 text-sm text-graphit-yellow">Placeholder pro metriku.</div> 
        )}
        {type === 'Čárový Graf' && (
          <div className="mt-2 text-sm text-graphit-orange">Placeholder pro graf.</div>
        )}
      </GlassyCard>
    </div>
  );
}

export default DraggableDashboardWidget;