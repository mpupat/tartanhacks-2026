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
    RefreshCw
} from 'lucide-react';

const categoryIcons: Record<string, React.ReactNode> = {
    shopping: <ShoppingBag className="w-4 h-4" />,
    food: <Utensils className="w-4 h-4" />,
    entertainment: <Film className="w-4 h-4" />,
    travel: <Plane className="w-4 h-4" />,
    utilities: <Zap className="w-4 h-4" />,
    other: <MoreHorizontal className="w-4 h-4" />,
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
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'settled':
                return 'text-muted-foreground';
            case 'position_active':
                return 'text-warning';
            case 'pending':
                return 'text-primary';
            default:
                return 'text-muted-foreground';
        }
    };

    return (
        <div className="terminal-grid p-4">
            <div className="flex items-center justify-between mb-4">
                <span className="terminal-header text-xs">SPENDING HISTORY</span>
                <div className="flex items-center gap-2">
                    {transactions.length === 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={addDemoTransactions}
                            className="text-2xs h-7"
                        >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Demo Data
                        </Button>
                    )}
                </div>
            </div>

            {transactions.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                    <p className="text-sm mb-2">No transactions yet</p>
                    <p className="text-2xs">Your credit card transactions will appear here</p>
                </div>
            ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin">
                    {transactions.map((tx) => (
                        <div
                            key={tx.id}
                            className="flex items-center justify-between p-3 bg-card/30 rounded hover:bg-card/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
                                    {categoryIcons[tx.category] || categoryIcons.other}
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{tx.merchant}</p>
                                    <p className="text-2xs text-muted-foreground">
                                        {formatDate(tx.date)}
                                        {tx.linkedPositionId && (
                                            <span className="ml-2 text-primary">• Has position</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-mono text-sm">-${tx.amount.toFixed(2)}</p>
                                <p className={`text-2xs capitalize ${getStatusColor(tx.status)}`}>
                                    {tx.status.replace('_', ' ')}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Total */}
            {transactions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border-subtle flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Spending</span>
                    <span className="font-mono text-lg font-semibold">
                        ${transactions.reduce((sum, tx) => sum + tx.amount, 0).toFixed(2)}
                    </span>
                </div>
            )}
        </div>
    );
}
