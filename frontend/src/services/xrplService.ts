/**
 * XRPL Service - Frontend integration with Winback XRPL Backend
 * Handles all blockchain interactions for transparent settlement
 */

const XRPL_API_BASE = 'https://tartanhacks-2026-back.onrender.com';

// ============================================
// TYPES
// ============================================

export interface XRPLPurchaseResponse {
    status: string;
    tx_hash: string;
    explorer_url: string;
    user_wallet: string;
    message: string;
}

export interface XRPLPredictionResponse {
    status: string;
    tx_hash: string;
    explorer_url: string;
    position_id: string;
    market_ticker: string;
    direction: string;
    message: string;
}

export interface XRPLSettlementResponse {
    status: string;
    outcome: string;
    settlement_hash: string;
    settlement_url: string;
    payment_hash?: string;
    payment_url?: string;
    cashback_xrp?: number;
    additional_charge?: number;
    message: string;
}

export interface XRPLWalletInfo {
    user_id: number;
    wallet_address: string;
    balance_xrp: number;
    explorer_url: string;
}

export interface XRPLTransaction {
    hash: string;
    type: string;
    timestamp: string;
    explorer_url: string;
    data: Record<string, any>;
}

export interface XRPLHistoryResponse {
    user_id: number;
    total_transactions: number;
    history: XRPLTransaction[];
}

export interface XRPLAnalytics {
    total_purchases: number;
    total_predictions: number;
    total_settlements: number;
    total_wins: number;
    total_losses: number;
    win_rate_percent: number;
    total_cashback_paid: number;
    total_charges: number;
    net_cashback: number;
    unique_users: number;
    company_wallet: string;
}

export interface XRPLServerStatus {
    status: string;
    service: string;
    network: string;
    company_wallet: string | null;
    escrow_wallet: string | null;
    explorer_base: string;
}

// Blockchain Explorer Types
export interface BlockchainStatus {
    connected: boolean;
    network: string;
    network_url?: string;
    latest_ledger: number;
    ledger_age_seconds: number;
    our_transaction_count: number;
    company_wallet: string | null;
    escrow_wallet: string | null;
    explorer_base: string;
    error?: string;
}

export interface PlatformWallet {
    type: string;
    label: string;
    icon: string;
    address: string;
    balance_xrp: number;
    transaction_count: number;
    purpose: string;
    explorer_url: string;
}

export interface UserWalletSummary {
    count: number;
    total_balance_xrp: number;
    wallets: { user_id: number; address: string; balance_xrp: number }[];
}

export interface AllWalletsResponse {
    platform_wallets: PlatformWallet[];
    user_wallets: UserWalletSummary;
}

export interface BlockchainTransaction {
    hash: string;
    type: string;
    ledger_index: number;
    timestamp: string;
    validated: boolean;
    explorer_url: string;
    icon?: string;
    title?: string;
    description?: string;
    color?: string;
    data: Record<string, any>;
}

export interface TransactionFeedResponse {
    transactions: BlockchainTransaction[];
    total: number;
}

export interface VerificationResult {
    verified: boolean;
    hash: string;
    ledger_index?: number;
    timestamp?: string;
    validated?: boolean;
    transaction_type?: string;
    account?: string;
    destination?: string;
    data?: Record<string, any>;
    explorer_url?: string;
    error?: string;
}

export interface UserBlockchainTrail {
    user_id: number;
    wallet: { address: string; balance_xrp: number; explorer_url: string } | null;
    transactions: BlockchainTransaction[];
    total: number;
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Check if XRPL backend is running
 */
export async function checkXRPLStatus(): Promise<XRPLServerStatus | null> {
    try {
        const response = await fetch(`${XRPL_API_BASE}/`);
        if (!response.ok) return null;
        return await response.json();
    } catch {
        console.warn('XRPL backend not available');
        return null;
    }
}

/**
 * Log a purchase to XRP Ledger
 * Called after checkout completes
 */
export async function logPurchaseToXRPL(
    userId: number,
    purchaseId: string,
    itemName: string,
    itemIcon: string,
    purchaseAmount: number
): Promise<XRPLPurchaseResponse | null> {
    try {
        const response = await fetch(`${XRPL_API_BASE}/purchase/log`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: userId,
                purchase_id: purchaseId,
                item_name: itemName,
                item_icon: itemIcon,
                purchase_amount: purchaseAmount
            })
        });

        if (!response.ok) {
            throw new Error(`XRPL API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to log purchase to XRPL:', error);
        return null;
    }
}

/**
 * Log prediction configuration to XRP Ledger
 * Called when user sets up their prediction
 */
export async function logPredictionToXRPL(
    userId: number,
    positionId: string,
    purchaseId: string,
    marketTicker: string,
    marketTitle: string,
    predictionDirection: 'YES' | 'NO',
    entryPrice: number,
    maxRewardPercent: number,
    maxLossPercent: number,
    timeLimitDays: number
): Promise<XRPLPredictionResponse | null> {
    try {
        const response = await fetch(`${XRPL_API_BASE}/prediction/configure`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: userId,
                position_id: positionId,
                purchase_id: purchaseId,
                market_ticker: marketTicker,
                market_title: marketTitle,
                prediction_direction: predictionDirection,
                entry_price: entryPrice,
                max_reward_percent: maxRewardPercent,
                max_loss_percent: maxLossPercent,
                time_limit_days: timeLimitDays
            })
        });

        if (!response.ok) {
            throw new Error(`XRPL API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to log prediction to XRPL:', error);
        return null;
    }
}

