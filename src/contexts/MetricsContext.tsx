import React, { createContext, useContext, useState, useCallback } from 'react';
import { Metric, MetricData, DashboardChart } from '@/types/metrics';

// Визначаємо стандартні метрики
const defaultMetrics: Metric[] = [
  {
    id: 'arr',
    name: 'Annual Recurring Revenue',
    shortName: 'ARR',
    description: 'Щорічний повторюваний дохід',
    unit: '₴',
    data: [],
  },
  {
    id: 'mrr',
    name: 'Monthly Recurring Revenue',
    shortName: 'MRR',
    description: 'Щомісячний повторюваний дохід',
    unit: '₴',
    data: [],
  },
  {
    id: 'churn',
    name: 'Churn Rate',
    shortName: 'Churn',
    description: 'Показник відтоку клієнтів',
    unit: '%',
    data: [],
  },
  {
    id: 'cac',
    name: 'Customer Acquisition Cost',
    shortName: 'CAC',
    description: 'Вартість залучення клієнта',
    unit: '₴',
    data: [],
  },
  {
    id: 'ltv',
    name: 'Customer Lifetime Value',
    shortName: 'LTV',
    description: 'Довічна цінність клієнта',
    unit: '₴',
    data: [],
  },
  {
    id: 'nps',
    name: 'Net Promoter Score',
    shortName: 'NPS',
    description: 'Індекс лояльності клієнтів',
    unit: '',
    data: [],
  },
  {
    id: 'roi',
    name: 'Return on Investment',
    shortName: 'ROI',
    description: 'Рентабельність інвестицій',
    unit: '%',
    data: [],
  },
  {
    id: 'revenue',
    name: 'Total Revenue',
    shortName: 'Revenue',
    description: 'Загальний дохід',
    unit: '₴',
    data: [],
  },
];

interface MetricsContextType {
  metrics: Metric[];
  dashboardCharts: DashboardChart[];
  updateMetricData: (metricId: string, data: MetricData[]) => void;
  addDataPoint: (metricId: string, dataPoint: MetricData) => void;
  addChartToDashboard: (chart: DashboardChart) => void;
  removeChartFromDashboard: (chartId: string) => void;
  importData: (data: Record<string, MetricData[]>) => void;
  exportData: () => Record<string, MetricData[]>;
  calculateForecast: (metricId: string, months: number, changePercent?: number, changeType?: 'increase' | 'decrease') => MetricData[];
}

const MetricsContext = createContext<MetricsContextType | undefined>(undefined);

export const useMetrics = () => {
  const context = useContext(MetricsContext);
  if (!context) {
    throw new Error('useMetrics must be used within a MetricsProvider');
  }
  return context;
};

export const MetricsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [metrics, setMetrics] = useState<Metric[]>(() => {
    const saved = localStorage.getItem('metrics');
    return saved ? JSON.parse(saved) : defaultMetrics;
  });

  const [dashboardCharts, setDashboardCharts] = useState<DashboardChart[]>(() => {
    const saved = localStorage.getItem('dashboardCharts');
    return saved ? JSON.parse(saved) : [];
  });

  const saveMetrics = (newMetrics: Metric[]) => {
    setMetrics(newMetrics);
    localStorage.setItem('metrics', JSON.stringify(newMetrics));
  };

  const saveDashboardCharts = (charts: DashboardChart[]) => {
    setDashboardCharts(charts);
    localStorage.setItem('dashboardCharts', JSON.stringify(charts));
  };

  const updateMetricData = useCallback((metricId: string, data: MetricData[]) => {
    setMetrics(prev => {
      const updated = prev.map(m => 
        m.id === metricId 
          ? { ...m, data, currentValue: data[data.length - 1]?.value, previousValue: data[data.length - 2]?.value }
          : m
      );
      localStorage.setItem('metrics', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addDataPoint = useCallback((metricId: string, dataPoint: MetricData) => {
    setMetrics(prev => {
      const updated = prev.map(m => {
        if (m.id === metricId) {
          const newData = [...m.data, dataPoint];
          return { 
            ...m, 
            data: newData,
            currentValue: dataPoint.value,
            previousValue: m.data[m.data.length - 1]?.value
          };
        }
        return m;
      });
      localStorage.setItem('metrics', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addChartToDashboard = useCallback((chart: DashboardChart) => {
    setDashboardCharts(prev => {
      const updated = [...prev, chart];
      localStorage.setItem('dashboardCharts', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeChartFromDashboard = useCallback((chartId: string) => {
    setDashboardCharts(prev => {
      const updated = prev.filter(c => c.id !== chartId);
      localStorage.setItem('dashboardCharts', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const importData = useCallback((data: Record<string, MetricData[]>) => {
    setMetrics(prev => {
      const updated = prev.map(m => {
        if (data[m.id]) {
          const newData = data[m.id];
          return {
            ...m,
            data: newData,
            currentValue: newData[newData.length - 1]?.value,
            previousValue: newData[newData.length - 2]?.value,
          };
        }
        return m;
      });
      localStorage.setItem('metrics', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const exportData = useCallback((): Record<string, MetricData[]> => {
    return metrics.reduce((acc, m) => {
      acc[m.id] = m.data;
      return acc;
    }, {} as Record<string, MetricData[]>);
  }, [metrics]);

  const calculateForecast = useCallback((
    metricId: string, 
    months: number = 5,
    changePercent?: number,
    changeType?: 'increase' | 'decrease'
  ): MetricData[] => {
    const metric = metrics.find(m => m.id === metricId);
    if (!metric || metric.data.length < 6) return [];

    const data = metric.data;
    const n = data.length;
    
    // Простий лінійний тренд з урахуванням сезонності
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += data[i].value;
      sumXY += i * data[i].value;
      sumX2 += i * i;
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Застосування відсоткової зміни
    let modifier = 1;
    if (changePercent && changeType) {
      modifier = changeType === 'increase' 
        ? 1 + (changePercent / 100)
        : 1 - (changePercent / 100);
    }

    const forecast: MetricData[] = [];
    const lastDate = new Date(data[n - 1].month);
    
    for (let i = 1; i <= months; i++) {
      const futureDate = new Date(lastDate);
      futureDate.setMonth(futureDate.getMonth() + i);
      
      const predictedValue = (slope * (n + i - 1) + intercept) * modifier;
      
      forecast.push({
        month: futureDate.toISOString().slice(0, 7),
        value: Math.max(0, Math.round(predictedValue * 100) / 100),
      });
    }

    return forecast;
  }, [metrics]);

  return (
    <MetricsContext.Provider value={{
      metrics,
      dashboardCharts,
      updateMetricData,
      addDataPoint,
      addChartToDashboard,
      removeChartFromDashboard,
      importData,
      exportData,
      calculateForecast,
    }}>
      {children}
    </MetricsContext.Provider>
  );
};
