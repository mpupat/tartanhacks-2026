
import { Hono } from 'hono';
import { supabase } from '../db/client';
import { authMiddleware } from '../middleware/auth';
import type { Variables } from '../types';

const transactions = new Hono<{ Variables: Variables }>();

transactions.use('*', authMiddleware);

transactions.get('/', async (c) => {
    const user = c.get('user');
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.sub)
        .order('date', { ascending: false });

    if (error) return c.json({ error: error.message }, 400);
    return c.json(data);
});

transactions.post('/', async (c) => {
    const user = c.get('user');
    const body = await c.req.json();

    const { data, error } = await supabase
        .from('transactions')
        .insert({ ...body, user_id: user.sub })
        .select()
        .single();

    if (error) return c.json({ error: error.message }, 400);
    return c.json(data);
});

transactions.get('/statements/:month', async (c) => {
    const user = c.get('user');
    const month = c.req.param('month'); // Format: YYYY-MM

    // Calculate statement logic here or fetch from 'statements' table
    // For now, simpler fetch from statements table

    const { data, error } = await supabase
        .from('statements')
        .select('*')
        .eq('user_id', user.sub)
        .eq('month', month)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        return c.json({ error: error.message }, 400);
    }

    // If no statement exists, we might generate on the fly (complex logic omitted for MVP)
    // Returning empty or found data
    return c.json(data || { message: 'No statement found for this month' });
});

export default transactions;
