// Position Management Service - Long/Short positions with triggers

import type {
    Position,
    PositionCreate,
    PositionStatus,
    TriggerCheck
} from '@/types/positionTypes';

const STORAGE_KEY = 'nexus_positions';

class PositionService {
    private positions: Map<string, Position> = new Map();
    private listeners: Set<() => void> = new Set();

    constructor() {
        this.loadFromStorage();
    }

    // Load positions from localStorage
    private loadFromStorage(): void {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                parsed.forEach((pos: Position) => {
                    pos.createdAt = new Date(pos.createdAt);
                    if (pos.closedAt) pos.closedAt = new Date(pos.closedAt);
                    this.positions.set(pos.id, pos);
                });
            }
        } catch (error) {
            console.error('Failed to load positions:', error);
        }
    }

    // Save positions to localStorage
    private saveToStorage(): void {
        try {
            const posArray = Array.from(this.positions.values());
            localStorage.setItem(STORAGE_KEY, JSON.stringify(posArray));
        } catch (error) {
            console.error('Failed to save positions:', error);
        }
    }

    // Notify listeners of changes
    private notifyListeners(): void {
        this.listeners.forEach(cb => cb());
    }

    // Generate unique ID
    private generateId(): string {
        return `pos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Create a new position
    createPosition(data: PositionCreate, currentPrice: number): Position {
        const position: Position = {
            id: this.generateId(),
            type: data.type,
            entryPrice: currentPrice,
            currentPrice: currentPrice,
            amount: data.amount,
            takeProfitPercent: data.takeProfitPercent,
            stopLossPercent: data.stopLossPercent,
            status: 'active',
            pnl: 0,
            pnlPercent: 0,
            createdAt: new Date(),
        };

        this.positions.set(position.id, position);
        this.saveToStorage();
        this.notifyListeners();

        return position;
    }

    // Update price and check triggers for all active positions
    updatePriceAndCheckTriggers(currentPrice: number): Position[] {
        const closedPositions: Position[] = [];

        this.positions.forEach((position, id) => {
            if (position.status !== 'active') return;

            // Update current price
            position.currentPrice = currentPrice;

            // Calculate P&L
            const pnlResult = this.calculatePnL(position, currentPrice);
            position.pnl = pnlResult.pnl;
            position.pnlPercent = pnlResult.pnlPercent;

            // Check triggers
            const triggerCheck = this.checkTriggers(position);
            if (triggerCheck.triggered) {
                position.status = triggerCheck.reason === 'take_profit'
                    ? 'closed_profit'
                    : 'closed_loss';
                position.closedAt = new Date();
                position.closeReason = triggerCheck.reason;
                closedPositions.push(position);
            }

            this.positions.set(id, position);
        });

        if (closedPositions.length > 0) {
            this.saveToStorage();
            this.notifyListeners();
        }

        return closedPositions;
    }

    // Calculate P&L for a position
    calculatePnL(position: Position, currentPrice: number): { pnl: number; pnlPercent: number } {
        const priceChange = ((currentPrice - position.entryPrice) / position.entryPrice) * 100;

        // For long: profit when price goes up
        // For short: profit when price goes down
        const pnlPercent = position.type === 'long' ? priceChange : -priceChange;
        const pnl = (pnlPercent / 100) * position.amount;

        return { pnl, pnlPercent };
    }

    // Check if position triggers are hit
    checkTriggers(position: Position): TriggerCheck {
        const { pnl, pnlPercent } = this.calculatePnL(position, position.currentPrice);

        // Check take profit (positive threshold)
        if (pnlPercent >= position.takeProfitPercent) {
            return { triggered: true, reason: 'take_profit', pnl, pnlPercent };
        }

        // Check stop loss (negative threshold)
        if (pnlPercent <= -position.stopLossPercent) {
            return { triggered: true, reason: 'stop_loss', pnl, pnlPercent };
        }

        return { triggered: false, pnl, pnlPercent };
    }

    // Manually close a position
    closePosition(id: string): Position | null {
        const position = this.positions.get(id);
        if (!position || position.status !== 'active') return null;

        position.status = 'closed_manual';
        position.closedAt = new Date();
        position.closeReason = 'manual';

        this.positions.set(id, position);
        this.saveToStorage();
        this.notifyListeners();

        return position;
    }

    // Get all positions
    getAllPositions(): Position[] {
        return Array.from(this.positions.values()).sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        );
    }

    // Get active positions
    getActivePositions(): Position[] {
        return this.getAllPositions().filter(p => p.status === 'active');
    }

    // Get closed positions
    getClosedPositions(): Position[] {
        return this.getAllPositions().filter(p => p.status !== 'active');
    }

    // Get position by ID
    getPosition(id: string): Position | undefined {
        return this.positions.get(id);
    }

    // Subscribe to position changes
    subscribe(callback: () => void): () => void {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    // Get statistics
    getStats(): {
        totalPositions: number;
        activePositions: number;
        winRate: number;
        totalPnL: number;
    } {
        const all = this.getAllPositions();
        const closed = all.filter(p => p.status !== 'active');
        const wins = closed.filter(p => p.status === 'closed_profit').length;
        const totalPnL = closed.reduce((sum, p) => sum + p.pnl, 0);

        return {
            totalPositions: all.length,
            activePositions: all.filter(p => p.status === 'active').length,
            winRate: closed.length > 0 ? (wins / closed.length) * 100 : 0,
            totalPnL,
        };
    }

    // Clear all positions (for testing)
    clearAll(): void {
        this.positions.clear();
        this.saveToStorage();
        this.notifyListeners();
    }
}

export const positionService = new PositionService();
