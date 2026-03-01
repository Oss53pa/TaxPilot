/**
 * build-56-notes-29to32.ts
 * Builders for sheets 56-59 of the SYSCOHADA liasse fiscale:
 *   - Sheet 56: NOTE 29 (8 cols)  - Charges et revenus financiers
 *   - Sheet 57: NOTE 30 (8 cols)  - Autres charges et produits HAO
 *   - Sheet 58: NOTE 31 (11 cols) - Répartition du résultat et autres éléments
 *   - Sheet 59: NOTE 32 (16 cols) - Production de l'exercice
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
// Sheet 56 — NOTE 29 : CHARGES ET REVENUS FINANCIERS
//   8 columns (A=0 to H=7)
// ────────────────────────────────────────────────────────────────────────────

function buildNote29(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 8
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 52 -']))
  merges.push(m(0, 0, 0, 7)) // A1:H1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [6, 'NOTE 29\nSYSTEME NORMAL']))
  merges.push(m(1, 6, 1, 7)) // G2:H2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 29 : CHARGES ET REVENUS FINANCIERS']))
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

  // ════════════════════════════════════════════════════════════════════════
  // Section A - Frais financiers (rows 8-18, L9-L19)
  // ════════════════════════════════════════════════════════════════════════

  const fraisLabels = [
    'Intérêts des emprunts',
    'Intérêts dans loyers de locations acquisition',
    'Escomptes accordés',
    'Autres intérêts',
    'Escomptes des effets de commerce',
    'Pertes de change financières',
    'Pertes sur cessions de titres de placement',
    'Malis provenant d\'attribution gratuite d\'actions au personnel salarié et aux dirigeants',
    'Pertes et charges sur risques financiers',
    'Charges pour dépréciation et provisions à court terme à caractère financier',
  ]

  for (const label of fraisLabels) {
    rows.push(dataRow(label, 0, 0))
    addLabelMerge(rows.length - 1)
  }

  // Row 18 (L19): SOUS TOTAL : FRAIS FINANCIERS (A) → SUM(F9:F18)
  rows.push(dataRow('SOUS TOTAL : FRAIS FINANCIERS (A)', 0, 0))
  addLabelMerge(rows.length - 1)

  // ════════════════════════════════════════════════════════════════════════
  // Section B - Revenus financiers (rows 19-28, L20-L29)
  // ════════════════════════════════════════════════════════════════════════

  const revenusLabels = [
    'Intérêts de prêts et créances diverses',
    'Revenus de participations et autres titres immobilisés',
    'Escomptes obtenus',
    'Revenus de placement',
    'Intérêts dans loyers de location-financement',
    'Gains de change financiers',
    'Gains sur cessions de titres de placement',
    'Gains sur risques financiers',
    'Reprises de charges pour dépréciation et provisions à court terme à caractère financier',
  ]

  for (const label of revenusLabels) {
    rows.push(dataRow(label, 0, 0))
    addLabelMerge(rows.length - 1)
  }

  // Row 28 (L29): SOUS TOTAL : REVENUS FINANCIERS (B) → SUM(F20:F28)
  rows.push(dataRow('SOUS TOTAL : REVENUS FINANCIERS (B)', 0, 0))
  addLabelMerge(rows.length - 1)

  // ── Row 29 (L30): RESULTAT FINANCIER (B) - (A) → F29-F19 ──
  rows.push(dataRow('SOUS TOTAL (contrôle) : RESULTAT FINANCIER (B) - (A)', 0, 0))
  addLabelMerge(rows.length - 1)

  // ── Comments L31-L40 (rows 30-39) ──
  rows.push(emptyRow(C))
  const cm = emptyRow(C)
  cm[0] = 'Commentaire : Faire un commentaire.'
  rows.push(cm)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 7))

  for (let i = 0; i < 8; i++) {
    rows.push(emptyRow(C))
  }

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 57 — NOTE 30 : AUTRES CHARGES ET PRODUITS HAO
//   8 columns (A=0 to H=7)
// ────────────────────────────────────────────────────────────────────────────

function buildNote30(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 8
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 53 -']))
  merges.push(m(0, 0, 0, 7)) // A1:H1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [6, 'NOTE 30\nSYSTEME NORMAL']))
  merges.push(m(1, 6, 1, 7)) // G2:H2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 30 : AUTRES CHARGES ET PRODUITS HAO']))
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

  // ════════════════════════════════════════════════════════════════════════
  // Section 1 - Charges HAO (rows 8-22, L9-L23)
  // ════════════════════════════════════════════════════════════════════════

  // Row 8 (L9): Charges HAO constatées header
  rows.push(dataRow('Charges HAO constatées (compte 831) à détailler :', 0, 0))
  addLabelMerge(rows.length - 1)

  // Rows 9-14 (L10-L15): 6 blank detail lines
  for (let i = 0; i < 6; i++) {
    rows.push(dataRow('    - ', 0, 0))
    addLabelMerge(rows.length - 1)
  }

  // Rows 15-21 (L16-L22): remaining charge items
  const chargesHaoLabels = [
    'Charges liées aux opérations de restructuration',
    'Pertes sur créances HAO',
    'Dons et libéralités accordés',
    'Abandons de créances consentis',
    'Charges pour dépréciations et provisions pour risques à court terme HAO',
    'Dotations hors activités ordinaires',
    'Participation des travailleurs',
  ]

  for (const label of chargesHaoLabels) {
    rows.push(dataRow(label, 0, 0))
    addLabelMerge(rows.length - 1)
  }

  // Row 22 (L23): SOUS TOTAL : AUTRES CHARGES HAO → SUM(F9:F22)
  rows.push(dataRow('SOUS TOTAL : AUTRES CHARGES HAO', 0, 0))
  addLabelMerge(rows.length - 1)

  // ════════════════════════════════════════════════════════════════════════
  // Section 2 - Produits HAO (rows 23-38, L24-L39)
  // ════════════════════════════════════════════════════════════════════════

  // Row 23 (L24): Produits HAO constatés header
  rows.push(dataRow('Produits HAO constatés (compte 841) à détailler :', 0, 0))
  addLabelMerge(rows.length - 1)

  // Rows 24-29 (L25-L30): 6 blank detail lines
  for (let i = 0; i < 6; i++) {
    rows.push(dataRow('    - ', 0, 0))
    addLabelMerge(rows.length - 1)
  }

  // Rows 30-37 (L31-L38): remaining produit items
  const produitsHaoLabels = [
    'Produits liés aux opérations de restructuration',
    'Indemnités et subventions HAO (entité agricole)',
    'Dons et libéralités obtenus',
    'Abandons de créances obtenus',
    'Transfert de charges H.A.O',
    'Reprises de charges pour dépréciations et provisions pour risques à court terme HAO',
    'Reprises des charges, provisions et dépréciations H.A.O',
    'Subventions d\'équilibre',
  ]

  for (const label of produitsHaoLabels) {
    rows.push(dataRow(label, 0, 0))
    addLabelMerge(rows.length - 1)
  }

  // Row 38 (L39): SOUS TOTAL : AUTRES PRODUITS HAO → SUM(F24:F38)
  rows.push(dataRow('SOUS TOTAL : AUTRES PRODUITS HAO', 0, 0))
  addLabelMerge(rows.length - 1)

  // ── Comments L40-L43 (rows 39-42) ──
  rows.push(emptyRow(C))
  const cm = emptyRow(C)
  cm[0] = 'Commentaire : Faire un commentaire.'
  rows.push(cm)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 7))

  rows.push(emptyRow(C))
  rows.push(emptyRow(C))

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 58 — NOTE 31 : REPARTITION DU RESULTAT ET AUTRES ELEMENTS
//   11 columns (A=0 to K=10)
// ────────────────────────────────────────────────────────────────────────────

function buildNote31(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 11
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 54 -']))
  merges.push(m(0, 0, 0, 10)) // A1:K1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [9, 'NOTE 31\nSYSTEME NORMAL']))
  merges.push(m(1, 9, 1, 10)) // J2:K2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C, {
    valueCol: 2,
    sigleCol: 9,
    sigleValCol: 10,
  }))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 31 : REPARTITION DU RESULTAT ET AUTRES ELEMENTS CARACTERISTIQUES DES CINQ DERNIERS EXERCICES']))
  merges.push(m(6, 0, 6, 10)) // A7:K7

  // ── Row 7 (L8): column headers line 1 ──
  const hdr1 = emptyRow(C)
  hdr1[0] = 'EXERCICES CONCERNES (1)'
  hdr1[6] = 'N'
  hdr1[7] = 'N-1'
  hdr1[8] = 'N - 2'
  hdr1[9] = 'N - 3'
  hdr1[10] = 'N - 4'
  rows.push(hdr1)
  merges.push(m(7, 0, 7, 5)) // A8:F8
  merges.push(m(7, 6, 8, 6)) // G8:G9 - N
  merges.push(m(7, 7, 8, 7)) // H8:H9 - N-1
  merges.push(m(7, 8, 8, 8)) // I8:I9 - N-2
  merges.push(m(7, 9, 8, 9)) // J8:J9 - N-3
  merges.push(m(7, 10, 8, 10)) // K8:K9 - N-4

  // ── Row 8 (L9): column headers line 2 ──
  const hdr2 = emptyRow(C)
  hdr2[0] = 'NATURE DES INDICATIONS'
  rows.push(hdr2)
  merges.push(m(8, 0, 8, 5)) // A9:F9

  // ── Helper for data rows ──
  const dataRow = (label: string, gVal: number): Row => {
    const row = emptyRow(C)
    row[0] = label
    row[6] = gVal
    row[7] = 0
    row[8] = 0
    row[9] = 0
    row[10] = 0
    return row
  }

  const addLabelMerge = (rowIdx: number): void => {
    merges.push(m(rowIdx, 0, rowIdx, 5)) // A:F merge for labels
  }

  // ════════════════════════════════════════════════════════════════════════
  // Section 1: STRUCTURE DU CAPITAL (rows 9-15, L10-L16)
  // ════════════════════════════════════════════════════════════════════════

  // Row 9 (L10): header → SUM(G11:G16)
  rows.push(dataRow('STRUCTURE DU CAPITAL', 0))
  addLabelMerge(rows.length - 1)

  // Rows 10-15 (L11-L16): detail lines
  const capitalLabels = [
    'Capital social',
    'Actions ordinaires',
    'Actions à dividendes prioritaires (A.D.P) sans droit de vote',
    'Actions nouvelles à émettre :',
    '- par conversion d\'obligations',
    '- par exercice de droits de souscription',
  ]

  for (const label of capitalLabels) {
    rows.push(dataRow(label, 0))
    addLabelMerge(rows.length - 1)
  }

  // ════════════════════════════════════════════════════════════════════════
  // Section 2: OPERATIONS ET RESULTATS (rows 16-21, L17-L22)
  // ════════════════════════════════════════════════════════════════════════

  // Row 16 (L17): header → SUM(G18:G22)
  rows.push(dataRow('OPERATIONS ET RESULTATS', 0))
  addLabelMerge(rows.length - 1)

  // Rows 17-21 (L18-L22): detail lines
  const operationsLabels = [
    'Chiffre d\'affaires hors taxes',
    'Résultat des activités ordinaires (R.A.O)',
    'Participation des travailleurs aux bénéfices',
    'Impôt sur le résultat',
    'Résultat net (4)',
  ]

  for (const label of operationsLabels) {
    rows.push(dataRow(label, 0))
    addLabelMerge(rows.length - 1)
  }

  // ════════════════════════════════════════════════════════════════════════
  // Section 3: RESULTAT ET DIVIDENDE (rows 22-24, L23-L25)
  // ════════════════════════════════════════════════════════════════════════

  // Row 22 (L23): header → SUM(G24:G25)
  rows.push(dataRow('RESULTAT ET DIVIDENDE', 0))
  addLabelMerge(rows.length - 1)

  // Rows 23-24 (L24-L25): detail lines
  const dividendeLabels = [
    'Résultat distribué (5)',
    'Dividende attribué à chaque action',
  ]

  for (const label of dividendeLabels) {
    rows.push(dataRow(label, 0))
    addLabelMerge(rows.length - 1)
  }

  // ════════════════════════════════════════════════════════════════════════
  // Section 4: PERSONNEL ET POLITIQUE SALARIALE (rows 25-30, L26-L31)
  // ════════════════════════════════════════════════════════════════════════

  // Row 25 (L26): header → SUM(G27:G31)
  rows.push(dataRow('PERSONNEL ET POLITIQUE SALARIALE', 0))
  addLabelMerge(rows.length - 1)

  // Rows 26-30 (L27-L31): detail lines
  const personnelLabels = [
    'Effectif moyen des travailleurs',
    'Masse salariale',
    'Personnel extérieur',
    'Rémunérations d\'intermédiaires et de conseils',
    'Dirigeants : rémunérations brutes allouées',
  ]

  for (const label of personnelLabels) {
    rows.push(dataRow(label, 0))
    addLabelMerge(rows.length - 1)
  }

  // ── Empty separator ──
  rows.push(emptyRow(C))

  // ── Footnotes L33-L37 (rows 32-36) ──
  const fn1 = emptyRow(C)
  fn1[0] = '(1) Indiquer les dates de début et de fin de chaque exercice'
  rows.push(fn1)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 10))

  const fn2 = emptyRow(C)
  fn2[0] = '(2) Indiquer le nombre de mois de chaque exercice'
  rows.push(fn2)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 10))

  const fn3 = emptyRow(C)
  fn3[0] = '(3) Le résultat net correspond au résultat net des sociétés ne cotant pas en bourse'
  rows.push(fn3)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 10))

  const fn4 = emptyRow(C)
  fn4[0] = '(4) Le résultat net est le résultat après impôt, y compris les éléments extraordinaires'
  rows.push(fn4)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 10))

  const fn5 = emptyRow(C)
  fn5[0] = '(5) Y compris les acomptes sur dividendes'
  rows.push(fn5)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 10))

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 59 — NOTE 32 : PRODUCTION DE L'EXERCICE
//   16 columns (A=0 to P=15) — Wide table
// ────────────────────────────────────────────────────────────────────────────

function buildNote32(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 16
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 55 -']))
  merges.push(m(0, 0, 0, 15)) // A1:P1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [14, 'NOTE 32\nSYSTEME NORMAL']))
  merges.push(m(1, 14, 1, 15)) // O2:P2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C, {
    valueCol: 2,
    sigleCol: 13,
    sigleValCol: 14,
  }))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 32 : PRODUCTION DE L\'EXERCICE']))
  merges.push(m(6, 0, 6, 15)) // A7:P7

  // ════════════════════════════════════════════════════════════════════════
  // Complex header spanning 3 rows (rows 7-9, L8-L10)
  // ════════════════════════════════════════════════════════════════════════

  // ── Row 7 (L8): header line 1 ──
  const h1 = emptyRow(C)
  h1[0] = 'DESIGNATION DU PRODUIT'
  h1[3] = 'UNITE DE\nQUANTITE\nCHOISIE'
  h1[4] = 'PRODUCTION VENDUE\nDANS LE PAYS'
  h1[6] = 'PRODUCTION VENDUE\nDANS LES AUTRES\nPAYS DE L\'OHADA'
  h1[8] = 'PRODUCTION VENDUE\nHORS OHADA'
  h1[10] = 'PRODUCTION\nIMMOBILISEE'
  h1[12] = 'STOCK OUVERTURE\nDE L\'EXERCICE'
  h1[14] = 'STOCK CLOTURE\nDE L\'EXERCICE'
  rows.push(h1)
  merges.push(m(7, 0, 9, 2))   // A8:C10 - DESIGNATION DU PRODUIT
  merges.push(m(7, 3, 9, 3))   // D8:D10 - UNITE DE QUANTITE CHOISIE
  merges.push(m(7, 4, 8, 5))   // E8:F9  - PRODUCTION VENDUE DANS LE PAYS
  merges.push(m(7, 6, 8, 7))   // G8:H9  - PRODUCTION VENDUE AUTRES PAYS OHADA
  merges.push(m(7, 8, 8, 9))   // I8:J9  - PRODUCTION VENDUE HORS OHADA
  merges.push(m(7, 10, 8, 11)) // K8:L9  - PRODUCTION IMMOBILISEE
  merges.push(m(7, 12, 8, 13)) // M8:N9  - STOCK OUVERTURE
  merges.push(m(7, 14, 8, 15)) // O8:P9  - STOCK CLOTURE

  // ── Row 8 (L9): header line 2 (empty, merged with line 1 above) ──
  rows.push(emptyRow(C))

  // ── Row 9 (L10): header line 3 - Quantité/Valeur sub-headers ──
  const h3 = emptyRow(C)
  h3[4] = 'Quantité'
  h3[5] = 'Valeur'
  h3[6] = 'Quantité'
  h3[7] = 'Valeur'
  h3[8] = 'Quantité'
  h3[9] = 'Valeur'
  h3[10] = 'Quantité'
  h3[11] = 'Valeur'
  h3[12] = 'Quantité'
  h3[13] = 'Valeur'
  h3[14] = 'Quantité'
  h3[15] = 'Valeur'
  rows.push(h3)

  // ════════════════════════════════════════════════════════════════════════
  // 17 empty data rows (rows 10-26, L11-L27)
  // ════════════════════════════════════════════════════════════════════════

  for (let i = 0; i < 17; i++) {
    const row = emptyRow(C)
    row[0] = null   // Designation
    row[3] = null   // Unité
    row[4] = 0      // Qté pays
    row[5] = 0      // Val pays
    row[6] = 0      // Qté OHADA
    row[7] = 0      // Val OHADA
    row[8] = 0      // Qté hors OHADA
    row[9] = 0      // Val hors OHADA
    row[10] = 0     // Qté immob
    row[11] = 0     // Val immob
    row[12] = 0     // Qté stock ouv
    row[13] = 0     // Val stock ouv
    row[14] = 0     // Qté stock clôt
    row[15] = 0     // Val stock clôt
    rows.push(row)
    merges.push(m(10 + i, 0, 10 + i, 2)) // A:C merge for designation
  }

  // ── Row 27 (L28): empty separator ──
  rows.push(emptyRow(C))

  // ── Row 28 (L29): NON VENTILE (1) ──
  const nvRow = emptyRow(C)
  nvRow[0] = 'NON VENTILE (1)'
  nvRow[4] = 0
  nvRow[5] = 0
  nvRow[6] = 0
  nvRow[7] = 0
  nvRow[8] = 0
  nvRow[9] = 0
  nvRow[10] = 0
  nvRow[11] = 0
  nvRow[12] = 0
  nvRow[13] = 0
  nvRow[14] = 0
  nvRow[15] = 0
  rows.push(nvRow)
  merges.push(m(28, 0, 28, 3)) // A29:D29

  // ── Row 29 (L30): TOTAL ──
  const totalRow = emptyRow(C)
  totalRow[0] = 'TOTAL'
  totalRow[4] = 0   // SUM col E
  totalRow[5] = 0   // SUM col F
  totalRow[6] = 0   // SUM col G
  totalRow[7] = 0   // SUM col H
  totalRow[8] = 0   // SUM col I
  totalRow[9] = 0   // SUM col J
  totalRow[10] = 0  // SUM col K
  totalRow[11] = 0  // SUM col L
  totalRow[12] = 0  // SUM col M
  totalRow[13] = 0  // SUM col N
  totalRow[14] = 0  // SUM col O
  totalRow[15] = 0  // SUM col P
  rows.push(totalRow)
  merges.push(m(29, 0, 29, 3)) // A30:D30

  // ── Row 30 (L31): footnote ──
  const fn = emptyRow(C)
  fn[0] = '(1) : Ventiler si possible entre les différentes catégories de produits ci-dessus.'
  rows.push(fn)
  merges.push(m(30, 0, 30, 15)) // A31:P31

  return { rows, merges }
}

// ════════════════════════════════════════════════════════════════════════════
// Exports
// ════════════════════════════════════════════════════════════════════════════

export { buildNote29, buildNote30, buildNote31, buildNote32 }
