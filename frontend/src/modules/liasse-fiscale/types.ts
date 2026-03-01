import React from 'react'

export interface PageDef {
  id: string
  numero: number
  ongletExcel: string
  titre: string
  section: 'couverture' | 'fiches' | 'etats' | 'notes' | 'supplements' | 'gardes' | 'commentaire'
  component: React.LazyExoticComponent<React.ComponentType<PageProps>>
  orientation?: 'portrait' | 'landscape'
}

export interface PageProps {
  entreprise: EntrepriseData
  balance: BalanceEntry[]
  balanceN1?: BalanceEntry[]
  regime?: RegimeImposition
  onCellChange?: (ref: string, value: string | number) => void
  onNoteClick?: (noteNumber: string) => void
}

/** Maps a displayed note number (e.g. '3', '3D', '10') to the corresponding page ID */
export const NOTE_TO_PAGE_ID: Record<string, string> = {
  '3': 'note-3a', '3A': 'note-3a', '3B': 'note-3b', '3C': 'note-3c',
  '3C BIS': 'note-3c-bis', '3D': 'note-3d', '3E': 'note-3e',
  '4': 'note-04', '5': 'note-05', '6': 'note-06', '7': 'note-07',
  '8': 'note-08', '8A': 'note-8a', '8B': 'note-8b', '8C': 'note-8c',
  '9': 'note-09', '10': 'note-10', '11': 'note-11', '12': 'note-12',
  '13': 'note-13', '14': 'note-14', '15A': 'note-15a', '15B': 'note-15b',
  '16A': 'note-16a', '16B': 'note-16b', '16C': 'note-16c',
  '17': 'note-17', '18': 'note-18', '19': 'note-19', '20': 'note-20',
  '21': 'note-21', '22': 'note-22', '23': 'note-23', '24': 'note-24',
  '25': 'note-25', '26': 'note-26', '27A': 'note-27a', '27B': 'note-27b',
  '28': 'note-28', '29': 'note-29', '30': 'note-30', '31': 'note-31',
  '32': 'note-32', '33': 'note-33', '34': 'note-34', '35': 'note-35',
  '37': 'note-37', '38': 'note-38', '39': 'note-39',
}

export interface EntrepriseData {
  denomination: string
  sigle: string
  adresse: string
  ncc: string
  ntd: string
  exercice_clos: string
  exercice_precedent_fin: string
  duree_mois: number
  regime: string
  forme_juridique: string
  code_forme_juridique: string
  code_regime: string
  code_pays: string
  centre_depot: string
  ville: string
  boite_postale: string
  capital_social: number
  nom_dirigeant: string
  fonction_dirigeant: string
  greffe: string
  numero_repertoire_entites: string
  numero_caisse_sociale: string
  numero_code_importateur: string
  code_ville: string
  pourcentage_capacite_production: number
  branche_activite: string
  code_secteur: string
  nombre_etablissements: number
  effectif_permanent: number
  effectif_temporaire: number
  effectif_debut: number
  effectif_fin: number
  masse_salariale: number
  nom_groupe: string
  pays_siege_groupe: string
  cac_nom: string
  cac_adresse: string
  cac_numero_inscription: string
  expert_nom: string
  expert_adresse: string
  expert_numero_inscription: string
  personne_contact: string
  etats_financiers_approuves: boolean
  date_signature_etats: string
  domiciliations_bancaires: { banque: string; numero_compte: string }[]
  dirigeants: DirigeantInfo[]
  commissaires_comptes: CommissaireInfo[]
  participations_filiales: ParticipationInfo[]
}

export interface DirigeantInfo {
  qualite: string
  nom: string
  prenoms: string
  adresse: string
  date_nomination: string
  duree_mandat: string
}

export interface CommissaireInfo {
  nom: string
  prenoms: string
  cabinet: string
  adresse: string
  numero_ordre: string
  date_nomination: string
  duree_mandat: string
  honoraires: number
}

export interface ParticipationInfo {
  raison_sociale: string
  forme_juridique: string
  capital: number
  pourcentage_participation: number
  resultat_dernier_exercice: number
}

export interface BalanceEntry {
  compte: string
  libelle: string
  debit: number
  credit: number
  solde_debit: number
  solde_credit: number
}

export type SectionKey = PageDef['section']

export const SECTION_LABELS: Record<SectionKey, string> = {
  couverture: 'Couverture & Garde',
  fiches: 'Fiches R',
  etats: 'États financiers',
  notes: 'Notes annexes',
  supplements: 'Suppléments',
  gardes: 'Gardes',
  commentaire: 'Commentaire',
}

// ── Régimes d'imposition ──

