import React, { createContext, useState, useContext } from 'react';

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const [state, setState] = useState({
    symbol: 'BTCEUR',
    interval: '1h',
  });

  const updateSymbol = (newSymbol) => {
    setState((prev) => ({ ...prev, symbol: newSymbol }));
  };

  return (
    <DashboardContext.Provider value={{ state, updateSymbol }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboardState = () => useContext(DashboardContext);