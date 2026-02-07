import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Clock, AlertCircle, CheckCircle, TrendingUp, TrendingDown,
  Settings, X, Star, ArrowRight, Compass, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/appStore';
import type { Position, KalshiMarket, MarketCategory, PredictionDirection } from '@/types/kalshi';
import { fetchMarkets, CATEGORY_CONFIG, formatTimeRemaining, calculatePositionPnL } from '@/services/kalshiService';

type TabType = 'all' | 'unconfigured' | 'active' | 'settled';

export default function Terminal() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { positions, savedMarkets, configurePosition, updatePositionPrice } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [configuringPosition, setConfiguringPosition] = useState<Position | null>(null);

  // Get pre-selected market from URL if coming from Explorer
  const preselectedMarket = searchParams.get('market');

  // Count positions by status
  const unconfiguredCount = positions.filter(p => p.status === 'unconfigured').length;
  const activeCount = positions.filter(p => p.status === 'active').length;
  const settledCount = positions.filter(p => p.status === 'settled').length;

  // Filter positions by tab
  const filteredPositions = positions.filter(p => {
    if (activeTab === 'all') return true;
    return p.status === activeTab;
  });

  // Auto-open configuration if unconfigured positions and came from explorer
  useEffect(() => {
    if (preselectedMarket && unconfiguredCount > 0) {
      const unconfigured = positions.find(p => p.status === 'unconfigured');
      if (unconfigured) {
        setConfiguringPosition(unconfigured);
      }
    }
  }, [preselectedMarket]);

  // Simulate price updates every 10 seconds for active positions
  useEffect(() => {
    const interval = setInterval(() => {
      positions.filter(p => p.status === 'active').forEach(position => {
        if (position.current_price) {
          const change = (Math.random() - 0.5) * 4;
          const newPrice = Math.max(1, Math.min(99, Math.round(position.current_price + change)));
          updatePositionPrice(position.id, newPrice);
        }
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [positions]);

  const tabs: { value: TabType; label: string; count?: number }[] = [
    { value: 'all', label: 'All' },
    { value: 'unconfigured', label: 'Unconfigured', count: unconfiguredCount },
    { value: 'active', label: 'Active', count: activeCount },
    { value: 'settled', label: 'Settled', count: settledCount },
  ];

  return (
    <main className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Positions</h1>
        <p className="text-muted-foreground">
          Manage your purchases and predictions
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              activeTab === tab.value
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className={cn(
                'px-2 py-0.5 rounded-full text-xs font-bold',
                activeTab === tab.value
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Positions Grid */}
      {filteredPositions.length === 0 ? (
        <EmptyState tab={activeTab} onNavigate={() => navigate('/shop')} />
      ) : (
        <div className="space-y-4">
          {filteredPositions.map((position, index) => (
            <motion.div
              key={position.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <PositionCard
                position={position}
                onConfigure={() => setConfiguringPosition(position)}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Configuration Modal */}
      {configuringPosition && (
        <ConfigurationModal
          position={configuringPosition}
          preselectedMarket={preselectedMarket}
          onClose={() => setConfiguringPosition(null)}
          onConfigure={configurePosition}
        />
      )}
    </main>
  );
}

// ============================================
// POSITION CARD COMPONENT
// ============================================

function PositionCard({
  position,
  onConfigure
}: {
  position: Position;
  onConfigure: () => void;
}) {
  if (position.status === 'unconfigured') {
    return <UnconfiguredCard position={position} onConfigure={onConfigure} />;
  }
  if (position.status === 'active') {
    return <ActiveCard position={position} />;
  }
  return <SettledCard position={position} />;
}

function UnconfiguredCard({ position, onConfigure }: { position: Position; onConfigure: () => void }) {
  const daysSincePurchase = Math.floor(
    (Date.now() - new Date(position.purchase.purchase_date).getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysRemaining = 7 - daysSincePurchase;

  return (
    <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{position.purchase.item_icon}</span>
            <div>
              <h3 className="font-semibold text-lg">{position.purchase.item_name}</h3>
              <p className="text-sm text-muted-foreground">
                Purchased {daysSincePurchase === 0 ? 'today' : `${daysSincePurchase}d ago`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <div className="text-2xl font-bold">
              ${position.purchase.purchase_amount.toFixed(2)}
            </div>
            <div className="flex items-center gap-1 text-amber-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Configure within {daysRemaining} days</span>
            </div>
          </div>
        </div>

        <Button onClick={onConfigure} className="gap-2">
          <Settings className="w-4 h-4" />
          Configure Prediction
        </Button>
      </div>
    </div>
  );
}

function ActiveCard({ position }: { position: Position }) {
  const { pnl, pnlPercent, isWinning } = calculatePositionPnL(position);
  const categoryConfig = position.market_category ? CATEGORY_CONFIG[position.market_category] : null;

  const priceChange = position.current_price && position.entry_price
    ? position.current_price - position.entry_price
    : 0;

  return (
    <div className={cn(
      'border-2 rounded-xl p-6 transition-colors',
      isWinning
        ? 'bg-emerald-50 border-emerald-200'
        : 'bg-red-50 border-red-200'
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{position.purchase.item_icon}</span>
          <div>
            <h3 className="font-semibold text-lg">{position.purchase.item_name}</h3>
            <p className="text-sm text-muted-foreground">
              ${position.purchase.purchase_amount.toFixed(2)}
            </p>
          </div>
        </div>

        <div className={cn(
          'flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold',
          isWinning ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
        )}>
          {isWinning ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {isWinning ? 'WINNING' : 'LOSING'}
        </div>
      </div>

      {/* Market Info */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          {categoryConfig && (
            <span className={cn(
              'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border',
              categoryConfig.color
            )}>
              {categoryConfig.icon} {categoryConfig.label}
            </span>
          )}
        </div>
        <p className="font-medium">{position.market_title}</p>
        <div className="flex items-center gap-4 mt-2 text-sm">
          <span>Your bet: <strong>{position.prediction_direction}</strong> at {position.entry_price}¢</span>
          <span className={cn(
            'flex items-center gap-1',
            priceChange >= 0 ? 'text-emerald-600' : 'text-red-500'
          )}>
            Now: {position.current_price}¢
            ({priceChange >= 0 ? '+' : ''}{priceChange}¢)
          </span>
        </div>
      </div>

      {/* P&L and Thresholds */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-sm text-muted-foreground mb-1">Current P&L</div>
          <div className={cn(
            'text-xl font-bold',
            isWinning ? 'text-emerald-600' : 'text-red-500'
          )}>
            {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} ({pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(1)}%)
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-muted-foreground mb-1">Max Reward</div>
          <div className="font-semibold text-emerald-600">
            +{position.max_reward_percent}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-muted-foreground mb-1">Max Loss</div>
          <div className="font-semibold text-red-500">
            -{position.max_loss_percent}%
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-500',
              isWinning ? 'bg-emerald-500' : 'bg-red-500'
            )}
            style={{
              width: `${Math.min(100, Math.abs(pnlPercent) / (position.max_reward_percent || 20) * 100)}%`
            }}
          />
        </div>
      </div>

      {/* Time Remaining */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>Expires: {position.expires_at ? formatTimeRemaining(position.expires_at) : 'N/A'}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>Market closes: {position.market_closes_at ? formatTimeRemaining(position.market_closes_at) : 'N/A'}</span>
        </div>
      </div>
    </div>
  );
}

function SettledCard({ position }: { position: Position }) {
  const isWin = position.final_outcome === 'win';

  return (
    <div className={cn(
      'border rounded-xl p-6',
      isWin ? 'bg-emerald-50/50 border-emerald-200' : 'bg-red-50/50 border-red-200'
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{position.purchase.item_icon}</span>
          <div>
            <h3 className="font-semibold">{position.purchase.item_name}</h3>
            <p className="text-sm text-muted-foreground">
              {position.market_title}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className={cn(
            'flex items-center gap-1 justify-end mb-1',
            isWin ? 'text-emerald-600' : 'text-red-500'
          )}>
            {isWin ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
            <span className="font-semibold">{isWin ? 'WON' : 'LOST'}</span>
          </div>
          <div className={cn(
            'text-lg font-bold',
            isWin ? 'text-emerald-600' : 'text-red-500'
          )}>
            {position.cashback_amount && position.cashback_amount >= 0 ? '+' : ''}
            ${position.cashback_amount?.toFixed(2)} ({position.roi}%)
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Settled: {position.settlement_reason?.replace(/_/g, ' ')}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// EMPTY STATE
// ============================================

function EmptyState({ tab, onNavigate }: { tab: TabType; onNavigate: () => void }) {
  const messages: Record<TabType, { title: string; description: string }> = {
    all: { title: 'No positions yet', description: 'Make a purchase to get started' },
    unconfigured: { title: 'All caught up!', description: 'No purchases need configuration' },
    active: { title: 'No active positions', description: 'Configure a prediction to start trading' },
    settled: { title: 'No settled positions', description: 'Your completed trades will appear here' },
  };

  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
        <TrendingUp className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{messages[tab].title}</h3>
      <p className="text-muted-foreground mb-6">{messages[tab].description}</p>
      {tab === 'all' && (
        <Button onClick={onNavigate}>Browse Shop</Button>
      )}
    </div>
  );
}

// ============================================
// CONFIGURATION MODAL
// ============================================

function ConfigurationModal({
  position,
  preselectedMarket,
  onClose,
  onConfigure,
}: {
  position: Position;
  preselectedMarket: string | null;
  onClose: () => void;
  onConfigure: (
    id: string,
    marketTicker: string,
    marketTitle: string,
    marketCategory: MarketCategory,
    marketClosesAt: string,
    direction: PredictionDirection,
    entryPrice: number,
    maxRewardPercent: number,
    maxLossPercent: number,
    timeLimitDays: number
  ) => void;
}) {
  const navigate = useNavigate();
  const { savedMarkets } = useAppStore();
  const [step, setStep] = useState(1);
  const [markets, setMarkets] = useState<KalshiMarket[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<KalshiMarket | null>(null);
  const [direction, setDirection] = useState<PredictionDirection>('YES');
  const [maxReward, setMaxReward] = useState(20);
  const [maxLoss, setMaxLoss] = useState(5);
  const [timeLimit, setTimeLimit] = useState(7);

  useEffect(() => {
    fetchMarkets({ status: 'open', sortBy: 'trending' }).then(data => {
      setMarkets(data);
      // Pre-select market if coming from explorer
      if (preselectedMarket) {
        const market = data.find(m => m.ticker === preselectedMarket);
        if (market) {
          setSelectedMarket(market);
          setStep(2);
        }
      }
    });
  }, [preselectedMarket]);

  const handleConfirm = () => {
    if (!selectedMarket) return;

    const entryPrice = direction === 'YES' ? selectedMarket.yes_price : selectedMarket.no_price;

    onConfigure(
      position.id,
      selectedMarket.ticker,
      selectedMarket.title,
      selectedMarket.category,
      selectedMarket.close_date,
      direction,
      entryPrice,
      maxReward,
      maxLoss,
      timeLimit
    );
    onClose();
  };

  const savedMarketsList = markets.filter(m => savedMarkets.some(s => s.ticker === m.ticker));
  const trendingMarkets = markets.slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-border p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Configure Prediction</h2>
            <p className="text-sm text-muted-foreground">
              Step {step} of 3 • {position.purchase.item_name}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Step 1: Select Market */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Select a Kalshi Market</h3>

                {savedMarketsList.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-medium">Saved Markets</span>
                    </div>
                    <div className="space-y-2">
                      {savedMarketsList.map(market => (
                        <MarketSelectItem
                          key={market.ticker}
                          market={market}
                          selected={selectedMarket?.ticker === market.ticker}
                          onSelect={() => setSelectedMarket(market)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Trending Markets</span>
                  </div>
                  <div className="space-y-2">
                    {trendingMarkets.map(market => (
                      <MarketSelectItem
                        key={market.ticker}
                        market={market}
                        selected={selectedMarket?.ticker === market.ticker}
                        onSelect={() => setSelectedMarket(market)}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => navigate('/explorer')}
                  className="w-full mt-4 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                >
                  <Compass className="w-4 h-4" />
                  Browse All Markets
                </button>
              </div>

              <Button
                onClick={() => setStep(2)}
                disabled={!selectedMarket}
                className="w-full"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 2: Choose Direction */}
          {step === 2 && selectedMarket && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">{selectedMarket.title}</h3>
                <p className="text-sm text-muted-foreground mb-6">{selectedMarket.subtitle}</p>

                <div className="text-sm font-medium mb-3">I predict:</div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setDirection('YES')}
                    className={cn(
                      'p-6 rounded-xl border-2 text-center transition-all',
                      direction === 'YES'
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-border hover:border-emerald-300'
                    )}
                  >
                    <div className="text-2xl font-bold text-emerald-600 mb-1">YES</div>
                    <div className="text-lg font-semibold">{selectedMarket.yes_price}¢</div>
                    <div className="text-sm text-muted-foreground">
                      ({selectedMarket.yes_price}% likely)
                    </div>
                  </button>
                  <button
                    onClick={() => setDirection('NO')}
                    className={cn(
                      'p-6 rounded-xl border-2 text-center transition-all',
                      direction === 'NO'
                        ? 'border-red-500 bg-red-50'
                        : 'border-border hover:border-red-300'
                    )}
                  >
                    <div className="text-2xl font-bold text-red-600 mb-1">NO</div>
                    <div className="text-lg font-semibold">{selectedMarket.no_price}¢</div>
                    <div className="text-sm text-muted-foreground">
                      ({selectedMarket.no_price}% likely)
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1">
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Set Thresholds */}
          {step === 3 && selectedMarket && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Set Your Thresholds</h3>

                {/* Max Reward */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Max Cashback Reward</label>
                    <span className="text-emerald-600 font-semibold">{maxReward}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={maxReward}
                    onChange={(e) => setMaxReward(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-sm text-muted-foreground mt-1">
                    = ${(position.purchase.purchase_amount * maxReward / 100).toFixed(2)} cashback
                  </div>
                </div>

                {/* Max Loss */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Max Additional Charge</label>
                    <span className="text-red-500 font-semibold">{maxLoss}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="25"
                    value={maxLoss}
                    onChange={(e) => setMaxLoss(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-sm text-muted-foreground mt-1">
                    = ${(position.purchase.purchase_amount * maxLoss / 100).toFixed(2)} charge
                  </div>
                </div>

                {/* Time Limit */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Time Limit</label>
                    <span className="font-semibold">{timeLimit} days</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="bg-muted/50 rounded-xl p-4">
                <h4 className="font-semibold mb-3">Prediction Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Market</span>
                    <span className="font-medium">{selectedMarket.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Your Bet</span>
                    <span className="font-medium">
                      {direction} at {direction === 'YES' ? selectedMarket.yes_price : selectedMarket.no_price}¢
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Purchase</span>
                    <span className="font-medium">${position.purchase.purchase_amount.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-border pt-2 mt-2">
                    <div className="flex justify-between text-emerald-600">
                      <span>Best Case</span>
                      <span className="font-semibold">
                        +${(position.purchase.purchase_amount * maxReward / 100).toFixed(2)} ({maxReward}%)
                      </span>
                    </div>
                    <div className="flex justify-between text-red-500">
                      <span>Worst Case</span>
                      <span className="font-semibold">
                        -${(position.purchase.purchase_amount * maxLoss / 100).toFixed(2)} ({maxLoss}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleConfirm} className="flex-1">
                  Confirm Prediction
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MarketSelectItem({
  market,
  selected,
  onSelect
}: {
  market: KalshiMarket;
  selected: boolean;
  onSelect: () => void;
}) {
  const categoryConfig = CATEGORY_CONFIG[market.category];

  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all',
        selected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/30'
      )}
    >
      <span className={cn(
        'w-10 h-10 rounded-lg flex items-center justify-center text-lg',
        categoryConfig.color.replace('text-', 'bg-').replace('border-', '').split(' ')[0]
      )}>
        {categoryConfig.icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{market.title}</div>
        <div className="text-sm text-muted-foreground">
          YES: {market.yes_price}¢ • {formatTimeRemaining(market.close_date)}
        </div>
      </div>
      <div className={cn(
        'w-5 h-5 rounded-full border-2 flex items-center justify-center',
        selected ? 'border-primary bg-primary' : 'border-muted-foreground'
      )}>
        {selected && <div className="w-2 h-2 bg-white rounded-full" />}
      </div>
    </button>
  );
}
