-- ════════════════════════════════════════════════════════════════════════════
-- Liass'Pilot — Plan gating server-side : enforce quota dossiers
-- ════════════════════════════════════════════════════════════════════════════
-- DÉPLOYÉ sur Atlas Studio (project vgtmljfayiysuvrcmunt) le 2026-05-16
-- via MCP `apply_migration` (cf migration history Supabase).
--
-- Schéma cible :
--   subscriptions(organization_id, user_id, app_id, plan, status, …)  ─ multi-tenant Atlas
--   organization_members(organization_id, user_id, role)              ─ membership
--   dossiers(user_id, …)                                              ─ user-scoped
--
-- Avant cette migration : `max_companies` enforced uniquement côté React via
-- `useTenantPlan().dossierLimitReached` + `<Button disabled>`. Bypass DevTools
-- trivial : appel direct `supabase.from('dossiers').insert(...)` non bloqué.
--
-- Ajoute :
--   1. Colonne subscriptions.dossiers_limit (nullable = pas d'enforcement)
--   2. Helper `liasspilot_dossiers_quota_for(uuid)` — résout le quota
--      effectif via lookup (subscription.user_id OR org_membership)
--   3. RPC `can_create_dossier(uuid)` — exposable au front pour disabled
--      UI cohérent avec la DB
--   4. Trigger BEFORE INSERT sur dossiers — bloque dépassement avec hint
--      utilisateur clair
--   5. Trigger BEFORE UPDATE — empêche transfert de user_id
--   6. ACL durci : trigger functions non callable via /rest/v1/rpc,
--      can_create_dossier réservée à `authenticated`
--
-- Plans free-text observés sur le projet (Solo, Group, Business, Enterprise,
-- Premium, Entreprise, Entreprise 1 societe…) : pas de check enum, le quota
-- est positionné manuellement par les admins via subscriptions.dossiers_limit.
-- NULL = rétrocompat (pas d'enforcement). -1 = illimité. >=0 = plafond.
-- ════════════════════════════════════════════════════════════════════════════

-- 1. Colonne dossiers_limit
alter table public.subscriptions
  add column if not exists dossiers_limit int;

comment on column public.subscriptions.dossiers_limit is
  'Quota dossiers Liass''Pilot. NULL = pas d''enforcement (defaut, retrocompat). -1 = illimite. >=0 = plafond strict.';

-- 2. Helper : résolution du quota effectif pour un user
create or replace function public.liasspilot_dossiers_quota_for(p_user_id uuid)
returns int
language sql
stable
security definer
set search_path = public
as $$
  with subs as (
    select s.dossiers_limit
      from public.subscriptions s
     where s.app_id in ('taxpilot', 'liasspilot')
       and coalesce(s.status, 'trialing') not in ('canceled', 'expired')
       and (
         s.user_id = p_user_id
         or s.organization_id in (
           select om.organization_id
             from public.organization_members om
            where om.user_id = p_user_id
         )
       )
  )
  select case
    when count(*) = 0 then null
    when bool_or(dossiers_limit = -1) then -1
    else max(dossiers_limit)
  end
  from subs;
$$;

revoke execute on function public.liasspilot_dossiers_quota_for(uuid) from public, anon;
grant execute on function public.liasspilot_dossiers_quota_for(uuid) to authenticated;

-- 3. RPC publique : peut-on créer un dossier supplémentaire ?
create or replace function public.can_create_dossier(p_user_id uuid default auth.uid())
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_limit int;
  v_count int;
begin
  if p_user_id is null then
    return false;
  end if;

  v_limit := public.liasspilot_dossiers_quota_for(p_user_id);

  -- NULL = pas d'enforcement (rétrocompat avant que les admins set un quota)
  if v_limit is null then return true; end if;
  -- -1 = illimité (Enterprise)
  if v_limit < 0 then return true; end if;

  select count(*) into v_count
    from public.dossiers d
   where d.user_id = p_user_id;

  return v_count < v_limit;
end$$;

revoke execute on function public.can_create_dossier(uuid) from public;
grant execute on function public.can_create_dossier(uuid) to authenticated;

-- 4. Trigger BEFORE INSERT — enforce du quota côté DB
create or replace function public.enforce_dossier_quota()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_limit int;
  v_count int;
  v_caller uuid;
begin
  v_caller := auth.uid();

  -- service_role bypass (migrations, seeds, trusted backend)
  if (select coalesce(auth.role(), '')) = 'service_role' then
    return new;
  end if;

  if new.user_id is null then
    raise exception 'user_id is required on dossiers'
      using errcode = 'check_violation';
  end if;

  -- Un user ne peut créer un dossier que pour lui-même
  if v_caller is not null and new.user_id <> v_caller then
    raise exception 'forbidden: cannot create dossier for another user (caller=%, target=%)', v_caller, new.user_id
      using errcode = 'insufficient_privilege';
  end if;

  v_limit := public.liasspilot_dossiers_quota_for(new.user_id);

  -- NULL ou -1 → pas de blocage
  if v_limit is null then return new; end if;
  if v_limit < 0 then return new; end if;

  select count(*) into v_count
    from public.dossiers d
   where d.user_id = new.user_id;

  if v_count >= v_limit then
    raise exception 'dossiers_quota_exceeded: % / %', v_count, v_limit
      using errcode = 'check_violation',
            hint = format(
              'Votre plan Liass''Pilot autorise %s dossier(s). Passez a un plan superieur pour en creer davantage.',
              v_limit
            );
  end if;

  return new;
end$$;

revoke execute on function public.enforce_dossier_quota() from public, anon, authenticated;

drop trigger if exists trg_enforce_dossier_quota on public.dossiers;
create trigger trg_enforce_dossier_quota
  before insert on public.dossiers
  for each row
  execute function public.enforce_dossier_quota();

-- 5. Trigger BEFORE UPDATE — interdit le transfert de propriété
create or replace function public.prevent_dossier_owner_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.user_id is distinct from new.user_id then
    raise exception 'forbidden: dossier user_id cannot be changed (old=%, new=%)', old.user_id, new.user_id
      using errcode = 'insufficient_privilege';
  end if;
  return new;
end$$;

revoke execute on function public.prevent_dossier_owner_change() from public, anon, authenticated;

drop trigger if exists trg_prevent_dossier_owner_change on public.dossiers;
create trigger trg_prevent_dossier_owner_change
  before update on public.dossiers
  for each row
  execute function public.prevent_dossier_owner_change();

-- 6. Documentation
comment on function public.can_create_dossier(uuid) is
  'Retourne true si l''utilisateur peut creer un dossier supplementaire selon son plan Liass''Pilot.';
comment on function public.enforce_dossier_quota() is
  'Trigger BEFORE INSERT sur dossiers : bloque la creation si le quota du plan Liass''Pilot est atteint. Non exposee via RPC.';
comment on function public.prevent_dossier_owner_change() is
  'Trigger BEFORE UPDATE : empeche le transfert de propriete d''un dossier. Non exposee via RPC.';
comment on function public.liasspilot_dossiers_quota_for(uuid) is
  'Retourne le quota effectif de dossiers Liass''Pilot pour un user (NULL=pas d''enforcement, -1=illimite, N=plafond).';

-- ────────────────────────────────────────────────────────────────────────────
-- SMOKE TEST déroulé en prod (rollback complet) :
--   1. liasspilot_dossiers_quota_for(user) initial = NULL → can_create=true
--   2. UPDATE subscriptions SET dossiers_limit=1 → can_create reste true (0<1)
--   3. INSERT dossier #1 → OK
--   4. INSERT dossier #2 → BLOCKED check_violation
--   5. DELETE dossiers test + reset dossiers_limit=NULL → état initial restauré
--
-- REVERSAL :
--   drop trigger if exists trg_enforce_dossier_quota on public.dossiers;
--   drop trigger if exists trg_prevent_dossier_owner_change on public.dossiers;
--   drop function if exists public.enforce_dossier_quota();
--   drop function if exists public.prevent_dossier_owner_change();
--   drop function if exists public.can_create_dossier(uuid);
--   drop function if exists public.liasspilot_dossiers_quota_for(uuid);
--   alter table public.subscriptions drop column if exists dossiers_limit;
-- ────────────────────────────────────────────────────────────────────────────
