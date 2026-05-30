/**
 * Diagnostic poste-par-poste sur la balance réelle EPLSA — écrit un rapport
 * JSON pour identifier les écarts BZ/DZ et les comptes orphelins (non mappés).
 */
import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { parseExcelFile, detectStructure, parseBalanceData } from '@/services/balanceParserService'
import {
  getActifBrut,
  getAmortProv,
  getPassif,
  getBalanceSolde,
} from '@/modules/liasse-fiscale/services/liasse-calculs'
import { BILAN_ACTIF, BILAN_PASSIF } from '@/constants/syscohada-mappings'

const BAL = 'C:/Users/admin/Downloads/Modele_Balance_2026_28052026 (1).xlsx'

type ActifMap = Record<string, { comptes: readonly string[]; amort: readonly string[] }>
type PassifMap = Record<string, { comptes: readonly string[] }>

describe.skipIf(!fs.existsSync(BAL))('Diag EPLSA poste-par-poste', () => {
  it('produit le rapport diag-eplsa-poste.json', () => {
    const bytes = new Uint8Array(fs.readFileSync(BAL))
    const sheets = parseExcelFile(bytes as unknown as ArrayBuffer)
    const parsed = parseBalanceData(sheets[0], detectStructure(sheets[0]).mapping!)
    const bal = parsed.entries as unknown as Parameters<typeof getActifBrut>[0]

    const usedActif = new Set<string>()
    const usedPassif = new Set<string>()
    for (const m of Object.values(BILAN_ACTIF as ActifMap)) {
      m.comptes.forEach((c) => usedActif.add(c))
      m.amort.forEach((c) => usedActif.add(c))
    }
    for (const m of Object.values(BILAN_PASSIF as PassifMap)) {
      m.comptes.forEach((c) => usedPassif.add(c))
    }

    let BZ = 0
    const actifBreakdown = Object.entries(BILAN_ACTIF as ActifMap).map(([ref, m]) => {
      const brut = getActifBrut(bal, m.comptes)
      const amort = m.amort.length ? getAmortProv(bal, m.amort) : 0
      const net = brut - amort
      BZ += net
      return {
        ref,
        comptes: [...m.comptes],
        amort: [...m.amort],
        brut: Math.round(brut),
        amortProv: Math.round(amort),
        net: Math.round(net),
      }
    })

    const signed = new Set(['CH', 'CJ'])
    let DZ = 0
    const passifBreakdown = Object.entries(BILAN_PASSIF as PassifMap).map(([ref, m]) => {
      let val: number
      if (ref === 'CB') val = -Math.abs(getBalanceSolde(bal, m.comptes))
      else if (signed.has(ref)) val = -getBalanceSolde(bal, m.comptes)
      else val = getPassif(bal, m.comptes)
      DZ += val
      return { ref, comptes: [...m.comptes], value: Math.round(val) }
    })

    const orphans: { compte: string; intitule: string; solde_debit: number; solde_credit: number; net: number }[] = []
    for (const e of bal as unknown as { compte: string; intitule?: string; libelle?: string; solde_debit?: number; solde_credit?: number }[]) {
      const c = String(e.compte || '')
      if (!/^[1-5]/.test(c)) continue
      const inActif = [...usedActif].some((p) => c.startsWith(p))
      const inPassif = [...usedPassif].some((p) => c.startsWith(p))
      if (!inActif && !inPassif) {
        const sd = Number(e.solde_debit) || 0
        const sc = Number(e.solde_credit) || 0
        orphans.push({
          compte: c,
          intitule: String(e.intitule || e.libelle || ''),
          solde_debit: Math.round(sd),
          solde_credit: Math.round(sc),
          net: Math.round(sd - sc),
        })
      }
    }
    orphans.sort((a, b) => Math.abs(b.net) - Math.abs(a.net))

    const out = {
      BZ: Math.round(BZ),
      DZ: Math.round(DZ),
      ecart: Math.round(BZ - DZ),
      actifBreakdown,
      passifBreakdown,
      orphansCount: orphans.length,
      orphansTotalNet: Math.round(orphans.reduce((s, o) => s + o.net, 0)),
      orphans,
    }
    fs.writeFileSync(
      path.resolve(__dirname, './fixtures/diag-eplsa-poste.json'),
      JSON.stringify(out, null, 2),
    )
    expect(out.BZ).toBeGreaterThan(0)
  })
})
