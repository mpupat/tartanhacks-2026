// Kalshi API Service Layer
// Uses mock data for development - can be swapped for real API

import type {
    KalshiMarket,
    MarketCategory,
    MarketFilters,
    MarketOrderbook,
    Position,
    Purchase,
    SavedMarket
} from '@/types/kalshi';

// ============================================
// MOCK DATA
// ============================================

const MOCK_MARKETS: KalshiMarket[] = [
    {
        ticker: 'WEATHER-NYC-50F-FEB8',
        event_ticker: 'WEATHER-NYC-FEB8',
        title: 'NYC hits 50°F today?',
        subtitle: 'Will Central Park reach 50°F on Feb 8?',
        category: 'weather',
        yes_price: 34,
        no_price: 66,
        yes_price_change_24h: 12.5,
        volume_24h: 1247389,
        total_volume: 3891234,
        open_interest: 14582,
        close_date: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
        expiration_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'open',
        result: null,
        resolution_criteria: 'This market resolves YES if the National Weather Service reports a high temperature of 50°F or above at Central Park station.',
    },
    {
        ticker: 'POLITICS-NOMINEE-MAR1',
        event_ticker: 'POLITICS-NOMINEE-2026',
        title: 'Senate confirms nominee by March 1?',
        subtitle: 'Will the cabinet nominee be confirmed?',
        category: 'politics',
        yes_price: 67,
        no_price: 33,
        yes_price_change_24h: 3.2,
        volume_24h: 8420000,
        total_volume: 24500000,
        open_interest: 89234,
        close_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        expiration_date: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'open',
        result: null,
        resolution_criteria: 'Resolves YES if the US Senate votes to confirm the nominee before March 1, 2026 11:59 PM ET.',
    },
    {
        ticker: 'ECON-SP500-6000-MAR',
        event_ticker: 'ECON-SP500-MAR2026',
        title: 'S&P 500 above 6000 by March?',
        subtitle: 'Will S&P 500 close above 6000?',
        category: 'economics',
        yes_price: 45,
        no_price: 55,
        yes_price_change_24h: -5.3,
        volume_24h: 3800000,
        total_volume: 12400000,
        open_interest: 45678,
        close_date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
        expiration_date: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'open',
        result: null,
        resolution_criteria: 'Resolves YES if S&P 500 index closes at or above 6000 on March 31, 2026.',
    },
    {
        ticker: 'SPORTS-LAKERS-FEB7',
        event_ticker: 'NBA-GAMES-FEB7',
        title: 'Lakers win tonight?',
        subtitle: 'Lakers vs Celtics - Feb 7',
        category: 'sports',
        yes_price: 58,
        no_price: 42,
        yes_price_change_24h: 8.1,
        volume_24h: 890000,
        total_volume: 2100000,
        open_interest: 12340,
        close_date: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        expiration_date: new Date(Date.now() + 16 * 60 * 60 * 1000).toISOString(),
        status: 'open',
        result: null,
        resolution_criteria: 'Resolves YES if the Los Angeles Lakers defeat the Boston Celtics in their scheduled game.',
    },
    {
        ticker: 'ECON-GAS-UNDER3-FEB',
        event_ticker: 'ECON-GAS-FEB2026',
        title: 'Gas under $3/gallon this week?',
        subtitle: 'National average gasoline price',
        category: 'economics',
        yes_price: 23,
        no_price: 77,
        yes_price_change_24h: -2.1,
        volume_24h: 520000,
        total_volume: 1890000,
        open_interest: 8900,
        close_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        expiration_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'open',
        result: null,
        resolution_criteria: 'Resolves YES if AAA national average gasoline price drops below $3.00/gallon.',
    },
    {
        ticker: 'CLIMATE-TEMP-RECORD-FEB',
        event_ticker: 'CLIMATE-2026',
        title: 'February breaks temperature record?',
        subtitle: 'Global average temperature anomaly',
        category: 'climate',
        yes_price: 71,
        no_price: 29,
        yes_price_change_24h: 1.8,
        volume_24h: 670000,
        total_volume: 3200000,
        open_interest: 15600,
        close_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        expiration_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'open',
        result: null,
        resolution_criteria: 'Resolves YES if NOAA declares February 2026 as the warmest February on record.',
    },
    {
        ticker: 'ENTERTAINMENT-OSCAR-DRAMA',
        event_ticker: 'OSCARS-2026',
        title: 'Best Picture goes to a drama?',
        subtitle: '2026 Academy Awards prediction',
        category: 'entertainment',
        yes_price: 82,
        no_price: 18,
        yes_price_change_24h: 0.5,
        volume_24h: 340000,
        total_volume: 1500000,
        open_interest: 6700,
        close_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        expiration_date: new Date(Date.now() + 46 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'open',
        result: null,
        resolution_criteria: 'Resolves YES if the Best Picture winner at 2026 Oscars is categorized as Drama by IMDb.',
    },
    {
        ticker: 'FINANCE-FED-RATE-MAR',
        event_ticker: 'FED-DECISIONS-2026',
        title: 'Fed cuts rates in March?',
        subtitle: 'FOMC March meeting decision',
        category: 'finance',
        yes_price: 38,
        no_price: 62,
        yes_price_change_24h: -8.4,
        volume_24h: 4200000,
        total_volume: 18900000,
        open_interest: 78000,
        close_date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
        expiration_date: new Date(Date.now() + 36 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'open',
        result: null,
        resolution_criteria: 'Resolves YES if FOMC announces a rate cut at March 2026 meeting.',
    },
];

// ============================================
// MARKET API FUNCTIONS
// ============================================

export async function fetchMarkets(filters: MarketFilters = {}): Promise<KalshiMarket[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    let markets = [...MOCK_MARKETS];

    // Filter by category
    if (filters.category && filters.category !== 'all') {
        markets = markets.filter(m => m.category === filters.category);
    }

    // Filter by status
    if (filters.status) {
        markets = markets.filter(m => m.status === filters.status);
    }

    // Search
    if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        markets = markets.filter(m =>
            m.title.toLowerCase().includes(searchLower) ||
            m.subtitle.toLowerCase().includes(searchLower)
        );
    }

    // Sort
    switch (filters.sortBy) {
        case 'volume':
            markets.sort((a, b) => b.volume_24h - a.volume_24h);
            break;
        case 'ending_soon':
            markets.sort((a, b) =>
                new Date(a.close_date).getTime() - new Date(b.close_date).getTime()
            );
            break;
        case 'trending':
            markets.sort((a, b) =>
                Math.abs(b.yes_price_change_24h) - Math.abs(a.yes_price_change_24h)
            );
            break;
        case 'new':
        default:
            // Keep default order
            break;
    }

    return markets;
}

export async function getMarket(ticker: string): Promise<KalshiMarket | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return MOCK_MARKETS.find(m => m.ticker === ticker) || null;
}

