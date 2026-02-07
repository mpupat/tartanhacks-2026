// Real-time XRP Price Service - Fetches live price from CoinGecko API

const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const PRICE_CACHE_MS = 10000; // Cache price for 10 seconds

interface PriceCache {
    price: number;
    change24h: number;
    changePercent24h: number;
    high24h: number;
    low24h: number;
    volume24h: number;
    timestamp: number;
}

let priceCache: PriceCache | null = null;

export interface RealPriceData {
    price: number;
    change24h: number;
    changePercent24h: number;
    high24h: number;
    low24h: number;
    volume24h: number;
}

export async function fetchXRPPrice(): Promise<RealPriceData> {
    // Return cached price if still valid
    if (priceCache && Date.now() - priceCache.timestamp < PRICE_CACHE_MS) {
        const { timestamp, ...data } = priceCache;
        return data;
    }

    try {
        const response = await fetch(
            `${COINGECKO_API}/coins/ripple?localization=false&tickers=false&community_data=false&developer_data=false`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch price');
        }

        const data = await response.json();
        const marketData = data.market_data;

        const priceData: RealPriceData = {
            price: marketData.current_price.usd,
            change24h: marketData.price_change_24h,
            changePercent24h: marketData.price_change_percentage_24h,
            high24h: marketData.high_24h.usd,
            low24h: marketData.low_24h.usd,
            volume24h: marketData.total_volume.usd,
        };

        // Cache the result
        priceCache = {
            ...priceData,
            timestamp: Date.now(),
        };

        return priceData;
    } catch (error) {
        console.error('Error fetching XRP price:', error);

        // Return cached data if available, otherwise return defaults
        if (priceCache) {
            const { timestamp, ...data } = priceCache;
            return data;
        }

        // Fallback to approximate current price
        return {
            price: 2.45, // Approximate current XRP price
            change24h: 0,
            changePercent24h: 0,
            high24h: 2.50,
            low24h: 2.40,
            volume24h: 0,
        };
    }
}

// Simplified price-only fetch (for frequent updates)
export const fetchXRPPriceSimple = async (): Promise<number> => {
    try {
        // Use our own backend proxy to avoid CORS
        const response = await fetch('/api/prices/current');
        if (!response.ok) throw new Error('Backend price fetch failed');
        const data = await response.json();
        return data.price;
    } catch (error) {
        console.error("Error fetching simple XRP price:", error);
        // Fallback to CoinGecko if backend fails (might still fail CORS)
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=usd');
            const data = await response.json();
            return data.ripple.usd;
        } catch (e) {
            console.error("Fallback failed", e);
            throw error;
        }
    }
};
