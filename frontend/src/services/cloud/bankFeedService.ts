/**
 * Bank Feed Service — Open Banking Integration
 * Abstract connector for bank APIs in the OHADA zone (BCEAO/BEAC regions).
 *
 * Architecture:
 *   Frontend → Edge Function → Bank API (secrets never exposed to browser)
 *   Transactions stored in Supabase, auto-reconciled with balance accounts.
 */

import { supabase } from '@/config/supabase'
import { isSupabaseEnabled } from '@/types/cloud'

// ============================================================
// Types
// ============================================================

export interface BankConnection {
  id: string
  tenant_id: string
  bank_name: string
  bank_code: string
  account_number: string
  account_label: string
  compte_comptable: string
  currency: string
  status: 'active' | 'expired' | 'error'
  last_sync_at: string | null
  created_at: string
}

export interface BankTransaction {
  id: string
  connection_id: string
  date: string
  label: string
  amount: number
  currency: string
  reference: string | null
  category: string | null
  reconciled: boolean
  compte_comptable: string | null
  ecriture_id: string | null
  suggested_compte: string | null
  suggestion_confidence: number
  created_at: string
}

export interface SyncResult {
  connection_id: string
  transactions_fetched: number
  transactions_new: number
  auto_reconciled: number
  errors: string[]
}

// ============================================================
// Known banks in OHADA zone
// ============================================================

export const OHADA_BANKS = [
  // UEMOA (BCEAO)
  { code: 'SGBF', name: 'Societe Generale Burkina', country: 'BF', region: 'BCEAO' },
  { code: 'BICICI', name: 'BICICI', country: 'CI', region: 'BCEAO' },
  { code: 'SGCI', name: 'Societe Generale CI', country: 'CI', region: 'BCEAO' },
  { code: 'ECOBANK_CI', name: 'Ecobank CI', country: 'CI', region: 'BCEAO' },
  { code: 'BOA_CI', name: 'BOA Cote d\'Ivoire', country: 'CI', region: 'BCEAO' },
  { code: 'NSIA_CI', name: 'NSIA Banque CI', country: 'CI', region: 'BCEAO' },
  { code: 'BDU', name: 'Banque de l\'Union', country: 'CI', region: 'BCEAO' },
  { code: 'CBAO', name: 'CBAO Groupe Attijariwafa', country: 'SN', region: 'BCEAO' },
  { code: 'ECOBANK_SN', name: 'Ecobank Senegal', country: 'SN', region: 'BCEAO' },
  { code: 'BDM', name: 'Banque de Developpement du Mali', country: 'ML', region: 'BCEAO' },
  { code: 'BOA_BJ', name: 'BOA Benin', country: 'BJ', region: 'BCEAO' },
  { code: 'UTB', name: 'Union Togolaise de Banque', country: 'TG', region: 'BCEAO' },
  // CEMAC (BEAC)
  { code: 'SGCM', name: 'Societe Generale Cameroun', country: 'CM', region: 'BEAC' },
  { code: 'BICEC', name: 'BICEC Cameroun', country: 'CM', region: 'BEAC' },
  { code: 'AFRILAND', name: 'Afriland First Bank', country: 'CM', region: 'BEAC' },
  { code: 'BGFI_GA', name: 'BGFI Bank Gabon', country: 'GA', region: 'BEAC' },
  { code: 'UBA_CG', name: 'UBA Congo', country: 'CG', region: 'BEAC' },
  { code: 'ECOBANK_TD', name: 'Ecobank Tchad', country: 'TD', region: 'BEAC' },
  // Pan-African
  { code: 'ECOBANK', name: 'Ecobank (Pan-OHADA)', country: 'ALL', region: 'ALL' },
  { code: 'UBA', name: 'United Bank for Africa', country: 'ALL', region: 'ALL' },
  { code: 'BOA', name: 'Bank of Africa', country: 'ALL', region: 'ALL' },
]

export function getBanksForCountry(countryCode: string) {
  return OHADA_BANKS.filter(b => b.country === countryCode || b.country === 'ALL')
}

// ============================================================
// Connection management
// ============================================================

export async function listConnections(): Promise<BankConnection[]> {
  if (!isSupabaseEnabled()) return []
  const { data, error } = await supabase
    .from('bank_connections')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return []
  return data ?? []
}

export async function createConnection(params: {
  bank_code: string
  bank_name: string
  account_number: string
  account_label: string
  compte_comptable: string
  currency: string
}): Promise<BankConnection> {
  const { data, error } = await supabase
    .from('bank_connections')
    .insert({
      ...params,
      status: 'active',
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteConnection(id: string): Promise<void> {
  const { error } = await supabase
    .from('bank_connections')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ============================================================
// Transaction sync
// ============================================================

/**
 * Sync transactions from bank via Edge Function
 */
export async function syncTransactions(connectionId: string): Promise<SyncResult> {
  const { data, error } = await supabase.functions.invoke('bank-sync', {
    body: { connection_id: connectionId },
  })
  if (error) throw new Error(error.message)
  return data.data as SyncResult
}

/**
 * List transactions for a connection
 */
export async function listTransactions(params: {
  connection_id?: string
  reconciled?: boolean
  date_from?: string
  date_to?: string
  limit?: number
}): Promise<BankTransaction[]> {
  if (!isSupabaseEnabled()) return []

  let query = supabase
    .from('bank_transactions')
    .select('*')
    .order('date', { ascending: false })
    .limit(params.limit ?? 100)

  if (params.connection_id) query = query.eq('connection_id', params.connection_id)
  if (params.reconciled !== undefined) query = query.eq('reconciled', params.reconciled)
  if (params.date_from) query = query.gte('date', params.date_from)
  if (params.date_to) query = query.lte('date', params.date_to)

  const { data, error } = await query
  if (error) return []
  return data ?? []
}

// ============================================================
// Reconciliation
// ============================================================

/**
 * Reconcile a transaction with a comptable account
 */
export async function reconcileTransaction(
  transactionId: string,
  compteComptable: string,
): Promise<void> {
  const { error } = await supabase
    .from('bank_transactions')
    .update({
      reconciled: true,
      compte_comptable: compteComptable,
    })
    .eq('id', transactionId)
  if (error) throw error
}

/**
 * Auto-reconcile unreconciled transactions using ML suggestions
 * Only reconciles if confidence > threshold
 */
export async function autoReconcile(
  connectionId: string,
  confidenceThreshold = 0.8,
): Promise<{ reconciled: number; skipped: number }> {
  const unreconciled = await listTransactions({
    connection_id: connectionId,
    reconciled: false,
  })

  let reconciled = 0
  let skipped = 0

  for (const tx of unreconciled) {
    if (tx.suggested_compte && tx.suggestion_confidence >= confidenceThreshold) {
      await reconcileTransaction(tx.id, tx.suggested_compte)
      reconciled++
    } else {
      skipped++
    }
  }

  return { reconciled, skipped }
}

/**
 * Get reconciliation summary for a connection
 */
export async function getReconciliationSummary(connectionId: string): Promise<{
  total: number
  reconciled: number
  pending: number
  total_debit: number
  total_credit: number
}> {
  const transactions = await listTransactions({ connection_id: connectionId, limit: 10000 })

  const reconciled = transactions.filter(t => t.reconciled).length
  const totalDebit = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)
  const totalCredit = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0)

  return {
    total: transactions.length,
    reconciled,
    pending: transactions.length - reconciled,
    total_debit: totalDebit,
    total_credit: totalCredit,
  }
}
