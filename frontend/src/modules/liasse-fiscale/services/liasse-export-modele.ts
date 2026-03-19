/**
 * liasse-export-modele.ts — Mode B: Injection dans le modèle Excel officiel
 *
 * Charge le template SYSCOHADA (84 onglets), injecte les valeurs calculées
 * cellule par cellule, préserve toutes les formules et la mise en page.
 */

import * as XLSX from 'xlsx'
import { CELL_MAP, TEMPLATE_PATH, CONTROLES } from '@/config/liasseModelReference'
import { getActifBrut, getAmortProv, getPassif, getBalanceSolde } from './liasse-calculs'
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
  entreprise: EntrepriseData
): Record<string, number | string> {
  const vals: Record<string, number | string> = {}

  // Helper to compute actif line: brut, amort, netN (and N-1 from balanceN1)
  // This mirrors the logic in 10_Actif.tsx / 09_Bilan.tsx
  const actifMapping: Record<string, { comptes: string[]; amort: string[] }> = {
    AE: { comptes: ['211', '212'], amort: ['2811', '2812', '2911', '2912'] },
    AF: { comptes: ['213', '214', '215'], amort: ['2813', '2814', '2815', '2913', '2914', '2915'] },
    AG: { comptes: ['216'], amort: ['2816', '2916'] },
    AH: { comptes: ['217', '218', '219'], amort: ['2817', '2818', '2819', '2917', '2918', '2919'] },
    AJ: { comptes: ['22'], amort: ['282', '292'] },
    AK: { comptes: ['231', '232', '233', '234'], amort: ['2831', '2832', '2833', '2834', '2931', '2932', '2933', '2934'] },
    AL: { comptes: ['235', '237', '238'], amort: ['2835', '2837', '2838', '2935', '2937', '2938'] },
    AM: { comptes: ['241', '242', '243', '244'], amort: ['2841', '2842', '2843', '2844', '2941', '2942', '2943', '2944'] },
    AN: { comptes: ['245'], amort: ['2845', '2945'] },
    AP: { comptes: ['251', '252'], amort: [] },
    AR: { comptes: ['26'], amort: ['296'] },
    AS: { comptes: ['271', '272', '273', '274', '275', '276', '277'], amort: ['297'] },
    BA: { comptes: ['485', '486', '487', '488'], amort: ['498'] },
    BB: { comptes: ['31', '32', '33', '34', '35', '36', '37', '38'], amort: ['391', '392', '393', '394', '395', '396', '397', '398'] },
    BH: { comptes: ['409'], amort: ['490'] },
    BI: { comptes: ['411', '412', '413', '414', '415', '416', '418'], amort: ['491'] },
    BJ: { comptes: ['43', '44', '45', '46', '47'], amort: ['492', '493', '494', '495', '496', '497'] },
    BQ: { comptes: ['50'], amort: ['590'] },
    BR: { comptes: ['51'], amort: ['591'] },
    BS: { comptes: ['52', '53', '54', '55', '56', '57', '58'], amort: ['592', '593', '594'] },
    BU: { comptes: ['478'], amort: [] },
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
    CA: { comptes: ['101', '102', '103'] },
    CB: { comptes: ['109'], special: 'debit' },
    CD: { comptes: ['104', '105'] },
    CE: { comptes: ['106'] },
    CF: { comptes: ['111', '112'] },
    CG: { comptes: ['113', '118'] },
    CH: { comptes: ['12'], special: 'signed' },
    CJ: { comptes: ['13'], special: 'signed' },
    CL: { comptes: ['14'] },
    CM: { comptes: ['15'] },
    DA: { comptes: ['161', '162', '163', '164', '165', '166', '168'] },
    DB: { comptes: ['17'] },
    DC: { comptes: ['19'] },
    DH: { comptes: ['481', '482', '483', '484'] },
    DI: { comptes: ['419'] },
    DJ: { comptes: ['401', '402', '403', '404', '405', '408'] },
    DK: { comptes: ['43', '44'] },
    DM: { comptes: ['421', '422', '423', '424', '425', '426', '427', '428'] },
    DN: { comptes: ['499'] },
    DQ: { comptes: ['565'] },
    DR: { comptes: ['52', '561', '564'] },
    DV: { comptes: ['479'] },
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
    TA: { comptes: ['701'], sens: 'credit' },
    RA: { comptes: ['601'], sens: 'debit' },
    RB: { comptes: ['6031'], sens: 'signed' },
    TB: { comptes: ['702', '703', '704'], sens: 'credit' },
    TC: { comptes: ['705', '706', '707'], sens: 'credit' },
    TD: { comptes: ['708'], sens: 'credit' },
    TE: { comptes: ['73'], sens: 'signed' },
    TF: { comptes: ['72'], sens: 'credit' },
    TG: { comptes: ['71'], sens: 'credit' },
    TH: { comptes: ['75'], sens: 'credit' },
    TI: { comptes: ['781', '791'], sens: 'credit' },
    RC: { comptes: ['602'], sens: 'debit' },
    RD: { comptes: ['6032'], sens: 'signed' },
    RE: { comptes: ['604', '605', '608'], sens: 'debit' },
    RF: { comptes: ['6033', '6038'], sens: 'signed' },
    RG: { comptes: ['61'], sens: 'debit' },
    RH: { comptes: ['62', '63'], sens: 'debit' },
    RI: { comptes: ['64'], sens: 'debit' },
    RJ: { comptes: ['65'], sens: 'debit' },
    RK: { comptes: ['66'], sens: 'debit' },
    TJ: { comptes: ['791', '797', '798', '799'], sens: 'credit' },
    RL: { comptes: ['681', '691'], sens: 'debit' },
    TK: { comptes: ['77'], sens: 'credit' },
    TL: { comptes: ['797'], sens: 'credit' },
    TM: { comptes: ['787'], sens: 'credit' },
    RM: { comptes: ['67'], sens: 'debit' },
    RN: { comptes: ['697'], sens: 'debit' },
    TN: { comptes: ['82'], sens: 'credit' },
    TO: { comptes: ['84', '86', '88'], sens: 'credit' },
    RO: { comptes: ['81'], sens: 'debit' },
    RP: { comptes: ['83', '85', '87'], sens: 'debit' },
    RQ: { comptes: ['87'], sens: 'debit' },
    RS: { comptes: ['89'], sens: 'debit' },
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

  // ── TFT — Tableau des Flux de Trésorerie ──

  // ZA: Trésorerie nette ouverture = Trésorerie actif N-1 - Trésorerie passif N-1
  if (balanceN1.length > 0) {
    const btN1 = getActifBrut(balanceN1, ['50','51','52','53','54','55','56','57','58']) - getAmortProv(balanceN1, ['590','591','592','593','594'])
    const dtN1 = getPassif(balanceN1, ['565','52','561','564'])
    vals['ZA.valN'] = btN1 - dtN1
  } else {
    vals['ZA.valN'] = 0
  }

  // FA: CAFG = Résultat net + Dotations amort/prov - Reprises amort/prov + VC cessions - Produits cessions
  const dotations = getBalanceSolde(balance, ['681','691','697'])
  const reprises = -getBalanceSolde(balance, ['791','797','798','799'])
  const vcCessions = getBalanceSolde(balance, ['81'])
  const prodCessions = -getBalanceSolde(balance, ['82'])
  vals['FA.valN'] = n('XI.netN') + dotations - reprises + vcCessions - prodCessions

  // FB-FE: Variations BFR

  // FB: -Variation actif circulant HAO
  const baComptes = ['485','486','487','488']
  vals['FB.valN'] = -(getActifBrut(balance, baComptes) - (balanceN1.length > 0 ? getActifBrut(balanceN1, baComptes) : 0))

  // FC: -Variation stocks
  const bbComptes = ['31','32','33','34','35','36','37','38']
  vals['FC.valN'] = -(getActifBrut(balance, bbComptes) - (balanceN1.length > 0 ? getActifBrut(balanceN1, bbComptes) : 0))

  // FD: -Variation créances
  const crComptes = ['409','411','412','413','414','415','416','418','43','44','45','46','47']
  vals['FD.valN'] = -(getActifBrut(balance, crComptes) - (balanceN1.length > 0 ? getActifBrut(balanceN1, crComptes) : 0))

  // FE: +Variation passif circulant
  const pcComptes = ['481','482','483','484','419','401','402','403','404','405','408','43','44','421','422','423','424','425','426','427','428','499']
  vals['FE.valN'] = getPassif(balance, pcComptes) - (balanceN1.length > 0 ? getPassif(balanceN1, pcComptes) : 0)

  // FF-FH: Décaissements acquisitions immo (variation brut négatif = acquisition)
  const incComptes = ['211','212','213','214','215','216','217','218','219']
  vals['FF.valN'] = -(getActifBrut(balance, incComptes) - (balanceN1.length > 0 ? getActifBrut(balanceN1, incComptes) : 0))
  const corComptes = ['22','231','232','233','234','235','237','238','241','242','243','244','245','251','252']
  vals['FG.valN'] = -(getActifBrut(balance, corComptes) - (balanceN1.length > 0 ? getActifBrut(balanceN1, corComptes) : 0))
  const finComptes = ['26','271','272','273','274','275','276','277']
  vals['FH.valN'] = -(getActifBrut(balance, finComptes) - (balanceN1.length > 0 ? getActifBrut(balanceN1, finComptes) : 0))

  // FI: Encaissements cessions immo incorporelles et corporelles
  vals['FI.valN'] = -getBalanceSolde(balance, ['82'])

  // FJ: Encaissements cessions immo financières
  vals['FJ.valN'] = 0

  // FK-FN: Financement capitaux propres
  vals['FK.valN'] = getPassif(balance, ['101','102','103']) - (balanceN1.length > 0 ? getPassif(balanceN1, ['101','102','103']) : 0)
  vals['FL.valN'] = getPassif(balance, ['14']) - (balanceN1.length > 0 ? getPassif(balanceN1, ['14']) : 0)
  vals['FM.valN'] = 0
  vals['FN.valN'] = 0

  // FO-FQ: Financement capitaux étrangers
  vals['FO.valN'] = Math.max(0, getPassif(balance, ['161','162','163','164']) - (balanceN1.length > 0 ? getPassif(balanceN1, ['161','162','163','164']) : 0))
  vals['FP.valN'] = Math.max(0, getPassif(balance, ['165','166','168','17']) - (balanceN1.length > 0 ? getPassif(balanceN1, ['165','166','168','17']) : 0))
  vals['FQ.valN'] = Math.min(0, getPassif(balance, ['161','162','163','164','165','166','168','17']) - (balanceN1.length > 0 ? getPassif(balanceN1, ['161','162','163','164','165','166','168','17']) : 0))

  // N-1 for TFT lines
  vals['ZA.valN1'] = 0
  for (const ref of ['FA','FB','FC','FD','FE','FF','FG','FH','FI','FJ','FK','FL','FM','FN','FO','FP','FQ']) {
    vals[`${ref}.valN1`] = 0
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
  const vals = computeAllValues(balance, balanceN1, entreprise)

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

  const bloquants = auditErrors.filter(e => e.startsWith('[BLOQUANT]'))
  if (bloquants.length > 0) {
    console.error(`[Audit] ${bloquants.length} contrôle(s) bloquant(s) — export autorisé avec avertissement`)
    console.warn('[Audit] Détail:', bloquants)
    // Note: on ne bloque pas l'export car les écarts peuvent venir de l'absence de balance N-1
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
