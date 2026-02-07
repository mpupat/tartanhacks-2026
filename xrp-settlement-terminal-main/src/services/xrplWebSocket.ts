// XRPL WebSocket Service - Real-time ledger subscriptions

import { xrplClient } from './xrplClient';
import type { LiveTransaction, PriceUpdate } from '@/types/positionTypes';
import { dropsToXrp } from 'xrpl';

type PriceCallback = (update: PriceUpdate) => void;
type TransactionCallback = (tx: LiveTransaction) => void;
type LedgerCallback = (ledgerIndex: number) => void;

class XRPLWebSocketService {
    private priceCallbacks: Set<PriceCallback> = new Set();
    private transactionCallbacks: Set<TransactionCallback> = new Set();
    private ledgerCallbacks: Set<LedgerCallback> = new Set();
    private isSubscribed = false;
    private lastLedgerIndex = 0;

    // Subscribe to ledger closes for real-time updates
    async subscribeToLedger(): Promise<void> {
        if (this.isSubscribed) return;

        let client = xrplClient.getClient();
        if (!client || !client.isConnected()) {
            await xrplClient.connect();
            client = xrplClient.getClient();
        }

        if (!client) {
            throw new Error('Failed to get XRPL client');
        }

        try {
            // Subscribe to ledger stream
            await client.request({
                command: 'subscribe',
                streams: ['ledger', 'transactions'],
            });

            this.isSubscribed = true;
            console.log('Subscribed to XRPL ledger stream');

            // Listen for ledger events
            client.on('ledgerClosed', (ledger) => {
                this.lastLedgerIndex = ledger.ledger_index;
                this.ledgerCallbacks.forEach(cb => cb(ledger.ledger_index));
            });

            // Listen for transaction events
            client.on('transaction', (tx) => {
                this.handleTransaction(tx);
            });

        } catch (error) {
            console.error('Failed to subscribe to ledger:', error);
            throw error;
        }
    }

    // Unsubscribe from ledger
    async unsubscribe(): Promise<void> {
        if (!this.isSubscribed) return;

        const client = xrplClient.getClient();
        if (client && client.isConnected()) {
            try {
                await client.request({
                    command: 'unsubscribe',
                    streams: ['ledger', 'transactions'],
                });
            } catch (error) {
                console.error('Failed to unsubscribe:', error);
            }
        }

        this.isSubscribed = false;
    }

    // Handle incoming transactions
    private handleTransaction(tx: any): void {
        // Filter for OfferCreate/Payment transactions (trades)
        if (tx.transaction?.TransactionType === 'OfferCreate' ||
            tx.transaction?.TransactionType === 'Payment') {

            try {
                const liveTx = this.parseTransaction(tx);
                if (liveTx) {
                    this.transactionCallbacks.forEach(cb => cb(liveTx));
                }
            } catch (error) {
                // Silently ignore parse errors for irrelevant transactions
            }
        }
    }

    // Parse XRPL transaction into our LiveTransaction format
    private parseTransaction(tx: any): LiveTransaction | null {
        const transaction = tx.transaction;
        if (!transaction) return null;

        let amount = 0;
        let price = 0;
        let type: 'buy' | 'sell' | 'swap' = 'swap';

        if (transaction.TransactionType === 'OfferCreate') {
            const takerGets = transaction.TakerGets;
            const takerPays = transaction.TakerPays;

            // Check if this involves XRP
            if (typeof takerGets === 'string') {
                // Selling XRP
                amount = Number(dropsToXrp(takerGets));
                type = 'sell';
                if (typeof takerPays === 'object') {
                    price = Number(takerPays.value) / amount;
                }
            } else if (typeof takerPays === 'string') {
                // Buying XRP
                amount = Number(dropsToXrp(takerPays));
                type = 'buy';
                if (typeof takerGets === 'object') {
                    price = Number(takerGets.value) / amount;
                }
            }
        }

        if (amount === 0) return null;

        return {
            hash: transaction.hash || tx.hash || 'unknown',
            type,
            amount,
            price,
            timestamp: new Date(),
        };
    }

    // Register callbacks
    onPriceUpdate(callback: PriceCallback): () => void {
        this.priceCallbacks.add(callback);
        return () => this.priceCallbacks.delete(callback);
    }

    onTransaction(callback: TransactionCallback): () => void {
        this.transactionCallbacks.add(callback);
        return () => this.transactionCallbacks.delete(callback);
    }

    onLedgerClose(callback: LedgerCallback): () => void {
        this.ledgerCallbacks.add(callback);
        return () => this.ledgerCallbacks.delete(callback);
    }

    // Emit price update (called from price service)
    emitPriceUpdate(update: PriceUpdate): void {
        this.priceCallbacks.forEach(cb => cb(update));
    }

    getLastLedgerIndex(): number {
        return this.lastLedgerIndex;
    }

    isConnected(): boolean {
        return this.isSubscribed;
    }
}

export const xrplWebSocketService = new XRPLWebSocketService();
