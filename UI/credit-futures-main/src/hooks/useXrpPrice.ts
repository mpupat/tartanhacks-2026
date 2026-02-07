import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/store/appStore';

export const useXrpPrice = () => {
  const { xrpPrice, xrpChange24h, setXrpPrice } = useAppStore();
  const previousPrice = useRef(xrpPrice);
  const basePrice = useRef(0.5123);
  
  const simulatePrice = useCallback(() => {
    // Simulate realistic price movement
    const volatility = 0.002; // 0.2% max change per tick
    const drift = 0.00001; // slight upward bias
    const random = (Math.random() - 0.5) * 2 * volatility;
    const meanReversion = (basePrice.current - xrpPrice) * 0.01;
    
    const newPrice = xrpPrice * (1 + random + drift) + meanReversion;
    const clampedPrice = Math.max(0.4, Math.min(0.7, newPrice)); // Keep in reasonable range
    
    previousPrice.current = xrpPrice;
    setXrpPrice(Number(clampedPrice.toFixed(6)));
  }, [xrpPrice, setXrpPrice]);
  
  useEffect(() => {
    const interval = setInterval(simulatePrice, 1000);
    return () => clearInterval(interval);
  }, [simulatePrice]);
  
  const priceDirection = xrpPrice > previousPrice.current ? 'up' : xrpPrice < previousPrice.current ? 'down' : 'same';
  
  return {
    price: xrpPrice,
    change24h: xrpChange24h,
    previousPrice: previousPrice.current,
    priceDirection,
  };
};
