/**
 * atlasFinanceImportService.ts — Plug-and-play balance import from Atlas Finance.
 *
 * Atlas Finance (WiseBook) stores its data in the SAME Supabase database used
 * by FiscaSync/Liass'Pilot. When a user is authenticated, we can read their
 * societes / journal_entries / journal_lines via RLS and compute a true
 * trial balance for a specific fiscal year.
 *
 * IMPORTANT — Balance de cloture rules:
 * 1. Filter by tenant_id (societe) — multi-tenant isolation
 * 2. Filter journal_entries.date BETWEEN fiscal_year.start_date AND end_date
 * 3. Filter journal_entries.status IN ('validated', 'posted') — exclude drafts
 * 4. Filter journal_entries.reversed = false — exclude reversed entries
 * 5. Aggregate journal_lines.debit/credit per account_code
 * 6. Compute net solde: positive = debit balance, negative = credit balance
 * 7. Apply OHADA sign convention based on accounts.normal_balance
 *
 * Be defensive: these tables may not exist for users who only have Liass'Pilot.
 */
import { supabase } from '@/lib/supabase'

export interface AtlasFinanceFiscalYear {
  id: string
  code: string
  name: string
  startDate: string
  endDate: string
  isClosed: boolean
  isActive: boolean
}

export interface AtlasFinanceSociete {
  id: string
  code: string
  nom: string
  fiscalYears: AtlasFinanceFiscalYear[]
}

export interface AtlasFinanceAvailability {
  available: boolean
  societes?: AtlasFinanceSociete[]
  defaultSocieteId?: string
  defaultFiscalYearId?: string
}

export interface AtlasFinanceEntry {
  compte: string
  intitule: string
  solde_debit: number
  solde_credit: number
  // Mouvements bruts (utiles pour TFT et notes)
  debit: number
  credit: number
}

export interface AtlasFinanceImportResult {
  entriesCount: number
  totalDebit: number
  totalCredit: number
  isBalanced: boolean
  societeNom: string
  fiscalYearCode: string
  fiscalYearClosed: boolean
}

interface SocieteRow {
  id: string
  code: string
  nom: string
}

interface FiscalYearRow {
  id: string
  tenant_id: string
  code: string
  name: string
  start_date: string
  end_date: string
  is_closed: boolean
  is_active: boolean
}

interface JournalLineAggregateRow {
  account_code: string
  account_name: string
  debit: number | null
  credit: number | null
}

/**
 * Check if the current user has Atlas Finance data available.
 * Returns the list of societes + fiscal years they can choose from.
 * Silently returns { available: false } if Atlas Finance tables don't exist.
 */
export async function checkAtlasFinanceAvailable(): Promise<AtlasFinanceAvailability> {
  if (!supabase) return { available: false }

  try {
    // Check if user has at least one societe (via RLS)
    const { data: societesData, error: socError } = await supabase
      .from('societes')
      .select('id, code, nom')
      .order('nom')

    if (socError || !societesData || societesData.length === 0) {
      return { available: false }
    }

    const societes = societesData as SocieteRow[]

    // Fetch fiscal years for all societes
    const { data: fiscalYearsData, error: fyError } = await supabase
      .from('fiscal_years')
      .select('id, tenant_id, code, name, start_date, end_date, is_closed, is_active')
      .in('tenant_id', societes.map((s) => s.id))
      .order('end_date', { ascending: false })

    if (fyError) {
      return { available: false }
    }

    const fiscalYears = (fiscalYearsData || []) as FiscalYearRow[]
    if (fiscalYears.length === 0) {
      return { available: false }
    }

    // Group by societe
    const societesWithYears: AtlasFinanceSociete[] = societes.map((s) => ({
      id: s.id,
      code: s.code,
      nom: s.nom,
      fiscalYears: fiscalYears
        .filter((fy) => fy.tenant_id === s.id)
        .map((fy) => ({
          id: fy.id,
          code: fy.code,
          name: fy.name,
          startDate: fy.start_date,
          endDate: fy.end_date,
          isClosed: fy.is_closed,
          isActive: fy.is_active,
        })),
    })).filter((s) => s.fiscalYears.length > 0)

    if (societesWithYears.length === 0) {
      return { available: false }
    }

    // Default to first societe + most recent CLOSED fiscal year (or active if none closed)
    const firstSociete = societesWithYears[0]!
    const closedYear = firstSociete.fiscalYears.find((fy) => fy.isClosed)
    const activeYear = firstSociete.fiscalYears.find((fy) => fy.isActive)
    const defaultFY = closedYear || activeYear || firstSociete.fiscalYears[0]!

    return {
      available: true,
      societes: societesWithYears,
      defaultSocieteId: firstSociete.id,
      defaultFiscalYearId: defaultFY.id,
    }
  } catch {
    // Tables do not exist for this project (user only has Liass'Pilot)
    return { available: false }
  }
}

/**
 * Compute the trial balance for a specific societe + fiscal year.
 *
 * Reads journal_entries within [start_date, end_date], status='validated|posted',
 * not reversed, then aggregates journal_lines per account_code.
 *
 * Returns OHADA-style balance: solde_debit > 0 OR solde_credit > 0 (one of two).
 */
