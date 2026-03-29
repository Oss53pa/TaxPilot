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

  // ── Notes annexes — données injectables ──

  // NOTE 1: Dettes garanties (onglet 15)
  // F11-F14: emprunts obligataires et dettes (détail classe 16)
  vals['N1_F11.val'] = getPassif(balance, ['1611'])  // Emprunts obligataires convertibles
  vals['N1_F12.val'] = getPassif(balance, ['1612'])  // Autres emprunts obligataires
  vals['N1_F13.val'] = getPassif(balance, ['162', '163', '164'])  // Emprunts établissements crédit
  vals['N1_F14.val'] = getPassif(balance, ['165', '166', '167', '168'])  // Autres dettes financières
  // F17-F20: dettes location-acquisition (détail classe 17)
  vals['N1_F17.val'] = getPassif(balance, ['171'])  // Crédit-bail immobilier
  vals['N1_F18.val'] = getPassif(balance, ['172'])  // Crédit-bail mobilier
  vals['N1_F19.val'] = getPassif(balance, ['173'])  // Location-vente
  vals['N1_F20.val'] = getPassif(balance, ['174', '175', '176', '177', '178'])  // Autres location-acquisition
  // F23-F30: dettes passif circulant
  vals['N1_F23.val'] = getPassif(balance, ['401', '402', '403', '404', '405', '408'])  // Fournisseurs
  vals['N1_F24.val'] = getActifBrut(balance, ['411', '412', '413', '414', '415', '416', '418'])  // Clients (avances)
  vals['N1_F25.val'] = getPassif(balance, ['421', '422', '423'])  // Personnel
  vals['N1_F26.val'] = getPassif(balance, ['431', '432', '433'])  // Sécurité sociale
  vals['N1_F27.val'] = getPassif(balance, ['441', '442', '443', '444', '445', '446', '447', '448', '449'])  // Etat
  vals['N1_F28.val'] = getPassif(balance, ['45'])  // Organismes internationaux
  vals['N1_F29.val'] = getPassif(balance, ['46'])  // Associés et groupe
  vals['N1_F30.val'] = getPassif(balance, ['47'])  // Créditeurs divers

  // NOTE 3A: Immobilisations brutes — mouvements (onglet 17)
  // Col D = montant brut ouverture (= N-1), Col E = acquisitions, Col J = formule
  const n3a = (comptes: string[]) => ({
    ouv: balanceN1.length > 0 ? getActifBrut(balanceN1, comptes) : 0,
    clo: getActifBrut(balance, comptes),
  })
  const n3aLine = (comptes: string[], prefix: string) => {
    const { ouv, clo } = n3a(comptes)
    vals[`${prefix}_D.val`] = ouv  // Ouverture
    vals[`${prefix}_E.val`] = Math.max(0, clo - ouv)  // Acquisitions (augmentation)
    vals[`${prefix}_H.val`] = Math.max(0, ouv - clo)  // Cessions (diminution)
  }
  n3aLine(['211', '212'], 'N3A_12')  // Frais développement
  n3aLine(['213', '214', '215'], 'N3A_13')  // Brevets, licences
  n3aLine(['216'], 'N3A_14')  // Fonds commercial
  n3aLine(['217', '218', '219'], 'N3A_15')  // Autres immo incorporelles
  n3aLine(['22'], 'N3A_17')  // Terrains hors immeuble placement
  // Row 18: Terrains immeuble placement — usually 0 for most companies
  vals['N3A_18_D.val'] = 0; vals['N3A_18_E.val'] = 0; vals['N3A_18_H.val'] = 0
  n3aLine(['231', '232', '233', '234'], 'N3A_19')  // Bâtiments hors immeuble
  vals['N3A_20_D.val'] = 0; vals['N3A_20_E.val'] = 0; vals['N3A_20_H.val'] = 0  // Bâtiments immeuble placement
  n3aLine(['235', '237', '238'], 'N3A_21')  // Aménagements
  n3aLine(['241', '242', '243', '244'], 'N3A_22')  // Matériel, mobilier
  n3aLine(['245'], 'N3A_23')  // Matériel transport
  n3aLine(['251', '252'], 'N3A_24')  // Avances et acomptes
  n3aLine(['26'], 'N3A_28')  // Titres participation
  n3aLine(['271', '272', '273', '274', '275', '276', '277'], 'N3A_29')  // Autres immo financières

  // NOTE 3C: Amortissements — mouvements (onglet 19)
  const n3c = (comptes: string[]) => ({
    ouv: balanceN1.length > 0 ? getAmortProv(balanceN1, comptes) : 0,
    clo: getAmortProv(balance, comptes),
  })
  const n3cLine = (comptes: string[], prefix: string) => {
    const { ouv, clo } = n3c(comptes)
    vals[`${prefix}_D.val`] = ouv
    vals[`${prefix}_E.val`] = Math.max(0, clo - ouv)  // Dotations
    vals[`${prefix}_H.val`] = Math.max(0, ouv - clo)  // Reprises
  }
  n3cLine(['2811', '2812', '2911', '2912'], 'N3C_11')  // Amort frais développement
  n3cLine(['2813', '2814', '2815', '2913', '2914', '2915'], 'N3C_12')  // Amort brevets
  n3cLine(['2816', '2916'], 'N3C_13')  // Amort fonds commercial
  n3cLine(['2817', '2818', '2819', '2917', '2918', '2919'], 'N3C_14')  // Amort autres immo incorp
  n3cLine(['282', '292'], 'N3C_16')  // Amort terrains
  n3cLine(['2831', '2832', '2833', '2834', '2931', '2932', '2933', '2934'], 'N3C_17')  // Amort bâtiments
  n3cLine(['2835', '2837', '2838', '2935', '2937', '2938'], 'N3C_18')  // Amort aménagements
  n3cLine(['2841', '2842', '2843', '2844', '2941', '2942', '2943', '2944'], 'N3C_19')  // Amort matériel
  n3cLine(['2845', '2945'], 'N3C_20')  // Amort transport

  // NOTE 10: Emprunts et dettes financières détail (onglet 32)
  vals['N10_F9.val'] = getPassif(balance, ['1611'])  // Emprunts obligataires
  vals['N10_G9.val'] = balanceN1.length > 0 ? getPassif(balanceN1, ['1611']) : 0
  vals['N10_F10.val'] = getPassif(balance, ['1612', '1618'])
  vals['N10_G10.val'] = balanceN1.length > 0 ? getPassif(balanceN1, ['1612', '1618']) : 0
  vals['N10_F11.val'] = getPassif(balance, ['162', '163', '164'])
  vals['N10_G11.val'] = balanceN1.length > 0 ? getPassif(balanceN1, ['162', '163', '164']) : 0
  vals['N10_F12.val'] = getPassif(balance, ['165', '166', '167', '168'])
  vals['N10_G12.val'] = balanceN1.length > 0 ? getPassif(balanceN1, ['165', '166', '167', '168']) : 0
  vals['N10_F14.val'] = getPassif(balance, ['171'])
  vals['N10_G14.val'] = balanceN1.length > 0 ? getPassif(balanceN1, ['171']) : 0
  vals['N10_F15.val'] = getPassif(balance, ['172'])
  vals['N10_G15.val'] = balanceN1.length > 0 ? getPassif(balanceN1, ['172']) : 0
  vals['N10_F16.val'] = getPassif(balance, ['19'])
  vals['N10_G16.val'] = balanceN1.length > 0 ? getPassif(balanceN1, ['19']) : 0

  // NOTE 14: Résultat financier détail (onglet 36)
  vals['N14_F9.val'] = -getBalanceSolde(balance, ['771'])  // Intérêts reçus
  vals['N14_G9.val'] = balanceN1.length > 0 ? -getBalanceSolde(balanceN1, ['771']) : 0
  vals['N14_F10.val'] = -getBalanceSolde(balance, ['772', '773'])  // Revenus titres
  vals['N14_G10.val'] = balanceN1.length > 0 ? -getBalanceSolde(balanceN1, ['772', '773']) : 0
  vals['N14_F11.val'] = -getBalanceSolde(balance, ['774', '775', '776', '777', '778'])  // Autres revenus financiers
  vals['N14_G11.val'] = balanceN1.length > 0 ? -getBalanceSolde(balanceN1, ['774', '775', '776', '777', '778']) : 0
  vals['N14_F15.val'] = getBalanceSolde(balance, ['671'])  // Intérêts des emprunts
  vals['N14_G15.val'] = balanceN1.length > 0 ? getBalanceSolde(balanceN1, ['671']) : 0
  vals['N14_F16.val'] = getBalanceSolde(balance, ['672', '673', '674', '675', '676', '677', '678'])  // Autres frais financiers
  vals['N14_G16.val'] = balanceN1.length > 0 ? getBalanceSolde(balanceN1, ['672', '673', '674', '675', '676', '677', '678']) : 0

  // COMP-CHARGES: Détail des charges par compte (onglet 68)
  // Each line maps a specific account to columns G(N) and H(N-1)
  const compChargesAccounts = [
    '6011','6012','6013','6014','6015','6019',  // Achats marchandises
    '6031',  // Variation stocks marchandises
    '6021','6022','6023','6024','6025','6029',  // Achats MP
    '6032',  // Variation stocks MP
    '6041','6042','6043','6044','6045','6046','6047','6049',  // Autres achats
    '6051','6052','6053','6054','6055','6056','6057','6058','6059',  // FNS
    '6081','6082','6083','6085','6089',  // Emballages
    '6033',  // Variation autres appro
    '612','613','614','616','6181','6182','6183','619',  // Transports
    '621','622','623','624','625','626','627','628','629',  // Services extérieurs
    '631','632','633','634','635','636','637','638','639',  // Autres services ext
    '641','642','643','644','645','646','647','648','649',  // Impôts taxes
    '651','652','653','654','655','656','657','658','659',  // Autres charges
    '661','662','663','664','665','666','668','669',  // Charges personnel
    '671','672','673','674','675','676','677','678','679',  // Frais financiers
    '681','682','683','684','685','686','687','689',  // Dotations
    '691','692','693','694','695','697',  // Dotations financières
    '81','82','83','84','85','86','87','88','89',  // HAO + impôts
  ]
  let compRow = 11
  for (const acct of compChargesAccounts) {
    const soldeN = getBalanceSolde(balance, [acct])
    const soldeN1 = balanceN1.length > 0 ? getBalanceSolde(balanceN1, [acct]) : 0
    // Only inject if there's actual data
    if (soldeN !== 0 || soldeN1 !== 0) {
      vals[`COMP_G${compRow}.val`] = Math.abs(soldeN)
      vals[`COMP_H${compRow}.val`] = Math.abs(soldeN1)
    }
    compRow++
  }

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

  // 3d. Inject enterprise headers into ALL note/sheet headers (rows 3-6)
  // Most sheets share the same header layout — we inject by pattern instead of CELL_MAP
  const headerLayouts: Record<string, Record<string, string>> = {
    // Layout A: Notes with columns A-I/J (most notes 3A onwards)
    layoutA: { denomination: 'C3', adresse: 'B4', sigle: 'I4', ncc: 'C5', exercice: 'G5', duree: 'I5', ntd: 'C6' },
    // Layout B: Sheets with different sigle position (H4)
    layoutB: { denomination: 'C3', adresse: 'B4', sigle: 'H4', ncc: 'C5', exercice: 'F5', duree: 'H5', ntd: 'C6' },
    // Layout C: BILAN/RESULTAT/TFT — already handled via CELL_MAP, skip
  }
  // Map each sheet to its layout
  const sheetHeaderMap: Record<string, string> = {
    // Notes with layout A (I4 sigle)
    'NOTE 1': 'layoutA', 'NOTE 3A': 'layoutA', 'NOTE 3C': 'layoutA', 'NOTE 3C BIS': 'layoutA',
    'NOTE 3D': 'layoutA', 'NOTE 3E': 'layoutA', 'NOTE 4': 'layoutA', 'NOTE 5': 'layoutA',
    'NOTE 6': 'layoutA', 'NOTE 7': 'layoutA', 'NOTE 8': 'layoutA', 'NOTE 8A': 'layoutA',
    'NOTE 9': 'layoutA', 'NOTE 10': 'layoutA', 'NOTE 11': 'layoutA', 'NOTE 12': 'layoutA',
    'NOTE 13': 'layoutA', 'NOTE 14': 'layoutA', 'NOTE 15A': 'layoutA', 'NOTE 15B': 'layoutA',
    'NOTE 16A': 'layoutA', 'NOTE 16B': 'layoutA', 'NOTE 16B BIS': 'layoutA',
    'NOTE 16C': 'layoutA', 'NOTE 17': 'layoutA', 'NOTE 18': 'layoutA', 'NOTE 19': 'layoutA',
    'NOTE 20': 'layoutB', 'NOTE 21': 'layoutB', 'NOTE 22': 'layoutB', 'NOTE 23': 'layoutB',
    'NOTE 24': 'layoutB', 'NOTE 25': 'layoutB', 'NOTE 26': 'layoutB',
    'NOTE 27A': 'layoutB', 'NOTE 27B': 'layoutB', 'NOTE 28': 'layoutB', 'NOTE 29': 'layoutB',
    'NOTE 30': 'layoutB', 'NOTE 31': 'layoutB', 'NOTE 32': 'layoutB', 'NOTE 33': 'layoutB',
    'NOTE 34': 'layoutA', 'NOTE 35': 'layoutA',
    'NOTE 37': 'layoutA', 'NOTE 38': 'layoutA', 'NOTE 39': 'layoutA',
    'NOTES DGI - INS': 'layoutA', 'FICHE R4': 'layoutA',
  }
  const entData: Record<string, string | number> = {
    denomination: entreprise.denomination || '',
    adresse: entreprise.adresse || '',
    sigle: entreprise.sigle || '',
    ncc: entreprise.ncc || '',
    exercice: entreprise.exercice_clos || '',
    duree: entreprise.duree_mois || 12,
    ntd: entreprise.ntd || '',
  }
  let headerCount = 0
  for (const [sheetName, layoutKey] of Object.entries(sheetHeaderMap)) {
    const ws = wb.Sheets[sheetName]
    if (!ws) continue
    const layout = headerLayouts[layoutKey]
    for (const [field, cell] of Object.entries(layout)) {
      const existing = ws[cell]
      if (existing?.f) continue  // Don't overwrite formulas
      const val = entData[field]
      if (val === undefined || val === null || val === '') continue
      ws[cell] = { t: typeof val === 'number' ? 'n' : 's', v: val }
      // Extend range
      const cr = XLSX.utils.decode_cell(cell)
      const rng = XLSX.utils.decode_range(ws['!ref'] || 'A1')
      if (cr.r > rng.e.r) rng.e.r = cr.r
      if (cr.c > rng.e.c) rng.e.c = cr.c
      ws['!ref'] = XLSX.utils.encode_range(rng)
      headerCount++
    }
  }

  // 3e. Inject COUVERTURE sheet (onglet 1)
  const wsCouv = wb.Sheets['COUVERTURE']
  if (wsCouv) {
    const couvData: [string, string | number][] = [
      ['G13', entreprise.centre_depot || ''],
      ['G38', entreprise.denomination || ''],
      ['G41', entreprise.sigle || ''],
      ['G43', entreprise.adresse || ''],
      ['H45', entreprise.ncc || ''],
      ['H46', entreprise.ntd || ''],
    ]
    for (const [cell, val] of couvData) {
      if (!val) continue
      wsCouv[cell] = { t: typeof val === 'number' ? 'n' : 's', v: val }
      headerCount++
    }
  }

  // 3f. Inject GARDE sheet (onglet 2)
  const wsGarde = wb.Sheets['GARDE']
  if (wsGarde) {
    const gardeData: [string, string | number][] = [
      ['D9', entreprise.centre_depot || ''],
      ['D22', entreprise.denomination || ''],
      ['C26', entreprise.sigle || ''],
      ['C28', entreprise.adresse || ''],
      ['D30', entreprise.ncc || ''],
      ['D31', entreprise.ntd || ''],
    ]
    for (const [cell, val] of gardeData) {
      if (!val) continue
      wsGarde[cell] = { t: typeof val === 'number' ? 'n' : 's', v: val }
      headerCount++
    }
  }

  // 3g. Inject NOTE36 (TABLE DES CODES) sheet (onglet 4)
  const wsN36 = wb.Sheets['NOTE36 (TABLE DES CODES)']
  if (wsN36) {
    const n36Data: [string, string | number][] = [
      ['C3', entreprise.denomination || ''],
      ['B4', entreprise.adresse || ''],
      ['I4', entreprise.sigle || ''],
      ['C5', entreprise.ncc || ''],
      ['G5', entreprise.exercice_clos || ''],
      ['I5', entreprise.duree_mois || 12],
      ['C6', entreprise.ntd || ''],
    ]
    for (const [cell, val] of n36Data) {
      if (!val) continue
      wsN36[cell] = { t: typeof val === 'number' ? 'n' : 's', v: val }
      headerCount++
    }
  }

  // 3h. Inject FICHE R1 (onglet 6) — identification entreprise
  const wsR1 = wb.Sheets['FICHE R1']
  if (wsR1) {
    const r1Data: [string, string | number][] = [
      ['D5', entreprise.denomination || ''],
      ['D7', entreprise.sigle || ''],
      ['D8', entreprise.adresse || ''],
      ['D10', entreprise.ncc || ''],
      ['D11', entreprise.ntd || ''],
      ['L5', entreprise.exercice_clos || ''],
      ['D13', entreprise.forme_juridique || ''],
      ['D15', entreprise.branche_activite || ''],
      ['L9', entreprise.code_pays || ''],
      ['D17', entreprise.capital_social || 0],
      ['D19', entreprise.nom_dirigeant || ''],
      ['D21', entreprise.fonction_dirigeant || ''],
      ['D27', entreprise.effectif_permanent || 0],
      ['D28', entreprise.effectif_temporaire || 0],
      ['D29', entreprise.masse_salariale || 0],
    ]
    for (const [cell, val] of r1Data) {
      if (!val && val !== 0) continue
      const existing = wsR1[cell]
      if (existing?.f) continue
      wsR1[cell] = { t: typeof val === 'number' ? 'n' : 's', v: val }
      headerCount++
    }
  }

  // 3i. Dynamic injection for detailed notes (NOTE 4-9, 11-13, 15A-35)
  // These notes have a pattern: column E or F = Année N, next column = Année N-1
  // Values are balance-derived and mapped by account prefix
  // We inject directly where we find matching account patterns
  const noteDetailMappings: { sheet: string; rows: { row: number; comptes: string[]; colN: string; colN1: string; type: 'actif' | 'passif' | 'credit' | 'debit' | 'signed' }[] }[] = [
    // NOTE 4: Immobilisations financières (onglet 23)
    { sheet: 'NOTE 4', rows: [
      { row: 9, comptes: ['261'], colN: 'E', colN1: 'F', type: 'actif' },
      { row: 10, comptes: ['262', '263', '264', '265', '266'], colN: 'E', colN1: 'F', type: 'actif' },
      { row: 11, comptes: ['271', '272'], colN: 'E', colN1: 'F', type: 'actif' },
      { row: 12, comptes: ['273', '274'], colN: 'E', colN1: 'F', type: 'actif' },
      { row: 13, comptes: ['275', '276'], colN: 'E', colN1: 'F', type: 'actif' },
      { row: 14, comptes: ['277'], colN: 'E', colN1: 'F', type: 'actif' },
    ]},
    // NOTE 5: Actif circulant HAO (onglet 24)
    { sheet: 'NOTE 5', rows: [
      { row: 9, comptes: ['485'], colN: 'F', colN1: 'G', type: 'actif' },
      { row: 10, comptes: ['486'], colN: 'F', colN1: 'G', type: 'actif' },
      { row: 11, comptes: ['487'], colN: 'F', colN1: 'G', type: 'actif' },
      { row: 12, comptes: ['488'], colN: 'F', colN1: 'G', type: 'actif' },
    ]},
    // NOTE 6: Stocks (onglet 25)
    { sheet: 'NOTE 6', rows: [
      { row: 9, comptes: ['31'], colN: 'F', colN1: 'G', type: 'actif' },
      { row: 10, comptes: ['32'], colN: 'F', colN1: 'G', type: 'actif' },
      { row: 11, comptes: ['33'], colN: 'F', colN1: 'G', type: 'actif' },
      { row: 12, comptes: ['34'], colN: 'F', colN1: 'G', type: 'actif' },
      { row: 13, comptes: ['35'], colN: 'F', colN1: 'G', type: 'actif' },
      { row: 14, comptes: ['36'], colN: 'F', colN1: 'G', type: 'actif' },
      { row: 15, comptes: ['37'], colN: 'F', colN1: 'G', type: 'actif' },
      { row: 16, comptes: ['38'], colN: 'F', colN1: 'G', type: 'actif' },
    ]},
    // NOTE 7: Clients (onglet 26)
    { sheet: 'NOTE 7', rows: [
      { row: 9, comptes: ['411', '412', '413', '414', '415', '416'], colN: 'E', colN1: 'F', type: 'actif' },
      { row: 10, comptes: ['415'], colN: 'E', colN1: 'F', type: 'actif' },
      { row: 15, comptes: ['416'], colN: 'E', colN1: 'F', type: 'actif' },
      { row: 16, comptes: ['418'], colN: 'E', colN1: 'F', type: 'actif' },
      { row: 18, comptes: ['491'], colN: 'E', colN1: 'F', type: 'passif' },
    ]},
    // NOTE 8: Autres créances (onglet 27)
    { sheet: 'NOTE 8', rows: [
      { row: 9, comptes: ['421', '422', '423'], colN: 'E', colN1: 'F', type: 'actif' },
      { row: 10, comptes: ['431', '432', '433'], colN: 'E', colN1: 'F', type: 'actif' },
      { row: 11, comptes: ['441', '442', '443', '444', '445', '446', '447', '448', '449'], colN: 'E', colN1: 'F', type: 'actif' },
      { row: 12, comptes: ['45'], colN: 'E', colN1: 'F', type: 'actif' },
      { row: 13, comptes: ['46'], colN: 'E', colN1: 'F', type: 'actif' },
      { row: 15, comptes: ['47'], colN: 'E', colN1: 'F', type: 'actif' },
    ]},
    // NOTE 9: Subventions et provisions réglementées (onglet 31)
    { sheet: 'NOTE 9', rows: [
      { row: 9, comptes: ['14'], colN: 'F', colN1: 'G', type: 'passif' },
      { row: 14, comptes: ['151'], colN: 'F', colN1: 'G', type: 'passif' },
      { row: 15, comptes: ['152'], colN: 'F', colN1: 'G', type: 'passif' },
      { row: 16, comptes: ['153', '154', '155', '156', '157', '158'], colN: 'F', colN1: 'G', type: 'passif' },
    ]},
    // NOTE 11: Dettes passif circulant (onglet 33)
    { sheet: 'NOTE 11', rows: [
      { row: 9, comptes: ['401', '402', '403', '404', '405', '408'], colN: 'F', colN1: 'G', type: 'passif' },
      { row: 13, comptes: ['421', '422', '423', '424', '425', '426', '427', '428'], colN: 'F', colN1: 'G', type: 'passif' },
      { row: 14, comptes: ['431', '432', '433'], colN: 'F', colN1: 'G', type: 'passif' },
      { row: 15, comptes: ['441', '442', '443', '444', '445', '446', '447', '448', '449'], colN: 'F', colN1: 'G', type: 'passif' },
      { row: 17, comptes: ['46'], colN: 'F', colN1: 'G', type: 'passif' },
      { row: 18, comptes: ['47'], colN: 'F', colN1: 'G', type: 'passif' },
    ]},
    // NOTE 13: Production et CA (onglet 35) — uses credit side
    { sheet: 'NOTE 13', rows: [
      { row: 9, comptes: ['701'], colN: 'F', colN1: 'G', type: 'credit' },
      { row: 10, comptes: ['702', '703', '704'], colN: 'F', colN1: 'G', type: 'credit' },
      { row: 11, comptes: ['705', '706', '707'], colN: 'F', colN1: 'G', type: 'credit' },
      { row: 12, comptes: ['708'], colN: 'F', colN1: 'G', type: 'credit' },
    ]},
    // NOTE 12: Charges de personnel (onglet 34)
    { sheet: 'NOTE 12', rows: [
      { row: 9, comptes: ['661'], colN: 'F', colN1: 'G', type: 'debit' },   // Rémunérations directes
      { row: 10, comptes: ['662'], colN: 'F', colN1: 'G', type: 'debit' },  // Primes et gratifications
      { row: 11, comptes: ['663'], colN: 'F', colN1: 'G', type: 'debit' },  // Congés payés
      { row: 12, comptes: ['664'], colN: 'F', colN1: 'G', type: 'debit' },  // Indemnités
      { row: 13, comptes: ['665', '666', '667', '668'], colN: 'F', colN1: 'G', type: 'debit' },
      { row: 17, comptes: ['6411', '6412', '6413'], colN: 'F', colN1: 'G', type: 'debit' },  // Charges sociales
      { row: 18, comptes: ['6414', '6415', '6416', '6418'], colN: 'F', colN1: 'G', type: 'debit' },
    ]},
    // NOTE 15A: Fournisseurs et comptes rattachés (onglet 37)
    { sheet: 'NOTE 15A', rows: [
      { row: 9, comptes: ['401'], colN: 'F', colN1: 'G', type: 'passif' },
      { row: 10, comptes: ['402'], colN: 'F', colN1: 'G', type: 'passif' },
      { row: 11, comptes: ['403', '404', '405'], colN: 'F', colN1: 'G', type: 'passif' },
      { row: 12, comptes: ['408'], colN: 'F', colN1: 'G', type: 'passif' },
    ]},
    // NOTE 16A: Dettes fiscales (onglet 39)
    { sheet: 'NOTE 16A', rows: [
      { row: 9, comptes: ['441'], colN: 'E', colN1: 'F', type: 'passif' },
      { row: 10, comptes: ['4421', '4422', '4424'], colN: 'E', colN1: 'F', type: 'passif' },
      { row: 11, comptes: ['4431', '4432', '4434'], colN: 'E', colN1: 'F', type: 'passif' },
      { row: 12, comptes: ['4441'], colN: 'E', colN1: 'F', type: 'passif' },
      { row: 13, comptes: ['445'], colN: 'E', colN1: 'F', type: 'passif' },
      { row: 14, comptes: ['446', '447'], colN: 'E', colN1: 'F', type: 'passif' },
      { row: 15, comptes: ['448', '449'], colN: 'E', colN1: 'F', type: 'passif' },
    ]},
    // NOTE 17: Personnel (onglet 43)
    { sheet: 'NOTE 17', rows: [
      { row: 9, comptes: ['421'], colN: 'F', colN1: 'G', type: 'passif' },
      { row: 10, comptes: ['422'], colN: 'F', colN1: 'G', type: 'passif' },
      { row: 11, comptes: ['423', '424', '425'], colN: 'F', colN1: 'G', type: 'passif' },
      { row: 12, comptes: ['426', '427', '428'], colN: 'F', colN1: 'G', type: 'passif' },
    ]},
    // NOTE 18: Organismes sociaux (onglet 44)
    { sheet: 'NOTE 18', rows: [
      { row: 9, comptes: ['431'], colN: 'F', colN1: 'G', type: 'passif' },
      { row: 10, comptes: ['432'], colN: 'F', colN1: 'G', type: 'passif' },
      { row: 11, comptes: ['433'], colN: 'F', colN1: 'G', type: 'passif' },
    ]},
    // NOTE 19: Associés et groupe (onglet 45)
    { sheet: 'NOTE 19', rows: [
      { row: 9, comptes: ['461'], colN: 'F', colN1: 'G', type: 'passif' },
      { row: 10, comptes: ['462', '463'], colN: 'F', colN1: 'G', type: 'passif' },
      { row: 11, comptes: ['464', '465', '466', '467'], colN: 'F', colN1: 'G', type: 'passif' },
      { row: 12, comptes: ['471', '472', '473', '474', '475', '476', '477'], colN: 'F', colN1: 'G', type: 'passif' },
    ]},
    // NOTE 20: Banques, crédits (onglet 46)
    { sheet: 'NOTE 20', rows: [
      { row: 9, comptes: ['5651'], colN: 'F', colN1: 'G', type: 'passif' },   // Escompte campagne
      { row: 10, comptes: ['5652'], colN: 'F', colN1: 'G', type: 'passif' },  // Escompte ordinaire
      { row: 12, comptes: ['521', '522', '523', '524', '525', '526', '527', '528'], colN: 'F', colN1: 'G', type: 'actif' },  // Banques locales
      { row: 16, comptes: ['561', '564'], colN: 'F', colN1: 'G', type: 'passif' },  // Crédit trésorerie
    ]},
    // NOTE 21: CA et autres produits (onglet 47) — detail ventilé
    { sheet: 'NOTE 21', rows: [
      { row: 9, comptes: ['7011'], colN: 'F', colN1: 'G', type: 'credit' },
      { row: 21, comptes: ['7051', '7061', '7071'], colN: 'F', colN1: 'G', type: 'credit' },
      { row: 27, comptes: ['708'], colN: 'F', colN1: 'G', type: 'credit' },
      { row: 37, comptes: ['72'], colN: 'F', colN1: 'G', type: 'credit' },
      { row: 38, comptes: ['71'], colN: 'F', colN1: 'G', type: 'credit' },
      { row: 39, comptes: ['75'], colN: 'F', colN1: 'G', type: 'credit' },
    ]},
    // NOTE 22: Achats (onglet 48) — detail par nature
    { sheet: 'NOTE 22', rows: [
      { row: 9, comptes: ['6011', '6012', '6013', '6014'], colN: 'F', colN1: 'G', type: 'debit' },
      { row: 15, comptes: ['6021', '6022', '6023', '6024'], colN: 'F', colN1: 'G', type: 'debit' },
      { row: 21, comptes: ['604', '605', '608'], colN: 'F', colN1: 'G', type: 'debit' },
    ]},
    // NOTE 23: Transports (onglet 49)
    { sheet: 'NOTE 23', rows: [
      { row: 9, comptes: ['612', '613', '614'], colN: 'F', colN1: 'G', type: 'debit' },
      { row: 12, comptes: ['616', '6181', '6182', '6183'], colN: 'F', colN1: 'G', type: 'debit' },
    ]},
    // NOTE 24: Services extérieurs (onglet 50)
    { sheet: 'NOTE 24', rows: [
      { row: 9, comptes: ['621'], colN: 'F', colN1: 'G', type: 'debit' },
      { row: 10, comptes: ['622'], colN: 'F', colN1: 'G', type: 'debit' },
      { row: 11, comptes: ['623', '624'], colN: 'F', colN1: 'G', type: 'debit' },
      { row: 12, comptes: ['625'], colN: 'F', colN1: 'G', type: 'debit' },
      { row: 13, comptes: ['626'], colN: 'F', colN1: 'G', type: 'debit' },
      { row: 14, comptes: ['627', '628'], colN: 'F', colN1: 'G', type: 'debit' },
    ]},
    // NOTE 25: Impôts et taxes (onglet 51)
    { sheet: 'NOTE 25', rows: [
      { row: 9, comptes: ['641'], colN: 'F', colN1: 'G', type: 'debit' },
      { row: 10, comptes: ['642', '643'], colN: 'F', colN1: 'G', type: 'debit' },
      { row: 11, comptes: ['644', '645', '646'], colN: 'F', colN1: 'G', type: 'debit' },
      { row: 12, comptes: ['647', '648', '649'], colN: 'F', colN1: 'G', type: 'debit' },
    ]},
    // NOTE 26: Autres charges (onglet 52)
    { sheet: 'NOTE 26', rows: [
      { row: 9, comptes: ['651'], colN: 'F', colN1: 'G', type: 'debit' },
      { row: 10, comptes: ['652'], colN: 'F', colN1: 'G', type: 'debit' },
      { row: 11, comptes: ['653', '654'], colN: 'F', colN1: 'G', type: 'debit' },
      { row: 12, comptes: ['655', '656', '657', '658', '659'], colN: 'F', colN1: 'G', type: 'debit' },
    ]},
    // NOTE 27A: Dotations amortissements (onglet 53)
    { sheet: 'NOTE 27A', rows: [
      { row: 9, comptes: ['6811', '6812'], colN: 'F', colN1: 'G', type: 'debit' },
      { row: 10, comptes: ['6813', '6814'], colN: 'F', colN1: 'G', type: 'debit' },
      { row: 14, comptes: ['6816', '6817', '6818', '6819'], colN: 'F', colN1: 'G', type: 'debit' },
      { row: 15, comptes: ['6911', '6912', '6913'], colN: 'F', colN1: 'G', type: 'debit' },
    ]},
  ]

  let noteDetailCount = 0
  for (const noteMap of noteDetailMappings) {
    const ws = wb.Sheets[noteMap.sheet]
    if (!ws) continue
    for (const row of noteMap.rows) {
      const cellN = `${row.colN}${row.row}`
      const cellN1 = `${row.colN1}${row.row}`
      // Skip if formula exists
      if (ws[cellN]?.f || ws[cellN1]?.f) continue
      let valN: number, valN1: number
      switch (row.type) {
        case 'actif':
          valN = getActifBrut(balance, row.comptes)
          valN1 = balanceN1.length > 0 ? getActifBrut(balanceN1, row.comptes) : 0
          break
        case 'passif':
          valN = getPassif(balance, row.comptes)
          valN1 = balanceN1.length > 0 ? getPassif(balanceN1, row.comptes) : 0
          break
        case 'credit':
          valN = -getBalanceSolde(balance, row.comptes)
          valN1 = balanceN1.length > 0 ? -getBalanceSolde(balanceN1, row.comptes) : 0
          break
        case 'debit':
          valN = getBalanceSolde(balance, row.comptes)
          valN1 = balanceN1.length > 0 ? getBalanceSolde(balanceN1, row.comptes) : 0
          break
        default:
          valN = -getBalanceSolde(balance, row.comptes)
          valN1 = balanceN1.length > 0 ? -getBalanceSolde(balanceN1, row.comptes) : 0
      }
      ws[cellN] = { t: 'n', v: valN, z: '#,##0' }
      ws[cellN1] = { t: 'n', v: valN1, z: '#,##0' }
      // Extend range
      for (const c of [cellN, cellN1]) {
        const cr = XLSX.utils.decode_cell(c)
        const rng = XLSX.utils.decode_range(ws['!ref'] || 'A1')
        if (cr.r > rng.e.r) rng.e.r = cr.r
        if (cr.c > rng.e.c) rng.e.c = cr.c
        ws['!ref'] = XLSX.utils.encode_range(rng)
      }
      noteDetailCount += 2
    }
  }

  console.log(`[Mode B] ${headerCount} en-têtes entreprise, ${noteDetailCount} cellules notes détaillées injectés`)

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
