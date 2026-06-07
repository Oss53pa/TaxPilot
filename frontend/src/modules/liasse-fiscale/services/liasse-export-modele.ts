/**
 * liasse-export-modele.ts — Mode B: Injection dans le modèle Excel officiel
 *
 * Charge le template SYSCOHADA (84 onglets), injecte les valeurs calculées
 * cellule par cellule, préserve toutes les formules et la mise en page.
 */

import * as XLSX from 'xlsx'
import { logger } from '@/utils/logger'
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
  const detail: Record<string, { brut: number; amort: number; brutN1: number; amortN1: number }> = {}
  for (const [ref, map] of Object.entries(actifMapping)) {
    detail[ref] = {
      brut: getActifBrut(balance, map.comptes),
      amort: map.amort.length > 0 ? getAmortProv(balance, map.amort) : 0,
      brutN1: balanceN1.length > 0 ? getActifBrut(balanceN1, map.comptes) : 0,
      amortN1: balanceN1.length > 0 && map.amort.length > 0 ? getAmortProv(balanceN1, map.amort) : 0,
    }
  }

  // Ventilation au prorata du brut d'un amortissement générique non ventilé
  // (ex. 282100 imputé aux terrains → net négatif absurde). Déclenchée uniquement
  // si un poste du groupe ressort net < 0. Préserve le total d'amort du groupe
  // (donc l'équilibre du bilan). Miroir de LiasseDataService.redistributeAmortByBrut.
  const AMORT_GROUPS = [
    ['AE', 'AF', 'AG', 'AH'],        // incorporelles
    ['AJ', 'AK', 'AL', 'AM', 'AN'],  // corporelles
  ]
  const redistribute = (key: 'brut' | 'brutN1', amortKey: 'amort' | 'amortN1') => {
    for (const grp of AMORT_GROUPS) {
      const items = grp.map(r => detail[r]).filter(Boolean)
      if (!items.some(i => i[key] - i[amortKey] < -0.5)) continue
      const gBrut = items.reduce((s, i) => s + i[key], 0)
      const gAmort = items.reduce((s, i) => s + i[amortKey], 0)
      if (gBrut <= 0) continue
      const rate = gAmort / gBrut
      for (const i of items) i[amortKey] = i[key] * rate
    }
  }
  redistribute('brut', 'amort')
  if (balanceN1.length > 0) redistribute('brutN1', 'amortN1')

  for (const ref of Object.keys(actifMapping)) {
    const d = detail[ref]
    vals[`${ref}.brut`] = d.brut
    vals[`${ref}.amort`] = d.amort
    vals[`${ref}.netN1`] = balanceN1.length > 0 ? d.brutN1 - d.amortN1 : 0
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
    // 'signed' : dettes de location-acquisition (17) en NET — un solde débiteur
    // (ex. 176 intérêts courus débiteurs) RÉDUIT la dette au lieu d'être orphelin
    // (sinon bilan déséquilibré de ce montant). Conforme à la présentation cabinet.
    DB: { comptes: [...BILAN_PASSIF.DB.comptes], special: 'signed' },
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

  // ── Report du résultat de l'exercice dans le bilan (poste CJ) ──
  // CJ = -solde(compte 13). Sur une balance PRÉ-CLÔTURE, le résultat est encore
  // ventilé en classes 6/7 et le compte 13 est vide → CJ = 0 → le bilan exporté
  // affiche un résultat net nul et ne boucle pas. On injecte alors le résultat
  // calculé (XI), en miroir EXACT de la logique du moteur écran (liasseDataService
  // generateBilanPassif, poste résultat) : compte 13 prioritaire s'il est servi
  // (balance post-affectation), sinon résultat du compte de résultat.
  const hasClass13N = Math.abs(getBalanceSolde(balance, ['13'])) > 0.5
  const hasPLN = balance.some(e => e.compte.startsWith('6') || e.compte.startsWith('7'))
  if (!hasClass13N && hasPLN) vals['CJ.netN'] = n('XI.netN')
  if (balanceN1.length > 0) {
    const hasClass13N1 = Math.abs(getBalanceSolde(balanceN1, ['13'])) > 0.5
    const hasPLN1 = balanceN1.some(e => e.compte.startsWith('6') || e.compte.startsWith('7'))
    if (!hasClass13N1 && hasPLN1) vals['CJ.netN1'] = n('XI.netN1')
  }
  // IMPORTANT : recalculer les totaux passif qui DÉPENDENT de CJ après l'injection
  // du résultat, sinon CP/DF/DZ restent calculés avec CJ=0 → l'audit voit un faux
  // déséquilibre (Total Passif amputé du résultat) et BLOQUE un export pourtant valide.
  for (const sfx of ['netN', 'netN1'] as const) {
    if (sfx === 'netN1' && balanceN1.length === 0) continue
    const m = (ref: string) => Number(vals[`${ref}.${sfx}`]) || 0
    vals[`CP.${sfx}`] = m('CA') - m('CB') + m('CD') + m('CE') + m('CF') + m('CG') + m('CH') + m('CJ') + m('CL') + m('CM')
    vals[`DF.${sfx}`] = m('CP') + m('DD')
    vals[`DZ.${sfx}`] = m('DF') + m('DP') + m('DT') + m('DV')
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

  // NOTE 1 (Dettes garanties par des sûretés réelles) : DÉCLARATIVE, saisie manuelle.
  // Le caractère "garanti" d'une dette n'est pas porté par les comptes → non dérivable
  // de la balance. L'ancienne injection (toutes les dettes) produisait un faux par défaut.
  // Retirée (cf. CELL_MAP). La note reste vide/manuelle, comme la pratique cabinet.

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

  // NOTE 3C BIS: Dépréciations — mouvements (onglet 20)
  // Same pattern as NOTE 3C but for depreciation accounts (29x only, not 28x amort)
  const n3cbLine = (comptes: string[], prefix: string) => {
    const ouv = balanceN1.length > 0 ? getAmortProv(balanceN1, comptes) : 0
    const clo = getAmortProv(balance, comptes)
    vals[`${prefix}_D.val`] = ouv                      // Dépréciations ouverture
    vals[`${prefix}_F.val`] = Math.max(0, clo - ouv)   // Dotations (augmentations)
    vals[`${prefix}_H.val`] = Math.max(0, ouv - clo)   // Reprises (diminutions)
  }
  n3cbLine(['2911', '2912'], 'N3CB_11')  // Dépréc frais développement
  n3cbLine(['2913', '2914', '2915'], 'N3CB_12')  // Dépréc brevets
  n3cbLine(['2916'], 'N3CB_13')  // Dépréc fonds commercial
  n3cbLine(['2917', '2918', '2919'], 'N3CB_14')  // Dépréc autres immo incorp
  n3cbLine(['292'], 'N3CB_16')  // Dépréc terrains
  n3cbLine(['2931', '2932', '2933', '2934'], 'N3CB_18')  // Dépréc bâtiments
  n3cbLine(['2935', '2937', '2938'], 'N3CB_20')  // Dépréc aménagements
  n3cbLine(['2941', '2942', '2943', '2944'], 'N3CB_21')  // Dépréc matériel
  n3cbLine(['2945'], 'N3CB_22')  // Dépréc transport

  // NOTE 28: Dotations & charges pour provisions et dépréciations (onglet 55)
  // Movement table: E=ouverture, F=dot exploitation, G=dot financières, H=dot HAO,
  //                 I=reprises exploitation, J=reprises financières, K=reprises HAO
  // Row 12: Provisions financières risques et charges (19x)
  const n28_prov_ouv = balanceN1.length > 0 ? getPassif(balanceN1, ['19']) : 0
  const n28_prov_clo = getPassif(balance, ['19'])
  vals['N28_E12.val'] = n28_prov_ouv
  // Dotations financières pour provisions = augmentation
  vals['N28_G12.val'] = Math.max(0, n28_prov_clo - n28_prov_ouv)
  // Reprises financières = diminution
  vals['N28_J12.val'] = Math.max(0, n28_prov_ouv - n28_prov_clo)
  // Row 17: Dépréciations comptes clients (491)
  const n28_cli_ouv = balanceN1.length > 0 ? getAmortProv(balanceN1, ['491']) : 0
  const n28_cli_clo = getAmortProv(balance, ['491'])
  vals['N28_E17.val'] = n28_cli_ouv
  vals['N28_F17.val'] = Math.max(0, n28_cli_clo - n28_cli_ouv)  // Dot exploitation
  vals['N28_I17.val'] = Math.max(0, n28_cli_ouv - n28_cli_clo)  // Reprise exploitation
  // Row 13: Dépréciations des immobilisations (29x)
  const n28_immo_ouv = balanceN1.length > 0 ? getAmortProv(balanceN1, ['29']) : 0
  const n28_immo_clo = getAmortProv(balance, ['29'])
  vals['N28_E13.val'] = n28_immo_ouv
  vals['N28_F13.val'] = Math.max(0, n28_immo_clo - n28_immo_ouv)
  vals['N28_I13.val'] = Math.max(0, n28_immo_ouv - n28_immo_clo)
  // Row 15: Dépréciations stocks (39x)
  const n28_stk_ouv = balanceN1.length > 0 ? getAmortProv(balanceN1, ['39']) : 0
  const n28_stk_clo = getAmortProv(balance, ['39'])
  vals['N28_E15.val'] = n28_stk_ouv
  vals['N28_F15.val'] = Math.max(0, n28_stk_clo - n28_stk_ouv)
  vals['N28_I15.val'] = Math.max(0, n28_stk_ouv - n28_stk_clo)

  // NOTE 10 (Valeurs à encaisser) & NOTE 14 (Primes et réserves) sont désormais
  // injectées via noteDetailMappings (remap template). Les anciens blocs N10_*
  // (emprunts → relèvent de NOTE 16A) et N14_* (résultat financier → NOTE 29)
  // étaient assignés aux mauvaises feuilles et ont été retirés (cf. CELL_MAP).

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
  const vals = computeAllValues(balance, balanceN1, balanceN2)

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
        logger.error('[Audit]', msg)
      } else {
        logger.warn('[Audit]', msg)
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
      logger.warn('[Audit anomalie]', msg)
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
    logger.warn(`[Audit] ${bloquants.length} contrôle(s) bloquant(s) — export autorisé (bilan équilibré)`)
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
    // Notes with layout B (H4 sigle)
    'NOTE 8B': 'layoutB', 'NOTE 8C': 'layoutB',
    // FICHE R2/R3 use layout B
    'FICHE R2': 'layoutB', 'FICHE R3': 'layoutB',
    // SUPPL sheets use layout A-like header
    'SUPPL1': 'layoutA', 'SUPPL2': 'layoutA', 'SUPPL3': 'layoutA',
    'SUPPL4': 'layoutA', 'SUPPL5': 'layoutA', 'SUPPL6': 'layoutB',
    'SUPPL7': 'layoutB',
    // COMP sheets
    'COMP-TVA': 'layoutA', 'COMP-TVA (2)': 'layoutA',
    // COMMENTAIRE
    'COMMENTAIRE': 'layoutB',
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

  // 3i. Inject FICHE R2 (onglet 7) — company activities and CA
  const wsR2 = wb.Sheets['FICHE R2']
  if (wsR2) {
    const r2Data: [string, string | number][] = [
      ['I3', entreprise.denomination || ''],
      ['E4', entreprise.adresse || ''],
      ['AI4', entreprise.sigle || ''],
      ['I5', entreprise.ncc || ''],
      ['W5', entreprise.exercice_clos || ''],
      ['AI5', entreprise.duree_mois || 12],
      ['I6', entreprise.ntd || ''],
      ['Q9', entreprise.forme_juridique || ''],
      ['Q13', entreprise.code_pays || ''],
    ]
    for (const [cell, val] of r2Data) {
      if (!val && val !== 0) continue
      const existing = wsR2[cell]
      if (existing?.f) continue
      wsR2[cell] = { t: typeof val === 'number' ? 'n' : 's', v: val }
      headerCount++
    }
  }

  // 3i-bis. Inject NOTE 27B (onglet 54) — effectifs from entreprise data
  const ws27b = wb.Sheets['NOTE 27B']
  if (ws27b) {
    const ent27b: [string, string | number][] = [
      ['D3', entreprise.denomination || ''],
      ['C4', entreprise.adresse || ''],
      ['R4', entreprise.sigle || ''],
      ['D5', entreprise.ncc || ''],
      ['O5', entreprise.exercice_clos || ''],
      ['S5', entreprise.duree_mois || 12],
      ['D6', entreprise.ntd || ''],
    ]
    for (const [cell, val] of ent27b) {
      if (!val && val !== 0) continue
      const existing = ws27b[cell]
      if (existing?.f) continue
      ws27b[cell] = { t: typeof val === 'number' ? 'n' : 's', v: val }
      headerCount++
    }
    // Inject effectifs if available
    if (entreprise.effectif_permanent) {
      ws27b['K16'] = { t: 'n', v: entreprise.effectif_permanent, z: '#,##0' }
      headerCount++
    }
    if (entreprise.effectif_temporaire) {
      ws27b['K26'] = { t: 'n', v: entreprise.effectif_temporaire, z: '#,##0' }
      headerCount++
    }
    if (entreprise.masse_salariale) {
      ws27b['S16'] = { t: 'n', v: entreprise.masse_salariale, z: '#,##0' }
      headerCount++
    }
  }

  // 3j. Dynamic injection for detailed notes (NOTE 4-9, 11-13, 15A-35)
  // These notes have a pattern: column E or F = Année N, next column = Année N-1
  // Values are balance-derived and mapped by account prefix
  // We inject directly where we find matching account patterns
  const noteDetailMappings: { sheet: string; rows: { row: number; comptes: string[]; colN: string; colN1: string; type: 'actif' | 'passif' | 'credit' | 'debit' | 'signed' }[] }[] = [
    // REMAPPE contre le template officiel (workflow audit) : chaque note sur SA feuille,
    // lignes alignees sur la structure reelle du template. Ne pas reintroduire l'ancien
    // schema (notes melangees : personnel<->ecarts, CA<->capital, fournisseurs<->personnel...).
    { sheet: 'NOTE 4', rows: [
      { row: 9, comptes: ['26'], colN: 'F', colN1: 'G', type: 'actif' },  // Titres de participation
      { row: 10, comptes: ['271'], colN: 'F', colN1: 'G', type: 'actif' },  // Prêts et créances
      { row: 11, comptes: ['272'], colN: 'F', colN1: 'G', type: 'actif' },  // Prêt au personnel
      { row: 12, comptes: ['273'], colN: 'F', colN1: 'G', type: 'actif' },  // Créances sur l’état
      { row: 13, comptes: ['274'], colN: 'F', colN1: 'G', type: 'actif' },  // Titres immobilisés
      { row: 14, comptes: ['275'], colN: 'F', colN1: 'G', type: 'actif' },  // Dépôts et cautionnements
      { row: 15, comptes: ['276'], colN: 'F', colN1: 'G', type: 'actif' },  // Intérêts courus
      { row: 16, comptes: ['277'], colN: 'F', colN1: 'G', type: 'actif' },  // Créances rattachées à des avances et participations à des GIE
      { row: 17, comptes: ['278'], colN: 'F', colN1: 'G', type: 'actif' },  // Immobilisations financières diverses
    ]},
    { sheet: 'NOTE 5', rows: [
      { row: 10, comptes: ['485'], colN: 'E', colN1: 'G', type: 'actif' },  // Créances sur cessions d’immobilisations
      { row: 11, comptes: ['486', '488'], colN: 'E', colN1: 'G', type: 'actif' },  // Autres créances hors activités ordinaires
      { row: 13, comptes: ['498'], colN: 'E', colN1: 'G', type: 'actif' },  // Dépréciations des créances HAO
      { row: 22, comptes: ['481'], colN: 'E', colN1: 'G', type: 'passif' },  // Fournisseurs d’investissements
      { row: 23, comptes: ['482'], colN: 'E', colN1: 'G', type: 'passif' },  // Fournisseurs d’investissements effets à payer
      { row: 24, comptes: ['4726', '4727'], colN: 'E', colN1: 'G', type: 'passif' },  // Versements restant à effectuer sur titres de participation et titres i
      { row: 25, comptes: ['484'], colN: 'E', colN1: 'G', type: 'passif' },  // Autres dettes hors activités ordinaires
    ]},
    { sheet: 'NOTE 6', rows: [
      { row: 9, comptes: ['31'], colN: 'E', colN1: 'G', type: 'actif' },  // Marchandises
      { row: 10, comptes: ['32'], colN: 'E', colN1: 'G', type: 'actif' },  // Matières premières et fournitures liées
      { row: 11, comptes: ['33'], colN: 'E', colN1: 'G', type: 'actif' },  // Autres approvisionnements
      { row: 12, comptes: ['34'], colN: 'E', colN1: 'G', type: 'actif' },  // Produits en cours
      { row: 13, comptes: ['35'], colN: 'E', colN1: 'G', type: 'actif' },  // Services en cours
      { row: 14, comptes: ['36'], colN: 'E', colN1: 'G', type: 'actif' },  // Produits finis
      { row: 15, comptes: ['37'], colN: 'E', colN1: 'G', type: 'actif' },  // Produits intermédiaires
      { row: 16, comptes: ['38'], colN: 'E', colN1: 'G', type: 'actif' },  // Stocks en cours de route, en consignation ou en dépôt
      { row: 18, comptes: ['39'], colN: 'E', colN1: 'G', type: 'passif' },  // Dépréciations des stocks
    ]},
    { sheet: 'NOTE 7', rows: [
      { row: 9, comptes: ['411', '412'], colN: 'E', colN1: 'F', type: 'actif' },  // Clients (hors réserves de propriété et Groupe)
      { row: 10, comptes: ['413'], colN: 'E', colN1: 'F', type: 'actif' },  // Clients effets à recevoir (hors réserves de propriété et groupe)
      { row: 11, comptes: ['4194'], colN: 'E', colN1: 'F', type: 'actif' },  // Clients avec réserves de propriété
      { row: 12, comptes: ['4191'], colN: 'E', colN1: 'F', type: 'actif' },  // Clients et effets à recevoir Groupe
      { row: 13, comptes: ['414'], colN: 'E', colN1: 'F', type: 'actif' },  // Créances sur cession d’immobilisations
      { row: 14, comptes: ['415'], colN: 'E', colN1: 'F', type: 'actif' },  // Clients effets escomptés et non échus
      { row: 15, comptes: ['416'], colN: 'E', colN1: 'F', type: 'actif' },  // Créances litigieuses ou douteuses
      { row: 16, comptes: ['418'], colN: 'E', colN1: 'F', type: 'actif' },  // Clients produits à recevoir
      { row: 18, comptes: ['491'], colN: 'E', colN1: 'F', type: 'passif' },  // Dépréciations des comptes clients
      { row: 20, comptes: ['4191'], colN: 'E', colN1: 'F', type: 'passif' },  // Clients, avances reçues hors groupe
      { row: 21, comptes: ['4192'], colN: 'E', colN1: 'F', type: 'passif' },  // Clients, avances reçues groupe
      { row: 22, comptes: ['4198', '4199'], colN: 'E', colN1: 'F', type: 'passif' },  // Autres clients créditeurs
    ]},
    { sheet: 'NOTE 8', rows: [
      { row: 9, comptes: ['421', '422', '423', '424', '425', '426', '4271', '4287'], colN: 'E', colN1: 'F', type: 'actif' },  // Personnel
      { row: 10, comptes: ['431', '432', '433', '4387'], colN: 'E', colN1: 'F', type: 'actif' },  // Organismes sociaux
      { row: 11, comptes: ['441', '442', '443', '444', '445', '446', '447', '448', '4493', '4499'], colN: 'E', colN1: 'F', type: 'actif' },  // Etat et Collectivités publiques
      { row: 12, comptes: ['451', '452', '453', '454', '455', '456', '457', '458'], colN: 'E', colN1: 'F', type: 'actif' },  // Organismes internationaux
      { row: 13, comptes: ['462', '465', '467', '4619'], colN: 'E', colN1: 'F', type: 'actif' },  // Apporteurs, associés et groupe
      { row: 14, comptes: ['475'], colN: 'E', colN1: 'F', type: 'actif' },  // Compte transitoire ajustement spécial lié à la révision du SYSCOHADA (
      { row: 15, comptes: ['471', '472', '473', '474', '476', '477', '478'], colN: 'E', colN1: 'F', type: 'actif' },  // Autres débiteurs divers
      { row: 16, comptes: ['181', '185'], colN: 'E', colN1: 'F', type: 'actif' },  // Comptes permanents non bloqués des établissements et des succursales
      { row: 17, comptes: ['186', '187'], colN: 'E', colN1: 'F', type: 'actif' },  // Comptes de liaison charges et produits
      { row: 18, comptes: ['188'], colN: 'E', colN1: 'F', type: 'actif' },  // Comptes de liaison des sociétés en participation
    ]},
    { sheet: 'NOTE 9', rows: [
      { row: 9, comptes: ['501'], colN: 'E', colN1: 'G', type: 'actif' },  // Titres de trésor et bons de caisse à court terme
      { row: 10, comptes: ['502'], colN: 'E', colN1: 'G', type: 'actif' },  // Actions
      { row: 11, comptes: ['503'], colN: 'E', colN1: 'G', type: 'actif' },  // Obligations
      { row: 12, comptes: ['504'], colN: 'E', colN1: 'G', type: 'actif' },  // Bons de souscription
      { row: 13, comptes: ['505'], colN: 'E', colN1: 'G', type: 'actif' },  // Titres négociables hors régions
      { row: 14, comptes: ['506'], colN: 'E', colN1: 'G', type: 'actif' },  // Intérêts courus
      { row: 15, comptes: ['508'], colN: 'E', colN1: 'G', type: 'actif' },  // Autres valeurs assimilées
      { row: 17, comptes: ['590'], colN: 'E', colN1: 'G', type: 'passif' },  // Dépréciations des titres
    ]},
    { sheet: 'NOTE 10', rows: [
      { row: 9, comptes: ['511'], colN: 'E', colN1: 'G', type: 'actif' },  // Effets à encaisser
      { row: 10, comptes: ['512'], colN: 'E', colN1: 'G', type: 'actif' },  // Effets à l’encaissement
      { row: 11, comptes: ['513'], colN: 'E', colN1: 'G', type: 'actif' },  // Chèques à encaisser
      { row: 12, comptes: ['514'], colN: 'E', colN1: 'G', type: 'actif' },  // Chèques à l’encaissement
      { row: 13, comptes: ['515'], colN: 'E', colN1: 'G', type: 'actif' },  // Cartes de crédit à encaisser
      { row: 14, comptes: ['516', '517', '518'], colN: 'E', colN1: 'G', type: 'actif' },  // Autres valeurs à encaisser
      { row: 16, comptes: ['591'], colN: 'E', colN1: 'G', type: 'passif' },  // Dépréciations des valeurs à encaisser
    ]},
    { sheet: 'NOTE 11', rows: [
      { row: 9, comptes: ['521'], colN: 'E', colN1: 'G', type: 'actif' },  // Banques locales
      { row: 10, comptes: ['522'], colN: 'E', colN1: 'G', type: 'actif' },  // Banques autres états région
      { row: 11, comptes: ['523', '524'], colN: 'E', colN1: 'G', type: 'actif' },  // Banques, dépôt à terme
      { row: 12, comptes: ['525'], colN: 'E', colN1: 'G', type: 'actif' },  // Autres Banques
      { row: 13, comptes: ['526'], colN: 'E', colN1: 'G', type: 'actif' },  // Banques intérêts courus
      { row: 14, comptes: ['531', '532', '533'], colN: 'E', colN1: 'G', type: 'actif' },  // Chèques postaux
      { row: 15, comptes: ['534', '535', '536', '537', '538'], colN: 'E', colN1: 'G', type: 'actif' },  // Autres établissement financiers
      { row: 16, comptes: ['539'], colN: 'E', colN1: 'G', type: 'actif' },  // Etablissement financiers intérêts courus
      { row: 17, comptes: ['54'], colN: 'E', colN1: 'G', type: 'actif' },  // Instruments de trésorerie
      { row: 18, comptes: ['55'], colN: 'E', colN1: 'G', type: 'actif' },  // Instruments de monnaie électronique
      { row: 19, comptes: ['57'], colN: 'E', colN1: 'G', type: 'actif' },  // Caisse
      { row: 20, comptes: ['58'], colN: 'E', colN1: 'G', type: 'actif' },  // Régies d’avances et virements accréditifs
    ]},
    { sheet: 'NOTE 12', rows: [
      { row: 29, comptes: ['781'], colN: 'G', colN1: 'H', type: 'credit' },  // Transferts de charges d’exploitation
      { row: 36, comptes: ['787'], colN: 'G', colN1: 'H', type: 'credit' },  // Transferts de charges financières
    ]},
    // NOTE 13 : non injecte (NOTE 13 : CAPITAL)
    { sheet: 'NOTE 14', rows: [
      { row: 9, comptes: ['1051'], colN: 'F', colN1: 'G', type: 'passif' },  // Primes d’émission
      { row: 10, comptes: ['1052'], colN: 'F', colN1: 'G', type: 'passif' },  // Prime d’apport
      { row: 11, comptes: ['1053'], colN: 'F', colN1: 'G', type: 'passif' },  // Prime de fusion
      { row: 12, comptes: ['1054'], colN: 'F', colN1: 'G', type: 'passif' },  // Prime de conversion
      { row: 13, comptes: ['1058'], colN: 'F', colN1: 'G', type: 'passif' },  // Autres primes
      { row: 15, comptes: ['111'], colN: 'F', colN1: 'G', type: 'passif' },  // Réserves légales
      { row: 16, comptes: ['112'], colN: 'F', colN1: 'G', type: 'passif' },  // Réserves statutaires
      { row: 17, comptes: ['1131'], colN: 'F', colN1: 'G', type: 'passif' },  // Réserves de plus-values nettes à long terme
      { row: 18, comptes: ['1133'], colN: 'F', colN1: 'G', type: 'passif' },  // Réserves d’attribution gratuite d’actions au personnel salarié et aux 
      { row: 19, comptes: ['1132', '1134', '1138'], colN: 'F', colN1: 'G', type: 'passif' },  // Autres réserves réglementées
      { row: 21, comptes: ['118'], colN: 'F', colN1: 'G', type: 'passif' },  // Réserves libres
      { row: 22, comptes: ['12'], colN: 'F', colN1: 'G', type: 'signed' },  // Report à nouveau
    ]},
    { sheet: 'NOTE 15A', rows: [
      { row: 16, comptes: ['141', '142', '148'], colN: 'E', colN1: 'F', type: 'passif' },  // Autres
      { row: 18, comptes: ['151'], colN: 'E', colN1: 'F', type: 'passif' },  // Amortissements dérogatoires
      { row: 19, comptes: ['152'], colN: 'E', colN1: 'F', type: 'passif' },  // Plus-value de cession à réinvestir
      { row: 20, comptes: ['154'], colN: 'E', colN1: 'F', type: 'passif' },  // Provisions spéciales de réévaluation
      { row: 21, comptes: ['155'], colN: 'E', colN1: 'F', type: 'passif' },  // Provisions réglementées relatives aux immobilisations
      { row: 22, comptes: ['156'], colN: 'E', colN1: 'F', type: 'passif' },  // Provisions réglementés relatives aux stocks
      { row: 23, comptes: ['157'], colN: 'E', colN1: 'F', type: 'passif' },  // Provisions pour investissement
      { row: 24, comptes: ['153', '158'], colN: 'E', colN1: 'F', type: 'passif' },  // Autres provisions et fonds réglementées
    ]},
    { sheet: 'NOTE 15B', rows: [
      { row: 9, comptes: ['167'], colN: 'G', colN1: 'H', type: 'passif' },  // Titres participatifs
      { row: 10, comptes: ['168'], colN: 'G', colN1: 'H', type: 'passif' },  // Avances conditionnées
      { row: 11, comptes: ['1661'], colN: 'G', colN1: 'H', type: 'passif' },  // Titres subordonnés à durée indéterminée (T.S.D.I.)
      { row: 12, comptes: ['1662'], colN: 'G', colN1: 'H', type: 'passif' },  // Obligations remboursables en actions (O.R.A.)
      { row: 13, comptes: ['1663', '1664', '1665', '1666', '1667', '1668', '1669', '169'], colN: 'G', colN1: 'H', type: 'passif' },  //  Autres avances et dettes assorties de conditions particulières
    ]},
    { sheet: 'NOTE 16A', rows: [
      { row: 9, comptes: ['161'], colN: 'E', colN1: 'F', type: 'passif' },  // Emprunts obligataires
      { row: 10, comptes: ['162', '163', '164'], colN: 'E', colN1: 'F', type: 'passif' },  // Emprunts et dettes auprès des établissements de crédit
      { row: 11, comptes: ['181'], colN: 'E', colN1: 'F', type: 'passif' },  // Avances reçues de l’Etat
      { row: 12, comptes: ['165'], colN: 'E', colN1: 'F', type: 'passif' },  // Avances reçues et comptes courants bloqués
      { row: 13, comptes: ['183'], colN: 'E', colN1: 'F', type: 'passif' },  // Dépôts et cautionnements reçus
      { row: 14, comptes: ['166'], colN: 'E', colN1: 'F', type: 'passif' },  // Intérêts courus
      { row: 15, comptes: ['167', '182'], colN: 'E', colN1: 'F', type: 'passif' },  // Avances et dettes assorties de conditions particulières
      { row: 16, comptes: ['168', '184', '185', '186'], colN: 'E', colN1: 'F', type: 'passif' },  // Autres emprunts et dettes
      { row: 17, comptes: ['187', '188'], colN: 'E', colN1: 'F', type: 'passif' },  // Dettes liées à des participations et sociétés en participation
      { row: 18, comptes: ['189'], colN: 'E', colN1: 'F', type: 'passif' },  // Comptes permanents bloqués des établissements et succursales
      { row: 20, comptes: ['171'], colN: 'E', colN1: 'F', type: 'passif' },  // Crédit bail immobilier
      { row: 21, comptes: ['172'], colN: 'E', colN1: 'F', type: 'passif' },  // Crédit bail mobilier
      { row: 22, comptes: ['173'], colN: 'E', colN1: 'F', type: 'passif' },  // Location vente
      { row: 23, comptes: ['176'], colN: 'E', colN1: 'F', type: 'passif' },  // Intérêts courus
      { row: 24, comptes: ['174', '175', '177', '178'], colN: 'E', colN1: 'F', type: 'passif' },  // Autres dettes de location acquisition
      { row: 26, comptes: ['191'], colN: 'E', colN1: 'F', type: 'passif' },  // Provisions pour litiges
      { row: 27, comptes: ['192'], colN: 'E', colN1: 'F', type: 'passif' },  // Provisions pour garantie donnés aux clients
      { row: 28, comptes: ['193'], colN: 'E', colN1: 'F', type: 'passif' },  // Provisions pour pertes sur marchés à achèvement futur
      { row: 29, comptes: ['194'], colN: 'E', colN1: 'F', type: 'passif' },  // Provisions pour pertes de change
      { row: 30, comptes: ['195'], colN: 'E', colN1: 'F', type: 'passif' },  // Provisions pour impôts
      { row: 31, comptes: ['196'], colN: 'E', colN1: 'F', type: 'passif' },  // Provisions pour pensions et obligations assimilées - engagements de re
      { row: 33, comptes: ['197'], colN: 'E', colN1: 'F', type: 'passif' },  // Provisions pour restructuration
      { row: 38, comptes: ['198'], colN: 'E', colN1: 'F', type: 'passif' },  // Autres provisions
    ]},
    { sheet: 'NOTE 17', rows: [
      { row: 9, comptes: ['4011'], colN: 'F', colN1: 'G', type: 'passif' },  // Fournisseurs dettes en compte (hors groupe)
      { row: 10, comptes: ['4013', '403'], colN: 'F', colN1: 'G', type: 'passif' },  // Fournisseurs, sous-traitants
      { row: 11, comptes: ['4016'], colN: 'F', colN1: 'G', type: 'passif' },  // Fournisseurs, réserve de propriété
      { row: 12, comptes: ['4017'], colN: 'F', colN1: 'G', type: 'passif' },  // Fournisseurs, retenue de garantie
      { row: 13, comptes: ['4021'], colN: 'F', colN1: 'G', type: 'passif' },  // Fournisseurs effets à payer (hors groupe)
      { row: 14, comptes: ['4012', '4022'], colN: 'F', colN1: 'G', type: 'passif' },  // Fournisseurs, dettes et effets à payer groupe
      { row: 15, comptes: ['404', '405'], colN: 'F', colN1: 'G', type: 'passif' },  // Fournisseurs, acquisitions courantes d’immobilisations
      { row: 16, comptes: ['4081'], colN: 'F', colN1: 'G', type: 'passif' },  // Fournisseurs factures non parvenues (hors groupe)
      { row: 17, comptes: ['4086'], colN: 'F', colN1: 'G', type: 'passif' },  // Fournisseurs factures non parvenues groupe
      { row: 19, comptes: ['4091'], colN: 'F', colN1: 'G', type: 'actif' },  // Fournisseurs, avances et acomptes (hors groupe)
      { row: 20, comptes: ['4092'], colN: 'F', colN1: 'G', type: 'actif' },  // Fournisseurs, avances et acomptes groupe
      { row: 21, comptes: ['4098', '4019'], colN: 'F', colN1: 'G', type: 'actif' },  // Autres fournisseurs débiteurs
    ]},
    { sheet: 'NOTE 18', rows: [
      { row: 9, comptes: ['422'], colN: 'E', colN1: 'F', type: 'passif' },  // Personnel rémunérations dues
      { row: 10, comptes: ['428'], colN: 'E', colN1: 'F', type: 'passif' },  // Personnel, congés à payer
      { row: 11, comptes: ['4386'], colN: 'E', colN1: 'F', type: 'passif' },  // Charges sociales sur congés à payer
      { row: 12, comptes: ['421', '423', '424', '425', '426', '427'], colN: 'E', colN1: 'F', type: 'passif' },  // Autres personnel
      { row: 13, comptes: ['431'], colN: 'E', colN1: 'F', type: 'passif' },  // Caisse de sécurité sociale
      { row: 14, comptes: ['432'], colN: 'E', colN1: 'F', type: 'passif' },  // Caisse de retraite
      { row: 15, comptes: ['433'], colN: 'E', colN1: 'F', type: 'passif' },  // Mutuelle de santé
      { row: 16, comptes: ['434'], colN: 'E', colN1: 'F', type: 'passif' },  // Assurance Retraite
      { row: 17, comptes: ['4381', '4382', '4387', '4388'], colN: 'E', colN1: 'F', type: 'passif' },  // Autres charges sociales à payer
      { row: 18, comptes: ['435', '436', '437'], colN: 'E', colN1: 'F', type: 'passif' },  // Autres cotisations et organismes sociaux
      { row: 20, comptes: ['441'], colN: 'E', colN1: 'F', type: 'passif' },  // Etat, impôts sur les bénéfices
      { row: 21, comptes: ['442'], colN: 'E', colN1: 'F', type: 'passif' },  // Etat, impôts et taxes
      { row: 22, comptes: ['443', '444', '445'], colN: 'E', colN1: 'F', type: 'passif' },  // Etat, TVA
      { row: 23, comptes: ['447'], colN: 'E', colN1: 'F', type: 'passif' },  // Etat, impôts retenus à la source
      { row: 24, comptes: ['446', '448', '449'], colN: 'E', colN1: 'F', type: 'passif' },  // Autres dettes Etat
    ]},
    { sheet: 'NOTE 19', rows: [
      { row: 9, comptes: ['461'], colN: 'E', colN1: 'F', type: 'passif' },  // Organismes internationaux
      { row: 10, comptes: ['462', '463', '467'], colN: 'E', colN1: 'F', type: 'passif' },  // Apporteurs, opérations sur le capital
      { row: 12, comptes: ['465'], colN: 'E', colN1: 'F', type: 'passif' },  // Associés dividendes à payer
      { row: 13, comptes: ['451'], colN: 'E', colN1: 'F', type: 'passif' },  // Groupe, comptes courants
      { row: 14, comptes: ['464', '466', '468'], colN: 'E', colN1: 'F', type: 'passif' },  // Autres dettes associés
      { row: 16, comptes: ['471', '472'], colN: 'E', colN1: 'F', type: 'passif' },  // Créditeurs divers
      { row: 17, comptes: ['473'], colN: 'E', colN1: 'F', type: 'passif' },  // Obligataires
      { row: 18, comptes: ['474'], colN: 'E', colN1: 'F', type: 'passif' },  // Rémunérations d’administrateurs
      { row: 19, comptes: ['475'], colN: 'E', colN1: 'F', type: 'passif' },  // Compte d’affacturage et de titrisation
      { row: 20, comptes: ['477'], colN: 'E', colN1: 'F', type: 'passif' },  // Versements restant à effectuer sur titres de placement non libérés
      { row: 21, comptes: ['476'], colN: 'E', colN1: 'F', type: 'passif' },  // Compte transitoire ajustement spécial lié à la révision du SYSCOHADA (
      { row: 24, comptes: ['181'], colN: 'E', colN1: 'F', type: 'passif' },  // Comptes permanents non bloqués des établissements et des succursales
      { row: 25, comptes: ['185', '186', '187', '188'], colN: 'E', colN1: 'F', type: 'passif' },  // Comptes de liaison charges et produits
      { row: 26, comptes: ['183'], colN: 'E', colN1: 'F', type: 'passif' },  // Comptes de liaison des sociétés en participation
      { row: 29, comptes: ['499'], colN: 'E', colN1: 'F', type: 'passif' },  // Provisions pour risques et charges à court terme (voir note 28)
    ]},
    { sheet: 'NOTE 20', rows: [
      { row: 9, comptes: ['565'], colN: 'F', colN1: 'G', type: 'passif' },  // Escomptes de crédit de campagne
      { row: 10, comptes: ['566'], colN: 'F', colN1: 'G', type: 'passif' },  // Escomptes de crédit ordinaires
      { row: 12, comptes: ['521'], colN: 'F', colN1: 'G', type: 'passif' },  // Banques locales
      { row: 13, comptes: ['522'], colN: 'F', colN1: 'G', type: 'passif' },  // Banques autres états région
      { row: 14, comptes: ['523', '524'], colN: 'F', colN1: 'G', type: 'passif' },  // Autres Banques
      { row: 15, comptes: ['526'], colN: 'F', colN1: 'G', type: 'passif' },  // Banques intérêts courus
      { row: 16, comptes: ['561', '564'], colN: 'F', colN1: 'G', type: 'passif' },  // Crédit de trésorerie
    ]},
    { sheet: 'NOTE 21', rows: [
      { row: 9, comptes: ['7011'], colN: 'F', colN1: 'G', type: 'credit' },  // Ventes de marchandises dans l’Etat partie
      { row: 10, comptes: ['7012'], colN: 'F', colN1: 'G', type: 'credit' },  // Ventes de marchandises dans les autres Etats parties de la Région (2)
      { row: 11, comptes: ['7013'], colN: 'F', colN1: 'G', type: 'credit' },  // Ventes de marchandises hors Région (2)
      { row: 12, comptes: ['7016'], colN: 'F', colN1: 'G', type: 'credit' },  // Ventes de marchandises groupe
      { row: 13, comptes: ['7018'], colN: 'F', colN1: 'G', type: 'credit' },  // Ventes de marchandises sur internet
      { row: 15, comptes: ['7021'], colN: 'F', colN1: 'G', type: 'credit' },  // Ventes de produits fabriqués dans l’Etat partie
      { row: 16, comptes: ['7022'], colN: 'F', colN1: 'G', type: 'credit' },  // Ventes de produits fabriqués dans les autres Etats parties de la Régio
      { row: 17, comptes: ['7023'], colN: 'F', colN1: 'G', type: 'credit' },  // Ventes de produits fabriqués hors Région (2)
      { row: 18, comptes: ['7026'], colN: 'F', colN1: 'G', type: 'credit' },  // Ventes de produits fabriqués groupe
      { row: 19, comptes: ['7028'], colN: 'F', colN1: 'G', type: 'credit' },  // Ventes de produits fabriqués sur internet
      { row: 21, comptes: ['7031', '7041', '7051', '7061'], colN: 'F', colN1: 'G', type: 'credit' },  // Ventes  de travaux et services dans l’Etat partie
      { row: 22, comptes: ['7032', '7042', '7052', '7062'], colN: 'F', colN1: 'G', type: 'credit' },  // Ventes  de travaux et services dans les autres Etats parties de la Rég
      { row: 23, comptes: ['7033', '7043', '7053', '7063'], colN: 'F', colN1: 'G', type: 'credit' },  // Ventes de travaux et services hors Région (2)
      { row: 24, comptes: ['7036', '7046', '7056', '7066'], colN: 'F', colN1: 'G', type: 'credit' },  // Ventes de travaux et services  groupe
      { row: 25, comptes: ['7038', '7048', '7058', '7068'], colN: 'F', colN1: 'G', type: 'credit' },  // Ventes de travaux et services  sur internet
      { row: 27, comptes: ['707'], colN: 'F', colN1: 'G', type: 'credit' },  // Produits accessoires à détailler par nature d’activité économique (don
      { row: 37, comptes: ['72'], colN: 'F', colN1: 'G', type: 'credit' },  // Production immobilisée
      { row: 38, comptes: ['71'], colN: 'F', colN1: 'G', type: 'credit' },  // Subventions d’exploitation
      { row: 39, comptes: ['75'], colN: 'F', colN1: 'G', type: 'credit' },  // Autres produits (1)
    ]},
    { sheet: 'NOTE 22', rows: [
      { row: 9, comptes: ['601'], colN: 'F', colN1: 'G', type: 'debit' },  // Achats de marchandises dans l’Etat partie
      { row: 14, comptes: ['602'], colN: 'F', colN1: 'G', type: 'debit' },  // Achats de matières premières et fournitures liées dans l’Etat partie
      { row: 19, comptes: ['6041'], colN: 'F', colN1: 'G', type: 'debit' },  // Matières consommables
      { row: 20, comptes: ['6042'], colN: 'F', colN1: 'G', type: 'debit' },  // Matières combustibles
      { row: 21, comptes: ['6043'], colN: 'F', colN1: 'G', type: 'debit' },  // Produits d’entretien
      { row: 22, comptes: ['6044', '6046'], colN: 'F', colN1: 'G', type: 'debit' },  // Fournitures d’atelier, d’usine et de magasin
      { row: 23, comptes: ['6051'], colN: 'F', colN1: 'G', type: 'debit' },  // Eau
      { row: 24, comptes: ['6052'], colN: 'F', colN1: 'G', type: 'debit' },  // Electricité
      { row: 25, comptes: ['6053'], colN: 'F', colN1: 'G', type: 'debit' },  // Autres énergies
      { row: 26, comptes: ['6054'], colN: 'F', colN1: 'G', type: 'debit' },  // Fourniture d’entretien
      { row: 27, comptes: ['6047', '6055'], colN: 'F', colN1: 'G', type: 'debit' },  // Fourniture de bureau
      { row: 28, comptes: ['6056'], colN: 'F', colN1: 'G', type: 'debit' },  // Petit matériel et outillages
      { row: 29, comptes: ['6057', '6058'], colN: 'F', colN1: 'G', type: 'debit' },  // Achats études, prestations de services, de travaux matériels et équipe
      { row: 30, comptes: ['608'], colN: 'F', colN1: 'G', type: 'debit' },  // Achats d’emballages
      { row: 31, comptes: ['6011', '6021'], colN: 'F', colN1: 'G', type: 'debit' },  // Frais sur achats (1)
      { row: 32, comptes: ['6019', '6029', '6049', '6059', '6089'], colN: 'F', colN1: 'G', type: 'credit' },  // Remises rabais, remises et ristournes (non ventilés)
    ]},
    { sheet: 'NOTE 23', rows: [
      { row: 9, comptes: ['611', '612'], colN: 'F', colN1: 'G', type: 'debit' },  // Transports sur ventes
      { row: 10, comptes: ['613'], colN: 'F', colN1: 'G', type: 'debit' },  // Transports pour le compte de tiers
      { row: 11, comptes: ['614'], colN: 'F', colN1: 'G', type: 'debit' },  // Transport du personnel
      { row: 12, comptes: ['615'], colN: 'F', colN1: 'G', type: 'debit' },  // Transports de plis
      { row: 13, comptes: ['618'], colN: 'F', colN1: 'G', type: 'debit' },  // Voyage deplacement (transport)
      { row: 14, comptes: ['617'], colN: 'F', colN1: 'G', type: 'debit' },  // Transport entre etablissements ou chantiers
      { row: 15, comptes: ['616'], colN: 'F', colN1: 'G', type: 'debit' },  // Transports administratifs
    ]},
    { sheet: 'NOTE 24', rows: [
      { row: 9, comptes: ['621'], colN: 'F', colN1: 'G', type: 'debit' },  // Sous-traitance générale
      { row: 10, comptes: ['622'], colN: 'F', colN1: 'G', type: 'debit' },  // Locations et charges locatives
      { row: 11, comptes: ['623'], colN: 'F', colN1: 'G', type: 'debit' },  // Redevances de location acquisition
      { row: 12, comptes: ['624'], colN: 'F', colN1: 'G', type: 'debit' },  // Entretien, réparations et maintenance
      { row: 13, comptes: ['625'], colN: 'F', colN1: 'G', type: 'debit' },  // Primes d’assurance
      { row: 14, comptes: ['626'], colN: 'F', colN1: 'G', type: 'debit' },  // Etudes, recherches et documentation
      { row: 15, comptes: ['627'], colN: 'F', colN1: 'G', type: 'debit' },  // Publicité, publications, relations publiques
      { row: 16, comptes: ['628'], colN: 'F', colN1: 'G', type: 'debit' },  // Frais de télécommunications
      { row: 17, comptes: ['631'], colN: 'F', colN1: 'G', type: 'debit' },  // Frais bancaires
      { row: 18, comptes: ['632'], colN: 'F', colN1: 'G', type: 'debit' },  // Rémunérations d’intermédiaires et de conseils
      { row: 19, comptes: ['633'], colN: 'F', colN1: 'G', type: 'debit' },  // Frais de formation du personnel
      { row: 20, comptes: ['634'], colN: 'F', colN1: 'G', type: 'debit' },  // Redevances pour brevets, licences, logiciels, concession et droits sim
      { row: 21, comptes: ['635'], colN: 'F', colN1: 'G', type: 'debit' },  // Cotisations
      { row: 22, comptes: ['637'], colN: 'F', colN1: 'G', type: 'debit' },  // Rémunérations de personnel extérieur à l’entité
      { row: 23, comptes: ['638', '636'], colN: 'F', colN1: 'G', type: 'debit' },  // Autres charges externes
    ]},
    { sheet: 'NOTE 25', rows: [
      { row: 9, comptes: ['641'], colN: 'F', colN1: 'G', type: 'debit' },  // Impôts et taxes directs
      { row: 10, comptes: ['645'], colN: 'F', colN1: 'G', type: 'debit' },  // Impôts et taxes indirects
      { row: 11, comptes: ['646'], colN: 'F', colN1: 'G', type: 'debit' },  // Droits d’enregistrement
      { row: 12, comptes: ['647'], colN: 'F', colN1: 'G', type: 'debit' },  // Pénalités et amendes fiscales
      { row: 13, comptes: ['648'], colN: 'F', colN1: 'G', type: 'debit' },  // Autres impôts et taxes
    ]},
    { sheet: 'NOTE 26', rows: [
      { row: 9, comptes: ['6511', '6512', '6513', '6514'], colN: 'F', colN1: 'G', type: 'debit' },  // Pertes sur créances clients
      { row: 10, comptes: ['6515', '6516', '6517', '6518'], colN: 'F', colN1: 'G', type: 'debit' },  // Pertes sur autres débiteurs
      { row: 11, comptes: ['655'], colN: 'F', colN1: 'G', type: 'debit' },  // Quote-part de résultat sur opérations faites en commun
      { row: 12, comptes: ['654'], colN: 'F', colN1: 'G', type: 'debit' },  // Valeur comptable des cessions courantes d’immobilisations
      { row: 13, comptes: ['656'], colN: 'F', colN1: 'G', type: 'debit' },  // Perte de change sur créances et dettes commerciales
      { row: 14, comptes: ['6581', '6582'], colN: 'F', colN1: 'G', type: 'debit' },  // Pénalités et amendes pénales
      { row: 15, comptes: ['6583'], colN: 'F', colN1: 'G', type: 'debit' },  // Indemnités de fonction et autres rémunérations d’administrateurs
      { row: 16, comptes: ['6586'], colN: 'F', colN1: 'G', type: 'debit' },  // Dons et mécénat
      { row: 17, comptes: ['6584', '6585', '6588', '652', '653', '657'], colN: 'F', colN1: 'G', type: 'debit' },  // Autres charges diverses
      { row: 18, comptes: ['659'], colN: 'F', colN1: 'G', type: 'debit' },  // Charges pour dépréciations et provisions pour risques à court terme d’
    ]},
    { sheet: 'NOTE 27A', rows: [
      { row: 9, comptes: ['661'], colN: 'F', colN1: 'G', type: 'debit' },  // Rémunérations directes versées au personnel national
      { row: 10, comptes: ['662'], colN: 'F', colN1: 'G', type: 'debit' },  // Rémunérations directes versées au personnel non national
      { row: 11, comptes: ['663'], colN: 'F', colN1: 'G', type: 'debit' },  // Indemnités forfaitaires versées au personnel
      { row: 12, comptes: ['664'], colN: 'F', colN1: 'G', type: 'debit' },  // Charges sociales (personnel national)
      { row: 13, comptes: ['665'], colN: 'F', colN1: 'G', type: 'debit' },  // Charges sociales (personnel non national)
      { row: 14, comptes: ['666'], colN: 'F', colN1: 'G', type: 'debit' },  // Rémunérations et charges sociales de l’exploitant individuel
      { row: 15, comptes: ['667'], colN: 'F', colN1: 'G', type: 'debit' },  // Rémunération transférée de personnel extérieur
      { row: 16, comptes: ['668'], colN: 'F', colN1: 'G', type: 'debit' },  // Autres charges sociales
    ]},
    { sheet: 'NOTE 29', rows: [
      { row: 9, comptes: ['671'], colN: 'F', colN1: 'G', type: 'debit' },  // Intérêts des emprunts
      { row: 10, comptes: ['672'], colN: 'F', colN1: 'G', type: 'debit' },  // Intérêts dans loyers de locations acquisition
      { row: 11, comptes: ['673'], colN: 'F', colN1: 'G', type: 'debit' },  // Escomptes accordés
      { row: 12, comptes: ['674'], colN: 'F', colN1: 'G', type: 'debit' },  // Autres intérêts
      { row: 13, comptes: ['675'], colN: 'F', colN1: 'G', type: 'debit' },  // Escomptes des effets de commerce
      { row: 14, comptes: ['676'], colN: 'F', colN1: 'G', type: 'debit' },  // Pertes de change financières
      { row: 15, comptes: ['677'], colN: 'F', colN1: 'G', type: 'debit' },  // Pertes sur cessions de titres de placement
      { row: 16, comptes: ['678'], colN: 'F', colN1: 'G', type: 'debit' },  // Malis provenant d’attribution gratuite d’actions au personnel salarié 
      { row: 17, comptes: ['679'], colN: 'F', colN1: 'G', type: 'debit' },  // Pertes et charges sur risques financiers
      { row: 18, comptes: ['6597', '6798'], colN: 'F', colN1: 'G', type: 'debit' },  // Charges pour dépréciation et provisions à court terme à caractère fina
      { row: 20, comptes: ['771'], colN: 'F', colN1: 'G', type: 'credit' },  // Intérêts de prêts et créances diverses
      { row: 21, comptes: ['772'], colN: 'F', colN1: 'G', type: 'credit' },  // Revenus de participations et autres titres immobilisés
      { row: 22, comptes: ['773'], colN: 'F', colN1: 'G', type: 'credit' },  // Escomptes obtenus
      { row: 23, comptes: ['774'], colN: 'F', colN1: 'G', type: 'credit' },  // Revenus de placement
      { row: 24, comptes: ['775'], colN: 'F', colN1: 'G', type: 'credit' },  // Intérêts dans loyers de location-financement
      { row: 25, comptes: ['776'], colN: 'F', colN1: 'G', type: 'credit' },  // Gains de change financiers
      { row: 26, comptes: ['777'], colN: 'F', colN1: 'G', type: 'credit' },  // Gains sur cessions de titres de placement
      { row: 27, comptes: ['779'], colN: 'F', colN1: 'G', type: 'credit' },  // Gains sur risques financiers
      { row: 28, comptes: ['7597', '7798'], colN: 'F', colN1: 'G', type: 'credit' },  // Reprises de charges pour dépréciation et provisions à court terme à ca
    ]},
    { sheet: 'NOTE 30', rows: [
      { row: 9, comptes: ['831'], colN: 'F', colN1: 'G', type: 'debit' },  // Charges HAO constatées (compte 831) à détailler :
      { row: 16, comptes: ['832'], colN: 'F', colN1: 'G', type: 'debit' },  // Charges liées aux opéations de restructuration
      { row: 17, comptes: ['834'], colN: 'F', colN1: 'G', type: 'debit' },  // Pertes sur créances HAO
      { row: 18, comptes: ['836'], colN: 'F', colN1: 'G', type: 'debit' },  // Dons et libéralités accordés
      { row: 19, comptes: ['835'], colN: 'F', colN1: 'G', type: 'debit' },  // Abandons de créances consentis
      { row: 20, comptes: ['839', '859'], colN: 'F', colN1: 'G', type: 'debit' },  // Charges pour dépréciations et provisions pour risques à court terme HA
      { row: 21, comptes: ['851', '852', '853', '854', '858'], colN: 'F', colN1: 'G', type: 'debit' },  // Dotations hors activités ordinaires
      { row: 22, comptes: ['87'], colN: 'F', colN1: 'G', type: 'debit' },  // Participation des travailleurs
      { row: 24, comptes: ['841'], colN: 'F', colN1: 'G', type: 'credit' },  // Produits HAO constatés (compte 841) à détailler :
      { row: 31, comptes: ['842'], colN: 'F', colN1: 'G', type: 'credit' },  // Produits liés aux opérations de restructuration
      { row: 32, comptes: ['843', '844'], colN: 'F', colN1: 'G', type: 'credit' },  // Indemnités et subventions HAO (entité agricole)
      { row: 33, comptes: ['845'], colN: 'F', colN1: 'G', type: 'credit' },  // Dons et libéralités obtenus
      { row: 34, comptes: ['846'], colN: 'F', colN1: 'G', type: 'credit' },  // Abandons de créances obtenus
      { row: 35, comptes: ['848'], colN: 'F', colN1: 'G', type: 'credit' },  // Transfert de charges H.A.O
      { row: 36, comptes: ['849', '869'], colN: 'F', colN1: 'G', type: 'credit' },  // Reprises de charges pour dépréciations et provisions pour risques à co
      { row: 37, comptes: ['861', '862', '863', '864', '865', '868'], colN: 'F', colN1: 'G', type: 'credit' },  // Reprises des charges, provisions et dépréciations H.A.O
      { row: 38, comptes: ['88'], colN: 'F', colN1: 'G', type: 'credit' },  // Subventions d’équilibre
    ]},
    // NOTE 32 : non injecte (NOTE 32 : PRODUCTION DE L’EXERCICE)
    // NOTE 33 : non injecte (NOTE 33 : ACHATS DESTINES A LA PRODUCTION)
    { sheet: 'NOTE 31', rows: [
      { row: 11, comptes: ['101', '102', '103'], colN: 'G', colN1: 'H', type: 'passif' },  // Capital social
      { row: 18, comptes: ['70'], colN: 'G', colN1: 'H', type: 'credit' },  // Chiffre d’affaires hors taxes
      { row: 21, comptes: ['89'], colN: 'G', colN1: 'H', type: 'debit' },  // Impôt sur le résultat
      { row: 29, comptes: ['661', '662', '663'], colN: 'G', colN1: 'H', type: 'debit' },  // Masse salariale distribuée au cours de l’exercice (7) = 661+662+663
      { row: 30, comptes: ['664', '668'], colN: 'G', colN1: 'H', type: 'debit' },  // Avantages sociaux versés au cours de l’exercice (8) = 664+668
      { row: 31, comptes: ['667'], colN: 'G', colN1: 'H', type: 'debit' },  // Personnel extérieur facturé à l’entité (9) = 667
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

  // 3k. Movement table injection — NOTE 3C BIS (dépréciations) and NOTE 28 (provisions)
  const movementMappings: { sheet: string; entries: { row: number; cells: Record<string, string> }[] }[] = [
    // NOTE 3C BIS: Dépréciations movement (onglet 20) — cols D(ouv), F(dot), H(reprises)
    { sheet: 'NOTE 3C BIS', entries: [
      { row: 11, cells: { D: 'N3CB_11_D.val', F: 'N3CB_11_F.val', H: 'N3CB_11_H.val' } },
      { row: 12, cells: { D: 'N3CB_12_D.val', F: 'N3CB_12_F.val', H: 'N3CB_12_H.val' } },
      { row: 13, cells: { D: 'N3CB_13_D.val', F: 'N3CB_13_F.val', H: 'N3CB_13_H.val' } },
      { row: 14, cells: { D: 'N3CB_14_D.val', F: 'N3CB_14_F.val', H: 'N3CB_14_H.val' } },
      { row: 16, cells: { D: 'N3CB_16_D.val', F: 'N3CB_16_F.val', H: 'N3CB_16_H.val' } },
      { row: 18, cells: { D: 'N3CB_18_D.val', F: 'N3CB_18_F.val', H: 'N3CB_18_H.val' } },
      { row: 20, cells: { D: 'N3CB_20_D.val', F: 'N3CB_20_F.val', H: 'N3CB_20_H.val' } },
      { row: 21, cells: { D: 'N3CB_21_D.val', F: 'N3CB_21_F.val', H: 'N3CB_21_H.val' } },
      { row: 22, cells: { D: 'N3CB_22_D.val', F: 'N3CB_22_F.val', H: 'N3CB_22_H.val' } },
    ]},
    // NOTE 28: Provisions movement (onglet 55) — cols E(ouv), F(dot expl), G(dot fin), I(rep expl), J(rep fin)
    { sheet: 'NOTE 28', entries: [
      { row: 12, cells: { E: 'N28_E12.val', G: 'N28_G12.val', J: 'N28_J12.val' } },  // Provisions financières
      { row: 13, cells: { E: 'N28_E13.val', F: 'N28_F13.val', I: 'N28_I13.val' } },  // Dépréc immobilisations
      { row: 15, cells: { E: 'N28_E15.val', F: 'N28_F15.val', I: 'N28_I15.val' } },  // Dépréc stocks
      { row: 17, cells: { E: 'N28_E17.val', F: 'N28_F17.val', I: 'N28_I17.val' } },  // Dépréc clients
    ]},
  ]
  let movementCount = 0
  for (const mvt of movementMappings) {
    const ws = wb.Sheets[mvt.sheet]
    if (!ws) continue
    for (const entry of mvt.entries) {
      for (const [col, valKey] of Object.entries(entry.cells)) {
        const cellRef = `${col}${entry.row}`
        if (ws[cellRef]?.f) continue  // Don't overwrite formulas
        const val = vals[valKey]
        if (val === undefined || val === null) continue
        ws[cellRef] = { t: 'n', v: Number(val), z: '#,##0' }
        const cr = XLSX.utils.decode_cell(cellRef)
        const rng = XLSX.utils.decode_range(ws['!ref'] || 'A1')
        if (cr.r > rng.e.r) rng.e.r = cr.r
        if (cr.c > rng.e.c) rng.e.c = cr.c
        ws['!ref'] = XLSX.utils.encode_range(rng)
        movementCount++
      }
    }
  }

  logger.debug(`[Mode B] ${headerCount} en-têtes, ${noteDetailCount} notes détaillées, ${movementCount} mouvements injectés`)

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
  logger.debug(`[Mode B] ${injected} cellules injectées, ${skipped} formules conservées, ${errors} erreurs`)

  if (errors > 0) {
    logger.error('[Mode B] Erreurs:', log.filter(l => l.status === 'error'))
  }

  // 5b. VÉRIFICATION "EXPORT CALCULÉ" — relit le classeur généré (wb) et confirme
  // qu'il porte bien des données chiffrées, pas un modèle vide.
  //  - compte les cellules VALEUR (détail injecté) et FORMULE (totaux) des feuilles
  //    financières clés ;
  //  - recontrôle l'équilibre du bilan (BZ = DZ) sur les valeurs calculées ;
  //  - BLOQUE l'export s'il n'est pas calculé (aucune valeur) → jamais de fichier vide.
  const FIN_SHEETS = ['BILAN', 'ACTIF', 'PASSIF', 'RESULTAT', 'TFT']
  let nbValeurs = 0
  let nbFormules = 0
  for (const sh of FIN_SHEETS) {
    const ws = wb.Sheets[sh]
    if (!ws) continue
    for (const k of Object.keys(ws)) {
      if (k[0] === '!') continue
      const cell = ws[k] as { v?: unknown; f?: unknown }
      if (cell?.f) nbFormules++
      else if (typeof cell?.v === 'number' && cell.v !== 0) nbValeurs++
    }
  }
  const bzNet = (Number(vals['BZ.brut']) || 0) - (Number(vals['BZ.amort']) || 0)
  const dzNet = Number(vals['DZ.netN']) || 0
  const xiNet = Number(vals['XI.netN']) || 0
  const ecartBilan = Math.round(bzNet - dzNet)

  // Détection "export non calculé" : on s'appuie sur les TOTAUX CALCULÉS (vals),
  // pas sur le comptage de cellules (le modèle garde des valeurs résiduelles non
  // écrasées). Un bilan dont l'actif ET le passif calculés sont ~0 = rien de calculé.
  if (injected === 0 || (Math.abs(bzNet) < 1 && Math.abs(dzNet) < 1)) {
    throw new Error(
      "Export non calculé : le bilan calculé est vide (balance non chargée, vide, ou "
      + "mapping rompu). Le fichier n'a pas été généré.",
    )
  }
  logger.debug(
    `[Mode B] Export CALCULÉ ✓ — ${nbValeurs} valeurs + ${nbFormules} formules (états financiers) | `
    + `Bilan: BZ=${Math.round(bzNet).toLocaleString('fr-FR')} DZ=${Math.round(dzNet).toLocaleString('fr-FR')} `
    + `écart=${ecartBilan} | Résultat XI=${Math.round(xiNet).toLocaleString('fr-FR')}`,
  )
  if (Math.abs(ecartBilan) > 1) {
    logger.warn(`[Mode B] ⚠️ Bilan exporté NON équilibré (BZ−DZ=${ecartBilan}) — vérifier le mapping/la balance.`)
  }

  // 6. Write the filled file
  const denom = (entreprise.denomination || 'Entreprise').replace(/[/\\?%*:|"<>]/g, '_').substring(0, 30)
  const dateClos = entreprise.exercice_clos || new Date().toLocaleDateString('fr-FR')
  const filename = `Liasse_${denom}_${dateClos}.xlsx`
  XLSX.writeFile(wb, filename)
}