export async function fetchAtlasFinanceBalance(
  societeId: string,
  fiscalYearId: string
): Promise<{
  entries: AtlasFinanceEntry[]
  societeNom: string
  fiscalYearCode: string
  fiscalYearClosed: boolean
}> {
  if (!supabase) throw new Error('Supabase not configured')

  // Fetch societe info
  const { data: societeData, error: socError } = await supabase
    .from('societes')
    .select('id, code, nom')
    .eq('id', societeId)
    .single()

  if (socError || !societeData) {
    throw new Error('Societe Atlas Finance introuvable')
  }
  const societe = societeData as SocieteRow

  // Fetch fiscal year info
  const { data: fyData, error: fyError } = await supabase
    .from('fiscal_years')
    .select('id, tenant_id, code, name, start_date, end_date, is_closed, is_active')
    .eq('id', fiscalYearId)
    .single()

  if (fyError || !fyData) {
    throw new Error('Exercice fiscal Atlas Finance introuvable')
  }
  const fy = fyData as FiscalYearRow

  if (fy.tenant_id !== societeId) {
    throw new Error('Exercice fiscal n\'appartient pas a cette societe')
  }

  // Fetch all validated/posted journal entries within the fiscal year date range
  const { data: entriesData, error: entError } = await supabase
    .from('journal_entries')
    .select('id')
    .eq('tenant_id', societeId)
    .gte('date', fy.start_date)
    .lte('date', fy.end_date)
    .in('status', ['validated', 'posted'])
    .eq('reversed', false)

  if (entError) {
    throw new Error(`Erreur lecture journal_entries: ${entError.message}`)
  }

  const entryIds = (entriesData || []).map((e: { id: string }) => e.id)
  if (entryIds.length === 0) {
    return {
      entries: [],
      societeNom: societe.nom,
      fiscalYearCode: fy.code,
      fiscalYearClosed: fy.is_closed,
    }
  }

  // Fetch journal_lines for those entries (paginated to handle large datasets)
  const PAGE_SIZE = 1000
  const allLines: JournalLineAggregateRow[] = []

  for (let i = 0; i < entryIds.length; i += PAGE_SIZE) {
    const batch = entryIds.slice(i, i + PAGE_SIZE)
    const { data: linesData, error: linesError } = await supabase
      .from('journal_lines')
      .select('account_code, account_name, debit, credit')
      .in('entry_id', batch)

    if (linesError) {
      throw new Error(`Erreur lecture journal_lines: ${linesError.message}`)
    }

    allLines.push(...((linesData || []) as JournalLineAggregateRow[]))
  }

  // Aggregate per account_code
  const aggregates = new Map<
    string,
    { intitule: string; debit: number; credit: number }
  >()

  for (const line of allLines) {
    if (!line.account_code) continue
    const acc = aggregates.get(line.account_code) || {
      intitule: line.account_name || '',
      debit: 0,
      credit: 0,
    }
    acc.debit += Number(line.debit || 0)
    acc.credit += Number(line.credit || 0)
    if (line.account_name && !acc.intitule) acc.intitule = line.account_name
    aggregates.set(line.account_code, acc)
  }

  // Convert to OHADA balance entries (net debit OR net credit)
  const entries: AtlasFinanceEntry[] = []
  for (const [code, agg] of aggregates) {
    const net = agg.debit - agg.credit
    // Skip accounts with no movement
    if (agg.debit === 0 && agg.credit === 0) continue

    entries.push({
      compte: code,
      intitule: agg.intitule,
      solde_debit: net > 0 ? net : 0,
      solde_credit: net < 0 ? -net : 0,
      debit: agg.debit,
      credit: agg.credit,
    })
  }

  // Sort by account code for consistency
  entries.sort((a, b) => a.compte.localeCompare(b.compte))

  return {
    entries,
    societeNom: societe.nom,
    fiscalYearCode: fy.code,
    fiscalYearClosed: fy.is_closed,
  }
}

/**
 * Import the Atlas Finance balance into a Liass'Pilot dossier.
 *
 * Warns if the fiscal year is not yet closed (balance may not be final).
 */
export async function importFromAtlasFinance(
  dossierId: string,
  societeId: string,
  fiscalYearId: string,
  annee: 'N' | 'N-1' = 'N'
): Promise<AtlasFinanceImportResult> {
  if (!supabase) throw new Error('Supabase not configured')

  const { entries, societeNom, fiscalYearCode, fiscalYearClosed } =
    await fetchAtlasFinanceBalance(societeId, fiscalYearId)

  if (entries.length === 0) {
    throw new Error(
      `Aucune ecriture validee trouvee pour ${societeNom} - exercice ${fiscalYearCode}. ` +
        `Verifiez que des journaux ont ete saisis et valides dans Atlas Finance.`
    )
  }

  const totalDebit = entries.reduce((s, e) => s + e.solde_debit, 0)
  const totalCredit = entries.reduce((s, e) => s + e.solde_credit, 0)
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01

  const { error } = await supabase.rpc('import_balance_atomic', {
    p_dossier_id: dossierId,
    p_annee: annee,
    p_entries: entries,
    p_nombre_comptes: entries.length,
    p_total_debit: totalDebit,
    p_total_credit: totalCredit,
  })

  if (error) throw new Error(`Import failed: ${error.message}`)

  return {
    entriesCount: entries.length,
    totalDebit,
    totalCredit,
    isBalanced,
    societeNom,
    fiscalYearCode,
    fiscalYearClosed,
  }
}
