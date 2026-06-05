/**
 * AUDIT LIGNE À LIGNE des notes annexes vs ancrages bilan/résultat (EPL SA).
 */
import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { parseExcelFile, detectStructure, parseBalanceData } from '@/services/balanceParserService'
import { LiasseDataService } from '@/services/liasseDataService'

const BAL = 'C:/Users/admin/Downloads/Modele_Balance_2026_28052026 (1).xlsx'
const hasFile = fs.existsSync(BAL)
const r0 = (n: number) => Math.round(n)
const sum = (rows: Record<string, unknown>[], field: string) => rows.reduce((s, x) => s + (Number(x[field]) || 0), 0)

describe.skipIf(!hasFile)('AUDIT notes EPL', () => {
  it('réconcilie chaque note', () => {
    const sheets = parseExcelFile(new Uint8Array(fs.readFileSync(BAL)) as unknown as ArrayBuffer)
    const svc = new LiasseDataService()
    svc.loadBalance(parseBalanceData(sheets[0], detectStructure(sheets[0]).mapping!).entries)

    const actif = svc.generateBilanActif()
    const cr = svc.generateCompteResultat()
    const an = (refs: string[]) => actif.filter(a => refs.includes(a.ref)).reduce((s, a) => s + a.net, 0)
    const crp = (ref: string) => cr.produits.find(p => p.ref === ref)?.montant ?? 0
    const crc = (ref: string) => cr.charges.find(c => c.ref === ref)?.montant ?? 0

    const n3a = svc.generateNote3A()
    const n6 = svc.generateNote6()
    const n11 = svc.generateNote11()
    const n14 = svc.generateNote14()
    const n17 = svc.generateNote17()
    const n19 = svc.generateNote19()

    const audit = {
      Note3A_immo: {
        note_net: r0(sum(n3a, 'valeurNette')),
        bilan_immo_net: r0(an(['AD','AE','AF','AG','AJ','AK','AL','AM','AN','AU'])),
        lignes_negatives: n3a.filter(r => (Number(r.valeurNette)||0) < -1).map(r => ({ d: r.designation, net: r0(Number(r.valeurNette)) })),
      },
      Note6_corporel: {
        note_net: r0(sum(n6, 'valeurNette')),
        bilan_corporel_net: r0(an(['AJ','AK','AL','AM','AN'])),
        lignes_negatives: n6.filter(r => (Number(r.valeurNette)||0) < -1).map(r => ({ d: r.label, net: r0(Number(r.valeurNette)) })),
      },
      Note11_capitaux: {
        lignes: n11.map(r => ({ d: r.designation, n: r0(Number(r.montantN)) })),
      },
      Note14_dettes: {
        note_total: r0(sum(n14, 'montantN')),
      },
      Note17_CA: {
        note_prestations: r0(Number(n17.find(r => r.id === 'prestations_services')?.montantN) || 0),
        cdr_TC: r0(crp('TC')),
        ecart_vs_CdR: r0((Number(n17.find(r => r.id === 'prestations_services')?.montantN) || 0) - crp('TC')),
      },
      Note19_personnel: {
        note_total: r0(sum(n19, 'montantN')),
        cdr_RK_personnel_66: r0(crc('RK')),
        cdr_RI_impots_64: r0(crc('RI')),
        lignes: n19.map(r => ({ d: r.designation, n: r0(Number(r.montantN)) })),
      },
    }
    fs.writeFileSync(path.resolve(__dirname, './fixtures/audit-notes-eplsa.json'), JSON.stringify(audit, null, 2))

    // Réconciliations OHADA (notes ⇄ bilan/résultat) — toutes à 0
    expect(Math.abs(audit.Note3A_immo.note_net - audit.Note3A_immo.bilan_immo_net)).toBeLessThanOrEqual(1)
    expect(audit.Note3A_immo.lignes_negatives.length).toBe(0)
    expect(Math.abs(audit.Note6_corporel.note_net - audit.Note6_corporel.bilan_corporel_net)).toBeLessThanOrEqual(1)
    expect(audit.Note6_corporel.lignes_negatives.length).toBe(0)
    expect(Math.abs(audit.Note17_CA.ecart_vs_CdR)).toBeLessThanOrEqual(1)
    expect(Math.abs(audit.Note19_personnel.note_total - audit.Note19_personnel.cdr_RK_personnel_66)).toBeLessThanOrEqual(1)
  })
})
