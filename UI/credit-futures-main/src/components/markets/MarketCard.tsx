import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Star, TrendingUp, TrendingDown, Clock, ExternalLink } from 'lucide-react';
import type { KalshiMarket } from '@/types/kalshi';
import { CATEGORY_CONFIG, formatTimeRemaining, formatVolume } from '@/services/kalshiService';
import { useAppStore } from '@/store/appStore';

interface MarketCardProps {
    market: KalshiMarket;
    onViewDetails: (market: KalshiMarket) => void;
}

export const MarketCard = ({ market, onViewDetails }: MarketCardProps) => {
    const { savedMarkets, saveMarket, unsaveMarket } = useAppStore();
    const isSaved = savedMarkets.some(m => m.ticker === market.ticker);

    const categoryConfig = CATEGORY_CONFIG[market.category];
    const priceChangePositive = market.yes_price_change_24h >= 0;

    const handleSaveToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isSaved) {
            unsaveMarket(market.ticker);
        } else {
            saveMarket(market.ticker);
        }
    };

    return (
        <div
            className="bg-white rounded-xl border border-border p-5 shadow-card hover:shadow-card-hover hover:border-primary/30 transition-all duration-200 cursor-pointer group"
            onClick={() => onViewDetails(market)}
        >
            {/* Header with category */}
            <div className="flex items-start justify-between mb-3">
                <span className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
                    categoryConfig.color
                )}>
                    <span>{categoryConfig.icon}</span>
                    <span>{categoryConfig.label}</span>
                </span>

                <button
                    onClick={handleSaveToggle}
                    className={cn(
                        'p-1.5 rounded-full transition-colors',
                        isSaved
                            ? 'text-amber-500 bg-amber-50'
                            : 'text-muted-foreground hover:text-amber-500 hover:bg-amber-50'
                    )}
                >
                    <Star className={cn('w-4 h-4', isSaved && 'fill-current')} />
                </button>
            </div>

            {/* Title */}
            <h3 className="font-semibold text-foreground mb-4 line-clamp-2 group-hover:text-primary transition-colors">
                {market.title}
            </h3>

            {/* Prices */}
            <div className="flex gap-3 mb-4">
                <div className="flex-1 bg-emerald-50 rounded-lg p-3 text-center border border-emerald-200">
                    <div className="text-xs text-emerald-600 font-medium mb-1">YES</div>
                    <div className="text-lg font-bold text-emerald-700">{market.yes_price}¢</div>
                </div>
                <div className="flex-1 bg-red-50 rounded-lg p-3 text-center border border-red-200">
                    <div className="text-xs text-red-600 font-medium mb-1">NO</div>
                    <div className="text-lg font-bold text-red-700">{market.no_price}¢</div>
                </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center justify-between text-sm">
                {/* 24h Change */}
                <div className={cn(
                    'flex items-center gap-1 font-medium',
                    priceChangePositive ? 'text-emerald-600' : 'text-red-500'
                )}>
                    {priceChangePositive ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                        <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    <span>
                        {priceChangePositive ? '+' : ''}{market.yes_price_change_24h.toFixed(1)}%
                    </span>
                </div>

                {/* Volume */}
                <div className="text-muted-foreground">
                    {formatVolume(market.volume_24h)}
                </div>

                {/* Time remaining */}
                <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatTimeRemaining(market.close_date)}</span>
                </div>
            </div>

            {/* View Details hint */}
            <div className="mt-4 pt-4 border-t border-border flex items-center justify-center gap-2 text-sm text-muted-foreground group-hover:text-primary transition-colors">
                <ExternalLink className="w-4 h-4" />
                <span>View Details</span>
            </div>
        </div>
    );
};
