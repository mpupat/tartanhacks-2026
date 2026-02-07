// Active Offers Component - Display and manage user's active offers

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useTrading } from '@/hooks/useTrading';
import { useXRPL } from '@/context/XRPLProvider';
import { useToast } from '@/hooks/use-toast';
import { X, Loader2, TrendingUp, TrendingDown } from 'lucide-react';

export function ActiveOffers() {
    const { wallet, connectionStatus } = useXRPL();
    const { toast } = useToast();

    const {
        activeOffers,
        isLoadingOffers,
        fetchActiveOffers,
        cancelOffer,
        isSubmitting,
    } = useTrading({
        onSuccess: () => {
            toast({
                title: 'Offer Cancelled',
                description: 'Your offer has been removed from the order book',
            });
        },
        onError: (error) => {
            toast({
                title: 'Cancel Failed',
                description: error,
                variant: 'destructive',
            });
        },
    });

    // Fetch offers when wallet connects
    useEffect(() => {
        if (wallet && connectionStatus === 'connected') {
            fetchActiveOffers();
        }
    }, [wallet, connectionStatus, fetchActiveOffers]);

    if (!wallet) {
        return null;
    }

    return (
        <div className="terminal-grid p-4">
            <div className="flex items-center justify-between mb-3">
                <span className="terminal-header text-xs">ACTIVE OFFERS</span>
                {isLoadingOffers && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
            </div>

            {activeOffers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                    No active offers
                </p>
            ) : (
                <div className="space-y-2">
                    {activeOffers.map((offer) => (
                        <div
                            key={offer.sequence}
                            className="flex items-center justify-between p-2 bg-card/50 rounded border border-border-subtle"
                        >
                            <div className="flex items-center gap-2">
                                {offer.isSell ? (
                                    <TrendingDown className="w-4 h-4 text-destructive" />
                                ) : (
                                    <TrendingUp className="w-4 h-4 text-success" />
                                )}
                                <div>
                                    <p className="text-xs font-mono">
                                        <span className={offer.isSell ? 'text-destructive' : 'text-success'}>
                                            {offer.isSell ? 'SELL' : 'BUY'}
                                        </span>
                                        {' '}
                                        {offer.isSell
                                            ? offer.takerGets.value
                                            : offer.takerPays.value
                                        } XRP
                                    </p>
                                    <p className="text-2xs text-muted-foreground">
                                        @ ${offer.price.toFixed(6)} USD
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => cancelOffer(offer.sequence)}
                                disabled={isSubmitting}
                                className="h-6 w-6 p-0 hover:bg-destructive/20"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                    <X className="w-3 h-3" />
                                )}
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
