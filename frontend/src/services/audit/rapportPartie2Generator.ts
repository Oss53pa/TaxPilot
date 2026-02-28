/**
 * Generateur de Rapport Partie 2 (comparaison V1/V2)
 * Compare deux sessions d'audit pour identifier les anomalies corrigees,
 * non corrigees et nouvelles apres reimportation.
 */

import type {
  SessionAudit,
  RapportPartie2,
  RapportPartie2Item,
  CompteModifie,
} from '@/types/audit.types'
import type { BalanceEntry } from '@/services/liasseDataService'

/**
 * Genere un rapport Partie 2 comparant deux sessions d'audit (avant/apres reimportation)
 */
export function generateRapportPartie2(
  sessionAvant: SessionAudit,
  sessionApres: SessionAudit,
  balanceAvant: BalanceEntry[],
  balanceApres: BalanceEntry[]
): RapportPartie2 {
  const items: RapportPartie2Item[] = []

  // Build maps by ref for fast lookup
  const anomaliesV1 = new Map(
    sessionAvant.resultats
      .filter(r => r.statut === 'ANOMALIE')
      .map(r => [r.ref, r])
  )
  const anomaliesV2 = new Map(
    sessionApres.resultats
      .filter(r => r.statut === 'ANOMALIE')
      .map(r => [r.ref, r])
  )

  // For each V1 anomaly: check if still present in V2
  for (const [ref, v1] of anomaliesV1) {
    const v2 = anomaliesV2.get(ref)
    if (!v2) {
      // Absent in V2 -> corrige
      items.push({
        ref,
        nom: v1.nom,
        severiteV1: v1.severite,
        severiteV2: 'OK',
        evolution: 'corrige',
      })
    } else {
      // Still present in V2 -> non corrige
      items.push({
        ref,
        nom: v1.nom,
        severiteV1: v1.severite,
        severiteV2: v2.severite,
        evolution: 'non_corrige',
      })
    }
  }

  // For each V2 anomaly not present in V1 -> nouveau
  for (const [ref, v2] of anomaliesV2) {
    if (!anomaliesV1.has(ref)) {
      items.push({
        ref,
        nom: v2.nom,
        severiteV1: 'OK',
        severiteV2: v2.severite,
        evolution: 'nouveau',
      })
    }
  }

  // Sort: non_corrige first, then nouveau, then corrige
  const order = { non_corrige: 0, nouveau: 1, corrige: 2 }
  items.sort((a, b) => order[a.evolution] - order[b.evolution])

  // Compute comptes modifies (same pattern as reimportAndCompare)
  const comptesModifies: CompteModifie[] = []
  const oldMap = new Map(balanceAvant.map(l => [l.compte, l]))
  for (const newLine of balanceApres) {
    const oldLine = oldMap.get(newLine.compte)
    const newSolde = (newLine.solde_debit || 0) - (newLine.solde_credit || 0)
    const oldSolde = oldLine ? ((oldLine.solde_debit || 0) - (oldLine.solde_credit || 0)) : 0
    if (Math.abs(newSolde - oldSolde) > 0.01) {
      comptesModifies.push({
        compte: newLine.compte,
        libelle: newLine.intitule,
        soldeAvant: oldSolde,
        soldeApres: newSolde,
        ecart: newSolde - oldSolde,
      })
    }
  }

  // Synthese
  const corriges = items.filter(i => i.evolution === 'corrige').length
  const nonCorriges = items.filter(i => i.evolution === 'non_corrige').length
  const nouveaux = items.filter(i => i.evolution === 'nouveau').length
  const bloquantsRestants = items.filter(
    i => i.evolution !== 'corrige' && i.severiteV2 === 'BLOQUANT'
  ).length

  return {
    id: `RP2-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    sessionAvantId: sessionAvant.id,
    sessionApresId: sessionApres.id,
    dateGeneration: new Date().toISOString(),
    items,
    comptesModifies,
    synthese: {
      corriges,
      nonCorriges,
      nouveaux,
      bloquantsRestants,
      conforme: bloquantsRestants === 0,
    },
  }
}
