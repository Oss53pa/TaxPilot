/**
 * build-39-notes-16to19.ts
 * Builders for sheets 39-45 of the SYSCOHADA liasse fiscale:
 *   - Sheet 39: NOTE 16A     (11 cols) - Dettes financieres et ressources assimilees
 *   - Sheet 40: NOTE 16B     (9 cols)  - Engagements de retraite (methode actuarielle)
 *   - Sheet 41: NOTE 16B BIS (9 cols)  - Engagements de retraite (actif/passif net)
 *   - Sheet 42: NOTE 16C     (8 cols)  - Actifs et passifs eventuels
 *   - Sheet 43: NOTE 17      (11 cols) - Fournisseurs d'exploitation
 *   - Sheet 44: NOTE 18      (11 cols) - Dettes fiscales et sociales
 *   - Sheet 45: NOTE 19      (11 cols) - Autres dettes et provisions CT
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
// Sheet 39 — NOTE 16A : DETTES FINANCIERES ET RESSOURCES ASSIMILEES
//   11 columns (A=0 to K=10)
// ────────────────────────────────────────────────────────────────────────────

function buildNote16A(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 11
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 35 -']))
  merges.push(m(0, 0, 0, 10)) // A1:K1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [9, 'NOTE 16A\nSYSTEME NORMAL']))
  merges.push(m(1, 9, 1, 10)) // J2:K2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C, {
    labelCol: 0,
    valueCol: 2,
    sigleCol: 9,
    sigleValCol: 10,
  }))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 16A : DETTES FINANCIERES ET RESSOURCES ASSIMILES']))
  merges.push(m(6, 0, 6, 10)) // A7:K7

  // ── Row 7 (L8): column headers ──
  const hdr = emptyRow(C)
  hdr[0] = 'LIBELLES'
  hdr[4] = 'Année N'
  hdr[5] = 'Année N-1'
  hdr[6] = 'Variation\nvaleur'
  hdr[7] = 'Variation\n%'
  hdr[8] = 'Dettes\n\u22641 an'
  hdr[9] = 'Dettes\n1-2 ans'
  hdr[10] = 'Dettes\n>2 ans'
  rows.push(hdr)
  merges.push(m(7, 0, 7, 3)) // A8:D8 - LIBELLES

  // ── Helper for data rows ──
  const dataRow = (label: string, eVal: number, fVal: number): Row => {
    const row = emptyRow(C)
    row[0] = label
    row[4] = eVal
    row[5] = fVal
    row[6] = eVal - fVal
    row[7] = variationPct(eVal, fVal)
    row[8] = 0
    row[9] = 0
    row[10] = 0
    return row
  }

  const addLabelMerge = (rowIdx: number): void => {
    merges.push(m(rowIdx, 0, rowIdx, 3))
  }

  // ════════════════════════════════════════════════════════════════════════
  // Section 1: Emprunts et dettes financieres (rows 8-18, L9-L19)
  // ════════════════════════════════════════════════════════════════════════

  const empruntsLabels = [
    'Emprunts obligataires',
    'Emprunts aupr\u00e8s \u00e9tablissements de cr\u00e9dit',
    'Avances re\u00e7ues de l\'Etat',
    'Avances re\u00e7ues comptes courants bloqu\u00e9s',
    'D\u00e9p\u00f4ts et cautionnements re\u00e7us',
    'Int\u00e9r\u00eats courus',
    'Avances et dettes \u00e0 conditions particuli\u00e8res',
    'Autres emprunts et dettes',
    'Dettes li\u00e9es \u00e0 des participations',
    'Comptes permanents bloqu\u00e9s',
  ]

  for (const label of empruntsLabels) {
    rows.push(dataRow(label, 0, 0))
    addLabelMerge(rows.length - 1)
  }

  // Row 18 (L19): TOTAL EMPRUNTS
  rows.push(dataRow('TOTAL EMPRUNTS ET DETTES FINANCIERES', 0, 0))
  addLabelMerge(rows.length - 1)

  // ════════════════════════════════════════════════════════════════════════
  // Section 2: Dettes de location-acquisition (rows 19-24, L20-L25)
  // ════════════════════════════════════════════════════════════════════════

  const locationLabels = [
    'Cr\u00e9dit-bail immobilier',
    'Cr\u00e9dit-bail mobilier',
    'Location-vente',
    'Int\u00e9r\u00eats courus',
    'Autres dettes de location-acquisition',
  ]

  for (const label of locationLabels) {
    rows.push(dataRow(label, 0, 0))
    addLabelMerge(rows.length - 1)
  }

  // Row 24 (L25): TOTAL LOCATION
  rows.push(dataRow('TOTAL DETTES DE LOCATION-ACQUISITION', 0, 0))
  addLabelMerge(rows.length - 1)

  // ════════════════════════════════════════════════════════════════════════
  // Section 3: Provisions pour risques et charges (rows 25-38, L26-L39)
  // ════════════════════════════════════════════════════════════════════════

  const provisionsLabels = [
    'Litiges',
    'Garanties donn\u00e9es aux clients',
    'Pertes sur march\u00e9s \u00e0 ach\u00e8vement futur',
    'Pertes de change',
    'Imp\u00f4ts',
    'Pensions et obligations similaires de retraite',
    'Actif net du r\u00e9gime de retraite',
    'Restructuration',
    'Amendes et p\u00e9nalit\u00e9s',
    'Propre assureur',
    'D\u00e9mant\u00e8lement',
    'Droits de r\u00e9duction',
    'Autres provisions pour risques et charges',
  ]

  for (const label of provisionsLabels) {
    rows.push(dataRow(label, 0, 0))
    addLabelMerge(rows.length - 1)
  }

  // Row 38 (L39): TOTAL PROVISIONS
  rows.push(dataRow('TOTAL PROVISIONS POUR RISQUES ET CHARGES', 0, 0))
  addLabelMerge(rows.length - 1)

  // ── Row 39 (L40): footnote ──
  const fn = emptyRow(C)
  fn[0] = '(1): Le solde de ce compte est d\u00e9biteur'
  rows.push(fn)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 10))

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 40 — NOTE 16B : ENGAGEMENTS DE RETRAITE ET AVANTAGES ASSIMILES
//   9 columns (A=0 to I=8)
// ────────────────────────────────────────────────────────────────────────────

function buildNote16B(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 9
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 36 -']))
  merges.push(m(0, 0, 0, 8)) // A1:I1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [7, 'NOTE 16B\nSYSTEME NORMAL']))
  merges.push(m(1, 7, 1, 8)) // H2:I2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C, {
    labelCol: 0,
    valueCol: 2,
    sigleCol: 7,
    sigleValCol: 8,
  }))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 16B : ENGAGEMENTS DE RETRAITE ET AVANTAGES ASSIMILES : (METHODE ACTUARIELLE']))
  merges.push(m(6, 0, 6, 8)) // A7:I7

  // ════════════════════════════════════════════════════════════════════════
  // Sub-table 1: HYPOTHESES ACTUARIELLES (rows 7-16, L8-L17)
  // ════════════════════════════════════════════════════════════════════════

  // Row 7 (L8): sub-table title
  rows.push(rowAt(C, [0, 'HYPOTHESES ACTUARIELLES']))
  merges.push(m(7, 0, 7, 8)) // A8:I8

  // Row 8 (L9): column headers
  const hdr1 = emptyRow(C)
  hdr1[0] = 'LIBELLES'
  hdr1[7] = 'Ann\u00e9e N'
  hdr1[8] = 'Ann\u00e9e N-1'
  rows.push(hdr1)
  merges.push(m(8, 0, 8, 6)) // A9:G9 - LIBELLES

  // Helper for simple 2-value rows (Libellés + Année N + Année N-1)
  const simpleRow = (label: string, n: number, n1: number): Row => {
    const row = emptyRow(C)
    row[0] = label
    row[7] = n
    row[8] = n1
    return row
  }

  const addSimpleLabelMerge = (rowIdx: number): void => {
    merges.push(m(rowIdx, 0, rowIdx, 6))
  }

  // Rows 9-16 (L10-L17): hypothesis data
  const hypotheses = [
    'Taux d\'augmentation des salaires',
    'Taux d\'actualisation',
    'Taux d\'inflation',
    'Probabilit\u00e9 de pr\u00e9sence \u00e0 la date de d\u00e9part',
    'Probabilit\u00e9 de vie \u00e0 la date de d\u00e9part',
    'Taux de rendement attendu des actifs du r\u00e9gime',
  ]

  for (const label of hypotheses) {
    rows.push(simpleRow(label, 0, 0))
    addSimpleLabelMerge(rows.length - 1)
  }

  // ── Empty separator row ──
  rows.push(emptyRow(C))

  // Row 16 is empty, so L17 is blank

  // ════════════════════════════════════════════════════════════════════════
  // Sub-table 2: VARIATION DE L'ENGAGEMENT DE RETRAITE (rows 18-28, L19-L29)
  // ════════════════════════════════════════════════════════════════════════

  // Row 18 (L19): sub-table title
  rows.push(rowAt(C, [0, 'VARIATION DE L\'ENGAGEMENT DE RETRAITE']))
  merges.push(m(rows.length - 1, 0, rows.length - 1, 8)) // A19:I19

  // Row 19 (L20): column headers
  const hdr2 = emptyRow(C)
  hdr2[0] = 'LIBELLES'
  hdr2[7] = 'Ann\u00e9e N'
  hdr2[8] = 'Ann\u00e9e N-1'
  rows.push(hdr2)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 6)) // A20:G20 - LIBELLES

  const variations = [
    'Obligation \u00e0 l\'ouverture de l\'exercice',
    'Co\u00fbt des services rendus au cours de l\'exercice',
    'Co\u00fbt financier (charge d\'int\u00e9r\u00eat)',
    'Pertes et gains actuariels',
    'Prestations pay\u00e9es',
    'Co\u00fbt des services pass\u00e9s',
    'Obligation \u00e0 la cl\u00f4ture de l\'exercice',
  ]

  for (const label of variations) {
    rows.push(simpleRow(label, 0, 0))
    addSimpleLabelMerge(rows.length - 1)
  }

  // ── Empty separator row ──
  rows.push(emptyRow(C))

  // ════════════════════════════════════════════════════════════════════════
  // Sub-table 3: ANALYSE DE SENSIBILITE (rows 30-37, L31-L38)
  // ════════════════════════════════════════════════════════════════════════

  // Row 30 (L31): sub-table title
  rows.push(rowAt(C, [0, 'ANALYSE DE SENSIBILITE']))
  merges.push(m(rows.length - 1, 0, rows.length - 1, 8)) // A31:I31

  // Row 31 (L32): column headers - two levels
  const hdr3a = emptyRow(C)
  hdr3a[0] = 'LIBELLES'
  hdr3a[5] = 'Ann\u00e9e N'
  hdr3a[7] = 'Ann\u00e9e N-1'
  rows.push(hdr3a)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 4)) // A32:E32 - LIBELLES
  merges.push(m(rows.length - 1, 5, rows.length - 1, 6)) // F32:G32 - Année N
  merges.push(m(rows.length - 1, 7, rows.length - 1, 8)) // H32:I32 - Année N-1

  // Row 32 (L33): sub-headers
  const hdr3b = emptyRow(C)
  hdr3b[5] = 'Augmentation'
  hdr3b[6] = 'Diminution'
  hdr3b[7] = 'Augmentation'
  hdr3b[8] = 'Diminution'
  rows.push(hdr3b)

  // Helper for sensitivity rows (4-value)
  const sensRow = (label: string): Row => {
    const row = emptyRow(C)
    row[0] = label
    row[5] = 0
    row[6] = 0
    row[7] = 0
    row[8] = 0
    return row
  }

  const addSensLabelMerge = (rowIdx: number): void => {
    merges.push(m(rowIdx, 0, rowIdx, 4))
  }

  const sensitivities = [
    'Taux d\'actualisation',
    'Taux de progression des salaires',
    'Taux de d\u00e9part du personnel',
  ]

  for (const label of sensitivities) {
    rows.push(sensRow(label))
    addSensLabelMerge(rows.length - 1)
  }

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 41 — NOTE 16B BIS : ENGAGEMENTS DE RETRAITE (ACTIF/PASSIF NET)
//   9 columns (A=0 to I=8)
// ────────────────────────────────────────────────────────────────────────────

function buildNote16BBis(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 9
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 37 -']))
  merges.push(m(0, 0, 0, 8)) // A1:I1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [7, 'NOTE 16B BIS\nSYSTEME NORMAL']))
  merges.push(m(1, 7, 1, 8)) // H2:I2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C, {
    labelCol: 0,
    valueCol: 2,
    sigleCol: 7,
    sigleValCol: 8,
  }))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 16B BIS : ENGAGEMENTS DE RETRAITE ET AVANTAGES ASSIMILES : (METHODE ACTUARI']))
  merges.push(m(6, 0, 6, 8)) // A7:I7

  // ════════════════════════════════════════════════════════════════════════
  // Sub-table 1: ACTIF/PASSIF NET (rows 7-13, L8-L14)
  // ════════════════════════════════════════════════════════════════════════

  // Row 7 (L8): sub-table title
  rows.push(rowAt(C, [0, 'ACTIF/PASSIF NET COMPTABILISE AU BILAN']))
  merges.push(m(7, 0, 7, 8)) // A8:I8

  // Row 8 (L9): column headers
  const hdr1 = emptyRow(C)
  hdr1[0] = 'LIBELLES'
  hdr1[7] = 'Ann\u00e9e N'
  hdr1[8] = 'Ann\u00e9e N-1'
  rows.push(hdr1)
  merges.push(m(8, 0, 8, 6)) // A9:G9 - LIBELLES

  // Helper for simple 2-value rows
  const simpleRow = (label: string, n: number, n1: number): Row => {
    const row = emptyRow(C)
    row[0] = label
    row[7] = n
    row[8] = n1
    return row
  }

  const addLabelMerge = (rowIdx: number): void => {
    merges.push(m(rowIdx, 0, rowIdx, 6))
  }

  // Rows 9-11 (L10-L12): actif/passif data
  const actifPassifLabels = [
    'Valeur actuelle de l\'obligation',
    'Valeur actuelle des actifs du r\u00e9gime',
    'Exc\u00e9dent / D\u00e9ficit du r\u00e9gime',
  ]

  for (const label of actifPassifLabels) {
    rows.push(simpleRow(label, 0, 0))
    addLabelMerge(rows.length - 1)
  }

  // ── Empty separator rows to reach row 14 ──
  rows.push(emptyRow(C))
  rows.push(emptyRow(C))

  // ════════════════════════════════════════════════════════════════════════
  // Sub-table 2: VALEUR ACTUELLE DES ACTIFS DU REGIME (rows 15-24, L16-L25)
  // ════════════════════════════════════════════════════════════════════════

  // Row 15 (L16): sub-table title
  rows.push(rowAt(C, [0, 'VALEUR ACTUELLE DES ACTIFS DU REGIME']))
  merges.push(m(rows.length - 1, 0, rows.length - 1, 8)) // A16:I16

  // Row 16 (L17): column headers - two levels
  const hdr2a = emptyRow(C)
  hdr2a[0] = 'LIBELLES'
  hdr2a[5] = 'Ann\u00e9e N'
  hdr2a[7] = 'Ann\u00e9e N-1'
  rows.push(hdr2a)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 4)) // A17:E17 - LIBELLES
  merges.push(m(rows.length - 1, 5, rows.length - 1, 6)) // F17:G17 - Année N
  merges.push(m(rows.length - 1, 7, rows.length - 1, 8)) // H17:I17 - Année N-1

  // Row 17 (L18): sub-headers
  const hdr2b = emptyRow(C)
  hdr2b[5] = 'Rendement'
  hdr2b[6] = 'Juste valeur'
  hdr2b[7] = 'Rendement'
  hdr2b[8] = 'Juste valeur'
  rows.push(hdr2b)

  // Helper for regime rows (4-value)
  const regimeRow = (label: string): Row => {
    const row = emptyRow(C)
    row[0] = label
    row[5] = 0
    row[6] = 0
    row[7] = 0
    row[8] = 0
    return row
  }

  const addRegimeLabelMerge = (rowIdx: number): void => {
    merges.push(m(rowIdx, 0, rowIdx, 4))
  }

  const regimeLabels = [
    'Actions',
    'Obligations',
    'Autres',
  ]

  for (const label of regimeLabels) {
    rows.push(regimeRow(label))
    addRegimeLabelMerge(rows.length - 1)
  }

  // Total row
  rows.push(regimeRow('TOTAL'))
  addRegimeLabelMerge(rows.length - 1)

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 42 — NOTE 16C : ACTIFS ET PASSIFS EVENTUELS
//   8 columns (A=0 to H=7)
// ────────────────────────────────────────────────────────────────────────────

function buildNote16C(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 8
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 38 -']))
  merges.push(m(0, 0, 0, 7)) // A1:H1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [6, 'NOTE 16C\nSYSTEME NORMAL']))
  merges.push(m(1, 6, 1, 7)) // G2:H2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C, {
    labelCol: 0,
    valueCol: 2,
    sigleCol: 6,
    sigleValCol: 7,
  }))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 16C : ACTIFS ET PASSIFS EVENTUELS']))
  merges.push(m(6, 0, 6, 7)) // A7:H7

  // ── Row 7 (L8): column headers ──
  const hdr = emptyRow(C)
  hdr[0] = 'LIBELLES'
  hdr[6] = 'Ann\u00e9e N'
  hdr[7] = 'Ann\u00e9e N-1'
  rows.push(hdr)
  merges.push(m(7, 0, 7, 5)) // A8:F8 - LIBELLES

  // Helper for data rows
  const dataRow = (label: string, g: number, h: number): Row => {
    const row = emptyRow(C)
    row[0] = label
    row[6] = g
    row[7] = h
    return row
  }

  const addLabelMerge = (rowIdx: number): void => {
    merges.push(m(rowIdx, 0, rowIdx, 5))
  }

  // ── Row 8 (L9): Actif eventuel - total ──
  rows.push(dataRow('Actif \u00e9ventuel', 0, 0))
  addLabelMerge(rows.length - 1)

  // ── Row 9 (L10): Litiges section header ──
  rows.push(dataRow('Litiges', 0, 0))
  addLabelMerge(rows.length - 1)

  // ── Rows 10-17 (L11-L18): 8 empty detail rows ──
  for (let i = 0; i < 8; i++) {
    rows.push(dataRow('', 0, 0))
    addLabelMerge(rows.length - 1)
  }

  // ── Row 18 (L19): Passif eventuel - total ──
  rows.push(dataRow('Passif \u00e9ventuel', 0, 0))
  addLabelMerge(rows.length - 1)

  // ── Row 19 (L20): section header ──
  rows.push(dataRow('', 0, 0))
  addLabelMerge(rows.length - 1)

  // ── Rows 20-27 (L21-L28): 8 empty detail rows ──
  for (let i = 0; i < 8; i++) {
    rows.push(dataRow('', 0, 0))
    addLabelMerge(rows.length - 1)
  }

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 43 — NOTE 17 : FOURNISSEURS D'EXPLOITATION
//   11 columns (A=0 to K=10)
// ────────────────────────────────────────────────────────────────────────────

function buildNote17(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 11
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 39 -']))
  merges.push(m(0, 0, 0, 10)) // A1:K1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [9, 'NOTE 17\nSYSTEME NORMAL']))
  merges.push(m(1, 9, 1, 10)) // J2:K2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C, {
    labelCol: 0,
    valueCol: 2,
    sigleCol: 9,
    sigleValCol: 10,
  }))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 17 : FOURNISSEURS D\'EXPLOITATION']))
  merges.push(m(6, 0, 6, 10)) // A7:K7

  // ── Row 7 (L8): column headers ──
  const hdr = emptyRow(C)
  hdr[0] = 'LIBELLES'
  hdr[5] = 'Ann\u00e9e N'
  hdr[6] = 'Ann\u00e9e N-1'
  hdr[7] = 'Variation\n%'
  hdr[8] = 'Dettes\n\u22641 an'
  hdr[9] = 'Dettes\n1-2 ans'
  hdr[10] = 'Dettes\n>2 ans'
  rows.push(hdr)
  merges.push(m(7, 0, 7, 4)) // A8:E8 - LIBELLES

  // ── Helper for data rows ──
  const dataRow = (label: string, fVal: number, gVal: number): Row => {
    const row = emptyRow(C)
    row[0] = label
    row[5] = fVal
    row[6] = gVal
    row[7] = variationPct(fVal, gVal)
    row[8] = 0
    row[9] = 0
    row[10] = 0
    return row
  }

  const addLabelMerge = (rowIdx: number): void => {
    merges.push(m(rowIdx, 0, rowIdx, 4))
  }

  // ════════════════════════════════════════════════════════════════════════
  // Section 1: Fournisseurs créditeurs (rows 8-17, L9-L18)
  // ════════════════════════════════════════════════════════════════════════

  const fournCredLabels = [
    'Fournisseurs, dettes en compte (hors groupe)',
    'Fournisseurs, sous-traitants',
    'Fournisseurs, r\u00e9serve de propri\u00e9t\u00e9',
    'Fournisseurs, retenue de garantie',
    'Fournisseurs, effets \u00e0 payer (hors groupe)',
    'Fournisseurs, dettes et effets \u00e0 payer (groupe)',
    'Fournisseurs, acquisitions courantes d\'immobilisations',
    'Fournisseurs, factures non parvenues (hors groupe)',
    'Fournisseurs, factures non parvenues (groupe)',
  ]

  for (const label of fournCredLabels) {
    rows.push(dataRow(label, 0, 0))
    addLabelMerge(rows.length - 1)
  }

  // Row 17 (L18): TOTAL FOURNISSEURS
  rows.push(dataRow('TOTAL FOURNISSEURS CREDITEURS', 0, 0))
  addLabelMerge(rows.length - 1)

  // ════════════════════════════════════════════════════════════════════════
  // Section 2: Fournisseurs débiteurs (rows 18-21, L19-L22)
  // ════════════════════════════════════════════════════════════════════════

  const fournDebLabels = [
    'Avances et acomptes vers\u00e9s sur commandes (hors groupe)',
    'Avances et acomptes vers\u00e9s sur commandes (groupe)',
    'Autres fournisseurs d\u00e9biteurs',
  ]

  for (const label of fournDebLabels) {
    rows.push(dataRow(label, 0, 0))
    addLabelMerge(rows.length - 1)
  }

  // Row 21 (L22): TOTAL FOURNISSEURS DEBITEURS
  rows.push(dataRow('TOTAL FOURNISSEURS DEBITEURS', 0, 0))
  addLabelMerge(rows.length - 1)

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 44 — NOTE 18 : DETTES FISCALES ET SOCIALES
//   11 columns (A=0 to K=10)
// ────────────────────────────────────────────────────────────────────────────

function buildNote18(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 11
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 40 -']))
  merges.push(m(0, 0, 0, 10)) // A1:K1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [9, 'NOTE 18\nSYSTEME NORMAL']))
  merges.push(m(1, 9, 1, 10)) // J2:K2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C, {
    labelCol: 0,
    valueCol: 2,
    sigleCol: 9,
    sigleValCol: 10,
  }))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 18 : DETTES FISCALES ET SOCIALES']))
  merges.push(m(6, 0, 6, 10)) // A7:K7

  // ── Row 7 (L8): column headers ──
  const hdr = emptyRow(C)
  hdr[0] = 'LIBELLES'
  hdr[4] = 'Ann\u00e9e N'
  hdr[5] = 'Ann\u00e9e N-1'
  hdr[6] = 'Variation\nvaleur'
  hdr[7] = 'Variation\n%'
  hdr[8] = 'Dettes\n\u22641 an'
  hdr[9] = 'Dettes\n1-2 ans'
  hdr[10] = 'Dettes\n>2 ans'
  rows.push(hdr)
  merges.push(m(7, 0, 7, 3)) // A8:D8 - LIBELLES

  // ── Helper for data rows ──
  const dataRow = (label: string, eVal: number, fVal: number): Row => {
    const row = emptyRow(C)
    row[0] = label
    row[4] = eVal
    row[5] = fVal
    row[6] = eVal - fVal
    row[7] = variationPct(eVal, fVal)
    row[8] = 0
    row[9] = 0
    row[10] = 0
    return row
  }

  const addLabelMerge = (rowIdx: number): void => {
    merges.push(m(rowIdx, 0, rowIdx, 3))
  }

  // ════════════════════════════════════════════════════════════════════════
  // Section 1: Dettes sociales (rows 8-18, L9-L19)
  // ════════════════════════════════════════════════════════════════════════

  const dettesSocLabels = [
    'Personnel, r\u00e9mun\u00e9rations dues',
    'Personnel, cong\u00e9s \u00e0 payer',
    'Charges sociales sur cong\u00e9s \u00e0 payer',
    'Autres charges de personnel',
    'Caisse de s\u00e9curit\u00e9 sociale',
    'Caisse de retraite',
    'Mutuelle sant\u00e9',
    'Assurance Retraite',
    'Autres charges sociales',
    'Autres cotisations sociales',
  ]

  for (const label of dettesSocLabels) {
    rows.push(dataRow(label, 0, 0))
    addLabelMerge(rows.length - 1)
  }

  // Row 18 (L19): TOTAL DETTES SOCIALES
  rows.push(dataRow('TOTAL DETTES SOCIALES', 0, 0))
  addLabelMerge(rows.length - 1)

  // ════════════════════════════════════════════════════════════════════════
  // Section 2: Dettes fiscales (rows 19-24, L20-L25)
  // ════════════════════════════════════════════════════════════════════════

  const dettesFiscLabels = [
    'Etat, imp\u00f4ts sur les b\u00e9n\u00e9fices',
    'Etat, imp\u00f4ts et taxes',
    'Etat, TVA',
    'Etat, imp\u00f4ts retenus \u00e0 la source',
    'Autres dettes envers l\'Etat',
  ]

  for (const label of dettesFiscLabels) {
    rows.push(dataRow(label, 0, 0))
    addLabelMerge(rows.length - 1)
  }

  // Row 24 (L25): TOTAL DETTES FISCALES
  rows.push(dataRow('TOTAL DETTES FISCALES', 0, 0))
  addLabelMerge(rows.length - 1)

  // ── Row 25 (L26): TOTAL GENERAL ──
  rows.push(dataRow('TOTAL DETTES FISCALES ET SOCIALES', 0, 0))
  addLabelMerge(rows.length - 1)

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 45 — NOTE 19 : AUTRES DETTES ET PROVISIONS POUR RISQUES CT
//   11 columns (A=0 to K=10)
// ────────────────────────────────────────────────────────────────────────────

function buildNote19(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 11
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 41 -']))
  merges.push(m(0, 0, 0, 10)) // A1:K1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [9, 'NOTE 19\nSYSTEME NORMAL']))
  merges.push(m(1, 9, 1, 10)) // J2:K2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C, {
    labelCol: 0,
    valueCol: 2,
    sigleCol: 9,
    sigleValCol: 10,
  }))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 19 : AUTRES DETTES ET PROVISIONS POUR RISQUES ET CHARGES A COURT TERME']))
  merges.push(m(6, 0, 6, 10)) // A7:K7

  // ── Row 7 (L8): column headers ──
  const hdr = emptyRow(C)
  hdr[0] = 'LIBELLES'
  hdr[4] = 'Ann\u00e9e N'
  hdr[5] = 'Ann\u00e9e N-1'
  hdr[6] = 'Variation\nvaleur'
  hdr[7] = 'Variation\n%'
  hdr[8] = 'Dettes\n\u22641 an'
  hdr[9] = 'Dettes\n1-2 ans'
  hdr[10] = 'Dettes\n>2 ans'
  rows.push(hdr)
  merges.push(m(7, 0, 7, 3)) // A8:D8 - LIBELLES

  // ── Helper for data rows ──
  const dataRow = (label: string, eVal: number, fVal: number): Row => {
    const row = emptyRow(C)
    row[0] = label
    row[4] = eVal
    row[5] = fVal
    row[6] = eVal - fVal
    row[7] = variationPct(eVal, fVal)
    row[8] = 0
    row[9] = 0
    row[10] = 0
    return row
  }

  const addLabelMerge = (rowIdx: number): void => {
    merges.push(m(rowIdx, 0, rowIdx, 3))
  }

  // ════════════════════════════════════════════════════════════════════════
  // Section 1: Dettes associes (rows 8-14, L9-L15)
  // ════════════════════════════════════════════════════════════════════════

  const dettesAssocLabels = [
    'Organismes internationaux',
    'Apporteurs, op\u00e9rations en capital',
    'Associ\u00e9s, compte courant',
    'Associ\u00e9s, dividendes \u00e0 payer',
    'Groupe, comptes courants',
    'Autres dettes envers les associ\u00e9s',
  ]

  for (const label of dettesAssocLabels) {
    rows.push(dataRow(label, 0, 0))
    addLabelMerge(rows.length - 1)
  }

  // Row 14 (L15): TOTAL DETTES ASSOCIES
  rows.push(dataRow('TOTAL DETTES ASSOCIES', 0, 0))
  addLabelMerge(rows.length - 1)

  // ════════════════════════════════════════════════════════════════════════
  // Section 2: Créditeurs divers (rows 15-22, L16-L23)
  // ════════════════════════════════════════════════════════════════════════

  const crediteursDivLabels = [
    'Cr\u00e9diteurs divers',
    'Obligataires',
    'R\u00e9mun\u00e9rations des administrateurs',
    'Compte d\'affacturage',
    'Versements restant \u00e0 effectuer sur titres de placement',
    'Compte transitoire d\'ajustement',
    'Autres cr\u00e9diteurs divers',
  ]

  for (const label of crediteursDivLabels) {
    rows.push(dataRow(label, 0, 0))
    addLabelMerge(rows.length - 1)
  }

  // Row 22 (L23): TOTAL CREDITEURS DIVERS
  rows.push(dataRow('TOTAL CREDITEURS DIVERS', 0, 0))
  addLabelMerge(rows.length - 1)

  // ════════════════════════════════════════════════════════════════════════
  // Section 3: Comptes de liaison (rows 23-26, L24-L27)
  // ════════════════════════════════════════════════════════════════════════

  const comptesLiaisonLabels = [
    'Comptes permanents non bloqu\u00e9s',
    'Comptes de liaison charges et produits',
    'Comptes de liaison des soci\u00e9t\u00e9s en participation',
  ]

  for (const label of comptesLiaisonLabels) {
    rows.push(dataRow(label, 0, 0))
    addLabelMerge(rows.length - 1)
  }

  // Row 26 (L27): TOTAL COMPTES DE LIAISON
  rows.push(dataRow('TOTAL COMPTES DE LIAISON', 0, 0))
  addLabelMerge(rows.length - 1)

  // ── Row 27 (L28): TOTAL AUTRES DETTES ──
  rows.push(dataRow('TOTAL AUTRES DETTES', 0, 0))
  addLabelMerge(rows.length - 1)

  // ── Row 28 (L29): Provisions risques charges court terme ──
  const provRow = emptyRow(C)
  provRow[0] = 'Provisions pour risques et charges \u00e0 court terme (voir note 28)'
  provRow[4] = 0
  provRow[5] = 0
  provRow[6] = 0
  provRow[7] = 0
  provRow[8] = 0
  provRow[9] = 0
  provRow[10] = 0
  rows.push(provRow)
  addLabelMerge(rows.length - 1)

  return { rows, merges }
}

// ════════════════════════════════════════════════════════════════════════════
// Exports
// ════════════════════════════════════════════════════════════════════════════

export { buildNote16A, buildNote16B, buildNote16BBis, buildNote16C, buildNote17, buildNote18, buildNote19 }
