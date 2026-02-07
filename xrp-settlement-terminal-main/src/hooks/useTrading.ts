// useTrading Hook - Place and manage orders

import { useState, useCallback } from 'react';
import { tradingService, type TransactionResult, type ActiveOffer, type TradingPair } from '@/services/tradingService';
import { useXRPL } from '@/context/XRPLProvider';
import { DEFAULT_TRADING_PAIR } from '@/config/constants';

interface UseTradingOptions {
    pair?: TradingPair;
    onSuccess?: (result: TransactionResult) => void;
    onError?: (error: string) => void;
}

export function useTrading(options: UseTradingOptions = {}) {
    const { pair = DEFAULT_TRADING_PAIR, onSuccess, onError } = options;
    const { wallet, refreshAccountInfo } = useXRPL();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lastResult, setLastResult] = useState<TransactionResult | null>(null);
    const [activeOffers, setActiveOffers] = useState<ActiveOffer[]>([]);
    const [isLoadingOffers, setIsLoadingOffers] = useState(false);

    const placeBuyOrder = useCallback(async (amount: number, price: number) => {
        if (!wallet) {
            const error = 'No wallet connected';
            onError?.(error);
            return { success: false, error };
        }

        setIsSubmitting(true);
        try {
            const result = await tradingService.placeBuyOrder(amount, price, pair);
            setLastResult(result);

            if (result.success) {
                onSuccess?.(result);
                await refreshAccountInfo();
                await fetchActiveOffers();
            } else {
                onError?.(result.error || 'Transaction failed');
            }

            return result;
        } catch (error: any) {
            const errorMsg = error.message || 'Failed to place buy order';
            onError?.(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setIsSubmitting(false);
        }
    }, [wallet, pair, onSuccess, onError, refreshAccountInfo]);

    const placeSellOrder = useCallback(async (amount: number, price: number) => {
        if (!wallet) {
            const error = 'No wallet connected';
            onError?.(error);
            return { success: false, error };
        }

        setIsSubmitting(true);
        try {
            const result = await tradingService.placeSellOrder(amount, price, pair);
            setLastResult(result);

            if (result.success) {
                onSuccess?.(result);
                await refreshAccountInfo();
                await fetchActiveOffers();
            } else {
                onError?.(result.error || 'Transaction failed');
            }

            return result;
        } catch (error: any) {
            const errorMsg = error.message || 'Failed to place sell order';
            onError?.(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setIsSubmitting(false);
        }
    }, [wallet, pair, onSuccess, onError, refreshAccountInfo]);

    const cancelOffer = useCallback(async (sequence: number) => {
        if (!wallet) {
            const error = 'No wallet connected';
            onError?.(error);
            return { success: false, error };
        }

        setIsSubmitting(true);
        try {
            const result = await tradingService.cancelOffer(sequence);
            setLastResult(result);

            if (result.success) {
                onSuccess?.(result);
                await refreshAccountInfo();
                await fetchActiveOffers();
            } else {
                onError?.(result.error || 'Failed to cancel offer');
            }

            return result;
        } catch (error: any) {
            const errorMsg = error.message || 'Failed to cancel offer';
            onError?.(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setIsSubmitting(false);
        }
    }, [wallet, onSuccess, onError, refreshAccountInfo]);

    const fetchActiveOffers = useCallback(async () => {
        if (!wallet) {
            setActiveOffers([]);
            return;
        }

        setIsLoadingOffers(true);
        try {
            const offers = await tradingService.getAccountOffers();
            setActiveOffers(offers);
        } catch (error) {
            console.error('Failed to fetch active offers:', error);
        } finally {
            setIsLoadingOffers(false);
        }
    }, [wallet]);

    return {
        placeBuyOrder,
        placeSellOrder,
        cancelOffer,
        isSubmitting,
        lastResult,
        activeOffers,
        isLoadingOffers,
        fetchActiveOffers,
    };
}
