import { motion } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { usePositionCalculations } from '@/hooks/usePositionCalculations';
import { StatusPill } from '@/components/ui/StatusPill';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign, CreditCard, Activity, Target } from 'lucide-react';

const StatCard = ({
  label,
  value,
  subValue,
  icon: Icon,
  variant = 'default',
}: {
  label: string;
  value: string;
  subValue?: string;
  icon: React.ElementType;
  variant?: 'default' | 'profit' | 'loss' | 'warning';
}) => {
  return (
    <div className="border border-grid-line bg-card p-4">
      <div className="flex items-start justify-between mb-3">
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
          {label}
        </span>
        <Icon
          className={cn(
            'w-4 h-4',
            variant === 'profit' && 'text-profit',
            variant === 'loss' && 'text-loss',
            variant === 'warning' && 'text-warning',
            variant === 'default' && 'text-muted-foreground'
          )}
        />
      </div>
      <div
        className={cn(
          'text-2xl font-bold mono-number',
          variant === 'profit' && 'text-profit',
          variant === 'loss' && 'text-loss',
          variant === 'warning' && 'text-warning',
          variant === 'default' && 'text-foreground'
        )}
      >
        {value}
      </div>
      {subValue && (
        <div className="text-xs text-muted-foreground mt-1">{subValue}</div>
      )}
    </div>
  );
};

const QuickPositionRow = ({ position }: { position: any }) => {
  const calc = usePositionCalculations(position);
  
  return (
    <div className="flex items-center justify-between py-2 border-b border-grid-line last:border-0">
      <div className="flex items-center gap-3">
        <StatusPill status={position.status} />
        <span className="text-xs font-medium">{position.productName}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs text-muted-foreground mono-number">
          ${position.purchaseAmount.toFixed(2)}
        </span>
        <span
          className={cn(
            'text-xs font-bold mono-number',
            calc.isProfit ? 'text-profit' : calc.isLoss ? 'text-loss' : 'text-muted-foreground'
          )}
        >
          {calc.isProfit ? '+' : ''}{calc.pnlPercent.toFixed(2)}%
        </span>
      </div>
    </div>
  );
};

const Bank = () => {
  const { balance, creditOutstanding, positions } = useAppStore();
  
  const activePositions = positions.filter(p => p.status === 'ACTIVE');
  const unconfiguredPositions = positions.filter(p => p.status === 'UNCONFIGURED');
  
  // Calculate totals
  const totalPnL = activePositions.reduce((sum, p) => {
    const calc = usePositionCalculations(p);
    return sum + calc.pnlAmount;
  }, 0);
  
  const expectedPayback = creditOutstanding - totalPnL;
  const nearBoundCount = 2; // Mock
  const riskLevel = nearBoundCount > 1 ? 'MEDIUM' : totalPnL < 0 ? 'HIGH' : 'LOW';

  return (
    <main className="container py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-bold tracking-widest text-profit mb-1">
          FINANCIAL OVERVIEW
        </h1>
        <p className="text-xs text-muted-foreground">
          REAL-TIME PORTFOLIO STATUS | UPDATED LIVE
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          label="CURRENT BALANCE"
          value={`$${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subValue="Available for withdrawal"
          icon={DollarSign}
        />
        <StatCard
          label="TOTAL CREDIT OUTSTANDING"
          value={`$${creditOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subValue={`${activePositions.length} active positions`}
          icon={CreditCard}
          variant="warning"
        />
        <StatCard
          label="EXPECTED PAYBACK"
          value={`$${expectedPayback.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subValue="AI-estimated settlement"
          icon={Target}
          variant={totalPnL > 0 ? 'profit' : 'loss'}
        />
        <StatCard
          label="MONTHLY RISK SUMMARY"
          value={riskLevel}
          subValue={`${nearBoundCount} positions near bounds`}
          icon={Activity}
          variant={riskLevel === 'LOW' ? 'profit' : riskLevel === 'MEDIUM' ? 'warning' : 'loss'}
        />
      </div>

      {/* Quick Overview Strip */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="border border-grid-line bg-card p-3 flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
            ACTIVE POSITIONS
          </span>
          <span className="text-lg font-bold text-profit mono-number">
            {activePositions.length}
          </span>
        </div>
        <div className="border border-grid-line bg-card p-3 flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
            UNCONFIGURED
          </span>
          <span className="text-lg font-bold text-warning mono-number blink">
            {unconfiguredPositions.length}
          </span>
        </div>
        <div className="border border-grid-line bg-card p-3 flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
            NEAR BOUND
          </span>
          <span className="text-lg font-bold text-loss mono-number">
            {nearBoundCount}
          </span>
        </div>
        <div className="border border-grid-line bg-card p-3 flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
            POTENTIAL {totalPnL >= 0 ? 'SAVINGS' : 'LOSS'}
          </span>
          <span
            className={cn(
              'text-lg font-bold mono-number',
              totalPnL >= 0 ? 'text-profit' : 'text-loss'
            )}
          >
            {totalPnL >= 0 ? '+' : ''}${Math.abs(totalPnL).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Position Lists */}
      <div className="grid grid-cols-2 gap-4">
        {/* Active Positions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-grid-line bg-card"
        >
          <div className="p-3 border-b border-grid-line flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-profit" />
              ACTIVE POSITIONS
            </span>
            <StatusPill status="ACTIVE" />
          </div>
          <div className="p-3">
            {activePositions.length > 0 ? (
              activePositions.slice(0, 5).map((position) => (
                <QuickPositionRow key={position.id} position={position} />
              ))
            ) : (
              <div className="text-xs text-muted-foreground text-center py-4">
                NO ACTIVE POSITIONS
              </div>
            )}
          </div>
        </motion.div>

        {/* Unconfigured Positions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="border border-warning/50 bg-card animate-pulse-border"
        >
          <div className="p-3 border-b border-grid-line flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              REQUIRES CONFIGURATION
            </span>
            <StatusPill status="UNCONFIGURED" />
          </div>
          <div className="p-3">
            {unconfiguredPositions.length > 0 ? (
              unconfiguredPositions.map((position) => (
                <QuickPositionRow key={position.id} position={position} />
              ))
            ) : (
              <div className="text-xs text-muted-foreground text-center py-4">
                ALL POSITIONS CONFIGURED
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Risk Disclaimer */}
      <div className="mt-6 border border-grid-line bg-muted/50 p-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            CRYPTO CREDIT SETTLEMENT INVOLVES SIGNIFICANT RISK. POSITIONS MAY SETTLE ABOVE PURCHASE PRICE.
            BOUND BREACHES RESULT IN AUTOMATIC SETTLEMENT AT MAX PAYMENT. PAST PERFORMANCE DOES NOT
            GUARANTEE FUTURE RESULTS. REVIEW ALL POSITIONS IN THE TERMINAL BEFORE MARKET CLOSE.
          </p>
        </div>
      </div>
    </main>
  );
};

export default Bank;