export async function getMarketOrderbook(ticker: string): Promise<MarketOrderbook> {
    await new Promise(resolve => setTimeout(resolve, 100));

    const market = MOCK_MARKETS.find(m => m.ticker === ticker);
    if (!market) {
        return { yes_bids: [], no_bids: [] };
    }

    // Generate mock orderbook based on current price
    return {
        yes_bids: [
            { price: market.yes_price, quantity: 1200 },
            { price: market.yes_price - 1, quantity: 800 },
            { price: market.yes_price - 2, quantity: 500 },
        ],
        no_bids: [
            { price: market.no_price, quantity: 1500 },
            { price: market.no_price - 1, quantity: 1000 },
            { price: market.no_price - 2, quantity: 750 },
        ],
    };
}

// ============================================
// PRICE SIMULATION (for real-time updates)
// ============================================

let priceOffsets: Record<string, number> = {};

export function simulatePriceUpdate(market: KalshiMarket): KalshiMarket {
    // Add small random price movement
    if (!priceOffsets[market.ticker]) {
        priceOffsets[market.ticker] = 0;
    }

    const change = (Math.random() - 0.5) * 4; // -2 to +2 cents
    priceOffsets[market.ticker] += change;

    // Clamp offset
    priceOffsets[market.ticker] = Math.max(-10, Math.min(10, priceOffsets[market.ticker]));

    const newYesPrice = Math.max(1, Math.min(99,
        Math.round(market.yes_price + priceOffsets[market.ticker])
    ));

    return {
        ...market,
        yes_price: newYesPrice,
        no_price: 100 - newYesPrice,
    };
}

