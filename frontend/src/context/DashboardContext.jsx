import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';

const DashboardContext = createContext();

const ADMIN_DEFAULT_LAYOUT = [
  { i: 'pump-1', type: 'PUMP_CONTROL', x: 0, y: 0, w: 4, h: 3 },
  { i: 'pgadmin-1', type: 'PG_ADMIN_LINK', x: 4, y: 0, w: 2, h: 3 },
  { i: 'swagger-1', type: 'SWAGGER_LINK', x: 6, y: 0, w: 2, h: 3 },
  { i: 'chart-1', type: 'CHART', props: { symbol: 'BTCEUR' }, x: 0, y: 3, w: 8, h: 4 }
];

const USER_DEFAULT_LAYOUT = [
  { i: 'chart-1', type: 'CHART', props: { symbol: 'BTCEUR' }, x: 0, y: 0, w: 6, h: 4 },
  { i: 'predict-1', type: 'PREDICTION', props: { symbol: 'BTCEUR' }, x: 6, y: 0, w: 4, h: 4 }
];

export const DashboardProvider = ({ children, user }) => {
  
  
  const [widgets, setWidgets] = useState(() => {
    const role = user?.role || 'user';
    const saved = localStorage.getItem(`dashboard_layout_${role}`);
    if (saved) return JSON.parse(saved);
    
    return role === 'admin' ? ADMIN_DEFAULT_LAYOUT : USER_DEFAULT_LAYOUT;
  });

  const [originalWidgets, setOriginalWidgets] = useState([]); 
  const [presets, setPresets] = useState([]);
  const [currentPresetId, setCurrentPresetId] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  
  const [symbol, setSymbol] = useState(() => {
    return localStorage.getItem('graphit_last_symbol') || 'BTCEUR';
  });


  useEffect(() => {
    const role = user?.role || 'user';
    localStorage.setItem(`dashboard_layout_${role}`, JSON.stringify(widgets));
  }, [widgets, user]);

  useEffect(() => { 
    fetchPresets(); 
  }, []);


  const hasUnsavedChanges = useMemo(() => {
    if (!currentPresetId) return widgets.length > 0;
    return JSON.stringify(widgets) !== JSON.stringify(originalWidgets);
  }, [widgets, originalWidgets, currentPresetId]);

  const toggleLock = () => setIsLocked(prev => !prev);

  const updateSymbol = (newSymbol) => {
    setSymbol(newSymbol);
    localStorage.setItem('graphit_last_symbol', newSymbol);
    setWidgets(prev => prev.map(w => 
      ['CHART', 'PREDICTION'].includes(w.type) ? { ...w, data: { ...w.data, symbol: newSymbol } } : w
    ));
  };

  const addWidget = (type) => {
    const newItem = { 
      i: Date.now().toString(),
      type, 
      x: 0, y: Infinity, 
      w: type === 'CHART' ? 6 : 3, h: type === 'CHART' ? 4 : 2,
      data: { symbol }
    };
    setWidgets(prev => [...prev, newItem]);
  };

  const removeWidget = (id) => setWidgets(prev => prev.filter(w => w.i !== id));

  const updateWidgetData = (id, newData) => {
    setWidgets(prev => prev.map(w => w.i === id ? { ...w, data: { ...w.data, ...newData } } : w));
  };

  const onDropWidget = (type, x, y) => {
    const newItem = { 
      i: Date.now().toString(), 
      type, x, y, 
      w: type === 'CHART' ? 6 : 3, h: type === 'CHART' ? 4 : 2,
      data: { symbol }
    };
    setWidgets(prev => [...prev, newItem]);
  };

  const onLayoutChange = (newLayout) => {
    setWidgets(prev => prev.map(widget => {
      const updated = newLayout.find(item => item.i === widget.i);
      return updated ? { ...widget, x: updated.x, y: updated.y, w: updated.w, h: updated.h } : widget;
    }));
  };


  const getHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    'Content-Type': 'application/json'
  });

  const fetchPresets = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:8000/api/presets', { headers: getHeaders() });
      if (res.ok) setPresets(await res.json());
    } catch (err) { console.error("Chyba při načítání presetů:", err); }
  };

  const saveAsNewPreset = async (name) => {
    try {
      const res = await fetch('http://localhost:8000/api/presets', {
        method: 'POST', headers: getHeaders(),
        body: JSON.stringify({ name, layout: widgets })
      });
      if (res.ok) {
        const newPreset = await res.json();
        setPresets([...presets, newPreset]);
        setCurrentPresetId(newPreset.id);
        setOriginalWidgets(newPreset.layout); 
        return true;
      }
    } catch (err) { alert('Nepodařilo se uložit rozložení.'); return false; }
  };

  const updateCurrentPreset = async () => {
    if (!currentPresetId) return;
    const currentPreset = presets.find(p => p.id === currentPresetId);
    try {
      const res = await fetch(`http://localhost:8000/api/presets/${currentPresetId}`, {
        method: 'PUT', headers: getHeaders(),
        body: JSON.stringify({ name: currentPreset.name, layout: widgets })
      });
      if (res.ok) {
        const updated = await res.json();
        setPresets(prev => prev.map(p => p.id === updated.id ? updated : p));
        setOriginalWidgets(updated.layout);
        return true;
      }
    } catch (err) { alert('Nepodařilo se aktualizovat rozložení.'); return false; }
  };

  const deletePreset = async (presetId) => {
    if (!window.confirm("Opravdu chcete smazat toto rozložení?")) return;
    try {
      await fetch(`http://localhost:8000/api/presets/${presetId}`, {
        method: 'DELETE', headers: getHeaders()
      });
      setPresets(prev => prev.filter(p => p.id !== presetId));
      if (currentPresetId === presetId) loadPreset('new');
    } catch (err) { alert("Nepodařilo se smazat rozložení."); }
  };

  const loadPreset = (presetId) => {
    if (presetId === 'new') {
      setWidgets([]);
      setOriginalWidgets([]);
      setCurrentPresetId(null);
      return;
    }
    const preset = presets.find(p => p.id === parseInt(presetId));
    if (preset) {
      setWidgets(preset.layout);
      setOriginalWidgets(preset.layout);
      setCurrentPresetId(preset.id);
    }
  };


  const value = {
    widgets, addWidget, removeWidget, updateWidgetData, onDropWidget, onLayoutChange,
    state: { symbol }, updateSymbol,
    presets, currentPresetId, loadPreset, saveAsNewPreset, updateCurrentPreset, deletePreset,
    isLocked, toggleLock, hasUnsavedChanges
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboardState = () => useContext(DashboardContext);