/**
 * Predictive Dashboard Service
 * Advanced analytics: trend analysis, forecasting, anomaly detection,
 * sector benchmarks. Outputs Recharts-compatible data.
 */

import { supabase } from '@/config/supabase'
import { isSupabaseEnabled } from '@/types/cloud'

// ============================================================
// Types
// ============================================================

export interface TrendPoint {
  period: string      // 'YYYY-MM' or 'YYYY'
  value: number
  forecast?: boolean  // true if this is a predicted value
}

export interface AnomalyPoint {
  account: string
  label: string
  value: number
  expected_min: number
  expected_max: number
  severity: 'info' | 'warning' | 'critical'
  description: string
}

export interface SectorBenchmark {
  metric: string
  label: string
  value: number      // Actual
  benchmark: number  // Sector average
  deviation_pct: number
  status: 'good' | 'warning' | 'critical'
}

export interface CashFlowForecast {
  month: string
  encaissements: number
  decaissements: number
  solde_cumule: number
  forecast: boolean
}

export interface DashboardData {
  kpis: {
    ca: number
    resultat: number
    marge_brute_pct: number
    marge_nette_pct: number
    ratio_endettement: number
    tresorerie_nette: number
    bfr: number
    rotation_stocks_jours: number
    delai_clients_jours: number
    delai_fournisseurs_jours: number
  }
  trends: {
    ca_mensuel: TrendPoint[]
    resultat_mensuel: TrendPoint[]
    tresorerie: TrendPoint[]
  }
  anomalies: AnomalyPoint[]
  benchmarks: SectorBenchmark[]
  cashflow_forecast: CashFlowForecast[]
}

// ============================================================
// KPI Calculator
// ============================================================

interface BalanceEntry {
  numero_compte: string
  libelle: string
  debit_solde: number
  credit_solde: number
}

function sumByPrefix(entries: BalanceEntry[], prefixes: string[], side: 'debit' | 'credit'): number {
  return entries
    .filter(e => prefixes.some(p => e.numero_compte.startsWith(p)))
    .reduce((sum, e) => sum + (side === 'debit' ? e.debit_solde : e.credit_solde), 0)
}

export function calculateKPIs(entries: BalanceEntry[]) {
  const ca = sumByPrefix(entries, ['70', '71', '72', '73'], 'credit')
  const achats = sumByPrefix(entries, ['60'], 'debit')
  const variationStocks = sumByPrefix(entries, ['603'], 'debit')
  const margeBrute = ca - achats + variationStocks

  const produits = sumByPrefix(entries, ['70', '71', '72', '73', '74', '75', '76', '77', '78', '79'], 'credit')
  const charges = sumByPrefix(entries, ['60', '61', '62', '63', '64', '65', '66', '67', '68', '69'], 'debit')
  const resultat = produits - charges

  const stocks = sumByPrefix(entries, ['31', '32', '33', '34', '35', '36', '37', '38'], 'debit')
  const clients = sumByPrefix(entries, ['41'], 'debit')
  const fournisseurs = sumByPrefix(entries, ['40'], 'credit')
  const bfr = stocks + clients - fournisseurs

  const banques = sumByPrefix(entries, ['52'], 'debit') - sumByPrefix(entries, ['52'], 'credit')
  const caisse = sumByPrefix(entries, ['57'], 'debit')
  const tresorerieNette = banques + caisse

  const totalActif = sumByPrefix(entries, ['2', '3', '4', '5'], 'debit')
  const dettes = sumByPrefix(entries, ['16', '17', '18', '19'], 'credit') +
                 sumByPrefix(entries, ['40', '42', '43', '44', '45', '46', '47', '48'], 'credit')
  const ratioEndettement = totalActif > 0 ? dettes / totalActif : 0

  const rotationStocksJours = achats > 0 ? (stocks / achats) * 360 : 0
  const delaiClientsJours = ca > 0 ? (clients / ca) * 360 : 0
  const delaiFournisseursJours = achats > 0 ? (fournisseurs / achats) * 360 : 0

  return {
    ca,
    resultat,
    marge_brute_pct: ca > 0 ? (margeBrute / ca) * 100 : 0,
    marge_nette_pct: ca > 0 ? (resultat / ca) * 100 : 0,
    ratio_endettement: ratioEndettement,
    tresorerie_nette: tresorerieNette,
    bfr,
    rotation_stocks_jours: Math.round(rotationStocksJours),
    delai_clients_jours: Math.round(delaiClientsJours),
    delai_fournisseurs_jours: Math.round(delaiFournisseursJours),
  }
}

