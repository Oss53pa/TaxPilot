/**
 * Vérifie le PIPELINE D'IMPORT RÉEL de l'app sur la vraie balance EMERGENCE :
 * parseExcelFile -> detectStructure (auto-détection colonnes) -> parseBalanceData
 * -> LiasseDataService. C'est exactement le chemin déclenché par "Import Balance"
 * dans l'UI. On dumpe ce que l'app détecte et calcule pour comparaison.
 */
import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { parseExcelFile, detectStructure, parseBalanceData } from '@/services/balanceParserService'
import { LiasseDataService } from '@/services/liasseDataService'

const BAL = 'C:/Users/admin/Downloads/BALANCE 2024 AJM_30042024_V3.xlsx'

// Diagnostic local : ne s'exécute que si le fichier balance est présent
// (skip automatique en CI / sur une autre machine).
const hasFile = fs.existsSync(BAL)

describe.skipIf(!hasFile)('Pipeline import réel — balance EMERGENCE', () => {
  it('parse + génère la liasse', () => {
    const bytes = new Uint8Array(fs.readFileSync(BAL))
    const sheets = parseExcelFile(bytes as unknown as ArrayBuffer)
    const detection = detectStructure(sheets[0])

    const out: Record<string, unknown> = {
      sheetCount: sheets.length,
      detectedMapping: detection.mapping,
      confidence: detection.confidence,
      rowCount: detection.rowCount,
      headers: detection.headers?.slice(0, 26),
    }

    if (detection.mapping) {
      const parsed = parseBalanceData(sheets[0], detection.mapping)
      const svc = new LiasseDataService()
      svc.loadBalance(parsed.entries)
      const detail = svc.validateCoherenceDetailed()
      const sig = svc.generateSIG()
      const g = (r: string) => sig.find(x => x.ref === r)?.montant
      Object.assign(out, {
        entries: parsed.entries.length,
        validRows: parsed.validRows,
        skippedRows: parsed.skippedRows,
        warnings: parsed.warnings.slice(0, 8),
        sumSoldeDebit: parsed.entries.reduce((s, e) => s + (e.solde_debit || 0), 0),
        sumSoldeCredit: parsed.entries.reduce((s, e) => s + (e.solde_credit || 0), 0),
        totalActif: detail.checks[0].valeurA,
        totalPassif: detail.checks[0].valeurB,
        ecartBilan: detail.checks[0].ecart,
        resultatNet: svc.getResultatFromCompteResultat(),
        EBE_SIG4: g('SIG4'),
        resExploitation_SIG5: g('SIG5'),
        RAO_SIG7: g('SIG7'),
        resultatNet_SIG9: g('SIG9'),
      })
    }

    fs.writeFileSync(
      path.resolve(__dirname, './fixtures/import-pipeline-result.json'),
      JSON.stringify(out, null, 2)
    )
    expect(sheets.length).toBeGreaterThan(0)
  })
})
