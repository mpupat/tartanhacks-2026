import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { positionService } from '@/services/positionService';
import { useXRPPrice } from '@/hooks/useXRPPrice';
import { TrendingUp, TrendingDown, Info } from 'lucide-react';
import type { PositionType } from '@/types/positionTypes';

interface PositionFormProps {
    onPositionCreated?: () => void;
}

export function PositionForm({ onPositionCreated }: PositionFormProps) {
    const { priceData } = useXRPPrice();
    const [positionType, setPositionType] = useState<PositionType>('long');
    const [amount, setAmount] = useState(100);
    const [takeProfitPercent, setTakeProfitPercent] = useState(5);
    const [stopLossPercent, setStopLossPercent] = useState(3);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentPrice = priceData.price;
    const potentialProfit = (takeProfitPercent / 100) * amount;
    const potentialLoss = (stopLossPercent / 100) * amount;

    const handleSubmit = async () => {
        if (amount <= 0) return;

        setIsSubmitting(true);
        try {
            positionService.createPosition(
                {
                    type: positionType,
                    amount,
                    takeProfitPercent,
                    stopLossPercent,
                },
                currentPrice
            );
            setAmount(100);
            onPositionCreated?.();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white/5 rounded-2xl p-6 border border-amber-500/10">
            <h3 className="text-lg font-semibold mb-6 text-amber-400">Make a Prediction</h3>

            {/* Position Type */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                    onClick={() => setPositionType('long')}
                    className={`p-4 rounded-xl border transition-all ${positionType === 'long'
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                            : 'bg-white/5 border-white/10 text-white/70 hover:border-amber-500/30'
                        }`}
                >
                    <TrendingUp className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">XRP Goes Up</div>
                    <div className="text-xs opacity-60 mt-1">Bullish</div>
                </button>
                <button
                    onClick={() => setPositionType('short')}
                    className={`p-4 rounded-xl border transition-all ${positionType === 'short'
                            ? 'bg-red-500/20 border-red-500/50 text-red-400'
                            : 'bg-white/5 border-white/10 text-white/70 hover:border-amber-500/30'
                        }`}
                >
                    <TrendingDown className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">XRP Goes Down</div>
                    <div className="text-xs opacity-60 mt-1">Bearish</div>
                </button>
            </div>

            {/* Amount */}
            <div className="mb-6">
                <label className="text-sm text-white/50 mb-3 block">Amount at stake</label>
                <div className="grid grid-cols-4 gap-2">
                    {[50, 100, 250, 500].map((val) => (
                        <button
                            key={val}
                            onClick={() => setAmount(val)}
                            className={`py-3 rounded-xl text-sm font-medium transition-all ${amount === val
                                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black'
                                    : 'bg-white/5 text-white hover:bg-amber-500/10 hover:text-amber-400'
                                }`}
                        >
                            ${val}
                        </button>
                    ))}
                </div>
            </div>

            {/* Take Profit */}
            <div className="mb-4">
                <div className="flex justify-between text-sm mb-3">
                    <span className="text-white/50">Take profit at</span>
                    <span className="text-emerald-400 font-medium">+{takeProfitPercent}%</span>
                </div>
                <Slider
                    value={[takeProfitPercent]}
                    onValueChange={([value]) => setTakeProfitPercent(value)}
                    min={1}
                    max={20}
                    step={1}
                    className="w-full"
                />
            </div>

            {/* Stop Loss */}
            <div className="mb-6">
                <div className="flex justify-between text-sm mb-3">
                    <span className="text-white/50">Stop loss at</span>
                    <span className="text-red-400 font-medium">-{stopLossPercent}%</span>
                </div>
                <Slider
                    value={[stopLossPercent]}
                    onValueChange={([value]) => setStopLossPercent(value)}
                    min={1}
                    max={15}
                    step={1}
                    className="w-full"
                />
            </div>

            {/* Summary */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/50">Potential savings</span>
                    <span className="text-emerald-400">+${potentialProfit.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-white/50">Maximum risk</span>
                    <span className="text-red-400">-${potentialLoss.toFixed(2)}</span>
                </div>
            </div>

            {/* Info */}
            <div className="flex items-start gap-2 text-xs text-amber-500/60 mb-6">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                    Your monthly bill will decrease if you're right, or increase if you're wrong.
                </span>
            </div>

            {/* Submit */}
            <Button
                onClick={handleSubmit}
                disabled={amount <= 0 || isSubmitting}
                className={`w-full py-6 text-lg font-semibold rounded-xl shadow-lg ${positionType === 'long'
                        ? 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-emerald-500/25'
                        : 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white shadow-red-500/25'
                    }`}
            >
                {isSubmitting ? 'Confirming...' : `Predict ${positionType === 'long' ? 'Up' : 'Down'}`}
            </Button>
        </div>
    );
}
