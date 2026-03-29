/**
 * liasse-export-modele.ts — Mode B: Injection dans le modèle Excel officiel
 *
 * Charge le template SYSCOHADA (84 onglets), injecte les valeurs calculées
 * cellule par cellule, préserve toutes les formules et la mise en page.
 */

import * as XLSX from 'xlsx'
import { CELL_MAP, TEMPLATE_PATH, CONTROLES } from '@/config/liasseModelReference'
import { getActifBrut, getAmortProv, getPassif, getBalanceSolde, detecterAnomaliesActif, detecterAnomaliesPassif } from './liasse-calculs'
import { ALL_ACTIF_PREFIXES, ALL_PASSIF_PREFIXES, BILAN_ACTIF, BILAN_PASSIF, COMPTE_RESULTAT_MAPPING as CR, TFT_COMPTES } from '@/constants/syscohada-mappings'
import type { BalanceEntry, EntrepriseData } from '../types'

interface InjectionLog {
  sheet: string
  cell: string
  ref: string
  field: string
  value: number | string
  status: 'injected' | 'skipped_formula' | 'error'
}

/**
 * Calculate all REF values from the balance for injection into the template.
 * Returns a map of "ref.field" -> value
 */
function computeAllValues(
  balance: BalanceEntry[],
  balanceN1: BalanceEntry[],
  entreprise: EntrepriseData,
  balanceN2: BalanceEntry[] = []
): Record<string, number | string> {
  const vals: Record<string, number | string> = {}

  // Helper to compute actif line: brut, amort, netN (and N-1 from balanceN1)
  // This mirrors the logic in 10_Actif.tsx / 09_Bilan.tsx
  const actifMapping: Record<string, { comptes: string[]; amort: string[] }> = {
    AE: { comptes: [...BILAN_ACTIF.AE.comptes], amort: [...BILAN_ACTIF.AE.amort] },
    AF: { comptes: [...BILAN_ACTIF.AF.comptes], amort: [...BILAN_ACTIF.AF.amort] },
    AG: { comptes: [...BILAN_ACTIF.AG.comptes], amort: [...BILAN_ACTIF.AG.amort] },
    AH: { comptes: [...BILAN_ACTIF.AH.comptes], amort: [...BILAN_ACTIF.AH.amort] },
    AJ: { comptes: [...BILAN_ACTIF.AJ.comptes], amort: [...BILAN_ACTIF.AJ.amort] },
    AK: { comptes: [...BILAN_ACTIF.AK.comptes], amort: [...BILAN_ACTIF.AK.amort] },
    AL: { comptes: [...BILAN_ACTIF.AL.comptes], amort: [...BILAN_ACTIF.AL.amort] },
    AM: { comptes: [...BILAN_ACTIF.AM.comptes], amort: [...BILAN_ACTIF.AM.amort] },
    AN: { comptes: [...BILAN_ACTIF.AN.comptes], amort: [...BILAN_ACTIF.AN.amort] },
    AP: { comptes: [...BILAN_ACTIF.AP.comptes], amort: [...BILAN_ACTIF.AP.amort] },
    AR: { comptes: [...BILAN_ACTIF.AR.comptes], amort: [...BILAN_ACTIF.AR.amort] },
    AS: { comptes: [...BILAN_ACTIF.AS.comptes], amort: [...BILAN_ACTIF.AS.amort] },
    BA: { comptes: [...BILAN_ACTIF.BA.comptes], amort: [...BILAN_ACTIF.BA.amort] },
    BB: { comptes: [...BILAN_ACTIF.BB.comptes], amort: [...BILAN_ACTIF.BB.amort] },
    BH: { comptes: [...BILAN_ACTIF.BH.comptes], amort: [...BILAN_ACTIF.BH.amort] },
    BI: { comptes: [...BILAN_ACTIF.BI.comptes], amort: [...BILAN_ACTIF.BI.amort] },
    BJ: { comptes: [...BILAN_ACTIF.BJ.comptes], amort: [...BILAN_ACTIF.BJ.amort] },
    BQ: { comptes: [...BILAN_ACTIF.BQ.comptes], amort: [...BILAN_ACTIF.BQ.amort] },
    BR: { comptes: [...BILAN_ACTIF.BR.comptes], amort: [...BILAN_ACTIF.BR.amort] },
    BS: { comptes: [...BILAN_ACTIF.BS.comptes], amort: [...BILAN_ACTIF.BS.amort] },
    BU: { comptes: [...BILAN_ACTIF.BU.comptes], amort: [...BILAN_ACTIF.BU.amort] },
  }

  // Compute actif detail lines
  for (const [ref, map] of Object.entries(actifMapping)) {
    const brut = getActifBrut(balance, map.comptes)
    const amort = map.amort.length > 0 ? getAmortProv(balance, map.amort) : 0
    vals[`${ref}.brut`] = brut
    vals[`${ref}.amort`] = amort
    // N-1
    if (balanceN1.length > 0) {
      const brutN1 = getActifBrut(balanceN1, map.comptes)
      const amortN1 = map.amort.length > 0 ? getAmortProv(balanceN1, map.amort) : 0
      vals[`${ref}.netN1`] = brutN1 - amortN1
    } else {
      vals[`${ref}.netN1`] = 0
    }
  }

  // Compute actif sub-totals
  const sumBrut = (...refs: string[]) => refs.reduce((s, r) => s + (Number(vals[`${r}.brut`]) || 0), 0)
  const sumAmort = (...refs: string[]) => refs.reduce((s, r) => s + (Number(vals[`${r}.amort`]) || 0), 0)

  // AD = sum of AE..AH
  vals['AD.brut'] = sumBrut('AE', 'AF', 'AG', 'AH')
  vals['AD.amort'] = sumAmort('AE', 'AF', 'AG', 'AH')
  // AI = sum of AJ..AN
  vals['AI.brut'] = sumBrut('AJ', 'AK', 'AL', 'AM', 'AN')
  vals['AI.amort'] = sumAmort('AJ', 'AK', 'AL', 'AM', 'AN')
  // AQ = sum of AR,AS
  vals['AQ.brut'] = sumBrut('AR', 'AS')
  vals['AQ.amort'] = sumAmort('AR', 'AS')
  // BG = sum of BH,BI,BJ
  vals['BG.brut'] = sumBrut('BH', 'BI', 'BJ')
  vals['BG.amort'] = sumAmort('BH', 'BI', 'BJ')
  // AZ = AD+AI+AP+AQ
  vals['AZ.brut'] = sumBrut('AD', 'AI', 'AP', 'AQ')
  vals['AZ.amort'] = sumAmort('AD', 'AI', 'AP', 'AQ')
  // BK = BA+BB+BG
  vals['BK.brut'] = sumBrut('BA', 'BB', 'BG')
  vals['BK.amort'] = sumAmort('BA', 'BB', 'BG')
  // BT = BQ+BR+BS
  vals['BT.brut'] = sumBrut('BQ', 'BR', 'BS')
  vals['BT.amort'] = sumAmort('BQ', 'BR', 'BS')
  // BZ = AZ+BK+BT+BU
  vals['BZ.brut'] = sumBrut('AZ', 'BK', 'BT', 'BU')
  vals['BZ.amort'] = sumAmort('AZ', 'BK', 'BT', 'BU')

  // Net values for totals
  for (const ref of ['AD', 'AI', 'AQ', 'BG', 'AZ', 'BK', 'BT', 'BZ']) {
    vals[`${ref}.netN`] = (Number(vals[`${ref}.brut`]) || 0) - (Number(vals[`${ref}.amort`]) || 0)
  }

  // Passif mapping
  const passifMapping: Record<string, { comptes: string[]; special?: string }> = {
    CA: { comptes: [...BILAN_PASSIF.CA.comptes] },
    CB: { comptes: [...BILAN_PASSIF.CB.comptes], special: 'debit' },
    CD: { comptes: [...BILAN_PASSIF.CD.comptes] },
    CE: { comptes: [...BILAN_PASSIF.CE.comptes] },
    CF: { comptes: [...BILAN_PASSIF.CF.comptes] },
    CG: { comptes: [...BILAN_PASSIF.CG.comptes] },
    CH: { comptes: [...BILAN_PASSIF.CH.comptes], special: 'signed' },
    CJ: { comptes: [...BILAN_PASSIF.CJ.comptes], special: 'signed' },
    CL: { comptes: [...BILAN_PASSIF.CL.comptes] },
    CM: { comptes: [...BILAN_PASSIF.CM.comptes] },
    DA: { comptes: [...BILAN_PASSIF.DA.comptes] },
    DB: { comptes: [...BILAN_PASSIF.DB.comptes] },
    DC: { comptes: [...BILAN_PASSIF.DC.comptes] },
    DH: { comptes: [...BILAN_PASSIF.DH.comptes] },
    DI: { comptes: [...BILAN_PASSIF.DI.comptes] },
    DJ: { comptes: [...BILAN_PASSIF.DJ.comptes] },
    DK: { comptes: [...BILAN_PASSIF.DK.comptes] },
    DM: { comptes: [...BILAN_PASSIF.DM.comptes] },
    DN: { comptes: [...BILAN_PASSIF.DN.comptes] },
    DQ: { comptes: [...BILAN_PASSIF.DQ.comptes] },
    DR: { comptes: [...BILAN_PASSIF.DR.comptes] },
    DV: { comptes: [...BILAN_PASSIF.DV.comptes] },
  }

  for (const [ref, map] of Object.entries(passifMapping)) {
    let montant: number
    if (map.special === 'debit') {
      montant = Math.abs(getBalanceSolde(balance, map.comptes))
    } else if (map.special === 'signed') {
      montant = -getBalanceSolde(balance, map.comptes)
    } else {
      montant = getPassif(balance, map.comptes)
    }
    vals[`${ref}.netN`] = montant
    // N-1
    if (balanceN1.length > 0) {
      let montantN1: number
      if (map.special === 'debit') {
        montantN1 = Math.abs(getBalanceSolde(balanceN1, map.comptes))
      } else if (map.special === 'signed') {
        montantN1 = -getBalanceSolde(balanceN1, map.comptes)
      } else {
        montantN1 = getPassif(balanceN1, map.comptes)
      }
      vals[`${ref}.netN1`] = montantN1
    } else {
      vals[`${ref}.netN1`] = 0
    }
  }

  // Passif totals
  const sumNet = (...refs: string[]) => refs.reduce((s, r) => s + (Number(vals[`${r}.netN`]) || 0), 0)
  vals['CP.netN'] = sumNet('CA') - (Number(vals['CB.netN']) || 0) + sumNet('CD', 'CE', 'CF', 'CG', 'CH', 'CJ', 'CL', 'CM')
  vals['DD.netN'] = sumNet('DA', 'DB', 'DC')
  vals['DF.netN'] = (Number(vals['CP.netN']) || 0) + (Number(vals['DD.netN']) || 0)
  vals['DP.netN'] = sumNet('DH', 'DI', 'DJ', 'DK', 'DM', 'DN')
  vals['DT.netN'] = sumNet('DQ', 'DR')
  vals['DZ.netN'] = (Number(vals['DF.netN']) || 0) + (Number(vals['DP.netN']) || 0) + (Number(vals['DT.netN']) || 0) + (Number(vals['DV.netN']) || 0)

  // Resultat — use getBalanceSolde for credit/debit determination
  const resultatMapping: Record<string, { comptes: string[]; sens: 'credit' | 'debit' | 'signed' }> = {
    TA: { comptes: [...CR.TA.comptes], sens: 'credit' },
    RA: { comptes: [...CR.RA.comptes], sens: 'debit' },
    RB: { comptes: [...CR.RB.comptes], sens: 'signed' },
    TB: { comptes: [...CR.TB.comptes], sens: 'credit' },
    TC: { comptes: [...CR.TC.comptes], sens: 'credit' },
    TD: { comptes: [...CR.TD.comptes], sens: 'credit' },
    TE: { comptes: [...CR.TE.comptes], sens: 'signed' },
    TF: { comptes: [...CR.TF.comptes], sens: 'credit' },
    TG: { comptes: [...CR.TG.comptes], sens: 'credit' },
    TH: { comptes: [...CR.TH.comptes], sens: 'credit' },
    TI: { comptes: [...CR.TI.comptes], sens: 'credit' },  // 791 → TJ uniquement
    RC: { comptes: [...CR.RC.comptes], sens: 'debit' },
    RD: { comptes: [...CR.RD.comptes], sens: 'signed' },
    RE: { comptes: [...CR.RE.comptes], sens: 'debit' },
    RF: { comptes: [...CR.RF.comptes], sens: 'signed' },
    RG: { comptes: [...CR.RG.comptes], sens: 'debit' },
    RH: { comptes: [...CR.RH.comptes], sens: 'debit' },
    RI: { comptes: [...CR.RI.comptes], sens: 'debit' },
    RJ: { comptes: [...CR.RJ.comptes], sens: 'debit' },
    RK: { comptes: [...CR.RK.comptes], sens: 'debit' },
    TJ: { comptes: [...CR.TJ.comptes], sens: 'credit' },  // 797 → TL uniquement
    RL: { comptes: [...CR.RL.comptes], sens: 'debit' },
    TK: { comptes: [...CR.TK.comptes], sens: 'credit' },
    TL: { comptes: [...CR.TL.comptes], sens: 'credit' },
    TM: { comptes: [...CR.TM.comptes], sens: 'credit' },
    RM: { comptes: [...CR.RM.comptes], sens: 'debit' },
    RN: { comptes: [...CR.RN.comptes], sens: 'debit' },
    TN: { comptes: [...CR.TN.comptes], sens: 'credit' },
    TO: { comptes: [...CR.TO.comptes], sens: 'credit' },
    RO: { comptes: [...CR.RO.comptes], sens: 'debit' },
    RP: { comptes: [...CR.RP.comptes], sens: 'debit' },  // 87 exclusif à RQ
    RQ: { comptes: [...CR.RQ.comptes], sens: 'debit' },
    RS: { comptes: [...CR.RS.comptes], sens: 'debit' },
  }

  // In the Excel model, ALL values use the same sign convention:
  // Products (T*) = positive (credit balance), Charges (R*) = negative (debit balance)
  // getBalanceSolde returns debit-credit, so negate ALL to get Excel convention
  for (const [ref, map] of Object.entries(resultatMapping)) {
    const solde = getBalanceSolde(balance, map.comptes)
    vals[`${ref}.netN`] = -solde // negate: credit→positive, debit→negative

    if (balanceN1.length > 0) {
      const soldeN1 = getBalanceSolde(balanceN1, map.comptes)
      vals[`${ref}.netN1`] = -soldeN1
    }
  }

  // Resultat totals (computed by Excel formulas, but we store for audit)
  const n = (key: string) => Number(vals[key]) || 0
  vals['XA.netN'] = n('TA.netN') + n('RA.netN') + n('RB.netN')
  vals['XB.netN'] = n('TA.netN') + n('TB.netN') + n('TC.netN') + n('TD.netN')
  vals['XC.netN'] = n('XB.netN') + n('RA.netN') + n('RB.netN') + n('TE.netN') + n('TF.netN') + n('TG.netN') + n('TH.netN') + n('TI.netN') + n('RC.netN') + n('RD.netN') + n('RE.netN') + n('RF.netN') + n('RG.netN') + n('RH.netN') + n('RI.netN') + n('RJ.netN')
  vals['XD.netN'] = n('XC.netN') + n('RK.netN')
  vals['XE.netN'] = n('XD.netN') + n('TJ.netN') + n('RL.netN')
  vals['XF.netN'] = n('TK.netN') + n('TL.netN') + n('TM.netN') + n('RM.netN') + n('RN.netN')
  vals['XG.netN'] = n('XE.netN') + n('XF.netN')
  vals['XH.netN'] = n('TN.netN') + n('TO.netN') + n('RO.netN') + n('RP.netN')
  vals['XI.netN'] = n('XG.netN') + n('XH.netN') + n('RQ.netN') + n('RS.netN')

  // ── Résultat N-1 totals (nécessaires pour TFT N-1) ──
  if (balanceN1.length > 0) {
    vals['XA.netN1'] = n('TA.netN1') + n('RA.netN1') + n('RB.netN1')
    vals['XB.netN1'] = n('TA.netN1') + n('TB.netN1') + n('TC.netN1') + n('TD.netN1')
    vals['XC.netN1'] = n('XB.netN1') + n('RA.netN1') + n('RB.netN1') + n('TE.netN1') + n('TF.netN1') + n('TG.netN1') + n('TH.netN1') + n('TI.netN1') + n('RC.netN1') + n('RD.netN1') + n('RE.netN1') + n('RF.netN1') + n('RG.netN1') + n('RH.netN1') + n('RI.netN1') + n('RJ.netN1')
    vals['XD.netN1'] = n('XC.netN1') + n('RK.netN1')
    vals['XE.netN1'] = n('XD.netN1') + n('TJ.netN1') + n('RL.netN1')
    vals['XF.netN1'] = n('TK.netN1') + n('TL.netN1') + n('TM.netN1') + n('RM.netN1') + n('RN.netN1')
    vals['XG.netN1'] = n('XE.netN1') + n('XF.netN1')
    vals['XH.netN1'] = n('TN.netN1') + n('TO.netN1') + n('RO.netN1') + n('RP.netN1')
    vals['XI.netN1'] = n('XG.netN1') + n('XH.netN1') + n('RQ.netN1') + n('RS.netN1')
  }

  // ── TFT — Tableau des Flux de Trésorerie ──

  // ZA: Trésorerie nette ouverture = Trésorerie actif N-1 - Trésorerie passif N-1
  if (balanceN1.length > 0) {
    const btN1 = getActifBrut(balanceN1, [...TFT_COMPTES.TRESORERIE_ACTIF]) - getAmortProv(balanceN1, [...TFT_COMPTES.TRESORERIE_ACTIF_AMORT])
    const dtN1 = getPassif(balanceN1, [...TFT_COMPTES.TRESORERIE_PASSIF])
    vals['ZA.valN'] = btN1 - dtN1
  } else {
    vals['ZA.valN'] = 0
  }

  // FA: CAFG = Résultat net + Dotations amort/prov - Reprises amort/prov + VC cessions - Produits cessions
  const dotations = getBalanceSolde(balance, [...TFT_COMPTES.DOTATIONS])
  const reprises = -getBalanceSolde(balance, [...TFT_COMPTES.REPRISES])
  const vcCessions = getBalanceSolde(balance, [...TFT_COMPTES.VC_CESSIONS])
  const prodCessions = -getBalanceSolde(balance, [...TFT_COMPTES.PROD_CESSIONS])
  vals['FA.valN'] = n('XI.netN') + dotations - reprises + vcCessions - prodCessions

  // FB-FE: Variations BFR

  // FB: -Variation actif circulant HAO
  const baComptes = [...TFT_COMPTES.ACTIF_CIRCULANT_HAO]
  vals['FB.valN'] = -(getActifBrut(balance, baComptes) - (balanceN1.length > 0 ? getActifBrut(balanceN1, baComptes) : 0))

  // FC: -Variation stocks
  const bbComptes = [...TFT_COMPTES.STOCKS]
  vals['FC.valN'] = -(getActifBrut(balance, bbComptes) - (balanceN1.length > 0 ? getActifBrut(balanceN1, bbComptes) : 0))

  // FD: -Variation créances
  const crComptes = [...TFT_COMPTES.CREANCES]
  vals['FD.valN'] = -(getActifBrut(balance, crComptes) - (balanceN1.length > 0 ? getActifBrut(balanceN1, crComptes) : 0))

  // FE: +Variation passif circulant
  const pcComptes = [...TFT_COMPTES.PASSIF_CIRCULANT]
  vals['FE.valN'] = getPassif(balance, pcComptes) - (balanceN1.length > 0 ? getPassif(balanceN1, pcComptes) : 0)

  // FF-FH: Décaissements acquisitions immo (variation brut négatif = acquisition)
  const incComptes = [...TFT_COMPTES.IMMO_INCORPORELLES]
  vals['FF.valN'] = -(getActifBrut(balance, incComptes) - (balanceN1.length > 0 ? getActifBrut(balanceN1, incComptes) : 0))
  const corComptes = [...TFT_COMPTES.IMMO_CORPORELLES]
  vals['FG.valN'] = -(getActifBrut(balance, corComptes) - (balanceN1.length > 0 ? getActifBrut(balanceN1, corComptes) : 0))
  const finComptes = [...TFT_COMPTES.IMMO_FINANCIERES]
  vals['FH.valN'] = -(getActifBrut(balance, finComptes) - (balanceN1.length > 0 ? getActifBrut(balanceN1, finComptes) : 0))

  // FI: Encaissements cessions immo incorporelles et corporelles
  vals['FI.valN'] = -getBalanceSolde(balance, [...TFT_COMPTES.PROD_CESSIONS])

  // FJ: Encaissements cessions immo financières
  vals['FJ.valN'] = 0

  // FK-FN: Financement capitaux propres
  vals['FK.valN'] = getPassif(balance, [...TFT_COMPTES.CAPITAL]) - (balanceN1.length > 0 ? getPassif(balanceN1, [...TFT_COMPTES.CAPITAL]) : 0)
  vals['FL.valN'] = getPassif(balance, [...TFT_COMPTES.SUBVENTIONS_INVEST]) - (balanceN1.length > 0 ? getPassif(balanceN1, [...TFT_COMPTES.SUBVENTIONS_INVEST]) : 0)
  vals['FM.valN'] = 0
  vals['FN.valN'] = 0

  // FO-FQ: Financement capitaux étrangers
  vals['FO.valN'] = Math.max(0, getPassif(balance, [...TFT_COMPTES.EMPRUNTS_LT]) - (balanceN1.length > 0 ? getPassif(balanceN1, [...TFT_COMPTES.EMPRUNTS_LT]) : 0))
  vals['FP.valN'] = Math.max(0, getPassif(balance, [...TFT_COMPTES.AUTRES_DETTES_FIN]) - (balanceN1.length > 0 ? getPassif(balanceN1, [...TFT_COMPTES.AUTRES_DETTES_FIN]) : 0))
  vals['FQ.valN'] = Math.min(0, getPassif(balance, [...TFT_COMPTES.TOUS_EMPRUNTS]) - (balanceN1.length > 0 ? getPassif(balanceN1, [...TFT_COMPTES.TOUS_EMPRUNTS]) : 0))

  // N-1 for TFT lines — computed from balanceN1 and balanceN2 when available
  if (balanceN1.length > 0) {
    // ZA N-1: Trésorerie ouverture N-1 = Trésorerie actif N-2 - Trésorerie passif N-2
    if (balanceN2.length > 0) {
      const btN2 = getActifBrut(balanceN2, [...TFT_COMPTES.TRESORERIE_ACTIF]) - getAmortProv(balanceN2, [...TFT_COMPTES.TRESORERIE_ACTIF_AMORT])
      const dtN2 = getPassif(balanceN2, [...TFT_COMPTES.TRESORERIE_PASSIF])
      vals['ZA.valN1'] = btN2 - dtN2
    } else {
      vals['ZA.valN1'] = 0
    }

    // FA N-1: CAFG from N-1 income statement
    const dotN1 = getBalanceSolde(balanceN1, [...TFT_COMPTES.DOTATIONS])
    const repN1 = -getBalanceSolde(balanceN1, [...TFT_COMPTES.REPRISES])
    const vcN1 = getBalanceSolde(balanceN1, [...TFT_COMPTES.VC_CESSIONS])
    const pcN1 = -getBalanceSolde(balanceN1, [...TFT_COMPTES.PROD_CESSIONS])
    vals['FA.valN1'] = n('XI.netN1') + dotN1 - repN1 + vcN1 - pcN1

    // FB-FE N-1: Variations BFR (N-1 vs N-2)
    if (balanceN2.length > 0) {
      vals['FB.valN1'] = -(getActifBrut(balanceN1, baComptes) - getActifBrut(balanceN2, baComptes))
      vals['FC.valN1'] = -(getActifBrut(balanceN1, bbComptes) - getActifBrut(balanceN2, bbComptes))
      vals['FD.valN1'] = -(getActifBrut(balanceN1, crComptes) - getActifBrut(balanceN2, crComptes))
      vals['FE.valN1'] = getPassif(balanceN1, pcComptes) - getPassif(balanceN2, pcComptes)
    } else {
      vals['FB.valN1'] = 0
      vals['FC.valN1'] = 0
      vals['FD.valN1'] = 0
      vals['FE.valN1'] = 0
    }

    // FF-FJ N-1: Investissements
    if (balanceN2.length > 0) {
      vals['FF.valN1'] = -(getActifBrut(balanceN1, incComptes) - getActifBrut(balanceN2, incComptes))
      vals['FG.valN1'] = -(getActifBrut(balanceN1, corComptes) - getActifBrut(balanceN2, corComptes))
      vals['FH.valN1'] = -(getActifBrut(balanceN1, finComptes) - getActifBrut(balanceN2, finComptes))
    } else {
      vals['FF.valN1'] = 0
      vals['FG.valN1'] = 0
      vals['FH.valN1'] = 0
    }
    vals['FI.valN1'] = -getBalanceSolde(balanceN1, [...TFT_COMPTES.PROD_CESSIONS])
    vals['FJ.valN1'] = 0

    // FK-FQ N-1: Financement
    if (balanceN2.length > 0) {
      vals['FK.valN1'] = getPassif(balanceN1, [...TFT_COMPTES.CAPITAL]) - getPassif(balanceN2, [...TFT_COMPTES.CAPITAL])
      vals['FL.valN1'] = getPassif(balanceN1, [...TFT_COMPTES.SUBVENTIONS_INVEST]) - getPassif(balanceN2, [...TFT_COMPTES.SUBVENTIONS_INVEST])
      vals['FM.valN1'] = 0
      vals['FN.valN1'] = 0
      vals['FO.valN1'] = Math.max(0, getPassif(balanceN1, [...TFT_COMPTES.EMPRUNTS_LT]) - getPassif(balanceN2, [...TFT_COMPTES.EMPRUNTS_LT]))
      vals['FP.valN1'] = Math.max(0, getPassif(balanceN1, [...TFT_COMPTES.AUTRES_DETTES_FIN]) - getPassif(balanceN2, [...TFT_COMPTES.AUTRES_DETTES_FIN]))
      vals['FQ.valN1'] = Math.min(0, getPassif(balanceN1, [...TFT_COMPTES.TOUS_EMPRUNTS]) - getPassif(balanceN2, [...TFT_COMPTES.TOUS_EMPRUNTS]))
    } else {
      vals['FK.valN1'] = 0
      vals['FL.valN1'] = 0
      vals['FM.valN1'] = 0
      vals['FN.valN1'] = 0
      vals['FO.valN1'] = 0
      vals['FP.valN1'] = 0
      vals['FQ.valN1'] = 0
    }
  } else {
    vals['ZA.valN1'] = 0
    for (const ref of ['FA','FB','FC','FD','FE','FF','FG','FH','FI','FJ','FK','FL','FM','FN','FO','FP','FQ']) {
      vals[`${ref}.valN1`] = 0
    }
  }

  // Enterprise info
  vals['_denomination.denomination'] = entreprise.denomination || ''
  vals['_adresse.adresse'] = entreprise.adresse || ''
  vals['_ncc.ncc'] = entreprise.ncc || ''
  vals['_exercice.exerciceClos'] = entreprise.exercice_clos || ''
  vals['_duree.dureeMois'] = entreprise.duree_mois || 12
  vals['_ntd.ntd'] = entreprise.ntd || ''
  vals['_sigle.sigle'] = entreprise.sigle || ''

  return vals
}

