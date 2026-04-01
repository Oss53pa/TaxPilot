import { supabase, isSupabaseEnabled } from '@/lib/supabase'
import { getFiscalConfig } from './fiscalConfigService'

export interface FiscalDeficit {
  id: string
  companyId: string
  fiscalYear: number
  deficitAmount: number
  remainingAmount: number
  expiresAt: number
  createdAt: string
}

/**
 * Record a new fiscal deficit for future carryforward
 */
export async function recordDeficit(
  companyId: string,
  fiscalYear: number,
  deficitAmount: number,
  countryCode: string
): Promise<void> {
  if (!isSupabaseEnabled || !supabase) return

  const config = await getFiscalConfig(countryCode)
  const expiresAt = fiscalYear + config.lossCarryforwardYears

  await supabase.from('fiscal_deficits').insert({
    company_id: companyId,
    fiscal_year: fiscalYear,
    deficit_amount: Math.abs(deficitAmount),
    remaining_amount: Math.abs(deficitAmount),
    expires_at: expiresAt,
  })
}

/**
 * Get all available (non-expired, non-fully-used) deficits for a company
 */
export async function getRemainingDeficits(
  companyId: string,
  currentYear: number
): Promise<FiscalDeficit[]> {
  if (!isSupabaseEnabled || !supabase) return []

  const { data, error } = await supabase
    .from('fiscal_deficits')
    .select('*')
    .eq('company_id', companyId)
    .gt('remaining_amount', 0)
    .gte('expires_at', currentYear)
    .order('fiscal_year', { ascending: true })

  if (error) throw error

  return (data || []).map(row => ({
    id: row.id,
    companyId: row.company_id,
    fiscalYear: row.fiscal_year,
    deficitAmount: Number(row.deficit_amount),
    remainingAmount: Number(row.remaining_amount),
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  }))
}

/**
 * Apply carryforward: impute prior deficits against current year profit.
 * Returns total amount imputed. Updates remaining_amount in DB.
 */
export async function applyCarryforward(
  companyId: string,
  currentYear: number,
  resultatFiscal: number
): Promise<number> {
  if (resultatFiscal <= 0) return 0
  if (!isSupabaseEnabled || !supabase) return 0

  const deficits = await getRemainingDeficits(companyId, currentYear)
  let remainingProfit = resultatFiscal
  let totalImputed = 0

  for (const deficit of deficits) {
    if (remainingProfit <= 0) break

    const imputable = Math.min(deficit.remainingAmount, remainingProfit)
    const newRemaining = deficit.remainingAmount - imputable

    await supabase
      .from('fiscal_deficits')
      .update({ remaining_amount: newRemaining })
      .eq('id', deficit.id)

    totalImputed += imputable
    remainingProfit -= imputable
  }

  return totalImputed
}
