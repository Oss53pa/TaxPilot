/**
 * Service de persistance localStorage pour le rapprochement bancaire
 * Pattern identique a balanceStorageService.ts
 */

import { scopeKey } from './dossierScopeService'

const PREFIX = 'fiscasync_bankfeed_'

// ────────── Interfaces ──────────

export interface BankAccount {
  id: string
  bankName: string
  accountNumber: string
  accountLabel: string
  compteComptable: string // 521x
  currency: string
  solde: number
  lastImportDate?: string
  createdAt: string
}

export interface BankTransaction {
  id: string
  bankAccountId: string
  date: string
  label: string
  reference: string
  amount: number // positif = credit, negatif = debit
  reconciled: boolean
  compteComptable: string | null
  suggestedCompte: string | null
  suggestionConfidence: number
  source: 'OFX' | 'CAMT053' | 'CSV' | 'MANUAL'
  reconciledAt?: string
  createdAt: string
}

export interface MappingRule {
  id: string
  keywords: string[]
  compteComptable: string
  compteLabel: string
  priority: number
  isDefault: boolean
  createdAt: string
}

export interface ReconciliationSession {
  id: string
  bankAccountId: string
  date: string
  soldeBanque: number
  soldeComptable: number
  ecart: number
  transactionsReconciled: number
  transactionsTotal: number
  status: 'en_cours' | 'terminee' | 'ecart'
}

// ────────── Default OHADA mapping rules ──────────

const DEFAULT_MAPPING_RULES: Omit<MappingRule, 'id' | 'createdAt'>[] = [
  { keywords: ['loyer', 'bail', 'location'], compteComptable: '6132', compteLabel: 'Locations immobilieres', priority: 10, isDefault: true },
  { keywords: ['salaire', 'paie', 'remuneration'], compteComptable: '6611', compteLabel: 'Remunerations du personnel national', priority: 10, isDefault: true },
  { keywords: ['dgi', 'impot', 'fiscal', 'taxe'], compteComptable: '6461', compteLabel: 'Droits d\'enregistrement', priority: 10, isDefault: true },
  { keywords: ['electricite', 'cie', 'energie'], compteComptable: '6051', compteLabel: 'Fournitures non stockables - Eau, electricite', priority: 10, isDefault: true },
  { keywords: ['eau', 'sodeci'], compteComptable: '6051', compteLabel: 'Fournitures non stockables - Eau', priority: 9, isDefault: true },
  { keywords: ['telephone', 'mtn', 'orange', 'moov', 'telecom'], compteComptable: '6281', compteLabel: 'Frais de telephone', priority: 10, isDefault: true },
  { keywords: ['assurance', 'sunu', 'nsia'], compteComptable: '6162', compteLabel: 'Primes d\'assurance', priority: 10, isDefault: true },
  { keywords: ['banque', 'frais bancaire', 'commission', 'agios'], compteComptable: '6311', compteLabel: 'Frais bancaires', priority: 8, isDefault: true },
  { keywords: ['carburant', 'essence', 'gasoil', 'total', 'station'], compteComptable: '6055', compteLabel: 'Fournitures de bureau - Carburant', priority: 10, isDefault: true },
  { keywords: ['fourniture', 'bureau', 'papeterie'], compteComptable: '6054', compteLabel: 'Fournitures de bureau', priority: 9, isDefault: true },
  { keywords: ['transport', 'fret', 'livraison'], compteComptable: '6131', compteLabel: 'Transports de biens', priority: 9, isDefault: true },
  { keywords: ['entretien', 'reparation', 'maintenance'], compteComptable: '6241', compteLabel: 'Entretien et reparations', priority: 9, isDefault: true },
  { keywords: ['client', 'vente', 'facture', 'reglement client'], compteComptable: '4111', compteLabel: 'Clients', priority: 7, isDefault: true },
  { keywords: ['fournisseur', 'achat', 'reglement fournisseur'], compteComptable: '4011', compteLabel: 'Fournisseurs', priority: 7, isDefault: true },
]

// ────────── Helpers ──────────

function getItem<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(scopeKey(PREFIX + key))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function setItem<T>(key: string, value: T): void {
  localStorage.setItem(scopeKey(PREFIX + key), JSON.stringify(value))
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 6)
}

// ────────── Bank Account CRUD ──────────

