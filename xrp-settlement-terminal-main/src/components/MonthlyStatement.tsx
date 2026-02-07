import { useState, useEffect } from 'react';
import { creditCardService } from '@/services/creditCardService';
import type { MonthlyStatement as MonthlyStatementType } from '@/types/creditCardTypes';
import { Receipt, TrendingUp, TrendingDown, CreditCard, Calendar } from 'lucide-react';

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

    if (!statement) {
        return null;
    }

    const isSaving = statement.tradingPnL > 0;
    const monthName = new Date(statement.year, parseInt(statement.month.split('-')[1]) - 1)
        .toLocaleString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div className="terminal-grid p-4">
            <div className="flex items-center justify-between mb-4">
                <span className="terminal-header text-xs">MONTHLY STATEMENT</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {monthName}
                </span>
            </div>

            {/* Statement Summary */}
            <div className="space-y-4">
                {/* Base Spending */}
                <div className="flex items-center justify-between p-3 bg-card/50 rounded">
                    <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Card Spending</span>
                    </div>
                    <span className="font-mono text-sm">
                        ${statement.baseSpending.toFixed(2)}
                    </span>
                </div>

                {/* Trading P&L */}
                <div className={`flex items-center justify-between p-3 rounded ${isSaving ? 'bg-success/10 border border-success/20' : 'bg-destructive/10 border border-destructive/20'
                    }`}>
                    <div className="flex items-center gap-2">
                        {isSaving ? (
                            <TrendingUp className="w-4 h-4 text-success" />
                        ) : (
                            <TrendingDown className="w-4 h-4 text-destructive" />
                        )}
                        <span className="text-sm">Trading {isSaving ? 'Savings' : 'Loss'}</span>
                    </div>
                    <span className={`font-mono text-sm font-semibold ${isSaving ? 'text-success' : 'text-destructive'
                        }`}>
                        {isSaving ? '-' : '+'}${Math.abs(statement.tradingPnL).toFixed(2)}
                    </span>
                </div>

                {/* Divider */}
                <div className="h-px bg-border-subtle" />

                {/* Final Amount */}
                <div className="flex items-center justify-between p-4 bg-primary/5 rounded border border-primary/20">
                    <div className="flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-primary" />
                        <div>
                            <span className="text-sm font-semibold">Amount Due</span>
                            <p className="text-2xs text-muted-foreground">
                                {isSaving
                                    ? `You saved $${statement.tradingPnL.toFixed(2)} this month!`
                                    : `Trading losses added $${Math.abs(statement.tradingPnL).toFixed(2)}`
                                }
                            </p>
                        </div>
                    </div>
                    <span className="font-mono text-xl font-bold">
                        ${statement.finalAmount.toFixed(2)}
                    </span>
                </div>

                {/* Breakdown */}
                <div className="text-2xs text-muted-foreground space-y-1 px-2">
                    <div className="flex justify-between">
                        <span>Transactions this month</span>
                        <span>{statement.transactions.length}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Positions closed</span>
                        <span>{statement.positions.length}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
