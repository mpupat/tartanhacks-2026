import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <main className="container py-12 flex items-center justify-center min-h-[80vh]">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <AlertTriangle className="w-12 h-12 text-warning" />
          <span className="text-6xl font-bold mono-number text-warning">404</span>
        </div>
        <h1 className="text-xl font-bold tracking-widest mb-2">ROUTE NOT FOUND</h1>
        <p className="text-sm text-muted-foreground mb-6">
          THE REQUESTED ENDPOINT DOES NOT EXIST
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-profit text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-profit/80 transition-colors"
        >
          RETURN TO TERMINAL
        </Link>
      </div>
    </main>
  );
};

export default NotFound;
