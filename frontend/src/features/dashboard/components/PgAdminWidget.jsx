import React from 'react';
import { Database, ExternalLink } from 'lucide-react';

const PgAdminWidget = () => {
  const url = 'http://localhost:5050';

  return (
    <button 
      onClick={() => window.open(url, '_blank')}
      className="group w-full h-full p-4 flex flex-col items-center justify-center gap-3 bg-[#1e293b]/40 hover:bg-blue-900/20 border border-gray-700/50 rounded-xl transition-all duration-300 active:scale-95"
    >
      <div className="p-4 bg-blue-500/10 rounded-2xl group-hover:bg-blue-500/20 transition-colors shadow-inner">
        <Database className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform" />
      </div>
      
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 text-blue-400">
          <span className="font-bold text-sm tracking-wide uppercase">pgAdmin 4</span>
          <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
        </div>
        <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-medium">
          PostgreSQL Control
        </p>
      </div>
    </button>
  );
};

export default PgAdminWidget;