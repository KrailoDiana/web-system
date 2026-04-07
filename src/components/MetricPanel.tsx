import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMetrics } from '@/contexts/MetricsContext';
import { MetricData, DashboardChart } from '@/types/metrics';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Plus,
  Trash2,
  TrendingUp,
  BarChart3,
  LineChartIcon,
  AreaChartIcon,
  Calculator,
  Sparkles,
  AlertCircle,
  Check,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { toast } from 'sonner';

interface MetricPanelProps {
  metricId: string;
  onClose: () => void;
}

const MetricPanel = ({ metricId, onClose }: MetricPanelProps) => {
  const { metrics, updateMetricData, addChartToDashboard, calculateForecast } = useMetrics();
  const metric = metrics.find(m => m.id === metricId);
  
  const [localData, setLocalData] = useState<MetricData[]>(metric?.data || []);
  const [newMonth, setNewMonth] = useState('');
  const [newValue, setNewValue] = useState('');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');
  const [showForecast, setShowForecast] = useState(false);
  const [forecastData, setForecastData] = useState<MetricData[]>([]);
  const [forecastParams, setForecastParams] = useState({
    changeType: 'increase' as 'increase' | 'decrease',
    changePercent: 0,
  });

  if (!metric) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Метрику не знайдено</p>
      </div>
    );
  }

  const handleAddDataPoint = () => {
    if (!newMonth || !newValue) {
      toast.error('Заповніть усі поля');
      return;
    }

    const value = parseFloat(newValue);
    if (isNaN(value)) {
      toast.error('Введіть коректне число');
      return;
    }

    const newData = [...localData, { month: newMonth, value }].sort(
      (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()
    );
    
    setLocalData(newData);
    updateMetricData(metricId, newData);
    setNewMonth('');
    setNewValue('');
    toast.success('Дані додано');
  };

  const handleRemoveDataPoint = (index: number) => {
    const newData = localData.filter((_, i) => i !== index);
    setLocalData(newData);
    updateMetricData(metricId, newData);
  };

  const handleBuildChart = () => {
    if (localData.length < 2) {
      toast.error('Потрібно мінімум 2 точки даних');
      return;
    }

    const chart: DashboardChart = {
      id: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      }),
      metricId: metric.id,
      metricName: metric.name,
      data: localData,
      forecast: showForecast ? forecastData : undefined,
      type: chartType,
      createdAt: new Date(),
    };

    addChartToDashboard(chart);
    toast.success('Графік додано на дашборд');
  };

  const handleBuildForecast = () => {
    if (localData.length < 6) {
      toast.error('Для прогнозу потрібно мінімум 6 значень');
      return;
    }

    const forecast = calculateForecast(
      metricId,
      60,
      forecastParams.changePercent > 0 ? forecastParams.changePercent : undefined,
      forecastParams.changePercent > 0 ? forecastParams.changeType : undefined
    );

    setForecastData(forecast);
    setShowForecast(true);
    toast.success('Прогноз побудовано');
  };

  const combinedData = [
    ...localData.map(d => ({ ...d, type: 'actual' as const })),
    ...forecastData.map(d => ({ ...d, type: 'forecast' as const })),
  ];

  const chartTypes = [
    { id: 'line' as const, icon: LineChartIcon, label: 'Лінія' },
    { id: 'bar' as const, icon: BarChart3, label: 'Стовпці' },
    { id: 'area' as const, icon: AreaChartIcon, label: 'Область' },
  ];

  // Розрахунок статистики
  const currentValue = localData[localData.length - 1]?.value || 0;
  const previousValue = localData[localData.length - 2]?.value || 0;
  const change = previousValue ? ((currentValue - previousValue) / previousValue) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="h-full overflow-y-auto bg-card rounded-xl border border-border shadow-lg"
    >
      {/* Header */}
      <div className="sticky top-0 bg-card z-10 p-6 border-b border-border">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{metric.shortName}</h2>
            <p className="text-muted-foreground">{metric.description}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Поточне значення */}
        {localData.length > 0 && (
          <div className="mt-4 p-4 rounded-lg bg-secondary/50">
            <div className="flex items-end gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Поточне значення</p>
                <p className="stat-value">
                  {metric.unit === '₴' ? '₴' : ''}{currentValue.toLocaleString()}{metric.unit === '%' ? '%' : ''}
                </p>
              </div>
              {change !== 0 && (
                <div className={`stat-change ${change > 0 ? 'positive' : 'negative'}`}>
                  {change > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  {Math.abs(change).toFixed(1)}%
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Форма введення */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Додати дані
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Місяць</label>
              <input
                type="month"
                value={newMonth}
                onChange={(e) => setNewMonth(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">
                Значення {metric.unit && `(${metric.unit})`}
              </label>
              <input
                type="number"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="0"
                className="input-field"
              />
            </div>
          </div>
          
          <button onClick={handleAddDataPoint} className="btn-primary w-full">
            <Plus className="w-4 h-4 mr-2" />
            Додати значення
          </button>
        </div>

        {/* Список даних */}
        {localData.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Внесені дані ({localData.length})</h3>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {localData.map((item, index) => (
                <motion.div
                  key={`${item.month}-${index}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                >
                  <div>
                    <span className="text-sm text-muted-foreground">{item.month}</span>
                    <p className="font-semibold">
                      {metric.unit === '₴' ? '₴' : ''}{item.value.toLocaleString()}{metric.unit === '%' ? '%' : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveDataPoint(index)}
                    className="w-8 h-8 rounded-lg hover:bg-destructive/20 text-destructive flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Тип графіка */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Тип графіка</h3>
          <div className="flex gap-2">
            {chartTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setChartType(type.id)}
                className={`flex-1 p-3 rounded-lg border transition-all ${
                  chartType === type.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <type.icon className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Прогноз */}
        <div className="space-y-3 p-4 rounded-lg bg-accent/30">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-foreground" />
            Прогнозування
          </h3>
          
          {localData.length < 6 && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <AlertCircle className="w-4 h-4 mt-0.5 text-warning" />
              <span>Для прогнозу потрібно мінімум 6 значень (зараз: {localData.length})</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Тип зміни</label>
              <select
                value={forecastParams.changeType}
                onChange={(e) => setForecastParams(prev => ({
                  ...prev,
                  changeType: e.target.value as 'increase' | 'decrease'
                }))}
                className="input-field"
              >
                <option value="increase">Збільшення</option>
                <option value="decrease">Зменшення</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Відсоток (%)</label>
              <input
                type="number"
                value={forecastParams.changePercent}
                onChange={(e) => setForecastParams(prev => ({
                  ...prev,
                  changePercent: parseFloat(e.target.value) || 0
                }))}
                placeholder="0"
                className="input-field"
                min="0"
                max="100"
              />
            </div>
          </div>

          <button
            onClick={handleBuildForecast}
            disabled={localData.length < 6}
            className="btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Побудувати прогноз (5 років)
          </button>
        </div>

        {/* Попередній перегляд графіка */}
        {localData.length >= 2 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Попередній перегляд</h3>
            <div className="h-48 bg-secondary/30 rounded-lg p-4">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'area' ? (
                  <AreaChart data={combinedData}>
                    <defs>
                      <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--accent-foreground))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--accent-foreground))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      fill="url(#colorActual)"
                    />
                  </AreaChart>
                ) : chartType === 'bar' ? (
                  <BarChart data={combinedData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : (
                  <LineChart data={combinedData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>

            {showForecast && forecastData.length > 0 && (
              <div className="p-3 rounded-lg bg-accent/20 text-sm">
                <p className="font-medium text-accent-foreground mb-2">Прогноз на 5 років:</p>
                <div className="flex flex-wrap gap-2">
                  {forecastData.map((f) => (
                    <span key={f.month} className="px-2 py-1 rounded bg-card text-xs">
                      {f.month}: {metric.unit === '₴' ? '₴' : ''}{f.value.toLocaleString()}{metric.unit === '%' ? '%' : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Кнопка побудови */}
        <button
          onClick={handleBuildChart}
          disabled={localData.length < 2}
          className="btn-success w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Побудувати графік
        </button>
      </div>
    </motion.div>
  );
};

export default MetricPanel;
