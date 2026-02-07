import { useState, useEffect } from 'react';
import { positionService } from '@/services/positionService';
import { useXRPPrice } from '@/hooks/useXRPPrice';
import type { Position } from '@/types/positionTypes';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, X, Clock } from 'lucide-react';

export function PositionMonitor() {
    const { priceData } = useXRPPrice();
    const [positions, setPositions] = useState<Position[]>([]);

    useEffect(() => {
        const loadPositions = () => {
            setPositions(positionService.getActivePositions());
        };

        loadPositions();
        const unsubscribe = positionService.subscribe(loadPositions);
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (priceData.price > 0) {
            positionService.updatePriceAndCheckTriggers(priceData.price);
            setPositions(positionService.getActivePositions());
        }
    }, [priceData.price]);

    const handleClosePosition = (id: string) => {
        positionService.closePosition(id);
        setPositions(positionService.getActivePositions());
    };

    const getProgressPercent = (position: Position): number => {
        const progress = (position.pnlPercent / position.takeProfitPercent) * 100;
        return Math.max(-100, Math.min(100, progress));
    };

    if (positions.length === 0) {
        return (
            <div className="bg-white/5 rounded-2xl p-6 border border-amber-500/10">
                <h3 className="text-lg font-semibold mb-4 text-amber-400">Active Predictions</h3>
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-amber-500/50" />
                    </div>
                    <p className="text-white/50 mb-2">No active predictions</p>
                    <p className="text-white/30 text-sm">Make a prediction to get started</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white/5 rounded-2xl p-6 border border-amber-500/10">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-amber-400">Active Predictions</h3>
                <span className="text-sm text-white/50">{positions.length} open</span>
            </div>

            <div className="space-y-4">
                {positions.map((position) => {
                    const isProfitable = position.pnl >= 0;
                    const progress = getProgressPercent(position);

                    return (
                        <div
                            key={position.id}
                            className="bg-white/5 rounded-xl p-4 border border-white/5"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    {position.type === 'long' ? (
                                        <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                                            <TrendingDown className="w-4 h-4 text-red-400" />
                                        </div>
                                    )}
                                    <div>
                                        <div className="font-medium">
                                            {position.type === 'long' ? 'Predicting Up' : 'Predicting Down'}
                                        </div>
                                        <div className="text-xs text-white/50">
                                            ${position.amount} at stake
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-8 h-8 text-white/50 hover:text-white hover:bg-white/10"
                                    onClick={() => handleClosePosition(position.id)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* P&L */}
                            <div className={`text-2xl font-bold mb-3 ${isProfitable ? 'text-emerald-400' : 'text-red-400'}`}>
                                {isProfitable ? '+' : ''}{position.pnlPercent.toFixed(2)}%
                                <span className="text-sm font-normal ml-2">
                                    (${position.pnl >= 0 ? '+' : ''}{position.pnl.toFixed(2)})
                                </span>
                            </div>

                            {/* Progress bar */}
                            <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className={`absolute top-0 h-full rounded-full transition-all ${progress >= 0 ? 'bg-emerald-500 left-1/2' : 'bg-red-500 right-1/2'
                                        }`}
                                    style={{
                                        width: `${Math.abs(progress) / 2}%`,
                                        [progress >= 0 ? 'left' : 'right']: '50%',
                                    }}
                                />
                                <div className="absolute top-0 left-1/2 w-0.5 h-full bg-amber-500/50" />
                            </div>

                            {/* Labels */}
                            <div className="flex justify-between text-xs mt-2 text-white/40">
                                <span className="text-red-400/60">-{position.stopLossPercent}%</span>
                                <span className="text-amber-400/60">Entry: ${position.entryPrice.toFixed(4)}</span>
                                <span className="text-emerald-400/60">+{position.takeProfitPercent}%</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
