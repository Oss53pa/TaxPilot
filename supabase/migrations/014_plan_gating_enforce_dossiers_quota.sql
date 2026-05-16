-- ════════════════════════════════════════════════════════════════════════════
-- Migration 014 — Plan gating server-side : enforce quota dossiers
-- ════════════════════════════════════════════════════════════════════════════
--
-- Avant cette migration : le quota `max_companies` (1 pour Starter, 10 pour
-- Business, illimité pour Enterprise) était enforced UNIQUEMENT côté React
-- via `useTenantPlan().dossierLimitReached` + un `<Button disabled>`. Bypass
-- trivial : un utilisateur ouvre DevTools, appelle directement
-- `supabase.from('dossiers').insert({...})` et crée N dossiers gratis.
--
-- Cette migration ajoute :
--   1. Une colonne `dossiers_limit` sur public.subscriptions (1 / 10 / -1)
--   2. Un trigger BEFORE INSERT sur public.dossiers qui vérifie le compteur
--      contre la limite du plan. Lève une exception en cas de dépassement.
--   3. Un trigger BEFORE UPDATE pour empêcher les changements de user_id
--      qui transféreraient un dossier vers un autre compte (defense in depth).
--   4. Une fonction RPC `can_create_dossier(p_user_id)` réutilisable côté UI.
--
-- Plan codes : 'starter' → 1, 'business' → 10, 'enterprise' → -1 (= ∞)
--
-- Reversal : voir bloc COMMENT en fin de fichier.
-- ════════════════════════════════════════════════════════════════════════════

-- ── 1. Ajout colonne dossiers_limit (rétrocompat : populate selon plan) ──
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'subscriptions'
      and column_name = 'dossiers_limit'
  ) then
    alter table public.subscriptions
      add column dossiers_limit int not null default 1;

    -- Backfill selon le plan existant
    update public.subscriptions
       set dossiers_limit = case
         when plan = 'starter'    then 1
         when plan = 'business'   then 10
         when plan = 'enterprise' then -1   -- -1 = illimité
         else 1
       end;
  end if;
end$$;

-- ── 2. Mise à jour du trigger handle_new_subscription pour initialiser
--      dossiers_limit selon le plan du nouvel abonnement ──
create or replace function public.handle_new_subscription()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.subscriptions (user_id, plan, liasses_limit, users_limit, dossiers_limit, trial_ends_at)
  values (
    new.id,
    'starter',
    5,    -- liasses_limit Starter
    1,    -- users_limit Starter
    1,    -- dossiers_limit Starter
    now() + interval '14 days'
  );
  return new;
end$$;

-- ── 3. Fonction RPC : peut-on créer un dossier supplémentaire ? ──
create or replace function public.can_create_dossier(p_user_id uuid)
returns boolean
language plpgsql
stable
security definer
as $$
declare
  v_limit int;
  v_count int;
begin
  select dossiers_limit into v_limit
    from public.subscriptions
   where user_id = p_user_id;

  -- Pas d'abonnement = pas le droit (défense en profondeur)
  if v_limit is null then
    return false;
  end if;

  -- -1 = illimité (plan Enterprise)
  if v_limit < 0 then
    return true;
  end if;

  select count(*) into v_count
    from public.dossiers
   where user_id = p_user_id;

  return v_count < v_limit;
end$$;

grant execute on function public.can_create_dossier(uuid) to authenticated;

-- ── 4. Trigger BEFORE INSERT — enforce quota côté DB ──
create or replace function public.enforce_dossier_quota()
returns trigger
language plpgsql
security definer
as $$
declare
  v_limit int;
  v_count int;
begin
  -- L'utilisateur doit poser son propre user_id (pas un autre)
  if new.user_id is null then
    raise exception 'user_id is required'
      using errcode = 'check_violation';
  end if;

  if new.user_id <> auth.uid() and auth.role() <> 'service_role' then
    raise exception 'forbidden: cannot create dossier for another user'
      using errcode = 'insufficient_privilege';
  end if;

  select dossiers_limit into v_limit
    from public.subscriptions
   where user_id = new.user_id;

  if v_limit is null then
    raise exception 'no_active_subscription'
      using errcode = 'check_violation',
            hint = 'Souscrivez un plan pour créer des dossiers.';
  end if;

  -- -1 = illimité (Enterprise) → skip check
  if v_limit < 0 then
    return new;
  end if;

  select count(*) into v_count
    from public.dossiers
   where user_id = new.user_id;

  if v_count >= v_limit then
    raise exception 'dossiers_quota_exceeded: % / %', v_count, v_limit
      using errcode = 'check_violation',
            hint = format(
              'Votre plan autorise %s dossier(s). Passez à un plan supérieur pour en créer davantage.',
              v_limit
            );
  end if;

  return new;
end$$;

drop trigger if exists trg_enforce_dossier_quota on public.dossiers;
create trigger trg_enforce_dossier_quota
  before insert on public.dossiers
  for each row
  execute function public.enforce_dossier_quota();

-- ── 5. Trigger BEFORE UPDATE — empêche le changement de user_id ──
create or replace function public.prevent_dossier_owner_change()
returns trigger
language plpgsql
as $$
begin
  if old.user_id is distinct from new.user_id then
    raise exception 'forbidden: dossier user_id cannot be changed'
      using errcode = 'insufficient_privilege';
  end if;
  return new;
end$$;

drop trigger if exists trg_prevent_dossier_owner_change on public.dossiers;
create trigger trg_prevent_dossier_owner_change
  before update on public.dossiers
  for each row
  execute function public.prevent_dossier_owner_change();

-- ── 6. Documentation ──
comment on column public.subscriptions.dossiers_limit is
  'Quota de dossiers actifs. -1 = illimité (Enterprise). Default Starter = 1, Business = 10.';
comment on function public.can_create_dossier(uuid) is
  'Retourne true si le user peut créer un dossier supplémentaire selon son plan.';
comment on function public.enforce_dossier_quota() is
  'Trigger BEFORE INSERT sur dossiers : bloque la création si le quota du plan est atteint.';
comment on function public.prevent_dossier_owner_change() is
  'Trigger BEFORE UPDATE : empêche le transfert de propriété d''un dossier.';

-- ────────────────────────────────────────────────────────────────────────────
-- REVERSAL (à exécuter manuellement si rollback nécessaire) :
--
--   drop trigger if exists trg_enforce_dossier_quota on public.dossiers;
--   drop trigger if exists trg_prevent_dossier_owner_change on public.dossiers;
--   drop function if exists public.enforce_dossier_quota();
--   drop function if exists public.prevent_dossier_owner_change();
--   drop function if exists public.can_create_dossier(uuid);
--   alter table public.subscriptions drop column if exists dossiers_limit;
--   -- restore handle_new_subscription from migration 005
-- ────────────────────────────────────────────────────────────────────────────
