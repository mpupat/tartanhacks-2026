import { useState } from 'react';
import { Clock, AlertTriangle, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Position, calculatePnL, getTimeRemaining, getPositionRisk } from '@/data/mockData';
import { PositionModal } from './PositionModal';

interface PositionsGridProps {
  positions: Position[];
  currentPrice: number;
}

export function PositionsGrid({ positions, currentPrice }: PositionsGridProps) {
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);

  const getStatusIcon = (status: Position['status']) => {
    switch (status) {
      case 'active':
        return <Clock className="w-3 h-3" />;
      case 'settled':
        return <CheckCircle className="w-3 h-3" />;
      case 'bounced':
        return <XCircle className="w-3 h-3" />;
    }
  };

  const getStatusColor = (status: Position['status']) => {
    switch (status) {
      case 'active':
        return 'text-success border-success/30 bg-success/5';
      case 'settled':
        return 'text-success border-success/30 bg-success/5';
      case 'bounced':
        return 'text-destructive border-destructive/30 bg-destructive/5';
    }
  };

  const getRiskIndicator = (risk: 'safe' | 'warning' | 'danger') => {
    switch (risk) {
      case 'safe':
        return null;
      case 'warning':
        return <AlertTriangle className="w-3 h-3 text-accent" />;
      case 'danger':
        return <AlertTriangle className="w-3 h-3 text-destructive animate-pulse" />;
    }
  };

  return (
    <>
      <div className="terminal-grid">
        <div className="p-3 border-b border-border-subtle flex items-center justify-between">
          <h3 className="terminal-header text-xs">ACTIVE POSITIONS</h3>
          <span className="text-2xs text-muted-foreground">{positions.length} OPEN</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="terminal-header text-left p-3">ITEM</th>
                <th className="terminal-header text-right p-3">PURCHASE</th>
                <th className="terminal-header text-right p-3">XRP QTY</th>
                <th className="terminal-header text-right p-3">CURRENT</th>
                <th className="terminal-header text-center p-3">BOUNDS</th>
                <th className="terminal-header text-right p-3">P&L</th>
                <th className="terminal-header text-center p-3">TIME</th>
                <th className="terminal-header text-center p-3">STATUS</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {positions.map((position) => {
                const { pnl, pnlPercent, currentValue } = calculatePnL(position, currentPrice);
                const risk = getPositionRisk(position, currentPrice);
                const timeRemaining = getTimeRemaining(position.timeLimit);
                const isTimeUrgent = timeRemaining.includes('h') && !timeRemaining.includes('d');
                const isPositive = pnl >= 0;

                return (
                  <tr
                    key={position.id}
                    onClick={() => setSelectedPosition(position)}
                    className="border-b border-border-subtle hover:bg-secondary/30 cursor-pointer transition-colors"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getRiskIndicator(risk)}
                        <div>
                          <span className="font-medium">{position.item}</span>
                          <span className="block text-2xs text-muted-foreground">{position.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-right terminal-value">
                      ${position.purchaseAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right terminal-value text-muted-foreground">
                      {position.xrpQuantity.toFixed(2)}
                    </td>
                    <td className="p-3 text-right terminal-value">
                      ${currentValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col items-center text-2xs">
                        <span className="text-destructive">${position.maxBound.toFixed(0)}</span>
                        <div className="w-12 h-1 bg-secondary rounded my-1 relative">
                          <div
                            className="absolute h-full bg-success rounded"
                            style={{
                              left: `${((position.minBound - position.minBound) / (position.maxBound - position.minBound)) * 100}%`,
                              width: `${((currentValue - position.minBound) / (position.maxBound - position.minBound)) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-success">${position.minBound.toFixed(0)}</span>
                      </div>
                    </td>
                    <td className={cn(
                      "p-3 text-right terminal-value",
                      isPositive ? "text-success" : "text-destructive"
                    )}>
                      <div>
                        {isPositive ? '+' : ''}${pnl.toFixed(2)}
                      </div>
                      <div className="text-2xs">
                        {isPositive ? '+' : ''}{pnlPercent.toFixed(2)}%
                      </div>
                    </td>
                    <td className={cn(
                      "p-3 text-center terminal-value text-sm",
                      isTimeUrgent ? "text-accent" : "text-muted-foreground"
                    )}>
                      {timeRemaining}
                    </td>
                    <td className="p-3">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-1 rounded text-2xs uppercase border",
                        getStatusColor(position.status)
                      )}>
                        {getStatusIcon(position.status)}
                        {position.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <PositionModal
        position={selectedPosition}
        currentPrice={currentPrice}
        onClose={() => setSelectedPosition(null)}
      />
    </>
  );
}