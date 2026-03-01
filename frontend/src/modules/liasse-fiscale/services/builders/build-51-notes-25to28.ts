/**
 * build-51-notes-25to28.ts
 * Builders for sheets 51-55 of the SYSCOHADA liasse fiscale:
 *   - Sheet 51: NOTE 25  (8 cols)  - Impots et taxes
 *   - Sheet 52: NOTE 26  (8 cols)  - Autres charges
 *   - Sheet 53: NOTE 27A (8 cols)  - Charges de personnel
 *   - Sheet 54: NOTE 27B (19 cols) - Effectifs, masse salariale et personnel exterieur
 *   - Sheet 55: NOTE 28  (12 cols) - Dotations et charges pour provisions et depreciations
 */

import { SheetData, Row, emptyRow, rowAt, m, headerRows } from './helpers'
import type { EntrepriseData, ExerciceData, BalanceEntry } from './helpers'

// ════════════════════════════════════════════════════════════════════════════
// Helper: variation percentage
// ════════════════════════════════════════════════════════════════════════════

function variationPct(n: number, n1: number): number {
  if (n1 === 0) return 0
  return ((n - n1) / Math.abs(n1)) * 100
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 51 — NOTE 25 : IMPOTS ET TAXES
//   8 columns (A=0 to H=7)
// ────────────────────────────────────────────────────────────────────────────

function buildNote25(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 8
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 47 -']))
  merges.push(m(0, 0, 0, 7)) // A1:H1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [6, 'NOTE 25\nSYSTEME NORMAL']))
  merges.push(m(1, 6, 1, 7)) // G2:H2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C, {
    labelCol: 0,
    valueCol: 2,
    sigleCol: 6,
    sigleValCol: 7,
  }))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 25 : IMPOTS ET TAXES']))
  merges.push(m(6, 0, 6, 7)) // A7:H7

  // ── Row 7 (L8): column headers ──
  const hdr = emptyRow(C)
  hdr[0] = 'Libellés'
  hdr[5] = 'Année N'
  hdr[6] = 'Année N-1'
  hdr[7] = 'Variation\nen %'
  rows.push(hdr)
  merges.push(m(7, 0, 7, 4)) // A8:E8

  // ── Helper for data rows ──
  const dataRow = (label: string, fVal: number, gVal: number): Row => {
    const row = emptyRow(C)
    row[0] = label
    row[5] = fVal
    row[6] = gVal
    row[7] = variationPct(fVal, gVal)
    return row
  }

  const addLabelMerge = (rowIdx: number): void => {
    merges.push(m(rowIdx, 0, rowIdx, 4)) // A:E merge for labels
  }

  // ── Data rows (L9-L13): detail lines ──
  const labels = [
    'Impôts et taxes directs',
    'Impôts et taxes indirects',
    'Droits d\'enregistrement',
    'Pénalités et amendes fiscales',
    'Autres impôts et taxes',
  ]

  for (const label of labels) {
    rows.push(dataRow(label, 0, 0))
    addLabelMerge(rows.length - 1)
  }

  // ── Row 13 (L14): TOTAL → SUM(F9:F13) ──
  rows.push(dataRow('TOTAL', 0, 0))
  addLabelMerge(rows.length - 1)

  // ── Commentaires (L15-L19) ──
  rows.push(emptyRow(C))
  const cm = emptyRow(C)
  cm[0] = 'Commentaire : Faire un commentaire.'
  rows.push(cm)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 7))

  rows.push(emptyRow(C))
  rows.push(emptyRow(C))
  rows.push(emptyRow(C))

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 52 — NOTE 26 : AUTRES CHARGES
//   8 columns (A=0 to H=7)
// ────────────────────────────────────────────────────────────────────────────

