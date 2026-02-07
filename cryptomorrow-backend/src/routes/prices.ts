
import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';

const prices = new Hono();

// Real price state
let currentPrice = 1.47; // Fallback default
let lastUpdated = 0;

async function updatePrice() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=usd');
        if (response.ok) {
            const data = await response.json() as any;
            // Add some jitter to make it look alive between polls
            const realPrice = data.ripple.usd;
            // Smooth transition or just set it? Let's mostly set it but keep small jitter
            currentPrice = realPrice;
            lastUpdated = Date.now();
        }
    } catch (e) {
        console.error('Failed to fetch price:', e);
    }
}

// Update real price every 30 seconds
setInterval(updatePrice, 30000);
// Initial fetch
updatePrice();

// Simulate ticks between real updates for "liveness"
setInterval(() => {
    // Tiny random walk 0.01%
    const change = currentPrice * (Math.random() - 0.5) * 0.001;
    currentPrice += change;
}, 1000);

prices.get('/stream', (c) => {
    return streamSSE(c, async (stream) => {
        while (true) {
            await stream.writeSSE({
                data: JSON.stringify({
                    price: currentPrice,
                    timestamp: Date.now(),
                }),
                event: 'price_update',
            });
            await stream.sleep(1000);
        }
    });
});

prices.get('/current', (c) => {
    return c.json({
        price: currentPrice,
        timestamp: Date.now(),
    });
});

export default prices;
