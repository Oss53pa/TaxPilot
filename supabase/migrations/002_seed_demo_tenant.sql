-- ============================================================
-- Liass'Pilot — Seed demo tenant for development
-- Run AFTER 001_multi_tenant_schema.sql
-- ============================================================

-- Create demo tenant (cabinet)
INSERT INTO tenants (id, nom, slug, plan, pays, devise, liasses_quota, users_quota, storage_quota_mb, trial_ends_at)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Cabinet Atlas Demo',
  'atlas-demo',
  'BUSINESS',
  'CI',
  'XOF',
  12,
  5,
  10240,
  now() + interval '30 days'
)
ON CONFLICT DO NOTHING;

-- Create demo entity (entreprise)
INSERT INTO tenant_entities (id, tenant_id, raison_sociale, forme_juridique, numero_contribuable, ville, pays, regime_imposition, type_liasse)
VALUES (
  'e0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'SARL Atlas Consulting',
  'SARL',
  'CI-ABJ-2024-00001',
  'Abidjan',
  'CI',
  'REEL_NORMAL',
  'SN'
)
ON CONFLICT DO NOTHING;

-- Create demo exercice
INSERT INTO exercices (id, tenant_id, entity_id, code, date_debut, date_fin, duree_mois, statut, is_current)
VALUES (
  'x0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'e0000000-0000-0000-0000-000000000001',
  '2025',
  '2025-01-01',
  '2025-12-31',
  12,
  'en_cours',
  true
)
ON CONFLICT DO NOTHING;

-- NOTE: The demo user profile will be auto-created by the handle_new_user() trigger
-- when the first user signs up. To link to this tenant, update their profile:
--
--   UPDATE profiles
--   SET tenant_id = 'a0000000-0000-0000-0000-000000000001', role = 'OWNER'
--   WHERE id = '<user-uuid>';