function buildNote26(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 8
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 48 -']))
  merges.push(m(0, 0, 0, 7)) // A1:H1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [6, 'NOTE 26\nSYSTEME NORMAL']))
  merges.push(m(1, 6, 1, 7)) // G2:H2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C, {
    labelCol: 0,
    valueCol: 2,
    sigleCol: 6,
    sigleValCol: 7,
  }))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 26 : AUTRES CHARGES']))
  merges.push(m(6, 0, 6, 7)) // A7:H7

  // ── Row 7 (L8): column headers ──
  const hdr = emptyRow(C)
  hdr[0] = 'Libellés'
  hdr[5] = 'Année N'
  hdr[6] = 'Année N-1'
  hdr[7] = 'Variation\nen %'
  rows.push(hdr)
  merges.push(m(7, 0, 7, 4)) // A8:E8

  // ── Helper for data rows ──
  const dataRow = (label: string, fVal: number, gVal: number): Row => {
    const row = emptyRow(C)
    row[0] = label
    row[5] = fVal
    row[6] = gVal
    row[7] = variationPct(fVal, gVal)
    return row
  }

  const addLabelMerge = (rowIdx: number): void => {
    merges.push(m(rowIdx, 0, rowIdx, 4)) // A:E merge for labels
  }

  // ── Data rows (L9-L18): detail lines ──
  const labels = [
    'Pertes sur créances clients',
    'Pertes sur autres débiteurs',
    'Quote-part de résultat sur opérations faites en commun',
    'Valeur comptable des cessions courantes d\'immobilisations',
    'Perte de change sur créances et dettes commerciales',
    'Pénalités et amendes pénales',
    'Indemnités de fonction et autres rémunérations d\'administrateurs',
    'Dons et mécénat',
    'Autres charges diverses',
    'Charges pour dépréciations et provisions pour risques à court terme d\'exploitation',
  ]

  for (const label of labels) {
    rows.push(dataRow(label, 0, 0))
    addLabelMerge(rows.length - 1)
  }

  // ── Row 18 (L19): TOTAL → SUM(F9:F18) ──
  rows.push(dataRow('TOTAL', 0, 0))
  addLabelMerge(rows.length - 1)

  // ── Commentaires (L20-L25) ──
  rows.push(emptyRow(C))
  const cm = emptyRow(C)
  cm[0] = 'Commentaire : Faire un commentaire.'
  rows.push(cm)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 7))

  rows.push(emptyRow(C))
  rows.push(emptyRow(C))
  rows.push(emptyRow(C))
  rows.push(emptyRow(C))

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 53 — NOTE 27A : CHARGES DE PERSONNEL
//   8 columns (A=0 to H=7)
// ────────────────────────────────────────────────────────────────────────────

function buildNote27A(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 8
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 49 -']))
  merges.push(m(0, 0, 0, 7)) // A1:H1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [6, 'NOTE 27A\nSYSTEME NORMAL']))
  merges.push(m(1, 6, 1, 7)) // G2:H2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C, {
    labelCol: 0,
    valueCol: 2,
    sigleCol: 6,
    sigleValCol: 7,
  }))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 27A : CHARGES DE PERSONNEL']))
  merges.push(m(6, 0, 6, 7)) // A7:H7

  // ── Row 7 (L8): column headers ──
  const hdr = emptyRow(C)
  hdr[0] = 'Libellés'
  hdr[5] = 'Année N'
  hdr[6] = 'Année N-1'
  hdr[7] = 'Variation\nen %'
  rows.push(hdr)
  merges.push(m(7, 0, 7, 4)) // A8:E8

  // ── Helper for data rows ──
  const dataRow = (label: string, fVal: number, gVal: number): Row => {
    const row = emptyRow(C)
    row[0] = label
    row[5] = fVal
    row[6] = gVal
    row[7] = variationPct(fVal, gVal)
    return row
  }

  const addLabelMerge = (rowIdx: number): void => {
    merges.push(m(rowIdx, 0, rowIdx, 4)) // A:E merge for labels
  }

  // ── Data rows (L9-L16): detail lines ──
  const labels = [
    'Rémunérations directes versées au personnel national',
    'Rémunérations directes versées au personnel non national',
    'Indemnités forfaitaires versées au personnel',
    'Charges sociales (personnel national)',
    'Charges sociales (personnel non national)',
    'Rémunérations et charges sociales de l\'exploitant individuel',
    'Rémunération transférée de personnel extérieur',
    'Autres charges sociales',
  ]

  for (const label of labels) {
    rows.push(dataRow(label, 0, 0))
    addLabelMerge(rows.length - 1)
  }

  // ── Row 16 (L17): TOTAL → SUM(F9:F16) ──
  rows.push(dataRow('TOTAL', 0, 0))
  addLabelMerge(rows.length - 1)

  // ── Commentaires (L18-L22) ──
  rows.push(emptyRow(C))
  const cm = emptyRow(C)
  cm[0] = 'Commentaire : Faire un commentaire.'
  rows.push(cm)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 7))

  rows.push(emptyRow(C))
  rows.push(emptyRow(C))
  rows.push(emptyRow(C))

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 54 — NOTE 27B : EFFECTIFS, MASSE SALARIALE ET PERSONNEL EXTERIEUR
//   19 columns (A=0 to S=18)
// ────────────────────────────────────────────────────────────────────────────

