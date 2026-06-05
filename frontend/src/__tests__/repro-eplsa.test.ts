/**
 * REPRO DIAGNOSTIC — balance EPL SA (Modele_Balance_2026_28052026).
 * Calcule le bilan DEUX façons :
 *   (A) à partir des colonnes "Solde N"   (cols 7-8) — ce que l'app utilise
 *   (B) à partir des colonnes "Solde N-1" (cols 3-4) — par swap
 * et compare aux chiffres de la liasse cabinet 2025.
 */
import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { parseExcelFile, detectStructure, parseBalanceData } from '@/services/balanceParserService'
import { LiasseDataService, type BalanceEntry } from '@/services/liasseDataService'

const BAL = 'C:/Users/admin/Downloads/Modele_Balance_2026_28052026 (1).xlsx'
const hasFile = fs.existsSync(BAL)

// Cabinet 2025 (référence)
const REF = { totalActif: 11461960172.74, resultatNet: 328521842, immoNet: 9262597103.74 }

function totals(entries: BalanceEntry[]) {
  const svc = new LiasseDataService()
  svc.loadBalance(entries)
  const d = svc.validateCoherenceDetailed()
  const actif = svc.generateBilanActif()
  const immoRefs = ['AQ','AR','AS','AD','AE','AF','AG','AJ','AK','AL','AM','AN','AP','AT','AU']
  const immoNet = actif.filter(r => immoRefs.includes(r.ref)).reduce((s, r) => s + r.net, 0)
  const minImmoNet = Math.min(...actif.filter(r => immoRefs.includes(r.ref)).map(r => r.net))
  return {
    totalActif: Math.round(d.checks[0].valeurA),
    totalPassif: Math.round(d.checks[0].valeurB),
    ecart: Math.round(d.checks[0].ecart),
    resultatNet: Math.round(svc.getResultatFromCompteResultat()),
    immoNet: Math.round(immoNet),
    minImmoNet: Math.round(minImmoNet),
    sumSD: Math.round(entries.reduce((s, e) => s + (e.solde_debit || 0), 0)),
    sumSC: Math.round(entries.reduce((s, e) => s + (e.solde_credit || 0), 0)),
  }
}

describe.skipIf(!hasFile)('REPRO EPL SA — N vs N-1', () => {
  it('compare les deux colonnes au cabinet', () => {
    const bytes = new Uint8Array(fs.readFileSync(BAL))
    const sheets = parseExcelFile(bytes as unknown as ArrayBuffer)
    const detection = detectStructure(sheets[0])
    const parsed = parseBalanceData(sheets[0], detection.mapping!)

    // (A) tel quel : utilise solde_debit/credit = cols "N" (7-8)
    const A = totals(parsed.entries)

    // (B) swap : solde N := solde N-1 (cols 3-4)
    const swapped: BalanceEntry[] = parsed.entries.map(e => ({
      ...e,
      solde_debit: e.solde_debit_n1 || 0,
      solde_credit: e.solde_credit_n1 || 0,
    }))
    const B = totals(swapped)

    const out = {
      reference_cabinet_2025: REF,
      A_colonnes_N_7_8: A,
      B_colonnes_N1_3_4: B,
      ecart_A_vs_ref_totalActif: A.totalActif - REF.totalActif,
      ecart_B_vs_ref_totalActif: B.totalActif - REF.totalActif,
      ecart_A_vs_ref_immoNet: A.immoNet - REF.immoNet,
      ecart_B_vs_ref_immoNet: B.immoNet - REF.immoNet,
    }
    fs.writeFileSync(path.resolve(__dirname, './fixtures/repro-eplsa-result.json'), JSON.stringify(out, null, 2))

    // Garde-fous de non-régression (balance EPL SA) :
    // 1) La balance est équilibrée → le bilan généré DOIT boucler (col N).
    expect(Math.abs(A.ecart)).toBeLessThanOrEqual(1)
    // 2) Le jeu de colonnes "N-1" (clôture 2025 auditée) doit reproduire le
    //    bilan du cabinet au franc près (cœur de la correction du sélecteur).
    expect(Math.abs(B.totalActif - REF.totalActif)).toBeLessThanOrEqual(1)
    expect(Math.abs(B.immoNet - REF.immoNet)).toBeLessThanOrEqual(1)
    // 3) Ventilation amort au prorata : aucun poste d'immobilisation ne doit
    //    ressortir en net négatif (ex. terrains sur-amortis par un amort générique).
    expect(A.minImmoNet).toBeGreaterThanOrEqual(-1)
  })
})
