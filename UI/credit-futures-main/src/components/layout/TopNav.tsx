import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/appStore';
import { ShoppingCart } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/bank' },
  { label: 'Store', path: '/shop' },
  { label: 'Positions', path: '/terminal' },
  { label: 'History', path: '/history' },
];

export const TopNav = () => {
  const location = useLocation();
  const { cart } = useAppStore();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="border-b border-border bg-white sticky top-0 z-50 shadow-sm">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">W</span>
          </div>
          <span className="text-lg font-bold text-foreground">
            Winback
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                location.pathname === item.path
                  ? 'text-primary bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Cart */}
        <Link
          to="/shop/cart"
          className="relative flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
        >
          <ShoppingCart className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
};
