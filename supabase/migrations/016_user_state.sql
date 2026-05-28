-- ════════════════════════════════════════════════════════════════════
-- 016 — Miroir cloud du localStorage métier (lp_user_state)
--
-- Objectif : aucune donnée métier ne doit vivre uniquement dans le
-- localStorage du navigateur (volatile : effacé par vidage de cache,
-- changement d'appareil, "Clear site data"). On réplique chaque clé
-- localStorage métier (préfixes fiscasync- / fiscasync_ / dossier_) dans
-- cette table KV par utilisateur, et on réhydrate au démarrage.
--
-- `value` est le STRING brut du localStorage (pas jsonb : certaines valeurs
-- ne sont pas du JSON valide, ex: 'fr'). Stockage lossless.
-- ════════════════════════════════════════════════════════════════════

create table if not exists public.lp_user_state (
  user_id    uuid not null references auth.users(id) on delete cascade,
  key        text not null,
  value      text not null,
  updated_at timestamptz default now(),
  primary key (user_id, key)
);

create index if not exists idx_lp_user_state_user on public.lp_user_state(user_id);

alter table public.lp_user_state enable row level security;

drop policy if exists lp_user_state_own on public.lp_user_state;
create policy lp_user_state_own on public.lp_user_state for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, insert, update, delete on public.lp_user_state to authenticated;
