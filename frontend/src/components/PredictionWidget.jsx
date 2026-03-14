import React, { useEffect, useState, useRef } from 'react';
import { createChart, ColorType, LineSeries } from 'lightweight-charts';

const PredictionWidget = ({ id, data }) => {
  const chartContainerRef = useRef();
  const [loading, setLoading] = useState(true);
  
  const symbol = data?.symbol || 'BTCEUR';

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#2B2D31' },
        textColor: '#9CA3AF',
        fontFamily: "'Inter', sans-serif",
      },
      grid: {
        vertLines: { color: '#374151', style: 1 },
        horzLines: { color: '#374151', style: 1 },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      timeScale: { timeVisible: true, secondsVisible: false },
    });

    const historySeries = chart.addSeries(LineSeries, { 
        color: '#2962FF', lineWidth: 2, title: 'Historie' 
    });
    
    const bullSeries = chart.addSeries(LineSeries, { 
        color: '#10B981', lineWidth: 2, lineStyle: 2, title: 'Bullish' 
    });
    
    const avgSeries = chart.addSeries(LineSeries, { 
        color: '#FCD34D', lineWidth: 2, lineStyle: 2, title: 'Průměr' 
    });
    
    const bearSeries = chart.addSeries(LineSeries, { 
        color: '#EF4444', lineWidth: 2, lineStyle: 2, title: 'Bearish' 
    });

    const loadData = async () => {
      try {
        const histRes = await fetch(`http://localhost:8000/api/market-data/${symbol}`);
        const histData = await histRes.json();
        
        const recentHistory = histData.slice(-200).map(d => ({ time: d.time, value: d.close }));
        historySeries.setData(recentHistory);

        const predRes = await fetch(`http://localhost:8000/api/predict/${symbol}?days=3`);
        const predData = await predRes.json();

        bullSeries.setData(predData.bull);
        avgSeries.setData(predData.avg);
        bearSeries.setData(predData.bear);

        chart.timeScale().fitContent();
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };

    loadData();

    const resizeObserver = new ResizeObserver(() => {
      window.requestAnimationFrame(() => {
        if (!chartContainerRef.current) return;
        
        const width = chartContainerRef.current.clientWidth;
        const height = chartContainerRef.current.clientHeight;

        if (width > 0 && height > 0) {
          chart.applyOptions({ width, height });
        }
      });
    });
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [symbol]);

  return (
    <div className="w-full h-full flex flex-col relative bg-transparent overflow-hidden">
      {loading && <div className="absolute inset-0 flex items-center justify-center bg-[#2B2D31]/80 z-10 text-xs text-gray-500">Počítám predikci pro {symbol}...</div>}
      
      <div className="absolute top-2 left-2 z-20 bg-[#2B2D31]/80 px-2 py-1 rounded border border-gray-700 pointer-events-none">
        <span className="text-white font-bold text-xs">PREDIKCE (72h) - {symbol}</span>
      </div>

      <div ref={chartContainerRef} className="flex-grow w-full h-full relative" />
      
      <div className="flex justify-center gap-4 pb-1 pt-1 text-[10px] bg-transparent">
        <span className="text-emerald-400">● Bull</span>
        <span className="text-yellow-400">● Avg</span>
        <span className="text-red-400">● Bear</span>
      </div>
    </div>
  );
};

export default PredictionWidget;