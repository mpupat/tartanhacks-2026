// useOrderBook Hook - Subscribe to order book updates

import { useState, useEffect, useCallback } from 'react';
import { tradingService, type OrderBook, type TradingPair } from '@/services/tradingService';
import { useXRPL } from '@/context/XRPLProvider';
import { DEFAULT_TRADING_PAIR } from '@/config/constants';

interface UseOrderBookOptions {
    pair?: TradingPair;
    limit?: number;
    refreshInterval?: number; // ms
}

export function useOrderBook(options: UseOrderBookOptions = {}) {
    const {
        pair = DEFAULT_TRADING_PAIR,
        limit = 15,
        refreshInterval = 5000,
    } = options;

    const { connectionStatus } = useXRPL();
    const [orderBook, setOrderBook] = useState<OrderBook | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchOrderBook = useCallback(async () => {
        if (connectionStatus !== 'connected') return;

        setIsLoading(true);
        setError(null);

        try {
            const data = await tradingService.getOrderBook(pair, limit);
            setOrderBook(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch order book');
            console.error('Order book fetch error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [connectionStatus, pair, limit]);

    // Initial fetch
    useEffect(() => {
        fetchOrderBook();
    }, [fetchOrderBook]);

    // Periodic refresh
    useEffect(() => {
        if (connectionStatus !== 'connected') return;

        const interval = setInterval(fetchOrderBook, refreshInterval);
        return () => clearInterval(interval);
    }, [connectionStatus, refreshInterval, fetchOrderBook]);

    return {
        orderBook,
        bids: orderBook?.bids ?? [],
        asks: orderBook?.asks ?? [],
        spread: orderBook?.spread ?? 0,
        midPrice: orderBook?.midPrice ?? 0,
        isLoading,
        error,
        refresh: fetchOrderBook,
    };
}
