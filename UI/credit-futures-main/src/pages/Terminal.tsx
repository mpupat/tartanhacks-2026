import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, Position } from '@/store/appStore';
import { usePositionCalculations } from '@/hooks/usePositionCalculations';
import { XrpTicker } from '@/components/terminal/XrpTicker';
import { StatusPill } from '@/components/ui/StatusPill';
import { cn } from '@/lib/utils';
import { Settings, X, TrendingUp, TrendingDown, Clock, AlertCircle, Target, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const PositionRow = ({
  position,
  onConfigure,
}: {
  position: Position;
  onConfigure: (position: Position) => void;
}) => {
  const calc = usePositionCalculations(position);
  const { xrpPrice } = useAppStore();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        'grid grid-cols-9 gap-2 items-center py-4 px-5 border-b border-border hover:bg-muted/50 transition-colors cursor-pointer',
        position.status === 'UNCONFIGURED' && 'bg-amber-50/50',
        calc.nearMaxBound && 'bg-red-50/50',
        calc.nearMinBound && 'bg-emerald-50/50'
      )}
      onClick={() => onConfigure(position)}
    >
      {/* Item Name */}
      <div className="col-span-2">
        <div className="text-sm font-medium truncate">{position.productName}</div>
        <div className="text-xs text-muted-foreground">ID: {position.id.slice(-6)}</div>
      </div>

      {/* Purchase Amount */}
      <div className="text-right">
        <div className="text-sm mono-number">${position.purchaseAmount.toFixed(2)}</div>
        <div className="text-xs text-muted-foreground">Purchase</div>
      </div>

      {/* XRP Invested */}
      <div className="text-right">
        <div className="text-sm mono-number">{position.xrpInvested.toFixed(2)}</div>
        <div className="text-xs text-muted-foreground">XRP</div>
      </div>

      {/* Current Value */}
      <div className="text-right">
        <div className="text-sm mono-number">${calc.currentXrpValue.toFixed(2)}</div>
        <div className="text-xs text-muted-foreground">Value</div>
      </div>

      {/* Direction */}
      <div className="text-center">
        <StatusPill status={position.direction} />
      </div>

      {/* P&L */}
      <div className="text-right">
        <div className="flex items-center justify-end gap-1">
          {calc.isProfit && <ArrowUp className="w-3 h-3 text-emerald-600" />}
          {calc.isLoss && <ArrowDown className="w-3 h-3 text-red-500" />}
          <span
            className={cn(
              'text-sm font-semibold mono-number',
              calc.isProfit && 'text-emerald-600',
              calc.isLoss && 'text-red-500',
              !calc.isProfit && !calc.isLoss && 'text-muted-foreground'
            )}
          >
            {calc.isProfit ? '+' : ''}{calc.pnlPercent.toFixed(2)}%
          </span>
        </div>
        <div
          className={cn(
            'text-xs mono-number',
            calc.isProfit && 'text-emerald-600',
            calc.isLoss && 'text-red-500',
            !calc.isProfit && !calc.isLoss && 'text-muted-foreground'
          )}
        >
          {calc.isProfit ? '+' : ''}${calc.pnlAmount.toFixed(2)}
        </div>
      </div>

      {/* Time Remaining */}
      <div className="text-right">
        {position.status === 'ACTIVE' ? (
          <>
            <div className="text-sm mono-number">
              {calc.remainingDays}D {calc.remainingHours}H
            </div>
            <div className="text-xs text-muted-foreground">Remaining</div>
          </>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </div>

      {/* Status */}
      <div className="text-right">
        <StatusPill status={position.status} />
      </div>
    </motion.div>
  );
};

