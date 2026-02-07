// Kalshi Market Types

export type MarketCategory =
    | 'weather'
    | 'politics'
    | 'economics'
    | 'sports'
    | 'climate'
    | 'entertainment'
    | 'finance'
    | 'crypto'
    | 'other';

export type MarketStatus = 'open' | 'closed' | 'settled';

export type MarketResult = 'yes' | 'no' | null;

export interface KalshiMarket {
    ticker: string;
    event_ticker: string;
    title: string;
    subtitle: string;
    category: MarketCategory;
    yes_price: number;      // 0-100 (cents)
    no_price: number;       // 0-100 (cents)
    yes_price_change_24h: number;  // percentage change
    volume_24h: number;
    total_volume: number;
    open_interest: number;
    close_date: string;     // ISO date string
    expiration_date: string;
    status: MarketStatus;
    result: MarketResult;
    resolution_criteria: string;
}

export interface MarketOrderbook {
    yes_bids: Array<{ price: number; quantity: number }>;
    no_bids: Array<{ price: number; quantity: number }>;
}

// Position Types

export type PositionStatus = 'unconfigured' | 'active' | 'settled';

export type PredictionDirection = 'YES' | 'NO';

export type SettlementReason =
    | 'market_resolved'
    | 'threshold_reward'
    | 'threshold_loss'
    | 'time_expired';

export type PositionOutcome = 'win' | 'loss';

export interface Purchase {
    id: string;
    item_name: string;
    item_icon: string;  // emoji
    purchase_amount: number;
    purchase_date: string;
}

export interface Position {
    // Purchase Info
    id: string;
    purchase: Purchase;

    // Market Selection (null if unconfigured)
    market_ticker: string | null;
    market_title: string | null;
    market_category: MarketCategory | null;
    market_closes_at: string | null;

    // Prediction (null if unconfigured)
    prediction_direction: PredictionDirection | null;
    entry_price: number | null;
    current_price: number | null;

    // Thresholds (null if unconfigured)
    max_reward_percent: number | null;
    max_loss_percent: number | null;
    time_limit_days: number | null;
    expires_at: string | null;

    // Status
    status: PositionStatus;
    configured_at: string | null;
    settled_at: string | null;
    settlement_reason: SettlementReason | null;
    final_outcome: PositionOutcome | null;
    cashback_amount: number | null;
    roi: number | null;
}

// Filter & Sort Types

export type MarketSortOption = 'trending' | 'volume' | 'ending_soon' | 'new';

export interface MarketFilters {
    category?: MarketCategory | 'all';
    status?: MarketStatus;
    search?: string;
    sortBy?: MarketSortOption;
}

// Saved Markets

export interface SavedMarket {
    ticker: string;
    saved_at: string;
}
