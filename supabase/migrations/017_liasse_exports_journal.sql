-- ════════════════════════════════════════════════════════════════════
-- 017 — Journal immuable des liasses générées (lp_liasse_exports)
--
-- Trace chaque export de liasse (XLSX/PDF) côté Supabase : exercice, type,
-- empreinte SHA-256 du contenu (intégrité / traçabilité OHADA). Indépendant
-- du mode (Entreprise sans dossier OU Cabinet avec dossier) → pas de FK vers
-- `dossiers` (dossier_id optionnel, texte). Append-only (audit) : insert +
-- select uniquement, aucune modification/suppression.
-- ════════════════════════════════════════════════════════════════════

create table if not exists public.lp_liasse_exports (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  dossier_id   text,                       -- optionnel (mode Cabinet)
  exercice     text not null,
  type_liasse  text not null default 'SN',
  format       text not null default 'XLSX',
  entreprise   text,
  hash_sha256  text,                        -- empreinte du contenu exporté
  created_at   timestamptz default now()
);

create index if not exists idx_lp_liasse_exports_user
  on public.lp_liasse_exports(user_id, created_at desc);

alter table public.lp_liasse_exports enable row level security;

drop policy if exists lp_liasse_exports_select_own on public.lp_liasse_exports;
create policy lp_liasse_exports_select_own on public.lp_liasse_exports
  for select using (user_id = auth.uid());

drop policy if exists lp_liasse_exports_insert_own on public.lp_liasse_exports;
create policy lp_liasse_exports_insert_own on public.lp_liasse_exports
  for insert with check (user_id = auth.uid());

-- Pas de policy UPDATE/DELETE → journal append-only (immuable).

grant select, insert on public.lp_liasse_exports to authenticated;
