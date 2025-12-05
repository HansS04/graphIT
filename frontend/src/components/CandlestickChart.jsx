import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts'; // <--- ZMĚNA: Import CandlestickSeries

const CandlestickChart = ({ data }) => {
  const chartContainerRef = useRef();

  const backgroundColor = '#454F5D';
  const lineColor = '#4E5058';
  const textColor = '#B0B3B8';
  const upColor = '#4CAF50';
  const downColor = '#F44336';

  useEffect(() => {
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor: textColor,
      },
      grid: {
        vertLines: { color: lineColor },
        horzLines: { color: lineColor },
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // <--- ZMĚNA: Nová syntaxe pro verzi 5.0+
    const newSeries = chart.addSeries(CandlestickSeries, { 
      upColor: upColor,
      downColor: downColor,
      borderVisible: false,
      wickUpColor: upColor,
      wickDownColor: downColor,
    });

    if (data && data.length > 0) {
        newSeries.setData(data);
        chart.timeScale().fitContent();
    }

    window.addEventListener('resize', handleResize);
    
    const resizeObserver = new ResizeObserver(() => {
        if(chartContainerRef.current) {
            chart.applyOptions({ 
                width: chartContainerRef.current.clientWidth, 
                height: chartContainerRef.current.clientHeight 
            });
        }
    });
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [data]);

  return (
    <div
      ref={chartContainerRef}
      className="w-full h-full relative"
    />
  );
};

export default CandlestickChart;