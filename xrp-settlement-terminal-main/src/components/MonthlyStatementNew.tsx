import { useState, useEffect } from 'react';
import { creditCardService } from '@/services/creditCardService';
import type { MonthlyStatement as MonthlyStatementType } from '@/types/creditCardTypes';
import { CreditCard, TrendingUp, TrendingDown, Sparkles, Coins } from 'lucide-react';

export function MonthlyStatement() {
    const [statement, setStatement] = useState<MonthlyStatementType | null>(null);

    useEffect(() => {
        const loadStatement = () => {
            setStatement(creditCardService.calculateMonthlyStatement());
        };

        loadStatement();
        const unsubscribe = creditCardService.subscribe(loadStatement);
        return () => unsubscribe();
    }, []);

    if (!statement) return null;

    const isSaving = statement.tradingPnL > 0;
    const savings = Math.abs(statement.tradingPnL);
    const monthName = new Date().toLocaleString('en-US', { month: 'long' });

    return (
        <div className="bg-white/5 rounded-2xl p-6 border border-amber-500/10">
            <h3 className="text-lg font-semibold mb-6 text-amber-400">{monthName} Statement</h3>

            {/* Card Balance Display */}
            <div className="bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-amber-600/5 rounded-xl p-6 mb-6 relative overflow-hidden border border-amber-500/20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-500/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="flex items-center gap-2 mb-4">
                    <Coins className="w-5 h-5 text-amber-400" />
                    <span className="text-amber-400/70 text-sm">Amount Due</span>
                </div>

                <div className="text-4xl font-bold mb-1">
                    ${statement.finalAmount.toFixed(2)}
                </div>

                {isSaving && savings > 0 && (
                    <div className="flex items-center gap-1 text-emerald-400 text-sm">
                        <Sparkles className="w-4 h-4" />
                        You saved ${savings.toFixed(2)} with predictions!
                    </div>
                )}
            </div>

            {/* Breakdown */}
            <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-white/50" />
                        </div>
                        <div>
                            <div className="font-medium">Card Spending</div>
                            <div className="text-xs text-white/40">{statement.transactions.length} transactions</div>
                        </div>
                    </div>
                    <span className="font-mono">${statement.baseSpending.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSaving ? 'bg-emerald-500/20' : 'bg-red-500/20'
                            }`}>
                            {isSaving ? (
                                <TrendingUp className="w-5 h-5 text-emerald-400" />
                            ) : (
                                <TrendingDown className="w-5 h-5 text-red-400" />
                            )}
                        </div>
                        <div>
                            <div className="font-medium">Prediction {isSaving ? 'Bonus' : 'Penalty'}</div>
                            <div className="text-xs text-white/40">{statement.positions.length} closed positions</div>
                        </div>
                    </div>
                    <span className={`font-mono ${isSaving ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isSaving ? '-' : '+'}${savings.toFixed(2)}
                    </span>
                </div>
            </div>
        </div>
    );
}
