// Trading Service - Order Book, Buy/Sell Orders, Offer Management

import { OfferCreate, OfferCancel, xrpToDrops, dropsToXrp } from 'xrpl';
import { xrplClient } from './xrplClient';
import { walletService } from './walletService';
import { DEFAULT_TRADING_PAIR, XRP_DROPS_PER_XRP } from '@/config/constants';

export interface TradingPair {
    base: { currency: string; issuer?: string };
    quote: { currency: string; issuer?: string };
}

export interface OrderBookEntry {
    price: number;
    amount: number;
    total: number;
    account: string;
    sequence: number;
}

export interface OrderBook {
    bids: OrderBookEntry[]; // Buy orders (people wanting to buy XRP)
    asks: OrderBookEntry[]; // Sell orders (people wanting to sell XRP)
    spread: number;
    midPrice: number;
}

export interface ActiveOffer {
    sequence: number;
    takerGets: { currency: string; value: string; issuer?: string };
    takerPays: { currency: string; value: string; issuer?: string };
    price: number;
    isSell: boolean; // true if selling XRP, false if buying
    expiration?: number;
}

export interface TransactionResult {
    success: boolean;
    hash?: string;
    sequence?: number;
    error?: string;
}

class TradingService {
    // Fetch order book for a trading pair
    async getOrderBook(pair: TradingPair = DEFAULT_TRADING_PAIR, limit = 20): Promise<OrderBook> {
        const client = xrplClient.getClient();
        if (!client?.isConnected()) {
            throw new Error('Not connected to XRPL');
        }

        // Format currency amounts for XRPL
        const formatCurrency = (c: { currency: string; issuer?: string }) => {
            if (c.currency === 'XRP') {
                return { currency: 'XRP' };
            }
            return { currency: c.currency, issuer: c.issuer };
        };

        // Get asks (people selling XRP for quote currency)
        const asksResponse = await client.request({
            command: 'book_offers',
            taker_gets: formatCurrency(pair.base), // XRP
            taker_pays: formatCurrency(pair.quote), // USD
            limit,
        });

        // Get bids (people buying XRP with quote currency)
        const bidsResponse = await client.request({
            command: 'book_offers',
            taker_gets: formatCurrency(pair.quote), // USD
            taker_pays: formatCurrency(pair.base), // XRP
            limit,
        });

        const asks = this.parseOffers(asksResponse.result.offers, true);
        const bids = this.parseOffers(bidsResponse.result.offers, false);

        const bestAsk = asks[0]?.price ?? 0;
        const bestBid = bids[0]?.price ?? 0;
        const spread = bestAsk > 0 && bestBid > 0 ? bestAsk - bestBid : 0;
        const midPrice = bestAsk > 0 && bestBid > 0 ? (bestAsk + bestBid) / 2 : bestAsk || bestBid;

        return { bids, asks, spread, midPrice };
    }

    private parseOffers(offers: any[], isAsk: boolean): OrderBookEntry[] {
        return offers.map(offer => {
            let xrpAmount: number;
            let quoteAmount: number;

            if (isAsk) {
                // Selling XRP: taker_gets is XRP, taker_pays is USD
                xrpAmount = typeof offer.TakerGets === 'string'
                    ? Number(offer.TakerGets) / XRP_DROPS_PER_XRP
                    : Number(offer.TakerGets.value);
                quoteAmount = typeof offer.TakerPays === 'string'
                    ? Number(offer.TakerPays) / XRP_DROPS_PER_XRP
                    : Number(offer.TakerPays.value);
            } else {
                // Buying XRP: taker_gets is USD, taker_pays is XRP
                quoteAmount = typeof offer.TakerGets === 'string'
                    ? Number(offer.TakerGets) / XRP_DROPS_PER_XRP
                    : Number(offer.TakerGets.value);
                xrpAmount = typeof offer.TakerPays === 'string'
                    ? Number(offer.TakerPays) / XRP_DROPS_PER_XRP
                    : Number(offer.TakerPays.value);
            }

            const price = quoteAmount / xrpAmount;

            return {
                price,
                amount: xrpAmount,
                total: quoteAmount,
                account: offer.Account,
                sequence: offer.Sequence,
            };
        }).sort((a, b) => isAsk ? a.price - b.price : b.price - a.price);
    }

