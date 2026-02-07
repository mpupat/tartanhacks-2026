// Credit Card Service - Transaction and billing management

import type {
    CreditCardTransaction,
    MonthlyStatement,
    CreditCard,
    CardStats
} from '@/types/creditCardTypes';
import { positionService } from './positionService';

const TRANSACTIONS_KEY = 'nexus_transactions';
const CARD_KEY = 'nexus_credit_card';

class CreditCardService {
    private transactions: Map<string, CreditCardTransaction> = new Map();
    private card: CreditCard | null = null;
    private listeners: Set<() => void> = new Set();

    constructor() {
        this.loadFromStorage();
        this.initializeCard();
    }

    private loadFromStorage(): void {
        try {
            const stored = localStorage.getItem(TRANSACTIONS_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                parsed.forEach((tx: CreditCardTransaction) => {
                    tx.date = new Date(tx.date);
                    this.transactions.set(tx.id, tx);
                });
            }

            const cardStored = localStorage.getItem(CARD_KEY);
            if (cardStored) {
                this.card = JSON.parse(cardStored);
            }
        } catch (error) {
            console.error('Failed to load transactions:', error);
        }
    }

    private saveToStorage(): void {
        try {
            const txArray = Array.from(this.transactions.values());
            localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(txArray));
            if (this.card) {
                localStorage.setItem(CARD_KEY, JSON.stringify(this.card));
            }
        } catch (error) {
            console.error('Failed to save transactions:', error);
        }
    }

    private initializeCard(): void {
        if (!this.card) {
            this.card = {
                id: 'card_' + Math.random().toString(36).substr(2, 9),
                cardNumber: '4242',
                balance: 0,
                creditLimit: 10000,
            };
            this.saveToStorage();
        }
    }

    private notifyListeners(): void {
        this.listeners.forEach(cb => cb());
    }

    private generateId(): string {
        return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Add a transaction
    addTransaction(
        amount: number,
        merchant: string,
        category: CreditCardTransaction['category'] = 'other',
        linkedPositionId?: string
    ): CreditCardTransaction {
        const transaction: CreditCardTransaction = {
            id: this.generateId(),
            amount,
            merchant,
            category,
            date: new Date(),
            linkedPositionId,
            status: linkedPositionId ? 'position_active' : 'settled',
        };

        this.transactions.set(transaction.id, transaction);

        if (this.card) {
            this.card.balance += amount;
        }

        this.saveToStorage();
        this.notifyListeners();

        return transaction;
    }

    // Update transaction status when linked position closes
    updateTransactionStatus(positionId: string): void {
        this.transactions.forEach((tx, id) => {
            if (tx.linkedPositionId === positionId && tx.status === 'position_active') {
                tx.status = 'settled';
                this.transactions.set(id, tx);
            }
        });
        this.saveToStorage();
        this.notifyListeners();
    }

    // Get all transactions
    getAllTransactions(): CreditCardTransaction[] {
        return Array.from(this.transactions.values()).sort(
            (a, b) => b.date.getTime() - a.date.getTime()
        );
    }

    // Get transactions for current month
    getCurrentMonthTransactions(): CreditCardTransaction[] {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        return this.getAllTransactions().filter(tx => {
            const txDate = new Date(tx.date);
            return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
        });
    }

    // Calculate monthly statement
    calculateMonthlyStatement(month?: string): MonthlyStatement {
        const now = new Date();
        const targetMonth = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const [year, monthNum] = targetMonth.split('-').map(Number);

        const monthTransactions = this.getAllTransactions().filter(tx => {
            const txDate = new Date(tx.date);
            return txDate.getMonth() === monthNum - 1 && txDate.getFullYear() === year;
        });

        const baseSpending = monthTransactions.reduce((sum, tx) => sum + tx.amount, 0);

        // Get P&L from closed positions this month
        const closedPositions = positionService.getClosedPositions().filter(p => {
            if (!p.closedAt) return false;
            const closedDate = new Date(p.closedAt);
            return closedDate.getMonth() === monthNum - 1 && closedDate.getFullYear() === year;
        });

        const tradingPnL = closedPositions.reduce((sum, p) => sum + p.pnl, 0);
        const finalAmount = Math.max(0, baseSpending - tradingPnL);

        return {
            id: `stmt_${targetMonth}`,
            month: targetMonth,
            year,
            baseSpending,
            tradingPnL,
            finalAmount,
            transactions: monthTransactions,
            positions: closedPositions.map(p => p.id),
            closingDate: new Date(year, monthNum, 0), // Last day of month
            isPaid: false,
        };
    }

    // Get card stats
    getStats(): CardStats {
        const currentMonthTx = this.getCurrentMonthTransactions();
        const currentMonthSpending = currentMonthTx.reduce((sum, tx) => sum + tx.amount, 0);

        // Get current month P&L from active and closed positions
        const posStats = positionService.getStats();
        const activePositions = positionService.getActivePositions();
        const activePnL = activePositions.reduce((sum, p) => sum + p.pnl, 0);

        // Closed positions P&L this month
        const statement = this.calculateMonthlyStatement();

        return {
            currentMonthSpending,
            currentMonthPnL: statement.tradingPnL + activePnL,
            projectedBill: Math.max(0, currentMonthSpending - (statement.tradingPnL + activePnL)),
            activePositions: posStats.activePositions,
            winRate: posStats.winRate,
            totalSavings: posStats.totalPnL,
        };
    }

    // Get credit card
    getCard(): CreditCard | null {
        return this.card;
    }

    // Link wallet to card
    linkWallet(address: string): void {
        if (this.card) {
            this.card.xrpWalletAddress = address;
            this.saveToStorage();
            this.notifyListeners();
        }
    }

    // Subscribe to changes
    subscribe(callback: () => void): () => void {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    // Add demo transactions (for testing)
    addDemoTransactions(): void {
        const merchants = [
            { name: 'Amazon', category: 'shopping' as const },
            { name: 'Uber Eats', category: 'food' as const },
            { name: 'Netflix', category: 'entertainment' as const },
            { name: 'Electric Co.', category: 'utilities' as const },
            { name: 'Delta Airlines', category: 'travel' as const },
        ];

        merchants.forEach((merchant, i) => {
            const amount = Math.round((Math.random() * 150 + 20) * 100) / 100;
            const date = new Date();
            date.setDate(date.getDate() - i * 3);

            const tx: CreditCardTransaction = {
                id: this.generateId(),
                amount,
                merchant: merchant.name,
                category: merchant.category,
                date,
                status: 'settled',
            };
            this.transactions.set(tx.id, tx);
        });

        if (this.card) {
            this.card.balance = Array.from(this.transactions.values())
                .reduce((sum, tx) => sum + tx.amount, 0);
        }

        this.saveToStorage();
        this.notifyListeners();
    }

    // Clear all data
    clearAll(): void {
        this.transactions.clear();
        this.card = null;
        this.initializeCard();
        this.saveToStorage();
        this.notifyListeners();
    }
}

export const creditCardService = new CreditCardService();
