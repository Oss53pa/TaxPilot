/**
 * Service de comparaison N vs N-1
 * Orchestre les controles COMP et persiste les rapports
 */

import type { ResultatControle } from '@/types/audit.types'
import type { BalanceEntry } from '@/services/liasseDataService'
import { runComparisonControls } from './audit/controls/comparisonControls'
import { getBalancesForExercice } from './balanceStorageService'

const STORAGE_PREFIX = 'fiscasync_comparison_'

export interface ComparisonReport {
  id: string
  exerciceN: string
  exerciceN1: string
  dateGeneration: string
  resultats: ResultatControle[]
  synthese: {
    total: number
    ok: number
    anomalies: number
    bloquants: number
    majeurs: number
    mineurs: number
    info: number
  }
  balanceNId: string
  balanceN1Id: string
}

function computeSynthese(resultats: ResultatControle[]): ComparisonReport['synthese'] {
  return {
    total: resultats.length,
    ok: resultats.filter(r => r.statut === 'OK').length,
    anomalies: resultats.filter(r => r.statut === 'ANOMALIE').length,
    bloquants: resultats.filter(r => r.severite === 'BLOQUANT' && r.statut === 'ANOMALIE').length,
    majeurs: resultats.filter(r => r.severite === 'MAJEUR' && r.statut === 'ANOMALIE').length,
    mineurs: resultats.filter(r => r.severite === 'MINEUR' && r.statut === 'ANOMALIE').length,
    info: resultats.filter(r => r.severite === 'INFO' && r.statut === 'ANOMALIE').length,
  }
}

/**
 * Execute la comparaison N vs N-1 pour un exercice donne
 * Retourne null si pas de balance N ou N-1
 */
export function runComparison(exerciceN: string): ComparisonReport | null {
  const anneeN1 = String(parseInt(exerciceN) - 1)

  const balancesN = getBalancesForExercice(exerciceN)
  const balancesN1 = getBalancesForExercice(anneeN1)

  if (balancesN.length === 0) return null
  if (balancesN1.length === 0) return null

  const balN = balancesN[0]
  const balN1 = balancesN1[0]

  const resultats = runComparisonControls(balN.entries, balN1.entries)

  const report: ComparisonReport = {
    id: `comp_${exerciceN}_${Date.now().toString(36)}`,
    exerciceN,
    exerciceN1: anneeN1,
    dateGeneration: new Date().toISOString(),
    resultats,
    synthese: computeSynthese(resultats),
    balanceNId: balN.id,
    balanceN1Id: balN1.id,
  }

  saveComparisonReport(report)
  return report
}

/**
 * Execute la comparaison avec des balances fournies directement
 */
export function runComparisonWithBalances(
  exerciceN: string,
  entriesN: BalanceEntry[],
  entriesN1: BalanceEntry[],
  balanceNId: string,
  balanceN1Id: string,
): ComparisonReport {
  const anneeN1 = String(parseInt(exerciceN) - 1)
  const resultats = runComparisonControls(entriesN, entriesN1)

  const report: ComparisonReport = {
    id: `comp_${exerciceN}_${Date.now().toString(36)}`,
    exerciceN,
    exerciceN1: anneeN1,
    dateGeneration: new Date().toISOString(),
    resultats,
    synthese: computeSynthese(resultats),
    balanceNId,
    balanceN1Id,
  }

  saveComparisonReport(report)
  return report
}

export function saveComparisonReport(report: ComparisonReport): void {
  localStorage.setItem(STORAGE_PREFIX + report.exerciceN, JSON.stringify(report))
}

export function getComparisonReport(exerciceN: string): ComparisonReport | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + exerciceN)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function deleteComparisonReport(exerciceN: string): void {
  localStorage.removeItem(STORAGE_PREFIX + exerciceN)
}

/**
 * Verifie si une comparaison est possible pour un exercice donne
 */
export function canCompare(exerciceN: string): boolean {
  const anneeN1 = String(parseInt(exerciceN) - 1)
  return getBalancesForExercice(exerciceN).length > 0 && getBalancesForExercice(anneeN1).length > 0
}
