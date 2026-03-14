import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const [widgets, setWidgets] = useState([]);
  const [originalWidgets, setOriginalWidgets] = useState([]); 
  const [presets, setPresets] = useState([]);
  const [currentPresetId, setCurrentPresetId] = useState(null);
  
  const [symbol, setSymbol] = useState(() => {
    return localStorage.getItem('graphit_last_symbol') || 'BTCEUR';
  });
  
  const [isLocked, setIsLocked] = useState(false);

  const toggleLock = () => setIsLocked(prev => !prev);
  const hasUnsavedChanges = useMemo(() => {
    if (!currentPresetId) return widgets.length > 0;
    return JSON.stringify(widgets) !== JSON.stringify(originalWidgets);
  }, [widgets, originalWidgets, currentPresetId]);

  const updateSymbol = (newSymbol) => {
    setSymbol(newSymbol);
    localStorage.setItem('graphit_last_symbol', newSymbol);

    setWidgets((prevWidgets) => 
      prevWidgets.map((w) => {
        if (w.type === 'CHART' || w.type === 'PREDICTION') {
          return { ...w, data: { ...w.data, symbol: newSymbol } };
        }
        return w;
      })
    );
  };
  const addWidget = (type) => {
    const id = Date.now().toString();
    
    const newItem = { 
        i: id,
        type: type, 
        x: 0,
        y: Infinity,
        w: type === 'CHART' ? 6 : 3,
        h: type === 'CHART' ? 4 : 2,
        data: { symbol: symbol }
    };
    setWidgets((prev) => [...prev, newItem]);
  };

  const removeWidget = (id) => {
    setWidgets((prev) => prev.filter((w) => w.i !== id));
  };

  const updateWidgetData = (id, newData) => {
    setWidgets((prev) => prev.map((w) => {
      if (w.i === id) {
        return { ...w, data: { ...w.data, ...newData } };
      }
      return w;
    }));
  };

  const onDropWidget = (type, x, y) => {
    const id = Date.now().toString();
    const newItem = { 
        i: id, 
        type: type, 
        x: x,
        y: y,
        w: type === 'CHART' ? 6 : 3, 
        h: type === 'CHART' ? 4 : 2,
        data: { symbol: symbol }
    };
    setWidgets((prev) => [...prev, newItem]);
  };
  const onLayoutChange = (newLayout) => {
    setWidgets((prevWidgets) => {
      return prevWidgets.map((widget) => {
        const updatedItem = newLayout.find(item => item.i === widget.i);
        if (updatedItem) {
          return {
            ...widget,
            x: updatedItem.x,
            y: updatedItem.y,
            w: updatedItem.w,
            h: updatedItem.h
          };
        }
        return widget;
      });
    });
  };

  const fetchPresets = async () => {
    const token = localStorage.getItem('access_token');
    if(!token) return;
    try {
      const res = await fetch('http://localhost:8000/api/presets', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if(res.ok) {
        const data = await res.json();
        setPresets(data);
      }
    } catch (err) { console.error(err); }
  };

  const saveAsNewPreset = async (name) => {
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch('http://localhost:8000/api/presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name, layout: widgets })
      });
      if(res.ok) {
        const newPreset = await res.json();
        setPresets([...presets, newPreset]);
        setCurrentPresetId(newPreset.id);
        setOriginalWidgets(newPreset.layout); 
        alert('Uloženo!');
        return true;
      }
    } catch (err) { alert('Chyba'); return false; }
  };

  const updateCurrentPreset = async () => {
    if (!currentPresetId) return;
    const token = localStorage.getItem('access_token');
    const currentPreset = presets.find(p => p.id === currentPresetId);
    if (!currentPreset) return;
    try {
      const res = await fetch(`http://localhost:8000/api/presets/${currentPresetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: currentPreset.name, layout: widgets })
      });
      if(res.ok) {
        const updatedPreset = await res.json();
        setPresets(prev => prev.map(p => p.id === updatedPreset.id ? updatedPreset : p));
        setOriginalWidgets(updatedPreset.layout);
        alert('Aktualizováno!');
        return true;
      }
    } catch (err) { alert('Chyba'); return false; }
  };

  const deletePreset = async (presetId) => {
    const token = localStorage.getItem('access_token');
    if(!window.confirm("Smazat?")) return;
    try {
      await fetch(`http://localhost:8000/api/presets/${presetId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPresets(prev => prev.filter(p => p.id !== presetId));
      if (currentPresetId === presetId) {
          setWidgets([]);
          setOriginalWidgets([]);
          setCurrentPresetId(null);
      }
    } catch (err) { alert("Chyba"); }
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

  useEffect(() => { fetchPresets(); }, []);

  const value = {
    widgets, addWidget, removeWidget, updateWidgetData,
    onLayoutChange,
    state: { symbol }, updateSymbol,
    presets, currentPresetId, loadPreset, saveAsNewPreset, updateCurrentPreset, deletePreset,
    isLocked, toggleLock, hasUnsavedChanges, onDropWidget
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboardState = () => useContext(DashboardContext);