export function saveBankAccount(account: Omit<BankAccount, 'id' | 'createdAt'>): BankAccount {
  const newAccount: BankAccount = {
    ...account,
    id: generateId(),
    createdAt: new Date().toISOString(),
  }
  const list = getItem<BankAccount[]>('accounts') || []
  list.unshift(newAccount)
  setItem('accounts', list)
  window.dispatchEvent(new CustomEvent('fiscasync:bankfeed-account-saved'))
  return newAccount
}

export function getAllBankAccounts(): BankAccount[] {
  return getItem<BankAccount[]>('accounts') || []
}

export function getBankAccount(id: string): BankAccount | null {
  const list = getAllBankAccounts()
  return list.find(a => a.id === id) || null
}

export function updateBankAccount(id: string, updates: Partial<BankAccount>): void {
  const list = getItem<BankAccount[]>('accounts') || []
  const idx = list.findIndex(a => a.id === id)
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...updates }
    setItem('accounts', list)
    window.dispatchEvent(new CustomEvent('fiscasync:bankfeed-account-saved'))
  }
}

export function deleteBankAccount(id: string): void {
  const list = getItem<BankAccount[]>('accounts') || []
  setItem('accounts', list.filter(a => a.id !== id))
  // Also delete associated transactions
  const txns = getItem<BankTransaction[]>('transactions') || []
  setItem('transactions', txns.filter(t => t.bankAccountId !== id))
  window.dispatchEvent(new CustomEvent('fiscasync:bankfeed-account-deleted'))
}

// ────────── Transaction CRUD ──────────

export function saveTransactions(transactions: Omit<BankTransaction, 'id' | 'createdAt'>[]): BankTransaction[] {
  const existing = getItem<BankTransaction[]>('transactions') || []
  const newTxns: BankTransaction[] = transactions.map(t => ({
    ...t,
    id: generateId(),
    createdAt: new Date().toISOString(),
  }))
  const merged = [...newTxns, ...existing]
  setItem('transactions', merged)

  // Update bank account last import date and solde
  if (newTxns.length > 0) {
    const accountId = newTxns[0].bankAccountId
    const accountTxns = merged.filter(t => t.bankAccountId === accountId)
    const solde = accountTxns.reduce((s, t) => s + t.amount, 0)
    updateBankAccount(accountId, { lastImportDate: new Date().toISOString(), solde })
  }

  window.dispatchEvent(new CustomEvent('fiscasync:bankfeed-transactions-imported', {
    detail: { count: newTxns.length }
  }))
  return newTxns
}

export function getTransactions(filters?: {
  bankAccountId?: string
  reconciled?: boolean
  dateFrom?: string
  dateTo?: string
  search?: string
}): BankTransaction[] {
  let list = getItem<BankTransaction[]>('transactions') || []
  if (filters?.bankAccountId) list = list.filter(t => t.bankAccountId === filters.bankAccountId)
  if (filters?.reconciled !== undefined) list = list.filter(t => t.reconciled === filters.reconciled)
  if (filters?.dateFrom) list = list.filter(t => t.date >= filters.dateFrom!)
  if (filters?.dateTo) list = list.filter(t => t.date <= filters.dateTo!)
  if (filters?.search) {
    const s = filters.search.toLowerCase()
    list = list.filter(t => t.label.toLowerCase().includes(s) || t.reference.toLowerCase().includes(s))
  }
  return list.sort((a, b) => b.date.localeCompare(a.date))
}

export function reconcileTransaction(transactionId: string, compteComptable: string): void {
  const list = getItem<BankTransaction[]>('transactions') || []
  const txn = list.find(t => t.id === transactionId)
  if (txn) {
    txn.reconciled = true
    txn.compteComptable = compteComptable
    txn.reconciledAt = new Date().toISOString()
    setItem('transactions', list)
    window.dispatchEvent(new CustomEvent('fiscasync:bankfeed-reconciled'))
  }
}

export function unreconcileTransaction(transactionId: string): void {
  const list = getItem<BankTransaction[]>('transactions') || []
  const txn = list.find(t => t.id === transactionId)
  if (txn) {
    txn.reconciled = false
    txn.compteComptable = null
    txn.reconciledAt = undefined
    setItem('transactions', list)
  }
}

// ────────── Mapping Rules ──────────

export function getMappingRules(): MappingRule[] {
  const custom = getItem<MappingRule[]>('mapping_rules')
  if (custom && custom.length > 0) return custom
  // Initialize with defaults
  const defaults: MappingRule[] = DEFAULT_MAPPING_RULES.map(r => ({
    ...r,
    id: generateId(),
    createdAt: new Date().toISOString(),
  }))
  setItem('mapping_rules', defaults)
  return defaults
}

