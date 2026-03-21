/**
 * Hook utilitaire pour accéder à la balance importée
 * Fournit les entries + helpers de calcul pour les composants liasse
 * Reactif aux changements d'exercice via l'event fiscasync:exercice-changed
 */

import { useMemo, useState, useEffect } from 'react'
import type { BalanceEntry } from '@/services/liasseDataService'
import { getLatestBalance, getLatestBalanceN1 } from '@/services/balanceStorageService'

function soldeD(e: BalanceEntry): number {
  // Use solde_debit/solde_credit when available (non-zero), otherwise fall back to movements
  const sd = e.solde_debit ?? 0
  const sc = e.solde_credit ?? 0
  if (sd !== 0 || sc !== 0) return sd - sc
  return (e.debit ?? 0) - (e.credit ?? 0)
}

function sumDebit(entries: BalanceEntry[], prefixes: string[]): number {
  return Math.round(
    entries
      .filter(e => prefixes.some(p => e.compte.startsWith(p)))
      .reduce((s, e) => s + Math.max(0, soldeD(e)), 0)
  )
}

function sumCredit(entries: BalanceEntry[], prefixes: string[]): number {
  return Math.round(
    entries
      .filter(e => prefixes.some(p => e.compte.startsWith(p)))
      .reduce((s, e) => s + Math.max(0, -soldeD(e)), 0)
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
  // N-1 helpers (prior year balance)
  hasN1: boolean
  dN1: (prefixes: string[]) => number   // solde débiteur N-1
  cN1: (prefixes: string[]) => number   // solde créditeur N-1
}

export function useBalanceData(): BalanceData {
  const [version, setVersion] = useState(0)

  useEffect(() => {
    const handler = () => setVersion(v => v + 1)
    window.addEventListener('fiscasync:exercice-changed', handler)
    window.addEventListener('fiscasync:balance-imported', handler)
    window.addEventListener('fiscasync:dossier-changed', handler)
    return () => {
      window.removeEventListener('fiscasync:exercice-changed', handler)
      window.removeEventListener('fiscasync:balance-imported', handler)
      window.removeEventListener('fiscasync:dossier-changed', handler)
    }
  }, [])

  return useMemo(() => {
    const stored = getLatestBalance()
    const entries = stored?.entries?.length ? stored.entries : []
    const usingImported = !!(stored?.entries?.length)
    const storedN1 = getLatestBalanceN1()
    const entriesN1 = storedN1?.entries?.length ? storedN1.entries : []
    return {
      entries,
      usingImported,
      d: (prefixes: string[]) => sumDebit(entries, prefixes),
      c: (prefixes: string[]) => sumCredit(entries, prefixes),
      accounts: (prefixes: string[]) => getAccounts(entries, prefixes),
      hasN1: entriesN1.length > 0,
      dN1: (prefixes: string[]) => sumDebit(entriesN1, prefixes),
      cN1: (prefixes: string[]) => sumCredit(entriesN1, prefixes),
    }
  }, [version])
}
