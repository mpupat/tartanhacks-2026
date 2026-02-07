import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, Position } from '@/store/appStore';
import { usePositionCalculations } from '@/hooks/usePositionCalculations';
import { XrpTicker } from '@/components/terminal/XrpTicker';
import { StatusPill } from '@/components/ui/StatusPill';
import { cn } from '@/lib/utils';
import { Settings, X, TrendingUp, TrendingDown, Clock, AlertTriangle, Target } from 'lucide-react';
import { toast } from 'sonner';

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
        'grid grid-cols-9 gap-2 items-center py-3 px-4 border-b border-grid-line hover:bg-muted/30 transition-colors cursor-pointer',
        position.status === 'UNCONFIGURED' && 'bg-warning/5',
        calc.nearMaxBound && 'bg-loss/5',
        calc.nearMinBound && 'bg-profit/5'
      )}
      onClick={() => onConfigure(position)}
    >
      {/* Item Name */}
      <div className="col-span-2">
        <div className="text-xs font-medium truncate">{position.productName}</div>
        <div className="text-[10px] text-muted-foreground">ID: {position.id.slice(-6)}</div>
      </div>

      {/* Purchase Amount */}
      <div className="text-right">
        <div className="text-xs mono-number">${position.purchaseAmount.toFixed(2)}</div>
        <div className="text-[10px] text-muted-foreground">PURCHASE</div>
      </div>

      {/* XRP Invested */}
      <div className="text-right">
        <div className="text-xs mono-number">{position.xrpInvested.toFixed(2)}</div>
        <div className="text-[10px] text-muted-foreground">XRP</div>
      </div>

      {/* Current Value */}
      <div className="text-right">
        <div className="text-xs mono-number">${calc.currentXrpValue.toFixed(2)}</div>
        <div className="text-[10px] text-muted-foreground">VALUE</div>
      </div>

      {/* Direction */}
      <div className="text-center">
        <StatusPill status={position.direction} />
      </div>

      {/* P&L */}
      <div className="text-right">
        <div
          className={cn(
            'text-xs font-bold mono-number',
            calc.isProfit && 'text-profit',
            calc.isLoss && 'text-loss',
            !calc.isProfit && !calc.isLoss && 'text-muted-foreground'
          )}
        >
          {calc.isProfit ? '+' : ''}{calc.pnlPercent.toFixed(2)}%
        </div>
        <div
          className={cn(
            'text-[10px] mono-number',
            calc.isProfit && 'text-profit',
            calc.isLoss && 'text-loss',
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
            <div className="text-xs mono-number">
              {calc.remainingDays}D {calc.remainingHours}H
            </div>
            <div className="text-[10px] text-muted-foreground">REMAINING</div>
          </>
        ) : (
          <span className="text-[10px] text-muted-foreground">—</span>
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
    toast.success('POSITION CONFIGURED', {
      description: `${position.productName} is now ${direction}`,
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
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl bg-card border border-grid-line"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-grid-line flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold tracking-wider">{position.productName}</h2>
            <p className="text-[10px] text-muted-foreground">
              CONFIGURE SETTLEMENT STRATEGY
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Position Info */}
          <div className="grid grid-cols-4 gap-4">
            <div className="border border-grid-line p-3">
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
                PURCHASE
              </div>
              <div className="text-lg font-bold mono-number">
                ${position.purchaseAmount.toFixed(2)}
              </div>
            </div>
            <div className="border border-grid-line p-3">
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
                XRP INVESTED
              </div>
              <div className="text-lg font-bold mono-number">
                {position.xrpInvested.toFixed(2)}
              </div>
            </div>
            <div className="border border-grid-line p-3">
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
                ENTRY PRICE
              </div>
              <div className="text-lg font-bold mono-number">
                ${position.xrpEntryPrice.toFixed(6)}
              </div>
            </div>
            <div className="border border-grid-line p-3">
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
                CURRENT PRICE
              </div>
              <div className="text-lg font-bold mono-number text-profit">
                ${xrpPrice.toFixed(6)}
              </div>
            </div>
          </div>

          {/* Direction Selection */}
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">
              SELECT DIRECTION
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setDirection('LONG')}
                className={cn(
                  'p-4 border transition-colors flex items-center gap-3',
                  direction === 'LONG'
                    ? 'border-profit bg-profit/10'
                    : 'border-grid-line hover:border-profit/50'
                )}
              >
                <TrendingUp className={cn('w-6 h-6', direction === 'LONG' ? 'text-profit' : 'text-muted-foreground')} />
                <div className="text-left">
                  <div className={cn('font-bold', direction === 'LONG' && 'text-profit')}>LONG</div>
                  <div className="text-[10px] text-muted-foreground">
                    PROFIT WHEN XRP RISES
                  </div>
                </div>
              </button>
              <button
                onClick={() => setDirection('SHORT')}
                className={cn(
                  'p-4 border transition-colors flex items-center gap-3',
                  direction === 'SHORT'
                    ? 'border-loss bg-loss/10'
                    : 'border-grid-line hover:border-loss/50'
                )}
              >
                <TrendingDown className={cn('w-6 h-6', direction === 'SHORT' ? 'text-loss' : 'text-muted-foreground')} />
                <div className="text-left">
                  <div className={cn('font-bold', direction === 'SHORT' && 'text-loss')}>SHORT</div>
                  <div className="text-[10px] text-muted-foreground">
                    PROFIT WHEN XRP FALLS
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Bounds Configuration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">
                MAX PAYMENT (+{maxPct.toFixed(1)}%)
              </label>
              <input
                type="range"
                min={position.purchaseAmount}
                max={position.purchaseAmount * 1.5}
                step={0.01}
                value={maxPayment}
                onChange={(e) => setMaxPayment(Number(e.target.value))}
                className="w-full accent-loss"
              />
              <div className="text-lg font-bold mono-number text-loss mt-1">
                ${maxPayment.toFixed(2)}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">
                MIN PAYMENT (-{minPct.toFixed(1)}%)
              </label>
              <input
                type="range"
                min={position.purchaseAmount * 0.5}
                max={position.purchaseAmount}
                step={0.01}
                value={minPayment}
                onChange={(e) => setMinPayment(Number(e.target.value))}
                className="w-full accent-profit"
              />
              <div className="text-lg font-bold mono-number text-profit mt-1">
                ${minPayment.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Time Limit */}
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">
              <Clock className="w-3 h-3 inline mr-1" />
              TIME LIMIT: {timeLimit} DAYS
            </label>
            <input
              type="range"
              min={1}
              max={7}
              step={1}
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>1 DAY</span>
              <span>7 DAYS</span>
            </div>
          </div>

          {/* Risk Indicator */}
          <div className={cn(
            'p-4 border flex items-center justify-between',
            riskLevel === 'LOW' && 'border-profit/30 bg-profit/5',
            riskLevel === 'MEDIUM' && 'border-warning/30 bg-warning/5',
            riskLevel === 'HIGH' && 'border-loss/30 bg-loss/5'
          )}>
            <div className="flex items-center gap-3">
              <Target className={cn(
                'w-5 h-5',
                riskLevel === 'LOW' && 'text-profit',
                riskLevel === 'MEDIUM' && 'text-warning',
                riskLevel === 'HIGH' && 'text-loss'
              )} />
              <div>
                <div className={cn(
                  'font-bold',
                  riskLevel === 'LOW' && 'text-profit',
                  riskLevel === 'MEDIUM' && 'text-warning',
                  riskLevel === 'HIGH' && 'text-loss'
                )}>
                  {riskLevel} RISK
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Based on bound width and time limit
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold mono-number">
                {successProbability.toFixed(0)}%
              </div>
              <div className="text-[10px] text-muted-foreground">
                SETTLE PROBABILITY
              </div>
            </div>
          </div>

          {/* Warning */}
          {riskLevel === 'HIGH' && (
            <div className="flex items-start gap-2 text-loss">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p className="text-[10px]">
                TIGHT BOUNDS INCREASE BOUNCE RISK. CONSIDER WIDENING YOUR SETTLEMENT RANGE.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-grid-line flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-grid-line text-xs font-semibold uppercase tracking-wider hover:bg-muted transition-colors"
          >
            CANCEL
          </button>
          <button
            onClick={handleConfigure}
            className={cn(
              'px-6 py-3 text-xs font-bold uppercase tracking-wider transition-colors',
              direction === 'LONG'
                ? 'bg-profit text-primary-foreground hover:bg-profit/80'
                : 'bg-loss text-destructive-foreground hover:bg-loss/80'
            )}
          >
            CONFIRM {direction} POSITION
          </button>
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
    <main className="container py-6">
      {/* XRP Ticker */}
      <XrpTicker />

      {/* Header */}
      <div className="mt-6 mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-widest text-profit mb-1">
            TRADING TERMINAL
          </h1>
          <p className="text-xs text-muted-foreground">
            {activeCount} ACTIVE | {unconfiguredCount} UNCONFIGURED | REAL-TIME P&L
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {(['ALL', 'UNCONFIGURED', 'ACTIVE', 'SETTLED'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold border transition-colors',
                filter === f
                  ? 'bg-profit border-profit text-primary-foreground'
                  : 'border-grid-line text-muted-foreground hover:border-profit/50'
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Positions Grid */}
      <div className="border border-grid-line bg-card">
        {/* Header Row */}
        <div className="grid grid-cols-9 gap-2 py-2 px-4 border-b border-grid-line bg-muted/30 text-[10px] text-muted-foreground uppercase tracking-widest">
          <div className="col-span-2">ITEM</div>
          <div className="text-right">PURCHASE</div>
          <div className="text-right">XRP</div>
          <div className="text-right">VALUE</div>
          <div className="text-center">DIRECTION</div>
          <div className="text-right">P&L</div>
          <div className="text-right">TIME</div>
          <div className="text-right">STATUS</div>
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
          <div className="py-12 text-center text-muted-foreground text-sm">
            NO POSITIONS MATCH CURRENT FILTER
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-6 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-profit/20 border border-profit" />
          <span>PROFITABLE</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-loss/20 border border-loss" />
          <span>LOSING</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-warning/20 border border-warning" />
          <span>NEEDS CONFIG</span>
        </div>
        <div className="ml-auto">
          CLICK ANY POSITION TO CONFIGURE
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
