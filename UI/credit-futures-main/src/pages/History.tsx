import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, Position } from '@/store/appStore';
import { StatusPill } from '@/components/ui/StatusPill';
import { cn } from '@/lib/utils';
import { Download, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

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
    a.download = `crypto-tomorrow-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <main className="container py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-widest text-profit mb-1">
            SETTLEMENT HISTORY
          </h1>
          <p className="text-xs text-muted-foreground">
            COMPLETED POSITIONS | PERFORMANCE ANALYTICS
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 border border-grid-line text-xs font-semibold uppercase tracking-wider hover:border-profit hover:text-profit transition-colors"
        >
          <Download className="w-4 h-4" />
          EXPORT CSV
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        <div className="border border-grid-line bg-card p-4">
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
            TOTAL SAVED
          </div>
          <div
            className={cn(
              'text-xl font-bold mono-number',
              stats.totalSavings >= 0 ? 'text-profit' : 'text-loss'
            )}
          >
            {stats.totalSavings >= 0 ? '+' : ''}${stats.totalSavings.toFixed(2)}
          </div>
        </div>
        <div className="border border-grid-line bg-card p-4">
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
            WIN RATE
          </div>
          <div
            className={cn(
              'text-xl font-bold mono-number',
              winRate >= 50 ? 'text-profit' : 'text-loss'
            )}
          >
            {winRate.toFixed(1)}%
          </div>
        </div>
        <div className="border border-grid-line bg-card p-4">
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
            AVG ROI
          </div>
          <div
            className={cn(
              'text-xl font-bold mono-number',
              avgRoi >= 0 ? 'text-profit' : 'text-loss'
            )}
          >
            {avgRoi >= 0 ? '+' : ''}{avgRoi.toFixed(2)}%
          </div>
        </div>
        <div className="border border-grid-line bg-card p-4">
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
            BEST SAVING
          </div>
          <div className="text-xl font-bold mono-number text-profit">
            +${stats.bestSaving.toFixed(2)}
          </div>
        </div>
        <div className="border border-grid-line bg-card p-4">
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
            WORST LOSS
          </div>
          <div className="text-xl font-bold mono-number text-loss">
            ${stats.worstLoss.toFixed(2)}
          </div>
        </div>
        <div className="border border-grid-line bg-card p-4">
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
            TOTAL TRADES
          </div>
          <div className="text-xl font-bold mono-number">
            {settledPositions.length}
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="border border-grid-line bg-card">
        {/* Header */}
        <div className="grid grid-cols-8 gap-2 py-2 px-4 border-b border-grid-line bg-muted/30 text-[10px] text-muted-foreground uppercase tracking-widest">
          <div>DATE</div>
          <div className="col-span-2">ITEM</div>
          <div className="text-right">PURCHASE</div>
          <div className="text-center">DIRECTION</div>
          <div className="text-right">FINAL PAYMENT</div>
          <div className="text-right">SAVINGS/LOSS</div>
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
                className="grid grid-cols-8 gap-2 py-3 px-4 border-b border-grid-line hover:bg-muted/20 transition-colors"
              >
                <div className="text-xs mono-number text-muted-foreground">
                  {date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric',
                  })}
                </div>
                <div className="col-span-2">
                  <div className="text-xs font-medium">{position.productName}</div>
                </div>
                <div className="text-right text-xs mono-number">
                  ${position.purchaseAmount.toFixed(2)}
                </div>
                <div className="text-center">
                  <StatusPill status={position.direction} />
                </div>
                <div className="text-right">
                  <div className="text-xs mono-number">
                    ${(position.settledAmount || position.purchaseAmount).toFixed(2)}
                  </div>
                  <StatusPill status={position.status} size="sm" />
                </div>
                <div className={cn(
                  'text-right text-xs font-bold mono-number',
                  savings > 0 ? 'text-profit' : savings < 0 ? 'text-loss' : 'text-muted-foreground'
                )}>
                  {savings > 0 ? '+' : ''}{savings.toFixed(2)}
                </div>
                <div className={cn(
                  'text-right text-xs font-bold mono-number',
                  roi > 0 ? 'text-profit' : roi < 0 ? 'text-loss' : 'text-muted-foreground'
                )}>
                  {roi > 0 ? '+' : ''}{roi.toFixed(2)}%
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="py-12 text-center">
            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              NO SETTLED POSITIONS YET
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              COMPLETED TRADES WILL APPEAR HERE
            </p>
          </div>
        )}
      </div>
    </main>
  );
};

export default History;
