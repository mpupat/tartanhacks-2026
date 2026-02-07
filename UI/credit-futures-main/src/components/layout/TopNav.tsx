import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Wallet, Store, Compass, TrendingUp, History, Link2 } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';

const navLinks = [
  { path: '/bank', label: 'Dashboard', icon: Wallet },
  { path: '/shop', label: 'Shop', icon: Store },
  { path: '/explorer', label: 'Explorer', icon: Compass },
  { path: '/terminal', label: 'Positions', icon: TrendingUp },
  { path: '/history', label: 'History', icon: History },
  { path: '/blockchain', label: 'Blockchain', icon: Link2 },
];

export const TopNav = () => {
  const location = useLocation();
  const cart = useAppStore((state) => state.cart);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-border shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">W</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Winback
          </span>
        </Link>

        {/* Navigation - Center */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Cart */}
        <Link
          to="/cart"
          className="relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
        >
          <ShoppingCart className="w-5 h-5" />
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
              {cartItemCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
};
