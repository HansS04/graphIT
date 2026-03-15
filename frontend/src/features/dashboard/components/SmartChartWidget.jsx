import React, { useEffect, useRef, useState } from 'react';
import { useDashboardState } from '../../../context/DashboardContext';
import { Maximize } from 'lucide-react';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';


const SmartChartWidget = ({ id, data }) => {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const { updateWidgetData } = useDashboardState();

  const symbol = data?.symbol || 'BTCEUR';

  const [hoveredCandle, setHoveredCandle] = useState(null);

  const handleResetView = () => {
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  };

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
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#374151',
        fixLeftEdge: true,
        rightOffset: 0,
      },
      localization: {
        locale: 'cs-CZ',
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

    chart.subscribeCrosshairMove((param) => {

      if (param.time && param.point.x >= 0 && param.point.y >= 0) {
        const priceData = param.seriesData.get(candlestickSeries);

        if (priceData) {
          const changePercent = ((priceData.close - priceData.open) / priceData.open) * 100;
          const rangePercent = ((priceData.high - priceData.low) / priceData.open) * 100;

          setHoveredCandle({
            open: priceData.open,
            high: priceData.high,
            low: priceData.low,
            close: priceData.close,
            change: changePercent,
            range: rangePercent
          });
        }
      } else {
        setHoveredCandle(null);
      }
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

      <div className="absolute top-2 left-2 right-2 z-20 flex flex-wrap gap-2 items-start pointer-events-none">

        <div className="pointer-events-auto shrink-0 bg-[#2B2D31]/80 px-2 py-1 rounded border border-gray-700 flex gap-2 items-center">
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

        {hoveredCandle && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-mono bg-[#2B2D31]/80 px-2 py-1 rounded border border-gray-700 backdrop-blur-sm">
            <div className="flex gap-1">
              <span className="text-gray-400">O:</span>
              <span className="text-gray-200">{hoveredCandle.open.toFixed(2)}</span>
            </div>
            <div className="flex gap-1">
              <span className="text-gray-400">H:</span>
              <span className="text-gray-200">{hoveredCandle.high.toFixed(2)}</span>
            </div>
            <div className="flex gap-1">
              <span className="text-gray-400">L:</span>
              <span className="text-gray-200">{hoveredCandle.low.toFixed(2)}</span>
            </div>
            <div className="flex gap-1">
              <span className="text-gray-400">C:</span>
              <span className="text-gray-200">{hoveredCandle.close.toFixed(2)}</span>
            </div>

            <div className="flex gap-1">
              <span className="text-gray-400">Chg:</span>
              <span className={hoveredCandle.change >= 0 ? "text-emerald-400" : "text-red-400"}>
                {hoveredCandle.change > 0 ? '+' : ''}{hoveredCandle.change.toFixed(2)}%
              </span>
            </div>

            <div className="flex gap-1">
              <span className="text-gray-400">Rng:</span>
              <span className="text-gray-200">{hoveredCandle.range.toFixed(2)}%</span>
            </div>
          </div>
        )}

      </div>

      <div ref={chartContainerRef} className="flex-grow w-full h-full" />
      <button
        onClick={handleResetView}
        className="absolute bottom-4 right-4 z-30 p-2 bg-gray-700/50 hover:bg-gray-600 border border-gray-500 rounded-md transition-all opacity-0 group-hover:opacity-100 shadow-lg text-white"
        title="Resetovat zobrazení"
      >
        <Maximize className="w-4 h-4" />
      </button>


    </div>
  );
};

export default SmartChartWidget;