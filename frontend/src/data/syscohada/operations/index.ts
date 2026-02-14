/**
 * Opérations Spécifiques SYSCOHADA - Index et Lazy Loader
 * 41 chapitres couvrant toutes les opérations comptables courantes
 */

import type { ChapitreOperations } from '../types'

/** Sommaire des 41 chapitres */
export const CHAPITRES_SOMMAIRE: { numero: number; titre: string }[] = [
  { numero: 1, titre: 'Constitution des sociétés' },
  { numero: 2, titre: 'Augmentation du capital' },
  { numero: 3, titre: 'Réduction et amortissement du capital' },
  { numero: 4, titre: 'Affectation du résultat' },
  { numero: 5, titre: 'Emprunts' },
  { numero: 6, titre: 'Subventions d\'investissement' },
  { numero: 7, titre: 'Provisions réglementées' },
  { numero: 8, titre: 'Provisions pour risques et charges' },
  { numero: 9, titre: 'Acquisitions d\'immobilisations incorporelles' },
  { numero: 10, titre: 'Acquisitions d\'immobilisations corporelles' },
  { numero: 11, titre: 'Amortissements des immobilisations' },
  { numero: 12, titre: 'Cessions d\'immobilisations' },
  { numero: 13, titre: 'Location-acquisition et crédit-bail' },
  { numero: 14, titre: 'Immobilisations financières' },
  { numero: 15, titre: 'Stocks : entrées' },
  { numero: 16, titre: 'Stocks : sorties et variations' },
  { numero: 17, titre: 'Dépréciation des stocks' },
  { numero: 18, titre: 'Achats et charges externes' },
  { numero: 19, titre: 'Opérations avec les fournisseurs' },
  { numero: 20, titre: 'Opérations avec les clients' },
  { numero: 21, titre: 'Charges de personnel' },
  { numero: 22, titre: 'État et impôts' },
  { numero: 23, titre: 'Opérations en devises' },
  { numero: 24, titre: 'Opérations de trésorerie' },
  { numero: 25, titre: 'Titres de placement' },
  { numero: 26, titre: 'Charges et produits constatés d\'avance' },
  { numero: 27, titre: 'Provisions pour dépréciation des créances' },
  { numero: 28, titre: 'Opérations inter-exercices' },
  { numero: 29, titre: 'Opérations HAO' },
  { numero: 30, titre: 'Détermination du résultat' },
  { numero: 31, titre: 'Opérations de consolidation' },
  { numero: 32, titre: 'Opérations en commun et GIE' },
  { numero: 33, titre: 'Contrats à long terme' },
  { numero: 34, titre: 'Concessions de service public' },
  { numero: 35, titre: 'Opérations faites pour le compte de tiers' },
  { numero: 36, titre: 'Dissolution et liquidation' },
  { numero: 37, titre: 'Fusion et scission' },
  { numero: 38, titre: 'Transformation de sociétés' },
  { numero: 39, titre: 'Comptabilité des exploitations agricoles' },
  { numero: 40, titre: 'Comptabilité des associations et EBNL' },
  { numero: 41, titre: 'Tableau des flux de trésorerie (TFT)' },
]

// Cache
const cache = new Map<number, ChapitreOperations>()

/** Charger un chapitre spécifique (lazy) */
export async function loadChapitre(numero: number): Promise<ChapitreOperations | undefined> {
  if (numero < 1 || numero > 41) return undefined
  if (cache.has(numero)) return cache.get(numero)!

  const pad = String(numero).padStart(2, '0')
  try {
    const mod = await import(`./chapitre${pad}.ts`)
    const key = `CHAPITRE_${pad}`
    const data: ChapitreOperations = mod[key]
    if (data) {
      cache.set(numero, data)
      return data
    }
  } catch {
    // Module not yet generated
  }
  return undefined
}

/** Trouver les chapitres liés à un numéro de compte */
export async function findChapitresByCompte(numero: string): Promise<ChapitreOperations[]> {
  const results: ChapitreOperations[] = []
  for (const { numero: chapNum } of CHAPITRES_SOMMAIRE) {
    const chapitre = await loadChapitre(chapNum)
    if (!chapitre) continue
    const match = chapitre.comptesLies.some(cl =>
      numero.startsWith(cl) || cl.startsWith(numero)
    )
    if (match) results.push(chapitre)
  }
  return results
}

/** Rechercher dans les opérations */
export async function searchOperations(query: string): Promise<ChapitreOperations[]> {
  const q = query.toLowerCase()
  const results: ChapitreOperations[] = []

  for (const { numero } of CHAPITRES_SOMMAIRE) {
    const chapitre = await loadChapitre(numero)
    if (!chapitre) continue

    if (
      chapitre.titre.toLowerCase().includes(q) ||
      chapitre.sections.some(s =>
        s.titre.toLowerCase().includes(q) || s.contenu.toLowerCase().includes(q)
      )
    ) {
      results.push(chapitre)
    }
  }

  return results
}

/** Vider le cache */
export function clearOperationsCache(): void {
  cache.clear()
}
