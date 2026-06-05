/**
 * Valide le REMAP des notes export (remap-notes.json appliqué à computeAllValues)
 * sur la balance EPL : calcule le total de chaque note via les mêmes primitives
 * que le moteur export, et réconcilie les notes matérielles aux postes du bilan/CdR.
 */
import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { parseExcelFile, detectStructure, parseBalanceData } from '@/services/balanceParserService'
import { getActifBrut, getPassif, getBalanceSolde } from '@/modules/liasse-fiscale/services/liasse-calculs'

const BAL = 'C:/Users/admin/Downloads/Modele_Balance_2026_28052026 (1).xlsx'
const REMAP = path.resolve(__dirname, './fixtures/remap-notes.json')
const hasAll = fs.existsSync(BAL) && fs.existsSync(REMAP)

describe.skipIf(!hasAll)('AUDIT notes export (remap) — EPL', () => {
  it('calcule + réconcilie', () => {
    const sheets = parseExcelFile(new Uint8Array(fs.readFileSync(BAL)) as unknown as ArrayBuffer)
    const bal = parseBalanceData(sheets[0], detectStructure(sheets[0]).mapping!).entries as unknown as Parameters<typeof getActifBrut>[0]
    const notes = JSON.parse(fs.readFileSync(REMAP, 'utf-8')) as Array<{ sheet: string; injectable: boolean; rows: Array<{ row: number; comptes: string[]; type: string }> }>

    const valOf = (comptes: string[], type: string): number => {
      switch (type) {
        case 'actif': return getActifBrut(bal, comptes)
        case 'passif': return getPassif(bal, comptes)
        case 'credit': return -getBalanceSolde(bal, comptes)
        case 'debit': return getBalanceSolde(bal, comptes)
        default: return -getBalanceSolde(bal, comptes)
      }
    }

    const totals: Record<string, number> = {}
    const byType: Record<string, Record<string, number>> = {}
    let nan = 0
    for (const n of notes) {
      if (!n.injectable) continue
      let t = 0
      const bt: Record<string, number> = {}
      for (const r of n.rows) {
        const v = valOf(r.comptes, r.type)
        if (!Number.isFinite(v)) nan++
        t += v
        bt[r.type] = (bt[r.type] || 0) + v
      }
      totals[n.sheet] = Math.round(t)
      byType[n.sheet] = bt
    }

    // Ancrages statement (EPL, col N)
    const personnel66 = getBalanceSolde(bal, ['66'])                 // charges personnel (débit net)
    const fournisseurs = getPassif(bal, ['401', '402', '403', '404', '405', '408'])
    const ca = -getBalanceSolde(bal, ['701', '702', '703', '704', '705', '706', '707'])

    const out = { totals, anchors: { personnel66: Math.round(personnel66), fournisseurs: Math.round(fournisseurs), ca: Math.round(ca) }, nan }
    fs.writeFileSync(path.resolve(__dirname, './fixtures/audit-export-notes-eplsa.json'), JSON.stringify(out, null, 2))

    expect(nan).toBe(0)
    // Réconciliations matérielles par type de ligne (notes export ⇄ comptes statement)
    expect(Math.abs((byType['NOTE 27A']?.debit || 0) - personnel66)).toBeLessThanOrEqual(1)   // charges de personnel (66)
    expect(Math.abs((byType['NOTE 17']?.passif || 0) - fournisseurs)).toBeLessThanOrEqual(1)   // fournisseurs d'exploitation (401-408)
  })
})
