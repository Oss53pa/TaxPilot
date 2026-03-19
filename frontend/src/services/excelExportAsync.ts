/**
 * excelExportAsync.ts — P3-3: Async Excel export with progress reporting
 * Wraps the existing exporterLiasse to report progress and avoid UI freezing.
 * Uses chunked processing with requestIdleCallback for non-blocking export.
 */
import * as XLSX from 'xlsx'
import type { BalanceEntry, EntrepriseData } from '@/modules/liasse-fiscale/types'
import type { ExerciceData } from '@/modules/liasse-fiscale/services/liasse-export-excel'

type ProgressCallback = (current: number, total: number, sheetName: string) => void

/**
 * Export liasse with progress reporting.
 * Returns the filename of the generated file.
 */
export async function exporterLiasseWithProgress(
  balance: BalanceEntry[],
  balanceN1: BalanceEntry[],
  entreprise: EntrepriseData,
  exercice: ExerciceData,
  onProgress?: ProgressCallback
): Promise<string> {
  // Dynamic import to keep initial bundle small
  const { ONGLETS, BUILDERS } = await import('@/modules/liasse-fiscale/services/liasse-export-excel')

  const wb = XLSX.utils.book_new()
  const total = ONGLETS.length

  for (let i = 0; i < total; i++) {
    const nom = ONGLETS[i]
    onProgress?.(i + 1, total, nom)

    // Yield to the main thread every 5 sheets to prevent UI freezing
    if (i > 0 && i % 5 === 0) {
      await new Promise(resolve => setTimeout(resolve, 0))
    }

    try {
      const builderKey = nom as keyof typeof BUILDERS
      const builder = BUILDERS[builderKey]
      if (builder) {
        const data = builder(balance, balanceN1, entreprise, exercice)
        const ws = XLSX.utils.aoa_to_sheet(data.rows)
        if (data.merges?.length) ws['!merges'] = data.merges
        if (data.cols?.length) ws['!cols'] = data.cols
        XLSX.utils.book_append_sheet(wb, ws, nom.substring(0, 31))
      } else {
        const ws = XLSX.utils.aoa_to_sheet([[]])
        XLSX.utils.book_append_sheet(wb, ws, nom.substring(0, 31))
      }
    } catch (err) {
      console.error(`[Export] Erreur onglet ${nom}:`, err)
      const ws = XLSX.utils.aoa_to_sheet([['Erreur de génération', String(err)]])
      XLSX.utils.book_append_sheet(wb, ws, nom.substring(0, 31))
    }
  }

  const denom = String(entreprise.denomination || 'Entreprise').replace(/[/\\?%*:|"<>]/g, '_').substring(0, 30)
  const filename = `Liasse_${denom}_${exercice.annee}.xlsx`
  XLSX.writeFile(wb, filename)

  return filename
}