// ============================================================
// Trend Analysis + Simple Forecasting
// ============================================================

/**
 * Simple linear regression for forecasting
 */
function linearForecast(data: number[], periodsAhead: number): number[] {
  const n = data.length
  if (n < 2) return Array(periodsAhead).fill(data[0] ?? 0)

  const xMean = (n - 1) / 2
  const yMean = data.reduce((a, b) => a + b, 0) / n

  let num = 0, den = 0
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (data[i] - yMean)
    den += (i - xMean) ** 2
  }
  const slope = den !== 0 ? num / den : 0
  const intercept = yMean - slope * xMean

  const forecast: number[] = []
  for (let i = 0; i < periodsAhead; i++) {
    forecast.push(Math.round(intercept + slope * (n + i)))
  }
  return forecast
}

/**
 * Generate monthly CA trend with 3-month forecast
 */
export function generateCATrend(monthlyCA: Array<{ month: string; value: number }>): TrendPoint[] {
  const points: TrendPoint[] = monthlyCA.map(m => ({
    period: m.month,
    value: m.value,
  }))

  // Forecast 3 months
  const values = monthlyCA.map(m => m.value)
  const forecasted = linearForecast(values, 3)
  const lastMonth = monthlyCA[monthlyCA.length - 1]?.month || '2025-12'
  const [yr, mo] = lastMonth.split('-').map(Number)

  for (let i = 0; i < forecasted.length; i++) {
    const fMonth = mo + i + 1
    const fYear = yr + Math.floor((fMonth - 1) / 12)
    const fMo = ((fMonth - 1) % 12) + 1
    points.push({
      period: `${fYear}-${String(fMo).padStart(2, '0')}`,
      value: forecasted[i],
      forecast: true,
    })
  }

  return points
}

// ============================================================
// Anomaly Detection (Statistical)
// ============================================================

/**
 * Detect anomalies using Z-score method
 * An account is anomalous if its value deviates >2 std from historical mean
 */
export function detectAnomalies(
  current: BalanceEntry[],
  historical: BalanceEntry[][] // Previous exercices
): AnomalyPoint[] {
  if (historical.length < 1) return []

  const anomalies: AnomalyPoint[] = []

  // Build historical averages by account prefix (2-digit)
  const histByPrefix = new Map<string, number[]>()
  for (const period of historical) {
    for (const entry of period) {
      const prefix = entry.numero_compte.substring(0, 3)
      if (!histByPrefix.has(prefix)) histByPrefix.set(prefix, [])
      const val = entry.debit_solde - entry.credit_solde
      histByPrefix.get(prefix)!.push(val)
    }
  }

  // Check current values against historical distribution
  const currentByPrefix = new Map<string, { total: number; label: string }>()
  for (const entry of current) {
    const prefix = entry.numero_compte.substring(0, 3)
    const existing = currentByPrefix.get(prefix)
    const val = entry.debit_solde - entry.credit_solde
    if (existing) {
      existing.total += val
    } else {
      currentByPrefix.set(prefix, { total: val, label: entry.libelle })
    }
  }

  for (const [prefix, { total, label }] of currentByPrefix) {
    const hist = histByPrefix.get(prefix)
    if (!hist || hist.length < 2) continue

    const mean = hist.reduce((a, b) => a + b, 0) / hist.length
    const std = Math.sqrt(hist.reduce((a, b) => a + (b - mean) ** 2, 0) / hist.length)

    if (std === 0) continue

    const zScore = Math.abs((total - mean) / std)
    if (zScore > 2) {
      anomalies.push({
        account: prefix,
        label,
        value: total,
        expected_min: mean - 2 * std,
        expected_max: mean + 2 * std,
        severity: zScore > 3 ? 'critical' : 'warning',
        description: `Ecart de ${Math.round(zScore * 100) / 100} ecarts-types par rapport a la moyenne historique`,
      })
    }
  }

  return anomalies.sort((a, b) => {
    const sevOrder = { critical: 0, warning: 1, info: 2 }
    return sevOrder[a.severity] - sevOrder[b.severity]
  })
}