    // Place a buy order (offering USD to get XRP)
    async placeBuyOrder(
        xrpAmount: number,
        pricePerXrp: number,
        pair: TradingPair = DEFAULT_TRADING_PAIR
    ): Promise<TransactionResult> {
        const wallet = walletService.getWallet();
        if (!wallet) {
            throw new Error('No wallet connected');
        }

        const client = xrplClient.getClient();
        if (!client?.isConnected()) {
            throw new Error('Not connected to XRPL');
        }

        const usdAmount = xrpAmount * pricePerXrp;

        const offer: OfferCreate = {
            TransactionType: 'OfferCreate',
            Account: wallet.address,
            TakerPays: xrpToDrops(xrpAmount), // What we want (XRP in drops)
            TakerGets: {
                currency: pair.quote.currency,
                issuer: pair.quote.issuer!,
                value: usdAmount.toFixed(6),
            },
        };

        return this.submitTransaction(offer);
    }

    // Place a sell order (offering XRP to get USD)
    async placeSellOrder(
        xrpAmount: number,
        pricePerXrp: number,
        pair: TradingPair = DEFAULT_TRADING_PAIR
    ): Promise<TransactionResult> {
        const wallet = walletService.getWallet();
        if (!wallet) {
            throw new Error('No wallet connected');
        }

        const client = xrplClient.getClient();
        if (!client?.isConnected()) {
            throw new Error('Not connected to XRPL');
        }

        const usdAmount = xrpAmount * pricePerXrp;

        const offer: OfferCreate = {
            TransactionType: 'OfferCreate',
            Account: wallet.address,
            TakerGets: xrpToDrops(xrpAmount), // What we're selling (XRP in drops)
            TakerPays: {
                currency: pair.quote.currency,
                issuer: pair.quote.issuer!,
                value: usdAmount.toFixed(6),
            },
        };

        return this.submitTransaction(offer);
    }

    // Cancel an existing offer
    async cancelOffer(offerSequence: number): Promise<TransactionResult> {
        const wallet = walletService.getWallet();
        if (!wallet) {
            throw new Error('No wallet connected');
        }

        const client = xrplClient.getClient();
        if (!client?.isConnected()) {
            throw new Error('Not connected to XRPL');
        }

        const cancel: OfferCancel = {
            TransactionType: 'OfferCancel',
            Account: wallet.address,
            OfferSequence: offerSequence,
        };

        return this.submitTransaction(cancel);
    }

    // Get user's active offers
    async getAccountOffers(): Promise<ActiveOffer[]> {
        const wallet = walletService.getWallet();
        if (!wallet) {
            return [];
        }

        const client = xrplClient.getClient();
        if (!client?.isConnected()) {
            throw new Error('Not connected to XRPL');
        }

        const response = await client.request({
            command: 'account_offers',
            account: wallet.address,
        });

        return response.result.offers?.map(offer => {
            const takerGets = typeof offer.taker_gets === 'string'
                ? { currency: 'XRP', value: String(dropsToXrp(offer.taker_gets)) }
                : {
                    currency: offer.taker_gets.currency,
                    value: offer.taker_gets.value,
                    issuer: offer.taker_gets.issuer,
                };

            const takerPays = typeof offer.taker_pays === 'string'
                ? { currency: 'XRP', value: String(dropsToXrp(offer.taker_pays)) }
                : {
                    currency: offer.taker_pays.currency,
                    value: offer.taker_pays.value,
                    issuer: offer.taker_pays.issuer,
                };

            const isSell = takerGets.currency === 'XRP';
            const xrpValue = isSell ? Number(takerGets.value) : Number(takerPays.value);
            const usdValue = isSell ? Number(takerPays.value) : Number(takerGets.value);
            const price = usdValue / xrpValue;

            return {
                sequence: offer.seq,
                takerGets,
                takerPays,
                price,
                isSell,
                expiration: offer.expiration,
            };
        }) ?? [];
    }

    private async submitTransaction(tx: OfferCreate | OfferCancel): Promise<TransactionResult> {
        const wallet = walletService.getWallet();
        const client = xrplClient.getClient();

        if (!wallet || !client) {
            return { success: false, error: 'Wallet or client not available' };
        }

        try {
            const prepared = await client.autofill(tx);
            const signed = wallet.sign(prepared);
            const result = await client.submitAndWait(signed.tx_blob);

            const txResult = result.result.meta && typeof result.result.meta === 'object'
                ? (result.result.meta as any).TransactionResult
                : 'unknown';

            if (txResult === 'tesSUCCESS') {
                return {
                    success: true,
                    hash: result.result.hash,
                };
            } else {
                return {
                    success: false,
                    hash: result.result.hash,
                    error: txResult,
                };
            }
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Transaction failed',
            };
        }
    }
}

// Export singleton instance
export const tradingService = new TradingService();
