import React, { useEffect, useState } from 'react';
import CandlestickChart from './CandlestickChart';

const SmartChartWidget = ({ symbol }) => {
  const activeSymbol = symbol || 'BTCEUR';
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Počítadlo pro vynucení překreslení grafu
  const [forceFit, setForceFit] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log(`🚀 Stahuji data pro: ${activeSymbol}`);
        const response = await fetch(`http://localhost:8000/api/market-data/${activeSymbol}`);
        
        if (!response.ok) throw new Error('Data nenalezena');
        
        const data = await response.json();
        
        // DIAGNOSTIKA: Toto uvidíte v konzoli prohlížeče (F12 -> Console)
        console.log(`✅ Přijato ${data.length} záznamů pro ${activeSymbol}`);
        if (data.length > 0) {
            console.log("První datum:", new Date(data[0].time * 1000).toLocaleString());
            console.log("Poslední datum:", new Date(data[data.length - 1].time * 1000).toLocaleString());
        }

        setChartData(data);
      } catch (err) {
        console.error("Chyba:", err);
        setError(`Chyba dat: ${activeSymbol}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeSymbol]);

  if (loading) return <div className="text-gray-500 text-xs flex justify-center items-center h-full animate-pulse">Načítám {activeSymbol}...</div>;
  if (error) return <div className="text-red-400 text-xs flex justify-center items-center h-full">{error}</div>;

  return (
    <div className="w-full h-full flex flex-col bg-[#2B2D31] relative"> 
      <div className="absolute top-2 left-2 z-10 flex gap-2 pointer-events-none">
          <div className="bg-[#2B2D31]/80 backdrop-blur px-2 py-1 rounded border border-gray-700 shadow-sm">
             <span className="text-white font-bold text-sm">{activeSymbol}</span>
             <span className="text-graphit-turquoise text-xs ml-2">{chartData.length}h</span>
          </div>
      </div>

      {/* TLAČÍTKO PRO VYNUCENÍ ZOOMU */}
      <button 
        onClick={() => setForceFit(prev => prev + 1)}
        className="absolute top-2 right-2 z-20 bg-graphit-gray border border-graphit-gray-dark hover:bg-graphit-light-blue text-white text-xs px-2 py-1 rounded transition-colors cursor-pointer"
        title="Zobrazit všechna data"
      >
        🔍 Fit
      </button>
      
      <div className="flex-grow relative overflow-hidden">
         {/* Předáváme forceFit, aby graf věděl, kdy se má resetovat */}
         <CandlestickChart data={chartData} forceFitTrigger={forceFit} />
      </div>
      
      <div className="absolute bottom-1 right-2 z-10 pointer-events-none">
         <span className="text-[9px] text-gray-600 font-mono">
            {chartData.length > 0 
              ? `${new Date(chartData[0].time * 1000).toLocaleDateString()} - ${new Date(chartData[chartData.length - 1].time * 1000).toLocaleDateString()}`
              : 'Žádná data'
            }
         </span>
      </div>
    </div>
  );
};

export default SmartChartWidget;