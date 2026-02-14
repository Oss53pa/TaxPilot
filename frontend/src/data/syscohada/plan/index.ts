/**
 * Plan Comptable SYSCOHADA Révisé - Index combiné
 * Re-exporte tous les comptes des 9 classes + fonctions helper
 */

import type { CompteComptable, ClasseSYSCOHADA } from '../types'
import { CLASSE_1_COMPTES } from './classe1'
import { CLASSE_2_COMPTES } from './classe2'
import { CLASSE_3_COMPTES } from './classe3'
import { CLASSE_4_COMPTES } from './classe4'
import { CLASSE_5_COMPTES } from './classe5'
import { CLASSE_6_COMPTES } from './classe6'
import { CLASSE_7_COMPTES } from './classe7'
import { CLASSE_8_COMPTES } from './classe8'
import { CLASSE_9_COMPTES } from './classe9'

// Re-export des types
export type { CompteComptable, ClasseSYSCOHADA } from '../types'

/** Métadonnées des 9 classes SYSCOHADA */
export const SYSCOHADA_REVISE_CLASSES: Record<number, ClasseSYSCOHADA> = {
  1: { numero: '1', libelle: 'COMPTES DE RESSOURCES DURABLES', description: 'Capitaux propres et dettes financières à long terme' },
  2: { numero: '2', libelle: 'COMPTES D\'ACTIF IMMOBILISE', description: 'Immobilisations incorporelles, corporelles et financières' },
  3: { numero: '3', libelle: 'COMPTES DE STOCKS', description: 'Stocks et en-cours de production' },
  4: { numero: '4', libelle: 'COMPTES DE TIERS', description: 'Créances et dettes d\'exploitation et hors exploitation' },
  5: { numero: '5', libelle: 'COMPTES DE TRESORERIE', description: 'Disponibilités et équivalents de trésorerie' },
  6: { numero: '6', libelle: 'COMPTES DE CHARGES DES ACTIVITES ORDINAIRES', description: 'Charges d\'exploitation, financières et exceptionnelles' },
  7: { numero: '7', libelle: 'COMPTES DE PRODUITS DES ACTIVITES ORDINAIRES', description: 'Produits d\'exploitation, financiers et exceptionnels' },
  8: { numero: '8', libelle: 'COMPTES DES AUTRES CHARGES ET DES AUTRES PRODUITS', description: 'HAO (Hors Activités Ordinaires) et participations' },
  9: { numero: '9', libelle: 'COMPTES DES ENGAGEMENTS HORS BILAN ET COMPTABILITE ANALYTIQUE', description: 'Engagements, analytique et comptes spéciaux' },
}

/** Plan comptable complet : tous les comptes des 9 classes combinés */
export const PLAN_SYSCOHADA_REVISE: CompteComptable[] = [
  ...CLASSE_1_COMPTES,
  ...CLASSE_2_COMPTES,
  ...CLASSE_3_COMPTES,
  ...CLASSE_4_COMPTES,
  ...CLASSE_5_COMPTES,
  ...CLASSE_6_COMPTES,
  ...CLASSE_7_COMPTES,
  ...CLASSE_8_COMPTES,
  ...CLASSE_9_COMPTES,
]

// --- Index rapide par numéro (construit une seule fois) ---
let _indexByNumero: Map<string, CompteComptable> | null = null

function getIndex(): Map<string, CompteComptable> {
  if (!_indexByNumero) {
    _indexByNumero = new Map(PLAN_SYSCOHADA_REVISE.map(c => [c.numero, c]))
  }
  return _indexByNumero
}

// --- Fonctions helper ---

/** Trouver un compte par son numéro exact */
export const getSYSCOHADAAccountByNumber = (numero: string): CompteComptable | undefined => {
  return getIndex().get(numero)
}

/** Trouver tous les comptes d'une classe */
export const getSYSCOHADAAccountsByClass = (classe: number): CompteComptable[] => {
  return PLAN_SYSCOHADA_REVISE.filter(c => c.classe === classe)
}

/** Trouver les comptes applicables à un secteur */
export const getSYSCOHADAAccountsBySector = (secteur: string): CompteComptable[] => {
  return PLAN_SYSCOHADA_REVISE.filter(c => !c.secteurs || c.secteurs.includes(secteur))
}

/** Valider qu'un numéro de compte existe dans le plan */
export const validateSYSCOHADAAccount = (numero: string): boolean => {
  return getIndex().has(numero)
}

/** Rechercher des comptes par numéro ou libellé */
export const searchSYSCOHADAAccounts = (query: string, options?: {
  classe?: number
  nature?: CompteComptable['nature']
  utilisation?: CompteComptable['utilisation']
  limit?: number
}): CompteComptable[] => {
  const q = query.toLowerCase().trim()
  if (!q) return []

  let results = PLAN_SYSCOHADA_REVISE.filter(c =>
    c.numero.includes(q) || c.libelle.toLowerCase().includes(q)
  )

  if (options?.classe !== undefined) {
    results = results.filter(c => c.classe === options.classe)
  }
  if (options?.nature) {
    results = results.filter(c => c.nature === options.nature)
  }
  if (options?.utilisation) {
    results = results.filter(c => c.utilisation === options.utilisation)
  }
  if (options?.limit) {
    results = results.slice(0, options.limit)
  }

  return results
}

/** Trouver le compte parent (2 chiffres) d'un compte */
export const getParentAccount = (numero: string): CompteComptable | undefined => {
  if (numero.length <= 2) return undefined
  for (let len = numero.length - 1; len >= 2; len--) {
    const parent = getIndex().get(numero.substring(0, len))
    if (parent) return parent
  }
  return undefined
}

/** Trouver les sous-comptes d'un compte donné */
export const getChildAccounts = (numero: string): CompteComptable[] => {
  return PLAN_SYSCOHADA_REVISE.filter(c =>
    c.numero.startsWith(numero) && c.numero !== numero && c.numero.length === numero.length + 1
  )
}

/** Obtenir les comptes obligatoires par classe */
export const getMandatoryAccounts = (classe?: number): CompteComptable[] => {
  let comptes = PLAN_SYSCOHADA_REVISE.filter(c => c.utilisation === 'OBLIGATOIRE')
  if (classe !== undefined) {
    comptes = comptes.filter(c => c.classe === classe)
  }
  return comptes
}

/** Trouver le compte OHADA le plus proche d'un numéro donné */
export const findClosestAccount = (numero: string): { numero: string; libelle: string; score: number } | null => {
  const index = getIndex()
  // 1. Correspondance exacte
  const exact = index.get(numero)
  if (exact) return { numero: exact.numero, libelle: exact.libelle, score: 1 }

  // 2. Correspondance par préfixes décroissants
  for (let len = Math.min(numero.length, 4); len >= 2; len--) {
    const prefix = numero.substring(0, len)
    const match = index.get(prefix)
    if (match) return { numero: match.numero, libelle: match.libelle, score: len / numero.length }
  }

  // 3. Correspondance par classe (premier chiffre)
  const classe = numero.charAt(0)
  const match = index.get(classe)
  if (match) return { numero: match.numero, libelle: match.libelle, score: 0.1 }

  return null
}

/** Exporter les comptes par classe (pour import paresseux) */
export {
  CLASSE_1_COMPTES,
  CLASSE_2_COMPTES,
  CLASSE_3_COMPTES,
  CLASSE_4_COMPTES,
  CLASSE_5_COMPTES,
  CLASSE_6_COMPTES,
  CLASSE_7_COMPTES,
  CLASSE_8_COMPTES,
  CLASSE_9_COMPTES,
}
