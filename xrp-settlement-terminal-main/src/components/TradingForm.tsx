// Trading Form Component - Buy/Sell XRP

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTrading } from '@/hooks/useTrading';
import { useOrderBook } from '@/hooks/useOrderBook';
import { useXRPL } from '@/context/XRPLProvider';
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function TradingForm() {
    const { wallet, accountInfo } = useXRPL();
    const { midPrice } = useOrderBook();
    const { toast } = useToast();

    const { placeBuyOrder, placeSellOrder, isSubmitting } = useTrading({
        onSuccess: (result) => {
            toast({
                title: 'Order Placed',
                description: `Transaction confirmed: ${result.hash?.slice(0, 12)}...`,
            });
            setAmount('');
        },
        onError: (error) => {
            toast({
                title: 'Order Failed',
                description: error,
                variant: 'destructive',
            });
        },
    });

    const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
    const [amount, setAmount] = useState('');
    const [price, setPrice] = useState('');

    // Update price when mid price changes and input is empty
    useEffect(() => {
        if (midPrice > 0 && !price) {
            setPrice(midPrice.toFixed(6));
        }
    }, [midPrice]);

    const total = (parseFloat(amount) || 0) * (parseFloat(price) || 0);
    const xrpBalance = accountInfo?.balance.xrp ?? 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const amountNum = parseFloat(amount);
        const priceNum = parseFloat(price);

        if (!amountNum || !priceNum) {
            toast({
                title: 'Invalid Input',
                description: 'Please enter valid amount and price',
                variant: 'destructive',
            });
            return;
        }

        if (orderType === 'buy') {
            await placeBuyOrder(amountNum, priceNum);
        } else {
            await placeSellOrder(amountNum, priceNum);
        }
    };

    const setMarketPrice = () => {
        if (midPrice > 0) {
            setPrice(midPrice.toFixed(6));
        }
    };

    if (!wallet) {
        return (
            <div className="terminal-grid p-4">
                <span className="terminal-header text-xs mb-2 block">TRADE XRP</span>
                <p className="text-muted-foreground text-sm text-center py-8">
                    Connect wallet to trade
                </p>
            </div>
        );
    }

    return (
        <div className="terminal-grid p-4">
            <span className="terminal-header text-xs mb-3 block">TRADE XRP/USD</span>

            <Tabs value={orderType} onValueChange={(v) => setOrderType(v as 'buy' | 'sell')}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger
                        value="buy"
                        className="data-[state=active]:bg-success data-[state=active]:text-success-foreground"
                    >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        BUY XRP
                    </TabsTrigger>
                    <TabsTrigger
                        value="sell"
                        className="data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground"
                    >
                        <TrendingDown className="w-4 h-4 mr-2" />
                        SELL XRP
                    </TabsTrigger>
                </TabsList>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <Label htmlFor="price" className="text-xs text-muted-foreground">
                                    PRICE (USD)
                                </Label>
                                <button
                                    type="button"
                                    onClick={setMarketPrice}
                                    className="text-2xs text-primary hover:underline"
                                >
                                    MARKET
                                </button>
                            </div>
                            <Input
                                id="price"
                                type="number"
                                step="0.000001"
                                placeholder="0.000000"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="font-mono"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <Label htmlFor="amount" className="text-xs text-muted-foreground">
                                    AMOUNT (XRP)
                                </Label>
                                {orderType === 'sell' && (
                                    <button
                                        type="button"
                                        onClick={() => setAmount(Math.max(0, xrpBalance - 15).toFixed(2))}
                                        className="text-2xs text-primary hover:underline"
                                    >
                                        MAX ({Math.max(0, xrpBalance - 15).toFixed(2)})
                                    </button>
                                )}
                            </div>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="font-mono"
                            />
                        </div>

                        <div className="py-2 px-3 bg-card/50 rounded border border-border-subtle">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">TOTAL</span>
                                <span className="font-mono font-bold">
                                    ${total.toFixed(2)} USD
                                </span>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isSubmitting || !amount || !price}
                            className={`w-full ${orderType === 'buy'
                                    ? 'bg-success hover:bg-success/90'
                                    : 'bg-destructive hover:bg-destructive/90'
                                }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    SUBMITTING...
                                </>
                            ) : (
                                `${orderType === 'buy' ? 'BUY' : 'SELL'} ${amount || '0'} XRP`
                            )}
                        </Button>
                    </div>
                </form>
            </Tabs>
        </div>
    );
}
