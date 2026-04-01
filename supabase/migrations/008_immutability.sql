-- ============================================================
-- P9: Immutability — Locked liasses and append-only audit log
-- ============================================================

-- ── Liasses table (if not exists, create it; otherwise add lock columns) ──
create table if not exists public.liasses (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid references public.dossiers(id) on delete cascade not null,
  type_liasse text not null default 'SN' check (type_liasse in ('SN', 'SMT', 'SA', 'BANQUE', 'ASSURANCE', 'MICROFINANCE', 'EBNL')),
  exercice integer not null,
  statut text not null default 'BROUILLON' check (statut in ('BROUILLON', 'VALIDEE', 'DECLAREE', 'ARCHIVEE')),
  donnees_json jsonb default '{}'::jsonb,
  is_locked boolean default false,
  locked_at timestamptz,
  locked_by uuid references auth.users,
  hash_sha256 text, -- SHA-256 hash of donnees_json for integrity verification
  date_generation timestamptz,
  date_validation timestamptz,
  date_declaration timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_liasses_dossier on public.liasses(dossier_id, exercice);

alter table public.liasses enable row level security;

-- Users can view their liasses (via dossier ownership)
create policy "Users can view liasses" on public.liasses
  for select using (
    exists (select 1 from public.dossiers where id = dossier_id and user_id = auth.uid())
  );

-- Users can insert new liasses
create policy "Users can create liasses" on public.liasses
  for insert with check (
    exists (select 1 from public.dossiers where id = dossier_id and user_id = auth.uid())
  );

-- Users can only update UNLOCKED liasses
create policy "Users can update unlocked liasses" on public.liasses
  for update using (
    is_locked = false
    and exists (select 1 from public.dossiers where id = dossier_id and user_id = auth.uid())
  );

-- NEVER allow deletion of liasses (fiscal audit trail requirement)
-- No DELETE policy = no deletion possible via RLS

-- ── Trigger: prevent modification of locked liasses ──
create or replace function public.prevent_locked_liasse_update()
returns trigger as $$
begin
  if old.is_locked = true then
    raise exception 'Cannot modify a locked liasse (ID: %). Locked at: %', old.id, old.locked_at;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger prevent_locked_update
  before update on public.liasses
  for each row execute procedure public.prevent_locked_liasse_update();

-- ── RPC: Lock a liasse after generation (irreversible) ──
create or replace function public.lock_liasse(
  p_liasse_id uuid,
  p_hash text
) returns jsonb language plpgsql security definer as $$
begin
  update public.liasses set
    is_locked = true,
    locked_at = now(),
    locked_by = auth.uid(),
    hash_sha256 = p_hash,
    statut = 'VALIDEE',
    date_validation = now()
  where id = p_liasse_id
    and is_locked = false
    and exists (select 1 from public.dossiers where id = liasses.dossier_id and user_id = auth.uid());

  if not found then
    return jsonb_build_object('success', false, 'error', 'LIASSE_NOT_FOUND_OR_ALREADY_LOCKED');
  end if;

  -- Log the lock action
  insert into public.audit_log (user_id, action, details)
  values (auth.uid(), 'lock_liasse', jsonb_build_object(
    'liasse_id', p_liasse_id,
    'hash', p_hash,
    'locked_at', now()
  ));

  return jsonb_build_object('success', true);
end;
$$;

-- ── Make audit_log truly append-only ──
-- Drop any existing UPDATE/DELETE policies
drop policy if exists "prevent_audit_update" on public.audit_log;
drop policy if exists "prevent_audit_delete" on public.audit_log;

-- Trigger: prevent any UPDATE or DELETE on audit_log
create or replace function public.prevent_audit_modification()
returns trigger as $$
begin
  raise exception 'Audit log is append-only. Modification of entries is not allowed.';
end;
$$ language plpgsql;

drop trigger if exists prevent_audit_update on public.audit_log;
create trigger prevent_audit_update
  before update on public.audit_log
  for each row execute procedure public.prevent_audit_modification();

drop trigger if exists prevent_audit_delete on public.audit_log;
create trigger prevent_audit_delete
  before delete on public.audit_log
  for each row execute procedure public.prevent_audit_modification();

-- Updated_at trigger for liasses
create trigger update_liasses_updated_at before update on public.liasses
  for each row execute procedure public.update_updated_at();
