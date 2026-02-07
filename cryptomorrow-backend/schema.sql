-- Enable UUID extension
create extension if not exists "pgcrypto"; // turbo

-- Positions Table
create table public.positions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  type text check (type in ('long', 'short')) not null,
  entry_price numeric not null,
  amount numeric not null,
  take_profit_pct numeric not null,
  stop_loss_pct numeric not null,
  status text default 'active' check (status in ('active', 'closed_take_profit', 'closed_stop_loss', 'closed_manual')),
  pnl numeric default 0,
  pnl_percent numeric default 0,x
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  closed_at timestamp with time zone
);

-- Transactions Table
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  merchant text not null,
  amount numeric not null,
  category text not null,
  linked_position_id uuid references public.positions(id),
  date timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Monthly Statements Table
create table public.statements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  month text not null, -- Format: 'YYYY-MM'
  base_spending numeric default 0,
  trading_pnl numeric default 0,
  final_amount numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, month)
);

-- Enable RLS (Row Level Security)
alter table public.positions enable row level security;
alter table public.transactions enable row level security;
alter table public.statements enable row level security;

-- Policies (Allow users to see only their own data)
create policy "Users can view won positions" on public.positions
  for select using (auth.uid() = user_id);

create policy "Users can insert their own positions" on public.positions
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own positions" on public.positions
  for update using (auth.uid() = user_id);

create policy "Users can view own transactions" on public.transactions
  for select using (auth.uid() = user_id);

create policy "Users can insert own transactions" on public.transactions
  for insert with check (auth.uid() = user_id);

create policy "Users can view own statements" on public.statements
  for select using (auth.uid() = user_id);
