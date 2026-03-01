/**
 * Moteur d'execution d'audit
 * Orchestre l'execution des 108 controles par niveaux
 */

import {
  NiveauControle,
  ResultatControle,
  ResumeAudit,
  Severite,
  AuditContext,
  AuditProgressCallback,
  RapportCorrection,
  CorrectionItem,
  CompteModifie,
  SessionAudit,
  NIVEAUX_NOMS,
} from '@/types/audit.types'
import { controlRegistry } from './controlRegistry'

/**
 * Pause non bloquante entre les niveaux pour ne pas figer l'UI
 */
function yieldToUI(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(() => resolve())
    } else {
      setTimeout(resolve, 0)
    }
  })
}

/**
 * Execute tous les controles d'un niveau donne
 */
export async function runLevel(
  niveau: NiveauControle,
  context: AuditContext,
  callbacks?: Partial<AuditProgressCallback>
): Promise<ResultatControle[]> {
  const controls = controlRegistry.getByLevel(niveau)
  const resultats: ResultatControle[] = []

  callbacks?.onLevelStart?.(niveau, NIVEAUX_NOMS[niveau])

  for (let i = 0; i < controls.length; i++) {
    if (callbacks?.isCancelled?.()) break

    const { definition, execute } = controls[i]
    callbacks?.onProgress?.(niveau, i, controls.length, definition.ref)

    try {
      const result = execute(context)
      if (Array.isArray(result)) {
        resultats.push(...result)
      } else {
        resultats.push(result)
      }
    } catch (err) {
      resultats.push({
        ref: definition.ref,
        nom: definition.nom,
        niveau: definition.niveau,
        statut: 'ERREUR_EXEC',
        severite: 'INFO',
        message: `Erreur lors de l'execution: ${err instanceof Error ? err.message : String(err)}`,
        timestamp: new Date().toISOString(),
      })
    }
  }

  callbacks?.onLevelEnd?.(niveau, resultats)
  return resultats
}

/**
 * Phase 1 : Controles sur la balance (niveaux 0-5 + 8)
 */
export async function executePhase1(
  context: AuditContext,
  callbacks?: Partial<AuditProgressCallback>
): Promise<ResultatControle[]> {
  const niveaux: NiveauControle[] = [0, 1, 2, 3, 4, 5, 8]
  const allResultats: ResultatControle[] = []

  for (const niveau of niveaux) {
    if (callbacks?.isCancelled?.()) break

    const resultats = await runLevel(niveau, context, callbacks)
    allResultats.push(...resultats)

    // Pause entre les niveaux pour laisser l'UI respirer
    await yieldToUI()

    // Si des bloquants au niveau 0, on peut continuer mais les signaler
    // L'orchestrateur decidera s'il faut arreter
  }

  return allResultats
}

/**
 * Phase 3 : Controles sur les etats financiers (niveaux 6-7)
 */
export async function executePhase3(
  context: AuditContext,
  callbacks?: Partial<AuditProgressCallback>
): Promise<ResultatControle[]> {
  const niveaux: NiveauControle[] = [6, 7]
  const allResultats: ResultatControle[] = []

  for (const niveau of niveaux) {
    if (callbacks?.isCancelled?.()) break

    const resultats = await runLevel(niveau, context, callbacks)
    allResultats.push(...resultats)
    await yieldToUI()
  }

  return allResultats
}

/**
 * Calcule le resume a partir des resultats
 */
export function computeResume(resultats: ResultatControle[]): ResumeAudit {
  const parSeverite: Record<Severite, number> = {
    BLOQUANT: 0,
    MAJEUR: 0,
    MINEUR: 0,
    INFO: 0,
    OK: 0,
  }

  const parNiveauMap: Record<number, { total: number; ok: number; anomalies: number }> = {}

  for (const r of resultats) {
    parSeverite[r.severite]++

    if (!parNiveauMap[r.niveau]) {
      parNiveauMap[r.niveau] = { total: 0, ok: 0, anomalies: 0 }
    }
    parNiveauMap[r.niveau].total++
    if (r.statut === 'OK') {
      parNiveauMap[r.niveau].ok++
    } else if (r.statut === 'ANOMALIE') {
      parNiveauMap[r.niveau].anomalies++
    }
  }

  const totalControles = resultats.length
  // Weighted score: BLOQUANT=-10, MAJEUR=-5, MINEUR=-2, INFO=-1, OK=0
  // Start at 100 and deduct based on severity
  const penalites = parSeverite.BLOQUANT * 10 + parSeverite.MAJEUR * 5 + parSeverite.MINEUR * 2 + parSeverite.INFO * 1
  const maxPenalite = totalControles * 10  // Maximum possible penalty
  const scoreGlobal = totalControles > 0
    ? Math.max(0, Math.min(100, Math.round(100 - (penalites / maxPenalite) * 100)))
    : 0

  return {
    totalControles,
    parSeverite,
    parNiveau: parNiveauMap,
    scoreGlobal,
    bloquantsRestants: parSeverite.BLOQUANT,
  }
}

/**
 * Compare deux sessions et genere un rapport de corrections
 */
export function generateCorrectionReport(
  avant: SessionAudit,
  apres: SessionAudit
): RapportCorrection {
  const corrections: CorrectionItem[] = []

  // Construire un index des resultats "apres" par ref
  const apresMap = new Map<string, ResultatControle>()
  for (const r of apres.resultats) {
    apresMap.set(r.ref, r)
  }

  // Comparer chaque resultat "avant"
  for (const rAvant of avant.resultats) {
    const rApres = apresMap.get(rAvant.ref)
    if (!rApres) continue

    let evolution: CorrectionItem['evolution'] = 'INCHANGE'
    if (rAvant.statut === 'ANOMALIE' && rApres.statut === 'OK') {
      evolution = 'CORRIGE'
    } else if (
      rAvant.statut === 'ANOMALIE' &&
      rApres.statut === 'ANOMALIE' &&
      severityOrder(rApres.severite) < severityOrder(rAvant.severite)
    ) {
      evolution = 'AMELIORE'
    } else if (
      rAvant.statut === 'OK' &&
      rApres.statut === 'ANOMALIE'
    ) {
      evolution = 'DEGRADE'
    }

    if (evolution !== 'INCHANGE') {
      corrections.push({
        ref: rAvant.ref,
        nom: rAvant.nom,
        statutAvant: rAvant.statut,
        severiteAvant: rAvant.severite,
        statutApres: rApres.statut,
        severiteApres: rApres.severite,
        evolution,
      })
    }
  }

  // Comparer les balances pour trouver les comptes modifies
  const comptesModifies: CompteModifie[] = []
  // Ceci sera rempli par l'orchestrateur qui a acces aux snapshots

  return {
    id: `CORR-${Date.now()}`,
    sessionAvantId: avant.id,
    sessionApresId: apres.id,
    dateGeneration: new Date().toISOString(),
    corrections,
    comptesModifies,
    synthese: {
      bloquantsAvant: avant.resume.parSeverite.BLOQUANT,
      bloquantsApres: apres.resume.parSeverite.BLOQUANT,
      majeursAvant: avant.resume.parSeverite.MAJEUR,
      majeursApres: apres.resume.parSeverite.MAJEUR,
      scoreAvant: avant.resume.scoreGlobal,
      scoreApres: apres.resume.scoreGlobal,
    },
  }
}

function severityOrder(s: Severite): number {
  const order: Record<Severite, number> = {
    BLOQUANT: 4,
    MAJEUR: 3,
    MINEUR: 2,
    INFO: 1,
    OK: 0,
  }
  return order[s]
}
