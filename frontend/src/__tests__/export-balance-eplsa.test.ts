/**
 * GARDE D'UNIFICATION moteur export ⇄ moteur écran, sur la balance réelle EPL SA.
 * Vérifie que :
 *   1. Le moteur d'export (constants/syscohada-mappings + liasse-calculs) équilibre
 *      BZ = DZ, une fois le résultat reporté dans CJ (comme le fait computeAllValues).
 *   2. Le total bilan export ≈ le total bilan écran (liasseDataService) → les deux
 *      moteurs réconcilient (anti-drift de la dérive double-mapping).
 */
import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { parseExcelFile, detectStructure, parseBalanceData } from '@/services/balanceParserService'
import { getActifBrut, getAmortProv, getPassif, getBalanceSolde } from '@/modules/liasse-fiscale/services/liasse-calculs'
import { BILAN_ACTIF, BILAN_PASSIF } from '@/constants/syscohada-mappings'
import { LiasseDataService } from '@/services/liasseDataService'

const BAL = 'C:/Users/admin/Downloads/Modele_Balance_2026_28052026 (1).xlsx'
const hasFile = fs.existsSync(BAL)

describe.skipIf(!hasFile)('Unification export ⇄ écran — EPL SA', () => {
  it('export équilibre BZ=DZ et réconcilie avec l’écran', () => {
    const bytes = new Uint8Array(fs.readFileSync(BAL))
    const sheets = parseExcelFile(bytes as unknown as ArrayBuffer)
    const parsed = parseBalanceData(sheets[0], detectStructure(sheets[0]).mapping!)
    const bal = parsed.entries as unknown as Parameters<typeof getActifBrut>[0]

    // Résultat calculé par le moteur ÉCRAN (source de vérité)
    const svc = new LiasseDataService()
    svc.loadBalance(parsed.entries)
    const resultat = svc.getResultatFromCompteResultat()
    const ecran = svc.validateCoherenceDetailed().checks[0]

    // ACTIF export : somme des nets de tous les postes détail
    let BZ = 0
    for (const ref of Object.keys(BILAN_ACTIF)) {
      const m = (BILAN_ACTIF as Record<string, { comptes: readonly string[]; amort: readonly string[] }>)[ref]
      BZ += getActifBrut(bal, m.comptes) - (m.amort.length ? getAmortProv(bal, m.amort) : 0)
    }

    // PASSIF export : règles de computeAllValues + injection résultat dans CJ
    const hasClass13 = Math.abs(getBalanceSolde(bal, ['13'])) > 0.5
    const hasPL = parsed.entries.some(e => e.compte.startsWith('6') || e.compte.startsWith('7'))
    const signed = new Set(['CH'])
    let DZ = 0
    for (const ref of Object.keys(BILAN_PASSIF)) {
      const m = (BILAN_PASSIF as Record<string, { comptes: readonly string[] }>)[ref]
      let montant: number
      if (ref === 'CB') montant = -Math.abs(getBalanceSolde(bal, m.comptes))
      else if (ref === 'CJ') montant = (!hasClass13 && hasPL) ? resultat : -getBalanceSolde(bal, m.comptes)
      else if (signed.has(ref)) montant = -getBalanceSolde(bal, m.comptes)
      else montant = getPassif(bal, m.comptes)
      DZ += montant
    }

    const out = {
      BZ_export: Math.round(BZ), DZ_export: Math.round(DZ), ecart_export: Math.round(BZ - DZ),
      totalActif_ecran: Math.round(ecran.valeurA), totalPassif_ecran: Math.round(ecran.valeurB),
      resultat, ecart_BZ_vs_ecran: Math.round(BZ - ecran.valeurA),
    }
    fs.writeFileSync(path.resolve(__dirname, './fixtures/export-balance-eplsa.json'), JSON.stringify(out, null, 2))

    // 1) Le moteur export boucle
    expect(Math.abs(BZ - DZ)).toBeLessThanOrEqual(1)
    // 2) Les deux moteurs réconcilient sur le total général
    expect(Math.abs(BZ - ecran.valeurA)).toBeLessThanOrEqual(1)
  })
})
