-- ════════════════════════════════════════════════════════════════════
-- 019 — Durcissement suite aux advisors Supabase (sécurité + performance)
--
-- 1. SÉCURITÉ : search_path fixe sur la fonction trigger (function_search_path_mutable).
-- 2. PERF (auth_rls_initplan) : on enveloppe auth.uid() dans (select auth.uid())
--    pour qu'il soit évalué UNE fois par requête (et non par ligne) sur les
--    tables lp_* à fort volume potentiel.
-- 3. PERF : index couvrant la FK dossiers.user_id (requête d'hydratation).
-- ════════════════════════════════════════════════════════════════════

-- ── 1. search_path fixe ──
create or replace function public.lp_liasse_status_immutability()
returns trigger language plpgsql set search_path = public as $$
begin
  if old.is_locked = true then
    if new.is_locked = false then
      raise exception 'Liasse verrouillee : de-verrouillage interdit (immuable).';
    end if;
    if new.hash_sha256 is distinct from old.hash_sha256 then
      raise exception 'Liasse verrouillee : empreinte immuable.';
    end if;
  end if;
  new.updated_at = now();
  return new;
end;
$$;

-- ── 2. RLS initplan : (select auth.uid()) ──
drop policy if exists lp_user_state_own on public.lp_user_state;
create policy lp_user_state_own on public.lp_user_state for all
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists lp_user_orgs_select_own on public.lp_user_orgs;
create policy lp_user_orgs_select_own on public.lp_user_orgs for select
  using (user_id = (select auth.uid()));

drop policy if exists lp_liasse_status_own on public.lp_liasse_status;
create policy lp_liasse_status_own on public.lp_liasse_status for all
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists lp_liasse_exports_select_own on public.lp_liasse_exports;
create policy lp_liasse_exports_select_own on public.lp_liasse_exports
  for select using (user_id = (select auth.uid()));

drop policy if exists lp_liasse_exports_insert_own on public.lp_liasse_exports;
create policy lp_liasse_exports_insert_own on public.lp_liasse_exports
  for insert with check (user_id = (select auth.uid()));

-- ── 3. Index FK ──
create index if not exists idx_dossiers_user on public.dossiers(user_id);
