/**
 * Donnees de demonstration pour FiscaSync-Lite
 * Peuple les collections localStorage au demarrage si vides
 */

import { localDb } from '../services/localDatabase'

export function seedDatabase(): void {
  console.log('🌱 Seeding local database...')

  // === USERS ===
  localDb.seed('users', [
    {
      id: 1,
      username: 'admin',
      email: 'admin@fiscasync.com',
      password: 'admin123',
      first_name: 'Admin',
      last_name: 'FiscaSync',
      is_staff: true,
      is_superuser: true,
      role: 'admin',
    },
  ])

  // === ORGANIZATIONS ===
  localDb.seed('organizations', [
    {
      id: 1,
      name: 'FiscaSync Demo',
      slug: 'fiscasync-demo',
      legal_form: 'SARL',
      rccm: 'CI-ABJ-2024-B-12345',
      ifu: '2412345A',
      country: 'CI',
      city: 'Abidjan',
      sector: 'services',
      subscription_plan: 'professional',
      subscription_status: 'active',
      liasses_quota: 50,
      liasses_used: 3,
      quota_percentage: 6,
      has_quota_remaining: true,
    },
  ])

  // === ENTREPRISES ===
  localDb.seed('entreprises', [
    {
      id: 1,
      raison_sociale: 'SARL Demo Abidjan',
      forme_juridique: 'SARL',
      capital_social: 10000000,
      devise: 'XOF',
      rccm: 'CI-ABJ-2024-B-12345',
      ifu: '2412345A',
      regime_fiscal: 'RSI',
      regime_imposition: 'RSI',
      adresse: '01 BP 1234 Abidjan 01',
      ville: 'Abidjan',
      pays: 'CI',
      telephone: '+225 01 23 45 67',
      email: 'contact@demo-abidjan.ci',
      secteur_activite: 'Commerce general',
      date_creation: '2020-01-15',
      exercice_courant: 1,
      statut: 'actif',
      type_liasse: 'SN',
      organization: 1,
    },
  ])

  // === EXERCICES ===
  localDb.seed('exercices', [
    {
      id: 1,
      entreprise: 1,
      annee: 2025,
      date_debut: '2025-01-01',
      date_fin: '2025-12-31',
      statut: 'ouvert',
      is_current: true,
      en_cours: true,
      libelle: 'Exercice 2025',
      duree_mois: 12,
    },
    {
      id: 2,
      entreprise: 1,
      annee: 2024,
      date_debut: '2024-01-01',
      date_fin: '2024-12-31',
      statut: 'cloture',
      is_current: false,
      en_cours: false,
      libelle: 'Exercice 2024',
      duree_mois: 12,
    },
  ])

  // === TYPES LIASSE ===
  localDb.seed('types_liasse', [
    { id: 1, code: 'SN', nom: 'Systeme Normal', description: 'Liasse fiscale systeme normal SYSCOHADA', regime: 'RSI', is_active: true },
    { id: 2, code: 'SA', nom: 'Systeme Allege', description: 'Liasse fiscale systeme allege SYSCOHADA', regime: 'RSA', is_active: true },
    { id: 3, code: 'SMT', nom: 'Systeme Minimal de Tresorerie', description: 'Liasse fiscale SMT', regime: 'SMT', is_active: true },
  ])

  // === BALANCES ===
  localDb.seed('balances', [
    {
      id: 1,
      entreprise: 1,
      exercice: 1,
      nom: 'Balance Generale 2025',
      type: 'generale',
      date_import: '2025-06-15',
      statut: 'valide',
      nombre_lignes: 30,
      total_debit: 125000000,
      total_credit: 125000000,
      equilibree: true,
    },
  ])

  // === LIGNES BALANCE (Comptes SYSCOHADA) ===
  localDb.seed('lignes_balance', [
    { id: 1, balance_id: 1, numero_compte: '101000', libelle: 'Capital social', debit: 0, credit: 10000000, solde: -10000000, classe: '1' },
    { id: 2, balance_id: 1, numero_compte: '106000', libelle: 'Reserves', debit: 0, credit: 2500000, solde: -2500000, classe: '1' },
    { id: 3, balance_id: 1, numero_compte: '120000', libelle: 'Report a nouveau crediteur', debit: 0, credit: 1500000, solde: -1500000, classe: '1' },
    { id: 4, balance_id: 1, numero_compte: '131000', libelle: 'Resultat net: benefice', debit: 0, credit: 3200000, solde: -3200000, classe: '1' },
    { id: 5, balance_id: 1, numero_compte: '162000', libelle: 'Emprunts et dettes aupres des EC', debit: 0, credit: 8000000, solde: -8000000, classe: '1' },
    { id: 6, balance_id: 1, numero_compte: '211000', libelle: 'Frais de developpement', debit: 2000000, credit: 0, solde: 2000000, classe: '2' },
    { id: 7, balance_id: 1, numero_compte: '231000', libelle: 'Batiments', debit: 15000000, credit: 0, solde: 15000000, classe: '2' },
    { id: 8, balance_id: 1, numero_compte: '244000', libelle: 'Materiel et mobilier', debit: 5000000, credit: 0, solde: 5000000, classe: '2' },
    { id: 9, balance_id: 1, numero_compte: '245000', libelle: 'Materiel de transport', debit: 8000000, credit: 0, solde: 8000000, classe: '2' },
    { id: 10, balance_id: 1, numero_compte: '281100', libelle: 'Amort. frais de dev.', debit: 0, credit: 400000, solde: -400000, classe: '2' },
    { id: 11, balance_id: 1, numero_compte: '283100', libelle: 'Amort. batiments', debit: 0, credit: 3000000, solde: -3000000, classe: '2' },
    { id: 12, balance_id: 1, numero_compte: '284400', libelle: 'Amort. materiel et mobilier', debit: 0, credit: 1500000, solde: -1500000, classe: '2' },
    { id: 13, balance_id: 1, numero_compte: '284500', libelle: 'Amort. materiel transport', debit: 0, credit: 2400000, solde: -2400000, classe: '2' },
    { id: 14, balance_id: 1, numero_compte: '311000', libelle: 'Marchandises', debit: 12000000, credit: 0, solde: 12000000, classe: '3' },
    { id: 15, balance_id: 1, numero_compte: '321000', libelle: 'Matieres premieres', debit: 3500000, credit: 0, solde: 3500000, classe: '3' },
    { id: 16, balance_id: 1, numero_compte: '391000', libelle: 'Depreciation marchandises', debit: 0, credit: 600000, solde: -600000, classe: '3' },
    { id: 17, balance_id: 1, numero_compte: '411000', libelle: 'Clients', debit: 18000000, credit: 0, solde: 18000000, classe: '4' },
    { id: 18, balance_id: 1, numero_compte: '401000', libelle: 'Fournisseurs', debit: 0, credit: 9500000, solde: -9500000, classe: '4' },
    { id: 19, balance_id: 1, numero_compte: '421000', libelle: 'Personnel remunerations dues', debit: 0, credit: 2800000, solde: -2800000, classe: '4' },
    { id: 20, balance_id: 1, numero_compte: '431000', libelle: 'Securite sociale', debit: 0, credit: 850000, solde: -850000, classe: '4' },
    { id: 21, balance_id: 1, numero_compte: '441000', libelle: 'Etat impot sur benefices', debit: 0, credit: 1200000, solde: -1200000, classe: '4' },
    { id: 22, balance_id: 1, numero_compte: '443000', libelle: 'Etat TVA facturee', debit: 0, credit: 4500000, solde: -4500000, classe: '4' },
    { id: 23, balance_id: 1, numero_compte: '445000', libelle: 'Etat TVA recuperable', debit: 2800000, credit: 0, solde: 2800000, classe: '4' },
    { id: 24, balance_id: 1, numero_compte: '521000', libelle: 'Banques locales', debit: 8500000, credit: 0, solde: 8500000, classe: '5' },
    { id: 25, balance_id: 1, numero_compte: '571000', libelle: 'Caisse', debit: 1500000, credit: 0, solde: 1500000, classe: '5' },
    { id: 26, balance_id: 1, numero_compte: '601000', libelle: 'Achats de marchandises', debit: 45000000, credit: 0, solde: 45000000, classe: '6' },
    { id: 27, balance_id: 1, numero_compte: '661000', libelle: 'Charges de personnel', debit: 18000000, credit: 0, solde: 18000000, classe: '6' },
    { id: 28, balance_id: 1, numero_compte: '671000', libelle: 'Charges financieres', debit: 1200000, credit: 0, solde: 1200000, classe: '6' },
    { id: 29, balance_id: 1, numero_compte: '701000', libelle: 'Ventes de marchandises', debit: 0, credit: 72000000, solde: -72000000, classe: '7' },
    { id: 30, balance_id: 1, numero_compte: '706000', libelle: 'Services vendus', debit: 0, credit: 15000000, solde: -15000000, classe: '7' },
  ])

  // === PLANS COMPTABLES ===
  localDb.seed('plans_comptables', [
    {
      id: 1,
      nom: 'Plan SYSCOHADA Revise 2017',
      code: 'SYSCOHADA_2017',
      description: 'Plan comptable SYSCOHADA revise applicable depuis 2018',
      pays: 'UEMOA',
      is_default: true,
      nombre_comptes: 1200,
      statut: 'actif',
    },
  ])

  localDb.seed('plans_comptables_balance', [
    {
      id: 1,
      nom: 'Plan SYSCOHADA Revise 2017',
      code: 'SYSCOHADA_2017',
      is_default: true,
    },
  ])

  // === JOURNAUX ===
  localDb.seed('journaux', [
    { id: 1, code: 'VT', nom: 'Journal des Ventes', type: 'ventes', entreprise: 1, statut: 'actif' },
    { id: 2, code: 'AC', nom: 'Journal des Achats', type: 'achats', entreprise: 1, statut: 'actif' },
    { id: 3, code: 'BQ', nom: 'Journal de Banque', type: 'banque', entreprise: 1, statut: 'actif' },
    { id: 4, code: 'OD', nom: 'Journal des Operations Diverses', type: 'od', entreprise: 1, statut: 'actif' },
    { id: 5, code: 'CA', nom: 'Journal de Caisse', type: 'caisse', entreprise: 1, statut: 'actif' },
  ])

  // === OBLIGATIONS FISCALES ===
  localDb.seed('obligations_fiscales', [
    {
      id: 1,
      nom: 'Declaration TVA mensuelle',
      type: 'TVA',
      periodicite: 'mensuelle',
      date_echeance: '2025-07-20',
      statut: 'en_cours',
      entreprise: 1,
      montant_estime: 2500000,
      description: 'Declaration et paiement TVA du mois precedent',
    },
    {
      id: 2,
      nom: 'Acompte IS 1er trimestre',
      type: 'IS',
      periodicite: 'trimestrielle',
      date_echeance: '2025-04-20',
      statut: 'termine',
      entreprise: 1,
      montant_estime: 800000,
      description: 'Premier acompte impot sur les societes',
    },
    {
      id: 3,
      nom: 'Depot Liasse Fiscale',
      type: 'LIASSE',
      periodicite: 'annuelle',
      date_echeance: '2025-06-30',
      statut: 'en_cours',
      entreprise: 1,
      montant_estime: 0,
      description: 'Depot de la liasse fiscale annuelle a la DGI',
    },
    {
      id: 4,
      nom: 'Patente annuelle',
      type: 'PATENTE',
      periodicite: 'annuelle',
      date_echeance: '2025-03-31',
      statut: 'termine',
      entreprise: 1,
      montant_estime: 450000,
      description: 'Contribution des patentes',
    },
  ])

  // === AUDIT SESSIONS ===
  localDb.seed('audit_sessions', [
    {
      id: 1,
      entreprise: 1,
      exercice: 1,
      type: 'coherence',
      statut: 'termine',
      date_debut: '2025-06-10T08:00:00Z',
      date_fin: '2025-06-10T08:15:00Z',
      nombre_anomalies: 2,
      nombre_warnings: 5,
      score: 85,
      resume: 'Audit de coherence - 2 anomalies detectees, 5 avertissements',
    },
  ])

  localDb.seed('audit_anomalies', [
    {
      id: 1,
      session_id: 1,
      code: 'BAL-001',
      severity: 'warning',
      type: 'coherence',
      titre: 'Ecart de solde mineur',
      description: 'Ecart de 150 XOF sur le compte 411000',
      compte: '411000',
      statut: 'ouvert',
      montant: 150,
    },
    {
      id: 2,
      session_id: 1,
      code: 'BAL-002',
      severity: 'error',
      type: 'validation',
      titre: 'Compte sans mouvement',
      description: 'Le compte 391000 a un solde sans aucune ecriture correspondante',
      compte: '391000',
      statut: 'ouvert',
      montant: 600000,
    },
  ])

  // === TEMPLATES ===
  localDb.seed('templates', [
    {
      id: 1,
      nom: 'Liasse SN Standard',
      code: 'LIASSE_SN',
      type: 'liasse',
      description: 'Template de liasse fiscale systeme normal',
      is_published: true,
      version: '1.0',
      categorie: 'liasse_fiscale',
    },
    {
      id: 2,
      nom: 'Rapport Audit Standard',
      code: 'AUDIT_STD',
      type: 'audit',
      description: 'Template de rapport d\'audit standard',
      is_published: true,
      version: '1.0',
      categorie: 'audit',
    },
    {
      id: 3,
      nom: 'Declaration TVA',
      code: 'DECL_TVA',
      type: 'declaration',
      description: 'Template de declaration TVA',
      is_published: true,
      version: '1.0',
      categorie: 'fiscal',
    },
  ])

  // === LIASSES ===
  localDb.seed('liasses', [
    {
      id: 1,
      entreprise: 1,
      exercice: 1,
      type_liasse: 'SN',
      statut: 'brouillon',
      annee: 2025,
      date_creation: '2025-06-15T10:00:00Z',
      titre: 'Liasse fiscale SN 2025',
      balance_id: 1,
    },
  ])

  localDb.seed('generation_liasses', [
    {
      id: 1,
      entreprise: 1,
      exercice: 1,
      type_liasse: 'SN',
      statut: 'brouillon',
      annee: 2025,
      date_creation: '2025-06-15T10:00:00Z',
      titre: 'Liasse fiscale SN 2025',
    },
  ])

  // === ETATS FINANCIERS ===
  localDb.seed('etats_financiers', [
    {
      id: 1,
      liasse_id: 1,
      type: 'bilan_actif',
      nom: 'Bilan Actif',
      statut: 'brouillon',
    },
    {
      id: 2,
      liasse_id: 1,
      type: 'bilan_passif',
      nom: 'Bilan Passif',
      statut: 'brouillon',
    },
    {
      id: 3,
      liasse_id: 1,
      type: 'compte_resultat',
      nom: 'Compte de Resultat',
      statut: 'brouillon',
    },
  ])

  // === LIASSE CONFIGURATIONS ===
  localDb.seed('liasse_configurations', [
    {
      id: 1,
      code: 'SN_2017',
      nom: 'Configuration SN SYSCOHADA 2017',
      type_liasse: 'SN',
      is_default: true,
    },
  ])

  // === NOTIFICATIONS ===
  localDb.seed('notifications', [
    {
      id: 1,
      titre: 'Bienvenue sur FiscaSync Lite',
      message: 'Votre environnement local est pret. Toutes les donnees sont stockees dans le navigateur.',
      type: 'info',
      read: false,
      created_at: new Date().toISOString(),
    },
  ])

  // === DECLARATIONS FISCALES ===
  localDb.seed('declarations_fiscales', [
    {
      id: 1,
      entreprise: 1,
      type: 'TVA',
      periode: '2025-06',
      statut: 'brouillon',
      montant: 2500000,
      date_creation: '2025-07-01T00:00:00Z',
    },
  ])

  // === REGIMES FISCAUX ===
  localDb.seed('regimes_fiscaux', [
    { id: 1, code: 'RSI', nom: 'Regime Simplifie d\'Imposition', description: 'CA entre 50M et 150M XOF' },
    { id: 2, code: 'RN', nom: 'Regime Normal', description: 'CA superieur a 150M XOF' },
    { id: 3, code: 'SMT', nom: 'Systeme Minimal de Tresorerie', description: 'CA inferieur a 50M XOF' },
  ])

  // === IMPOTS ===
  localDb.seed('impots', [
    { id: 1, code: 'IS', nom: 'Impot sur les Societes', taux: 25, description: 'Taux standard IS en Cote d\'Ivoire' },
    { id: 2, code: 'TVA', nom: 'Taxe sur la Valeur Ajoutee', taux: 18, description: 'Taux TVA standard' },
    { id: 3, code: 'PATENTE', nom: 'Contribution des Patentes', taux: 0, description: 'Calculee sur le CA' },
  ])

  // === PARAMETRES SYSTEME ===
  localDb.seed('parametres_systeme', [
    { id: 1, cle: 'devise_defaut', valeur: 'XOF', description: 'Devise par defaut' },
    { id: 2, cle: 'pays_defaut', valeur: 'CI', description: 'Pays par defaut' },
    { id: 3, cle: 'langue', valeur: 'fr', description: 'Langue de l\'application' },
  ])

  // === PAYS ===
  localDb.seed('pays', [
    { id: 1, code: 'CI', nom: 'Cote d\'Ivoire', devise: 'XOF', zone: 'UEMOA' },
    { id: 2, code: 'SN', nom: 'Senegal', devise: 'XOF', zone: 'UEMOA' },
    { id: 3, code: 'ML', nom: 'Mali', devise: 'XOF', zone: 'UEMOA' },
    { id: 4, code: 'BF', nom: 'Burkina Faso', devise: 'XOF', zone: 'UEMOA' },
    { id: 5, code: 'CM', nom: 'Cameroun', devise: 'XAF', zone: 'CEMAC' },
    { id: 6, code: 'GA', nom: 'Gabon', devise: 'XAF', zone: 'CEMAC' },
    { id: 7, code: 'CG', nom: 'Congo', devise: 'XAF', zone: 'CEMAC' },
    { id: 8, code: 'CD', nom: 'RD Congo', devise: 'CDF', zone: 'OHADA' },
  ])

  // === DEVISES ===
  localDb.seed('devises', [
    { id: 1, code: 'XOF', nom: 'Franc CFA BCEAO', symbole: 'FCFA' },
    { id: 2, code: 'XAF', nom: 'Franc CFA BEAC', symbole: 'FCFA' },
    { id: 3, code: 'EUR', nom: 'Euro', symbole: '€' },
    { id: 4, code: 'USD', nom: 'Dollar americain', symbole: '$' },
  ])

  // === MEMBERS (org members) ===
  localDb.seed('members', [
    {
      id: 1,
      user_id: 1,
      organization_id: 1,
      role: 'owner',
      email: 'admin@fiscasync.com',
      first_name: 'Admin',
      last_name: 'FiscaSync',
      is_active: true,
      joined_at: '2025-01-01T00:00:00Z',
    },
  ])

  // === SUBSCRIPTIONS ===
  localDb.seed('subscriptions', [
    {
      id: 1,
      organization_id: 1,
      plan: 'professional',
      status: 'active',
      started_at: '2025-01-01T00:00:00Z',
      liasses_quota: 50,
    },
  ])

  // === AUDIT RULES ===
  localDb.seed('audit_rules', [
    { id: 1, code: 'R001', nom: 'Equilibre balance', description: 'Verifie que total debit = total credit', severity: 'error', is_active: true },
    { id: 2, code: 'R002', nom: 'Comptes sans mouvement', description: 'Detecte les comptes avec solde mais sans ecritures', severity: 'warning', is_active: true },
    { id: 3, code: 'R003', nom: 'Coherence bilan/resultat', description: 'Verifie la coherence entre bilan et compte de resultat', severity: 'error', is_active: true },
  ])

  console.log('✅ Local database seeded successfully')
}
