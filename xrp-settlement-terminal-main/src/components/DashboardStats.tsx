import { useState, useEffect } from 'react';
import { creditCardService } from '@/services/creditCardService';
import { positionService } from '@/services/positionService';
import type { CardStats } from '@/types/creditCardTypes';
import {
    CreditCard,
    TrendingUp,
    Wallet,
    Target,
    DollarSign,
    Percent
} from 'lucide-react';

export function DashboardStats() {
    const [stats, setStats] = useState<CardStats>({
        currentMonthSpending: 0,
        currentMonthPnL: 0,
        projectedBill: 0,
        activePositions: 0,
        winRate: 0,
        totalSavings: 0,
    });

    useEffect(() => {
        const loadStats = () => {
            setStats(creditCardService.getStats());
        };

        loadStats();

        // Subscribe to both services
        const unsubscribeCard = creditCardService.subscribe(loadStats);
        const unsubscribePositions = positionService.subscribe(loadStats);

        // Refresh every 5 seconds for live updates
        const interval = setInterval(loadStats, 5000);

        return () => {
            unsubscribeCard();
            unsubscribePositions();
            clearInterval(interval);
        };
    }, []);

    const statCards = [
        {
            label: 'MONTH SPENDING',
            value: `$${stats.currentMonthSpending.toFixed(2)}`,
            icon: <CreditCard className="w-4 h-4" />,
            color: 'text-foreground',
        },
        {
            label: 'TRADING P&L',
            value: `${stats.currentMonthPnL >= 0 ? '+' : ''}$${stats.currentMonthPnL.toFixed(2)}`,
            icon: <TrendingUp className="w-4 h-4" />,
            color: stats.currentMonthPnL >= 0 ? 'text-success' : 'text-destructive',
        },
        {
            label: 'PROJECTED BILL',
            value: `$${stats.projectedBill.toFixed(2)}`,
            icon: <DollarSign className="w-4 h-4" />,
            color: 'text-primary',
        },
        {
            label: 'ACTIVE POSITIONS',
            value: stats.activePositions.toString(),
            icon: <Target className="w-4 h-4" />,
            color: 'text-foreground',
        },
        {
            label: 'WIN RATE',
            value: `${stats.winRate.toFixed(1)}%`,
            icon: <Percent className="w-4 h-4" />,
            color: stats.winRate >= 50 ? 'text-success' : 'text-warning',
        },
        {
            label: 'TOTAL SAVINGS',
            value: `${stats.totalSavings >= 0 ? '+' : ''}$${stats.totalSavings.toFixed(2)}`,
            icon: <Wallet className="w-4 h-4" />,
            color: stats.totalSavings >= 0 ? 'text-success' : 'text-destructive',
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {statCards.map((stat, index) => (
                <div
                    key={index}
                    className="terminal-grid p-3"
                >
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-muted-foreground">{stat.icon}</span>
                        <span className="terminal-header text-2xs">{stat.label}</span>
                    </div>
                    <span className={`text-lg font-bold font-mono ${stat.color}`}>
                        {stat.value}
                    </span>
                </div>
            ))}
        </div>
    );
}
