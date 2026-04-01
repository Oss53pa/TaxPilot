-- ============================================================
-- P4: Fiscal Configuration — 17 OHADA Countries
-- ============================================================

create table if not exists public.fiscal_config (
  id uuid primary key default gen_random_uuid(),
  country_code char(2) not null,
  country_name text not null,
  currency text not null,
  -- Corporate tax
  is_rate numeric(6,4) not null,           -- e.g. 0.2750 for 27.5%
  is_reduced_rate numeric(6,4),            -- reduced rate (SMEs, etc.)
  is_reduced_threshold numeric(15,2),       -- CA threshold for reduced rate
  -- Minimum tax (IMF)
  imf_rate numeric(6,4) not null,          -- e.g. 0.0120 for 1.2%
  imf_minimum numeric(15,2) default 0,     -- minimum fixed amount
  imf_maximum numeric(15,2),               -- maximum cap (if any)
  -- Thresholds
  gift_threshold_rate numeric(6,4),        -- gift deduction limit (% of CA)
  donation_threshold_rate numeric(6,4),    -- donation deduction limit (% of CA)
  entertainment_threshold_rate numeric(6,4), -- entertainment deduction limit (% of CA)
  -- Loss carryforward
  loss_carryforward_years integer default 5,
  -- Fiscal year
  fiscal_year_end text default '12-31',
  -- VAT
  vat_standard_rate numeric(6,4),
  vat_reduced_rate numeric(6,4),
  -- Effective dates
  effective_from date not null default '2024-01-01',
  effective_to date,
  is_active boolean default true,
  -- Metadata
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_fiscal_config_country on public.fiscal_config(country_code, is_active);

alter table public.fiscal_config enable row level security;

-- Anyone authenticated can read fiscal configs (public reference data)
create policy "Authenticated users can read fiscal config" on public.fiscal_config
  for select using (auth.role() = 'authenticated');

-- Only service role can modify (admin only via dashboard)
-- No insert/update/delete policies for regular users

create trigger update_fiscal_config_updated_at before update on public.fiscal_config
  for each row execute procedure public.update_updated_at();

-- ── Seed data: 17 OHADA countries ──
insert into public.fiscal_config (country_code, country_name, currency, is_rate, is_reduced_rate, is_reduced_threshold, imf_rate, imf_minimum, imf_maximum, gift_threshold_rate, donation_threshold_rate, entertainment_threshold_rate, loss_carryforward_years, vat_standard_rate, vat_reduced_rate, notes) values
-- UEMOA Zone (XOF)
('CI', 'Côte d''Ivoire',   'XOF', 0.2500, null, null, 0.0100, 3000000, null, 0.0010, 0.0050, 0.0100, 5, 0.1800, 0.0900, 'Taux IS 25% depuis LFI 2024. IMF = max(1% CA, 3M XOF)'),
('SN', 'Sénégal',          'XOF', 0.3000, null, null, 0.0050, 500000, null, 0.0010, 0.0050, 0.0100, 3, 0.1800, 0.1000, 'IS 30%. IMF = 0.5% CA min 500k XOF'),
('ML', 'Mali',             'XOF', 0.3000, null, null, 0.0100, 500000, null, 0.0010, 0.0050, 0.0100, 3, 0.1800, 0.0500, 'IS 30%. IMF = 1% CA min 500k'),
('BF', 'Burkina Faso',     'XOF', 0.2750, 0.2500, 50000000, 0.0050, 1000000, null, 0.0010, 0.0050, 0.0100, 5, 0.1800, 0.0000, 'IS 27.5% / 25% PME < 50M CA'),
('BJ', 'Bénin',            'XOF', 0.3000, null, null, 0.0100, 200000, null, 0.0010, 0.0050, 0.0100, 3, 0.1800, 0.0000, 'IS 30%. IMF = 1% CA min 200k'),
('TG', 'Togo',             'XOF', 0.2700, null, null, 0.0100, 500000, null, 0.0010, 0.0050, 0.0100, 5, 0.1800, 0.1000, 'IS 27%. IMF = 1% CA min 500k'),
('NE', 'Niger',            'XOF', 0.3000, null, null, 0.0100, 500000, null, 0.0010, 0.0050, 0.0100, 4, 0.1900, 0.0500, 'IS 30%. IMF = 1% CA min 500k'),
('GW', 'Guinée-Bissau',    'XOF', 0.2500, null, null, 0.0100, 300000, null, 0.0010, 0.0050, 0.0100, 5, 0.1700, 0.0000, 'IS 25%. IMF = 1% CA'),
-- CEMAC Zone (XAF)
('CM', 'Cameroun',         'XAF', 0.3300, 0.2800, 100000000, 0.0220, 1000000, null, 0.0010, 0.0050, 0.0100, 4, 0.1925, 0.0000, 'IS 33% + 10% centimes. IMF = 2.2% CA min 1M'),
('GA', 'Gabon',            'XAF', 0.3000, null, null, 0.0100, 1000000, null, 0.0010, 0.0050, 0.0100, 5, 0.1800, 0.1000, 'IS 30%. IMF = 1% CA min 1M'),
('CG', 'Congo-Brazzaville','XAF', 0.3000, null, null, 0.0100, 500000, null, 0.0010, 0.0050, 0.0100, 3, 0.1890, 0.0500, 'IS 30%. IMF = 1% CA'),
('TD', 'Tchad',            'XAF', 0.3500, null, null, 0.0150, 500000, null, 0.0010, 0.0050, 0.0100, 4, 0.1800, 0.0000, 'IS 35%. IMF = 1.5% CA'),
('CF', 'Centrafrique',     'XAF', 0.3000, null, null, 0.0100, 500000, null, 0.0010, 0.0050, 0.0100, 5, 0.1900, 0.0500, 'IS 30%. IMF = 1% CA'),
('GQ', 'Guinée Équatoriale','XAF', 0.3500, null, null, 0.0300, 500000, null, 0.0010, 0.0050, 0.0100, 5, 0.1500, 0.0600, 'IS 35%. IMF = 3% CA'),
-- Other OHADA
('GN', 'Guinée-Conakry',   'GNF', 0.3500, null, null, 0.0300, 15000000, null, 0.0010, 0.0050, 0.0100, 3, 0.1800, 0.0000, 'IS 35%. IMF = 3% CA min 15M GNF'),
('KM', 'Comores',          'KMF', 0.3500, 0.2000, 50000000, 0.0100, 200000, null, 0.0010, 0.0050, 0.0100, 5, 0.1000, 0.0500, 'IS 35% / 20% PME. IMF = 1%'),
('CD', 'RD Congo',         'CDF', 0.3000, null, null, 0.0100, 2500000, null, 0.0010, 0.0050, 0.0100, 5, 0.1600, 0.0800, 'IS 30%. IMF = 1% CA');
