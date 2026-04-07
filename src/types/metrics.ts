export interface MetricData {
  month: string;
  value: number;
}

export interface Metric {
  id: string;
  name: string;
  shortName: string;
  description: string;
  unit: string;
  formula?: string;
  data: MetricData[];
  currentValue?: number;
  previousValue?: number;
  change?: number;
}

export interface ForecastParams {
  changeType: 'increase' | 'decrease';
  changePercent: number;
  targetMetric?: string;
}

export interface ChartConfig {
  id: string;
  metricId: string;
  type: 'line' | 'bar' | 'area';
  showForecast: boolean;
  forecastMonths: number;
}

export interface DashboardChart {
  id: string;
  metricId: string;
  metricName: string;
  data: MetricData[];
  forecast?: MetricData[];
  type: 'line' | 'bar' | 'area';
  createdAt: Date;
}
