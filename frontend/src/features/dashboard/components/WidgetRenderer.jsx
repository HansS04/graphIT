import React from 'react';
import { useDashboardState } from '../../../context/DashboardContext';

import SmartChartWidget from './SmartChartWidget';
import PredictionWidget from '../../prediction/components/PredictionWidget';
import PumpControlWidget from './PumpControlWidget';
import PgAdminWidget from './PgAdminWidget';
import SwaggerWidget from './SwaggerWidget';

const KPIContent = () => (
  <div className="flex flex-col items-center justify-center h-full text-text-graphit-white">
    <span className="text-graphit-gray-light text-sm uppercase tracking-wider">Celkový Zisk</span>
    <span className="text-5xl font-bold text-graphit-success mt-2 drop-shadow-lg">+25%</span>
  </div>
);

const TableContent = () => (
  <div className="w-full h-full overflow-hidden text-center pt-10 text-graphit-gray-light">Tabulka Dat...</div>
);

const ControlContent = () => {
  const { state, updateSymbol } = useDashboardState();
  const markets = ['BTCEUR', 'ETHEUR', 'SOLUSD'];
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <h4 className="text-text-graphit-white text-sm font-bold uppercase tracking-wider">Vyberte trh</h4>
      <div className="flex flex-wrap justify-center gap-2">
        {markets.map((sym) => (
          <button 
            key={sym} 
            onClick={() => updateSymbol(sym)} 
            className={`px-3 py-1 rounded text-sm font-bold transition-all ${state.symbol === sym ? 'bg-graphit-turquoise text-white shadow-lg' : 'bg-graphit-dark-blue text-gray-400 hover:bg-graphit-gray-dark hover:text-white'}`}
          >
            {sym}
          </button>
        ))}
      </div>
    </div>
  );
};

const WIDGET_COMPONENTS = {
  'CHART': SmartChartWidget,
  'PREDICTION': PredictionWidget,
  'PUMP_CONTROL': PumpControlWidget,
  'PG_ADMIN_LINK': PgAdminWidget,
  'SWAGGER_LINK': SwaggerWidget,
  'KPI': KPIContent,
  'TABLE': TableContent,
  'CONTROLS': ControlContent
};

const WidgetRenderer = (props) => {
  const type = props.type || props.widget?.type;
  const data = props.data || props.widget?.data || {};
  const id = props.id || props.widget?.i || props.widget?.id;

  const ComponentToRender = WIDGET_COMPONENTS[type];

  if (!ComponentToRender) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-graphit-gray-light bg-graphit-gray-dark/50 rounded p-4 text-center">
        <span className="text-2xl mb-2">🧩</span>
        <p className="text-sm">
          Komponenta pro typ <strong className="text-white">{type || 'PRÁZDNÝ TYP'}</strong> zatím neexistuje.
        </p>
      </div>
    );
  }

  return <ComponentToRender id={id} symbol={data.symbol || 'BTCEUR'} data={data} />;
};

export default WidgetRenderer;