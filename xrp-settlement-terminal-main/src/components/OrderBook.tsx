// Order Book Component - Live bid/ask display

import { useOrderBook } from '@/hooks/useOrderBook';
import { Loader2 } from 'lucide-react';

interface OrderBookProps {
    onPriceClick?: (price: number) => void;
}

export function OrderBook({ onPriceClick }: OrderBookProps) {
    const { bids, asks, spread, midPrice, isLoading, error } = useOrderBook();

    const maxTotal = Math.max(
        ...bids.map(b => b.total),
        ...asks.map(a => a.total),
        1
    );

    if (error) {
        return (
            <div className="terminal-grid p-4">
                <span className="terminal-header text-xs mb-2 block">ORDER BOOK</span>
                <p className="text-destructive text-sm">{error}</p>
            </div>
        );
    }

    return (
        <div className="terminal-grid p-4">
            <div className="flex items-center justify-between mb-3">
                <span className="terminal-header text-xs">ORDER BOOK</span>
                {isLoading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
            </div>

            {/* Asks (sells) - reversed so lowest is at bottom */}
            <div className="space-y-1 mb-2">
                <div className="grid grid-cols-3 text-2xs text-muted-foreground pb-1 border-b border-border-subtle">
                    <span>PRICE (USD)</span>
                    <span className="text-right">AMOUNT (XRP)</span>
                    <span className="text-right">TOTAL</span>
                </div>
                {asks.slice(0, 8).reverse().map((ask, i) => (
                    <div
                        key={`ask-${i}`}
                        className="grid grid-cols-3 text-xs relative cursor-pointer hover:bg-destructive/10 transition-colors"
                        onClick={() => onPriceClick?.(ask.price)}
                    >
                        <div
                            className="absolute inset-0 bg-destructive/20"
                            style={{ width: `${(ask.total / maxTotal) * 100}%`, right: 0, left: 'auto' }}
                        />
                        <span className="text-destructive relative z-10">${ask.price.toFixed(6)}</span>
                        <span className="text-right relative z-10">{ask.amount.toFixed(2)}</span>
                        <span className="text-right text-muted-foreground relative z-10">
                            ${ask.total.toFixed(2)}
                        </span>
                    </div>
                ))}
            </div>

            {/* Spread indicator */}
            <div className="py-2 px-2 bg-card/50 rounded text-center text-xs border border-border-subtle my-2">
                <span className="text-muted-foreground">SPREAD: </span>
                <span className="text-foreground font-mono">${spread.toFixed(6)}</span>
                <span className="text-muted-foreground ml-3">MID: </span>
                <span className="text-success font-mono">${midPrice.toFixed(6)}</span>
            </div>

            {/* Bids (buys) */}
            <div className="space-y-1">
                {bids.slice(0, 8).map((bid, i) => (
                    <div
                        key={`bid-${i}`}
                        className="grid grid-cols-3 text-xs relative cursor-pointer hover:bg-success/10 transition-colors"
                        onClick={() => onPriceClick?.(bid.price)}
                    >
                        <div
                            className="absolute inset-0 bg-success/20"
                            style={{ width: `${(bid.total / maxTotal) * 100}%`, right: 0, left: 'auto' }}
                        />
                        <span className="text-success relative z-10">${bid.price.toFixed(6)}</span>
                        <span className="text-right relative z-10">{bid.amount.toFixed(2)}</span>
                        <span className="text-right text-muted-foreground relative z-10">
                            ${bid.total.toFixed(2)}
                        </span>
                    </div>
                ))}
            </div>

            {bids.length === 0 && asks.length === 0 && !isLoading && (
                <p className="text-center text-muted-foreground text-sm py-4">
                    No orders in order book
                </p>
            )}
        </div>
    );
}
