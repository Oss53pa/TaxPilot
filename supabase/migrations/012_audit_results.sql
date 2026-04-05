-- Audit results persistence
create table if not exists public.audit_results (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid references public.dossiers(id) on delete cascade not null,
  exercice integer not null,
  results jsonb not null,
  total_controls integer not null,
  passed integer not null,
  failed integer not null,
  blocking integer not null,
  created_at timestamptz default now()
);

alter table public.audit_results enable row level security;

create policy "Users can manage own audit results" on public.audit_results
  for all using (
    exists (select 1 from public.dossiers where id = dossier_id and user_id = auth.uid())
  );

-- Vehicle amortization cap per country (P1-8)
alter table public.fiscal_config add column if not exists vehicle_amort_cap numeric(15,2) default 14000000;
