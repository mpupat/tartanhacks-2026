import { Zap, Settings, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NewPositionDialog } from './NewPositionDialog';
import { WalletConnect } from './WalletConnect';
import { useXRPL } from '@/context/XRPLProvider';

interface HeaderProps {
  currentPrice: number;
}

export function Header({ currentPrice }: HeaderProps) {
  const { currentNetwork, connectionStatus } = useXRPL();

  return (
    <header className="border-b border-border-subtle bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-success/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-success" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">NEXUS</h1>
              <span className="text-2xs text-muted-foreground tracking-widest">XRP DEX TRADING</span>
            </div>
          </div>
          <Badge
            variant={currentNetwork === 'testnet' ? 'secondary' : 'default'}
            className="text-2xs uppercase"
          >
            {currentNetwork}
            <span className={`ml-1.5 w-1.5 h-1.5 rounded-full inline-block ${connectionStatus === 'connected' ? 'bg-success' :
                connectionStatus === 'connecting' ? 'bg-warning animate-pulse' :
                  'bg-destructive'
              }`} />
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <WalletConnect />
          <NewPositionDialog currentPrice={currentPrice} />

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          </Button>

          <Button variant="ghost" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
