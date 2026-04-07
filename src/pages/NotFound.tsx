import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, BarChart3, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="w-20 h-20 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-warning" />
        </div>
        
        <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Сторінку не знайдено. Можливо, вона була переміщена або видалена.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-primary">
            <Home className="w-4 h-4 mr-2" />
            На головну
          </Link>
          <Link to="/dashboard" className="btn-secondary">
            <BarChart3 className="w-4 h-4 mr-2" />
            До дашборду
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
