import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { cors } from 'hono/cors';

import auth from './routes/auth';
import positions from './routes/positions';
import transactions from './routes/transactions';
import prices from './routes/prices';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', cors());

// Routes
app.route('/api/auth', auth);
app.route('/api/positions', positions);
app.route('/api/transactions', transactions);
app.route('/api/prices', prices);

// Health check
app.get('/', (c) => {
    return c.json({
        status: 'ok',
        service: 'CrypTomorrow Backend',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    });
});

export default {
    port: process.env.PORT || 3000,
    fetch: app.fetch,
};
