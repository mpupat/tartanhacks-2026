import { positions as positionsApi } from './apiClient';
import type { Position, PositionCreate, TriggerCheck, PositionStatus } from '@/types/positionTypes';

class PositionService {
    private positions: Position[] = [];
    private listeners: (() => void)[] = [];

    // Initialize by fetching from API
    async initialize() {
        try {
            const response = await positionsApi.list();
            // Transform API response to frontend model
            this.positions = response.data.map((p: any) => ({
                id: p.id,
                type: p.type,
                entryPrice: Number(p.entry_price),
                currentPrice: Number(p.entry_price), // Initial value
                amount: Number(p.amount),
                takeProfitPercent: Number(p.take_profit_pct),
                stopLossPercent: Number(p.stop_loss_pct),
                status: this.mapStatus(p.status),
                pnl: Number(p.pnl),
                pnlPercent: Number(p.pnl_percent || 0),
                createdAt: new Date(p.created_at),
                closedAt: p.closed_at ? new Date(p.closed_at) : undefined,
            }));
            this.notifyListeners();
        } catch (error) {
            console.error('Failed to fetch positions:', error);
        }
    }

    private mapStatus(status: string): PositionStatus {
        if (status === 'closed_take_profit') return 'closed_profit';
        if (status === 'closed_stop_loss') return 'closed_loss';
        return status as PositionStatus;
    }

    getActivePositions(): Position[] {
        return this.positions.filter(p => p.status === 'active');
    }

    getAllPositions(): Position[] {
        return this.positions;
    }

    getClosedPositions(): Position[] {
        return this.positions.filter(p => p.status !== 'active');
    }

    async createPosition(data: PositionCreate, currentPrice: number): Promise<Position> {
        // Optimistic update
        const tempId = `temp-${Date.now()}`;
        const newPosition: Position = {
            id: tempId,
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

        this.positions.unshift(newPosition);
        this.notifyListeners();

        try {
            // Send to backend
            const apiData = {
                type: data.type,
                entry_price: currentPrice,
                amount: data.amount,
                take_profit_pct: data.takeProfitPercent,
                stop_loss_pct: data.stopLossPercent,
            };

            const response = await positionsApi.create(apiData);

            // Replace optimistically created position with real one
            const index = this.positions.findIndex(p => p.id === tempId);
            if (index !== -1) {
                this.positions[index] = {
                    id: response.data.id,
                    type: response.data.type,
                    entryPrice: Number(response.data.entry_price),
                    currentPrice: currentPrice,
                    amount: Number(response.data.amount),
                    takeProfitPercent: Number(response.data.take_profit_pct),
                    stopLossPercent: Number(response.data.stop_loss_pct),
                    status: this.mapStatus(response.data.status),
                    pnl: Number(response.data.pnl),
                    pnlPercent: Number(response.data.pnl_percent || 0),
                    createdAt: new Date(response.data.created_at),
                };
                this.notifyListeners();
            }

            return this.positions[index !== -1 ? index : 0];
        } catch (error) {
            console.error('Failed to create position:', error);
            // Rollback on error
            this.positions = this.positions.filter(p => p.id !== tempId);
            this.notifyListeners();
            throw error;
        }
    }

    async closePosition(id: string) {
        // Optimistic update
        const index = this.positions.findIndex(p => p.id === id);
        if (index !== -1) {
            this.positions[index].status = 'closed_manual';
            this.notifyListeners();
        }

        try {
            await positionsApi.close(id);
        } catch (error) {
            console.error('Failed to close position:', error);
        }
    }

    // P&L calculation remains local for real-time responsiveness
    updatePriceAndCheckTriggers(currentPrice: number): void {
        let hasUpdates = false;

        this.positions.forEach(position => {
            if (position.status !== 'active') return;

            position.currentPrice = currentPrice;

            const priceDiff = currentPrice - position.entryPrice;
            const pnlPercent = (priceDiff / position.entryPrice) * 100 * (position.type === 'long' ? 1 : -1);
            const pnl = (position.amount * pnlPercent) / 100;

            if (position.pnl !== pnl || position.pnlPercent !== pnlPercent) {
                position.pnl = pnl;
                position.pnlPercent = pnlPercent;
                hasUpdates = true;
            }

            // Check triggers (Simulated locally for now, ideally backend job)
            if (pnlPercent >= position.takeProfitPercent) {
                this.closePosition(position.id); // Trigger API close
            } else if (pnlPercent <= -position.stopLossPercent) {
                this.closePosition(position.id); // Trigger API close
            }
        });

        if (hasUpdates) {
            this.notifyListeners();
        }
    }

    subscribe(listener: () => void) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notifyListeners() {
        this.listeners.forEach(listener => listener());
    }

    // Get statistics for DashboardStats
    getStats(): {
        totalPositions: number;
        activePositions: number;
        winRate: number;
        totalPnL: number;
    } {
        const all = this.getAllPositions();
        const closed = all.filter(p => p.status !== 'active');
        const wins = closed.filter(p => p.status === 'closed_profit' || (p.status === 'closed_manual' && p.pnl > 0)).length;
        const totalPnL = closed.reduce((sum, p) => sum + p.pnl, 0);

        return {
            totalPositions: all.length,
            activePositions: all.filter(p => p.status === 'active').length,
            winRate: closed.length > 0 ? (wins / closed.length) * 100 : 0,
            totalPnL,
        };
    }
}

export const positionService = new PositionService();
// Start fetching immediately
positionService.initialize();
