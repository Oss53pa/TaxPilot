import type * as XLSX from 'xlsx'
import type { EntrepriseData, BalanceEntry } from '../../types'
import type { ExerciceData } from '../liasse-export-excel'
import {
  getActifBrut, getAmortProv, getPassif,
  getCharges, getProduits, getBalanceSolde,
} from '../liasse-calculs'

export type CellValue = string | number | null
export type Row = CellValue[]

export interface SheetData {
  rows: Row[]
  merges?: XLSX.Range[]
  cols?: XLSX.ColInfo[]
}

// ── Merge helper ──
export function m(r1: number, c1: number, r2: number, c2: number): XLSX.Range {
  return { s: { r: r1, c: c1 }, e: { r: r2, c: c2 } }
}

// ── Create a row of N empty cells ──
export function emptyRow(cols: number): Row {
  return new Array(cols).fill(null)
}

// ── Place values at specific column indices in a row ──
export function rowAt(totalCols: number, ...pairs: [number, CellValue][]): Row {
  const row = emptyRow(totalCols)
  for (const [col, val] of pairs) {
    row[col] = val
  }
  return row
}

// ── Format date serial to DD/MM/YYYY ──
export function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

// ── Standard header rows (denomination, adresse, NCC, NTD) used on most pages ──
export function headerRows(
  ent: EntrepriseData,
  ex: ExerciceData,
  totalCols: number,
  opts?: {
    labelCol?: number   // column for label start (default 0)
    valueCol?: number   // column for denomination value (default 2)
    sigleCol?: number   // column for "Sigle usuel:"
    sigleValCol?: number
    pageLabel?: string  // e.g. "NOTE 36" top-right
    pageLabelCol?: number
  },
): Row[] {
  const lc = opts?.labelCol ?? 0
  const vc = opts?.valueCol ?? 2
  const sc = opts?.sigleCol ?? (totalCols - 3)
  const svc = opts?.sigleValCol ?? (totalCols - 1)

  const rows: Row[] = []

  // L3: Denomination
  const r3 = emptyRow(totalCols)
  r3[lc] = 'Dénomination sociale de l\'entité :'
  r3[vc] = ent.denomination || ''
  rows.push(r3)

  // L4: Adresse + Sigle
  const r4 = emptyRow(totalCols)
  r4[lc] = 'Adresse :'
  r4[lc + 1] = ent.adresse || ''
  r4[sc] = 'Sigle usuel :'
  r4[svc] = ent.sigle || ''
  rows.push(r4)

  // L5: NCC + Exercice + Duree
  const r5 = emptyRow(totalCols)
  r5[lc] = 'N° de compte contribuable (NCC) :'
  r5[vc] = ent.ncc || ''
  r5[Math.floor(totalCols * 0.55)] = 'Exercice clos le :'
  r5[Math.floor(totalCols * 0.7)] = formatDate(ex.dateFin)
  r5[sc] = 'Durée (en mois) :'
  r5[svc] = ex.dureeMois
  rows.push(r5)

  // L6: NTD
  const r6 = emptyRow(totalCols)
  r6[lc] = 'N° de télédéclarant (NTD) :'
  r6[vc] = ent.ntd || ''
  rows.push(r6)

  return rows
}

// ── Extract exercice year from dateFin ──
export function exerciceYear(ex: ExerciceData): string {
  if (!ex.dateFin) return 'N'
  const d = new Date(ex.dateFin)
  return isNaN(d.getTime()) ? 'N' : String(d.getFullYear())
}

export function exerciceYearN1(ex: ExerciceData): string {
  if (!ex.dateFin) return 'N-1'
  const d = new Date(ex.dateFin)
  return isNaN(d.getTime()) ? 'N-1' : String(d.getFullYear() - 1)
}

// ── Variation percentage: (N - N-1) / |N-1| * 100 ──
export function variationPct(n: number, n1: number): number {
  if (n1 === 0) return 0
  return ((n - n1) / Math.abs(n1)) * 100
}

// ── Re-exports for convenience ──
export {
  getActifBrut, getAmortProv, getPassif,
  getCharges, getProduits, getBalanceSolde,
}
export type { EntrepriseData, BalanceEntry, ExerciceData }
