import { useMemo } from 'react';
import { Header } from '@/components/Header';
import { PriceTicker } from '@/components/PriceTicker';
import { PortfolioSummary } from '@/components/PortfolioSummary';
import { PositionsGrid } from '@/components/PositionsGrid';
import { ActivityFeed } from '@/components/ActivityFeed';
import { MiniChart } from '@/components/MiniChart';
import { useXRPPrice } from '@/hooks/useXRPPrice';
import { mockPositions, mockActivities, calculatePnL } from '@/data/mockData';

const Index = () => {
  const { priceData, priceHistory, hasUpdated } = useXRPPrice();

  const portfolioStats = useMemo(() => {
    let totalCredit = 0;
    let totalXRPValue = 0;
    let netPnL = 0;

    mockPositions.forEach(position => {
      totalCredit += position.purchaseAmount;
      const { currentValue, pnl } = calculatePnL(position, priceData.price);
      totalXRPValue += currentValue;
      netPnL += pnl;
    });

    const netPnLPercent = totalCredit > 0 ? (netPnL / totalCredit) * 100 : 0;

    return {
      totalCredit,
      totalXRPValue,
      netPnL,
      netPnLPercent,
      successRate: 78.5,
      activePositions: mockPositions.length,
    };
  }, [priceData.price]);

  const chartData = priceHistory.map(p => ({ price: p.price }));

  return (
    <div className="min-h-screen bg-background">
      <Header currentPrice={priceData.price} />

      {/* Ticker Tape */}
      <div className="border-b border-border-subtle bg-card/30 overflow-hidden">
        <div className="flex items-center gap-8 py-2 px-4 ticker-tape whitespace-nowrap">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-8">
              <span className="text-sm">
                <span className="text-muted-foreground">XRP/USD</span>
                <span className="ml-2 text-success">${priceData.price.toFixed(6)}</span>
              </span>
              <span className="text-sm">
                <span className="text-muted-foreground">BTC/USD</span>
                <span className="ml-2 text-success">$67,842.50</span>
              </span>
              <span className="text-sm">
                <span className="text-muted-foreground">ETH/USD</span>
                <span className="ml-2 text-destructive">$3,521.18</span>
              </span>
              <span className="text-sm">
                <span className="text-muted-foreground">SOL/USD</span>
                <span className="ml-2 text-success">$172.45</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <main className="container px-4 py-4">
        {/* Top Row: Price + Portfolio + Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
          <div className="lg:col-span-5">
            <PriceTicker
              price={priceData.price}
              change24h={priceData.change24h}
              changePercent24h={priceData.changePercent24h}
              high24h={priceData.high24h}
              low24h={priceData.low24h}
              volume24h={priceData.volume24h}
              hasUpdated={hasUpdated}
            />
          </div>

          <div className="lg:col-span-4">
            <PortfolioSummary {...portfolioStats} />
          </div>

          <div className="lg:col-span-3">
            <div className="terminal-grid p-4 h-full flex flex-col justify-center">
              <div className="flex items-center justify-between mb-2">
                <span className="terminal-header text-xs">60M TREND</span>
                <span className={priceData.changePercent24h >= 0 ? 'text-success text-sm' : 'text-destructive text-sm'}>
                  {priceData.changePercent24h >= 0 ? '+' : ''}{priceData.changePercent24h.toFixed(2)}%
                </span>
              </div>
              <div className="flex-1 min-h-[100px]">
                <MiniChart data={chartData} isPositive={priceData.changePercent24h >= 0} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content: Positions + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-9">
            <PositionsGrid positions={mockPositions} currentPrice={priceData.price} />
          </div>

          <div className="lg:col-span-3">
            <ActivityFeed activities={mockActivities} />
          </div>
        </div>

        {/* Footer Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="terminal-grid p-3 text-center">
            <span className="terminal-header text-2xs block mb-1">TOTAL SETTLED</span>
            <span className="text-lg font-bold text-success">$24,892.45</span>
          </div>
          <div className="terminal-grid p-3 text-center">
            <span className="terminal-header text-2xs block mb-1">TOTAL SAVINGS</span>
            <span className="text-lg font-bold text-success">+$2,847.32</span>
          </div>
          <div className="terminal-grid p-3 text-center">
            <span className="terminal-header text-2xs block mb-1">AVG SETTLEMENT</span>
            <span className="text-lg font-bold">-8.4%</span>
          </div>
          <div className="terminal-grid p-3 text-center">
            <span className="terminal-header text-2xs block mb-1">BOUNCED</span>
            <span className="text-lg font-bold text-destructive">3</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle mt-8 py-3">
        <div className="container px-4 flex items-center justify-between text-2xs text-muted-foreground">
          <span>NEXUS CREDIT SETTLEMENT PLATFORM v2.4.1</span>
          <span>MARKET DATA DELAYED 15 MIN • FOR SIMULATION PURPOSES ONLY</span>
          <span>© 2024 NEXUS FINANCIAL</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;