import { useState, useEffect } from 'react';
import { positionService } from '@/services/positionService';
import { useXRPPrice } from '@/hooks/useXRPPrice';
import type { Position } from '@/types/positionTypes';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, X, Target, ShieldX } from 'lucide-react';

export function PositionMonitor() {
    const { priceData } = useXRPPrice();
    const [positions, setPositions] = useState<Position[]>([]);

    // Load positions and subscribe to changes
    useEffect(() => {
        const loadPositions = () => {
            setPositions(positionService.getActivePositions());
        };

        loadPositions();
        const unsubscribe = positionService.subscribe(loadPositions);
        return () => unsubscribe();
    }, []);

    // Update positions with current price
    useEffect(() => {
        if (priceData.price > 0) {
            const closedPositions = positionService.updatePriceAndCheckTriggers(priceData.price);
            if (closedPositions.length > 0) {
                // Show notification for closed positions
                closedPositions.forEach(pos => {
                    console.log(`Position ${pos.id} closed: ${pos.closeReason}, P&L: $${pos.pnl.toFixed(2)}`);
                });
            }
            setPositions(positionService.getActivePositions());
        }
    }, [priceData.price]);

    const handleClosePosition = (id: string) => {
        positionService.closePosition(id);
        setPositions(positionService.getActivePositions());
    };

    // Calculate progress towards triggers
    const getProgress = (position: Position): { profit: number; loss: number } => {
        const pnlPercent = position.pnlPercent;
        const profitProgress = Math.max(0, Math.min(100, (pnlPercent / position.takeProfitPercent) * 100));
        const lossProgress = Math.max(0, Math.min(100, (-pnlPercent / position.stopLossPercent) * 100));
        return { profit: profitProgress, loss: lossProgress };
    };

    if (positions.length === 0) {
        return (
            <div className="terminal-grid p-4">
                <div className="flex items-center justify-between mb-3">
                    <span className="terminal-header text-xs">ACTIVE POSITIONS</span>
                </div>
                <div className="text-center text-muted-foreground py-8">
                    <p className="text-sm mb-2">No active positions</p>
                    <p className="text-2xs">Open a long or short position to get started</p>
                </div>
            </div>
        );
    }

    return (
        <div className="terminal-grid p-4">
            <div className="flex items-center justify-between mb-3">
                <span className="terminal-header text-xs">ACTIVE POSITIONS</span>
                <span className="text-2xs text-muted-foreground">{positions.length} OPEN</span>
            </div>

            <div className="space-y-3">
                {positions.map((position) => {
                    const progress = getProgress(position);
                    const isProfitable = position.pnl >= 0;

                    return (
                        <div
                            key={position.id}
                            className="p-3 bg-card/50 rounded border border-border-subtle"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    {position.type === 'long' ? (
                                        <TrendingUp className="w-4 h-4 text-success" />
                                    ) : (
                                        <TrendingDown className="w-4 h-4 text-destructive" />
                                    )}
                                    <span className="font-semibold text-sm">
                                        {position.type.toUpperCase()} ${position.amount}
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-6 h-6"
                                    onClick={() => handleClosePosition(position.id)}
                                >
                                    <X className="w-3 h-3" />
                                </Button>
                            </div>

                            {/* Entry and Current Price */}
                            <div className="grid grid-cols-2 gap-2 text-2xs mb-3">
                                <div>
                                    <span className="text-muted-foreground">Entry:</span>
                                    <span className="ml-1 font-mono">${position.entryPrice.toFixed(4)}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Current:</span>
                                    <span className="ml-1 font-mono">${position.currentPrice.toFixed(4)}</span>
                                </div>
                            </div>

                            {/* P&L */}
                            <div className={`text-center py-2 rounded mb-3 ${isProfitable ? 'bg-success/10' : 'bg-destructive/10'}`}>
                                <span className={`text-lg font-bold ${isProfitable ? 'text-success' : 'text-destructive'}`}>
                                    {isProfitable ? '+' : ''}{position.pnlPercent.toFixed(2)}%
                                </span>
                                <span className={`ml-2 text-sm ${isProfitable ? 'text-success' : 'text-destructive'}`}>
                                    (${position.pnl >= 0 ? '+' : ''}{position.pnl.toFixed(2)})
                                </span>
                            </div>

                            {/* Take Profit Progress */}
                            <div className="space-y-1 mb-2">
                                <div className="flex items-center justify-between text-2xs">
                                    <span className="flex items-center gap-1 text-success">
                                        <Target className="w-3 h-3" />
                                        Take Profit +{position.takeProfitPercent}%
                                    </span>
                                    <span>{progress.profit.toFixed(0)}%</span>
                                </div>
                                <Progress value={progress.profit} className="h-1.5 bg-muted" />
                            </div>

                            {/* Stop Loss Progress */}
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-2xs">
                                    <span className="flex items-center gap-1 text-destructive">
                                        <ShieldX className="w-3 h-3" />
                                        Stop Loss -{position.stopLossPercent}%
                                    </span>
                                    <span>{progress.loss.toFixed(0)}%</span>
                                </div>
                                <Progress value={progress.loss} className="h-1.5 bg-muted" />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
