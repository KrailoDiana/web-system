import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  DollarSign,
  Users,
  Target,
  Percent,
  Activity,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Home,
  Upload,
  Download,
  Settings,
} from 'lucide-react';

interface SidebarProps {
  onMetricSelect: (metricId: string) => void;
  selectedMetric: string | null;
}

const metricIcons: Record<string, React.ElementType> = {
  arr: DollarSign,
  mrr: DollarSign,
  churn: Percent,
  cac: Users,
  ltv: Target,
  nps: Activity,
  roi: TrendingUp,
  revenue: BarChart3,
};

const metricColors: Record<string, string> = {
  arr: 'bg-chart-1/10 text-chart-1',
  mrr: 'bg-chart-2/10 text-chart-2',
  churn: 'bg-chart-5/10 text-chart-5',
  cac: 'bg-chart-3/10 text-chart-3',
  ltv: 'bg-chart-4/10 text-chart-4',
  nps: 'bg-chart-6/10 text-chart-6',
  roi: 'bg-chart-2/10 text-chart-2',
  revenue: 'bg-chart-1/10 text-chart-1',
};

const metrics = [
  { id: 'arr', name: 'ARR', fullName: 'Annual Recurring Revenue' },
  { id: 'mrr', name: 'MRR', fullName: 'Monthly Recurring Revenue' },
  { id: 'churn', name: 'Churn', fullName: 'Churn Rate' },
  { id: 'cac', name: 'CAC', fullName: 'Customer Acquisition Cost' },
  { id: 'ltv', name: 'LTV', fullName: 'Customer Lifetime Value' },
  { id: 'nps', name: 'NPS', fullName: 'Net Promoter Score' },
  { id: 'roi', name: 'ROI', fullName: 'Return on Investment' },
  { id: 'revenue', name: 'Revenue', fullName: 'Total Revenue' },
];

const AppSidebar = ({ onMetricSelect, selectedMetric }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-screen bg-sidebar border-r border-sidebar-border flex flex-col sticky top-0"
    >
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary text-primary-foreground">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="font-bold text-foreground">Perfomia</h1>
                  <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                    {user?.name || user?.email}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-8 h-8 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-foreground" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        {/* Dashboard link */}
        <div className="mb-6">
          <button
            onClick={() => {
              onMetricSelect('');
              navigate('/dashboard');
            }}
            className={`sidebar-item w-full ${
              location.pathname === '/dashboard' && !selectedMetric ? 'active' : ''
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
              <Home className="w-5 h-5" />
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-medium"
                >
                  Дашборд
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Metrics section */}
        <div className="mb-2">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3"
              >
                Показники ефективності
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-1">
          {metrics.map((metric) => {
            const Icon = metricIcons[metric.id] || PieChart;
            const colorClass = metricColors[metric.id] || 'bg-secondary';
            
            return (
              <button
                key={metric.id}
                onClick={() => onMetricSelect(metric.id)}
                className={`sidebar-item w-full group ${
                  selectedMetric === metric.id ? 'active' : ''
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="flex-1 text-left overflow-hidden"
                    >
                      <p className="font-medium truncate">{metric.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {metric.fullName}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </div>

        {/* Data actions */}
        <div className="mt-6 pt-4 border-t border-sidebar-border">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3"
              >
                Дані
              </motion.p>
            )}
          </AnimatePresence>

          <div className="space-y-1">
            <button className="sidebar-item w-full">
              <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center">
                <Upload className="w-5 h-5 text-success" />
              </div>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Імпорт Excel
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <button className="sidebar-item w-full">
              <div className="w-9 h-9 rounded-lg bg-info/10 flex items-center justify-center">
                <Download className="w-5 h-5 text-info" />
              </div>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Експорт даних
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border">
        <button className="sidebar-item w-full mb-1">
          <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Налаштування
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <button 
          onClick={handleLogout}
          className="sidebar-item w-full text-destructive hover:bg-destructive/10"
        >
          <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center">
            <LogOut className="w-5 h-5" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Вийти
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
};

export default AppSidebar;
