import React, { useState } from 'react';
import { useDashboardState } from '../context/DashboardContext';
import { Link } from 'react-router-dom';
import logo from '../assets/graphIT_logo.png';

const Navbar = ({ user, onLogout }) => {
  const dashboardContext = useDashboardState();
  const [saveMode, setSaveMode] = useState('NONE');
  const [newPresetName, setNewPresetName] = useState("");

  const handleSaveClick = () => {
    if (dashboardContext.currentPresetId) {
      setSaveMode('DECIDE');
    } else {
      setSaveMode('AS_NEW');
    }
  };

  const performSaveAsNew = async () => {
    if (newPresetName.trim()) {
      await dashboardContext.saveAsNewPreset(newPresetName);
      setNewPresetName("");
      setSaveMode('NONE');
    }
  };

  const performUpdate = async () => {
    await dashboardContext.updateCurrentPreset();
    setSaveMode('NONE');
  };

  return (
    <nav className="bg-graphit-dark-blue border-b border-graphit-gray-dark px-6 py-4 flex justify-between items-center shadow-md z-50">
      
      <Link to="/" className="flex items-center gap-3">
        <img src={logo} alt="GraphIT Logo" className="h-10 w-auto" />
        <span className="text-2xl font-bold text-text-graphit-white tracking-tight">
          GraphIT
        </span>
      </Link>

      <div className="flex items-center gap-6">
        
        {user && dashboardContext && (
          <div className="flex items-center gap-3 mr-4 border-r border-graphit-gray pr-6">
            
            <button 
              onClick={dashboardContext.toggleLock} 
              title={dashboardContext.isLocked ? "Odemknout" : "Zamknout"}
              className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-all duration-300 border ${
                dashboardContext.isLocked 
                  ? 'bg-red-500/10 text-red-400 border-red-500/50 hover:bg-red-500/20' 
                  : 'bg-graphit-turquoise/10 text-graphit-turquoise border-graphit-turquoise/50 hover:bg-graphit-turquoise/20'
              }`} 
            >
              <span className={`text-lg transition-transform duration-300 ${dashboardContext.isLocked ? 'scale-110' : ''}`}>
                {dashboardContext.isLocked ? '🔒' : '🔓'}
              </span>
              <span className="hidden lg:inline font-semibold">
                {dashboardContext.isLocked ? 'Zamčeno' : 'Úpravy'}
              </span>
            </button>

            <div className="h-6 w-[1px] bg-graphit-gray-dark mx-2"></div>

            <select 
              onChange={(e) => dashboardContext.loadPreset(e.target.value)} 
              value={dashboardContext.currentPresetId || 'new'}
              className="bg-graphit-gray text-text-graphit-white text-sm rounded px-3 py-2 border border-graphit-gray-dark focus:outline-none focus:border-graphit-turquoise max-w-[200px]" 
            >
              <option value="new">-- Nový Dashboard --</option>
              {dashboardContext.presets.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            {dashboardContext.hasUnsavedChanges && (
              <span className="w-2 h-2 rounded-full bg-graphit-yellow" title="Neuložené změny"></span>
            )}

            {saveMode === 'NONE' && (
              <button 
                onClick={handleSaveClick} 
                className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors border ${
                  dashboardContext.hasUnsavedChanges 
                    ? 'bg-graphit-turquoise text-white border-transparent' 
                    : 'bg-graphit-gray text-text-graphit-white border-graphit-gray-dark hover:bg-graphit-gray-dark'
                }`}
              >
                <span>💾</span> Uložit
              </button>
            )}

            {saveMode === 'DECIDE' && (
              <div className="flex gap-2 animate-in fade-in zoom-in duration-200">
                <button onClick={performUpdate} className="bg-graphit-turquoise text-white text-xs px-3 py-2 rounded hover:bg-green-600">Aktualizovat</button>
                <button onClick={() => setSaveMode('AS_NEW')} className="bg-graphit-gray text-white text-xs px-3 py-2 rounded border border-graphit-gray-dark hover:bg-graphit-gray-dark">Uložit jako nový...</button>
                <button onClick={() => setSaveMode('NONE')} className="text-red-400 hover:text-white px-2">✕</button>
              </div>
            )}

            {saveMode === 'AS_NEW' && (
              <div className="flex gap-2 animate-in fade-in zoom-in duration-200">
                <input 
                  type="text" 
                  placeholder="Název..." 
                  autoFocus 
                  value={newPresetName} 
                  onChange={(e) => setNewPresetName(e.target.value)} 
                  className="bg-graphit-gray-dark text-white text-sm px-2 py-1 rounded border border-graphit-light-blue w-32 focus:outline-none focus:ring-1 focus:ring-graphit-turquoise" 
                />
                <button onClick={performSaveAsNew} className="text-graphit-success hover:text-white font-bold px-1">✓</button>
                <button onClick={() => setSaveMode('NONE')} className="text-red-400 hover:text-white px-1">✕</button>
              </div>
            )}

            {dashboardContext.currentPresetId && saveMode === 'NONE' && (
              <button 
                onClick={() => dashboardContext.deletePreset(dashboardContext.currentPresetId)} 
                title="Smazat dashboard"
                className="text-red-400 hover:text-red-500 hover:bg-red-500/10 p-2 rounded transition-colors ml-2" 
              >
                🗑️
              </button>
            )}
          </div>
        )}
        
        <div className="flex items-center gap-4">
          <span className="text-graphit-gray-light text-sm hidden md:inline">
            {user ? user.email : 'Host'}
          </span>
          
          {user ? (
            <button 
              onClick={onLogout} 
              className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            >
              Odhlásit se
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <Link 
                to="/login" 
                className="text-graphit-turquoise hover:text-white border border-graphit-turquoise hover:bg-graphit-turquoise px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200"
              >
                Přihlásit
              </Link>
              <Link 
                to="/register" 
                className="bg-graphit-turquoise hover:bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-lg shadow-graphit-turquoise/20 transition-all duration-200"
              >
                Registrace
              </Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;