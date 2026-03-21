import React from 'react';
import { 
  Activity, 
  BarChart3, 
  Cpu, 
  SlidersHorizontal, 
  TableProperties, 
  LineChart, 
  TrendingUp,
  Settings,
  Play,
  Database,
  FileCode
} from 'lucide-react';

export const getWidgetCategories = (userRole) => {
  const baseCategories = [
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

  if (userRole === 'admin') {
    baseCategories.push({
      id: 'admin',
      label: 'Systémové nástroje',
      icon: <Settings className="w-6 h-6 text-gray-400" />,
      items: [
        { type: 'PUMP_CONTROL', label: 'Datová Pumpa', icon: <Play className="w-4 h-4" /> },
        { type: 'PG_ADMIN_LINK', label: 'DB Administrace', icon: <Database className="w-4 h-4" /> },
        { type: 'SWAGGER_LINK', label: 'API Swagger', icon: <FileCode className="w-4 h-4" /> }
      ]
    });
  }

  return baseCategories;
};