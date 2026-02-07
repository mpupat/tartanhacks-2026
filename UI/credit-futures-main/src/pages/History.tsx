import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, Position } from '@/store/appStore';
import { StatusPill } from '@/components/ui/StatusPill';
import { cn } from '@/lib/utils';
import { Download, TrendingUp, TrendingDown, BarChart3, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const History = () => {
  const { positions } = useAppStore();
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'roi'>('date');

  // Filter to only settled/bounced positions
  const settledPositions = positions.filter(
    (p) => p.status === 'SETTLED' || p.status === 'BOUNCED'
  );

  // Calculate stats
  const stats = settledPositions.reduce(
    (acc, pos) => {
      const savings = pos.purchaseAmount - (pos.settledAmount || pos.purchaseAmount);
      const roi = (savings / pos.purchaseAmount) * 100;

      acc.totalPurchase += pos.purchaseAmount;
      acc.totalSettled += pos.settledAmount || pos.purchaseAmount;
      acc.totalSavings += savings;
      if (savings > 0) acc.wins++;
      if (savings < 0) acc.losses++;
      if (savings > acc.bestSaving) acc.bestSaving = savings;
      if (savings < acc.worstLoss) acc.worstLoss = savings;

      return acc;
    },
    {
      totalPurchase: 0,
      totalSettled: 0,
      totalSavings: 0,
      wins: 0,
      losses: 0,
      bestSaving: 0,
      worstLoss: 0,
    }
  );

  const winRate = settledPositions.length > 0
    ? (stats.wins / settledPositions.length) * 100
    : 0;
  const avgRoi = settledPositions.length > 0
    ? (stats.totalSavings / stats.totalPurchase) * 100
    : 0;

  const handleExport = () => {
    const csv = [
      ['Date', 'Item', 'Purchase', 'Direction', 'Settlement', 'Final Payment', 'Savings/Loss', 'ROI %'].join(','),
      ...settledPositions.map((p) => {
        const savings = p.purchaseAmount - (p.settledAmount || p.purchaseAmount);
        const roi = (savings / p.purchaseAmount) * 100;
        return [
          new Date(p.settledAt || p.startTime).toISOString().split('T')[0],
          p.productName,
          p.purchaseAmount.toFixed(2),
          p.direction,
          p.status,
          (p.settledAmount || p.purchaseAmount).toFixed(2),
          savings.toFixed(2),
          roi.toFixed(2),
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
      <div className="grid grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-border p-5 shadow-card">
          <div className="text-sm text-muted-foreground mb-1">
            Total Winback
          </div>
          <div
            className={cn(
              'text-2xl font-bold mono-number',
              stats.totalSavings >= 0 ? 'text-emerald-600' : 'text-red-500'
            )}
          >
            {stats.totalSavings >= 0 ? '+' : ''}${stats.totalSavings.toFixed(2)}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-5 shadow-card">
          <div className="text-sm text-muted-foreground mb-1">
            Win Rate
          </div>
          <div
            className={cn(
              'text-2xl font-bold mono-number',
              winRate >= 50 ? 'text-emerald-600' : 'text-red-500'
            )}
          >
            {winRate.toFixed(1)}%
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-5 shadow-card">
          <div className="text-sm text-muted-foreground mb-1">
            Avg ROI
          </div>
          <div
            className={cn(
              'text-2xl font-bold mono-number',
              avgRoi >= 0 ? 'text-emerald-600' : 'text-red-500'
            )}
          >
            {avgRoi >= 0 ? '+' : ''}{avgRoi.toFixed(2)}%
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-5 shadow-card">
          <div className="text-sm text-muted-foreground mb-1">
            Best Win
          </div>
          <div className="text-2xl font-bold mono-number text-emerald-600">
            +${stats.bestSaving.toFixed(2)}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-5 shadow-card">
          <div className="text-sm text-muted-foreground mb-1">
            Worst Loss
          </div>
          <div className="text-2xl font-bold mono-number text-red-500">
            ${stats.worstLoss.toFixed(2)}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-5 shadow-card">
          <div className="text-sm text-muted-foreground mb-1">
            Total Predictions
          </div>
          <div className="text-2xl font-bold mono-number">
            {settledPositions.length}
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-8 gap-2 py-3 px-5 border-b border-border bg-muted/50 text-xs text-muted-foreground font-medium">
          <div>Date</div>
          <div className="col-span-2">Item</div>
          <div className="text-right">Purchase</div>
          <div className="text-center">Direction</div>
          <div className="text-right">Final Payment</div>
          <div className="text-right">Savings/Loss</div>
          <div className="text-right">ROI</div>
        </div>

        {/* Rows */}
        {settledPositions.length > 0 ? (
          settledPositions.map((position, index) => {
            const savings = position.purchaseAmount - (position.settledAmount || position.purchaseAmount);
            const roi = (savings / position.purchaseAmount) * 100;
            const date = new Date(position.settledAt || position.startTime);

            return (
              <motion.div
                key={position.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'grid grid-cols-8 gap-2 py-4 px-5 border-b border-border hover:bg-muted/30 transition-colors',
                  index % 2 === 0 ? 'bg-white' : 'bg-muted/20'
                )}
              >
                <div className="text-sm mono-number text-muted-foreground">
                  {date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric',
                  })}
                </div>
                <div className="col-span-2">
                  <div className="text-sm font-medium">{position.productName}</div>
                </div>
                <div className="text-right text-sm mono-number">
                  ${position.purchaseAmount.toFixed(2)}
                </div>
                <div className="text-center">
                  <StatusPill status={position.direction} />
                </div>
                <div className="text-right">
                  <div className="text-sm mono-number">
                    ${(position.settledAmount || position.purchaseAmount).toFixed(2)}
                  </div>
                  <StatusPill status={position.status} size="sm" />
                </div>
                <div className="text-right flex items-center justify-end gap-1">
                  {savings > 0 && <ArrowUp className="w-3 h-3 text-emerald-600" />}
                  {savings < 0 && <ArrowDown className="w-3 h-3 text-red-500" />}
                  <span className={cn(
                    'text-sm font-semibold mono-number',
                    savings > 0 ? 'text-emerald-600' : savings < 0 ? 'text-red-500' : 'text-muted-foreground'
                  )}>
                    {savings > 0 ? '+' : ''}{savings.toFixed(2)}
                  </span>
                </div>
                <div className={cn(
                  'text-right text-sm font-semibold mono-number',
                  roi > 0 ? 'text-emerald-600' : roi < 0 ? 'text-red-500' : 'text-muted-foreground'
                )}>
                  {roi > 0 ? '+' : ''}{roi.toFixed(2)}%
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="py-16 text-center">
            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No completed predictions yet
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Your settled predictions will appear here
            </p>
          </div>
        )}
      </div>
    </main>
  );
};

export default History;
