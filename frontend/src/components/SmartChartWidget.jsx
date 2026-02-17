import React, { useEffect, useState } from 'react';
import CandlestickChart from './CandlestickChart';

const SmartChartWidget = ({ symbol }) => {
  const activeSymbol = symbol || 'BTCEUR';
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:8000/api/market-data/${activeSymbol}`);
        if (!response.ok) throw new Error('Data nenalezena');
        
        const data = await response.json();
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
      
      <div className="flex-grow relative overflow-hidden">
         <CandlestickChart data={chartData} />
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