import { useState, useEffect } from 'react';
import { creditCardService } from '@/services/creditCardService';
import { positionService } from '@/services/positionService';
import type { CardStats } from '@/types/creditCardTypes';
import {
    CreditCard,
    TrendingUp,
    Target,
    DollarSign,
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
        const unsubscribeCard = creditCardService.subscribe(loadStats);
        const unsubscribePositions = positionService.subscribe(loadStats);
        const interval = setInterval(loadStats, 5000);

        return () => {
            unsubscribeCard();
            unsubscribePositions();
            clearInterval(interval);
        };
    }, []);

    const statCards = [
        {
            label: 'Monthly Spending',
            value: `$${stats.currentMonthSpending.toFixed(0)}`,
            icon: <CreditCard className="w-5 h-5" />,
            color: 'text-white',
            bg: 'bg-white/5 border-white/10',
        },
        {
            label: 'Prediction P&L',
            value: `${stats.currentMonthPnL >= 0 ? '+' : ''}$${stats.currentMonthPnL.toFixed(0)}`,
            icon: <TrendingUp className="w-5 h-5" />,
            color: stats.currentMonthPnL >= 0 ? 'text-emerald-400' : 'text-red-400',
            bg: stats.currentMonthPnL >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20',
        },
        {
            label: 'Projected Bill',
            value: `$${stats.projectedBill.toFixed(0)}`,
            icon: <DollarSign className="w-5 h-5" />,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10 border-amber-500/20',
        },
        {
            label: 'Active Predictions',
            value: stats.activePositions.toString(),
            icon: <Target className="w-5 h-5" />,
            color: 'text-white',
            bg: 'bg-white/5 border-white/10',
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, index) => (
                <div
                    key={index}
                    className={`${stat.bg} rounded-2xl p-5 border`}
                >
                    <div className="flex items-center gap-2 mb-3 text-white/50">
                        {stat.icon}
                        <span className="text-sm">{stat.label}</span>
                    </div>
                    <span className={`text-2xl font-bold ${stat.color}`}>
                        {stat.value}
                    </span>
                </div>
            ))}
        </div>
    );
}
