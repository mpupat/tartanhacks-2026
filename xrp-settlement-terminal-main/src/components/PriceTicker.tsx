import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PriceTickerProps {
  price: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  hasUpdated: boolean;
}

export function PriceTicker({
  price,
  change24h,
  changePercent24h,
  high24h,
  low24h,
  volume24h,
  hasUpdated,
}: PriceTickerProps) {
  const isPositive = change24h >= 0;

  return (
    <div className="terminal-grid p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <span className="text-foreground font-bold text-sm">X</span>
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">XRP/USD</h2>
            <span className="terminal-header">RIPPLE</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Activity className="w-3 h-3 text-success animate-pulse" />
          <span className="text-2xs text-success uppercase">Live</span>
        </div>
      </div>

      <div className="flex items-baseline gap-4 mb-4">
        <span
          className={cn(
            "text-4xl font-bold terminal-value transition-all",
            isPositive ? "text-success" : "text-destructive",
            hasUpdated && "blink"
          )}
        >
          ${price.toFixed(6)}
        </span>
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 rounded text-sm font-semibold",
          isPositive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
        )}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span>{isPositive ? '+' : ''}{changePercent24h.toFixed(2)}%</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 border-t border-border-subtle pt-3">
        <div>
          <span className="terminal-header block mb-1">24H CHANGE</span>
          <span className={cn(
            "terminal-value text-sm",
            isPositive ? "text-success" : "text-destructive"
          )}>
            {isPositive ? '+' : ''}${change24h.toFixed(6)}
          </span>
        </div>
        <div>
          <span className="terminal-header block mb-1">24H HIGH</span>
          <span className="terminal-value text-sm text-foreground">${high24h.toFixed(6)}</span>
        </div>
        <div>
          <span className="terminal-header block mb-1">24H LOW</span>
          <span className="terminal-value text-sm text-foreground">${low24h.toFixed(6)}</span>
        </div>
        <div>
          <span className="terminal-header block mb-1">24H VOLUME</span>
          <span className="terminal-value text-sm text-foreground">
            ${(volume24h / 1_000_000).toFixed(2)}M
          </span>
        </div>
      </div>
    </div>
  );
}