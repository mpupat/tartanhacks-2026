import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { positionService } from '@/services/positionService';
import { useXRPPrice } from '@/hooks/useXRPPrice';
import { TrendingUp, TrendingDown, AlertTriangle, Target, ShieldX } from 'lucide-react';
import type { PositionType } from '@/types/positionTypes';

interface PositionFormProps {
    onPositionCreated?: () => void;
}

export function PositionForm({ onPositionCreated }: PositionFormProps) {
    const { priceData } = useXRPPrice();
    const [positionType, setPositionType] = useState<PositionType>('long');
    const [amount, setAmount] = useState('100');
    const [takeProfitPercent, setTakeProfitPercent] = useState(5);
    const [stopLossPercent, setStopLossPercent] = useState(3);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentPrice = priceData.price;
    const amountNum = parseFloat(amount) || 0;

    // Calculate potential outcomes
    const potentialProfit = (takeProfitPercent / 100) * amountNum;
    const potentialLoss = (stopLossPercent / 100) * amountNum;

    // Calculate trigger prices
    const takeProfitPrice = positionType === 'long'
        ? currentPrice * (1 + takeProfitPercent / 100)
        : currentPrice * (1 - takeProfitPercent / 100);

    const stopLossPrice = positionType === 'long'
        ? currentPrice * (1 - stopLossPercent / 100)
        : currentPrice * (1 + stopLossPercent / 100);

    const handleSubmit = async () => {
        if (amountNum <= 0) return;

        setIsSubmitting(true);
        try {
            positionService.createPosition(
                {
                    type: positionType,
                    amount: amountNum,
                    takeProfitPercent,
                    stopLossPercent,
                },
                currentPrice
            );

            // Reset form
            setAmount('100');
            setTakeProfitPercent(5);
            setStopLossPercent(3);

            onPositionCreated?.();
        } catch (error) {
            console.error('Failed to create position:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="terminal-grid p-4">
            <div className="flex items-center justify-between mb-4">
                <span className="terminal-header text-xs">OPEN POSITION</span>
                <span className="text-sm font-mono">${currentPrice.toFixed(4)}</span>
            </div>

            {/* Position Type Tabs */}
            <div className="grid grid-cols-2 gap-2 mb-4">
                <Button
                    variant={positionType === 'long' ? 'default' : 'outline'}
                    className={`${positionType === 'long' ? 'bg-success hover:bg-success/90 text-success-foreground' : ''}`}
                    onClick={() => setPositionType('long')}
                >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    LONG
                </Button>
                <Button
                    variant={positionType === 'short' ? 'default' : 'outline'}
                    className={`${positionType === 'short' ? 'bg-destructive hover:bg-destructive/90' : ''}`}
                    onClick={() => setPositionType('short')}
                >
                    <TrendingDown className="w-4 h-4 mr-2" />
                    SHORT
                </Button>
            </div>

            {/* Position Description */}
            <div className="text-xs text-muted-foreground mb-4 p-2 bg-card/50 rounded">
                {positionType === 'long' ? (
                    <span>You profit when XRP price <span className="text-success">goes UP</span></span>
                ) : (
                    <span>You profit when XRP price <span className="text-destructive">goes DOWN</span></span>
                )}
            </div>

            {/* Amount Input */}
            <div className="space-y-2 mb-4">
                <Label className="text-xs text-muted-foreground">AMOUNT (USD)</Label>
                <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="100"
                    className="font-mono"
                />
            </div>

            {/* Take Profit Slider */}
            <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                        <Target className="w-3 h-3 text-success" />
                        TAKE PROFIT
                    </Label>
                    <span className="text-success text-sm font-mono">+{takeProfitPercent}%</span>
                </div>
                <Slider
                    value={[takeProfitPercent]}
                    onValueChange={([value]) => setTakeProfitPercent(value)}
                    min={1}
                    max={20}
                    step={0.5}
                    className="w-full"
                />
                <div className="flex justify-between text-2xs text-muted-foreground">
                    <span>Trigger: ${takeProfitPrice.toFixed(4)}</span>
                    <span className="text-success">+${potentialProfit.toFixed(2)}</span>
                </div>
            </div>

            {/* Stop Loss Slider */}
            <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                        <ShieldX className="w-3 h-3 text-destructive" />
                        STOP LOSS
                    </Label>
                    <span className="text-destructive text-sm font-mono">-{stopLossPercent}%</span>
                </div>
                <Slider
                    value={[stopLossPercent]}
                    onValueChange={([value]) => setStopLossPercent(value)}
                    min={1}
                    max={15}
                    step={0.5}
                    className="w-full"
                />
                <div className="flex justify-between text-2xs text-muted-foreground">
                    <span>Trigger: ${stopLossPrice.toFixed(4)}</span>
                    <span className="text-destructive">-${potentialLoss.toFixed(2)}</span>
                </div>
            </div>

            {/* Risk/Reward Summary */}
            <div className="p-3 bg-card/50 rounded mb-4">
                <div className="flex justify-between text-xs mb-2">
                    <span className="text-muted-foreground">Risk/Reward Ratio</span>
                    <span className="font-mono">
                        1:{(takeProfitPercent / stopLossPercent).toFixed(2)}
                    </span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Max{positionType === 'long' ? ' Savings' : ' Loss'}</span>
                    <span className={positionType === 'long' ? 'text-success' : 'text-destructive'}>
                        ${potentialProfit.toFixed(2)}
                    </span>
                </div>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-2 text-2xs text-warning mb-4 p-2 bg-warning/5 rounded">
                <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                <span>
                    This position affects your monthly credit card bill. Profit reduces your bill, loss increases it.
                </span>
            </div>

            {/* Submit Button */}
            <Button
                onClick={handleSubmit}
                disabled={amountNum <= 0 || isSubmitting}
                className={`w-full ${positionType === 'long' ? 'bg-success hover:bg-success/90' : 'bg-destructive hover:bg-destructive/90'}`}
            >
                {isSubmitting ? 'OPENING...' : `OPEN ${positionType.toUpperCase()} POSITION`}
            </Button>
        </div>
    );
}