export function saveMappingRule(rule: Omit<MappingRule, 'id' | 'createdAt'>): MappingRule {
  const newRule: MappingRule = {
    ...rule,
    id: generateId(),
    createdAt: new Date().toISOString(),
  }
  const list = getMappingRules()
  list.push(newRule)
  setItem('mapping_rules', list)
  return newRule
}

export function deleteMappingRule(id: string): void {
  const list = getMappingRules()
  setItem('mapping_rules', list.filter(r => r.id !== id))
}

// ────────── Auto-suggestion ──────────

export function suggestOHADAAccount(label: string): { compteComptable: string; compteLabel: string; confidence: number } | null {
  const rules = getMappingRules().sort((a, b) => b.priority - a.priority)
  const lower = label.toLowerCase()

  for (const rule of rules) {
    const matchCount = rule.keywords.filter(kw => lower.includes(kw.toLowerCase())).length
    if (matchCount > 0) {
      const confidence = Math.min(0.5 + matchCount * 0.2, 0.95)
      return {
        compteComptable: rule.compteComptable,
        compteLabel: rule.compteLabel,
        confidence,
      }
    }
  }
  return null
}

export function autoReconcileByRules(bankAccountId: string, confidenceThreshold = 0.6): {
  reconciled: number
  skipped: number
} {
  const txns = getTransactions({ bankAccountId, reconciled: false })
  let reconciled = 0
  let skipped = 0

  for (const txn of txns) {
    const suggestion = suggestOHADAAccount(txn.label)
    if (suggestion && suggestion.confidence >= confidenceThreshold) {
      reconcileTransaction(txn.id, suggestion.compteComptable)
      reconciled++
    } else {
      skipped++
    }
  }

  // Save reconciliation session
  saveReconciliationSession(bankAccountId)

  return { reconciled, skipped }
}

// ────────── Reconciliation Sessions ──────────

export function saveReconciliationSession(bankAccountId: string): ReconciliationSession {
  const allTxns = getTransactions({ bankAccountId })
  const reconciledTxns = allTxns.filter(t => t.reconciled)
  const soldeBanque = allTxns.reduce((s, t) => s + t.amount, 0)
  const soldeComptable = reconciledTxns.reduce((s, t) => s + t.amount, 0)
  const ecart = Math.abs(soldeBanque - soldeComptable)

  const session: ReconciliationSession = {
    id: generateId(),
    bankAccountId,
    date: new Date().toISOString(),
    soldeBanque,
    soldeComptable,
    ecart,
    transactionsReconciled: reconciledTxns.length,
    transactionsTotal: allTxns.length,
    status: ecart === 0 && reconciledTxns.length === allTxns.length ? 'terminee'
      : ecart > 0 ? 'ecart' : 'en_cours',
  }

  const sessions = getItem<ReconciliationSession[]>('reconciliation') || []
  sessions.unshift(session)
  if (sessions.length > 50) sessions.length = 50
  setItem('reconciliation', sessions)
  window.dispatchEvent(new CustomEvent('fiscasync:bankfeed-reconciliation-saved'))
  return session
}

export function getReconciliationSessions(bankAccountId?: string): ReconciliationSession[] {
  const list = getItem<ReconciliationSession[]>('reconciliation') || []
  if (bankAccountId) return list.filter(s => s.bankAccountId === bankAccountId)
  return list
}

// ────────── Stats ──────────

export function getBankFeedStats(): {
  totalAccounts: number
  totalTransactions: number
  reconciledCount: number
  pendingCount: number
  totalDebit: number
  totalCredit: number
} {
  const accounts = getAllBankAccounts()
  const txns = getItem<BankTransaction[]>('transactions') || []
  const reconciled = txns.filter(t => t.reconciled)
  const debits = txns.filter(t => t.amount < 0)
  const credits = txns.filter(t => t.amount > 0)

  return {
    totalAccounts: accounts.length,
    totalTransactions: txns.length,
    reconciledCount: reconciled.length,
    pendingCount: txns.length - reconciled.length,
    totalDebit: debits.reduce((s, t) => s + Math.abs(t.amount), 0),
    totalCredit: credits.reduce((s, t) => s + t.amount, 0),
  }
}
