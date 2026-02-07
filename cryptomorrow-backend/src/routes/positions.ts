
import { Hono } from 'hono';
import { supabase } from '../db/client';
import { authMiddleware } from '../middleware/auth';
import type { Variables } from '../types';

const positions = new Hono<{ Variables: Variables }>();

// Protect all position routes
positions.use('*', authMiddleware);

positions.get('/', async (c) => {
    const user = c.get('user');
    const { data, error } = await supabase
        .from('positions')
        .select('*')
        .eq('user_id', user.sub)
        .order('created_at', { ascending: false });

    if (error) return c.json({ error: error.message }, 400);
    return c.json(data);
});

positions.post('/', async (c) => {
    const user = c.get('user');
    const body = await c.req.json();

    const { data, error } = await supabase
        .from('positions')
        .insert({ ...body, user_id: user.sub })
        .select()
        .single();

    if (error) return c.json({ error: error.message }, 400);
    return c.json(data);
});

positions.patch('/:id/close', async (c) => {
    const id = c.req.param('id');
    const user = c.get('user');

    const { data, error } = await supabase
        .from('positions')
        .update({
            status: 'closed_manual',
            closed_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.sub)
        .select()
        .single();

    if (error) return c.json({ error: error.message }, 400);
    return c.json(data);
});

export default positions;
