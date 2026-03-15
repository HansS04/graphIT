import React from 'react';
import SmartChartWidget from './SmartChartWidget';
import PredictionWidget from '../../../components/PredictionWidget';
import GlobalSwitcherWidget from './GlobalSwitcherWidget';

const WIDGET_COMPONENTS = {
  'CHART': SmartChartWidget,
  'PREDICTION': PredictionWidget,
  'CONTROLS': GlobalSwitcherWidget,
  // 'KPI': KpiCardWidget,
  // 'TABLE': DataTableWidget,
};

const WidgetRenderer = ({ widget }) => {
  const ComponentToRender = WIDGET_COMPONENTS[widget.type];

  if (!ComponentToRender) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-graphit-gray-light bg-graphit-gray-dark/50 rounded p-4 text-center">
        <span className="text-2xl mb-2">🧩</span>
        <p className="text-sm">
          Komponenta pro typ <strong>{widget.type}</strong> zatím neexistuje.
        </p>
      </div>
    );
  }
  return <ComponentToRender id={widget.i} data={widget.data} />;
};

export default WidgetRenderer;