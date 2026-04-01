-- ============================================================
-- P11: CinetPay Integration — Mobile Money for OHADA zone
-- ============================================================

-- Add CinetPay fields to subscriptions
alter table public.subscriptions add column if not exists cinetpay_customer_id text;
alter table public.subscriptions add column if not exists payment_method text default 'none' check (payment_method in ('none', 'stripe', 'cinetpay'));
alter table public.subscriptions add column if not exists last_payment_date timestamptz;
alter table public.subscriptions add column if not exists next_payment_date timestamptz;

-- Payment history table for tracking all transactions
create table if not exists public.payment_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  provider text not null check (provider in ('stripe', 'cinetpay')),
  transaction_id text not null,
  amount numeric(15,2) not null,
  currency text not null default 'XOF',
  status text not null check (status in ('pending', 'completed', 'failed', 'refunded')),
  plan text not null,
  billing_interval text not null check (billing_interval in ('monthly', 'yearly')),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_payment_history_user on public.payment_history(user_id, created_at desc);

alter table public.payment_history enable row level security;

create policy "Users can view own payments" on public.payment_history
  for select using (auth.uid() = user_id);

-- Service role can insert payment records
create policy "Service can insert payments" on public.payment_history
  for insert with check (true);