export type RegimeImposition = 'REEL_NORMAL' | 'REEL_SIMPLIFIE' | 'FORFAITAIRE' | 'MICRO_ENTREPRISE' | 'SMT'

export interface RegimeDef {
  code: RegimeImposition
  label: string
  description: string
  obligatoires: Set<string>  // page IDs obligatoires
}

// Pages obligatoires/applicables pour chaque régime
// Pour la Fiche R4, toutes les notes présentes dans le régime sont marquées "A" (Applicable)
const OBLIGATOIRES_REEL_NORMAL = new Set([
  // Structure
  'couverture', 'garde', 'recevabilite',
  'note36-codes', 'fiche-r1', 'fiche-r2', 'fiche-r3',
  'bilan', 'actif', 'passif', 'resultat', 'tft', 'fiche-r4',
  // Notes 1-2
  'note-01', 'note-02',
  // Notes 3A-3E (immobilisations)
  'note-3a', 'note-3b', 'note-3c', 'note-3c-bis', 'note-3d', 'note-3e',
  // Notes 4-7
  'note-04', 'note-05', 'note-06', 'note-07',
  // Notes 8, 8A-8C
  'note-08', 'note-8a', 'note-8b', 'note-8c',
  // Notes 9-14
  'note-09', 'note-10', 'note-11', 'note-12', 'note-13', 'note-14',
  // Notes 15A-15B
  'note-15a', 'note-15b',
  // Notes 16A-16C
  'note-16a', 'note-16b', 'note-16b-bis', 'note-16c',
  // Notes 17-26
  'note-17', 'note-18', 'note-19', 'note-20', 'note-21', 'note-22',
  'note-23', 'note-24', 'note-25', 'note-26',
  // Notes 27A-27B
  'note-27a', 'note-27b',
  // Notes 28-35
  'note-28', 'note-29', 'note-30', 'note-31', 'note-32', 'note-33', 'note-34', 'note-35',
  // Notes supplementaires 37-39
  'note-37', 'note-38', 'note-39',
])

const OBLIGATOIRES_REEL_SIMPLIFIE = new Set([
  // Structure
  'couverture', 'garde', 'recevabilite',
  'fiche-r1', 'fiche-r2', 'fiche-r3',
  'bilan', 'actif', 'passif', 'resultat', 'fiche-r4',
  // Notes applicables au Système Allégé (NS dans liasse-pages-config)
  'note-01', 'note-02',
  'note-3a', 'note-3b', 'note-3c', 'note-3c-bis', 'note-3d', 'note-3e',
  'note-04', 'note-05', 'note-06', 'note-07',
  'note-08', 'note-8a', 'note-8b', 'note-8c',
  'note-09', 'note-10', 'note-11', 'note-12', 'note-13', 'note-14',
  'note-15a', 'note-15b',
  'note-16a',
  'note-17', 'note-18', 'note-19', 'note-20', 'note-22',
  'note-27a', 'note-27b',
  'note-31',
])

const OBLIGATOIRES_FORFAITAIRE = new Set([
  'couverture', 'garde', 'recevabilite',
  'fiche-r1', 'fiche-r2',
  'bilan', 'resultat',
  'garde-bic',
])

const OBLIGATOIRES_MICRO_ENTREPRISE = new Set([
  'couverture', 'garde', 'recevabilite',
  'fiche-r1', 'fiche-r2',
  'bilan', 'resultat',
])

const OBLIGATOIRES_SMT = new Set([
  'couverture', 'garde', 'recevabilite',
  'fiche-r1', 'fiche-r2',
  'bilan', 'resultat',
])

export const REGIMES: RegimeDef[] = [
  { code: 'REEL_NORMAL', label: 'Réel Normal', description: 'Système Normal SYSCOHADA', obligatoires: OBLIGATOIRES_REEL_NORMAL },
  { code: 'REEL_SIMPLIFIE', label: 'Réel Simplifié', description: 'Système Allégé SYSCOHADA', obligatoires: OBLIGATOIRES_REEL_SIMPLIFIE },
  { code: 'FORFAITAIRE', label: 'Forfaitaire', description: 'Régime du forfait', obligatoires: OBLIGATOIRES_FORFAITAIRE },
  { code: 'MICRO_ENTREPRISE', label: 'Micro-entreprise', description: 'Régime micro-entreprise', obligatoires: OBLIGATOIRES_MICRO_ENTREPRISE },
  { code: 'SMT', label: 'SMT', description: 'Système Minimal de Trésorerie', obligatoires: OBLIGATOIRES_SMT },
]

export const getRegime = (code: RegimeImposition): RegimeDef =>
  REGIMES.find(r => r.code === code) || REGIMES[0]
