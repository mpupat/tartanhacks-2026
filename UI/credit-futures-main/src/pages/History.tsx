import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';
import { Download, TrendingUp, TrendingDown, CheckCircle, X, Clock, Target, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Position } from '@/types/kalshi';
import { CATEGORY_CONFIG } from '@/services/kalshiService';

const History = () => {
  const { positions } = useAppStore();
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'roi'>('date');

  // Filter to only settled positions
  const settledPositions = positions.filter(p => p.status === 'settled');

  // Calculate stats
  const stats = settledPositions.reduce(
    (acc, pos) => {
      const cashback = pos.cashback_amount || 0;
      acc.totalPurchase += pos.purchase.purchase_amount;
      acc.totalCashback += cashback;

      if (pos.final_outcome === 'win') acc.wins++;
      if (pos.final_outcome === 'loss') acc.losses++;
      if (cashback > acc.bestWin) acc.bestWin = cashback;
      if (cashback < acc.worstLoss) acc.worstLoss = cashback;

      return acc;
    },
    {
      totalPurchase: 0,
      totalCashback: 0,
      wins: 0,
      losses: 0,
      bestWin: 0,
      worstLoss: 0,
    }
  );

  const winRate = settledPositions.length > 0
    ? (stats.wins / settledPositions.length) * 100
    : 0;

  // Sort positions
  const sortedPositions = [...settledPositions].sort((a, b) => {
    switch (sortBy) {
      case 'amount':
        return b.purchase.purchase_amount - a.purchase.purchase_amount;
      case 'roi':
        return (b.roi || 0) - (a.roi || 0);
      case 'date':
      default:
        return new Date(b.settled_at || '').getTime() - new Date(a.settled_at || '').getTime();
    }
  });

  const handleExport = () => {
    const csv = [
      ['Date', 'Item', 'Market', 'Prediction', 'Outcome', 'Cashback', 'ROI %'].join(','),
      ...sortedPositions.map((p) => {
        return [
          new Date(p.settled_at || '').toISOString().split('T')[0],
          p.purchase.item_name,
          p.market_title || '',
          p.prediction_direction || '',
          p.final_outcome || '',
          (p.cashback_amount || 0).toFixed(2),
          (p.roi || 0).toFixed(2),
        ].join(',');
      }),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `winback-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const formatSettlementReason = (reason: Position['settlement_reason']) => {
    switch (reason) {
      case 'market_resolved': return 'Market Resolved';
      case 'threshold_reward': return 'Hit Reward Target';
      case 'threshold_loss': return 'Hit Loss Limit';
      case 'time_expired': return 'Time Expired';
      default: return reason;
    }
  };

  return (
    <main className="container py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            History
          </h1>
          <p className="text-muted-foreground">
            Completed predictions • Performance analytics
          </p>
        </div>
        <Button variant="outline" onClick={handleExport} className="gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-border p-4 shadow-card">
          <div className="text-sm text-muted-foreground mb-1">Total Trades</div>
          <div className="text-2xl font-bold">{settledPositions.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 shadow-card">
          <div className="text-sm text-muted-foreground mb-1">Win Rate</div>
          <div className={cn(
            'text-2xl font-bold',
            winRate >= 50 ? 'text-emerald-600' : 'text-red-500'
          )}>
            {winRate.toFixed(0)}%
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 shadow-card">
          <div className="text-sm text-muted-foreground mb-1">Total Cashback</div>
          <div className={cn(
            'text-2xl font-bold',
            stats.totalCashback >= 0 ? 'text-emerald-600' : 'text-red-500'
          )}>
            {stats.totalCashback >= 0 ? '+' : ''}${stats.totalCashback.toFixed(2)}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 shadow-card">
          <div className="text-sm text-muted-foreground mb-1">Wins / Losses</div>
          <div className="text-2xl font-bold">
            <span className="text-emerald-600">{stats.wins}</span>
            <span className="text-muted-foreground mx-1">/</span>
            <span className="text-red-500">{stats.losses}</span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 shadow-card">
          <div className="text-sm text-muted-foreground mb-1">Best Win</div>
          <div className="text-2xl font-bold text-emerald-600">
            +${stats.bestWin.toFixed(2)}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 shadow-card">
          <div className="text-sm text-muted-foreground mb-1">Worst Loss</div>
          <div className="text-2xl font-bold text-red-500">
            {stats.worstLoss < 0 ? '' : '-'}${Math.abs(stats.worstLoss).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-muted-foreground">Sort by:</span>
        {(['date', 'amount', 'roi'] as const).map((option) => (
          <button
            key={option}
            onClick={() => setSortBy(option)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              sortBy === option
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            {option === 'date' ? 'Date' : option === 'amount' ? 'Amount' : 'ROI'}
          </button>
        ))}
      </div>

      {/* History Table */}
      {settledPositions.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center shadow-card">
          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No completed trades yet</h3>
          <p className="text-muted-foreground">
            Your settled positions will appear here
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Item</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Market</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Prediction</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Outcome</th>
                <th className="text-right p-4 text-sm font-semibold text-muted-foreground">Cashback</th>
                <th className="text-right p-4 text-sm font-semibold text-muted-foreground">ROI</th>
              </tr>
            </thead>
            <tbody>
              {sortedPositions.map((position, index) => {
                const isWin = position.final_outcome === 'win';
                const categoryConfig = position.market_category ? CATEGORY_CONFIG[position.market_category] : null;

                return (
                  <motion.tr
                    key={position.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{position.purchase.item_icon}</span>
                        <div>
                          <p className="font-medium">{position.purchase.item_name}</p>
                          <p className="text-xs text-muted-foreground">
                            ${position.purchase.purchase_amount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {categoryConfig && (
                          <span className="text-sm">{categoryConfig.icon}</span>
                        )}
                        <span className="text-sm max-w-[200px] truncate">
                          {position.market_title || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        'inline-flex items-center px-2 py-1 rounded text-xs font-semibold',
                        position.prediction_direction === 'YES'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      )}>
                        {position.prediction_direction} @ {position.entry_price}¢
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold',
                          isWin ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        )}>
                          {isWin ? <CheckCircle className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          {isWin ? 'WON' : 'LOST'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatSettlementReason(position.settlement_reason)}
                        </span>
                      </div>
                    </td>
                    <td className={cn(
                      'p-4 text-right font-semibold',
                      isWin ? 'text-emerald-600' : 'text-red-500'
                    )}>
                      {(position.cashback_amount || 0) >= 0 ? '+' : ''}
                      ${(position.cashback_amount || 0).toFixed(2)}
                    </td>
                    <td className={cn(
                      'p-4 text-right font-semibold',
                      isWin ? 'text-emerald-600' : 'text-red-500'
                    )}>
                      {(position.roi || 0) >= 0 ? '+' : ''}
                      {(position.roi || 0).toFixed(1)}%
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
};

export default History;
