import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries, HistogramSeries } from 'lightweight-charts';

const CandlestickChart = ({ data }) => {
  const chartContainerRef = useRef();
  const chartInstance = useRef(null);
  
  // Stav pro plovoucí štítek přímo na myši
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    time: '',
    open: 0,
    high: 0,
    low: 0,
    close: 0
  });

  useEffect(() => {
    if (!chartContainerRef.current || !data || data.length === 0) return;

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
      crosshair: {
        mode: 0, // Volný pohyb kříže
      },
      localization: {
        locale: 'cs-CZ', // Vynutíme českou lokalizaci pro nativní funkce
        timeFormatter: (time) => {
          const date = new Date(time * 1000);
          return date.toLocaleDateString('cs-CZ') + ' ' +
                 date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
        }
      },
      timeScale: {
        borderColor: '#4B5563',
        timeVisible: true,
        rightOffset: 12,
        barSpacing: 22,
        minBarSpacing: 10,
        
        // --- DOKONALÉ FORMÁTOVÁNÍ OSY X ---
        tickMarkFormatter: (time, tickMarkType, locale) => {
          const date = new Date(time * 1000);
          
          // Knihovna sama určuje hierarchii (0 = Rok, 1 = Měsíc, 2 = Den, 3 = Čas)
          switch (tickMarkType) {
            case 0: // Změna ROKU
              return date.getFullYear().toString();
              
            case 1: // Změna MĚSÍCE (Zobrazí se např. "říj" - max 1x za měsíc)
              return date.toLocaleDateString('cs-CZ', { month: 'short' });
              
            case 2: // Změna DNE (Zobrazí se např. "15. 10.")
              return date.getDate() + '. ' + (date.getMonth() + 1) + '.';
              
            case 3: // Běžná HODINA (Zobrazí se např. "14:00")
              return date.getHours().toString().padStart(2, '0') + ':00';
              
            default:
              return '';
          }
        }
      },
      rightPriceScale: { 
        borderColor: '#4B5563',
        scaleMargins: { top: 0.1, bottom: 0.2 },
      },
    });

    chartInstance.current = chart;

    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#26a69a',
      priceFormat: { type: 'volume' },
      priceScaleId: '',
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10B981', downColor: '#EF4444',
      borderDownColor: '#EF4444', borderUpColor: '#10B981',
      wickDownColor: '#EF4444', wickUpColor: '#10B981',
    });

    candleSeries.setData(data);

    const volumeData = data.map((item, index) => {
        const isUp = index === 0 ? true : item.close >= data[index - 1].close;
        return { time: item.time, value: item.value, color: isUp ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)' };
    });
    volumeSeries.setData(volumeData);

    // Načte graf posunutý na nejnovější data doprava
    chart.timeScale().scrollToPosition(0, false);

    // Sledování pohybu myši a aktualizace pozice plovoucího štítku
    chart.subscribeCrosshairMove((param) => {
      if (
        !param.time || 
        param.point.x < 0 || 
        param.point.y < 0 || 
        param.point.x > chartContainerRef.current.clientWidth || 
        param.point.y > chartContainerRef.current.clientHeight
      ) {
        // Skrýt štítek, pokud myš vyjede mimo graf
        setTooltip(prev => ({ ...prev, visible: false }));
      } else {
        const priceData = param.seriesData.get(candleSeries);
        if (priceData) {
          const date = new Date(param.time * 1000);
          const timeString = `${date.getDate()}.${date.getMonth() + 1}. ${date.getHours().toString().padStart(2, '0')}:00`;
          
          setTooltip({
            visible: true,
            x: param.point.x,
            y: param.point.y,
            time: timeString,
            open: priceData.open,
            high: priceData.high,
            low: priceData.low,
            close: priceData.close
          });
        }
      }
    });

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth, height: chartContainerRef.current.clientHeight });
      }
    };
    window.addEventListener('resize', handleResize);
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [data]);

  return (
    <div className="w-full h-full relative" ref={chartContainerRef}>
      {/* Plovoucí štítek (Tooltip), který následuje myš */}
      {tooltip.visible && (
        <div 
          className="absolute z-50 pointer-events-none bg-[#1E1F22]/95 border border-gray-600 rounded shadow-xl p-2 text-xs font-mono text-gray-200 backdrop-blur-sm"
          style={{ 
            left: tooltip.x + 15, // Posunuté mírně doprava od myši
            top: tooltip.y + 15,  // Posunuté mírně dolů od myši
            transform: 'translate(0, 0)'
          }}
        >
          <div className="text-white font-bold border-b border-gray-600 pb-1 mb-1 text-center">
            {tooltip.time}
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Hodnota (C):</span>
              <span className={tooltip.close >= tooltip.open ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
                {tooltip.close.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Otevření (O):</span>
              <span>{tooltip.open.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Maximum (H):</span>
              <span className="text-green-300">{tooltip.high.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Minimum (L):</span>
              <span className="text-red-300">{tooltip.low.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandlestickChart;