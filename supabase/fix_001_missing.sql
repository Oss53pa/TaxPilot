-- Fix: tables manquantes de migration 001 (profiles existe deja)
create table if not exists public.dossiers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  nom_client text not null,
  rccm text, ncc text, adresse text,
  exercice_n int not null, exercice_n1 int,
  regime text not null default 'normal' check (regime in ('normal', 'simplifie', 'forfaitaire')),
  statut text not null default 'en_cours' check (statut in ('en_cours', 'validee', 'exportee')),
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.balances (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid references public.dossiers(id) on delete cascade not null,
  annee text not null check (annee in ('N', 'N-1')),
  data jsonb not null default '[]'::jsonb,
  nombre_comptes int default 0, total_debit numeric default 0, total_credit numeric default 0,
  uploaded_at timestamptz default now()
);
create index if not exists idx_balances_dossier on public.balances(dossier_id);
create table if not exists public.saisies_manuelles (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid references public.dossiers(id) on delete cascade not null,
  page_ref text not null, champ text not null, valeur numeric,
  modifie_par uuid references public.profiles(id),
  modifie_le timestamptz default now(),
  unique(dossier_id, page_ref, champ)
);
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid references public.dossiers(id) on delete set null,
  user_id uuid references public.profiles(id) on delete set null,
  action text not null, details jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
create index if not exists idx_audit_log_dossier on public.audit_log(dossier_id);
create index if not exists idx_audit_log_user on public.audit_log(user_id);
create table if not exists public.entreprise_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  denomination text, rccm text, ncc text, adresse text, sigle text, ntd text,
  exercice_clos text, duree_mois int default 12, regime text default 'normal',
  data jsonb default '{}'::jsonb, updated_at timestamptz default now()
);
alter table public.dossiers enable row level security;
alter table public.balances enable row level security;
alter table public.saisies_manuelles enable row level security;
alter table public.audit_log enable row level security;
alter table public.entreprise_settings enable row level security;
drop policy if exists "Users can view own dossiers" on public.dossiers;
drop policy if exists "Users can insert own dossiers" on public.dossiers;
drop policy if exists "Users can update own dossiers" on public.dossiers;
drop policy if exists "Users can delete own dossiers" on public.dossiers;
create policy "Users can view own dossiers" on public.dossiers for select using (auth.uid() = user_id);
create policy "Users can insert own dossiers" on public.dossiers for insert with check (auth.uid() = user_id);
create policy "Users can update own dossiers" on public.dossiers for update using (auth.uid() = user_id);
create policy "Users can delete own dossiers" on public.dossiers for delete using (auth.uid() = user_id);
drop policy if exists "Users can manage balances" on public.balances;
create policy "Users can manage balances" on public.balances for all using (exists (select 1 from public.dossiers where id = dossier_id and user_id = auth.uid()));
drop policy if exists "Users can manage saisies" on public.saisies_manuelles;
create policy "Users can manage saisies" on public.saisies_manuelles for all using (exists (select 1 from public.dossiers where id = dossier_id and user_id = auth.uid()));
drop policy if exists "Users can view own audit log" on public.audit_log;
drop policy if exists "Users can insert audit log" on public.audit_log;
create policy "Users can view own audit log" on public.audit_log for select using (user_id = auth.uid() or exists (select 1 from public.dossiers where id = dossier_id and user_id = auth.uid()));
create policy "Users can insert audit log" on public.audit_log for insert with check (user_id = auth.uid());
drop policy if exists "Users can manage own settings" on public.entreprise_settings;
create policy "Users can manage own settings" on public.entreprise_settings for all using (auth.uid() = user_id);
create or replace function public.update_updated_at() returns trigger as $$ begin new.updated_at = now(); return new; end; $$ language plpgsql;
drop trigger if exists update_dossiers_updated_at on public.dossiers;
create trigger update_dossiers_updated_at before update on public.dossiers for each row execute procedure public.update_updated_at();
drop trigger if exists update_entreprise_settings_updated_at on public.entreprise_settings;
create trigger update_entreprise_settings_updated_at before update on public.entreprise_settings for each row execute procedure public.update_updated_at();
