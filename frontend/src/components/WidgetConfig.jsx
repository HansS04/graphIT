import React from 'react';
import { 
  Activity, 
  BarChart3, 
  Cpu, 
  SlidersHorizontal, 
  TableProperties, 
  LineChart, 
  TrendingUp 
} from 'lucide-react';

export const WIDGET_CATEGORIES = [
  {
    id: 'analytika',
    label: 'Analytika',
    icon: <Activity className="w-6 h-6" />,
    items: [
      { type: 'CONTROLS', label: 'Přepínač Trhů', icon: <SlidersHorizontal className="w-4 h-4" /> },
      { type: 'KPI', label: 'Karta Metrik', icon: <Cpu className="w-4 h-4" /> },
      { type: 'TABLE', label: 'Tabulka Dat', icon: <TableProperties className="w-4 h-4" /> }
    ]
  },
  {
    id: 'grafy',
    label: 'Grafy',
    icon: <BarChart3 className="w-6 h-6" />,
    items: [
      { type: 'CHART', label: 'Svíčkový Graf', icon: <LineChart className="w-4 h-4" /> }
    ]
  },
  {
    id: 'simulace',
    label: 'Simulace',
    icon: <TrendingUp className="w-6 h-6" />,
    items: [
      { type: 'PREDICTION', label: 'Predikce Ceny', icon: <Activity className="w-4 h-4" /> }
    ]
  }
];