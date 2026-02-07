// Kalshi Market Types - Matching Real API Response

// Categories from Kalshi API (normalized to lowercase)
export type MarketCategory =
    | 'politics'
    | 'economics'
    | 'climate'
    | 'sports'
    | 'entertainment'
    | 'financials'
    | 'health'
    | 'science'
    | 'world'
    | 'social'
    | 'crypto'
    | 'elections'
    | 'companies'
    | 'transportation'
    | 'weather'
    | 'other';

export type MarketStatus = 'active' | 'closed' | 'settled' | 'open';

export type MarketResult = 'yes' | 'no' | '' | null;

// API Response Types
export interface KalshiAPIMarket {
    ticker: string;
    event_ticker: string;
    title: string;
    subtitle?: string;
    open_time: string;
    close_time: string;
    expiration_time: string;
    status: string;
    yes_bid: number;
    yes_ask: number;
    no_bid: number;
    no_ask: number;
    last_price: number;
    previous_yes_bid?: number;
    previous_yes_ask?: number;
    volume: number;
    volume_24h: number;
    open_interest: number;
    result?: string;
    can_close_early?: boolean;
    expiration_value?: string;
    latest_expiration_time?: string;
    cap_strike?: number;
    floor_strike?: number;
}

export interface KalshiAPIEvent {
    event_ticker: string;
    title: string;
    sub_title?: string;
    category: string;
    series_ticker?: string;
    mutually_exclusive?: boolean;
    collateral_return_type?: string;
    available_on_brokers?: boolean;
}

export interface KalshiMarketsResponse {
    markets: KalshiAPIMarket[];
    cursor?: string;
}

export interface KalshiEventsResponse {
    events: KalshiAPIEvent[];
    cursor?: string;
}

// Transformed Market for UI (combined market + event data)
export interface KalshiMarket {
    ticker: string;
    event_ticker: string;
    title: string;
    subtitle: string;
    category: MarketCategory;
    yes_price: number;      // 0-100 (cents) - derived from yes_bid or last_price
    no_price: number;       // 0-100 (cents)
    yes_bid: number;
    yes_ask: number;
    no_bid: number;
    no_ask: number;
    last_price: number;
    yes_price_change_24h: number;  // calculated change
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
