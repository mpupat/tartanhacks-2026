-- 1. DROP FOREIGN KEY CONSTRAINTS
-- This allows us to insert a "Demo User" ID that doesn't strictly exist in Supabase Auth
ALTER TABLE public.positions 
DROP CONSTRAINT IF EXISTS positions_user_id_fkey;

ALTER TABLE public.transactions 
DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;

ALTER TABLE public.statements 
DROP CONSTRAINT IF EXISTS statements_user_id_fkey;

-- 2. DISABLE ROW LEVEL SECURITY (RLS)
-- Since we are managing auth in our backend code now (middleware/auth.ts),
-- we don't need Supabase to enforce RLS on the database level for this demo.
ALTER TABLE public.positions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.statements DISABLE ROW LEVEL SECURITY;

-- 3. GRANT PERMISSIONS
-- Ensure the anon key (used by backend) has full access
GRANT ALL ON public.positions TO anon;
GRANT ALL ON public.transactions TO anon;
GRANT ALL ON public.statements TO anon;
GRANT ALL ON public.positions TO service_role;
GRANT ALL ON public.transactions TO service_role;
GRANT ALL ON public.statements TO service_role;
