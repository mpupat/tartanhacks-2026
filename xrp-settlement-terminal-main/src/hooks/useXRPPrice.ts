import { useState, useEffect, useRef } from 'react';
import { fetchXRPPrice, fetchXRPPriceSimple, type RealPriceData } from '@/services/priceService';

interface PriceData {
  price: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  lastUpdate: Date;
}

// Default values while loading
const DEFAULT_PRICE_DATA: PriceData = {
  price: 2.45,
  change24h: 0,
  changePercent24h: 0,
  high24h: 2.50,
  low24h: 2.40,
  volume24h: 0,
  lastUpdate: new Date(),
};

export function useXRPPrice() {
  const [priceData, setPriceData] = useState<PriceData>(DEFAULT_PRICE_DATA);
  const [priceHistory, setPriceHistory] = useState<{ time: Date; price: number }[]>([]);
  const [hasUpdated, setHasUpdated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const lastPrice = useRef<number>(DEFAULT_PRICE_DATA.price);

  // Initial fetch of full price data
  useEffect(() => {
    const fetchInitialPrice = async () => {
      try {
        const data = await fetchXRPPrice();
        const newPriceData: PriceData = {
          price: data.price,
          change24h: data.change24h,
          changePercent24h: data.changePercent24h,
          high24h: data.high24h,
          low24h: data.low24h,
          volume24h: data.volume24h,
          lastUpdate: new Date(),
        };
        setPriceData(newPriceData);
        lastPrice.current = data.price;

        // Initialize price history with the current price
        const history: { time: Date; price: number }[] = [];
        const now = new Date();
        for (let i = 60; i >= 0; i--) {
          // Simulate slight variations around current price for history
          const variation = (Math.random() - 0.5) * 0.02 * data.price;
          history.push({
            time: new Date(now.getTime() - i * 60 * 1000),
            price: data.price + variation,
          });
        }
        setPriceHistory(history);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch initial price:', error);
        setIsLoading(false);
      }
    };

    fetchInitialPrice();
  }, []);

  // Periodic price updates (every 15 seconds for simple price, full data every 60s)
  useEffect(() => {
    // Quick price update every 15 seconds
    const quickInterval = setInterval(async () => {
      try {
        const price = await fetchXRPPriceSimple();
        setPriceData(prev => {
          const change24h = price - lastPrice.current;
          const changePercent24h = (change24h / lastPrice.current) * 100;

          return {
            ...prev,
            price,
            change24h: prev.change24h, // Keep the real 24h change from full fetch
            changePercent24h: prev.changePercent24h,
            high24h: Math.max(prev.high24h, price),
            low24h: Math.min(prev.low24h, price),
            lastUpdate: new Date(),
          };
        });

        // Update price history
        setPriceHistory(prev => {
          const newHistory = [...prev.slice(-59), { time: new Date(), price }];
          return newHistory;
        });

        setHasUpdated(true);
        setTimeout(() => setHasUpdated(false), 500);
      } catch (error) {
        console.error('Quick price update failed:', error);
      }
    }, 15000);

    // Full data update every 60 seconds
    const fullInterval = setInterval(async () => {
      try {
        const data = await fetchXRPPrice();
        lastPrice.current = data.price;
        setPriceData({
          price: data.price,
          change24h: data.change24h,
          changePercent24h: data.changePercent24h,
          high24h: data.high24h,
          low24h: data.low24h,
          volume24h: data.volume24h,
          lastUpdate: new Date(),
        });
      } catch (error) {
        console.error('Full price update failed:', error);
      }
    }, 60000);

    return () => {
      clearInterval(quickInterval);
      clearInterval(fullInterval);
    };
  }, []);

  return { priceData, priceHistory, hasUpdated, isLoading };
}
