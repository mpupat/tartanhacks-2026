// Kalshi API Service Layer
// Fetches real data from Kalshi public API via Vite proxy
// Strategy: Fetch events first (which have categories), then get markets for each event

import type {
    KalshiMarket,
    KalshiAPIMarket,
    KalshiAPIEvent,
    KalshiEventsResponse,
    MarketCategory,
    MarketFilters,
    MarketOrderbook,
    Position,
} from '@/types/kalshi';
import { computeHardMaxExpiryISO, clampExpiryISO } from "@/lib/risk";
// ============================================
// API CONFIGURATION
// ============================================

// Prefer an explicit backend URL in production. In dev, default to '/kalshi' so Vite proxy works.
const VITE_API_BASE = ((import.meta as any).env?.VITE_KALSHI_API_BASE) as string | undefined;
const API_BASE = VITE_API_BASE ?? '/kalshi'; // Dev: '/kalshi' (Vite proxy or local backend). Prod: set VITE_KALSHI_API_BASE to your backend absolute URL.
const IS_PROD = ((import.meta as any).env?.MODE) === 'production';
const PUBLIC_KALSHI_BASE = 'https://api.elections.kalshi.com/trade-api/v2';

async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
    const tried: string[] = [];
    const bases = [API_BASE];

    // If API_BASE is a relative proxy path (starts with '/'), only in non-production try the public Kalshi API as a fallback.
    // In production, a relative API_BASE means your server MUST handle /kalshi/*; do not attempt Kalshi public domain from the browser (CORS will block it).
    if (API_BASE.startsWith('/')) {
        if (!IS_PROD) {
            // Local dev fallback: if the Vite proxy isn't available, try the public API so dev still works (but this will CORS in prod).
            bases.push(PUBLIC_KALSHI_BASE);
        }
    }

    for (const base of bases) {
        const url = base.endsWith('/') ? `${base.slice(0, -1)}${path}` : `${base}${path}`;
        tried.push(url);
        try {
            const res = await fetch(url, options);
            if (res.status === 404) {
                console.warn(`Request returned 404 for ${url}; trying next base if available`);
                continue; // try next base
            }
            return res;
        } catch (err) {
            console.warn(`Request to ${url} failed:`, err);
            // try next base
            continue;
        }
    }

    // If running in production and API_BASE is still a relative path, give a clear error recommending setting the env var to an absolute backend URL.
    if (API_BASE.startsWith('/') && IS_PROD) {
        throw new Error(`All API fetch attempts failed in production. Your frontend is configured to use a relative API base ("${API_BASE}") which requires a server route like "/kalshi/*". In production you should set VITE_KALSHI_API_BASE to your backend proxy (e.g. https://<your-backend>/kalshi). Tried: ${tried.join(', ')}`);
    }

    const err = new Error(`All API fetch attempts failed. Tried: ${tried.join(', ')}`);
    throw err;
}

// ============================================
// CATEGORY MAPPING
// ============================================

function normalizeCategory(apiCategory: string): MarketCategory {
    const categoryMap: Record<string, MarketCategory> = {
        'politics': 'politics',
        'economics': 'economics',
        'climate and weather': 'climate',
        'climate': 'climate',
        'sports': 'sports',
        'entertainment': 'entertainment',
        'financials': 'financials',
        'finance': 'financials',
        'health': 'health',
        'science and technology': 'science',
        'science': 'science',
        'world': 'world',
        'social': 'social',
        'crypto': 'crypto',
        'elections': 'elections',
        'companies': 'companies',
        'transportation': 'transportation',
    };

    const normalized = apiCategory.toLowerCase();
    return categoryMap[normalized] || 'other';
}

// ============================================
// API FETCH FUNCTIONS
// ============================================

interface EventWithMarkets {
    event: KalshiAPIEvent;
    markets: KalshiAPIMarket[];
}