/**
 * Settle position on XRP Ledger
 * Logs outcome and triggers payment if user won
 */
export async function settlePositionOnXRPL(
    userId: number,
    positionId: string,
    marketTicker: string,
    outcome: 'win' | 'loss',
    entryPrice: number,
    finalPrice: number,
    settlementReason: string,
    cashbackAmount: number,
    roi: number
): Promise<XRPLSettlementResponse | null> {
    try {
        const response = await fetch(`${XRPL_API_BASE}/position/settle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: userId,
                position_id: positionId,
                market_ticker: marketTicker,
                outcome,
                entry_price: entryPrice,
                final_price: finalPrice,
                settlement_reason: settlementReason,
                cashback_amount: cashbackAmount,
                roi
            })
        });

        if (!response.ok) {
            throw new Error(`XRPL API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to settle position on XRPL:', error);
        return null;
    }
}

/**
 * Get user's XRPL wallet info
 */
export async function getUserWallet(userId: number): Promise<XRPLWalletInfo | null> {
    try {
        const response = await fetch(`${XRPL_API_BASE}/user/${userId}/wallet`);
        if (!response.ok) return null;
        return await response.json();
    } catch {
        return null;
    }
}

/**
 * Get user's blockchain transaction history
 */
export async function getUserBlockchainHistory(
    userId: number,
    transactionType?: string
): Promise<XRPLHistoryResponse | null> {
    try {
        let url = `${XRPL_API_BASE}/user/${userId}/history`;
        if (transactionType) {
            url += `?tx_type=${transactionType}`;
        }

        const response = await fetch(url);
        if (!response.ok) return null;
        return await response.json();
    } catch {
        return null;
    }
}

/**
 * Get platform analytics from blockchain
 */
export async function getPlatformAnalytics(): Promise<XRPLAnalytics | null> {
    try {
        const response = await fetch(`${XRPL_API_BASE}/analytics`);
        if (!response.ok) return null;
        return await response.json();
    } catch {
        return null;
    }
}

// ============================================
// BLOCKCHAIN EXPLORER API
// ============================================

/**
 * Get blockchain network status
 */
export async function getBlockchainStatus(): Promise<BlockchainStatus | null> {
    try {
        const response = await fetch(`${XRPL_API_BASE}/blockchain/status`);
        if (!response.ok) return null;
        return await response.json();
    } catch {
        return null;
    }
}

/**
 * Get all platform wallets
 */
export async function getAllWallets(): Promise<AllWalletsResponse | null> {
    try {
        const response = await fetch(`${XRPL_API_BASE}/blockchain/wallets`);
        if (!response.ok) return null;
        return await response.json();
    } catch {
        return null;
    }
}

/**
 * Get transaction feed for live display
 */
export async function getTransactionFeed(limit: number = 20): Promise<TransactionFeedResponse | null> {
    try {
        const response = await fetch(`${XRPL_API_BASE}/blockchain/feed?limit=${limit}`);
        if (!response.ok) return null;
        return await response.json();
    } catch {
        return null;
    }
}

/**
 * Verify a transaction by hash
 */
export async function verifyTransaction(txHash: string): Promise<VerificationResult | null> {
    try {
        const response = await fetch(`${XRPL_API_BASE}/blockchain/verify/${txHash}`);
        if (!response.ok) return null;
        return await response.json();
    } catch {
        return null;
    }
}

/**
 * Get user's blockchain trail
 */
export async function getUserBlockchainTrail(userId: number): Promise<UserBlockchainTrail | null> {
    try {
        const response = await fetch(`${XRPL_API_BASE}/blockchain/user/${userId}/trail`);
        if (!response.ok) return null;
        return await response.json();
    } catch {
        return null;
    }
}

// ============================================
// UI HELPERS
// ============================================

/**
 * Format XRP amount for display
 */
export function formatXRP(amount: number): string {
    return `${amount.toFixed(4)} XRP`;
}

/**
 * Shorten transaction hash for display
 */
export function shortenTxHash(hash: string): string {
    if (!hash || hash.length < 16) return hash;
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
}

/**
 * Get transaction type display name
 */
export function getTransactionTypeName(type: string): string {
    const names: Record<string, string> = {
        'PURCHASE': '🛒 Purchase',
        'PREDICTION_CONFIG': '🎯 Prediction',
        'SETTLEMENT': '✅ Settlement',
        'CASHBACK_PAYMENT': '💰 Cashback',
        'POSITION_UPDATE': '📊 Update'
    };
    return names[type] || type;
}

/**
 * Get explorer URL for an address
 */
export function getAddressExplorerUrl(address: string): string {
    return `https://testnet.xrpl.org/accounts/${address}`;
}

/**
 * Get explorer URL for a transaction
 */
export function getTransactionExplorerUrl(hash: string): string {
    return `https://testnet.xrpl.org/transactions/${hash}`;
}
