import { useMemo } from 'react';
import { useAppStore, Position } from '@/store/appStore';

export const usePositionCalculations = (position: Position) => {
  const { xrpPrice } = useAppStore();
  
  return useMemo(() => {
    const currentXrpValue = position.xrpInvested * xrpPrice;
    const entryValue = position.xrpInvested * position.xrpEntryPrice;
    
    let pnlAmount = 0;
    let pnlPercent = 0;
    
    if (position.direction === 'LONG') {
      // LONG: profit when XRP rises
      pnlAmount = currentXrpValue - entryValue;
      pnlPercent = ((currentXrpValue - entryValue) / entryValue) * 100;
    } else if (position.direction === 'SHORT') {
      // SHORT: profit when XRP falls
      pnlAmount = entryValue - currentXrpValue;
      pnlPercent = ((entryValue - currentXrpValue) / entryValue) * 100;
    }
    
    // Calculate estimated payment
    const estimatedPayment = position.purchaseAmount - pnlAmount;
    
    // Time calculations
    const elapsed = Date.now() - position.startTime;
    const totalDuration = position.timeLimit * 24 * 60 * 60 * 1000;
    const remaining = Math.max(0, totalDuration - elapsed);
    const remainingDays = remaining / (24 * 60 * 60 * 1000);
    const remainingHours = (remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000);
    const remainingMinutes = (remaining % (60 * 60 * 1000)) / (60 * 1000);
    
    // Bound checks
    const nearMaxBound = estimatedPayment >= position.maxPayment * 0.9;
    const nearMinBound = estimatedPayment <= position.minPayment * 1.1;
    const breachedMax = estimatedPayment >= position.maxPayment;
    const breachedMin = estimatedPayment <= position.minPayment;
    
    // Risk assessment
    const priceVolatility = 0.15; // 15% estimated volatility
    const daysRemaining = remainingDays;
    const boundWidth = (position.maxPayment - position.minPayment) / position.purchaseAmount;
    const riskScore = Math.min(100, Math.max(0, 
      100 - (boundWidth * 100) + (priceVolatility * 50) - (daysRemaining * 5)
    ));
    
    return {
      currentXrpValue,
      pnlAmount,
      pnlPercent,
      estimatedPayment,
      remaining,
      remainingDays: Math.floor(remainingDays),
      remainingHours: Math.floor(remainingHours),
      remainingMinutes: Math.floor(remainingMinutes),
      nearMaxBound,
      nearMinBound,
      breachedMax,
      breachedMin,
      riskScore,
      isProfit: pnlAmount > 0,
      isLoss: pnlAmount < 0,
    };
  }, [position, xrpPrice]);
};
