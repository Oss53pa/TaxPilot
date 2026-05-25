import { SheetData, Row, emptyRow, rowAt, m, headerRows } from './helpers'
import type { EntrepriseData, ExerciceData, BalanceEntry } from './helpers'
import { getBalanceSolde, getCharges, getProduits, getPassif } from './helpers'
import { BILAN_PASSIF, COMPTE_RESULTAT_MAPPING } from '@/constants/syscohada-mappings'

// ────────────────────────────────────────────────────────────────────────────
// Account prefix mappings for PASSIF side
// SOURCE UNIQUE : importé depuis syscohada-mappings.ts
// ────────────────────────────────────────────────────────────────────────────

interface PassifLine {
  ref: string
  label: string
  note: string | number | null
  prefixes: readonly string[]
}

const PASSIF_LINES_CP: PassifLine[] = [
  { ref: 'CA', label: 'Capital', note: 13, prefixes: BILAN_PASSIF.CA.comptes },
  { ref: 'CB', label: 'Apporteurs capital non appelé (-)', note: 13, prefixes: BILAN_PASSIF.CB.comptes },
  { ref: 'CD', label: 'Primes liées au capital social', note: 14, prefixes: BILAN_PASSIF.CD.comptes },
  { ref: 'CE', label: 'Ecarts de réévaluation', note: '3e', prefixes: BILAN_PASSIF.CE.comptes },
  { ref: 'CF', label: 'Réserves indisponibles', note: 14, prefixes: BILAN_PASSIF.CF.comptes },
  { ref: 'CG', label: 'Réserves libres', note: 14, prefixes: BILAN_PASSIF.CG.comptes },
  { ref: 'CH', label: 'Report à nouveau (+ ou -)', note: 14, prefixes: BILAN_PASSIF.CH.comptes },
  { ref: 'CJ', label: 'Résultat net de l\'exercice (bénéfice + ou perte -)', note: 0, prefixes: BILAN_PASSIF.CJ.comptes },
  { ref: 'CL', label: 'Subventions d\'investissement', note: 15, prefixes: BILAN_PASSIF.CL.comptes },
  { ref: 'CM', label: 'Provisions réglementées', note: 15, prefixes: BILAN_PASSIF.CM.comptes },
]

const PASSIF_LINES_DF: PassifLine[] = [
  { ref: 'DA', label: 'Emprunts et dettes financières diverses', note: 16, prefixes: BILAN_PASSIF.DA.comptes },
  { ref: 'DB', label: 'Dettes de location-acquisition', note: 16, prefixes: BILAN_PASSIF.DB.comptes },
  { ref: 'DC', label: 'Provisions pour risques et charges', note: 16, prefixes: BILAN_PASSIF.DC.comptes },
]

const PASSIF_LINES_CIRC: PassifLine[] = [
  { ref: 'DH', label: 'Dettes circulantes HAO', note: 5, prefixes: BILAN_PASSIF.DH.comptes },
  { ref: 'DI', label: 'Clients, avances reçues', note: 7, prefixes: BILAN_PASSIF.DI.comptes },
  { ref: 'DJ', label: 'Fournisseurs d\'exploitation', note: 17, prefixes: BILAN_PASSIF.DJ.comptes },
  { ref: 'DK', label: 'Dettes fiscales et sociales', note: 18, prefixes: BILAN_PASSIF.DK.comptes },
  { ref: 'DM', label: 'Autres dettes', note: 19, prefixes: BILAN_PASSIF.DM.comptes },
  { ref: 'DN', label: 'Provisions pour risques et charges à court terme', note: 19, prefixes: BILAN_PASSIF.DN.comptes },
]

const PASSIF_LINES_TRESO: PassifLine[] = [
  { ref: 'DQ', label: 'Banques, crédits d\'escompte', note: 20, prefixes: BILAN_PASSIF.DQ.comptes },
  { ref: 'DR', label: 'Banques, établissements financiers et crédits de trésorerie', note: 20, prefixes: BILAN_PASSIF.DR.comptes },
]

// ────────────────────────────────────────────────────────────────────────────
// Computation helper
// ────────────────────────────────────────────────────────────────────────────

