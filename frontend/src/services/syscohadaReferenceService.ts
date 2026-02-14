/**
 * Service de Référence SYSCOHADA Révisé
 * Recherche unifiée dans le plan comptable, le fonctionnement et les opérations
 */

import type { CompteComptable, FonctionnementCompte, ChapitreOperations } from '../data/syscohada/types'
import {
  PLAN_SYSCOHADA_REVISE,
  getSYSCOHADAAccountByNumber,
  getSYSCOHADAAccountsByClass,
  searchSYSCOHADAAccounts,
  getParentAccount,
  getChildAccounts,
  validateSYSCOHADAAccount,
} from '../data/syscohada/plan'
import { getFonctionnement, searchFonctionnement } from '../data/syscohada/fonctionnement'
import { loadChapitre, findChapitresByCompte, searchOperations, CHAPITRES_SOMMAIRE } from '../data/syscohada/operations'

/** Détail complet d'un compte */
export interface AccountDetail {
  compte: CompteComptable
  parent?: CompteComptable
  children: CompteComptable[]
  fonctionnement?: FonctionnementCompte
  chapitresLies: ChapitreOperations[]
}

/** Résultat de recherche globale */
export interface SearchResult {
  type: 'compte' | 'fonctionnement' | 'operation'
  compte?: CompteComptable
  fonctionnement?: FonctionnementCompte
  chapitre?: ChapitreOperations
  score: number
  highlight: string
}

class SYSCOHADAReferenceService {
  /** Obtenir le détail complet d'un compte */
  async getAccountDetail(numero: string): Promise<AccountDetail | null> {
    const compte = getSYSCOHADAAccountByNumber(numero)
    if (!compte) return null

    const [fonctionnement, chapitresLies] = await Promise.all([
      getFonctionnement(numero),
      findChapitresByCompte(numero),
    ])

    return {
      compte,
      parent: getParentAccount(numero),
      children: getChildAccounts(numero),
      fonctionnement,
      chapitresLies,
    }
  }

  /** Recherche globale dans tout le référentiel SYSCOHADA */
  async search(query: string, options?: { limit?: number }): Promise<SearchResult[]> {
    const limit = options?.limit ?? 50
    const results: SearchResult[] = []
    const q = query.toLowerCase().trim()
    if (!q) return []

    // 1. Recherche dans le plan comptable
    const comptes = searchSYSCOHADAAccounts(q, { limit: 20 })
    for (const compte of comptes) {
      const score = compte.numero.includes(q) ? 10 : 5
      results.push({
        type: 'compte',
        compte,
        score,
        highlight: `${compte.numero} - ${compte.libelle}`,
      })
    }

    // 2. Recherche dans le fonctionnement
    const fonctionnements = await searchFonctionnement(q)
    for (const f of fonctionnements.slice(0, 15)) {
      // Skip if already found as a compte result
      if (results.some(r => r.type === 'compte' && r.compte?.numero === f.numero)) continue
      results.push({
        type: 'fonctionnement',
        fonctionnement: f,
        compte: getSYSCOHADAAccountByNumber(f.numero),
        score: 3,
        highlight: `${f.numero} - ${f.contenu.substring(0, 100)}...`,
      })
    }

    // 3. Recherche dans les opérations
    const operations = await searchOperations(q)
    for (const chapitre of operations.slice(0, 10)) {
      results.push({
        type: 'operation',
        chapitre,
        score: 2,
        highlight: `Chapitre ${chapitre.numero} - ${chapitre.titre}`,
      })
    }

    // Tri par score décroissant
    results.sort((a, b) => b.score - a.score)

    return results.slice(0, limit)
  }

  /** Trouver les chapitres liés à un compte */
  async findRelatedChapters(numero: string): Promise<ChapitreOperations[]> {
    return findChapitresByCompte(numero)
  }

  /** Charger un chapitre d'opérations par numéro */
  async getChapitre(numero: number): Promise<ChapitreOperations | undefined> {
    return loadChapitre(numero)
  }

  /** Obtenir le sommaire des 41 chapitres */
  getChapitresSommaire() {
    return CHAPITRES_SOMMAIRE
  }

  /** Obtenir les statistiques du plan */
  getStats() {
    const total = PLAN_SYSCOHADA_REVISE.length
    const obligatoires = PLAN_SYSCOHADA_REVISE.filter(c => c.utilisation === 'OBLIGATOIRE').length
    const facultatifs = PLAN_SYSCOHADA_REVISE.filter(c => c.utilisation === 'FACULTATIF').length
    const parClasse: Record<number, number> = {}
    for (let i = 1; i <= 9; i++) {
      parClasse[i] = getSYSCOHADAAccountsByClass(i).length
    }
    return { total, obligatoires, facultatifs, parClasse, chapitresOperations: 41 }
  }

  /** Valider un numéro de compte */
  isValidAccount(numero: string): boolean {
    return validateSYSCOHADAAccount(numero)
  }

  /** Trouver le compte OHADA le plus proche d'un numéro inconnu */
  findClosestAccount(numero: string): { compte: CompteComptable; score: number } | null {
    // Correspondance par préfixes décroissants
    for (let len = Math.min(numero.length, 4); len >= 2; len--) {
      const prefix = numero.substring(0, len)
      const match = getSYSCOHADAAccountByNumber(prefix)
      if (match) {
        return { compte: match, score: len / numero.length }
      }
    }
    return null
  }
}

export const syscohadaReferenceService = new SYSCOHADAReferenceService()
export default syscohadaReferenceService
