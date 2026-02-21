/**
 * Hook utilitaire pour accéder à la balance importée
 * Fournit les entries + helpers de calcul pour les composants liasse
 */

import { useMemo } from 'react'
import type { BalanceEntry } from '@/services/liasseDataService'
import { getLatestBalance } from '@/services/balanceStorageService'
import { MOCK_BALANCE } from '@/data/mockBalance'

function sumDebit(entries: BalanceEntry[], prefixes: string[]): number {
  return Math.round(
    entries
      .filter(e => prefixes.some(p => e.compte.startsWith(p)))
      .reduce((s, e) => s + Math.max(0, (e.solde_debit || e.debit || 0) - (e.solde_credit || e.credit || 0)), 0)
  )
}

function sumCredit(entries: BalanceEntry[], prefixes: string[]): number {
  return Math.round(
    entries
      .filter(e => prefixes.some(p => e.compte.startsWith(p)))
      .reduce((s, e) => s + Math.max(0, (e.solde_credit || e.credit || 0) - (e.solde_debit || e.debit || 0)), 0)
  )
}

function getAccounts(entries: BalanceEntry[], prefixes: string[]): BalanceEntry[] {
  return entries.filter(e => prefixes.some(p => e.compte.startsWith(p)))
}

export interface BalanceData {
  entries: BalanceEntry[]
  usingImported: boolean
  d: (prefixes: string[]) => number   // solde débiteur
  c: (prefixes: string[]) => number   // solde créditeur
  accounts: (prefixes: string[]) => BalanceEntry[]
}

export function useBalanceData(): BalanceData {
  return useMemo(() => {
    const stored = getLatestBalance()
    const entries = stored?.entries?.length ? stored.entries : MOCK_BALANCE
    const usingImported = !!(stored?.entries?.length)
    return {
      entries,
      usingImported,
      d: (prefixes: string[]) => sumDebit(entries, prefixes),
      c: (prefixes: string[]) => sumCredit(entries, prefixes),
      accounts: (prefixes: string[]) => getAccounts(entries, prefixes),
    }
  }, [])
}
