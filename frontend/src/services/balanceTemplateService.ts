/**
 * Service de génération du modèle Excel de balance
 * Utilise le même pattern que exportService.ts (XLSX + file-saver)
 */

import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export function downloadBalanceTemplate(): string {
  const wb = XLSX.utils.book_new()

  const rows = [
    [
      'N° Compte', 'Intitulé',
      'Débit', 'Crédit', 'Solde Débiteur', 'Solde Créditeur',
      'Débit N-1', 'Crédit N-1', 'Solde Débiteur N-1', 'Solde Créditeur N-1',
    ],
    [101000, 'Capital social',           0, 10000000, 0, 10000000,       0, 9000000, 0, 9000000],
    [411000, 'Clients',           5000000,        0, 5000000, 0,   4500000,       0, 4500000, 0],
    [601000, 'Achats de marchandises', 8000000, 0, 8000000, 0,   7000000,       0, 7000000, 0],
    [701000, 'Ventes de marchandises', 0, 15000000, 0, 15000000,  0, 13000000, 0, 13000000],
  ]

  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = [
    { wch: 14 },  // N° Compte
    { wch: 30 },  // Intitulé
    { wch: 16 },  // Débit
    { wch: 16 },  // Crédit
    { wch: 16 },  // Solde Débiteur
    { wch: 16 },  // Solde Créditeur
    { wch: 16 },  // Débit N-1
    { wch: 16 },  // Crédit N-1
    { wch: 18 },  // Solde Débiteur N-1
    { wch: 18 },  // Solde Créditeur N-1
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Balance')

  const filename = 'Modele_Balance_TaxPilot.xlsx'
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), filename)

  return filename
}