export async function fetchMarkets(filters: MarketFilters = {}): Promise<KalshiMarket[]> {
  try {
    // Primary: events with nested markets (this WORKS in your backend screenshots)
    const eventsResponse = await apiFetch(`/events?limit=100&with_nested_markets=true&status=open`);
    if (!eventsResponse.ok) {
      // fallback (some deployments might not support with_nested_markets)
      return await fetchMarketsViaEvents(filters);
    }

    const eventsData = await eventsResponse.json();

    // Handle shape: { events: [...] }
    const events = eventsData?.events ?? [];

    // If nested markets exist, process them
    if (events.length > 0 && events[0]?.markets) {
      return processEventsWithMarkets(events, filters);
    }

    // Else fallback
    return await fetchMarketsViaEvents(filters);
  } catch (error) {
    console.error("Failed to fetch markets:", error);
    return [];
  }
}



export function buildPositionWithBoundedExpiry(input: {
    market: KalshiMarket;
    prediction_direction: "YES" | "NO";
    purchase_amount: number;
    max_loss_percent?: number;
    max_reward_percent?: number;
    requested_expires_at_iso: string;
}): Position {
    const hardMax = computeHardMaxExpiryISO({
        market: input.market,
        purchaseAmount: input.purchase_amount,
        maxLossPercent: input.max_loss_percent,
        maxRewardPercent: input.max_reward_percent,
    });

    const expiresAt = clampExpiryISO({
        requestedExpiryISO: input.requested_expires_at_iso,
        hardMaxExpiryISO: hardMax,
    });

    return {
        // ...your other fields
        status: "active",
        prediction_direction: input.prediction_direction,
        max_loss_percent: input.max_loss_percent ?? 5,
        max_reward_percent: input.max_reward_percent ?? 20,
        expires_at: expiresAt,

        // optional: store these for UI messaging
        // hard_max_expires_at: hardMax,
        // created_at: new Date().toISOString(),
    } as Position;
}


// Fallback: Fetch events, then fetch markets for a selection of events
async function fetchMarketsViaEvents(filters: MarketFilters = {}): Promise<KalshiMarket[]> {
    try {
        // Fetch events
        const eventsResponse = await apiFetch(`/events?limit=50`);
        if (!eventsResponse.ok) throw new Error(`Events API error: ${eventsResponse.status}`);

        const eventsData: KalshiEventsResponse = await eventsResponse.json();
        let events = eventsData.events;

        // Filter events by category if specified
        if (filters.category && filters.category !== 'all') {
            events = events.filter(e => normalizeCategory(e.category) === filters.category);
        }

        // Limit events to avoid too many requests
        const eventsToFetch = events.slice(0, 20);

        // Fetch markets for each event in parallel
        const marketPromises = eventsToFetch.map(async (event) => {
            try {
                const response = await apiFetch(`/events/${event.event_ticker}`);
                if (!response.ok) return [];

                const data = await response.json();
                return (data.markets || []).map((m: KalshiAPIMarket) =>
                    transformMarket(m, event.category, event.title)
                );
            } catch {
                return [];
            }
        });

        const marketsArrays = await Promise.all(marketPromises);
        let allMarkets = marketsArrays.flat();

        // Filter out combo/parlay markets (have comma-separated titles)
        allMarkets = allMarkets.filter(m => !m.title.includes(',yes ') && !m.title.startsWith('yes '));

        // Apply client-side filters
        allMarkets = applyFilters(allMarkets, filters);

        return allMarkets;
    } catch (error) {
        console.error('Failed to fetch markets via events:', error);
        return [];
    }
}

// Simpler fallback: Just fetch markets directly and filter
async function fetchMarketsSimple(filters: MarketFilters = {}): Promise<KalshiMarket[]> {
    try {
        const response = await apiFetch(`/markets?limit=100`);
        if (!response.ok) throw new Error(`Markets API error: ${response.status}`);

        const data = await response.json();
        let markets = (data.markets || [])
            .filter((m: KalshiAPIMarket) =>
                // Filter out combo/parlay markets
                !m.title.includes(',yes ') &&
                !m.title.startsWith('yes ') &&
                m.title.length < 150
            )
            .map((m: KalshiAPIMarket) => transformMarket(m, 'Other'));

        markets = applyFilters(markets, filters);

        return markets;
    } catch (error) {
        console.error('Failed to fetch markets (simple):', error);
        return [];
    }
}

