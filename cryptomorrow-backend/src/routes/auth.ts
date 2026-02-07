
import { Hono } from 'hono';
import { supabase } from '../db/client';
import { sign } from 'hono/jwt';

const auth = new Hono();

auth.post('/register', async (c) => {
    const { email, password } = await c.req.json();

    if (!email || !password) {
        return c.json({ error: 'Email and password are required' }, 400);
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        console.error('Registration error:', error);
        return c.json({ error: error.message }, 400);
    }

    return c.json({ message: 'User registered successfully', user: data.user });
});

auth.post('/login', async (c) => {
    const { email, password } = await c.req.json();

    if (!email || !password) {
        return c.json({ error: 'Email and password are required' }, 400);
    }

    // BACKDOOR FOR DEMO/HACKATHON
    if (email === 'demo@cryp.to' && password === 'demo123') {
        const jwtSecret = process.env.JWT_SECRET || 'secret';
        const token = await sign({
            sub: '00000000-0000-0000-0000-000000000000',
            email: 'demo@cryp.to'
        }, jwtSecret);
        return c.json({
            token,
            user: {
                id: '00000000-0000-0000-0000-000000000000',
                email: 'demo@cryp.to'
            }
        });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.error('Login error:', error);
        return c.json({ error: error.message }, 401);
    }

    const jwtSecret = process.env.JWT_SECRET || 'secret';
    const token = await sign({ sub: data.user.id, email: data.user.email }, jwtSecret);

    return c.json({ token, user: data.user });
});

export default auth;
