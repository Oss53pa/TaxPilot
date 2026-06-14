/**
 * Réconciliation des notes export (remap) — EPL.
 *  (A) UNIVERSEL : pour chaque note+type, Σ(lignes) == primitive(union dédupliquée
 *      des comptes) → détecte tout double-comptage intra-note.
 *  (B) MATÉRIEL : notes clés réconciliées à leur poste statement (ancrage OHADA).
 */
import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { parseExcelFile, detectStructure, parseBalanceData } from '@/services/balanceParserService'
import { getActifBrut, getPassif, getBalanceSolde } from '@/modules/liasse-fiscale/services/liasse-calculs'

const BAL = 'C:/Users/admin/Downloads/Modele_Balance_2026_28052026 (1).xlsx'
const REMAP = path.resolve(__dirname, './fixtures/remap-notes.json')
const hasAll = fs.existsSync(BAL) && fs.existsSync(REMAP)

// (B) Ancrages statement OHADA pour les notes matérielles à poste unique
const ANCHORS: Record<string, Partial<Record<string, string[]>>> = {
  'NOTE 6': { actif: ['31', '32', '33', '34', '35', '36', '37', '38'] },
  'NOTE 9': { actif: ['50'] },
  'NOTE 10': { actif: ['51'] },
  'NOTE 11': { actif: ['52', '53', '54', '55', '56', '57', '58'] },
  'NOTE 16A': { passif: ['16', '17', '18', '19'] },
  'NOTE 17': { passif: ['401', '402', '403', '404', '405', '408'] },
  'NOTE 22': { debit: ['601', '602', '604', '605', '608'] },
  'NOTE 23': { debit: ['61'] },
  'NOTE 24': { debit: ['62', '63'] },
  'NOTE 25': { debit: ['64'] },
  'NOTE 26': { debit: ['65'] },
  'NOTE 27A': { debit: ['66'] },
  'NOTE 29': { debit: ['67'], credit: ['77'] },
}

describe.skipIf(!hasAll)('Réconciliation notes export — EPL', () => {
  it('aucun double-comptage + notes matérielles réconciliées', () => {
    const sheets = parseExcelFile(new Uint8Array(fs.readFileSync(BAL)) as unknown as ArrayBuffer)
    const bal = parseBalanceData(sheets[0], detectStructure(sheets[0]).mapping!).entries as unknown as Parameters<typeof getActifBrut>[0]
    const notes = JSON.parse(fs.readFileSync(REMAP, 'utf-8')) as Array<{ sheet: string; injectable: boolean; rows: Array<{ comptes: string[]; type: string }> }>

    const valOf = (comptes: string[], type: string): number => {
      switch (type) {
        case 'actif': return getActifBrut(bal, comptes)
        case 'passif': return getPassif(bal, comptes)
        case 'credit': return -getBalanceSolde(bal, comptes)
        case 'debit': return getBalanceSolde(bal, comptes)
        default: return -getBalanceSolde(bal, comptes)
      }
    }

    const doublecounts: Record<string, unknown>[] = []
    const anchorEcarts: Record<string, unknown>[] = []

    for (const n of notes) {
      if (!n.injectable) continue
      const types = [...new Set(n.rows.map(r => r.type))]
      for (const type of types) {
        const rowsOfType = n.rows.filter(r => r.type === type)
        const sumRows = rowsOfType.reduce((s, r) => s + valOf(r.comptes, type), 0)
        const union = [...new Set(rowsOfType.flatMap(r => r.comptes))]
        const sumUnion = valOf(union, type)
        // (A) Σlignes doit == primitive(union) — sinon double-comptage de préfixes
        if (Math.abs(sumRows - sumUnion) > 1) doublecounts.push({ sheet: n.sheet, type, sumRows: Math.round(sumRows), sumUnion: Math.round(sumUnion), ecart: Math.round(sumRows - sumUnion) })
        // (B) ancrage statement
        const anchor = ANCHORS[n.sheet]?.[type]
        if (anchor) {
          const ec = Math.round(sumRows - valOf(anchor, type))
          if (Math.abs(ec) > 1) anchorEcarts.push({ sheet: n.sheet, type, note: Math.round(sumRows), anchor: Math.round(valOf(anchor, type)), ecart: ec })
        }
      }
    }

    fs.writeFileSync(path.resolve(__dirname, './fixtures/audit-export-reconcile.json'), JSON.stringify({ doublecounts, anchorEcarts }, null, 2))
    expect(doublecounts).toEqual([])   // (A) zéro double-comptage
    expect(anchorEcarts).toEqual([])   // (B) notes matérielles réconciliées
  })
})
