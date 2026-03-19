-- ============================================================
-- P2-2: Schéma initial Supabase — Liass'Pilot (TaxPilot)
-- Architecture frontend-only avec RLS (Row Level Security)
-- ============================================================

-- ── Profils utilisateurs ──
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  user_type text not null default 'entreprise' check (user_type in ('entreprise', 'cabinet')),
  nom_cabinet text,
  nom_entreprise text,
  numero_oec text,
  responsable text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Trigger: créer un profil automatiquement à l'inscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Dossiers (un dossier = un client/entreprise pour un exercice) ──
create table if not exists public.dossiers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  nom_client text not null,
  rccm text,
  ncc text,
  adresse text,
  exercice_n int not null,
  exercice_n1 int,
  regime text not null default 'normal' check (regime in ('normal', 'simplifie', 'forfaitaire')),
  statut text not null default 'en_cours' check (statut in ('en_cours', 'validee', 'exportee')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Balances (données de balance par dossier) ──
create table if not exists public.balances (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid references public.dossiers(id) on delete cascade not null,
  annee text not null check (annee in ('N', 'N-1')),
  data jsonb not null default '[]'::jsonb,
  nombre_comptes int default 0,
  total_debit numeric default 0,
  total_credit numeric default 0,
  uploaded_at timestamptz default now()
);

-- Index pour recherche rapide par dossier
create index if not exists idx_balances_dossier on public.balances(dossier_id);

-- ── Saisies manuelles (TFT, notes avec champs libres) ──
create table if not exists public.saisies_manuelles (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid references public.dossiers(id) on delete cascade not null,
  page_ref text not null,
  champ text not null,
  valeur numeric,
  modifie_par uuid references public.profiles(id),
  modifie_le timestamptz default now(),
  unique(dossier_id, page_ref, champ)
);

-- ── Piste d'audit ──
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid references public.dossiers(id) on delete set null,
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  details jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_audit_log_dossier on public.audit_log(dossier_id);
create index if not exists idx_audit_log_user on public.audit_log(user_id);

-- ── Paramètres entreprise (pour le mode Entreprise, 1 seul enregistrement) ──
create table if not exists public.entreprise_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  denomination text,
  rccm text,
  ncc text,
  adresse text,
  sigle text,
  ntd text,
  exercice_clos text,
  duree_mois int default 12,
  regime text default 'normal',
  data jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- ══════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- Chaque utilisateur ne voit que ses propres données
-- ══════════════════════════════════════════

alter table public.profiles enable row level security;
alter table public.dossiers enable row level security;
alter table public.balances enable row level security;
alter table public.saisies_manuelles enable row level security;
alter table public.audit_log enable row level security;
alter table public.entreprise_settings enable row level security;

-- Profiles: l'utilisateur ne voit que son profil
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Dossiers: l'utilisateur ne voit que ses dossiers
create policy "Users can view own dossiers" on public.dossiers
  for select using (auth.uid() = user_id);
create policy "Users can insert own dossiers" on public.dossiers
  for insert with check (auth.uid() = user_id);
create policy "Users can update own dossiers" on public.dossiers
  for update using (auth.uid() = user_id);
create policy "Users can delete own dossiers" on public.dossiers
  for delete using (auth.uid() = user_id);

-- Balances: via dossier ownership
create policy "Users can manage balances" on public.balances
  for all using (
    exists (select 1 from public.dossiers where id = dossier_id and user_id = auth.uid())
  );

-- Saisies manuelles: via dossier ownership
create policy "Users can manage saisies" on public.saisies_manuelles
  for all using (
    exists (select 1 from public.dossiers where id = dossier_id and user_id = auth.uid())
  );

-- Audit log: via dossier ownership ou propre user
create policy "Users can view own audit log" on public.audit_log
  for select using (
    user_id = auth.uid() or
    exists (select 1 from public.dossiers where id = dossier_id and user_id = auth.uid())
  );
create policy "Users can insert audit log" on public.audit_log
  for insert with check (user_id = auth.uid());

-- Entreprise settings: l'utilisateur ne voit que ses paramètres
create policy "Users can manage own settings" on public.entreprise_settings
  for all using (auth.uid() = user_id);

-- ── Updated_at trigger ──
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at before update on public.profiles
  for each row execute procedure public.update_updated_at();
create trigger update_dossiers_updated_at before update on public.dossiers
  for each row execute procedure public.update_updated_at();
create trigger update_entreprise_settings_updated_at before update on public.entreprise_settings
  for each row execute procedure public.update_updated_at();
