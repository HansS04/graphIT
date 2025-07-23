// GraphIT_app/frontend/src/components/Sidebar.js

import React from 'react';

function Sidebar() {
  // Zde můžete definovat typy widgetů, které budou dostupné
  const widgets = [
    { id: 'metric-card', name: 'Karta Metrik', description: 'Základní ukazatel.' },
    { id: 'line-chart', name: 'Čárový Graf', description: 'Vývoj v čase.' },
    { id: 'bar-chart', name: 'Sloupcový Graf', description: 'Porovnání kategorií.' },
    { id: 'pie-chart', name: 'Koláčový Graf', description: 'Podíly celku.' },
    { id: 'simulation-form', name: 'Simulační Formulář', description: 'What-if analýza.' },
    // Další widgety, např. text, tabulka, atd.
  ];

  return (
    // Sidebar: pevná šířka, tmavé pozadí ladící s navbarem
    <aside className="w-64 bg-graphit-dark-blue p-6 flex flex-col shadow-lg">
      <h2 className="text-graphit-white text-2xl font-semibold mb-6">
        Widgety pro Dashboard
      </h2>

      <div className="space-y-4">
        {widgets.map((widget) => (
          // Každý widget je zde reprezentován jako jednoduchá karta
          // Zde byste později integrovali logiku pro drag-and-drop
          <div
            key={widget.id}
            className="bg-graphit-light-blue text-graphit-white p-4 rounded-lg shadow-md cursor-grab
                       transform transition-transform duration-200 ease-in-out hover:scale-105"
            // Prozatím jen placeholder pro budoucí drag-and-drop funkcionalitu
            // draggable="true" // <- odkomentujte až budete implementovat drag-and-drop
            // onDragStart={(e) => { e.dataTransfer.setData('widgetType', widget.id); }} // <- a toto
          >
            <h3 className="text-xl font-bold mb-1">{widget.name}</h3>
            <p className="text-sm opacity-90">{widget.description}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default Sidebar;