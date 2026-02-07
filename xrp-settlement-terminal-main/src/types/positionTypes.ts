// Position and Trading Types

export type PositionType = 'long' | 'short';
export type PositionStatus = 'active' | 'closed_profit' | 'closed_loss' | 'closed_manual';

export interface Position {
    id: string;
    type: PositionType;
    entryPrice: number;
    currentPrice: number;
    amount: number;           // USD amount at stake
    takeProfitPercent: number; // e.g., 5 means +5%
    stopLossPercent: number;   // e.g., 3 means -3%
    status: PositionStatus;
    pnl: number;              // Profit/Loss in USD
    pnlPercent: number;       // Profit/Loss as percentage
    createdAt: Date;
    closedAt?: Date;
    closeReason?: 'take_profit' | 'stop_loss' | 'manual';
}

export interface PositionCreate {
    type: PositionType;
    amount: number;
    takeProfitPercent: number;
    stopLossPercent: number;
}

// Price trigger check result
export interface TriggerCheck {
    triggered: boolean;
    reason?: 'take_profit' | 'stop_loss';
    pnl: number;
    pnlPercent: number;
}

// Real-time price update
export interface PriceUpdate {
    price: number;
    timestamp: Date;
    source: 'coingecko' | 'xrpl' | 'websocket';
}

// OHLC candle data for charts
export interface Candle {
    time: number; // Unix timestamp in seconds
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
}

// Live transaction from XRPL
export interface LiveTransaction {
    hash: string;
    type: 'buy' | 'sell' | 'swap';
    amount: number;
    price: number;
    timestamp: Date;
}
