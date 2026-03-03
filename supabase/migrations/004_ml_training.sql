-- ============================================================
-- Liass'Pilot — Phase C: ML Training Data
-- Stores validated account categorization corrections for learning.
-- ============================================================

CREATE TABLE IF NOT EXISTS ml_training_data (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  -- Input features
  libelle_original   text NOT NULL,          -- Original label from balance/OCR
  libelle_normalized text NOT NULL,          -- Lowercase, trimmed, accents removed
  montant            numeric,                -- Amount (helps distinguish categories)
  context_classe     text,                   -- Class context (e.g., '6' for charges)
  -- Output (validated mapping)
  compte_suggere     text NOT NULL,          -- Account number suggested by ML
  compte_valide      text NOT NULL,          -- Account number validated by user
  libelle_valide     text,                   -- Validated label
  -- Metadata
  source             text DEFAULT 'manual',  -- 'manual', 'ocr', 'import'
  validated_by       uuid REFERENCES auth.users(id),
  created_at         timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE ml_training_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY ml_select ON ml_training_data FOR SELECT
  USING (tenant_id = get_my_tenant_id());
CREATE POLICY ml_insert ON ml_training_data FOR INSERT
  WITH CHECK (tenant_id = get_my_tenant_id());

-- Index for fast similarity lookups
CREATE INDEX IF NOT EXISTS idx_ml_libelle ON ml_training_data(tenant_id, libelle_normalized);

-- ============================================================
-- Sector benchmarks for predictive analytics
-- ============================================================

CREATE TABLE IF NOT EXISTS sector_benchmarks (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  pays            text NOT NULL,
  secteur         text NOT NULL,
  annee           int NOT NULL,
  -- KPIs
  marge_brute_pct          numeric,
  marge_nette_pct          numeric,
  ratio_endettement        numeric,
  rotation_stocks_jours    numeric,
  delai_clients_jours      numeric,
  delai_fournisseurs_jours numeric,
  tresorerie_nette_pct     numeric,
  -- Source
  source          text DEFAULT 'OHADA_STATS',
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(pays, secteur, annee)
);

-- Seed some benchmarks for CI
INSERT INTO sector_benchmarks (pays, secteur, annee, marge_brute_pct, marge_nette_pct, ratio_endettement, rotation_stocks_jours, delai_clients_jours, delai_fournisseurs_jours)
VALUES
  ('CI', 'COMMERCE', 2024, 25.0, 5.0, 0.65, 45, 60, 90),
  ('CI', 'SERVICES', 2024, 45.0, 12.0, 0.40, 0, 45, 30),
  ('CI', 'INDUSTRIE', 2024, 30.0, 8.0, 0.55, 60, 75, 60),
  ('CI', 'BTP', 2024, 20.0, 4.0, 0.70, 30, 90, 45),
  ('CI', 'AGRICULTURE', 2024, 35.0, 6.0, 0.50, 90, 30, 60),
  ('SN', 'COMMERCE', 2024, 22.0, 4.5, 0.60, 50, 55, 85),
  ('SN', 'SERVICES', 2024, 42.0, 10.0, 0.45, 0, 40, 35),
  ('CM', 'COMMERCE', 2024, 23.0, 4.0, 0.68, 48, 65, 80),
  ('CM', 'SERVICES', 2024, 40.0, 9.0, 0.42, 0, 50, 35)
ON CONFLICT DO NOTHING;
