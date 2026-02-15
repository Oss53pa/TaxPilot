/**
 * Service de persistance localStorage pour les balances importées
 * Pattern identique à auditStorage.ts
 */

import type { BalanceEntry } from './liasseDataService'

const PREFIX = 'fiscasync_balance_'
const MAX_BALANCES = 5

export interface StoredBalance {
  id: string
  fileName: string
  importDate: string
  exercice: string
  entries: BalanceEntry[]
  totalDebit: number
  totalCredit: number
  ecart: number
  accountCount: number
}

export interface ImportRecord {
  id: string
  fileName: string
  importDate: string
  accountCount: number
  totalDebit: number
  totalCredit: number
  errors: number
  warnings: number
}

// ────────── Helpers ──────────

function getItem<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function setItem<T>(key: string, value: T): void {
  localStorage.setItem(PREFIX + key, JSON.stringify(value))
}

// ────────── Balance CRUD ──────────

export function saveImportedBalance(
  entries: BalanceEntry[],
  fileName: string,
  exercice?: string
): StoredBalance {
  const totalDebit = entries.reduce((s, e) => s + e.solde_debit, 0)
  const totalCredit = entries.reduce((s, e) => s + e.solde_credit, 0)

  const balance: StoredBalance = {
    id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    fileName,
    importDate: new Date().toISOString(),
    exercice: exercice || String(new Date().getFullYear()),
    entries,
    totalDebit,
    totalCredit,
    ecart: Math.abs(totalDebit - totalCredit),
    accountCount: entries.length,
  }

  // Maintain list of max N balances
  const list = getItem<StoredBalance[]>('list') || []
  list.unshift(balance)
  if (list.length > MAX_BALANCES) list.length = MAX_BALANCES
  setItem('list', list)

  // Also store as "latest" for quick access
  setItem('latest', balance)

  return balance
}

export function getLatestBalance(): StoredBalance | null {
  return getItem<StoredBalance>('latest')
}

export function getAllBalances(): StoredBalance[] {
  return getItem<StoredBalance[]>('list') || []
}

export function deleteBalance(id: string): void {
  const list = getItem<StoredBalance[]>('list') || []
  const filtered = list.filter(b => b.id !== id)
  setItem('list', filtered)

  const latest = getItem<StoredBalance>('latest')
  if (latest?.id === id) {
    setItem('latest', filtered[0] || null)
  }
}

// ────────── Import history ──────────

export function saveImportRecord(
  fileName: string,
  accountCount: number,
  totalDebit: number,
  totalCredit: number,
  errors: number,
  warnings: number
): ImportRecord {
  const record: ImportRecord = {
    id: Date.now().toString(36),
    fileName,
    importDate: new Date().toISOString(),
    accountCount,
    totalDebit,
    totalCredit,
    errors,
    warnings,
  }

  const history = getItem<ImportRecord[]>('history') || []
  history.unshift(record)
  if (history.length > 20) history.length = 20
  setItem('history', history)

  return record
}

export function getImportHistory(): ImportRecord[] {
  return getItem<ImportRecord[]>('history') || []
}

// ────────── Balance N-1 ──────────

export function saveImportedBalanceN1(
  entries: BalanceEntry[],
  fileName: string,
  exercice?: string
): StoredBalance {
  const totalDebit = entries.reduce((s, e) => s + e.solde_debit, 0)
  const totalCredit = entries.reduce((s, e) => s + e.solde_credit, 0)

  const balance: StoredBalance = {
    id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    fileName,
    importDate: new Date().toISOString(),
    exercice: exercice || String(new Date().getFullYear() - 1),
    entries,
    totalDebit,
    totalCredit,
    ecart: Math.abs(totalDebit - totalCredit),
    accountCount: entries.length,
  }

  setItem('latest_n1', balance)
  return balance
}

export function getLatestBalanceN1(): StoredBalance | null {
  return getItem<StoredBalance>('latest_n1')
}
