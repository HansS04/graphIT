import React from 'react';
import { useDashboardState } from '../context/DashboardContext';
import DashboardGrid from '../features/dashboard/components/DashboardGrid';

// Hlavní stránková komponenta pro zobrazení uživatelské analytické plochy.
const UserDashboard = ({ user }) => {
  // Přístup ke globálnímu stavu pro detekci režimu úprav (zamčeno/odemčeno).
  const { isLocked } = useDashboardState();

  return (
    <div className="w-full h-full p-8 overflow-y-auto blender-grid-bg transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto pb-40">
        
        {/* Informační panel nástěnky (Header). Zobrazuje identitu uživatele a stav rozložení. */}
        <div className="bg-graphit-gray border border-graphit-gray-dark p-6 rounded-lg shadow-lg mb-8 flex justify-between items-center relative z-20">
            <div>
                <h1 className="text-2xl font-bold text-text-graphit-white">Můj Dashboard</h1>
                <p className="text-graphit-gray-light">Vítejte, {user?.email || "Uživateli"}</p>
            </div>
            
            {/* Podmíněné vykreslení stavového štítku indikujícího uzamčení mřížky pro úpravy. */}
            {isLocked && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                    🔒 Read-Only
                </div>
            )}
        </div>

        {/* Fyzické vykreslení interaktivní mřížky s analytickými komponentami. */}
        <DashboardGrid />
        
      </div>
    </div>
  );
};

export default UserDashboard;