function processEventsWithMarkets(events: any[], filters: MarketFilters): KalshiMarket[] {
    let allMarkets: KalshiMarket[] = [];

    for (const event of events) {
        const category = event.category || 'Other';
        const eventTitle = event.title;

        for (const market of event.markets || []) {
            // Filter out combo/parlay markets
            if (market.title?.includes(',yes ') || market.title?.startsWith('yes ')) {
                continue;
            }
            allMarkets.push(transformMarket(market, category, eventTitle));
        }
    }

    return applyFilters(allMarkets, filters);
}

function applyFilters(markets: KalshiMarket[], filters: MarketFilters): KalshiMarket[] {
    let result = [...markets];

    // Filter by category
    if (filters.category && filters.category !== 'all') {
        result = result.filter(m => m.category === filters.category);
    }

    // Search filter
    if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        result = result.filter(m =>
            m.title.toLowerCase().includes(searchLower) ||
            m.subtitle.toLowerCase().includes(searchLower)
        );
    }

    // Sort
    switch (filters.sortBy) {
        case 'volume':
            result.sort((a, b) => b.volume_24h - a.volume_24h);
            break;
        case 'ending_soon':
            result.sort((a, b) =>
                new Date(a.close_date).getTime() - new Date(b.close_date).getTime()
            );
            break;
        case 'trending':
            result.sort((a, b) =>
                Math.abs(b.yes_price_change_24h) - Math.abs(a.yes_price_change_24h)
            );
            break;
        case 'new':
        default:
            // Keep order
            break;
    }

    return result;
}

export async function getMarket(ticker: string): Promise<KalshiMarket | null> {
    try {
        const response = await apiFetch(`/markets/${ticker}`);
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error(`Market API error: ${response.status}`);
        }

        const data = await response.json();
        return transformMarket(data.market, 'other');
    } catch (error) {
        console.error(`Failed to fetch market ${ticker}:`, error);
        return null;
    }
}

function transformMarket(
    apiMarket: KalshiAPIMarket,
    categoryFromEvent?: string,
    eventTitle?: string
): KalshiMarket {
    const category = normalizeCategory(categoryFromEvent || 'other');

    // Use market title, or fall back to event title if market title looks bad
    let title = apiMarket.title || eventTitle || 'Unknown Market';
    if (title.includes(',yes ') || title.startsWith('yes ')) {
        title = eventTitle || 'Unknown Market';
    }

    // Calculate yes_price from bid/ask or last_price
    const yesPrice = apiMarket.yes_bid > 0 ? apiMarket.yes_bid : (apiMarket.last_price || 50);
    const noPrice = apiMarket.no_bid > 0 ? apiMarket.no_bid : (100 - yesPrice);

    // Calculate 24h change
    let priceChange = 0;
    const market = apiMarket as any; // API may have additional fields
    if (market.previous_yes_bid && market.previous_yes_bid > 0) {
        priceChange = ((yesPrice - market.previous_yes_bid) / market.previous_yes_bid) * 100;
    } else if (market.previous_price && market.previous_price > 0) {
        priceChange = ((yesPrice - market.previous_price) / market.previous_price) * 100;
    }

    return {
        ticker: apiMarket.ticker,
        event_ticker: apiMarket.event_ticker,
        title,
        subtitle: apiMarket.subtitle || '',
        category,
        yes_price: yesPrice,
        no_price: noPrice,
        yes_bid: apiMarket.yes_bid || 0,
        yes_ask: apiMarket.yes_ask || 0,
        no_bid: apiMarket.no_bid || 0,
        no_ask: apiMarket.no_ask || 0,
        last_price: apiMarket.last_price || 0,
        yes_price_change_24h: Math.round(priceChange * 10) / 10,
        volume_24h: apiMarket.volume_24h || 0,
        total_volume: apiMarket.volume || 0,
        open_interest: apiMarket.open_interest || 0,
        close_date: apiMarket.close_time,
        expiration_date: apiMarket.expiration_time,
        status: apiMarket.status as KalshiMarket['status'],
        result: (apiMarket.result as KalshiMarket['result']) || null,
        resolution_criteria: (apiMarket as any).rules_primary ||
            `Market settles based on official outcome. Close: ${new Date(apiMarket.close_time).toLocaleDateString()}`,
    };
}

