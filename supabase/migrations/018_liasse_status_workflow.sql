-- ════════════════════════════════════════════════════════════════════
-- 018 — Workflow de statut de la liasse (lp_liasse_status)
--
-- Cycle OHADA : BROUILLON → VALIDEE → VERROUILLEE (immuable) → DECLAREE →
-- ARCHIVEE. Mode-agnostic : dossier_id texte (vide '' en mode Entreprise),
-- pas de FK vers `dossiers`. RLS par user. 1 statut par (user, dossier, exercice).
--
-- Immuabilité : un trigger interdit le dé-verrouillage (is_locked true→false)
-- et la modification du hash une fois verrouillé — la progression de statut
-- (déclarer/archiver) reste permise.
-- ════════════════════════════════════════════════════════════════════

create table if not exists public.lp_liasse_status (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  dossier_id   text not null default '',           -- '' = mode Entreprise
  exercice     text not null,
  type_liasse  text not null default 'SN',
  statut       text not null default 'BROUILLON'
                 check (statut in ('BROUILLON','VALIDEE','VERROUILLEE','DECLAREE','ARCHIVEE')),
  is_locked    boolean not null default false,
  hash_sha256  text,
  validated_at timestamptz,
  locked_at    timestamptz,
  declared_at  timestamptz,
  archived_at  timestamptz,
  updated_at   timestamptz default now(),
  unique (user_id, dossier_id, exercice)
);

create index if not exists idx_lp_liasse_status_user on public.lp_liasse_status(user_id);

alter table public.lp_liasse_status enable row level security;

drop policy if exists lp_liasse_status_own on public.lp_liasse_status;
create policy lp_liasse_status_own on public.lp_liasse_status for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, insert, update on public.lp_liasse_status to authenticated;

-- ── Immuabilité : pas de dé-verrouillage ni de réécriture du hash une fois verrouillé ──
create or replace function public.lp_liasse_status_immutability()
returns trigger language plpgsql as $$
begin
  if old.is_locked = true then
    if new.is_locked = false then
      raise exception 'Liasse verrouillée : dé-verrouillage interdit (immuable).';
    end if;
    if new.hash_sha256 is distinct from old.hash_sha256 then
      raise exception 'Liasse verrouillée : empreinte immuable.';
    end if;
  end if;
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_lp_liasse_status_immutability on public.lp_liasse_status;
create trigger trg_lp_liasse_status_immutability
  before update on public.lp_liasse_status
  for each row execute procedure public.lp_liasse_status_immutability();
