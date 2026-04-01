-- ============================================================
-- P8: Notifications — In-app + Email tracking
-- ============================================================

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  type text not null,
  title text not null,
  message text not null,
  action_url text,
  read boolean default false,
  read_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_notifications_user on public.notifications(user_id, read, created_at desc);

alter table public.notifications enable row level security;

create policy "Users can view own notifications" on public.notifications
  for select using (auth.uid() = user_id);

create policy "Users can update own notifications" on public.notifications
  for update using (auth.uid() = user_id);

-- System can insert notifications (via service role or edge functions)
create policy "Service can insert notifications" on public.notifications
  for insert with check (true);

-- Auto-cleanup: delete notifications older than 90 days
-- (would use pg_cron in production)