function buildNote27B(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 19
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 50 -']))
  merges.push(m(0, 0, 0, 18)) // A1:S1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [17, 'NOTE 27B\nSYSTEME NORMAL']))
  merges.push(m(1, 17, 1, 18)) // R2:S2

  // ── Rows 2-5 (L3-L6): standard header (adapted for wider grid) ──
  rows.push(...headerRows(ent, ex, C, {
    labelCol: 0,
    valueCol: 3,
    sigleCol: 16,
    sigleValCol: 17,
  }))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 27B : EFFECTIFS, MASSE SALARIALE ET PERSONNEL EXTERIEUR']))
  merges.push(m(6, 0, 6, 18)) // A7:S7

  // ── Row 7 (L8): section headers ──
  const r7 = emptyRow(C)
  r7[1] = 'EFFECTIF  ET MASSE SALARIALE'
  r7[4] = 'EFFECTIFS'
  r7[11] = 'MASSE SALARIALE'
  rows.push(r7)
  merges.push(m(7, 1, 7, 3))   // B8:D8
  merges.push(m(7, 4, 7, 10))  // E8:K8
  merges.push(m(7, 11, 7, 18)) // L8:S8

  // ── Row 8 (L9): sub-headers row 1 ──
  const r8 = emptyRow(C)
  r8[4] = 'Nationaux'
  r8[6] = 'Autres\nEtats de\nla Région (3)'
  r8[8] = 'Hors\nRégion (3)'
  r8[10] = 'TOTAL'
  r8[11] = 'Nationaux'
  r8[14] = 'Autres Etats\nde la Région (3)'
  r8[16] = 'Hors Région (3)'
  r8[18] = 'TOTAL'
  rows.push(r8)
  merges.push(m(8, 4, 9, 5))   // E9:F10 Nationaux (effectifs)
  merges.push(m(8, 6, 9, 7))   // G9:H10 Autres Etats
  merges.push(m(8, 8, 9, 9))   // I9:J10 Hors Région
  merges.push(m(8, 10, 9, 10)) // K9:K10 TOTAL effectifs
  merges.push(m(8, 11, 9, 12)) // L9:M10 Nationaux (masse)
  merges.push(m(8, 14, 9, 15)) // O9:P10 Autres Etats (masse)
  merges.push(m(8, 16, 9, 17)) // Q9:R10 Hors Région (masse)
  merges.push(m(8, 18, 9, 18)) // S9:S10 TOTAL masse

  // ── Row 9 (L10): sub-headers row 2 (spanned via merges above) ──
  rows.push(emptyRow(C))

  // ── Row 10 (L11): M/F headers ──
  const r10 = emptyRow(C)
  r10[1] = 'QUALIFICATIONS'
  r10[4] = 'M'
  r10[5] = 'F'
  r10[6] = 'M'
  r10[7] = 'F'
  r10[8] = 'M'
  r10[9] = 'F'
  r10[11] = 'M'
  r10[12] = 'F'
  r10[14] = 'M'
  r10[15] = 'F'
  r10[16] = 'M'
  r10[17] = 'F'
  rows.push(r10)
  merges.push(m(10, 1, 10, 3)) // B11:D11

  // ── Helper for data rows (effectifs + masse salariale) ──
  const qualifRow = (ref: string, label: string): Row => {
    const row = emptyRow(C)
    row[0] = ref
    row[1] = label
    // Effectifs: E-J all 0
    row[4] = 0; row[5] = 0; row[6] = 0; row[7] = 0; row[8] = 0; row[9] = 0
    // K = SUM(E:J)
    row[10] = 0
    // Masse salariale: L-R all 0
    row[11] = 0; row[12] = 0; row[14] = 0; row[15] = 0; row[16] = 0; row[17] = 0
    // S = L+M+O+P+Q+R
    row[18] = 0
    return row
  }

  const addQualifLabelMerge = (rowIdx: number): void => {
    merges.push(m(rowIdx, 1, rowIdx, 3)) // B:D merge for labels
  }

  // ════════════════════════════════════════════════════════════════════════
  // Section 1: Qualification categories (rows 11-14, L12-L15)
  // ════════════════════════════════════════════════════════════════════════

  const qualifications = [
    ['YA', 'Cadres supérieurs et dirigeants'],
    ['YB', 'Techniciens et agents de maîtrise'],
    ['YC', 'Ouvriers et employés qualifiés'],
    ['YD', 'Manoeuvres, apprentis et autres'],
  ]

  for (const [ref, label] of qualifications) {
    rows.push(qualifRow(ref, label))
    addQualifLabelMerge(rows.length - 1)
  }

  // ── Row 15 (L16): YE TOTAL (1) (A) ──
  const totalRow1 = qualifRow('YE', 'TOTAL (1) (A)')
  rows.push(totalRow1)
  addQualifLabelMerge(rows.length - 1)

  // ── Row 16 (L17): YF Permanents ──
  rows.push(qualifRow('YF', 'Permanents'))
  addQualifLabelMerge(rows.length - 1)

  // ── Row 17 (L18): YG Saisonniers ──
  rows.push(qualifRow('YG', 'Saisonniers'))
  addQualifLabelMerge(rows.length - 1)

  // ── Row 18 (L19): empty separator ──
  rows.push(emptyRow(C))

  // ════════════════════════════════════════════════════════════════════════
  // Section 2: Personnel extérieur (rows 19-27, L20-L28)
  // ════════════════════════════════════════════════════════════════════════

  // ── Row 19 (L20): Section header ──
  const rSec2 = emptyRow(C)
  rSec2[0] = 'PERSONNEL EXTERIEUR (2)'
  rows.push(rSec2)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 3)) // A20:D20

  // ── Rows 20-27 (L21-L28): Personnel extérieur detail rows ──
  const personnelExtLabels = [
    ['YH', 'Personnel intérimaire'],
    ['YI', 'Personnel détaché ou prêté à l\'entité'],
    ['YJ', 'Personnel relevant d\'un prestataire'],
    ['YK', 'Sous-traitance de main d\'oeuvre'],
    ['YL', 'Personnel extérieur autre'],
    ['YM', 'TOTAL (2) (B)'],
    ['YN', 'Dont permanents'],
  ]

  for (const [ref, label] of personnelExtLabels) {
    rows.push(qualifRow(ref, label))
    addQualifLabelMerge(rows.length - 1)
  }

  // ── Row 28 (L29): YO TOTAL (1+2) ──
  rows.push(qualifRow('YO', 'TOTAL (1+2) = (A) + (B)'))
  addQualifLabelMerge(rows.length - 1)

  // ── Notes at bottom (L30-L33) ──
  rows.push(emptyRow(C))

  const fn1 = emptyRow(C)
  fn1[0] = '(1) Il s\'agit du personnel inscrit au registre de l\'employeur.'
  rows.push(fn1)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 18))

  const fn2 = emptyRow(C)
  fn2[0] = '(2) Il s\'agit du personnel non inscrit au registre de l\'employeur, facturé par des entités extérieures.'
  rows.push(fn2)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 18))

  const fn3 = emptyRow(C)
  fn3[0] = '(3) La Région s\'entend de l\'espace géographique des pays membres de l\'OHADA.'
  rows.push(fn3)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 18))

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 55 — NOTE 28 : DOTATIONS ET CHARGES POUR PROVISIONS ET DEPRECIATIONS
//   12 columns (A=0 to L=11)
// ────────────────────────────────────────────────────────────────────────────

