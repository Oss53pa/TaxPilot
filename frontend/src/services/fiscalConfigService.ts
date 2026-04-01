import { supabase, isSupabaseEnabled } from '@/lib/supabase'

export interface FiscalConfig {
  id: string
  countryCode: string
  countryName: string
  currency: string
  isRate: number
  isReducedRate: number | null
  isReducedThreshold: number | null
  imfRate: number
  imfMinimum: number
  imfMaximum: number | null
  giftThresholdRate: number | null
  donationThresholdRate: number | null
  entertainmentThresholdRate: number | null
  lossCarryforwardYears: number
  vatStandardRate: number | null
  vatReducedRate: number | null
  notes: string | null
}

// Fallback config for CI when Supabase is not available
const FALLBACK_CI: FiscalConfig = {
  id: 'fallback-ci',
  countryCode: 'CI',
  countryName: 'Côte d\'Ivoire',
  currency: 'XOF',
  isRate: 0.2500,
  isReducedRate: null,
  isReducedThreshold: null,
  imfRate: 0.0100,
  imfMinimum: 3000000,
  imfMaximum: null,
  giftThresholdRate: 0.001,
  donationThresholdRate: 0.005,
  entertainmentThresholdRate: 0.01,
  lossCarryforwardYears: 5,
  vatStandardRate: 0.18,
  vatReducedRate: 0.09,
  notes: null,
}

function mapRow(row: Record<string, unknown>): FiscalConfig {
  return {
    id: row.id as string,
    countryCode: (row.country_code as string).trim(),
    countryName: row.country_name as string,
    currency: row.currency as string,
    isRate: Number(row.is_rate),
    isReducedRate: row.is_reduced_rate ? Number(row.is_reduced_rate) : null,
    isReducedThreshold: row.is_reduced_threshold ? Number(row.is_reduced_threshold) : null,
    imfRate: Number(row.imf_rate),
    imfMinimum: Number(row.imf_minimum || 0),
    imfMaximum: row.imf_maximum ? Number(row.imf_maximum) : null,
    giftThresholdRate: row.gift_threshold_rate ? Number(row.gift_threshold_rate) : null,
    donationThresholdRate: row.donation_threshold_rate ? Number(row.donation_threshold_rate) : null,
    entertainmentThresholdRate: row.entertainment_threshold_rate ? Number(row.entertainment_threshold_rate) : null,
    lossCarryforwardYears: Number(row.loss_carryforward_years || 5),
    vatStandardRate: row.vat_standard_rate ? Number(row.vat_standard_rate) : null,
    vatReducedRate: row.vat_reduced_rate ? Number(row.vat_reduced_rate) : null,
    notes: row.notes as string | null,
  }
}

let configCache: Map<string, FiscalConfig> = new Map()

export async function getFiscalConfig(countryCode: string): Promise<FiscalConfig> {
  const code = countryCode.toUpperCase().trim()

  // Check cache first
  if (configCache.has(code)) {
    return configCache.get(code)!
  }

  if (!isSupabaseEnabled || !supabase) {
    if (code === 'CI') return FALLBACK_CI
    throw new Error(`Configuration fiscale non disponible pour ${code} en mode hors-ligne`)
  }

  const { data, error } = await supabase
    .from('fiscal_config')
    .select('*')
    .eq('country_code', code)
    .eq('is_active', true)
    .order('effective_from', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    throw new Error(`Configuration fiscale introuvable pour le pays: ${code}`)
  }

  const config = mapRow(data)
  configCache.set(code, config)
  return config
}

export async function getAllFiscalConfigs(): Promise<FiscalConfig[]> {
  if (!isSupabaseEnabled || !supabase) {
    return [FALLBACK_CI]
  }

  const { data, error } = await supabase
    .from('fiscal_config')
    .select('*')
    .eq('is_active', true)
    .order('country_name')

  if (error) throw error
  return (data || []).map(mapRow)
}

export function clearFiscalConfigCache(): void {
  configCache = new Map()
}

/** List of OHADA country codes */
export const OHADA_COUNTRIES = [
  'CI', 'SN', 'ML', 'BF', 'BJ', 'TG', 'NE', 'GW', // UEMOA
  'CM', 'GA', 'CG', 'TD', 'CF', 'GQ',               // CEMAC
  'GN', 'KM', 'CD',                                    // Other
] as const

export type OhadaCountryCode = typeof OHADA_COUNTRIES[number]

/**
 * Update a fiscal config entry (admin only)
 */
export async function updateFiscalConfig(
  id: string,
  updates: Partial<Omit<FiscalConfig, 'id'>>
): Promise<void> {
  if (!isSupabaseEnabled || !supabase) {
    throw new Error('Supabase non disponible')
  }

  const dbUpdates: Record<string, unknown> = {}
  if (updates.isRate !== undefined) dbUpdates.is_rate = updates.isRate
  if (updates.isReducedRate !== undefined) dbUpdates.is_reduced_rate = updates.isReducedRate
  if (updates.isReducedThreshold !== undefined) dbUpdates.is_reduced_threshold = updates.isReducedThreshold
  if (updates.imfRate !== undefined) dbUpdates.imf_rate = updates.imfRate
  if (updates.imfMinimum !== undefined) dbUpdates.imf_minimum = updates.imfMinimum
  if (updates.imfMaximum !== undefined) dbUpdates.imf_maximum = updates.imfMaximum
  if (updates.giftThresholdRate !== undefined) dbUpdates.gift_threshold_rate = updates.giftThresholdRate
  if (updates.donationThresholdRate !== undefined) dbUpdates.donation_threshold_rate = updates.donationThresholdRate
  if (updates.entertainmentThresholdRate !== undefined) dbUpdates.entertainment_threshold_rate = updates.entertainmentThresholdRate
  if (updates.lossCarryforwardYears !== undefined) dbUpdates.loss_carryforward_years = updates.lossCarryforwardYears
  if (updates.vatStandardRate !== undefined) dbUpdates.vat_standard_rate = updates.vatStandardRate
  if (updates.vatReducedRate !== undefined) dbUpdates.vat_reduced_rate = updates.vatReducedRate
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes

  const { error } = await supabase
    .from('fiscal_config')
    .update(dbUpdates)
    .eq('id', id)

  if (error) throw new Error(error.message)

  // Clear cache so next read gets fresh data
  clearFiscalConfigCache()
}
