import { useState, useEffect, useCallback } from 'react';

interface PriceData {
  price: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  lastUpdate: Date;
}

const BASE_PRICE = 0.5882;
const VOLATILITY = 0.002;

function generatePriceChange(): number {
  return (Math.random() - 0.5) * 2 * VOLATILITY;
}

export function useXRPPrice() {
  const [priceData, setPriceData] = useState<PriceData>({
    price: BASE_PRICE,
    change24h: 0.0142,
    changePercent24h: 2.47,
    high24h: 0.6012,
    low24h: 0.5720,
    volume24h: 1_247_892_453,
    lastUpdate: new Date(),
  });

  const [priceHistory, setPriceHistory] = useState<{ time: Date; price: number }[]>(() => {
    const history: { time: Date; price: number }[] = [];
    const now = new Date();
    let price = BASE_PRICE * 0.98;
    
    for (let i = 60; i >= 0; i--) {
      price = price + (Math.random() - 0.48) * 0.003;
      price = Math.max(0.55, Math.min(0.62, price));
      history.push({
        time: new Date(now.getTime() - i * 60 * 1000),
        price,
      });
    }
    return history;
  });

  const [hasUpdated, setHasUpdated] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPriceData(prev => {
        const change = generatePriceChange();
        const newPrice = Math.max(0.50, Math.min(0.70, prev.price + prev.price * change));
        const newChange = newPrice - BASE_PRICE;
        const newChangePercent = (newChange / BASE_PRICE) * 100;
        
        return {
          ...prev,
          price: newPrice,
          change24h: newChange,
          changePercent24h: newChangePercent,
          high24h: Math.max(prev.high24h, newPrice),
          low24h: Math.min(prev.low24h, newPrice),
          lastUpdate: new Date(),
        };
      });

      setPriceHistory(prev => {
        const newHistory = [...prev.slice(-59), { time: new Date(), price: priceData.price }];
        return newHistory;
      });

      setHasUpdated(true);
      setTimeout(() => setHasUpdated(false), 500);
    }, 1000);

    return () => clearInterval(interval);
  }, [priceData.price]);

  return { priceData, priceHistory, hasUpdated };
}