function buildNote28(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 12
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 51 -']))
  merges.push(m(0, 0, 0, 11)) // A1:L1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [10, 'NOTE 28\nSYSTEME NORMAL']))
  merges.push(m(1, 10, 1, 11)) // K2:L2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C, {
    labelCol: 0,
    valueCol: 3,
    sigleCol: 9,
    sigleValCol: 10,
  }))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 28 : DOTATIONS ET CHARGES POUR PROVISIONS ET DEPRECIATIONS']))
  merges.push(m(6, 0, 6, 11)) // A7:L7

  // ── Row 7 (L8): column headers level 1 ──
  const r7 = emptyRow(C)
  r7[0] = 'SITUATIONS ET MOUVEMENTS'
  r7[4] = 'A'
  r7[5] = 'B'
  r7[8] = 'C'
  r7[11] = 'D = A + B - C'
  rows.push(r7)
  merges.push(m(7, 0, 7, 3)) // A8:D8

  // ── Row 8 (L9): column headers level 2 ──
  const r8 = emptyRow(C)
  r8[4] = 'PROVISIONS A\nL\'OUVERTURE\nDE L\'EXERCICE'
  r8[5] = 'AUGMENTATIONS : DOTATIONS'
  r8[8] = 'DIMINUTIONS : REPRISES'
  r8[11] = 'PROVISIONS A\nLA CLOTURE\nDE L\'EXERCICE'
  rows.push(r8)
  merges.push(m(8, 4, 9, 4))   // E9:E10
  merges.push(m(8, 5, 8, 7))   // F9:H9
  merges.push(m(8, 8, 8, 10))  // I9:K9
  merges.push(m(8, 11, 9, 11)) // L9:L10

  // ── Row 9 (L10): column headers level 3 ──
  const r9 = emptyRow(C)
  r9[0] = 'NATURE'
  r9[5] = 'D\'EXPLOITATION'
  r9[6] = 'FINANCIERES'
  r9[7] = 'HORS ACTIVITES\nORDINAIRES'
  r9[8] = 'D\'EXPLOITATION'
  r9[9] = 'FINANCIERES'
  r9[10] = 'HORS ACTIVITES\nORDINAIRES'
  rows.push(r9)
  merges.push(m(9, 0, 9, 3)) // A10:D10

  // ── Helper for movement data rows ──
  const mvtRow = (label: string): Row => {
    const row = emptyRow(C)
    row[0] = label
    row[4] = 0  // A: ouverture
    row[5] = 0  // B: dot. exploitation
    row[6] = 0  // B: dot. financières
    row[7] = 0  // B: dot. HAO
    row[8] = 0  // C: repr. exploitation
    row[9] = 0  // C: repr. financières
    row[10] = 0 // C: repr. HAO
    row[11] = 0 // D = A + B - C
    return row
  }

  const addNatureMerge = (rowIdx: number): void => {
    merges.push(m(rowIdx, 0, rowIdx, 3)) // A:D merge for nature labels
  }

  // ════════════════════════════════════════════════════════════════════════
  // Section 1: Dotations (rows 10-13, L11-L14)
  // ════════════════════════════════════════════════════════════════════════

  const dotationsLabels = [
    'Provisions réglementées',
    'Provisions financières',
    'Dépréciations des immobilisations',
  ]

  for (const label of dotationsLabels) {
    rows.push(mvtRow(label))
    addNatureMerge(rows.length - 1)
  }

  // ── Row 13 (L14): TOTAL DOTATIONS → column sums of L11:L13 ──
  rows.push(mvtRow('TOTAL DOTATIONS'))
  addNatureMerge(rows.length - 1)

  // ════════════════════════════════════════════════════════════════════════
  // Section 2: Charges pour provisions et dépréciations à court terme
  //   (rows 14-26, L15-L27)
  // ════════════════════════════════════════════════════════════════════════

  const chargesLabels = [
    'Dépréciations des stocks',
    'Dépréciations des fournisseurs',
    'Dépréciations des clients',
    'Dépréciations des autres créances',
    'Dépréciations des titres de placement',
    'Provisions pour litiges',
    'Provisions pour garanties données aux clients',
    'Provisions pour pertes sur marchés à achèvement futur',
    'Provisions pour pertes de change',
    'Provisions pour amendes et pénalités',
    'Provisions pour renouvellement',
    'Provisions pour gros entretien',
    'Autres provisions et dépréciations à court terme',
  ]

  for (const label of chargesLabels) {
    rows.push(mvtRow(label))
    addNatureMerge(rows.length - 1)
  }

  // ── Row 27 (L28): TOTAL CHARGES → column sums of L15:L27 ──
  rows.push(mvtRow('TOTAL CHARGES'))
  addNatureMerge(rows.length - 1)

  // ── Row 28 (L29): TOTAL → L14 + L28 ──
  rows.push(mvtRow('TOTAL'))
  addNatureMerge(rows.length - 1)

  // ── Comments (L30-L33) ──
  rows.push(emptyRow(C))

  const cm1 = emptyRow(C)
  cm1[0] = 'Commentaire : Faire un commentaire.'
  rows.push(cm1)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 11))

  rows.push(emptyRow(C))
  rows.push(emptyRow(C))

  return { rows, merges }
}

// ════════════════════════════════════════════════════════════════════════════
// Exports
// ════════════════════════════════════════════════════════════════════════════

export { buildNote25, buildNote26, buildNote27A, buildNote27B, buildNote28 }
