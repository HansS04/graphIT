import React from 'react';
import { useDashboardState } from '../context/DashboardContext';

const GlobalSwitcherWidget = () => {
  const { state, updateSymbol } = useDashboardState();

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#2B2D31] p-4 relative overflow-hidden">
      
      <div className="absolute top-2 left-2 z-20 bg-[#2B2D31]/80 px-2 py-1 rounded border border-gray-700 pointer-events-none">
        <span className="text-white font-bold text-xs">HLAVNÍ PŘEPÍNAČ TRHU</span>
      </div>

      <div className="flex flex-col items-center mt-6">
        <span className="text-graphit-gray-light text-xs mb-2">Synchronizuje všechny grafy na ploše</span>
        
        <select 
          value={state.symbol} 
          onChange={(e) => updateSymbol(e.target.value)}
          className="bg-[#1E1F22] border border-blue-500/50 text-blue-400 font-bold text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 cursor-pointer outline-none hover:bg-[#1E1F22]/80 transition-colors"
        >
          <option value="BTCEUR">Bitcoin (BTC/EUR)</option>
          <option value="ETHEUR">Ethereum (ETH/EUR)</option>
          <option value="SOLUSD">Solana (SOL/USD)</option>
          <option value="ADAEUR">Cardano (ADA/EUR)</option>
        </select>
      </div>

    </div>
  );
};

export default GlobalSwitcherWidget;