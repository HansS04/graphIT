import React from 'react';
import { FileCode, ExternalLink } from 'lucide-react';

// Bezstavová navigační komponenta poskytující rychlý přístup k interaktivní API dokumentaci.
const SwaggerWidget = () => {
  // Statická definice URL adresy, na které je dostupná dokumentace Swagger UI.
  const url = 'http://localhost:8000/docs';

  return (
    <button 
      // Událost pro bezpečné otevření cílové adresy v novém panelu prohlížeče.
      onClick={() => window.open(url, '_blank')}
      className="group w-full h-full p-4 flex flex-col items-center justify-center gap-3 bg-[#1e293b]/40 hover:bg-orange-900/20 border border-gray-700/50 rounded-xl transition-all duration-300 active:scale-95"
    >
      {/* Vizuální kontejner s vektorovou ikonou a definovanými CSS přechody pro vizuální odezvu. */}
      <div className="p-4 bg-orange-500/10 rounded-2xl group-hover:bg-orange-500/20 transition-colors shadow-inner">
        <FileCode className="w-8 h-8 text-orange-400 group-hover:scale-110 transition-transform" />
      </div>
      
      {/* Textová identifikace a popis účelu widgetu. */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 text-orange-400">
          <span className="font-bold text-sm tracking-wide uppercase">Swagger UI</span>
          <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
        </div>
        <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-medium">
          FastAPI Docs
        </p>
      </div>
    </button>
  );
};

export default SwaggerWidget;