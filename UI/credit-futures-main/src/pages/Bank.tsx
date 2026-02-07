import { motion } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { usePositionCalculations } from '@/hooks/usePositionCalculations';
import { StatusPill } from '@/components/ui/StatusPill';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, AlertCircle, DollarSign, CreditCard, Activity, Target, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';

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
    <div className="bg-white rounded-xl border border-border p-5 shadow-card">
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm text-muted-foreground font-medium">
          {label}
        </span>
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center',
          variant === 'profit' && 'bg-emerald-50',
          variant === 'loss' && 'bg-red-50',
          variant === 'warning' && 'bg-amber-50',
          variant === 'default' && 'bg-gray-100'
        )}>
          <Icon
            className={cn(
              'w-5 h-5',
              variant === 'profit' && 'text-emerald-600',
              variant === 'loss' && 'text-red-500',
              variant === 'warning' && 'text-amber-600',
              variant === 'default' && 'text-gray-600'
            )}
          />
        </div>
      </div>
      <div
        className={cn(
          'text-2xl font-bold mono-number',
          variant === 'profit' && 'text-emerald-600',
          variant === 'loss' && 'text-red-500',
          variant === 'warning' && 'text-amber-600',
          variant === 'default' && 'text-foreground'
        )}
      >
        {value}
      </div>
      {subValue && (
        <div className="text-sm text-muted-foreground mt-1">{subValue}</div>
      )}
    </div>
  );
};

const QuickPositionRow = ({ position }: { position: any }) => {
  const calc = usePositionCalculations(position);

  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-3">
        <StatusPill status={position.status} />
        <span className="text-sm font-medium">{position.productName}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground mono-number">
          ${position.purchaseAmount.toFixed(2)}
        </span>
        <div className="flex items-center gap-1">
          {calc.isProfit ? (
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          ) : calc.isLoss ? (
            <ArrowDownRight className="w-4 h-4 text-red-500" />
          ) : null}
          <span
            className={cn(
              'text-sm font-semibold mono-number',
              calc.isProfit ? 'text-emerald-600' : calc.isLoss ? 'text-red-500' : 'text-muted-foreground'
            )}
          >
            {calc.isProfit ? '+' : ''}{calc.pnlPercent.toFixed(2)}%
          </span>
        </div>
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
    <main className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-1">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Your portfolio overview • Updated live
        </p>
      </div>

      {/* Hero Balance Card */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-2xl p-8 mb-8 text-white shadow-premium">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-blue-200 text-sm font-medium">Available Balance</div>
                <div className="text-3xl font-bold mono-number">
                  ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
            <p className="text-blue-200 text-sm">
              Ready for withdrawal or new predictions
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-blue-200 text-sm mb-1">Credit Outstanding</div>
              <div className="text-xl font-bold mono-number">
                ${creditOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-blue-200 text-sm mb-1">Expected Payback</div>
              <div className={cn(
                'text-xl font-bold mono-number',
                totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'
              )}>
                ${expectedPayback.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-border p-4 shadow-card flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Active Predictions
          </span>
          <span className="text-2xl font-bold text-primary mono-number">
            {activePositions.length}
          </span>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 shadow-card flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Pending Setup
          </span>
          <span className="text-2xl font-bold text-amber-600 mono-number">
            {unconfiguredPositions.length}
          </span>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 shadow-card flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Near Limit
          </span>
          <span className="text-2xl font-bold text-red-500 mono-number">
            {nearBoundCount}
          </span>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 shadow-card flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Potential {totalPnL >= 0 ? 'Winback' : 'Cost'}
          </span>
          <span
            className={cn(
              'text-2xl font-bold mono-number',
              totalPnL >= 0 ? 'text-emerald-600' : 'text-red-500'
            )}
          >
            {totalPnL >= 0 ? '+' : ''}${Math.abs(totalPnL).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Position Lists */}
      <div className="grid grid-cols-2 gap-6">
        {/* Active Positions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-border shadow-card"
        >
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span className="font-semibold">Active Predictions</span>
            </div>
            <StatusPill status="ACTIVE" />
          </div>
          <div className="p-5">
            {activePositions.length > 0 ? (
              activePositions.slice(0, 5).map((position) => (
                <QuickPositionRow key={position.id} position={position} />
              ))
            ) : (
              <div className="text-sm text-muted-foreground text-center py-8">
                No active predictions
              </div>
            )}
          </div>
        </motion.div>

        {/* Unconfigured Positions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border-2 border-amber-200 shadow-card"
        >
          <div className="p-5 border-b border-border flex items-center justify-between bg-amber-50 rounded-t-xl">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <span className="font-semibold text-amber-800">Needs Setup</span>
            </div>
            <StatusPill status="UNCONFIGURED" />
          </div>
          <div className="p-5">
            {unconfiguredPositions.length > 0 ? (
              unconfiguredPositions.map((position) => (
                <QuickPositionRow key={position.id} position={position} />
              ))
            ) : (
              <div className="text-sm text-muted-foreground text-center py-8">
                All predictions configured ✓
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Risk Disclaimer */}
      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700 leading-relaxed">
            Predictions involve risk. Positions may settle above purchase price if your prediction is incorrect.
            Reaching your limit triggers automatic settlement. Review all predictions before market close.
          </p>
        </div>
      </div>
    </main>
  );
};

export default Bank;