export async function getMarketOrderbook(ticker: string): Promise<MarketOrderbook> {
    const market = await getMarket(ticker);
    if (!market) {
        return { yes_bids: [], no_bids: [] };
    }

    // Generate orderbook levels based on current prices
    return {
        yes_bids: [
            { price: market.yes_bid, quantity: Math.floor(1000 + Math.random() * 2000) },
            { price: Math.max(1, market.yes_bid - 1), quantity: Math.floor(500 + Math.random() * 1000) },
            { price: Math.max(1, market.yes_bid - 2), quantity: Math.floor(200 + Math.random() * 500) },
        ],
        no_bids: [
            { price: market.no_bid, quantity: Math.floor(1000 + Math.random() * 2000) },
            { price: Math.max(1, market.no_bid - 1), quantity: Math.floor(500 + Math.random() * 1000) },
            { price: Math.max(1, market.no_bid - 2), quantity: Math.floor(200 + Math.random() * 500) },
        ],
    };
}

// ============================================
// CATEGORY HELPERS
// ============================================

export const CATEGORY_CONFIG: Record<MarketCategory, { icon: string; label: string; color: string }> = {
    politics: { icon: '🗳️', label: 'Politics', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    economics: { icon: '📈', label: 'Economics', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    climate: { icon: '🌡️', label: 'Climate', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
    sports: { icon: '⚽', label: 'Sports', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    entertainment: { icon: '🎬', label: 'Entertainment', color: 'bg-pink-100 text-pink-700 border-pink-200' },
    financials: { icon: '💰', label: 'Financials', color: 'bg-green-100 text-green-700 border-green-200' },
    health: { icon: '🏥', label: 'Health', color: 'bg-red-100 text-red-700 border-red-200' },
    science: { icon: '🔬', label: 'Science', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    world: { icon: '🌍', label: 'World', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    social: { icon: '👥', label: 'Social', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    crypto: { icon: '₿', label: 'Crypto', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    elections: { icon: '🗳️', label: 'Elections', color: 'bg-violet-100 text-violet-700 border-violet-200' },
    companies: { icon: '🏢', label: 'Companies', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    transportation: { icon: '✈️', label: 'Transport', color: 'bg-sky-100 text-sky-700 border-sky-200' },
    weather: { icon: '🌤️', label: 'Weather', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    other: { icon: '📊', label: 'Other', color: 'bg-gray-100 text-gray-700 border-gray-200' },
};

export const ALL_CATEGORIES: MarketCategory[] = [
    'politics', 'economics', 'climate', 'sports', 'entertainment',
    'financials', 'health', 'science', 'world', 'social',
    'crypto', 'elections', 'companies', 'transportation', 'weather', 'other'
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

    if (days > 365) {
        const years = Math.floor(days / 365);
        return `${years}y+`;
    }
    if (days > 30) {
        const months = Math.floor(days / 30);
        return `${months}mo`;
    }
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
// PRICE SIMULATION (for real-time updates)
// ============================================

export function simulatePriceUpdate(market: KalshiMarket): KalshiMarket {
    const change = (Math.random() - 0.5) * 2;
    const newYesPrice = Math.max(1, Math.min(99, Math.round(market.yes_price + change)));

    return {
        ...market,
        yes_price: newYesPrice,
        no_price: 100 - newYesPrice,
        yes_bid: newYesPrice,
        no_bid: 100 - newYesPrice,
    };
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

    if (market.status === 'settled' && market.result) {
        const won = market.result.toUpperCase() === position.prediction_direction;
        return {
            shouldSettle: true,
            reason: 'market_resolved',
            outcome: won ? 'win' : 'loss',
        };
    }

    if (pnlPercent >= (position.max_reward_percent || 20)) {
        return {
            shouldSettle: true,
            reason: 'threshold_reward',
            outcome: 'win',
        };
    }

    if (pnlPercent <= -(position.max_loss_percent || 5)) {
        return {
            shouldSettle: true,
            reason: 'threshold_loss',
            outcome: 'loss',
        };
    }

    if (position.expires_at && new Date() >= new Date(position.expires_at)) {
        return {
            shouldSettle: true,
            reason: 'time_expired',
            outcome: pnlPercent >= 0 ? 'win' : 'loss',
        };
    }

    return { shouldSettle: false, reason: null, outcome: null };
}