const ConfigurationModal = ({
  position,
  onClose,
}: {
  position: Position;
  onClose: () => void;
}) => {
  const { configurePosition, xrpPrice } = useAppStore();
  const [direction, setDirection] = useState<'LONG' | 'SHORT'>(
    position.direction === 'UNSET' ? 'LONG' : position.direction as 'LONG' | 'SHORT'
  );
  const [maxPayment, setMaxPayment] = useState(position.maxPayment);
  const [minPayment, setMinPayment] = useState(position.minPayment);
  const [timeLimit, setTimeLimit] = useState(position.timeLimit);

  const handleConfigure = () => {
    configurePosition(position.id, direction, maxPayment, minPayment, timeLimit);
    toast.success('Prediction configured', {
      description: `${position.productName} is now ${direction === 'LONG' ? 'bullish' : 'bearish'}`,
    });
    onClose();
  };

  const maxPct = ((maxPayment - position.purchaseAmount) / position.purchaseAmount) * 100;
  const minPct = ((position.purchaseAmount - minPayment) / position.purchaseAmount) * 100;

  // Risk calculation
  const boundWidth = (maxPayment - minPayment) / position.purchaseAmount;
  const riskLevel = boundWidth < 0.15 ? 'HIGH' : boundWidth < 0.25 ? 'MEDIUM' : 'LOW';
  const successProbability = Math.min(95, Math.max(30, 70 + boundWidth * 100 - (7 - timeLimit) * 3));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-premium"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{position.productName}</h2>
            <p className="text-sm text-muted-foreground">
              Configure your prediction strategy
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Position Info */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-muted rounded-xl p-4">
              <div className="text-xs text-muted-foreground mb-1">
                Purchase
              </div>
              <div className="text-lg font-bold mono-number">
                ${position.purchaseAmount.toFixed(2)}
              </div>
            </div>
            <div className="bg-muted rounded-xl p-4">
              <div className="text-xs text-muted-foreground mb-1">
                XRP Amount
              </div>
              <div className="text-lg font-bold mono-number">
                {position.xrpInvested.toFixed(2)}
              </div>
            </div>
            <div className="bg-muted rounded-xl p-4">
              <div className="text-xs text-muted-foreground mb-1">
                Entry Price
              </div>
              <div className="text-lg font-bold mono-number">
                ${position.xrpEntryPrice.toFixed(6)}
              </div>
            </div>
            <div className="bg-muted rounded-xl p-4">
              <div className="text-xs text-muted-foreground mb-1">
                Current Price
              </div>
              <div className="text-lg font-bold mono-number text-primary">
                ${xrpPrice.toFixed(6)}
              </div>
            </div>
          </div>

          {/* Direction Selection */}
          <div>
            <label className="text-sm font-medium block mb-3">
              Select your prediction
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setDirection('LONG')}
                className={cn(
                  'p-5 rounded-xl border-2 transition-all flex items-center gap-4',
                  direction === 'LONG'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-border hover:border-blue-200'
                )}
              >
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  direction === 'LONG' ? 'bg-blue-500 text-white' : 'bg-muted text-muted-foreground'
                )}>
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <div className={cn('font-semibold', direction === 'LONG' && 'text-blue-700')}>Going Up</div>
                  <div className="text-sm text-muted-foreground">
                    Winback if price rises
                  </div>
                </div>
              </button>
              <button
                onClick={() => setDirection('SHORT')}
                className={cn(
                  'p-5 rounded-xl border-2 transition-all flex items-center gap-4',
                  direction === 'SHORT'
                    ? 'border-rose-500 bg-rose-50'
                    : 'border-border hover:border-rose-200'
                )}
              >
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  direction === 'SHORT' ? 'bg-rose-500 text-white' : 'bg-muted text-muted-foreground'
                )}>
                  <TrendingDown className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <div className={cn('font-semibold', direction === 'SHORT' && 'text-rose-700')}>Going Down</div>
                  <div className="text-sm text-muted-foreground">
                    Winback if price falls
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Bounds Configuration */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium block mb-2">
                Max payment (+{maxPct.toFixed(1)}% extra)
              </label>
              <input
                type="range"
                min={position.purchaseAmount}
                max={position.purchaseAmount * 1.5}
                step={0.01}
                value={maxPayment}
                onChange={(e) => setMaxPayment(Number(e.target.value))}
                className="w-full accent-red-500"
              />
              <div className="text-xl font-bold mono-number text-red-500 mt-2">
                ${maxPayment.toFixed(2)}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">
                Min payment (-{minPct.toFixed(1)}% saved)
              </label>
              <input
                type="range"
                min={position.purchaseAmount * 0.5}
                max={position.purchaseAmount}
                step={0.01}
                value={minPayment}
                onChange={(e) => setMinPayment(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <div className="text-xl font-bold mono-number text-emerald-600 mt-2">
                ${minPayment.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Time Limit */}
          <div>
            <label className="text-sm font-medium flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4" />
              Time limit: {timeLimit} days
            </label>
            <input
              type="range"
              min={1}
              max={7}
              step={1}
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>1 day</span>
              <span>7 days</span>
            </div>
          </div>

          {/* Risk Indicator */}
          <div className={cn(
            'p-5 rounded-xl flex items-center justify-between',
            riskLevel === 'LOW' && 'bg-emerald-50 border border-emerald-200',
            riskLevel === 'MEDIUM' && 'bg-amber-50 border border-amber-200',
            riskLevel === 'HIGH' && 'bg-red-50 border border-red-200'
          )}>
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                riskLevel === 'LOW' && 'bg-emerald-100',
                riskLevel === 'MEDIUM' && 'bg-amber-100',
                riskLevel === 'HIGH' && 'bg-red-100'
              )}>
                <Target className={cn(
                  'w-5 h-5',
                  riskLevel === 'LOW' && 'text-emerald-600',
                  riskLevel === 'MEDIUM' && 'text-amber-600',
                  riskLevel === 'HIGH' && 'text-red-500'
                )} />
              </div>
              <div>
                <div className={cn(
                  'font-semibold',
                  riskLevel === 'LOW' && 'text-emerald-700',
                  riskLevel === 'MEDIUM' && 'text-amber-700',
                  riskLevel === 'HIGH' && 'text-red-600'
                )}>
                  {riskLevel} Risk
                </div>
                <div className="text-sm text-muted-foreground">
                  Based on your limits and time
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold mono-number">
                {successProbability.toFixed(0)}%
              </div>
              <div className="text-xs text-muted-foreground">
                Settle chance
              </div>
            </div>
          </div>

          {/* Warning */}
          {riskLevel === 'HIGH' && (
            <div className="flex items-start gap-2 text-red-600 bg-red-50 p-4 rounded-xl">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">
                Tight limits increase the chance of hitting your max payment. Consider widening your range.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfigure}
            className={cn(
              direction === 'LONG'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-rose-500 hover:bg-rose-600'
            )}
          >
            Confirm {direction === 'LONG' ? 'Bullish' : 'Bearish'} Prediction
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Terminal = () => {
  const { positions } = useAppStore();
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'UNCONFIGURED' | 'ACTIVE' | 'SETTLED'>('ALL');

  const filteredPositions = positions.filter((p) => {
    if (filter === 'ALL') return true;
    return p.status === filter;
  });

  const activeCount = positions.filter(p => p.status === 'ACTIVE').length;
  const unconfiguredCount = positions.filter(p => p.status === 'UNCONFIGURED').length;

  return (
    <main className="container py-8">
      {/* XRP Ticker */}
      <XrpTicker />

      {/* Header */}
      <div className="mt-8 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            Positions
          </h1>
          <p className="text-muted-foreground">
            {activeCount} active • {unconfiguredCount} pending setup • Real-time tracking
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {(['ALL', 'UNCONFIGURED', 'ACTIVE', 'SETTLED'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg border transition-all',
                filter === f
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:border-primary/50'
              )}
            >
              {f === 'ALL' ? 'All' : f === 'UNCONFIGURED' ? 'Pending' : f === 'ACTIVE' ? 'Active' : 'Settled'}
            </button>
          ))}
        </div>
      </div>

      {/* Positions Grid */}
      <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
        {/* Header Row */}
        <div className="grid grid-cols-9 gap-2 py-3 px-5 border-b border-border bg-muted/50 text-xs text-muted-foreground font-medium">
          <div className="col-span-2">Item</div>
          <div className="text-right">Purchase</div>
          <div className="text-right">XRP</div>
          <div className="text-right">Value</div>
          <div className="text-center">Direction</div>
          <div className="text-right">P&L</div>
          <div className="text-right">Time</div>
          <div className="text-right">Status</div>
        </div>

        {/* Position Rows */}
        {filteredPositions.length > 0 ? (
          filteredPositions.map((position) => (
            <PositionRow
              key={position.id}
              position={position}
              onConfigure={setSelectedPosition}
            />
          ))
        ) : (
          <div className="py-16 text-center text-muted-foreground">
            No positions match current filter
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300" />
          <span>Winning</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-100 border border-red-300" />
          <span>Losing</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-amber-100 border border-amber-300" />
          <span>Needs setup</span>
        </div>
        <div className="ml-auto">
          Click any position to configure
        </div>
      </div>

      {/* Configuration Modal */}
      <AnimatePresence>
        {selectedPosition && (
          <ConfigurationModal
            position={selectedPosition}
            onClose={() => setSelectedPosition(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
};

export default Terminal;