/**
 * Export Mode B — Inject values into the official SYSCOHADA template
 */
export async function exportModeB(
  balance: BalanceEntry[],
  balanceN1: BalanceEntry[],
  entreprise: EntrepriseData,
  balanceN2: BalanceEntry[] = [],
): Promise<void> {
  // 1. Fetch the template
  const response = await fetch(TEMPLATE_PATH)
  if (!response.ok) throw new Error(`Impossible de charger le modèle: ${response.statusText}`)
  const buffer = await response.arrayBuffer()

  // 2. Parse the template, preserving formulas and styles
  const wb = XLSX.read(buffer, {
    cellStyles: true,
    cellFormula: true,
    cellDates: true,
  })

  // 3. Compute all values
  const vals = computeAllValues(balance, balanceN1, entreprise, balanceN2)

  // 3b. Audit de calcul — vérifier les contrôles avant injection
  const auditVals: Record<string, number> = {}
  for (const [key, val] of Object.entries(vals)) {
    if (typeof val === 'number') {
      const ref = key.split('.')[0]
      // Use net values for audit (netN for bilan, valN for TFT)
      if (key.endsWith('.netN') || key.endsWith('.net') || key.endsWith('.valN')) {
        auditVals[ref] = val
      }
    }
  }
  // Also add actif net values from brut-amort
  for (const ref of ['AZ','BK','BT','BZ']) {
    auditVals[ref] = (Number(vals[`${ref}.brut`]) || 0) - (Number(vals[`${ref}.amort`]) || 0)
  }

  const auditErrors: string[] = []
  for (const ctrl of CONTROLES) {
    const ecart = ctrl.check(auditVals)
    if (Math.abs(ecart) > 0.01) {
      const msg = `[${ctrl.severity.toUpperCase()}] ${ctrl.label} — écart: ${ecart.toLocaleString('fr-FR')}`
      auditErrors.push(msg)
      if (ctrl.severity === 'bloquant') {
        console.error('[Audit]', msg)
      } else {
        console.warn('[Audit]', msg)
      }
    }
  }

  // 3c. Détection des anomalies de soldes (Bugs #7-8)
  const anomaliesActif = detecterAnomaliesActif(balance, ALL_ACTIF_PREFIXES)
  const anomaliesPassif = detecterAnomaliesPassif(balance, ALL_PASSIF_PREFIXES)
  if (anomaliesActif.length > 0 || anomaliesPassif.length > 0) {
    const allAnomalies = [...anomaliesActif, ...anomaliesPassif]
    for (const a of allAnomalies) {
      const msg = a.type === 'actif_crediteur'
        ? `[AVERTISSEMENT] Compte ${a.compte} (${a.libelle}) : solde créditeur ${a.montant.toLocaleString('fr-FR')} sur un compte d'actif`
        : `[AVERTISSEMENT] Compte ${a.compte} (${a.libelle}) : solde débiteur ${a.montant.toLocaleString('fr-FR')} sur un compte de passif`
      auditErrors.push(msg)
      console.warn('[Audit anomalie]', msg)
    }
  }

  const bloquants = auditErrors.filter(e => e.startsWith('[BLOQUANT]'))
  if (bloquants.length > 0) {
    const totalActifNet = (Number(vals['BZ.brut']) || 0) - (Number(vals['BZ.amort']) || 0)
    const totalPassif = Number(vals['DZ.netN']) || 0
    const ecartBilan = Math.abs(totalActifNet - totalPassif)
    // Bloquer l'export uniquement si BZ ≠ DZ (erreur critique)
    if (ecartBilan > 1) {
      throw new Error(
        `Export bloqué — Bilan déséquilibré : Total Actif Net (${totalActifNet.toLocaleString('fr-FR')}) ≠ Total Passif (${totalPassif.toLocaleString('fr-FR')}). Écart: ${ecartBilan.toLocaleString('fr-FR')} FCFA. Vérifiez la balance importée.`
      )
    }
    console.warn(`[Audit] ${bloquants.length} contrôle(s) bloquant(s) — export autorisé (bilan équilibré)`)
  }

  // 4. Inject cell by cell
  const log: InjectionLog[] = []
  const injectableTargets = CELL_MAP.filter(t => !t.hasFormula)

  for (const target of injectableTargets) {
    const ws = wb.Sheets[target.sheet]
    if (!ws) {
      log.push({ sheet: target.sheet, cell: target.cell, ref: target.ref, field: target.field, value: 0, status: 'error' })
      continue
    }

    // Check if the cell already has a formula in the actual file
    const existingCell = ws[target.cell]
    if (existingCell?.f) {
      log.push({ sheet: target.sheet, cell: target.cell, ref: target.ref, field: target.field, value: 0, status: 'skipped_formula' })
      continue
    }

    const key = `${target.ref}.${target.field}`
    const value = vals[key]

    if (value === undefined || value === null) continue

    // Inject: number for financial values, string for text
    ws[target.cell] = {
      t: typeof value === 'number' ? 'n' : 's',
      v: value,
      z: typeof value === 'number' ? '#,##0' : undefined,
    }

    // Ensure cell is in the sheet range
    const cellRef = XLSX.utils.decode_cell(target.cell)
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
    if (cellRef.r > range.e.r) range.e.r = cellRef.r
    if (cellRef.c > range.e.c) range.e.c = cellRef.c
    ws['!ref'] = XLSX.utils.encode_range(range)

    log.push({ sheet: target.sheet, cell: target.cell, ref: target.ref, field: target.field, value, status: 'injected' })
  }

  // 5. Log results
  const injected = log.filter(l => l.status === 'injected').length
  const skipped = log.filter(l => l.status === 'skipped_formula').length
  const errors = log.filter(l => l.status === 'error').length
  console.log(`[Mode B] ${injected} cellules injectées, ${skipped} formules conservées, ${errors} erreurs`)

  if (errors > 0) {
    console.error('[Mode B] Erreurs:', log.filter(l => l.status === 'error'))
  }

  // 6. Write the filled file
  const denom = (entreprise.denomination || 'Entreprise').replace(/[/\\?%*:|"<>]/g, '_').substring(0, 30)
  const dateClos = entreprise.exercice_clos || new Date().toLocaleDateString('fr-FR')
  const filename = `Liasse_${denom}_${dateClos}.xlsx`
  XLSX.writeFile(wb, filename)
}
