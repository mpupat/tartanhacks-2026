import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/appStore';
import { ShoppingCart } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'BANK', path: '/bank' },
  { label: 'SHOP', path: '/shop' },
  { label: 'TERMINAL', path: '/terminal' },
  { label: 'HISTORY', path: '/history' },
];

export const TopNav = () => {
  const location = useLocation();
  const { cart } = useAppStore();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="border-b border-grid-line bg-background sticky top-0 z-50">
      <div className="container flex items-center justify-between h-12">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-2 h-2 bg-profit rounded-full pulse-glow" />
          <span className="text-sm font-bold tracking-widest text-profit">
            CRYPTO TOMORROW
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'px-4 py-3 text-xs font-semibold tracking-wider transition-colors',
                'border-b-2 -mb-[1px]',
                location.pathname === item.path
                  ? 'text-profit border-profit neon-green'
                  : 'text-muted-foreground border-transparent hover:text-foreground hover:border-muted-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Cart */}
        <Link
          to="/shop/cart"
          className="relative flex items-center gap-2 px-3 py-2 text-xs font-semibold tracking-wider text-muted-foreground hover:text-foreground transition-colors"
        >
          <ShoppingCart className="w-4 h-4" />
          {cartCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-profit text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
};
