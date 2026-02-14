-- ============================================================
-- TaxPilot — Supabase Initial Schema
-- SYSCOHADA Tax Filing Application for Côte d'Ivoire / OHADA
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. ORGANISATIONS (multi-tenant)
-- ============================================================
CREATE TABLE organisations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL DEFAULT 'STARTER' CHECK (plan IN ('STARTER', 'BUSINESS', 'ENTERPRISE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organisation_id UUID REFERENCES organisations(id) ON DELETE SET NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. ENTREPRISES
-- ============================================================
CREATE TABLE entreprises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  raison_sociale TEXT NOT NULL,
  forme_juridique TEXT NOT NULL DEFAULT 'SARL',
  numero_contribuable TEXT NOT NULL,
  rccm TEXT,
  ifu TEXT,
  adresse TEXT,
  ville TEXT NOT NULL DEFAULT 'Abidjan',
  pays TEXT NOT NULL DEFAULT 'CI',
  telephone TEXT,
  email TEXT,
  nom_dirigeant TEXT,
  fonction_dirigeant TEXT,
  regime_imposition TEXT NOT NULL DEFAULT 'REEL_NORMAL'
    CHECK (regime_imposition IN ('REEL_NORMAL', 'REEL_SIMPLIFIE', 'SYNTHETIQUE')),
  centre_impots TEXT,
  secteur_activite TEXT,
  chiffre_affaires_annuel BIGINT DEFAULT 0,
  devise TEXT NOT NULL DEFAULT 'XOF',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_entreprises_org ON entreprises(organisation_id);

-- ============================================================
-- 4. EXERCICES
-- ============================================================
CREATE TABLE exercices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entreprise_id UUID NOT NULL REFERENCES entreprises(id) ON DELETE CASCADE,
  code TEXT NOT NULL, -- e.g. '2024'
  date_debut DATE NOT NULL,
  date_fin DATE NOT NULL,
  cloture BOOLEAN NOT NULL DEFAULT false,
  is_current BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(entreprise_id, code)
);

CREATE INDEX idx_exercices_entreprise ON exercices(entreprise_id);

-- ============================================================
-- 5. BALANCES (imported trial balance)
-- ============================================================
CREATE TABLE balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exercice_id UUID NOT NULL REFERENCES exercices(id) ON DELETE CASCADE,
  nom_fichier TEXT,
  date_import TIMESTAMPTZ NOT NULL DEFAULT now(),
  nb_lignes INT NOT NULL DEFAULT 0,
  total_debit BIGINT NOT NULL DEFAULT 0,
  total_credit BIGINT NOT NULL DEFAULT 0,
  equilibree BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_balances_exercice ON balances(exercice_id);

-- ============================================================
-- 6. LIGNES_BALANCE (individual account lines)
-- ============================================================
CREATE TABLE lignes_balance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  balance_id UUID NOT NULL REFERENCES balances(id) ON DELETE CASCADE,
  numero_compte TEXT NOT NULL,
  libelle TEXT NOT NULL,
  debit_ouverture BIGINT NOT NULL DEFAULT 0,
  credit_ouverture BIGINT NOT NULL DEFAULT 0,
  debit_mouvement BIGINT NOT NULL DEFAULT 0,
  credit_mouvement BIGINT NOT NULL DEFAULT 0,
  debit_solde BIGINT NOT NULL DEFAULT 0,
  credit_solde BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_lignes_balance_bal ON lignes_balance(balance_id);
CREATE INDEX idx_lignes_balance_compte ON lignes_balance(numero_compte);

-- ============================================================
-- 7. LIASSES (tax filing documents)
-- ============================================================
CREATE TABLE liasses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exercice_id UUID NOT NULL REFERENCES exercices(id) ON DELETE CASCADE,
  type_liasse TEXT NOT NULL DEFAULT 'SN'
    CHECK (type_liasse IN ('SN', 'SMT', 'CONSO', 'BANQUE', 'ASSURANCE', 'MICROFINANCE', 'EBNL')),
  statut TEXT NOT NULL DEFAULT 'BROUILLON'
    CHECK (statut IN ('BROUILLON', 'VALIDEE', 'DECLAREE', 'ARCHIVEE')),
  donnees_json JSONB NOT NULL DEFAULT '{}',
  score_validation INT DEFAULT 0,
  date_generation TIMESTAMPTZ,
  date_validation TIMESTAMPTZ,
  date_declaration TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_liasses_exercice ON liasses(exercice_id);

-- ============================================================
-- 8. DECLARATIONS FISCALES
-- ============================================================
CREATE TABLE declarations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entreprise_id UUID NOT NULL REFERENCES entreprises(id) ON DELETE CASCADE,
  exercice_id UUID REFERENCES exercices(id),
  type_declaration TEXT NOT NULL
    CHECK (type_declaration IN ('IS', 'TVA', 'AIRSI', 'IRC', 'IRCM', 'PATENTE', 'IMF', 'IGR', 'CNPS')),
  periode TEXT NOT NULL, -- e.g. '2024-Q1', '2024-M03', '2024'
  montant_base BIGINT NOT NULL DEFAULT 0,
  montant_impot BIGINT NOT NULL DEFAULT 0,
  montant_penalites BIGINT NOT NULL DEFAULT 0,
  date_limite DATE NOT NULL,
  date_depot DATE,
  statut TEXT NOT NULL DEFAULT 'A_DEPOSER'
    CHECK (statut IN ('A_DEPOSER', 'DEPOSEE', 'PAYEE', 'EN_RETARD')),
  reference_depot TEXT,
  donnees_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_declarations_entreprise ON declarations(entreprise_id);
CREATE INDEX idx_declarations_type ON declarations(type_declaration);

-- ============================================================
-- 9. ECRITURES JOURNAL (accounting entries)
-- ============================================================
CREATE TABLE ecritures_journal (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exercice_id UUID NOT NULL REFERENCES exercices(id) ON DELETE CASCADE,
  numero_piece TEXT NOT NULL,
  date_ecriture DATE NOT NULL,
  journal TEXT NOT NULL DEFAULT 'OD', -- OD, AC, VE, BQ, CA
  numero_compte TEXT NOT NULL,
  libelle TEXT NOT NULL,
  debit BIGINT NOT NULL DEFAULT 0,
  credit BIGINT NOT NULL DEFAULT 0,
  reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ecritures_exercice ON ecritures_journal(exercice_id);
CREATE INDEX idx_ecritures_compte ON ecritures_journal(numero_compte);
CREATE INDEX idx_ecritures_date ON ecritures_journal(date_ecriture);

-- ============================================================
-- 10. AUDIT SESSIONS
-- ============================================================
CREATE TABLE audit_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  liasse_id UUID REFERENCES liasses(id) ON DELETE CASCADE,
  balance_id UUID REFERENCES balances(id) ON DELETE SET NULL,
  score_global INT NOT NULL DEFAULT 0,
  nb_anomalies INT NOT NULL DEFAULT 0,
  nb_errors INT NOT NULL DEFAULT 0,
  nb_warnings INT NOT NULL DEFAULT 0,
  resultats_json JSONB NOT NULL DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_liasse ON audit_sessions(liasse_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE entreprises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercices ENABLE ROW LEVEL SECURITY;
ALTER TABLE balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE lignes_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE liasses ENABLE ROW LEVEL SECURITY;
ALTER TABLE declarations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecritures_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_sessions ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Organisations: members can read their org
CREATE POLICY "Org members can view org"
  ON organisations FOR SELECT USING (
    id IN (SELECT organisation_id FROM profiles WHERE id = auth.uid())
  );

-- Entreprises: scoped to organisation
CREATE POLICY "Org members can view entreprises"
  ON entreprises FOR SELECT USING (
    organisation_id IN (SELECT organisation_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can manage entreprises"
  ON entreprises FOR ALL USING (
    organisation_id IN (
      SELECT organisation_id FROM profiles
      WHERE id = auth.uid() AND role IN ('OWNER', 'ADMIN')
    )
  );

-- Exercices: scoped via entreprise → organisation
CREATE POLICY "Org members can view exercices"
  ON exercices FOR SELECT USING (
    entreprise_id IN (
      SELECT e.id FROM entreprises e
      JOIN profiles p ON p.organisation_id = e.organisation_id
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage exercices"
  ON exercices FOR ALL USING (
    entreprise_id IN (
      SELECT e.id FROM entreprises e
      JOIN profiles p ON p.organisation_id = e.organisation_id
      WHERE p.id = auth.uid() AND p.role IN ('OWNER', 'ADMIN')
    )
  );

-- Balances: scoped via exercice → entreprise → organisation
CREATE POLICY "Org members can view balances"
  ON balances FOR SELECT USING (
    exercice_id IN (
      SELECT ex.id FROM exercices ex
      JOIN entreprises e ON e.id = ex.entreprise_id
      JOIN profiles p ON p.organisation_id = e.organisation_id
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage balances"
  ON balances FOR ALL USING (
    exercice_id IN (
      SELECT ex.id FROM exercices ex
      JOIN entreprises e ON e.id = ex.entreprise_id
      JOIN profiles p ON p.organisation_id = e.organisation_id
      WHERE p.id = auth.uid() AND p.role IN ('OWNER', 'ADMIN')
    )
  );

-- Lignes balance: same scope as balances
CREATE POLICY "Org members can view lignes_balance"
  ON lignes_balance FOR SELECT USING (
    balance_id IN (
      SELECT b.id FROM balances b
      JOIN exercices ex ON ex.id = b.exercice_id
      JOIN entreprises e ON e.id = ex.entreprise_id
      JOIN profiles p ON p.organisation_id = e.organisation_id
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage lignes_balance"
  ON lignes_balance FOR ALL USING (
    balance_id IN (
      SELECT b.id FROM balances b
      JOIN exercices ex ON ex.id = b.exercice_id
      JOIN entreprises e ON e.id = ex.entreprise_id
      JOIN profiles p ON p.organisation_id = e.organisation_id
      WHERE p.id = auth.uid() AND p.role IN ('OWNER', 'ADMIN')
    )
  );

-- Liasses: scoped via exercice
CREATE POLICY "Org members can view liasses"
  ON liasses FOR SELECT USING (
    exercice_id IN (
      SELECT ex.id FROM exercices ex
      JOIN entreprises e ON e.id = ex.entreprise_id
      JOIN profiles p ON p.organisation_id = e.organisation_id
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage liasses"
  ON liasses FOR ALL USING (
    exercice_id IN (
      SELECT ex.id FROM exercices ex
      JOIN entreprises e ON e.id = ex.entreprise_id
      JOIN profiles p ON p.organisation_id = e.organisation_id
      WHERE p.id = auth.uid() AND p.role IN ('OWNER', 'ADMIN')
    )
  );

-- Declarations: scoped via entreprise
CREATE POLICY "Org members can view declarations"
  ON declarations FOR SELECT USING (
    entreprise_id IN (
      SELECT e.id FROM entreprises e
      JOIN profiles p ON p.organisation_id = e.organisation_id
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage declarations"
  ON declarations FOR ALL USING (
    entreprise_id IN (
      SELECT e.id FROM entreprises e
      JOIN profiles p ON p.organisation_id = e.organisation_id
      WHERE p.id = auth.uid() AND p.role IN ('OWNER', 'ADMIN')
    )
  );

-- Ecritures: scoped via exercice
CREATE POLICY "Org members can view ecritures"
  ON ecritures_journal FOR SELECT USING (
    exercice_id IN (
      SELECT ex.id FROM exercices ex
      JOIN entreprises e ON e.id = ex.entreprise_id
      JOIN profiles p ON p.organisation_id = e.organisation_id
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage ecritures"
  ON ecritures_journal FOR ALL USING (
    exercice_id IN (
      SELECT ex.id FROM exercices ex
      JOIN entreprises e ON e.id = ex.entreprise_id
      JOIN profiles p ON p.organisation_id = e.organisation_id
      WHERE p.id = auth.uid() AND p.role IN ('OWNER', 'ADMIN')
    )
  );

-- Audit sessions: scoped via liasse
CREATE POLICY "Org members can view audits"
  ON audit_sessions FOR SELECT USING (
    liasse_id IN (
      SELECT l.id FROM liasses l
      JOIN exercices ex ON ex.id = l.exercice_id
      JOIN entreprises e ON e.id = ex.entreprise_id
      JOIN profiles p ON p.organisation_id = e.organisation_id
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage audits"
  ON audit_sessions FOR ALL USING (
    liasse_id IN (
      SELECT l.id FROM liasses l
      JOIN exercices ex ON ex.id = l.exercice_id
      JOIN entreprises e ON e.id = ex.entreprise_id
      JOIN profiles p ON p.organisation_id = e.organisation_id
      WHERE p.id = auth.uid() AND p.role IN ('OWNER', 'ADMIN')
    )
  );

-- ============================================================
-- TRIGGER: auto-create profile on user signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- TRIGGER: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_organisations_updated_at BEFORE UPDATE ON organisations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_entreprises_updated_at BEFORE UPDATE ON entreprises FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_exercices_updated_at BEFORE UPDATE ON exercices FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_liasses_updated_at BEFORE UPDATE ON liasses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_declarations_updated_at BEFORE UPDATE ON declarations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
