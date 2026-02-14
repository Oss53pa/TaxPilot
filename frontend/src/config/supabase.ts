/**
 * Supabase Client — TaxPilot
 * Single instance used throughout the app
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase credentials missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env'
  )
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'fiscasync_supabase_auth', // Consistent with existing storage prefix
  },
})

// ============================================================
// Database types (mirrors SQL schema)
// ============================================================

export interface DbOrganisation {
  id: string
  nom: string
  slug: string
  plan: 'STARTER' | 'BUSINESS' | 'ENTERPRISE'
  created_at: string
  updated_at: string
}

export interface DbProfile {
  id: string
  organisation_id: string | null
  full_name: string | null
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface DbEntreprise {
  id: string
  organisation_id: string
  raison_sociale: string
  forme_juridique: string
  numero_contribuable: string
  rccm: string | null
  ifu: string | null
  adresse: string | null
  ville: string
  pays: string
  telephone: string | null
  email: string | null
  nom_dirigeant: string | null
  fonction_dirigeant: string | null
  regime_imposition: 'REEL_NORMAL' | 'REEL_SIMPLIFIE' | 'SYNTHETIQUE'
  centre_impots: string | null
  secteur_activite: string | null
  chiffre_affaires_annuel: number
  devise: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DbExercice {
  id: string
  entreprise_id: string
  code: string
  date_debut: string
  date_fin: string
  cloture: boolean
  is_current: boolean
  created_at: string
  updated_at: string
}

export interface DbBalance {
  id: string
  exercice_id: string
  nom_fichier: string | null
  date_import: string
  nb_lignes: number
  total_debit: number
  total_credit: number
  equilibree: boolean
  created_at: string
}

export interface DbLigneBalance {
  id: string
  balance_id: string
  numero_compte: string
  libelle: string
  debit_ouverture: number
  credit_ouverture: number
  debit_mouvement: number
  credit_mouvement: number
  debit_solde: number
  credit_solde: number
}

export interface DbLiasse {
  id: string
  exercice_id: string
  type_liasse: 'SN' | 'SMT' | 'CONSO' | 'BANQUE' | 'ASSURANCE' | 'MICROFINANCE' | 'EBNL'
  statut: 'BROUILLON' | 'VALIDEE' | 'DECLAREE' | 'ARCHIVEE'
  donnees_json: Record<string, unknown>
  score_validation: number
  date_generation: string | null
  date_validation: string | null
  date_declaration: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface DbDeclaration {
  id: string
  entreprise_id: string
  exercice_id: string | null
  type_declaration: 'IS' | 'TVA' | 'AIRSI' | 'IRC' | 'IRCM' | 'PATENTE' | 'IMF' | 'IGR' | 'CNPS'
  periode: string
  montant_base: number
  montant_impot: number
  montant_penalites: number
  date_limite: string
  date_depot: string | null
  statut: 'A_DEPOSER' | 'DEPOSEE' | 'PAYEE' | 'EN_RETARD'
  reference_depot: string | null
  donnees_json: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface DbEcritureJournal {
  id: string
  exercice_id: string
  numero_piece: string
  date_ecriture: string
  journal: string
  numero_compte: string
  libelle: string
  debit: number
  credit: number
  reference: string | null
  created_at: string
}

export interface DbAuditSession {
  id: string
  liasse_id: string | null
  balance_id: string | null
  score_global: number
  nb_anomalies: number
  nb_errors: number
  nb_warnings: number
  resultats_json: Record<string, unknown>
  created_by: string | null
  created_at: string
}
