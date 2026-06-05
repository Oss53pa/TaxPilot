/**
 * VÉRIFICATION PAGE PAR PAGE de la liasse générée à partir de la balance EPL SA
 * (colonne N déclarée). Dump structuré + contrôles de cohérence OHADA.
 */
import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { parseExcelFile, detectStructure, parseBalanceData } from '@/services/balanceParserService'
import { LiasseDataService } from '@/services/liasseDataService'

const BAL = 'C:/Users/admin/Downloads/Modele_Balance_2026_28052026 (1).xlsx'
const hasFile = fs.existsSync(BAL)
const r0 = (n: number) => Math.round(n)

describe.skipIf(!hasFile)('Vérification pages liasse — EPL SA', () => {
  it('génère et contrôle chaque page', () => {
    const bytes = new Uint8Array(fs.readFileSync(BAL))
    const sheets = parseExcelFile(bytes as unknown as ArrayBuffer)
    const parsed = parseBalanceData(sheets[0], detectStructure(sheets[0]).mapping!)
    const svc = new LiasseDataService()
    svc.loadBalance(parsed.entries)

    const actif = svc.generateBilanActif()
    const passif = svc.generateBilanPassif()
    const cr = svc.generateCompteResultat()
    const sig = svc.generateSIG()
    const coh = svc.validateCoherenceDetailed()
    const sumNet = (rows: { net: number }[]) => rows.reduce((s, x) => s + x.net, 0)
    const sumMt = (rows: { montant: number }[]) => rows.reduce((s, x) => s + x.montant, 0)
    const g = (ref: string) => sig.find(x => x.ref === ref)?.montant ?? null

    const report = {
      BILAN: {
        totalActifNet: r0(sumNet(actif)),
        totalPassif: r0(sumMt(passif)),
        ecart_equilibre: r0(coh.checks[0].ecart),
        actif_postes: actif.filter(a => a.net !== 0).map(a => ({ ref: a.ref, brut: r0(a.brut), amort: r0(a.amortProv), net: r0(a.net) })),
        passif_postes: passif.filter(p => p.montant !== 0).map(p => ({ ref: p.ref, montant: r0(p.montant) })),
        net_negatifs_anormaux: actif.filter(a => a.net < 0).map(a => ({ ref: a.ref, net: r0(a.net) })),
      },
      RESULTAT: {
        total_produits: r0(sumMt(cr.produits)),
        total_charges: r0(sumMt(cr.charges)),
        resultat_CdR: r0(svc.getResultatFromCompteResultat()),
        produits: cr.produits.filter(p => p.montant !== 0).map(p => ({ ref: p.ref, montant: r0(p.montant) })),
        charges: cr.charges.filter(c => c.montant !== 0).map(c => ({ ref: c.ref, montant: r0(c.montant) })),
      },
      SIG: { CA_XB: g('SIG2') ?? g('XB'), EBE: g('SIG4'), RES_EXPLOIT: g('SIG5'), RAO: g('SIG7'), RES_NET: g('SIG9'),
             all: sig.map(s => ({ ref: s.ref, montant: r0(s.montant) })) },
      COHERENCE: coh.checks.map(c => ({ code: c.code, ok: c.ok, ecart: r0(c.ecart), a: r0(c.valeurA), b: r0(c.valeurB) })),
    }
    fs.writeFileSync(path.resolve(__dirname, './fixtures/verif-pages-eplsa.json'), JSON.stringify(report, null, 2))
    expect(parsed.entries.length).toBeGreaterThan(0)
  })
})
