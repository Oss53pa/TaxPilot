-- ============================================================
-- P7: Transactional Integrity — Atomic operations & optimistic locking
-- ============================================================

-- Add version column for optimistic locking on critical tables
alter table public.dossiers add column if not exists version integer default 1;
alter table public.balances add column if not exists version integer default 1;

-- RPC: Atomic balance import (delete old + insert new in single transaction)
create or replace function public.import_balance_atomic(
  p_dossier_id uuid,
  p_annee text,
  p_entries jsonb,
  p_nombre_comptes integer,
  p_total_debit numeric,
  p_total_credit numeric
) returns jsonb language plpgsql security definer as $$
declare
  v_balance_id uuid;
begin
  -- Verify dossier ownership
  if not exists (
    select 1 from public.dossiers
    where id = p_dossier_id and user_id = auth.uid()
  ) then
    return jsonb_build_object('success', false, 'error', 'UNAUTHORIZED');
  end if;

  -- Delete existing balance for this dossier+year
  delete from public.balances
    where dossier_id = p_dossier_id and annee = p_annee;

  -- Insert new balance
  insert into public.balances (dossier_id, annee, data, nombre_comptes, total_debit, total_credit)
  values (p_dossier_id, p_annee, p_entries, p_nombre_comptes, p_total_debit, p_total_credit)
  returning id into v_balance_id;

  -- Log the import
  insert into public.audit_log (dossier_id, user_id, action, details)
  values (p_dossier_id, auth.uid(), 'import_balance', jsonb_build_object(
    'annee', p_annee,
    'nombre_comptes', p_nombre_comptes,
    'total_debit', p_total_debit,
    'total_credit', p_total_credit
  ));

  -- Increment dossier version
  update public.dossiers set version = version + 1 where id = p_dossier_id;

  return jsonb_build_object('success', true, 'balance_id', v_balance_id);
exception when others then
  raise;
end;
$$;

-- RPC: Optimistic lock check before update
create or replace function public.update_dossier_with_lock(
  p_dossier_id uuid,
  p_expected_version integer,
  p_updates jsonb
) returns jsonb language plpgsql security definer as $$
declare
  v_current_version integer;
begin
  select version into v_current_version
    from public.dossiers where id = p_dossier_id and user_id = auth.uid();

  if not found then
    return jsonb_build_object('success', false, 'error', 'NOT_FOUND');
  end if;

  if v_current_version != p_expected_version then
    return jsonb_build_object('success', false, 'error', 'VERSION_CONFLICT',
      'expected', p_expected_version, 'current', v_current_version);
  end if;

  -- Apply updates dynamically
  update public.dossiers set
    nom_client = coalesce((p_updates->>'nom_client'), nom_client),
    rccm = coalesce((p_updates->>'rccm'), rccm),
    ncc = coalesce((p_updates->>'ncc'), ncc),
    statut = coalesce((p_updates->>'statut'), statut),
    regime = coalesce((p_updates->>'regime'), regime),
    version = version + 1
  where id = p_dossier_id;

  return jsonb_build_object('success', true, 'version', v_current_version + 1);
end;
$$;
