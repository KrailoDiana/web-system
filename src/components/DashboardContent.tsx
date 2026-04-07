import { motion } from 'framer-motion';
import { useMetrics } from '@/contexts/MetricsContext';
import { BarChart3, TrendingUp, Plus, X } from 'lucide-react';
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

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="empty-state h-[60vh]"
  >
    <div className="empty-state-icon">
      <BarChart3 className="w-10 h-10 text-muted-foreground" />
    </div>
    <h3 className="text-xl font-semibold text-foreground mb-2">
      Дашборд поки порожній
    </h3>
    <p className="text-muted-foreground max-w-md mb-6">
      Оберіть показник у боковій панелі, введіть дані та натисніть "Побудувати графік", 
      щоб додати його на дашборд.
    </p>
    <div className="flex items-center gap-2 text-primary">
      <TrendingUp className="w-5 h-5" />
      <span className="text-sm font-medium">Почніть з ARR або MRR</span>
    </div>
  </motion.div>
);

const chartColors = [
  'hsl(187, 70%, 45%)',
  'hsl(152, 60%, 45%)',
  'hsl(250, 60%, 55%)',
  'hsl(38, 92%, 50%)',
  'hsl(340, 65%, 55%)',
  'hsl(210, 80%, 55%)',
];

const DashboardContent = () => {
  const { dashboardCharts, removeChartFromDashboard, metrics } = useMetrics();

  if (dashboardCharts.length === 0) {
    return <EmptyState />;
  }

  const renderChart = (chart: typeof dashboardCharts[0], index: number) => {
    const metric = metrics.find(m => m.id === chart.metricId);
    const color = chartColors[index % chartColors.length];
    const forecastColor = 'hsl(250, 60%, 55%)';
    
    // Об'єднуємо дані з прогнозом
    const combinedData = [
      ...chart.data.map(d => ({ ...d, isForecast: false })),
      ...(chart.forecast || []).map(d => ({ ...d, isForecast: true })),
    ];

    return (
      <motion.div
        key={chart.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="chart-container relative"
      >
        <button
          onClick={() => removeChartFromDashboard(chart.id)}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-secondary hover:bg-destructive/20 hover:text-destructive flex items-center justify-center transition-all z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">{chart.metricName}</h3>
          <p className="text-sm text-muted-foreground">
            {metric?.description} {chart.forecast?.length ? '• З прогнозом' : ''}
          </p>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            {chart.type === 'area' ? (
              <AreaChart data={combinedData}>
                <defs>
                  <linearGradient id={`gradient-${chart.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id={`gradient-forecast-${chart.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={forecastColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={forecastColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  strokeWidth={2}
                  fill={`url(#gradient-${chart.id})`}
                />
              </AreaChart>
            ) : chart.type === 'bar' ? (
              <BarChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill={color}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            ) : (
              <LineChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Дані"
                  stroke={color}
                  strokeWidth={2}
                  dot={{ fill: color, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Ваш дашборд</h2>
          <p className="text-muted-foreground">
            {dashboardCharts.length} {dashboardCharts.length === 1 ? 'графік' : 'графіків'} додано
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {dashboardCharts.map((chart, index) => renderChart(chart, index))}
      </div>
    </div>
  );
};

export default DashboardContent;
