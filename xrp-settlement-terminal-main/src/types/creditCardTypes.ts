// Credit Card and Billing Types

export interface CreditCardTransaction {
    id: string;
    amount: number;
    merchant: string;
    category: 'food' | 'shopping' | 'entertainment' | 'travel' | 'utilities' | 'other';
    date: Date;
    linkedPositionId?: string; // Optional linked trading position
    status: 'pending' | 'settled' | 'position_active';
}

export interface MonthlyStatement {
    id: string;
    month: string;           // e.g., "2024-02"
    year: number;
    baseSpending: number;    // Total credit card spending
    tradingPnL: number;      // Net profit/loss from positions
    finalAmount: number;     // baseSpending - tradingPnL (what user pays)
    transactions: CreditCardTransaction[];
    positions: string[];     // Position IDs closed this month
    closingDate: Date;
    isPaid: boolean;
}

export interface CreditCard {
    id: string;
    cardNumber: string;      // Last 4 digits only
    balance: number;         // Current balance
    creditLimit: number;
    xrpWalletAddress?: string;
}

// Summary stats for dashboard
export interface CardStats {
    currentMonthSpending: number;
    currentMonthPnL: number;
    projectedBill: number;
    activePositions: number;
    winRate: number;         // Percentage of profitable positions
    totalSavings: number;    // Lifetime savings from trading
}
