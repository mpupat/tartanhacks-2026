import { useState, useEffect } from 'react';
import type { LiveTransaction } from '@/types/positionTypes';
import { xrplWebSocketService } from '@/services/xrplWebSocket';
import { ArrowUpRight, ArrowDownRight, Repeat } from 'lucide-react';

export function TransactionFeed() {
    const [transactions, setTransactions] = useState<LiveTransaction[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Subscribe to WebSocket service
        const initWebSocket = async () => {
            try {
                await xrplWebSocketService.subscribeToLedger();
                setIsConnected(true);
            } catch (error) {
                console.error('Failed to connect WebSocket:', error);
                // Generate mock transactions for demo
                generateMockTransactions();
            }
        };

        const unsubscribe = xrplWebSocketService.onTransaction((tx) => {
            setTransactions(prev => [tx, ...prev].slice(0, 20));
        });

        initWebSocket();

        return () => {
            unsubscribe();
        };
    }, []);

    // Generate mock transactions for demo purposes
    const generateMockTransactions = () => {
        const mockInterval = setInterval(() => {
            const mockTx: LiveTransaction = {
                hash: Math.random().toString(36).substr(2, 12).toUpperCase(),
                type: Math.random() > 0.5 ? 'buy' : 'sell',
                amount: Math.round(Math.random() * 10000 + 100),
                price: 2.45 + (Math.random() - 0.5) * 0.1,
                timestamp: new Date(),
            };
            setTransactions(prev => [mockTx, ...prev].slice(0, 20));
        }, 2000);

        return () => clearInterval(mockInterval);
    };

    useEffect(() => {
        // If not connected to WebSocket, generate mock data
        if (!isConnected) {
            const cleanup = generateMockTransactions();
            return cleanup;
        }
    }, [isConnected]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'buy':
                return <ArrowUpRight className="w-3 h-3 text-success" />;
            case 'sell':
                return <ArrowDownRight className="w-3 h-3 text-destructive" />;
            default:
                return <Repeat className="w-3 h-3 text-muted-foreground" />;
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    return (
        <div className="terminal-grid p-4 h-full">
            <div className="flex items-center justify-between mb-3">
                <span className="terminal-header text-xs">LIVE TRADES</span>
                <div className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-success' : 'bg-warning animate-pulse'}`} />
                    <span className="text-2xs text-muted-foreground">
                        {isConnected ? 'LIVE' : 'DEMO'}
                    </span>
                </div>
            </div>

            <div className="space-y-1 max-h-[300px] overflow-y-auto scrollbar-thin">
                {transactions.length === 0 ? (
                    <div className="text-center text-muted-foreground text-sm py-4">
                        Waiting for trades...
                    </div>
                ) : (
                    transactions.map((tx, index) => (
                        <div
                            key={`${tx.hash}-${index}`}
                            className="flex items-center justify-between py-1.5 px-2 bg-card/30 rounded text-xs animate-in slide-in-from-top-1 duration-200"
                        >
                            <div className="flex items-center gap-2">
                                {getIcon(tx.type)}
                                <span className={tx.type === 'buy' ? 'text-success' : tx.type === 'sell' ? 'text-destructive' : ''}>
                                    {tx.type.toUpperCase()}
                                </span>
                            </div>
                            <div className="text-right">
                                <div className="font-mono">
                                    {tx.amount.toLocaleString()} XRP
                                </div>
                                <div className="text-2xs text-muted-foreground">
                                    @ ${tx.price.toFixed(4)}
                                </div>
                            </div>
                            <div className="text-2xs text-muted-foreground">
                                {formatTime(tx.timestamp)}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