// ============================================================
// Sector Benchmarks
// ============================================================

export async function getSectorBenchmarks(
  kpis: ReturnType<typeof calculateKPIs>,
  pays: string,
  secteur: string,
): Promise<SectorBenchmark[]> {
  let benchmarkData: Record<string, number> | null = null

  if (isSupabaseEnabled()) {
    const { data } = await supabase
      .from('sector_benchmarks')
      .select('*')
      .eq('pays', pays)
      .eq('secteur', secteur)
      .order('annee', { ascending: false })
      .limit(1)
      .single()
    if (data) benchmarkData = data
  }

  // Fallback to hardcoded CI/COMMERCE defaults
  if (!benchmarkData) {
    benchmarkData = {
      marge_brute_pct: 25,
      marge_nette_pct: 5,
      ratio_endettement: 0.65,
      rotation_stocks_jours: 45,
      delai_clients_jours: 60,
      delai_fournisseurs_jours: 90,
    }
  }

  const metrics: Array<{ key: keyof typeof kpis; label: string; benchKey: string; inverted?: boolean }> = [
    { key: 'marge_brute_pct', label: 'Marge brute', benchKey: 'marge_brute_pct' },
    { key: 'marge_nette_pct', label: 'Marge nette', benchKey: 'marge_nette_pct' },
    { key: 'ratio_endettement', label: 'Endettement', benchKey: 'ratio_endettement', inverted: true },
    { key: 'rotation_stocks_jours', label: 'Rotation stocks (j)', benchKey: 'rotation_stocks_jours', inverted: true },
    { key: 'delai_clients_jours', label: 'Delai clients (j)', benchKey: 'delai_clients_jours', inverted: true },
    { key: 'delai_fournisseurs_jours', label: 'Delai fournisseurs (j)', benchKey: 'delai_fournisseurs_jours' },
  ]

  return metrics.map(m => {
    const actual = kpis[m.key] as number
    const bench = (benchmarkData as Record<string, number>)[m.benchKey] ?? 0
    const devPct = bench !== 0 ? ((actual - bench) / bench) * 100 : 0
    const isGood = m.inverted ? devPct <= 10 : devPct >= -10
    const isCritical = m.inverted ? devPct > 50 : devPct < -50

    return {
      metric: m.key,
      label: m.label,
      value: Math.round(actual * 100) / 100,
      benchmark: Math.round(bench * 100) / 100,
      deviation_pct: Math.round(devPct * 10) / 10,
      status: isCritical ? 'critical' : isGood ? 'good' : 'warning',
    }
  })
}

// ============================================================
// Cash Flow Forecast
// ============================================================

export function generateCashFlowForecast(
  monthlyData: Array<{ month: string; encaissements: number; decaissements: number }>,
  forecastMonths = 3,
): CashFlowForecast[] {
  const result: CashFlowForecast[] = []
  let cumuleSolde = 0

  // Historical
  for (const m of monthlyData) {
    cumuleSolde += m.encaissements - m.decaissements
    result.push({
      month: m.month,
      encaissements: m.encaissements,
      decaissements: m.decaissements,
      solde_cumule: cumuleSolde,
      forecast: false,
    })
  }

  // Forecast
  const encValues = monthlyData.map(m => m.encaissements)
  const decValues = monthlyData.map(m => m.decaissements)
  const forecastEnc = linearForecast(encValues, forecastMonths)
  const forecastDec = linearForecast(decValues, forecastMonths)

  const lastMonth = monthlyData[monthlyData.length - 1]?.month || '2025-12'
  const [yr, mo] = lastMonth.split('-').map(Number)

  for (let i = 0; i < forecastMonths; i++) {
    const fMonth = mo + i + 1
    const fYear = yr + Math.floor((fMonth - 1) / 12)
    const fMo = ((fMonth - 1) % 12) + 1
    const enc = Math.max(0, forecastEnc[i])
    const dec = Math.max(0, forecastDec[i])
    cumuleSolde += enc - dec

    result.push({
      month: `${fYear}-${String(fMo).padStart(2, '0')}`,
      encaissements: enc,
      decaissements: dec,
      solde_cumule: cumuleSolde,
      forecast: true,
    })
  }

  return result
}
