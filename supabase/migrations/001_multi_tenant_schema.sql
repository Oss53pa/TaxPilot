-- ============================================================
-- Liass'Pilot — Phase A: Multi-Tenant Cloud Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL)
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- HELPER: current_tenant_id() from JWT claims
-- ============================================================
CREATE OR REPLACE FUNCTION current_tenant_id()
RETURNS uuid
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id')::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid
  );
$$;

-- ============================================================
-- TABLE: tenants (cabinets / organisations)
-- ============================================================
CREATE TABLE IF NOT EXISTS tenants (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom         text NOT NULL,
  slug        text UNIQUE NOT NULL,
  plan        text NOT NULL DEFAULT 'STARTER' CHECK (plan IN ('STARTER', 'BUSINESS', 'ENTERPRISE')),
  pays        text NOT NULL DEFAULT 'CI',
  devise      text NOT NULL DEFAULT 'XOF',
  logo_url    text,
  -- quotas
  liasses_quota     int NOT NULL DEFAULT 2,
  liasses_used      int NOT NULL DEFAULT 0,
  storage_quota_mb  int NOT NULL DEFAULT 1024,
  storage_used_mb   int NOT NULL DEFAULT 0,
  users_quota       int NOT NULL DEFAULT 1,
  -- trial
  trial_ends_at     timestamptz,
  is_active         boolean NOT NULL DEFAULT true,
  -- timestamps
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE: profiles (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id       uuid REFERENCES tenants(id) ON DELETE SET NULL,
  full_name       text,
  email           text,
  phone           text,
  avatar_url      text,
  role            text NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('OWNER', 'ADMIN', 'COMPTABLE', 'AUDITEUR', 'VIEWER')),
  is_active       boolean NOT NULL DEFAULT true,
  last_login_at   timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE: permissions (RBAC granulaire)
-- ============================================================
CREATE TABLE IF NOT EXISTS permissions (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  role        text NOT NULL,
  resource    text NOT NULL, -- 'balance', 'liasse', 'audit', 'parametrage', 'users', 'billing'
  action      text NOT NULL, -- 'create', 'read', 'update', 'delete', 'export', 'validate', 'declare'
  allowed     boolean NOT NULL DEFAULT true,
  UNIQUE(role, resource, action)
);

-- Seed default permissions
INSERT INTO permissions (role, resource, action, allowed) VALUES
  -- OWNER: all
  ('OWNER', 'balance', 'create', true), ('OWNER', 'balance', 'read', true), ('OWNER', 'balance', 'update', true), ('OWNER', 'balance', 'delete', true), ('OWNER', 'balance', 'export', true),
  ('OWNER', 'liasse', 'create', true), ('OWNER', 'liasse', 'read', true), ('OWNER', 'liasse', 'update', true), ('OWNER', 'liasse', 'delete', true), ('OWNER', 'liasse', 'export', true), ('OWNER', 'liasse', 'validate', true), ('OWNER', 'liasse', 'declare', true),
  ('OWNER', 'audit', 'create', true), ('OWNER', 'audit', 'read', true),
  ('OWNER', 'parametrage', 'create', true), ('OWNER', 'parametrage', 'read', true), ('OWNER', 'parametrage', 'update', true), ('OWNER', 'parametrage', 'delete', true),
  ('OWNER', 'users', 'create', true), ('OWNER', 'users', 'read', true), ('OWNER', 'users', 'update', true), ('OWNER', 'users', 'delete', true),
  ('OWNER', 'billing', 'read', true), ('OWNER', 'billing', 'update', true),
  -- ADMIN: all except billing
  ('ADMIN', 'balance', 'create', true), ('ADMIN', 'balance', 'read', true), ('ADMIN', 'balance', 'update', true), ('ADMIN', 'balance', 'delete', true), ('ADMIN', 'balance', 'export', true),
  ('ADMIN', 'liasse', 'create', true), ('ADMIN', 'liasse', 'read', true), ('ADMIN', 'liasse', 'update', true), ('ADMIN', 'liasse', 'delete', true), ('ADMIN', 'liasse', 'export', true), ('ADMIN', 'liasse', 'validate', true), ('ADMIN', 'liasse', 'declare', true),
  ('ADMIN', 'audit', 'create', true), ('ADMIN', 'audit', 'read', true),
  ('ADMIN', 'parametrage', 'create', true), ('ADMIN', 'parametrage', 'read', true), ('ADMIN', 'parametrage', 'update', true), ('ADMIN', 'parametrage', 'delete', true),
  ('ADMIN', 'users', 'create', true), ('ADMIN', 'users', 'read', true), ('ADMIN', 'users', 'update', true),
  ('ADMIN', 'billing', 'read', true),
  -- COMPTABLE: balance + liasse + audit read
  ('COMPTABLE', 'balance', 'create', true), ('COMPTABLE', 'balance', 'read', true), ('COMPTABLE', 'balance', 'update', true), ('COMPTABLE', 'balance', 'export', true),
  ('COMPTABLE', 'liasse', 'create', true), ('COMPTABLE', 'liasse', 'read', true), ('COMPTABLE', 'liasse', 'update', true), ('COMPTABLE', 'liasse', 'export', true),
  ('COMPTABLE', 'audit', 'create', true), ('COMPTABLE', 'audit', 'read', true),
  ('COMPTABLE', 'parametrage', 'read', true),
  -- AUDITEUR: read + audit
  ('AUDITEUR', 'balance', 'read', true), ('AUDITEUR', 'balance', 'export', true),
  ('AUDITEUR', 'liasse', 'read', true), ('AUDITEUR', 'liasse', 'export', true),
  ('AUDITEUR', 'audit', 'create', true), ('AUDITEUR', 'audit', 'read', true),
  ('AUDITEUR', 'parametrage', 'read', true),
  -- VIEWER: read only
  ('VIEWER', 'balance', 'read', true),
  ('VIEWER', 'liasse', 'read', true),
  ('VIEWER', 'audit', 'read', true)
ON CONFLICT (role, resource, action) DO NOTHING;

-- ============================================================
-- TABLE: tenant_entities (entreprises gérées par un cabinet)
-- ============================================================
CREATE TABLE IF NOT EXISTS tenant_entities (
  id                   uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id            uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  raison_sociale       text NOT NULL,
  forme_juridique      text,
  numero_contribuable  text,
  rccm                 text,
  ifu                  text,
  adresse              text,
  ville                text,
  pays                 text NOT NULL DEFAULT 'CI',
  telephone            text,
  email                text,
  nom_dirigeant        text,
  fonction_dirigeant   text,
  regime_imposition    text DEFAULT 'REEL_NORMAL' CHECK (regime_imposition IN ('REEL_NORMAL', 'REEL_SIMPLIFIE', 'SYNTHETIQUE')),
  centre_impots        text,
  secteur_activite     text,
  type_liasse          text DEFAULT 'SN' CHECK (type_liasse IN ('SN', 'SMT', 'CONSO', 'BANQUE', 'ASSURANCE', 'MICROFINANCE', 'EBNL')),
  chiffre_affaires_annuel numeric DEFAULT 0,
  devise               text DEFAULT 'XOF',
  is_active            boolean NOT NULL DEFAULT true,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE: exercices
-- ============================================================
CREATE TABLE IF NOT EXISTS exercices (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  entity_id       uuid NOT NULL REFERENCES tenant_entities(id) ON DELETE CASCADE,
  code            text NOT NULL, -- e.g. '2025'
  date_debut      date NOT NULL,
  date_fin        date NOT NULL,
  duree_mois      int NOT NULL DEFAULT 12,
  statut          text NOT NULL DEFAULT 'en_cours' CHECK (statut IN ('en_cours', 'cloture', 'valide', 'depose')),
  is_current      boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(entity_id, code)
);

-- ============================================================
-- TABLE: balances
-- ============================================================
CREATE TABLE IF NOT EXISTS balances (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  exercice_id     uuid NOT NULL REFERENCES exercices(id) ON DELETE CASCADE,
  nom_fichier     text,
  date_import     timestamptz NOT NULL DEFAULT now(),
  nb_lignes       int NOT NULL DEFAULT 0,
  total_debit     numeric NOT NULL DEFAULT 0,
  total_credit    numeric NOT NULL DEFAULT 0,
  equilibree      boolean NOT NULL DEFAULT true,
  metadata_json   jsonb DEFAULT '{}',
  created_by      uuid REFERENCES auth.users(id),
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE: lignes_balance
-- ============================================================
CREATE TABLE IF NOT EXISTS lignes_balance (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  balance_id        uuid NOT NULL REFERENCES balances(id) ON DELETE CASCADE,
  tenant_id         uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  numero_compte     text NOT NULL,
  libelle           text NOT NULL,
  debit_ouverture   numeric NOT NULL DEFAULT 0,
  credit_ouverture  numeric NOT NULL DEFAULT 0,
  debit_mouvement   numeric NOT NULL DEFAULT 0,
  credit_mouvement  numeric NOT NULL DEFAULT 0,
  debit_solde       numeric NOT NULL DEFAULT 0,
  credit_solde      numeric NOT NULL DEFAULT 0
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_lignes_balance_compte ON lignes_balance(balance_id, numero_compte);

-- ============================================================
-- TABLE: liasses
-- ============================================================
CREATE TABLE IF NOT EXISTS liasses (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id         uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  exercice_id       uuid NOT NULL REFERENCES exercices(id) ON DELETE CASCADE,
  type_liasse       text NOT NULL DEFAULT 'SN' CHECK (type_liasse IN ('SN', 'SMT', 'CONSO', 'BANQUE', 'ASSURANCE', 'MICROFINANCE', 'EBNL')),
  statut            text NOT NULL DEFAULT 'BROUILLON' CHECK (statut IN ('BROUILLON', 'VALIDEE', 'DECLAREE', 'ARCHIVEE')),
  donnees_json      jsonb DEFAULT '{}',
  score_validation  int NOT NULL DEFAULT 0,
  date_generation   timestamptz,
  date_validation   timestamptz,
  date_declaration  timestamptz,
  created_by        uuid REFERENCES auth.users(id),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE: declarations
-- ============================================================
CREATE TABLE IF NOT EXISTS declarations (
  id                 uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id          uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  entity_id          uuid NOT NULL REFERENCES tenant_entities(id) ON DELETE CASCADE,
  exercice_id        uuid REFERENCES exercices(id),
  type_declaration   text NOT NULL CHECK (type_declaration IN ('IS', 'TVA', 'AIRSI', 'IRC', 'IRCM', 'PATENTE', 'IMF', 'IGR', 'CNPS')),
  periode            text NOT NULL,
  montant_base       numeric NOT NULL DEFAULT 0,
  montant_impot      numeric NOT NULL DEFAULT 0,
  montant_penalites  numeric NOT NULL DEFAULT 0,
  date_limite        date NOT NULL,
  date_depot         date,
  statut             text NOT NULL DEFAULT 'A_DEPOSER' CHECK (statut IN ('A_DEPOSER', 'DEPOSEE', 'PAYEE', 'EN_RETARD')),
  reference_depot    text,
  donnees_json       jsonb DEFAULT '{}',
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE: audit_sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_sessions (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  liasse_id       uuid REFERENCES liasses(id) ON DELETE SET NULL,
  balance_id      uuid REFERENCES balances(id) ON DELETE SET NULL,
  exercice_id     uuid REFERENCES exercices(id),
  score_global    int NOT NULL DEFAULT 0,
  nb_anomalies    int NOT NULL DEFAULT 0,
  nb_errors       int NOT NULL DEFAULT 0,
  nb_warnings     int NOT NULL DEFAULT 0,
  resultats_json  jsonb DEFAULT '{}',
  created_by      uuid REFERENCES auth.users(id),
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE: audit_trail (OHADA Art. 19-24 — SHA-256 chained)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_trail (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tenant_id    uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id      uuid REFERENCES auth.users(id),
  action       text NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'VALIDATE', 'DECLARE', 'EXPORT', 'LOGIN', 'LOGOUT'
  resource     text NOT NULL, -- 'balance', 'liasse', 'audit', 'declaration', 'entity', 'user'
  resource_id  text,
  details      jsonb DEFAULT '{}',
  ip_address   text,
  user_agent   text,
  prev_hash    text NOT NULL, -- SHA-256 of previous record (chain)
  hash         text NOT NULL, -- SHA-256(id || tenant_id || user_id || action || resource || resource_id || details || prev_hash || ts)
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- Make audit_trail append-only (no UPDATE/DELETE)
CREATE INDEX IF NOT EXISTS idx_audit_trail_tenant ON audit_trail(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_trail_resource ON audit_trail(tenant_id, resource, resource_id);

-- ============================================================
-- TABLE: invitations
-- ============================================================
CREATE TABLE IF NOT EXISTS invitations (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email       text NOT NULL,
  role        text NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('ADMIN', 'COMPTABLE', 'AUDITEUR', 'VIEWER')),
  invited_by  uuid REFERENCES auth.users(id),
  token       text NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  status      text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED')),
  expires_at  timestamptz NOT NULL DEFAULT now() + interval '7 days',
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- FUNCTION: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply trigger to all mutable tables
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['tenants', 'profiles', 'tenant_entities', 'exercices', 'liasses', 'declarations']
  LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
      t
    );
  EXCEPTION WHEN duplicate_object THEN NULL;
  END LOOP;
END;
$$;

-- ============================================================
-- FUNCTION: auto-create profile on auth.users insert
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.email,
    'MEMBER'
  );
  RETURN NEW;
END;
$$;

-- Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — tenant isolation
-- ============================================================
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercices ENABLE ROW LEVEL SECURITY;
ALTER TABLE balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE lignes_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE liasses ENABLE ROW LEVEL SECURITY;
ALTER TABLE declarations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Helper: get tenant_id for current user
CREATE OR REPLACE FUNCTION get_my_tenant_id()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT tenant_id FROM profiles WHERE id = auth.uid();
$$;

-- ── tenants ──
CREATE POLICY tenant_select ON tenants FOR SELECT
  USING (id = get_my_tenant_id());
CREATE POLICY tenant_update ON tenants FOR UPDATE
  USING (id = get_my_tenant_id())
  WITH CHECK (id = get_my_tenant_id());

-- ── profiles ──
CREATE POLICY profile_select ON profiles FOR SELECT
  USING (tenant_id = get_my_tenant_id() OR id = auth.uid());
CREATE POLICY profile_update ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ── tenant_entities ──
CREATE POLICY entity_select ON tenant_entities FOR SELECT
  USING (tenant_id = get_my_tenant_id());
CREATE POLICY entity_insert ON tenant_entities FOR INSERT
  WITH CHECK (tenant_id = get_my_tenant_id());
CREATE POLICY entity_update ON tenant_entities FOR UPDATE
  USING (tenant_id = get_my_tenant_id())
  WITH CHECK (tenant_id = get_my_tenant_id());
CREATE POLICY entity_delete ON tenant_entities FOR DELETE
  USING (tenant_id = get_my_tenant_id());

-- ── exercices ──
CREATE POLICY exercice_select ON exercices FOR SELECT
  USING (tenant_id = get_my_tenant_id());
CREATE POLICY exercice_insert ON exercices FOR INSERT
  WITH CHECK (tenant_id = get_my_tenant_id());
CREATE POLICY exercice_update ON exercices FOR UPDATE
  USING (tenant_id = get_my_tenant_id());

-- ── balances ──
CREATE POLICY balance_select ON balances FOR SELECT
  USING (tenant_id = get_my_tenant_id());
CREATE POLICY balance_insert ON balances FOR INSERT
  WITH CHECK (tenant_id = get_my_tenant_id());

-- ── lignes_balance ──
CREATE POLICY ligne_select ON lignes_balance FOR SELECT
  USING (tenant_id = get_my_tenant_id());
CREATE POLICY ligne_insert ON lignes_balance FOR INSERT
  WITH CHECK (tenant_id = get_my_tenant_id());

-- ── liasses ──
CREATE POLICY liasse_select ON liasses FOR SELECT
  USING (tenant_id = get_my_tenant_id());
CREATE POLICY liasse_insert ON liasses FOR INSERT
  WITH CHECK (tenant_id = get_my_tenant_id());
CREATE POLICY liasse_update ON liasses FOR UPDATE
  USING (tenant_id = get_my_tenant_id());
CREATE POLICY liasse_delete ON liasses FOR DELETE
  USING (tenant_id = get_my_tenant_id());

-- ── declarations ──
CREATE POLICY declaration_select ON declarations FOR SELECT
  USING (tenant_id = get_my_tenant_id());
CREATE POLICY declaration_insert ON declarations FOR INSERT
  WITH CHECK (tenant_id = get_my_tenant_id());
CREATE POLICY declaration_update ON declarations FOR UPDATE
  USING (tenant_id = get_my_tenant_id());

-- ── audit_sessions ──
CREATE POLICY audit_select ON audit_sessions FOR SELECT
  USING (tenant_id = get_my_tenant_id());
CREATE POLICY audit_insert ON audit_sessions FOR INSERT
  WITH CHECK (tenant_id = get_my_tenant_id());

-- ── audit_trail (append-only: SELECT + INSERT only) ──
CREATE POLICY trail_select ON audit_trail FOR SELECT
  USING (tenant_id = get_my_tenant_id());
CREATE POLICY trail_insert ON audit_trail FOR INSERT
  WITH CHECK (tenant_id = get_my_tenant_id());

-- ── invitations ──
CREATE POLICY invitation_select ON invitations FOR SELECT
  USING (tenant_id = get_my_tenant_id() OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));
CREATE POLICY invitation_insert ON invitations FOR INSERT
  WITH CHECK (tenant_id = get_my_tenant_id());
CREATE POLICY invitation_update ON invitations FOR UPDATE
  USING (tenant_id = get_my_tenant_id());

-- ============================================================
-- FUNCTION: prevent audit_trail mutation (immutability)
-- ============================================================
CREATE OR REPLACE FUNCTION prevent_audit_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'audit_trail is immutable — UPDATE and DELETE are forbidden (OHADA Art. 19-24)';
END;
$$;

CREATE TRIGGER audit_trail_immutable
  BEFORE UPDATE OR DELETE ON audit_trail
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_mutation();

-- ============================================================
-- Done! Run 002_seed_demo_tenant.sql next for test data.
-- ============================================================
