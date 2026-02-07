import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';
import {
  TrendingUp, TrendingDown, AlertCircle, DollarSign,
  Activity, Target, ArrowUpRight, ArrowDownRight, Wallet, Compass
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { calculatePositionPnL, CATEGORY_CONFIG } from '@/services/kalshiService';

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
          'text-2xl font-bold',
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

const Bank = () => {
  const navigate = useNavigate();
  const { balance, creditOutstanding, positions } = useAppStore();

  const activePositions = positions.filter(p => p.status === 'active');
  const unconfiguredPositions = positions.filter(p => p.status === 'unconfigured');
  const settledPositions = positions.filter(p => p.status === 'settled');

  // Calculate total P&L for active positions
  const totalPnL = activePositions.reduce((sum, pos) => {
    const { pnl } = calculatePositionPnL(pos);
    return sum + pnl;
  }, 0);

  // Calculate total settled cashback
  const totalCashback = settledPositions.reduce((sum, pos) => {
    return sum + (pos.cashback_amount || 0);
  }, 0);

  // Win rate
  const wins = settledPositions.filter(p => p.final_outcome === 'win').length;
  const winRate = settledPositions.length > 0
    ? Math.round((wins / settledPositions.length) * 100)
    : 0;

  return (
    <main className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold tracking-tight mb-2"
        >
          Dashboard
        </motion.h1>
        <p className="text-muted-foreground">
          Track your positions and cashback earnings
        </p>
      </div>

      {/* Unconfigured Alert */}
      {unconfiguredPositions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-800">
                  {unconfiguredPositions.length} purchase{unconfiguredPositions.length > 1 ? 's' : ''} need configuration
                </h3>
                <p className="text-sm text-amber-700">
                  Configure your predictions to start earning cashback
                </p>
              </div>
            </div>
            <Button onClick={() => navigate('/terminal')} variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-100">
              Configure Now
            </Button>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatCard
            label="Account Balance"
            value={`$${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            icon={Wallet}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatCard
            label="Active P&L"
            value={`${totalPnL >= 0 ? '+' : ''}$${totalPnL.toFixed(2)}`}
            subValue={`${activePositions.length} active positions`}
            icon={totalPnL >= 0 ? TrendingUp : TrendingDown}
            variant={totalPnL >= 0 ? 'profit' : 'loss'}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StatCard
            label="Total Cashback"
            value={`${totalCashback >= 0 ? '+' : ''}$${totalCashback.toFixed(2)}`}
            subValue={`${settledPositions.length} settled positions`}
            icon={DollarSign}
            variant={totalCashback >= 0 ? 'profit' : 'loss'}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <StatCard
            label="Win Rate"
            value={`${winRate}%`}
            subValue={`${wins}/${settledPositions.length} predictions won`}
            icon={Target}
            variant={winRate >= 50 ? 'profit' : 'default'}
          />
        </motion.div>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Positions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl border border-border shadow-card"
        >
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold">Active Positions</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/terminal')}>
              View All
            </Button>
          </div>
          <div className="p-5">
            {activePositions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No active positions</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activePositions.slice(0, 4).map((position) => {
                  const { pnl, pnlPercent, isWinning } = calculatePositionPnL(position);
                  const categoryConfig = position.market_category ? CATEGORY_CONFIG[position.market_category] : null;

                  return (
                    <div key={position.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{position.purchase.item_icon}</span>
                        <div>
                          <p className="font-medium text-sm">{position.purchase.item_name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {categoryConfig && (
                              <span>{categoryConfig.icon}</span>
                            )}
                            <span>{position.prediction_direction} @ {position.entry_price}¢</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={cn(
                          'flex items-center gap-1 text-sm font-semibold',
                          isWinning ? 'text-emerald-600' : 'text-red-500'
                        )}>
                          {isWinning ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4" />
                          )}
                          {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl border border-border shadow-card"
        >
          <div className="p-5 border-b border-border">
            <h2 className="font-semibold">Quick Actions</h2>
          </div>
          <div className="p-5 space-y-3">
            <button
              onClick={() => navigate('/shop')}
              className="w-full flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted transition-colors text-left"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Shop</h3>
                <p className="text-sm text-muted-foreground">Browse products and make a purchase</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/explorer')}
              className="w-full flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted transition-colors text-left"
            >
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Compass className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Explore Markets</h3>
                <p className="text-sm text-muted-foreground">Discover Kalshi prediction markets</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/terminal')}
              className="w-full flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted transition-colors text-left"
            >
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Manage Positions</h3>
                <p className="text-sm text-muted-foreground">Configure predictions and track P&L</p>
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default Bank;
