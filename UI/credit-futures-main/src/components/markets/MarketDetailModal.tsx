import { useState, useEffect } from 'react';
import { X, Star, TrendingUp, TrendingDown, Clock, BarChart3, Users, Calendar, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { KalshiMarket, MarketOrderbook } from '@/types/kalshi';
import { CATEGORY_CONFIG, formatTimeRemaining, formatVolume, getMarketOrderbook } from '@/services/kalshiService';
import { useAppStore } from '@/store/appStore';
import { useNavigate } from 'react-router-dom';

interface MarketDetailModalProps {
    market: KalshiMarket;
    onClose: () => void;
}

export const MarketDetailModal = ({ market, onClose }: MarketDetailModalProps) => {
    const navigate = useNavigate();
    const { savedMarkets, saveMarket, unsaveMarket, positions } = useAppStore();
    const [orderbook, setOrderbook] = useState<MarketOrderbook | null>(null);

    const isSaved = savedMarkets.some(m => m.ticker === market.ticker);
    const categoryConfig = CATEGORY_CONFIG[market.category];
    const priceChangePositive = market.yes_price_change_24h >= 0;

    // Find unconfigured positions
    const unconfiguredPositions = positions.filter(p => p.status === 'unconfigured');

    useEffect(() => {
        getMarketOrderbook(market.ticker).then(setOrderbook);
    }, [market.ticker]);

    const handleSaveToggle = () => {
        if (isSaved) {
            unsaveMarket(market.ticker);
        } else {
            saveMarket(market.ticker);
        }
    };

    const handleUseForPosition = () => {
        // Navigate to positions page with this market pre-selected
        navigate(`/terminal?market=${market.ticker}`);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-border p-6 flex items-start justify-between">
                    <div className="flex-1">
                        <span className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border mb-3',
                            categoryConfig.color
                        )}>
                            <span>{categoryConfig.icon}</span>
                            <span>{categoryConfig.label}</span>
                        </span>
                        <h2 className="text-xl font-bold text-foreground">{market.title}</h2>
                        <p className="text-sm text-muted-foreground mt-1">{market.subtitle}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-muted transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Current Prices */}
                    <div>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-3">CURRENT PRICES</h3>
                        <div className="flex gap-4">
                            <div className="flex-1 bg-emerald-50 rounded-xl p-4 text-center border border-emerald-200">
                                <div className="text-sm text-emerald-600 font-medium mb-1">YES</div>
                                <div className="text-3xl font-bold text-emerald-700">{market.yes_price}¢</div>
                                <div className="text-sm text-emerald-600 mt-1">({market.yes_price}% likely)</div>
                                {priceChangePositive && (
                                    <div className="flex items-center justify-center gap-1 mt-2 text-emerald-600">
                                        <TrendingUp className="w-4 h-4" />
                                        <span className="font-medium">+{market.yes_price_change_24h.toFixed(1)}%</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 bg-red-50 rounded-xl p-4 text-center border border-red-200">
                                <div className="text-sm text-red-600 font-medium mb-1">NO</div>
                                <div className="text-3xl font-bold text-red-700">{market.no_price}¢</div>
                                <div className="text-sm text-red-600 mt-1">({market.no_price}% likely)</div>
                                {!priceChangePositive && (
                                    <div className="flex items-center justify-center gap-1 mt-2 text-red-500">
                                        <TrendingDown className="w-4 h-4" />
                                        <span className="font-medium">{market.yes_price_change_24h.toFixed(1)}%</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Market Stats */}
                    <div>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-3">MARKET STATS</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <BarChart3 className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">24h Volume</div>
                                    <div className="font-semibold">{formatVolume(market.volume_24h)}</div>
                                </div>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Users className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">Open Interest</div>
                                    <div className="font-semibold">{market.open_interest.toLocaleString()}</div>
                                </div>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">Closes In</div>
                                    <div className="font-semibold">{formatTimeRemaining(market.close_date)}</div>
                                </div>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">Total Volume</div>
                                    <div className="font-semibold">{formatVolume(market.total_volume)}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Orderbook Preview */}
                    {orderbook && (
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground mb-3">ORDERBOOK</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-xs text-emerald-600 font-medium mb-2">YES Bids</div>
                                    {orderbook.yes_bids.map((bid, i) => (
                                        <div key={i} className="flex justify-between text-sm py-1 border-b border-border last:border-0">
                                            <span className="text-emerald-700 font-medium">{bid.price}¢</span>
                                            <span className="text-muted-foreground">{bid.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <div className="text-xs text-red-600 font-medium mb-2">NO Bids</div>
                                    {orderbook.no_bids.map((bid, i) => (
                                        <div key={i} className="flex justify-between text-sm py-1 border-b border-border last:border-0">
                                            <span className="text-red-700 font-medium">{bid.price}¢</span>
                                            <span className="text-muted-foreground">{bid.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Resolution Criteria */}
                    <div>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-3">RESOLUTION CRITERIA</h3>
                        <p className="text-sm text-foreground bg-muted/50 rounded-lg p-4">
                            {market.resolution_criteria}
                        </p>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="sticky bottom-0 bg-white border-t border-border p-6 flex gap-3">
                    <Button
                        variant="outline"
                        onClick={handleSaveToggle}
                        className="flex items-center gap-2"
                    >
                        <Star className={cn('w-4 h-4', isSaved && 'fill-amber-500 text-amber-500')} />
                        {isSaved ? 'Saved' : 'Save Market'}
                    </Button>

                    {unconfiguredPositions.length > 0 ? (
                        <Button
                            onClick={handleUseForPosition}
                            className="flex-1 flex items-center justify-center gap-2"
                        >
                            Use for Position
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    ) : (
                        <Button
                            onClick={() => navigate('/shop')}
                            className="flex-1 flex items-center justify-center gap-2"
                        >
                            Shop to Create Position
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
