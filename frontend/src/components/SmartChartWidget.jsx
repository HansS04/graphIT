import React, { useEffect, useRef, useState } from 'react';
import { useDashboardState } from '../context/DashboardContext';

import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';
const SmartChartWidget = ({ id, data }) => {
  const chartContainerRef = useRef();
  const chartRef = useRef(); // Reference pro samotný graf, abychom ho mohli resizeovat
  const { updateWidgetData } = useDashboardState();
  
  const symbol = data?.symbol || 'BTCEUR';

  const handleSymbolChange = (e) => {
    updateWidgetData(id, { symbol: e.target.value });
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#2B2D31' },
        textColor: '#D1D5DB',
      },
      grid: {
        vertLines: { color: '#374151' },
        horzLines: { color: '#374151' },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10B981', 
      downColor: '#EF4444', 
      borderVisible: false,
      wickUpColor: '#10B981', 
      wickDownColor: '#EF4444',
    });

    fetch(`http://localhost:8000/api/market-data/${symbol}`)
      .then(res => res.json())
      .then(data => {
        candlestickSeries.setData(data);
        chart.timeScale().fitContent();
      });

    const resizeObserver = new ResizeObserver(() => {
      window.requestAnimationFrame(() => {
        if (chartContainerRef.current && chart) {
          chart.applyOptions({ 
            width: chartContainerRef.current.clientWidth, 
            height: chartContainerRef.current.clientHeight 
          });
        }
      });
    });

    resizeObserver.observe(chartContainerRef.current);
    chartRef.current = chart;

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [symbol]);
  return (
    <div className="w-full h-full flex flex-col relative bg-[#2B2D31] overflow-hidden">
      <div className="absolute top-2 left-2 z-20 bg-[#2B2D31]/80 px-2 py-1 rounded border border-gray-700 flex gap-2 items-center">
        <span className="text-white font-bold text-xs">GRAF</span>
        <select
          value={symbol}
          onChange={handleSymbolChange}
          className="bg-transparent text-xs text-emerald-400 font-bold outline-none cursor-pointer"
        >
          <option value="BTCEUR">BTCEUR</option>
          <option value="ETHEUR">ETHEUR</option>
          <option value="SOLUSD">SOLUSD</option>
        </select>
      </div>

      <div ref={chartContainerRef} className="flex-grow w-full h-full" />
    </div>
  );
};

export default SmartChartWidget;