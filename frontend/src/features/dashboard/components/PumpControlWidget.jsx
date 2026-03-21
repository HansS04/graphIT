import React, { useState, useEffect } from 'react';
import { Play, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

const PumpControlWidget = () => {
  const [status, setStatus] = useState({ is_running: false, last_run: null });
  const [loading, setLoading] = useState(false);

  const checkStatus = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('http://localhost:8000/api/admin/pump/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error("Chyba při zjišťování stavu pumpy:", err);
    }
  };

  const handleStartPump = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('http://localhost:8000/api/admin/pump', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.status === 'started' || data.status === 'running') {
        setStatus(prev => ({ ...prev, is_running: true }));
      }
    } catch (err) {
      alert("Nepodařilo se spustit pumpu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();

    let interval;
    if (status.is_running) {
      interval = setInterval(checkStatus, 5000);
    }
    return () => clearInterval(interval);
  }, [status.is_running]);

  return (
    <div className="p-4 h-full flex flex-col justify-between bg-graphit-gray/40 rounded-xl border border-gray-700/50">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-white font-bold text-sm">Datová Pumpa</h3>
          <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Binance Vision Sync</p>
        </div>
        {status.is_running ? (
          <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
        ) : (
          <CheckCircle className="w-5 h-5 text-gray-600" />
        )}
      </div>

      <div className="my-4">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${status.is_running ? 'bg-emerald-500 animate-ping' : 'bg-gray-600'}`} />
          <span className="text-xs font-medium text-gray-300">
            {status.is_running ? "Právě probíhá stahování..." : "Systém v klidu"}
          </span>
        </div>
        {status.last_run && !status.is_running && (
           <p className="text-[9px] text-gray-500 mt-2">
             Naposledy spuštěno: {new Date(status.last_run).toLocaleString('cs-CZ')}
           </p>
        )}
      </div>

      <button
        onClick={handleStartPump}
        disabled={status.is_running || loading}
        className={`w-full py-3 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 ${
          status.is_running || loading
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 active:scale-95'
        }`}
      >
        {status.is_running ? "PUMPA PRACUJE" : "SPUSTIT AKTUALIZACI"}
      </button>
    </div>
  );
};

export default PumpControlWidget;