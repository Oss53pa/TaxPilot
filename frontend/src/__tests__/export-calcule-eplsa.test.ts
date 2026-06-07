/**
 * Vérifie que l'export Mode B produit un fichier CALCULÉ (valeurs injectées +
 * formules de totaux) et qu'un export vide est BLOQUÉ. Sert le template depuis le
 * disque (fetch mocké) et capture le classeur (XLSX.writeFile mocké).
 */
import { describe, it, expect, vi } from 'vitest'
import fs from 'fs'
import path from 'path'

// Mock UNIQUEMENT XLSX.writeFile (capture le classeur), le reste de xlsx reste réel.
vi.mock('xlsx', async (orig) => {
  const actual = await orig<typeof import('xlsx')>()
  return { ...actual, writeFile: vi.fn() }
})

import * as XLSX from 'xlsx'
import { exportModeB } from '@/modules/liasse-fiscale/services/liasse-export-modele'
import { parseExcelFile, detectStructure, parseBalanceData } from '@/services/balanceParserService'
import type { EntrepriseData, BalanceEntry } from '@/modules/liasse-fiscale/types'

const BAL = 'C:/Users/admin/Downloads/Modele_Balance_TaxPilot_2025_AJM.xlsx'
const ALT = 'C:/Users/admin/Downloads/Modele_Balance_2026_28052026 (1).xlsx'
const TEMPLATE = path.resolve(__dirname, '../../public/templates/Liasse_systeme_normal_2024_V9_AJM.xlsx')
const balFile = fs.existsSync(BAL) ? BAL : (fs.existsSync(ALT) ? ALT : null)
const canRun = !!balFile && fs.existsSync(TEMPLATE)

const ENT = { denomination: 'EPL SA', exercice_clos: '31/12/2025' } as unknown as EntrepriseData

function loadBalance(): BalanceEntry[] {
  const sheets = parseExcelFile(new Uint8Array(fs.readFileSync(balFile!)) as unknown as ArrayBuffer)
  return parseBalanceData(sheets[0], detectStructure(sheets[0]).mapping!).entries as unknown as BalanceEntry[]
}

describe.skipIf(!canRun)('Export Mode B — fichier calculé', () => {
  it('produit un classeur avec valeurs + formules, et bloque un export vide', async () => {
    // fetch → template disque
    const tplBuf = new Uint8Array(fs.readFileSync(TEMPLATE)).buffer
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, statusText: 'OK', arrayBuffer: async () => tplBuf })))
    const writeFileMock = XLSX.writeFile as unknown as ReturnType<typeof vi.fn>

    // 1) Export calculé sur la vraie balance → ne throw pas
    await exportModeB(loadBalance(), [], ENT, [])
    expect(writeFileMock).toHaveBeenCalled()

    // Le classeur capturé porte des VALEURS et des FORMULES dans les états financiers
    const wb = writeFileMock.mock.calls[0][0] as XLSX.WorkBook
    expect(wb).toBeTruthy()
    let valeurs = 0, formules = 0
    for (const sh of ['BILAN', 'RESULTAT']) {
      const ws = wb.Sheets[sh]; if (!ws) continue
      for (const k of Object.keys(ws)) {
        if (k[0] === '!') continue
        const c = ws[k] as { v?: unknown; f?: unknown }
        if (c?.f) formules++
        else if (typeof c?.v === 'number' && c.v !== 0) valeurs++
      }
    }
    expect(valeurs).toBeGreaterThan(20)   // détail bien chiffré
    expect(formules).toBeGreaterThan(0)   // totaux en formules

    // 2) Export vide (balance vide) → DOIT throw (jamais de fichier non calculé)
    await expect(exportModeB([], [], ENT, [])).rejects.toThrow(/non calcul/i)

    vi.unstubAllGlobals()
  })
})
