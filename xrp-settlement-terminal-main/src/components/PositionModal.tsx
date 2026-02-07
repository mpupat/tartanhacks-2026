import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Position, calculatePnL, getTimeRemaining } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Clock, Target, TrendingUp, Calendar, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Area, ComposedChart } from 'recharts';

interface PositionModalProps {
  position: Position | null;
  currentPrice: number;
  onClose: () => void;
}

export function PositionModal({ position, currentPrice, onClose }: PositionModalProps) {
  if (!position) return null;

  const { pnl, pnlPercent, currentValue } = calculatePnL(position, currentPrice);
  const isPositive = pnl >= 0;
  const timeRemaining = getTimeRemaining(position.timeLimit);

  // Generate mock price history for the chart
  const priceHistory = [];
  const startTime = position.createdAt.getTime();
  const now = new Date().getTime();
  const duration = now - startTime;
  let price = position.entryPrice;
  
  for (let i = 0; i <= 20; i++) {
    price = price + (Math.random() - 0.48) * 0.005;
    price = Math.max(0.50, Math.min(0.70, price));
    priceHistory.push({
      time: new Date(startTime + (duration * i / 20)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      price,
      value: price * position.xrpQuantity,
    });
  }

  const maxBoundPrice = position.maxBound / position.xrpQuantity;
  const minBoundPrice = position.minBound / position.xrpQuantity;

  return (
    <Dialog open={!!position} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-card border-border p-0 gap-0">
        <DialogHeader className="p-4 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold">{position.item}</DialogTitle>
              <span className="text-sm text-muted-foreground">{position.id}</span>
            </div>
            <div className={cn(
              "px-3 py-1 rounded text-sm font-semibold uppercase",
              position.status === 'active' ? "bg-success/10 text-success" : 
              position.status === 'settled' ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
            )}>
              {position.status}
            </div>
          </div>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {/* Price Chart */}
          <div className="terminal-grid p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="terminal-header text-xs">SETTLEMENT WINDOW</span>
              <span className="text-2xs text-muted-foreground">
                {format(position.createdAt, 'MMM d, HH:mm')} → {format(position.timeLimit, 'MMM d, HH:mm')}
              </span>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={priceHistory}>
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border-subtle))' }}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={['auto', 'auto']}
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border-subtle))' }}
                    tickLine={false}
                    tickFormatter={(value) => `$${value.toFixed(4)}`}
                  />
                  <ReferenceLine 
                    y={maxBoundPrice} 
                    stroke="hsl(var(--destructive))" 
                    strokeDasharray="3 3"
                    label={{ value: 'MAX', position: 'right', fontSize: 10, fill: 'hsl(var(--destructive))' }}
                  />
                  <ReferenceLine 
                    y={minBoundPrice} 
                    stroke="hsl(var(--success))" 
                    strokeDasharray="3 3"
                    label={{ value: 'MIN', position: 'right', fontSize: 10, fill: 'hsl(var(--success))' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    fill="hsl(var(--primary) / 0.1)"
                    stroke="none"
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Position Details Grid */}
          <div className="grid grid-cols-4 gap-3">
            <div className="terminal-grid p-3">
              <div className="flex items-center gap-1 mb-1">
                <Target className="w-3 h-3 text-muted-foreground" />
                <span className="terminal-header text-2xs">PURCHASE</span>
              </div>
              <span className="text-lg font-bold terminal-value">
                ${position.purchaseAmount.toFixed(2)}
              </span>
            </div>

            <div className="terminal-grid p-3">
              <div className="flex items-center gap-1 mb-1">
                <TrendingUp className="w-3 h-3 text-muted-foreground" />
                <span className="terminal-header text-2xs">CURRENT</span>
              </div>
              <span className={cn(
                "text-lg font-bold terminal-value",
                isPositive ? "text-success" : "text-destructive"
              )}>
                ${currentValue.toFixed(2)}
              </span>
            </div>

            <div className="terminal-grid p-3">
              <div className="flex items-center gap-1 mb-1">
                <Target className="w-3 h-3 text-muted-foreground" />
                <span className="terminal-header text-2xs">P&L</span>
              </div>
              <span className={cn(
                "text-lg font-bold terminal-value",
                isPositive ? "text-success" : "text-destructive"
              )}>
                {isPositive ? '+' : ''}{pnlPercent.toFixed(2)}%
              </span>
            </div>

            <div className="terminal-grid p-3">
              <div className="flex items-center gap-1 mb-1">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="terminal-header text-2xs">TIME LEFT</span>
              </div>
              <span className="text-lg font-bold terminal-value text-accent">
                {timeRemaining}
              </span>
            </div>
          </div>

          {/* Bounds Configuration */}
          <div className="terminal-grid p-3">
            <div className="flex items-center justify-between mb-3">
              <span className="terminal-header text-xs">BOUNDS CONFIGURATION</span>
              <Button variant="outline" size="sm" className="h-7 text-xs border-border hover:border-primary hover:text-primary">
                <Edit className="w-3 h-3 mr-1" />
                MODIFY
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Max Payment (Bounce if exceeded)</span>
                  <span className="text-destructive font-bold">${position.maxBound.toFixed(2)}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full relative">
                  <div 
                    className="absolute left-0 h-full bg-gradient-to-r from-success via-accent to-destructive rounded-full"
                    style={{ width: '100%' }}
                  />
                  <div 
                    className="absolute w-3 h-3 bg-foreground rounded-full -top-0.5 border-2 border-background"
                    style={{ 
                      left: `${((currentValue - position.minBound) / (position.maxBound - position.minBound)) * 100}%`,
                      transform: 'translateX(-50%)'
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Min Payment (Target settlement)</span>
                  <span className="text-success font-bold">${position.minBound.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Settlement Window:</span>
                <span className="font-semibold">
                  {format(position.createdAt, 'MMM d')} - {format(position.timeLimit, 'MMM d, yyyy')}
                </span>
              </div>
            </div>
          </div>

          {/* XRP Details */}
          <div className="terminal-grid p-3">
            <span className="terminal-header text-xs block mb-2">XRP POSITION DETAILS</span>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block">Quantity</span>
                <span className="font-bold terminal-value">{position.xrpQuantity.toFixed(6)} XRP</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Entry Price</span>
                <span className="font-bold terminal-value">${position.entryPrice.toFixed(6)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Current Price</span>
                <span className={cn(
                  "font-bold terminal-value",
                  currentPrice >= position.entryPrice ? "text-success" : "text-destructive"
                )}>
                  ${currentPrice.toFixed(6)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}