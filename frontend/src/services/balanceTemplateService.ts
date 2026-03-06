/**
 * Service de génération du modèle Excel de balance SYSCOHADA
 * 8 colonnes normalisées : Compte | Description | SD N-1 | SC N-1 | Mvt D N | Mvt C N | SD N | SC N
 */

import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import type { BalanceEntry } from './liasseDataService'

/** Canonical column headers */
export const BALANCE_HEADERS = [
  'Compte',
  'Description',
  'Solde Débit N-1',
  'Solde Crédit N-1',
  'Mouvement Débit N',
  'Mouvement Crédit N',
  'Solde Débit N',
  'Solde Crédit N',
] as const

/** Download empty template */
export function downloadBalanceTemplate(): string {
  const wb = XLSX.utils.book_new()

  const rows: any[][] = [
    [...BALANCE_HEADERS],
    [101000, 'Capital social',         0, 9000000,        0, 10000000,       0, 10000000],
    [411000, 'Clients',         4500000,       0,  5000000,        0, 5000000,        0],
    [601000, 'Achats de marchandises', 7000000, 0, 8000000, 0, 8000000, 0],
    [701000, 'Ventes de marchandises', 0, 13000000, 0, 15000000, 0, 15000000],
  ]

  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = [
    { wch: 14 },  // Compte
    { wch: 35 },  // Description
    { wch: 18 },  // Solde Débit N-1
    { wch: 18 },  // Solde Crédit N-1
    { wch: 18 },  // Mouvement Débit N
    { wch: 18 },  // Mouvement Crédit N
    { wch: 18 },  // Solde Débit N
    { wch: 18 },  // Solde Crédit N
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Balance')

  const filename = 'Modele_Balance_TaxPilot.xlsx'
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), filename)

  return filename
}

/** Export current balance data to Excel */
export function exportBalanceToExcel(entries: BalanceEntry[], filename?: string): string {
  const wb = XLSX.utils.book_new()

  const rows: any[][] = [
    [...BALANCE_HEADERS],
    ...entries.map(e => [
      e.compte,
      e.intitule,
      e.solde_debit_n1 ?? 0,
      e.solde_credit_n1 ?? 0,
      e.debit,
      e.credit,
      e.solde_debit,
      e.solde_credit,
    ]),
  ]

  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = [
    { wch: 14 },
    { wch: 35 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Balance')

  const fname = filename || `Balance_Export_${new Date().toISOString().slice(0, 10)}.xlsx`
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), fname)

  return fname
}
