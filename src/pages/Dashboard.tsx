import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppSidebar from '@/components/AppSidebar';
import DashboardContent from '@/components/DashboardContent';
import MetricPanel from '@/components/MetricPanel';
import ExcelHandler from '@/components/ExcelHandler';
import { useAuth } from '@/contexts/AuthContext';
import { MetricsProvider } from '@/contexts/MetricsContext';
import { Navigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';

const DashboardLayout = () => {
  const { isAuthenticated } = useAuth();
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const today = new Date().toLocaleDateString('uk-UA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <MetricsProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar 
          onMetricSelect={setSelectedMetric} 
          selectedMetric={selectedMetric}
        />
        
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {selectedMetric ? 'Налаштування показника' : 'Дашборд'}
                </h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Calendar className="w-4 h-4" />
                  <span className="capitalize">{today}</span>
                </div>
              </div>
              
              <ExcelHandler />
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <AnimatePresence mode="wait">
                {selectedMetric ? (
                  <motion.div
                    key="metric-panel"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MetricPanel 
                      metricId={selectedMetric} 
                      onClose={() => setSelectedMetric(null)}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <DashboardContent />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
    </MetricsProvider>
  );
};

export default DashboardLayout;
