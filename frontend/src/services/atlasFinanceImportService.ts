/**
 * atlasFinanceImportService.ts — Plug-and-play balance import from Atlas Finance.
 *
 * Atlas Finance (WiseBook) stores its data in the SAME Supabase database used
 * by FiscaSync/Liass'Pilot. When a user is authenticated, we can read their
 * entities / accounts / journal_lines via RLS and compute a trial balance
 * without requiring any file upload.
 *
 * Be defensive: these tables may not exist for users who only have Liass'Pilot.
 */
import { supabase } from '@/lib/supabase'

export interface AtlasFinanceBalance {
  available: boolean
  entityId?: string
  entityName?: string
  fiscalYear?: number
  entriesCount?: number
  totalDebit?: number
  totalCredit?: number
}

export interface AtlasFinanceEntry {
  compte: string
  intitule: string
  solde_debit: number
  solde_credit: number
}

/**
 * Check if the current user has Atlas Finance data available (entities + accounts).
 * Returns { available: false } silently if the tables don't exist or are empty.
 */
export async function checkAtlasFinanceAvailable(): Promise<AtlasFinanceBalance> {
  if (!supabase) return { available: false }

  try {
    // Check if user has at least one entity in Atlas Finance
    const { data: entities, error: entError } = await supabase
      .from('entities')
      .select('id, name')
      .limit(1)

    if (entError || !entities || entities.length === 0) {
      return { available: false }
    }

    const entity = entities[0] as { id: string; name: string }

    // Check if accounts table has data for this user (via RLS)
    const { count: accountsCount, error: accError } = await supabase
      .from('accounts')
      .select('*', { count: 'exact', head: true })

    if (accError || !accountsCount) {
      return { available: false, entityId: entity.id, entityName: entity.name }
    }

    return {
      available: true,
      entityId: entity.id,
      entityName: entity.name,
      entriesCount: accountsCount,
    }
  } catch {
    // Tables do not exist for this project (user only has Liass'Pilot)
    return { available: false }
  }
}

/**
 * Compute the trial balance from Atlas Finance journal_lines.
 * Aggregates all journal_lines per account into solde_debit/solde_credit.
 */
export async function fetchAtlasFinanceBalance(
  _fiscalYear: number,
  entityId?: string
): Promise<AtlasFinanceEntry[]> {
  if (!supabase) throw new Error('Supabase not configured')

  // Fetch chart of accounts
  let accountsQuery = supabase.from('accounts').select('id, code, label')
  if (entityId) accountsQuery = accountsQuery.eq('entity_id', entityId)
  const { data: accounts, error: accError } = await accountsQuery
  if (accError) throw new Error(accError.message)
  if (!accounts || accounts.length === 0) return []

  type AccountRow = { id: string; code: string; label: string | null }
  const accountRows = accounts as AccountRow[]

  // Fetch journal_lines for these accounts
  const accountIds = accountRows.map((a) => a.id)
  const { data: lines, error: linesError } = await supabase
    .from('journal_lines')
    .select('account_id, debit, credit')
    .in('account_id', accountIds)

  if (linesError) throw new Error(linesError.message)

  type LineRow = { account_id: string; debit: number | null; credit: number | null }
  const lineRows = (lines || []) as LineRow[]

  // Aggregate debit/credit per account
  const aggregates = new Map<string, { debit: number; credit: number }>()
  for (const line of lineRows) {
    const acc = aggregates.get(line.account_id) || { debit: 0, credit: 0 }
    acc.debit += Number(line.debit || 0)
    acc.credit += Number(line.credit || 0)
    aggregates.set(line.account_id, acc)
  }

  // Map to balance entries (net debit vs net credit)
  return accountRows
    .map((acc) => {
      const agg = aggregates.get(acc.id) || { debit: 0, credit: 0 }
      const net = agg.debit - agg.credit
      return {
        compte: acc.code,
        intitule: acc.label || '',
        solde_debit: net > 0 ? net : 0,
        solde_credit: net < 0 ? -net : 0,
      }
    })
    .filter((e) => e.solde_debit > 0 || e.solde_credit > 0)
}

/**
 * Import the Atlas Finance balance into a FiscaSync dossier.
 */
export async function importFromAtlasFinance(
  dossierId: string,
  fiscalYear: number,
  annee: 'N' | 'N-1' = 'N',
  entityId?: string
): Promise<{ entriesCount: number; totalDebit: number; totalCredit: number }> {
  if (!supabase) throw new Error('Supabase not configured')

  const entries = await fetchAtlasFinanceBalance(fiscalYear, entityId)
  if (entries.length === 0) {
    throw new Error('Aucune donnee Atlas Finance trouvee pour cet exercice')
  }

  const totalDebit = entries.reduce((s, e) => s + e.solde_debit, 0)
  const totalCredit = entries.reduce((s, e) => s + e.solde_credit, 0)

  const { error } = await supabase.rpc('import_balance_atomic', {
    p_dossier_id: dossierId,
    p_annee: annee,
    p_entries: entries,
    p_nombre_comptes: entries.length,
    p_total_debit: totalDebit,
    p_total_credit: totalCredit,
  })

  if (error) throw new Error(`Import failed: ${error.message}`)

  return { entriesCount: entries.length, totalDebit, totalCredit }
}
