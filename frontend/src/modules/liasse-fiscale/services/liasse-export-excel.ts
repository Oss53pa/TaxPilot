import * as XLSX from 'xlsx'
import type { BalanceEntry, EntrepriseData } from '../types'
import { BUILDERS } from './builders'

// ── 84 onglets dans l'ordre exact du fichier Excel de reference ──
const ONGLETS = [
  'COUVERTURE',
  'GARDE',
  'RECEVABILITE',
  'NOTE36 (TABLE DES CODES)',
  'NOTE36 Suite (Nomenclature)',
  'FICHE R1',
  'FICHE R2',
  'FICHE R3',
  'BILAN',
  'ACTIF',
  'PASSIF',
  'RESULTAT',
  'TFT',
  'FICHE R4',
  'NOTE 1',
  'NOTE 2',
  'NOTE 3A',
  'NOTE 3B',
  'NOTE 3C',
  'NOTE 3C BIS',
  'NOTE 3D',
  'NOTE 3E',
  'NOTE 4',
  'NOTE 5',
  'NOTE 6',
  'NOTE 7',
  'NOTE 8',
  'NOTE 8A',
  'NOTE 8B',
  'NOTE 8C',
  'NOTE 9',
  'NOTE 10',
  'NOTE 11',
  'NOTE 12',
  'NOTE 13',
  'NOTE 14',
  'NOTE 15A',
  'NOTE 15B',
  'NOTE 16A',
  'NOTE 16B',
  'NOTE 16B BIS',
  'NOTE 16C',
  'NOTE 17',
  'NOTE 18',
  'NOTE 19',
  'NOTE 20',
  'NOTE 21',
  'NOTE 22',
  'NOTE 23',
  'NOTE 24',
  'NOTE 25',
  'NOTE 26',
  'NOTE 27A',
  'NOTE 27B',
  'NOTE 28',
  'NOTE 29',
  'NOTE 30',
  'NOTE 31',
  'NOTE 32',
  'NOTE 33',
  'NOTE 34',
  'NOTE 35',
  'NOTE 37',
  'NOTE 38',
  'NOTE 39',
  'GARDE (DGI-INS)',
  'NOTES DGI - INS',
  'COMP-CHARGES',
  'COMP-TVA',
  'COMP-TVA (2)',
  'SUPPL1',
  'SUPPL2',
  'SUPPL3',
  'SUPPL4',
  'SUPPL5',
  'SUPPL6',
  'SUPPL7',
  'GARDE (BIC) ',
  'GARDE (BNC)',
  'GARDE (BA)',
  'GARDE (301)',
  'GARDE (302)',
  'GARDE(3)',
  'COMMENTAIRE',
] as const

export interface ExerciceData {
  annee: number
  dateDebut: string    // ex: '01/01/2024'
  dateFin: string      // ex: '31/12/2024'
  dureeMois: number
}

interface SheetData {
  rows: (string | number | null)[][]
  merges?: XLSX.Range[]
  cols?: XLSX.ColInfo[]
}

// ── Fonction principale d'export ──
export function exporterLiasse(
  balance: BalanceEntry[],
  balanceN1: BalanceEntry[],
  entreprise: EntrepriseData,
  exercice: ExerciceData,
): void {
  try {
    const wb = XLSX.utils.book_new()

    for (const nom of ONGLETS) {
      const builder = BUILDERS[nom]
      let data: SheetData
      try {
        data = builder
          ? builder(balance, balanceN1, entreprise, exercice)
          : { rows: [[]] }
      } catch (err) {
        console.error(`[Liasse Export] Erreur builder "${nom}":`, err)
        data = { rows: [[`ERREUR: ${nom}`]] }
      }

      const ws = XLSX.utils.aoa_to_sheet(data.rows)
      if (data.merges) ws['!merges'] = data.merges
      if (data.cols) ws['!cols'] = data.cols
      XLSX.utils.book_append_sheet(wb, ws, nom)
    }

    const denom = (entreprise.denomination || 'export').replace(/[\\/:*?"<>|]/g, '_')
    const filename = `Liasse_${denom}_${exercice.annee}.xlsx`
    XLSX.writeFile(wb, filename)
  } catch (err) {
    console.error('[Liasse Export] Erreur export:', err)
    alert(`Erreur lors de l'export Excel:\n${err instanceof Error ? err.message : String(err)}`)
  }
}

// ── Export pour usage dans le composant React ──
export default exporterLiasse
