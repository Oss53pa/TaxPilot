-- ============================================================
-- 013: Public API keys for external ERP integrations
-- Allows SAGE, CEGID, Odoo, etc. to push trial balances via REST
-- ============================================================

-- API Keys for external ERP integrations
create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  dossier_id uuid references public.dossiers(id) on delete cascade,
  name text not null,
  key_hash text not null unique,
  key_prefix text not null,
  scopes text[] not null default array['balance:write']::text[],
  last_used_at timestamptz,
  expires_at timestamptz,
  is_active boolean default true,
  created_at timestamptz default now()
);

create index if not exists idx_api_keys_hash on public.api_keys(key_hash) where is_active = true;
create index if not exists idx_api_keys_user on public.api_keys(user_id);

alter table public.api_keys enable row level security;

create policy "Users can view own API keys" on public.api_keys
  for select using (auth.uid() = user_id);

create policy "Users can create API keys" on public.api_keys
  for insert with check (auth.uid() = user_id);

create policy "Users can revoke own API keys" on public.api_keys
  for update using (auth.uid() = user_id);

create policy "Users can delete own API keys" on public.api_keys
  for delete using (auth.uid() = user_id);

-- API request log for monitoring/debugging
create table if not exists public.api_logs (
  id uuid primary key default gen_random_uuid(),
  api_key_id uuid references public.api_keys(id) on delete cascade,
  endpoint text not null,
  method text not null,
  status_code integer not null,
  ip_address text,
  user_agent text,
  request_size_bytes integer,
  response_time_ms integer,
  error_message text,
  created_at timestamptz default now()
);

create index if not exists idx_api_logs_key_date on public.api_logs(api_key_id, created_at desc);

alter table public.api_logs enable row level security;

create policy "Users can view logs of own keys" on public.api_logs
  for select using (
    exists (select 1 from public.api_keys where id = api_key_id and user_id = auth.uid())
  );
