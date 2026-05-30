/**
 * Vérifie que le MOTEUR D'EXPORT (constants/syscohada-mappings + liasse-calculs)
 * équilibre BZ=DZ sur la balance réelle EPL SA — chemin distinct de l'écran.
 */
import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { parseExcelFile, detectStructure, parseBalanceData } from '@/services/balanceParserService'
import { getActifBrut, getAmortProv, getPassif, getBalanceSolde } from '@/modules/liasse-fiscale/services/liasse-calculs'
import { BILAN_ACTIF, BILAN_PASSIF } from '@/constants/syscohada-mappings'

const BAL = 'C:/Users/admin/Downloads/Modele_Balance_2026_28052026 (1).xlsx'

// SKIP — spec exécutable d'un BUG CONFIRMÉ du moteur d'export (à arbitrer) :
// le résultat de l'exercice (XI, calculé depuis les classes 6/7) n'est JAMAIS
// reporté dans le poste bilan CJ. CJ = -solde(compte 13). Sur une balance
// PRÉ-AFFECTATION (résultat encore en classes 6/7, compte 13 vide — cas normal),
// CJ = 0 → le bilan exporté affiche un résultat net nul et ne boucle pas
// (écart ≈ 38 M sur EPL SA). Correctif = injecter XI dans CJ quand compte 13
// vide, ce qui suppose de fiabiliser le calcul XI du moteur canonique
// (cf TODO(UNIFY-MAPPINGS)). Décision produit requise avant fix.
describe.skip('Export engine — équilibre BZ=DZ EPL SA (bug connu)', () => {
  it('BZ ≈ DZ (résultat inclus)', () => {
    const bytes = new Uint8Array(fs.readFileSync(BAL))
    const sheets = parseExcelFile(bytes as unknown as ArrayBuffer)
    const parsed = parseBalanceData(sheets[0], detectStructure(sheets[0]).mapping!)
    // parseBalanceData → BalanceEntry de liasseDataService (intitule) ; les helpers
    // liasse-calculs attendent le BalanceEntry du module (libelle). Ils ne lisent
    // que compte + soldes → cast sûr.
    const bal = parsed.entries as unknown as Parameters<typeof getActifBrut>[0]

    // ACTIF : somme des nets de tous les postes détail
    let BZ = 0
    for (const ref of Object.keys(BILAN_ACTIF)) {
      const m = (BILAN_ACTIF as Record<string, { comptes: readonly string[]; amort: readonly string[] }>)[ref]
      BZ += getActifBrut(bal, m.comptes) - (m.amort.length ? getAmortProv(bal, m.amort) : 0)
    }

    // PASSIF : mêmes règles que computeAllValues (CB=debit, CH/CJ=signed, sinon getPassif)
    const signed = new Set(['CH', 'CJ'])
    let DZ = 0
    for (const ref of Object.keys(BILAN_PASSIF)) {
      const m = (BILAN_PASSIF as Record<string, { comptes: readonly string[] }>)[ref]
      let montant: number
      if (ref === 'CB') montant = -Math.abs(getBalanceSolde(bal, m.comptes)) // déduit
      else if (signed.has(ref)) montant = -getBalanceSolde(bal, m.comptes)
      else montant = getPassif(bal, m.comptes)
      DZ += montant
    }

    const out = { BZ: Math.round(BZ), DZ: Math.round(DZ), ecart: Math.round(BZ - DZ) }
    fs.writeFileSync(path.resolve(__dirname, './fixtures/export-balance-eplsa.json'), JSON.stringify(out, null, 2))
    expect(Math.abs(BZ - DZ)).toBeLessThanOrEqual(1)
  })
})
