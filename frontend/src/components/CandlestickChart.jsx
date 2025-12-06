import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, CrosshairMode, CandlestickSeries, HistogramSeries } from 'lightweight-charts';

const CandlestickChart = ({ data, forceFitTrigger }) => {
  const chartContainerRef = useRef();
  const chartInstance = useRef(null); // Uložíme si instanci grafu

  // 1. Inicializace grafu (při mountu nebo změně barev)
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#2B2D31' },
        textColor: '#9CA3AF',
        fontFamily: "'Inter', sans-serif",
      },
      grid: {
        vertLines: { color: '#374151', style: 1, visible: true },
        horzLines: { color: '#374151', style: 1, visible: true },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      kineticScroll: { touch: true, mouse: true },
      timeScale: { borderColor: '#4B5563', timeVisible: true, secondsVisible: false, rightOffset: 5 },
      rightPriceScale: { borderColor: '#4B5563', scaleMargins: { top: 0.1, bottom: 0.2 } },
    });

    // Uložíme do refu pro pozdější použití
    chartInstance.current = chart;

    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#26a69a', priceFormat: { type: 'volume' }, priceScaleId: '', scaleMargins: { top: 0.8, bottom: 0 },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10B981', downColor: '#EF4444', borderDownColor: '#EF4444', borderUpColor: '#10B981', wickDownColor: '#EF4444', wickUpColor: '#10B981',
    });

    // Nastavení dat
    if (data && data.length > 0) {
        candleSeries.setData(data);
        
        const volumeData = data.map((item, index) => {
            const isUp = index === 0 ? true : item.close >= data[index - 1].close;
            return { time: item.time, value: item.value, color: isUp ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)' };
        });
        volumeSeries.setData(volumeData);
        
        // DŮLEŽITÉ: Roztáhnout na celou šířku
        chart.timeScale().fitContent();
    }

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ 
            width: chartContainerRef.current.clientWidth, 
            height: chartContainerRef.current.clientHeight 
        });
      }
    };
    window.addEventListener('resize', handleResize);
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      chart.remove();
      chartInstance.current = null;
    };
  }, [data]); // Re-init při změně dat

  // 2. Reakce na tlačítko "Fit"
  useEffect(() => {
    if (chartInstance.current && forceFitTrigger > 0) {
        chartInstance.current.timeScale().fitContent();
    }
  }, [forceFitTrigger]);

  return <div ref={chartContainerRef} className="w-full h-full relative" />;
};

export default CandlestickChart;