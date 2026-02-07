import { motion } from 'framer-motion';
import { useXrpPrice } from '@/hooks/useXrpPrice';
import { cn } from '@/lib/utils';

export const XrpTicker = () => {
  const { price, change24h, priceDirection } = useXrpPrice();

  return (
    <div className="border border-grid-line bg-card p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
            XRP/USD SPOT
          </div>
          <motion.div
            key={price}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            className={cn(
              'text-3xl font-bold mono-number',
              priceDirection === 'up' && 'text-profit neon-green',
              priceDirection === 'down' && 'text-loss neon-red',
              priceDirection === 'same' && 'text-foreground'
            )}
          >
            ${price.toFixed(6)}
          </motion.div>
        </div>

        <div className="text-right">
          <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
            24H CHANGE
          </div>
          <div
            className={cn(
              'text-xl font-bold mono-number',
              change24h >= 0 ? 'text-profit' : 'text-loss'
            )}
          >
            {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
            24H VOLUME
          </div>
          <div className="text-xl font-bold mono-number text-foreground">
            $847.2M
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={cn(
              'w-3 h-3 rounded-full',
              priceDirection === 'up' && 'bg-profit blink',
              priceDirection === 'down' && 'bg-loss blink',
              priceDirection === 'same' && 'bg-muted-foreground'
            )}
          />
          <span className="text-xs text-muted-foreground uppercase">LIVE</span>
        </div>
      </div>
    </div>
  );
};