function computePassifVal(bal: BalanceEntry[], pfx: readonly string[]): number {
  return -getBalanceSolde(bal, pfx)
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 11: PASSIF (9 columns A=0 to I=8, ~39 rows)
// ────────────────────────────────────────────────────────────────────────────

function buildPassif(
  bal: BalanceEntry[],
  balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 9 // columns A(0) through I(8)
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // Capitaux propres : solde NET (un report à nouveau / résultat déficitaire
  // doit ressortir en négatif et réduire les capitaux propres).
  const pv = (pfx: readonly string[]) => computePassifVal(bal, pfx)
  const pvN1 = (pfx: readonly string[]) => computePassifVal(balN1, pfx)
  // Dettes (financières, circulantes, trésorerie-passif, écart de conversion) :
  // soldes CRÉDITEURS uniquement. Une dette à solde débiteur (ex. banque avec
  // avoir, fournisseur débiteur) appartient à l'ACTIF — la compter en négatif au
  // passif déséquilibrerait le bilan (BZ ≠ DZ).
  const pvc = (pfx: readonly string[]) => getPassif(bal, pfx)
  const pvcN1 = (pfx: readonly string[]) => getPassif(balN1, pfx)

  // ── Row 0: page number ──
  rows.push(rowAt(C, [0, '- 0 -']))
  merges.push(m(0, 0, 0, 8)) // A1:I1

  // ── Row 1: page label ──
  rows.push(rowAt(C, [7, 'BILAN SYSTEME NORMAL\nPAGE 2/2']))
  merges.push(m(1, 7, 1, 8)) // H2:I2

  // ── Rows 2-5: standard header ──
  const hdr = headerRows(ent, ex, C, {
    valueCol: 2,
    sigleCol: 7,
    sigleValCol: 8,
  })
  rows.push(...hdr)

  // ── Row 6: BILAN title ──
  rows.push(rowAt(C, [0, 'BILAN']))
  merges.push(m(6, 0, 6, 8)) // A7:I7

  // ── Row 7: column headers ──
  const r7 = emptyRow(C)
  r7[0] = 'REF'
  r7[1] = 'PASSIF'
  r7[6] = 'NOTE'
  r7[7] = `EXERCICE AU ${ex.dateFin ? new Date(ex.dateFin).getFullYear() : 'N'}`
  r7[8] = `EXERCICE AU ${ex.dateFin ? new Date(ex.dateFin).getFullYear() - 1 : 'N-1'}`
  rows.push(r7)

  // ── Row 8: empty sub-row ──
  rows.push(emptyRow(C))

  // ── Row 9: sub-headers ──
  const r9 = emptyRow(C)
  r9[7] = 'NET'
  r9[8] = 'NET'
  rows.push(r9)

  // Header area merges (rows 7-9 = indices 7,8,9)
  merges.push(m(7, 0, 9, 0))   // A8:A10  - REF spans 3 rows
  merges.push(m(7, 1, 9, 5))   // B8:F10  - PASSIF label spans 3 rows, 5 cols
  merges.push(m(7, 6, 9, 6))   // G8:G10  - NOTE spans 3 rows
  merges.push(m(7, 7, 8, 7))   // H8:H9   - EXERCICE N spans 2 rows
  merges.push(m(7, 8, 8, 8))   // I8:I9   - EXERCICE N-1 spans 2 rows

  // Helper to make a data row
  const makeRow = (
    ref: string, label: string, note: string | number | null,
    net: number | null, netN1: number | null,
  ): Row => {
    const row = emptyRow(C)
    row[0] = ref
    row[1] = label
    row[6] = note
    row[7] = net
    row[8] = netN1
    return row
  }

  // Helper to add merge for PASSIF label cell B:F
  const addLabelMerge = (rowIdx: number): void => {
    merges.push(m(rowIdx, 1, rowIdx, 5))
  }

  // ── Row 10-19: CAPITAUX PROPRES (CA through CM) ──
  let CP_net = 0, CP_netN1 = 0
  for (const line of PASSIF_LINES_CP) {
    const net = pv(line.prefixes)
    const n1 = pvN1(line.prefixes)
    CP_net += net
    CP_netN1 += n1
    rows.push(makeRow(line.ref, line.label, line.note, net, n1))
    addLabelMerge(rows.length - 1)
  }

  // ── Row 20: TOTAL CAPITAUX PROPRES (CP) ──
  rows.push(makeRow('CP', 'TOTAL CAPITAUX PROPRES ET RESSOURCES ASSIMILEES', 0, CP_net, CP_netN1))
  addLabelMerge(rows.length - 1)

  // ── Row 21-23: DETTES FINANCIERES (DA, DB, DC) ──
  let DD_net = 0, DD_netN1 = 0
  for (const line of PASSIF_LINES_DF) {
    const net = pvc(line.prefixes)
    const n1 = pvcN1(line.prefixes)
    DD_net += net
    DD_netN1 += n1
    rows.push(makeRow(line.ref, line.label, line.note, net, n1))
    addLabelMerge(rows.length - 1)
  }

  // ── Row 24: TOTAL DETTES FINANCIERES (DD) ──
  rows.push(makeRow('DD', 'TOTAL DETTES FINANCIERES ET RESSOURCES ASSIMILEES', null, DD_net, DD_netN1))
  addLabelMerge(rows.length - 1)

  // ── Row 25: TOTAL RESSOURCES STABLES (DF) ──
  const DF_net = CP_net + DD_net
  const DF_netN1 = CP_netN1 + DD_netN1
  rows.push(makeRow('DF', 'TOTAL RESSOURCES STABLES', null, DF_net, DF_netN1))
  addLabelMerge(rows.length - 1)

  // ── Row 26-31: PASSIF CIRCULANT (DH through DN) ──
  let DP_net = 0, DP_netN1 = 0
  for (const line of PASSIF_LINES_CIRC) {
    const net = pvc(line.prefixes)
    const n1 = pvcN1(line.prefixes)
    DP_net += net
    DP_netN1 += n1
    rows.push(makeRow(line.ref, line.label, line.note, net, n1))
    addLabelMerge(rows.length - 1)
  }

  // ── Row 32: TOTAL PASSIF CIRCULANT (DP) ──
  rows.push(makeRow('DP', 'TOTAL PASSIF CIRCULANT', null, DP_net, DP_netN1))
  addLabelMerge(rows.length - 1)

  // ── Row 33: empty row ──
  rows.push(emptyRow(C))

  // ── Row 34-35: TRESORERIE-PASSIF (DQ, DR) ──
  let DT_net = 0, DT_netN1 = 0
  for (const line of PASSIF_LINES_TRESO) {
    const net = pvc(line.prefixes)
    const n1 = pvcN1(line.prefixes)
    DT_net += net
    DT_netN1 += n1
    rows.push(makeRow(line.ref, line.label, line.note, net, n1))
    addLabelMerge(rows.length - 1)
  }

  // ── Row 36: TOTAL TRESORERIE-PASSIF (DT) ──
  rows.push(makeRow('DT', 'TOTAL TRESORERIE-PASSIF', null, DT_net, DT_netN1))
  addLabelMerge(rows.length - 1)

  // ── Row 37: ECART DE CONVERSION-PASSIF (DV) ──
  const DV_net = pvc(BILAN_PASSIF.DV.comptes)
  const DV_netN1 = pvcN1(BILAN_PASSIF.DV.comptes)
  rows.push(makeRow('DV', 'Ecart de conversion-Passif', 12, DV_net, DV_netN1))
  addLabelMerge(rows.length - 1)

  // ── Row 38: TOTAL GENERAL (DZ) ──
  const DZ_net = DF_net + DP_net + DT_net + DV_net
  const DZ_netN1 = DF_netN1 + DP_netN1 + DT_netN1 + DV_netN1
  rows.push(makeRow('DZ', 'TOTAL GENERAL', null, DZ_net, DZ_netN1))
  addLabelMerge(rows.length - 1)

  // Pad to 39 rows total
  while (rows.length < 39) rows.push(emptyRow(C))

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 12: COMPTE DE RESULTAT (10 columns A=0 to J=9, ~56 rows)
// ────────────────────────────────────────────────────────────────────────────

function buildResultat(
  bal: BalanceEntry[],
  balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 10 // columns A(0) through J(9)
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // Column indices
  const cRef = 0
  const cLabelStart = 1
  const cActivity = 5
  const cSign = 6
  const cNote = 7
  const cNetN = 8
  const cNetN1 = 9

  // ── Row 0: page number ──
  rows.push(rowAt(C, [0, '- 8 -']))
  merges.push(m(0, 0, 0, 9)) // A1:J1

  // ── Row 1: page label ──
  rows.push(rowAt(C, [7, 'COMPTE DE RESULTAT SYSTEME NORMAL\nPAGE 1/1']))
  merges.push(m(1, 7, 1, 9)) // H2:J2

  // ── Rows 2-5: standard header ──
  const hdr = headerRows(ent, ex, C, {
    valueCol: 2,
    sigleCol: 8,
    sigleValCol: 9,
  })
  rows.push(...hdr)

  // ── Row 6: COMPTE DE RESULTAT title ──
  rows.push(rowAt(C, [0, 'COMPTE DE RESULTAT']))
  merges.push(m(6, 0, 6, 9)) // A7:J7

  // ── Row 7: column headers ──
  const r7 = emptyRow(C)
  r7[cRef] = 'REF'
  r7[cLabelStart] = 'LIBELLES'
  r7[cActivity] = '(2)'
  r7[cSign] = ''
  r7[cNote] = 'NOTE'
  r7[cNetN] = `EXERCICE AU ${ex.dateFin ? new Date(ex.dateFin).getFullYear() : 'N'}`
  r7[cNetN1] = `EXERCICE AU ${ex.dateFin ? new Date(ex.dateFin).getFullYear() - 1 : 'N-1'}`
  rows.push(r7)

  // ── Row 8: empty sub-row ──
  rows.push(emptyRow(C))

  // ── Row 9: sub-headers ──
  const r9 = emptyRow(C)
  r9[cNetN] = 'NET (1)'
  r9[cNetN1] = 'NET (1)'
  rows.push(r9)

  // Header area merges (rows 7-9 = indices 7,8,9)
  merges.push(m(7, 0, 9, 0))   // A8:A10  - REF spans 3 rows
  merges.push(m(7, 1, 9, 4))   // B8:E10  - LIBELLES spans 3 rows, 4 cols
  merges.push(m(7, 5, 9, 5))   // F8:F10  - (2) spans 3 rows
  merges.push(m(7, 6, 9, 6))   // G8:G10  - sign spans 3 rows
  merges.push(m(7, 7, 9, 7))   // H8:H10  - NOTE spans 3 rows
  merges.push(m(7, 8, 8, 8))   // I8:I9   - EXERCICE N spans 2 rows
  merges.push(m(7, 9, 8, 9))   // J8:J9   - EXERCICE N-1 spans 2 rows

  // Helper to make a data row
  const makeDataRow = (
    ref: string, label: string, activity: string | null, sign: string | null,
    note: number | null, netN: number | null, netN1Val: number | null,
  ): Row => {
    const row = emptyRow(C)
    row[cRef] = ref
    row[cLabelStart] = label
    row[cActivity] = activity
    row[cSign] = sign
    row[cNote] = note
    row[cNetN] = netN
    row[cNetN1] = netN1Val
    return row
  }

  // Helper to add merge for LIBELLES label cell B:E
  const addLabelMerge = (rowIdx: number): void => {
    merges.push(m(rowIdx, 1, rowIdx, 4))
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DATA ROWS (starting at row index 10)
  // ═══════════════════════════════════════════════════════════════════════════

  // ── TA: Ventes de marchandises ──
  const TA_n = getProduits(bal, COMPTE_RESULTAT_MAPPING.TA.comptes)
  const TA_n1 = getProduits(balN1, COMPTE_RESULTAT_MAPPING.TA.comptes)
  rows.push(makeDataRow('TA', 'Ventes de marchandises', 'A', '+', 21, TA_n, TA_n1))
  addLabelMerge(rows.length - 1)

  // ── RA: Achats de marchandises ──
  const RA_n = -getCharges(bal, COMPTE_RESULTAT_MAPPING.RA.comptes)
  const RA_n1 = -getCharges(balN1, COMPTE_RESULTAT_MAPPING.RA.comptes)
  rows.push(makeDataRow('RA', 'Achats de marchandises', null, '-', 22, RA_n, RA_n1))
  addLabelMerge(rows.length - 1)

  // ── RB: Variation de stocks de marchandises ──
  const RB_n = -getBalanceSolde(bal, COMPTE_RESULTAT_MAPPING.RB.comptes)
  const RB_n1 = -getBalanceSolde(balN1, COMPTE_RESULTAT_MAPPING.RB.comptes)
  rows.push(makeDataRow('RB', 'Variation de stocks de marchandises', null, '-/+', 6, RB_n, RB_n1))
  addLabelMerge(rows.length - 1)

  // ── XA: MARGE COMMERCIALE ──
  const XA_n = TA_n + RA_n + RB_n
  const XA_n1 = TA_n1 + RA_n1 + RB_n1
  rows.push(makeDataRow('XA', 'MARGE COMMERCIALE (Somme TA à RB)', null, null, null, XA_n, XA_n1))
  addLabelMerge(rows.length - 1)

  // ── TB: Ventes de produits fabriqués ──
  const TB_n = getProduits(bal, COMPTE_RESULTAT_MAPPING.TB.comptes)
  const TB_n1 = getProduits(balN1, COMPTE_RESULTAT_MAPPING.TB.comptes)
  rows.push(makeDataRow('TB', 'Ventes de produits fabriqués', 'B', '+', 21, TB_n, TB_n1))
  addLabelMerge(rows.length - 1)

  // ── TC: Travaux, services vendus ──
  const TC_n = getProduits(bal, COMPTE_RESULTAT_MAPPING.TC.comptes)
  const TC_n1 = getProduits(balN1, COMPTE_RESULTAT_MAPPING.TC.comptes)
  rows.push(makeDataRow('TC', 'Travaux, services vendus', 'C', '+', 21, TC_n, TC_n1))
  addLabelMerge(rows.length - 1)

  // ── TD: Produits accessoires ──
  const TD_n = getProduits(bal, COMPTE_RESULTAT_MAPPING.TD.comptes)
  const TD_n1 = getProduits(balN1, COMPTE_RESULTAT_MAPPING.TD.comptes)
  rows.push(makeDataRow('TD', 'Produits accessoires', 'D', '+', 21, TD_n, TD_n1))
  addLabelMerge(rows.length - 1)

  // ── XB: CHIFFRE D'AFFAIRES ──
  const XB_n = TA_n + TB_n + TC_n + TD_n
  const XB_n1 = TA_n1 + TB_n1 + TC_n1 + TD_n1
  rows.push(makeDataRow('XB', 'CHIFFRE D\'AFFAIRES (A + B + C + D)', null, null, null, XB_n, XB_n1))
  addLabelMerge(rows.length - 1)

  // ── TE: Production stockée ──
  const TE_n = -getBalanceSolde(bal, COMPTE_RESULTAT_MAPPING.TE.comptes)
  const TE_n1 = -getBalanceSolde(balN1, COMPTE_RESULTAT_MAPPING.TE.comptes)
  rows.push(makeDataRow('TE', 'Production stockée (ou déstockage)', null, '-/+', 6, TE_n, TE_n1))
  addLabelMerge(rows.length - 1)

  // ── TF: Production immobilisée ──
  const TF_n = getProduits(bal, COMPTE_RESULTAT_MAPPING.TF.comptes)
  const TF_n1 = getProduits(balN1, COMPTE_RESULTAT_MAPPING.TF.comptes)
  rows.push(makeDataRow('TF', 'Production immobilisée', null, '+', null, TF_n, TF_n1))
  addLabelMerge(rows.length - 1)

  // ── TG: Subventions d'exploitation ──
  const TG_n = getProduits(bal, COMPTE_RESULTAT_MAPPING.TG.comptes)
  const TG_n1 = getProduits(balN1, COMPTE_RESULTAT_MAPPING.TG.comptes)
  rows.push(makeDataRow('TG', 'Subventions d\'exploitation', null, '+', 21, TG_n, TG_n1))
  addLabelMerge(rows.length - 1)

  // ── TH: Autres produits ──
  const TH_n = getProduits(bal, COMPTE_RESULTAT_MAPPING.TH.comptes)
  const TH_n1 = getProduits(balN1, COMPTE_RESULTAT_MAPPING.TH.comptes)
  rows.push(makeDataRow('TH', 'Autres produits', null, '+', 21, TH_n, TH_n1))
  addLabelMerge(rows.length - 1)

  // ── TI: Transferts de charges d'exploitation ──
  const TI_n = getProduits(bal, COMPTE_RESULTAT_MAPPING.TI.comptes)
  const TI_n1 = getProduits(balN1, COMPTE_RESULTAT_MAPPING.TI.comptes)
  rows.push(makeDataRow('TI', 'Transferts de charges d\'exploitation', null, '+', 12, TI_n, TI_n1))
  addLabelMerge(rows.length - 1)

  // ── RC: Achats de matières premières ──
  const RC_n = -getCharges(bal, COMPTE_RESULTAT_MAPPING.RC.comptes)
  const RC_n1 = -getCharges(balN1, COMPTE_RESULTAT_MAPPING.RC.comptes)
  rows.push(makeDataRow('RC', 'Achats de matières premières et fournitures liées', null, '-', 22, RC_n, RC_n1))
  addLabelMerge(rows.length - 1)

  // ── RD: Variation de stocks de matières premières ──
  const RD_n = -getBalanceSolde(bal, COMPTE_RESULTAT_MAPPING.RD.comptes)
  const RD_n1 = -getBalanceSolde(balN1, COMPTE_RESULTAT_MAPPING.RD.comptes)
  rows.push(makeDataRow('RD', 'Variation de stocks de matières premières et fournitures liées', null, '-/+', 6, RD_n, RD_n1))
  addLabelMerge(rows.length - 1)

  // ── RE: Autres achats ──
  const RE_n = -getCharges(bal, COMPTE_RESULTAT_MAPPING.RE.comptes)
  const RE_n1 = -getCharges(balN1, COMPTE_RESULTAT_MAPPING.RE.comptes)
  rows.push(makeDataRow('RE', 'Autres achats', null, '-', 22, RE_n, RE_n1))
  addLabelMerge(rows.length - 1)

  // ── RF: Variation de stocks d'autres approvisionnements ──
  const RF_n = -getBalanceSolde(bal, COMPTE_RESULTAT_MAPPING.RF.comptes)
  const RF_n1 = -getBalanceSolde(balN1, COMPTE_RESULTAT_MAPPING.RF.comptes)
  rows.push(makeDataRow('RF', 'Variation de stocks d\'autres approvisionnements', null, '-/+', 6, RF_n, RF_n1))
  addLabelMerge(rows.length - 1)

  // ── RG: Transports ──
  const RG_n = -getCharges(bal, COMPTE_RESULTAT_MAPPING.RG.comptes)
  const RG_n1 = -getCharges(balN1, COMPTE_RESULTAT_MAPPING.RG.comptes)
  rows.push(makeDataRow('RG', 'Transports', null, '-', 23, RG_n, RG_n1))
  addLabelMerge(rows.length - 1)

  // ── RH: Services extérieurs ──
  const RH_n = -getCharges(bal, COMPTE_RESULTAT_MAPPING.RH.comptes)
  const RH_n1 = -getCharges(balN1, COMPTE_RESULTAT_MAPPING.RH.comptes)
  rows.push(makeDataRow('RH', 'Services extérieurs', null, '-', 24, RH_n, RH_n1))
  addLabelMerge(rows.length - 1)

  // ── RI: Impôts et taxes ──
  const RI_n = -getCharges(bal, COMPTE_RESULTAT_MAPPING.RI.comptes)
  const RI_n1 = -getCharges(balN1, COMPTE_RESULTAT_MAPPING.RI.comptes)
  rows.push(makeDataRow('RI', 'Impôts et taxes', null, '-', 25, RI_n, RI_n1))
  addLabelMerge(rows.length - 1)

  // ── RJ: Autres charges ──
  const RJ_n = -getCharges(bal, COMPTE_RESULTAT_MAPPING.RJ.comptes)
  const RJ_n1 = -getCharges(balN1, COMPTE_RESULTAT_MAPPING.RJ.comptes)
  rows.push(makeDataRow('RJ', 'Autres charges', null, '-', 26, RJ_n, RJ_n1))
  addLabelMerge(rows.length - 1)

  // ── XC: VALEUR AJOUTEE ──
  const XC_n = XB_n + RA_n + RB_n + TE_n + TF_n + TG_n + TH_n + TI_n + RC_n + RD_n + RE_n + RF_n + RG_n + RH_n + RI_n + RJ_n
  const XC_n1 = XB_n1 + RA_n1 + RB_n1 + TE_n1 + TF_n1 + TG_n1 + TH_n1 + TI_n1 + RC_n1 + RD_n1 + RE_n1 + RF_n1 + RG_n1 + RH_n1 + RI_n1 + RJ_n1
  rows.push(makeDataRow('XC', 'VALEUR AJOUTEE', null, null, null, XC_n, XC_n1))
  addLabelMerge(rows.length - 1)

  // ── RK: Charges de personnel ──
  const RK_n = -getCharges(bal, COMPTE_RESULTAT_MAPPING.RK.comptes)
  const RK_n1 = -getCharges(balN1, COMPTE_RESULTAT_MAPPING.RK.comptes)
  rows.push(makeDataRow('RK', 'Charges de personnel', null, '-', 27, RK_n, RK_n1))
  addLabelMerge(rows.length - 1)

  // ── XD: EXCEDENT BRUT D'EXPLOITATION ──
  const XD_n = XC_n + RK_n
  const XD_n1 = XC_n1 + RK_n1
  rows.push(makeDataRow('XD', 'EXCEDENT BRUT D\'EXPLOITATION', null, null, null, XD_n, XD_n1))
  addLabelMerge(rows.length - 1)

  // ── TJ: Reprises de provisions, amortissements ──
  const TJ_n = getProduits(bal, COMPTE_RESULTAT_MAPPING.TJ.comptes)
  const TJ_n1 = getProduits(balN1, COMPTE_RESULTAT_MAPPING.TJ.comptes)
  rows.push(makeDataRow('TJ', 'Reprises de provisions, amortissements', null, '+', 28, TJ_n, TJ_n1))
  addLabelMerge(rows.length - 1)

  // ── RL: Dotations aux amortissements et aux provisions ──
  const RL_n = -getCharges(bal, COMPTE_RESULTAT_MAPPING.RL.comptes)
  const RL_n1 = -getCharges(balN1, COMPTE_RESULTAT_MAPPING.RL.comptes)
  rows.push(makeDataRow('RL', 'Dotations aux amortissements et aux provisions', null, '-', 3, RL_n, RL_n1))
  addLabelMerge(rows.length - 1)

  // ── XE: RESULTAT D'EXPLOITATION ──
  const XE_n = XD_n + TJ_n + RL_n
  const XE_n1 = XD_n1 + TJ_n1 + RL_n1
  rows.push(makeDataRow('XE', 'RESULTAT D\'EXPLOITATION', null, null, null, XE_n, XE_n1))
  addLabelMerge(rows.length - 1)

  // ── TK: Revenus financiers et assimilés ──
  const TK_n = getProduits(bal, COMPTE_RESULTAT_MAPPING.TK.comptes)
  const TK_n1 = getProduits(balN1, COMPTE_RESULTAT_MAPPING.TK.comptes)
  rows.push(makeDataRow('TK', 'Revenus financiers et assimilés', null, '+', 29, TK_n, TK_n1))
  addLabelMerge(rows.length - 1)

  // ── TL: Reprises de provisions et dépréciations financières ──
  const TL_n = getProduits(bal, COMPTE_RESULTAT_MAPPING.TL.comptes)
  const TL_n1 = getProduits(balN1, COMPTE_RESULTAT_MAPPING.TL.comptes)
  rows.push(makeDataRow('TL', 'Reprises de provisions et dépréciations financières', null, '+', 28, TL_n, TL_n1))
  addLabelMerge(rows.length - 1)

  // ── TM: Transferts de charges financières ──
  const TM_n = getProduits(bal, COMPTE_RESULTAT_MAPPING.TM.comptes)
  const TM_n1 = getProduits(balN1, COMPTE_RESULTAT_MAPPING.TM.comptes)
  rows.push(makeDataRow('TM', 'Transferts de charges financières', null, '+', 12, TM_n, TM_n1))
  addLabelMerge(rows.length - 1)

  // ── RM: Frais financiers et charges assimilées ──
  const RM_n = -getCharges(bal, COMPTE_RESULTAT_MAPPING.RM.comptes)
  const RM_n1 = -getCharges(balN1, COMPTE_RESULTAT_MAPPING.RM.comptes)
  rows.push(makeDataRow('RM', 'Frais financiers et charges assimilées', null, '-', 29, RM_n, RM_n1))
  addLabelMerge(rows.length - 1)

  // ── RN: Dotations aux provisions et dépréciations financières ──
  const RN_n = -getCharges(bal, COMPTE_RESULTAT_MAPPING.RN.comptes)
  const RN_n1 = -getCharges(balN1, COMPTE_RESULTAT_MAPPING.RN.comptes)
  rows.push(makeDataRow('RN', 'Dotations aux provisions et dépréciations financières', null, '-', 3, RN_n, RN_n1))
  addLabelMerge(rows.length - 1)

  // ── XF: RESULTAT FINANCIER ──
  const XF_n = TK_n + TL_n + TM_n + RM_n + RN_n
  const XF_n1 = TK_n1 + TL_n1 + TM_n1 + RM_n1 + RN_n1
  rows.push(makeDataRow('XF', 'RESULTAT FINANCIER (Somme TK à RN)', null, null, null, XF_n, XF_n1))
  addLabelMerge(rows.length - 1)

  // ── XG: RESULTAT DES ACTIVITES ORDINAIRES ──
  const XG_n = XE_n + XF_n
  const XG_n1 = XE_n1 + XF_n1
  rows.push(makeDataRow('XG', 'RESULTAT DES ACTIVITES ORDINAIRES', null, null, null, XG_n, XG_n1))
  addLabelMerge(rows.length - 1)

  // ── TN: Produits des cessions d'immobilisations ──
  const TN_n = getProduits(bal, COMPTE_RESULTAT_MAPPING.TN.comptes)
  const TN_n1 = getProduits(balN1, COMPTE_RESULTAT_MAPPING.TN.comptes)
  rows.push(makeDataRow('TN', 'Produits des cessions d\'immobilisations', null, '+', 3, TN_n, TN_n1))
  addLabelMerge(rows.length - 1)

  // ── TO: Autres produits HAO ──
  const TO_n = getProduits(bal, COMPTE_RESULTAT_MAPPING.TO.comptes)
  const TO_n1 = getProduits(balN1, COMPTE_RESULTAT_MAPPING.TO.comptes)
  rows.push(makeDataRow('TO', 'Autres produits HAO', null, '+', 30, TO_n, TO_n1))
  addLabelMerge(rows.length - 1)

  // ── RO: Valeurs comptables des cessions d'immobilisations ──
  const RO_n = -getCharges(bal, COMPTE_RESULTAT_MAPPING.RO.comptes)
  const RO_n1 = -getCharges(balN1, COMPTE_RESULTAT_MAPPING.RO.comptes)
  rows.push(makeDataRow('RO', 'Valeurs comptables des cessions d\'immobilisations', null, '-', 3, RO_n, RO_n1))
  addLabelMerge(rows.length - 1)

  // ── RP: Autres charges HAO ──
  const RP_n = -getCharges(bal, COMPTE_RESULTAT_MAPPING.RP.comptes)
  const RP_n1 = -getCharges(balN1, COMPTE_RESULTAT_MAPPING.RP.comptes)
  rows.push(makeDataRow('RP', 'Autres charges HAO', null, '-', 30, RP_n, RP_n1))
  addLabelMerge(rows.length - 1)

  // ── XH: RESULTAT HAO ──
  const XH_n = TN_n + TO_n + RO_n + RP_n
  const XH_n1 = TN_n1 + TO_n1 + RO_n1 + RP_n1
  rows.push(makeDataRow('XH', 'RESULTAT HAO (Somme TN à RP)', null, null, null, XH_n, XH_n1))
  addLabelMerge(rows.length - 1)

  // ── RQ: Participation des travailleurs ──
  const RQ_n = -getCharges(bal, COMPTE_RESULTAT_MAPPING.RQ.comptes)
  const RQ_n1 = -getCharges(balN1, COMPTE_RESULTAT_MAPPING.RQ.comptes)
  rows.push(makeDataRow('RQ', 'Participation des travailleurs', null, '-', 30, RQ_n, RQ_n1))
  addLabelMerge(rows.length - 1)

  // ── RS: Impôts sur le résultat ──
  const RS_n = -getCharges(bal, COMPTE_RESULTAT_MAPPING.RS.comptes)
  const RS_n1 = -getCharges(balN1, COMPTE_RESULTAT_MAPPING.RS.comptes)
  rows.push(makeDataRow('RS', 'Impôts sur le résultat', null, '-', null, RS_n, RS_n1))
  addLabelMerge(rows.length - 1)

  // ── XI: RESULTAT NET ──
  const XI_n = XG_n + XH_n + RQ_n + RS_n
  const XI_n1 = XG_n1 + XH_n1 + RQ_n1 + RS_n1
  rows.push(makeDataRow('XI', 'RESULTAT NET', null, null, null, XI_n, XI_n1))
  addLabelMerge(rows.length - 1)

  // ── Footnotes ──
  // Row 52: (1): Les montants...
  const fn1 = emptyRow(C)
  fn1[0] = '(1) :'
  fn1[1] = 'Les montants seront précédés du signe (-) s\'ils sont négatifs (charges supérieures aux produits).'
  rows.push(fn1)
  addLabelMerge(rows.length - 1)

  // Row 53: (+/-) Solde débiteur...
  const fn2 = emptyRow(C)
  fn2[1] = '(+/-) : Solde débiteur = - ; Solde créditeur = +'
  rows.push(fn2)
  addLabelMerge(rows.length - 1)

  // Row 54: (2): Les signes...
  const fn3 = emptyRow(C)
  fn3[0] = '(2) :'
  fn3[1] = 'Les signes de cette colonne concernent uniquement les variations de stocks :'
  rows.push(fn3)
  addLabelMerge(rows.length - 1)

  // Row 55: ils ne jouent pas le rôle...
  const fn4 = emptyRow(C)
  fn4[1] = 'ils ne jouent pas le rôle de signe algébrique.'
  rows.push(fn4)
  addLabelMerge(rows.length - 1)

  // Pad to 56 rows total
  while (rows.length < 56) rows.push(emptyRow(C))

  return { rows, merges }
}

export { buildPassif, buildResultat }
