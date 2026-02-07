import { Wallet, TrendingUp, Target, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PortfolioSummaryProps {
  totalCredit: number;
  totalXRPValue: number;
  netPnL: number;
  netPnLPercent: number;
  successRate: number;
  activePositions: number;
}

export function PortfolioSummary({
  totalCredit,
  totalXRPValue,
  netPnL,
  netPnLPercent,
  successRate,
  activePositions,
}: PortfolioSummaryProps) {
  const isPositive = netPnL >= 0;

  return (
    <div className="terminal-grid p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="terminal-header text-xs">PORTFOLIO SUMMARY</h3>
        <span className="text-2xs text-muted-foreground">{activePositions} ACTIVE</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="w-3 h-3 text-muted-foreground" />
              <span className="terminal-header">TOTAL CREDIT</span>
            </div>
            <span className="text-2xl font-bold terminal-value">
              ${totalCredit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-3 h-3 text-muted-foreground" />
              <span className="terminal-header">XRP HOLDINGS</span>
            </div>
            <span className="text-2xl font-bold terminal-value">
              ${totalXRPValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-3 h-3 text-muted-foreground" />
              <span className="terminal-header">NET P&L</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={cn(
                "text-2xl font-bold terminal-value",
                isPositive ? "text-success" : "text-destructive"
              )}>
                {isPositive ? '+' : ''}${netPnL.toFixed(2)}
              </span>
              <span className={cn(
                "text-sm",
                isPositive ? "text-success" : "text-destructive"
              )}>
                ({isPositive ? '+' : ''}{netPnLPercent.toFixed(2)}%)
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-3 h-3 text-muted-foreground" />
              <span className="terminal-header">SUCCESS RATE</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-2xl font-bold terminal-value",
                successRate >= 80 ? "text-success" : successRate >= 60 ? "text-accent" : "text-destructive"
              )}>
                {successRate.toFixed(1)}%
              </span>
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    successRate >= 80 ? "bg-success" : successRate >= 60 ? "bg-accent" : "bg-destructive"
                  )}
                  style={{ width: `${successRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}