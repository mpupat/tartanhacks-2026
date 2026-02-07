import { useState, useEffect } from 'react';
import { PriceChart } from '@/components/PriceChart';
import { PositionForm } from '@/components/PositionFormNew';
import { PositionMonitor } from '@/components/PositionMonitorNew';
import { MonthlyStatement } from '@/components/MonthlyStatementNew';
import { SpendingHistory } from '@/components/SpendingHistoryNew';
import { DashboardStats } from '@/components/DashboardStatsNew';
import { useXRPPrice } from '@/hooks/useXRPPrice';
import { useXRPL } from '@/context/XRPLProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  CreditCard,
  Receipt,
  BarChart3,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Coins
} from 'lucide-react';

import { auth } from '@/services/apiClient';

const Index = () => {
  const { priceData } = useXRPPrice();
  const { wallet, generateWallet, connectionStatus } = useXRPL();
  const isPositive = priceData.changePercent24h >= 0;

  useEffect(() => {
    auth.loginAsDemo();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur border-b border-amber-500/10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
                CrypTomorrow
              </span>
              <div className="text-[10px] text-amber-500/60 -mt-1">Predict. Save. Win.</div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-white/60 hover:text-amber-400 transition">Home</a>
            <a href="#" className="text-white/60 hover:text-amber-400 transition">Predictions</a>
            <a href="#" className="text-white/60 hover:text-amber-400 transition">Card</a>
            <a href="#" className="text-white/60 hover:text-amber-400 transition">Rewards</a>
          </nav>

          <div className="flex items-center gap-3">
            <span className={`text-xs px-2 py-1 rounded-full ${connectionStatus === 'connected'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
              {connectionStatus === 'connected' ? '● Testnet' : '○ Connecting...'}
            </span>
            {wallet ? (
              <Button variant="outline" size="sm" className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
                <Wallet className="w-4 h-4 mr-2" />
                {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
              </Button>
            ) : (
              <Button
                onClick={generateWallet}
                className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-semibold shadow-lg shadow-amber-500/25"
              >
                Get Started
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Hero Price Section */}
        <div className="mb-8">
          <div className="flex items-baseline gap-3 mb-1">
            <h1 className="text-5xl font-bold tracking-tight">
              ${priceData.price.toFixed(2)}
            </h1>
            <div className={`flex items-center gap-1 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {isPositive ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
              <span className="text-lg font-medium">
                {isPositive ? '+' : ''}{priceData.changePercent24h.toFixed(2)}%
              </span>
            </div>
          </div>
          <p className="text-white/40 text-sm">XRP • Past 24 hours</p>
        </div>

        {/* Price Chart */}
        <div className="mb-8">
          <PriceChart height={250} />

          {/* Time periods */}
          <div className="flex gap-4 mt-4 justify-center">
            {['1H', '1D', '1W', '1M', '1Y', 'ALL'].map((period, i) => (
              <button
                key={period}
                className={`px-4 py-2 rounded-full text-sm transition ${i === 1
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8">
          <DashboardStats />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="predict" className="space-y-6">
          <TabsList className="bg-white/5 border border-amber-500/10 p-1 rounded-xl">
            <TabsTrigger
              value="predict"
              className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 rounded-lg px-4 py-2"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Predict
            </TabsTrigger>
            <TabsTrigger
              value="positions"
              className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 rounded-lg px-4 py-2"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Positions
            </TabsTrigger>
            <TabsTrigger
              value="card"
              className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 rounded-lg px-4 py-2"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Card
            </TabsTrigger>
            <TabsTrigger
              value="statement"
              className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 rounded-lg px-4 py-2"
            >
              <Receipt className="w-4 h-4 mr-2" />
              Statement
            </TabsTrigger>
          </TabsList>

          <TabsContent value="predict">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PositionForm />
              <PositionMonitor />
            </div>
          </TabsContent>

          <TabsContent value="positions">
            <PositionMonitor />
          </TabsContent>

          <TabsContent value="card">
            <SpendingHistory />
          </TabsContent>

          <TabsContent value="statement">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MonthlyStatement />
              <SpendingHistory />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-amber-500/10 mt-12 py-4">
        <div className="container mx-auto px-4 flex items-center justify-between text-xs text-white/30">
          <span>© 2024 CrypTomorrow</span>
          <span className="text-amber-500/50">Powered by XRPL Testnet</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
