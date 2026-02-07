// src/lib/risk.ts

import type { KalshiMarket, Position } from "@/types/kalshi";

function hoursToMs(h: number) {
  return h * 60 * 60 * 1000;
}

export function computeMaxDurationMsFromBet(args: {
  purchaseAmount: number;
  maxLossPercent?: number;     // default 5
  maxRewardPercent?: number;   // default 20 (not used yet, but kept for future)
}) {
  const purchase = Math.max(0, args.purchaseAmount || 0);
  const maxLoss = Math.abs(args.maxLossPercent ?? 5);

  // ---- base duration tiers by purchase size ----
  let baseHours: number;
  if (purchase <= 100) baseHours = 7 * 24;        // 7 days
  else if (purchase <= 500) baseHours = 3 * 24;   // 3 days
  else if (purchase <= 2000) baseHours = 24;      // 24 hours
  else baseHours = 6;                              // 6 hours

  // ---- risk multiplier (tighter stop = shorter allowed holding window) ----
  let riskMult = 1.0;
  if (maxLoss <= 5) riskMult = 0.6;
  else if (maxLoss <= 10) riskMult = 0.8;

  const maxHours = Math.max(1, baseHours * riskMult); // at least 1 hour
  return hoursToMs(maxHours);
}

/**
 * Hard max expiry = min(market close time, now + maxDurationFromBet)
 */
export function computeHardMaxExpiryISO(args: {
  market: KalshiMarket;
  purchaseAmount: number;
  maxLossPercent?: number;
  maxRewardPercent?: number;
}) {
  const now = Date.now();
  const marketClose = new Date(args.market.close_date).getTime();

  const maxFromBet = computeMaxDurationMsFromBet({
    purchaseAmount: args.purchaseAmount,
    maxLossPercent: args.maxLossPercent,
    maxRewardPercent: args.maxRewardPercent,
  });

  const hardMax = Math.min(marketClose, now + maxFromBet);
  return new Date(hardMax).toISOString();
}

/**
 * Clamp any user-selected expiry so it cannot exceed the hard max.
 */
export function clampExpiryISO(args: {
  requestedExpiryISO: string;
  hardMaxExpiryISO: string;
}) {
  const req = new Date(args.requestedExpiryISO).getTime();
  const hard = new Date(args.hardMaxExpiryISO).getTime();
  const clamped = Math.min(req, hard);
  return new Date(clamped).toISOString();
}
