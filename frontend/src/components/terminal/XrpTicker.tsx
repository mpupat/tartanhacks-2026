import { motion } from 'framer-motion';
import { useXrpPrice } from '@/hooks/useXrpPrice';
import { cn } from '@/lib/utils';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';

export const XrpTicker = () => {
  const { price, change24h, priceDirection } = useXrpPrice();

  return (
    <div className="bg-white rounded-xl border border-border p-5 shadow-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Asset Icon */}
          <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold">XRP</span>
          </div>

          {/* Price */}
          <div>
            <div className="text-sm text-muted-foreground mb-1">
              XRP/USD Spot
            </div>
            <motion.div
              key={price}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              className={cn(
                'text-2xl font-bold mono-number',
                priceDirection === 'up' && 'text-emerald-600',
                priceDirection === 'down' && 'text-red-500',
                priceDirection === 'same' && 'text-foreground'
              )}
            >
              ${price.toFixed(6)}
            </motion.div>
          </div>
        </div>

        {/* 24H Change */}
        <div className="text-right">
          <div className="text-sm text-muted-foreground mb-1">
            24h Change
          </div>
          <div
            className={cn(
              'text-lg font-bold mono-number flex items-center justify-end gap-1',
              change24h >= 0 ? 'text-emerald-600' : 'text-red-500'
            )}
          >
            {change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
          </div>
        </div>

        {/* Volume */}
        <div className="text-right">
          <div className="text-sm text-muted-foreground mb-1">
            24h Volume
          </div>
          <div className="text-lg font-bold mono-number text-foreground">
            $847.2M
          </div>
        </div>

        {/* Live Indicator */}
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-200">
          <div
            className={cn(
              'w-2 h-2 rounded-full',
              priceDirection === 'up' && 'bg-emerald-500',
              priceDirection === 'down' && 'bg-red-500',
              priceDirection === 'same' && 'bg-muted-foreground'
            )}
            style={{ animation: 'pulse 2s infinite' }}
          />
          <span className="text-xs font-medium text-emerald-700">Live</span>
        </div>
      </div>
    </div>
  );
};
