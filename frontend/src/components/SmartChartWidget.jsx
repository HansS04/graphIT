import React, { useEffect, useState } from 'react';
import { useDashboardState } from '../context/DashboardContext';
import CandlestickChart from './CandlestickChart';

const SmartChartWidget = () => {
  const { state } = useDashboardState();
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:8000/api/market-data/${state.symbol}`);
        if (!response.ok) throw new Error('Data nenalezena');
        const data = await response.json();
        setChartData(data);
      } catch (err) {
        console.error("Chyba načítání dat:", err);
        setError(`Chyba načítání pro ${state.symbol}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [state.symbol]);

  if (loading) return <div className="text-gray-400 flex justify-center items-center h-full">Načítám {state.symbol}...</div>;
  if (error) return <div className="text-red-400 flex justify-center items-center h-full p-4 text-center text-sm">{error}</div>;

  return (
    <div className="w-full h-full flex flex-col">
      <div className="text-[10px] text-gray-500 mb-1 px-2 font-mono text-right border-b border-gray-700 pb-1">
        ZDROJ: CSV | TRH: {state.symbol}
      </div>
      <div className="flex-grow relative overflow-hidden">
         <CandlestickChart data={chartData} />
      </div>
    </div>
  );
};

export default SmartChartWidget;