
import { createMiddleware } from 'hono/factory';
import { jwtVerify } from 'jose';

export const authMiddleware = createMiddleware(async (c, next) => {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: 'Unauthorized', message: 'Missing or invalid token' }, 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return c.json({ error: 'Unauthorized', message: 'Invalid token format' }, 401);
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');

    try {
        const { payload } = await jwtVerify(token, secret);
        c.set('user', payload);
        await next();
    } catch (error) {
        return c.json({ error: 'Unauthorized', message: 'Invalid token' }, 401);
    }
});
