-- ============================================================
-- P5: Fiscal Deficits — Loss Carryforward Tracking
-- ============================================================

create table if not exists public.fiscal_deficits (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null, -- references dossier or company
  fiscal_year integer not null,
  deficit_amount numeric(15,2) not null check (deficit_amount > 0),
  remaining_amount numeric(15,2) not null check (remaining_amount >= 0),
  expires_at integer not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_fiscal_deficits_company on public.fiscal_deficits(company_id, fiscal_year);

alter table public.fiscal_deficits enable row level security;

-- Users can manage their own deficits (via dossier ownership)
create policy "Users can manage own deficits" on public.fiscal_deficits
  for all using (
    exists (
      select 1 from public.dossiers where id = company_id and user_id = auth.uid()
    )
  );

create trigger update_fiscal_deficits_updated_at before update on public.fiscal_deficits
  for each row execute procedure public.update_updated_at();
