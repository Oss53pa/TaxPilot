-- ============================================================
-- P10: RGPD & OHADA Data Retention Policy
-- ============================================================

-- ── User data export/deletion requests ──
create table if not exists public.data_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  request_type text not null check (request_type in ('export', 'delete')),
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'rejected')),
  reason text,
  processed_at timestamptz,
  processed_by uuid references auth.users,
  export_url text, -- Signed URL for data export download
  expires_at timestamptz, -- Export link expiry (48h)
  created_at timestamptz default now()
);

alter table public.data_requests enable row level security;

create policy "Users can view own data requests" on public.data_requests
  for select using (auth.uid() = user_id);

create policy "Users can create data requests" on public.data_requests
  for insert with check (auth.uid() = user_id);

-- ── Data retention metadata ──
create table if not exists public.retention_policies (
  id uuid primary key default gen_random_uuid(),
  data_type text not null unique,
  retention_years integer not null,
  legal_basis text not null,
  description text,
  auto_archive boolean default false,
  auto_delete boolean default false
);

-- Seed retention policies
insert into public.retention_policies (data_type, retention_years, legal_basis, description, auto_archive, auto_delete) values
('balance_sheets', 10, 'OHADA Art. 24 — Conservation des documents comptables', 'Balances et pièces comptables', true, false),
('liasses_fiscales', 10, 'OHADA Art. 24 + CGI — Déclarations fiscales', 'Liasses fiscales générées', true, false),
('audit_logs', 10, 'OHADA Art. 24 — Piste d''audit', 'Journal d''audit des opérations', false, false),
('user_profiles', 3, 'RGPD Art. 17 — Droit à l''effacement', 'Données personnelles après fermeture de compte', false, true),
('notifications', 0, 'Aucune obligation', 'Notifications in-app', false, true),
('session_data', 0, 'Aucune obligation', 'Données de session et brouillons', false, true);

alter table public.retention_policies enable row level security;

create policy "Anyone can read retention policies" on public.retention_policies
  for select using (true);

-- ── Soft-delete support for user profiles ──
alter table public.profiles add column if not exists deleted_at timestamptz;
alter table public.profiles add column if not exists deletion_requested_at timestamptz;

-- ── Archive flag for old data ──
alter table public.dossiers add column if not exists archived_at timestamptz;
alter table public.dossiers add column if not exists is_archived boolean default false;