// ============================================
// CATEGORY HELPERS
// ============================================

export const CATEGORY_CONFIG: Record<MarketCategory, { icon: string; label: string; color: string }> = {
    weather: { icon: '🌡️', label: 'Weather', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    politics: { icon: '🗳️', label: 'Politics', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    economics: { icon: '📈', label: 'Economics', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    sports: { icon: '⚽', label: 'Sports', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    climate: { icon: '🌍', label: 'Climate', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
    entertainment: { icon: '🎬', label: 'Entertainment', color: 'bg-pink-100 text-pink-700 border-pink-200' },
    finance: { icon: '💰', label: 'Finance', color: 'bg-green-100 text-green-700 border-green-200' },
    crypto: { icon: '₿', label: 'Crypto', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    other: { icon: '📊', label: 'Other', color: 'bg-gray-100 text-gray-700 border-gray-200' },
};

export const ALL_CATEGORIES: MarketCategory[] = [
    'weather', 'politics', 'economics', 'sports',
    'climate', 'entertainment', 'finance', 'crypto', 'other'
];

// ============================================
// TIME HELPERS
// ============================================

export function formatTimeRemaining(dateString: string): string {
    const now = new Date();
    const target = new Date(dateString);
    const diff = target.getTime() - now.getTime();

    if (diff <= 0) return 'Closed';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

export function formatVolume(volume: number): string {
    if (volume >= 1000000) {
        return `$${(volume / 1000000).toFixed(1)}M`;
    }
    if (volume >= 1000) {
        return `$${(volume / 1000).toFixed(0)}K`;
    }
    return `$${volume}`;
}

// ============================================
// P&L CALCULATION
// ============================================

export function calculatePositionPnL(position: Position): {
    pnl: number;
    pnlPercent: number;
    isWinning: boolean;
} {
    if (!position.entry_price || !position.current_price || !position.purchase) {
        return { pnl: 0, pnlPercent: 0, isWinning: false };
    }

    const priceChange = position.current_price - position.entry_price;
    const percentMove = (priceChange / position.entry_price) * 100;

    // Clamp to thresholds
    const clampedPercent = Math.min(
        Math.max(percentMove, -(position.max_loss_percent || 5)),
        position.max_reward_percent || 20
    );

    const pnl = (clampedPercent / 100) * position.purchase.purchase_amount;

    return {
        pnl,
        pnlPercent: clampedPercent,
        isWinning: clampedPercent > 0,
    };
}

export function checkSettlementTrigger(position: Position, market: KalshiMarket): {
    shouldSettle: boolean;
    reason: Position['settlement_reason'];
    outcome: Position['final_outcome'];
} {
    if (position.status !== 'active') {
        return { shouldSettle: false, reason: null, outcome: null };
    }

    const { pnlPercent } = calculatePositionPnL(position);

    // Check market resolved
    if (market.status === 'settled' && market.result) {
        const won = market.result.toUpperCase() === position.prediction_direction;
        return {
            shouldSettle: true,
            reason: 'market_resolved',
            outcome: won ? 'win' : 'loss',
        };
    }

    // Check max reward threshold
    if (pnlPercent >= (position.max_reward_percent || 20)) {
        return {
            shouldSettle: true,
            reason: 'threshold_reward',
            outcome: 'win',
        };
    }

    // Check max loss threshold
    if (pnlPercent <= -(position.max_loss_percent || 5)) {
        return {
            shouldSettle: true,
            reason: 'threshold_loss',
            outcome: 'loss',
        };
    }

    // Check time expired
    if (position.expires_at && new Date() >= new Date(position.expires_at)) {
        return {
            shouldSettle: true,
            reason: 'time_expired',
            outcome: pnlPercent >= 0 ? 'win' : 'loss',
        };
    }

    return { shouldSettle: false, reason: null, outcome: null };
}
