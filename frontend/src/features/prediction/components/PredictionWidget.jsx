import React, { useEffect, useState, useRef } from 'react';
import { createChart, ColorType, LineSeries } from 'lightweight-charts';
import { Maximize } from 'lucide-react';

// Vizuální komponenta pro zobrazení historického vývoje a následných prediktivních scénářů.
const PredictionWidget = ({ id, data }) => {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  
  // Lokální stav pro blokování UI a zobrazení indikátoru během stahování dat.
  const [loading, setLoading] = useState(true);
  
  const symbol = data?.symbol || 'BTCEUR';

  // Obslužná funkce pro automatické zarovnání grafu tak, aby obsáhl všechna načtená data.
  const handleResetView = () => {
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
     }
    };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Inicializace grafického plátna a definice globálních vizuálních vlastností.
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
    chartRef.current = chart;

    // Registrace jednotlivých datových řad do instance grafu s definicí jejich stylů (barva, tloušťka, přerušování).
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

    // Hlavní asynchronní funkce pro načtení, transformaci a spojení dat.
    const loadData = async () => {
      try {
        // Stažení a aplikace historických dat (omezeno na posledních 200 záznamů).
        const histRes = await fetch(`http://localhost:8000/api/market-data/${symbol}`);
        const histData = await histRes.json();
        
        const recentHistory = histData.slice(-200).map(d => ({ 
            time: d.time, 
            value: d.close 
        }));
        historySeries.setData(recentHistory);

        // Identifikace posledního historického bodu pro zajištění návaznosti křivek.
        const lastHistPoint = recentHistory[recentHistory.length - 1];

        // Stažení prediktivních scénářů z backendové simulace.
        const predRes = await fetch(`http://localhost:8000/api/predict/${symbol}?days=3`);
        if (!predRes.ok) throw new Error("Nepodařilo se načíst predikci");
        const predData = await predRes.json();

        // Konstrukce spojovacího bodu (bridgePoint) simulujícího počátek v čase T=0.
        const bridgePoint = { 
            time: lastHistPoint.time, 
            value: predData.last_price || lastHistPoint.value 
        };

        // Sloučení spojovacího bodu se strukturami predikcí pro vytvoření vizuálně nepřerušených čar.
        const bullData = [bridgePoint, ...predData.bull];
        const avgData = [bridgePoint, ...predData.avg];
        const bearData = [bridgePoint, ...predData.bear];

        bullSeries.setData(bullData);
        avgSeries.setData(avgData);
        bearSeries.setData(bearData);

        chart.timeScale().fitContent();
        
      } catch (err) {
        console.error("Chyba při renderování grafu:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Implementace ResizeObserveru pro překreslení plátna při změně rozměrů rodičovského grid kontejneru.
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

    // Destrukční funkce pro odhlášení událostí a uvolnění grafu z paměti při odstranění komponenty.
    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [symbol]);

  return (
    <div className="w-full h-full flex flex-col relative bg-transparent overflow-hidden">
      
      {/* Vizuální indikátor probíhajícího výpočtu blokující zobrazení prázdného plátna. */}
      {loading && <div className="absolute inset-0 flex items-center justify-center bg-[#2B2D31]/80 z-10 text-xs text-gray-500">Počítám predikci pro {symbol}...</div>}
      
      {/* Identifikační a informační štítek komponenty. */}
      <div className="absolute top-2 left-2 z-20 bg-[#2B2D31]/80 px-2 py-1 rounded border border-gray-700 pointer-events-none">
        <span className="text-white font-bold text-xs">PREDIKCE (72h) - {symbol}</span>
      </div>

      {/* Referenční uzel pro vložení instance lightweight-charts. */}
      <div ref={chartContainerRef} className="flex-grow w-full h-full relative" />
       
       <button
        onClick={handleResetView}
        className="absolute bottom-10 right-4 z-30 p-2 bg-gray-700/50 hover:bg-gray-600 border border-gray-500 rounded-md transition-all opacity-0 group-hover:opacity-100 shadow-lg text-white"
        title="Resetovat zobrazení"
      >
        <Maximize className="w-4 h-4" />
      </button>
      
      {/* Statická legenda objasňující význam jednotlivých prediktivních křivek. */}
      <div className="flex justify-center gap-4 pb-1 pt-1 text-[10px] bg-transparent">
        <span className="text-emerald-400">● Bull</span>
        <span className="text-yellow-400">● Avg</span>
        <span className="text-red-400">● Bear</span>
      </div>
    </div>
  );
};

export default PredictionWidget;