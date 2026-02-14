/**
 * Fonctionnement des comptes SYSCOHADA - Lazy loader
 * Charge les règles débit/crédit à la demande par classe
 */

import type { FonctionnementCompte } from '../types'

// Cache des données chargées
const cache = new Map<number, FonctionnementCompte[]>()

/** Charger le fonctionnement d'une classe (lazy) */
export async function loadFonctionnementClasse(classe: number): Promise<FonctionnementCompte[]> {
  if (cache.has(classe)) return cache.get(classe)!

  let data: FonctionnementCompte[]
  switch (classe) {
    case 1: data = (await import('./classe1')).FONCTIONNEMENT_CLASSE_1; break
    case 2: data = (await import('./classe2')).FONCTIONNEMENT_CLASSE_2; break
    case 3: data = (await import('./classe3')).FONCTIONNEMENT_CLASSE_3; break
    case 4: data = (await import('./classe4')).FONCTIONNEMENT_CLASSE_4; break
    case 5: data = (await import('./classe5')).FONCTIONNEMENT_CLASSE_5; break
    case 6: data = (await import('./classe6')).FONCTIONNEMENT_CLASSE_6; break
    case 7: data = (await import('./classe7')).FONCTIONNEMENT_CLASSE_7; break
    case 8: data = (await import('./classe8')).FONCTIONNEMENT_CLASSE_8; break
    case 9: data = (await import('./classe9')).FONCTIONNEMENT_CLASSE_9; break
    default: data = []
  }

  cache.set(classe, data)
  return data
}

/** Obtenir le fonctionnement d'un compte spécifique */
export async function getFonctionnement(numero: string): Promise<FonctionnementCompte | undefined> {
  const classe = parseInt(numero.charAt(0))
  if (isNaN(classe) || classe < 1 || classe > 9) return undefined

  const data = await loadFonctionnementClasse(classe)

  // Cherche par numéro exact, puis par préfixes décroissants
  let result = data.find(f => f.numero === numero)
  if (!result) {
    for (let len = Math.min(numero.length - 1, 3); len >= 2; len--) {
      result = data.find(f => f.numero === numero.substring(0, len))
      if (result) break
    }
  }
  return result
}

/** Rechercher dans le fonctionnement (contenu, commentaires) */
export async function searchFonctionnement(query: string): Promise<FonctionnementCompte[]> {
  const q = query.toLowerCase()
  const results: FonctionnementCompte[] = []

  for (let classe = 1; classe <= 9; classe++) {
    const data = await loadFonctionnementClasse(classe)
    for (const f of data) {
      if (
        f.numero.includes(q) ||
        f.contenu.toLowerCase().includes(q) ||
        f.commentaires.some(c => c.toLowerCase().includes(q)) ||
        f.fonctionnement.debit.some(d => d.description.toLowerCase().includes(q)) ||
        f.fonctionnement.credit.some(c => c.description.toLowerCase().includes(q))
      ) {
        results.push(f)
      }
    }
  }

  return results
}

/** Vider le cache (utile pour les tests) */
export function clearFonctionnementCache(): void {
  cache.clear()
}
