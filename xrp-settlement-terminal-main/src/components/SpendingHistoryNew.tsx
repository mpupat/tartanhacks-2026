import { useState, useEffect } from 'react';
import { creditCardService } from '@/services/creditCardService';
import type { CreditCardTransaction } from '@/types/creditCardTypes';
import { Button } from '@/components/ui/button';
import {
    ShoppingBag,
    Utensils,
    Film,
    Plane,
    Zap,
    MoreHorizontal,
    Plus,
} from 'lucide-react';

const categoryIcons: Record<string, React.ReactNode> = {
    shopping: <ShoppingBag className="w-5 h-5" />,
    food: <Utensils className="w-5 h-5" />,
    entertainment: <Film className="w-5 h-5" />,
    travel: <Plane className="w-5 h-5" />,
    utilities: <Zap className="w-5 h-5" />,
    other: <MoreHorizontal className="w-5 h-5" />,
};

const categoryColors: Record<string, string> = {
    shopping: 'bg-amber-500/20 text-amber-400',
    food: 'bg-emerald-500/20 text-emerald-400',
    entertainment: 'bg-pink-500/20 text-pink-400',
    travel: 'bg-blue-500/20 text-blue-400',
    utilities: 'bg-yellow-500/20 text-yellow-400',
    other: 'bg-white/10 text-white/50',
};

export function SpendingHistory() {
    const [transactions, setTransactions] = useState<CreditCardTransaction[]>([]);

    useEffect(() => {
        const loadTransactions = () => {
            setTransactions(creditCardService.getAllTransactions());
        };

        loadTransactions();
        const unsubscribe = creditCardService.subscribe(loadTransactions);
        return () => unsubscribe();
    }, []);

    const addDemoTransactions = () => {
        creditCardService.addDemoTransactions();
        setTransactions(creditCardService.getAllTransactions());
    };

    const formatDate = (date: Date) => {
        const d = new Date(date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (d.toDateString() === today.toDateString()) return 'Today';
        if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="bg-white/5 rounded-2xl p-6 border border-amber-500/10">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-amber-400">Recent Transactions</h3>
                {transactions.length === 0 && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={addDemoTransactions}
                        className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Demo Data
                    </Button>
                )}
            </div>

            {transactions.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingBag className="w-8 h-8 text-amber-500/50" />
                    </div>
                    <p className="text-white/50 mb-2">No transactions yet</p>
                    <p className="text-white/30 text-sm">Your spending will appear here</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {transactions.map((tx) => (
                        <div
                            key={tx.id}
                            className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${categoryColors[tx.category] || categoryColors.other
                                    }`}>
                                    {categoryIcons[tx.category] || categoryIcons.other}
                                </div>
                                <div>
                                    <div className="font-medium">{tx.merchant}</div>
                                    <div className="text-xs text-white/40">{formatDate(tx.date)}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-mono">-${tx.amount.toFixed(2)}</div>
                                {tx.linkedPositionId && (
                                    <div className="text-xs text-emerald-400">Has prediction</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {transactions.length > 0 && (
                <div className="mt-6 pt-4 border-t border-amber-500/10 flex items-center justify-between">
                    <span className="text-white/50">Total Spending</span>
                    <span className="text-xl font-bold text-amber-400">
                        ${transactions.reduce((sum, tx) => sum + tx.amount, 0).toFixed(2)}
                    </span>
                </div>
            )}
        </div>
    );
}
