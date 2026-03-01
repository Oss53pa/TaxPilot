/**
 * build-46-notes-20to24.ts
 * Builders for sheets 46-50 of the SYSCOHADA liasse fiscale:
 *   - Sheet 46: NOTE 20 (8 cols)  - Banques, credit d'escompte et de tresorerie
 *   - Sheet 47: NOTE 21 (12 cols) - Chiffre d'affaires et autres produits
 *   - Sheet 48: NOTE 22 (8 cols)  - Achats
 *   - Sheet 49: NOTE 23 (8 cols)  - Transports
 *   - Sheet 50: NOTE 24 (8 cols)  - Services exterieurs
 */

import { SheetData, Row, emptyRow, rowAt, m, headerRows, variationPct } from './helpers'
import type { EntrepriseData, ExerciceData, BalanceEntry } from './helpers'

// ── EUR conversion rate ──
const EUR_RATE = 655.957

// ────────────────────────────────────────────────────────────────────────────
// Sheet 46 — NOTE 20 : BANQUES, CREDIT D'ESCOMPTE ET DE TRESORERIE
//   8 columns (A=0 to H=7)
// ────────────────────────────────────────────────────────────────────────────

function buildNote20(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 8
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 42 -']))
  merges.push(m(0, 0, 0, 7)) // A1:H1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [6, 'NOTE 20\nSYSTEME NORMAL']))
  merges.push(m(1, 6, 1, 7)) // G2:H2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C))
  merges.push(m(5, 2, 5, 3)) // C6:D6 - NTD value

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 20 : BANQUES, CREDIT D\'ESCOMPTE ET DE TRESORERIE']))
  merges.push(m(6, 0, 6, 7)) // A7:H7

  // ── Row 7 (L8): column headers ──
  const hdr = emptyRow(C)
  hdr[0] = 'Lib\u00e9ll\u00e9s'
  hdr[5] = 'Ann\u00e9e N'
  hdr[6] = 'Ann\u00e9e N-1'
  hdr[7] = 'Variation\nen %'
  rows.push(hdr)
  merges.push(m(7, 0, 7, 4)) // A8:E8 - Libellés

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
    merges.push(m(rowIdx, 0, rowIdx, 4))
  }

  // ════════════════════════════════════════════════════════════════════════
  // Section 1: Banques, credits d'escompte (rows 8-10, L9-L11)
  // ════════════════════════════════════════════════════════════════════════

  // Row 8 (L9)
  rows.push(dataRow('Escomptes de cr\u00e9dit de campagne', 0, 0))
  addLabelMerge(rows.length - 1)

  // Row 9 (L10)
  rows.push(dataRow('Escomptes de cr\u00e9dit ordinaires', 0, 0))
  addLabelMerge(rows.length - 1)

  // Row 10 (L11): TOTAL ESCOMPTE
  rows.push(dataRow('TOTAL: BANQUES, CREDITS D\'ESCOMPTE ET DE TRESORERIE', 0, 0))
  addLabelMerge(rows.length - 1)

  // ════════════════════════════════════════════════════════════════════════
  // Section 2: Banques, credits de tresorerie (rows 11-16, L12-L17)
  // ════════════════════════════════════════════════════════════════════════

  // Row 11 (L12)
  rows.push(dataRow('Banques locales', 0, 0))
  addLabelMerge(rows.length - 1)

  // Row 12 (L13)
  rows.push(dataRow('Banques autres \u00e9tats r\u00e9gion', 0, 0))
  addLabelMerge(rows.length - 1)

  // Row 13 (L14)
  rows.push(dataRow('Autres Banques', 0, 0))
  addLabelMerge(rows.length - 1)

  // Row 14 (L15)
  rows.push(dataRow('Banques int\u00e9r\u00eats courus', 0, 0))
  addLabelMerge(rows.length - 1)

  // Row 15 (L16)
  rows.push(dataRow('Cr\u00e9dit de tr\u00e9sorerie', 0, 0))
  addLabelMerge(rows.length - 1)

  // Row 16 (L17): TOTAL TRESORERIE
  rows.push(dataRow('TOTAL: BANQUES, CREDITS DE TRESORERIE', 0, 0))
  addLabelMerge(rows.length - 1)

  // ── Row 17 (L18): TOTAL GENERAL ──
  rows.push(dataRow('TOTAL GENERAL', 0, 0))
  addLabelMerge(rows.length - 1)

  // ── Rows 18-22 (L19-L23): comment rows ──
  for (let i = 0; i < 5; i++) {
    rows.push(emptyRow(C))
  }

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 47 — NOTE 21 : CHIFFRE D'AFFAIRES ET AUTRES PRODUITS
//   12 columns (A=0 to L=11)
// ────────────────────────────────────────────────────────────────────────────

function buildNote21(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 12
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 43 -']))
  merges.push(m(0, 0, 0, 11)) // A1:L1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [10, 'NOTE 21\nSYSTEME NORMAL']))
  merges.push(m(1, 10, 1, 11)) // K2:L2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C, {
    labelCol: 0,
    valueCol: 2,
    sigleCol: 10,
    sigleValCol: 11,
  }))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 21 : CHIFFRE D\'AFFAIRES ET AUTRES PRODUITS']))
  merges.push(m(6, 0, 6, 11)) // A7:L7

  // ── Row 7 (L8): column headers ──
  const hdr = emptyRow(C)
  hdr[0] = 'Lib\u00e9ll\u00e9s'
  hdr[5] = 'Ann\u00e9e N'
  hdr[6] = 'Ann\u00e9e N-1'
  hdr[7] = 'Variation\nen %'
  // col 8 (I) is empty gap
  hdr[9] = 'Ann\u00e9e N (EUR)'
  hdr[10] = 'Ann\u00e9e N-1 (EUR)'
  hdr[11] = 'Variation\nen %'
  rows.push(hdr)
  merges.push(m(7, 0, 7, 4)) // A8:E8 - Libellés

  // ── Helper for data rows with EUR conversion ──
  const dataRow = (label: string, fVal: number, gVal: number): Row => {
    const row = emptyRow(C)
    row[0] = label
    row[5] = fVal
    row[6] = gVal
    row[7] = variationPct(fVal, gVal)
    row[8] = null // gap column
    row[9] = fVal / EUR_RATE
    row[10] = gVal / EUR_RATE
    row[11] = variationPct(fVal, gVal)
    return row
  }

  const addLabelMerge = (rowIdx: number): void => {
    merges.push(m(rowIdx, 0, rowIdx, 4))
  }

  // ════════════════════════════════════════════════════════════════════════
  // Section 1: Ventes marchandises (rows 8-13, L9-L14)
  // ════════════════════════════════════════════════════════════════════════

  const ventesMarLabels = [
    'Ventes de marchandises dans l\'Etat partie',
    'Ventes de marchandises dans les autres Etats parties de la R\u00e9gion (2)',
    'Ventes de marchandises hors R\u00e9gion (2)',
    'Ventes de marchandises groupe',
    'Ventes de marchandises sur internet',
  ]

  for (const label of ventesMarLabels) {
    rows.push(dataRow(label, 0, 0))
    addLabelMerge(rows.length - 1)
  }

  // Row 13 (L14): TOTAL VENTES MARCHANDISES
  rows.push(dataRow('TOTAL : VENTES MARCHANDISES', 0, 0))
  addLabelMerge(rows.length - 1)

  // ════════════════════════════════════════════════════════════════════════
  // Section 2: Ventes produits fabriques (rows 14-19, L15-L20)
  // ════════════════════════════════════════════════════════════════════════

  const ventesProdLabels = [
    'Ventes de produits fabriqu\u00e9s dans l\'Etat partie',
    'Ventes de produits fabriqu\u00e9s dans les autres Etats parties de la R\u00e9gion (2)',
    'Ventes de produits fabriqu\u00e9s hors R\u00e9gion (2)',
    'Ventes de produits fabriqu\u00e9s groupe',
    'Ventes de produits fabriqu\u00e9s sur internet',
  ]

  for (const label of ventesProdLabels) {
    rows.push(dataRow(label, 0, 0))
    addLabelMerge(rows.length - 1)
  }

  // Row 19 (L20): TOTAL VENTES PRODUITS FABRIQUES
  rows.push(dataRow('TOTAL : VENTES PRODUITS FABRIQUES', 0, 0))
  addLabelMerge(rows.length - 1)

  // ════════════════════════════════════════════════════════════════════════
  // Section 3: Ventes travaux et services (rows 20-25, L21-L26)
  // ════════════════════════════════════════════════════════════════════════

  const ventesTraLabels = [
    'Ventes de travaux et services dans l\'Etat partie',
    'Ventes de travaux et services dans les autres Etats parties de la R\u00e9gion (2)',
    'Ventes de travaux et services hors R\u00e9gion (2)',
    'Ventes de travaux et services groupe',
    'Ventes de travaux et services sur internet',
  ]

  for (const label of ventesTraLabels) {
    rows.push(dataRow(label, 0, 0))
    addLabelMerge(rows.length - 1)
  }

  // Row 25 (L26): TOTAL VENTES TRAVAUX ET SERVICES
  rows.push(dataRow('TOTAL : VENTES TRAVAUX ET SERVICES', 0, 0))
  addLabelMerge(rows.length - 1)

  // ════════════════════════════════════════════════════════════════════════
  // Section 4: Produits accessoires (rows 26-34, L27-L35)
  // ════════════════════════════════════════════════════════════════════════

  // Row 26 (L27): Produits accessoires label
  rows.push(dataRow('Produits accessoires', 0, 0))
  addLabelMerge(rows.length - 1)

  // Rows 27-34 (L28-L35): blank detail rows
  for (let i = 0; i < 8; i++) {
    rows.push(dataRow('', 0, 0))
    addLabelMerge(rows.length - 1)
  }

  // ════════════════════════════════════════════════════════════════════════
  // Section 5: Totals (rows 35-40, L36-L41)
  // ════════════════════════════════════════════════════════════════════════

  // Row 35 (L36): TOTAL CHIFFRES D'AFFAIRES
  rows.push(dataRow('TOTAL : CHIFFRES D\'AFFAIRES', 0, 0))
  addLabelMerge(rows.length - 1)

  // Row 36 (L37): Production immobilisee
  rows.push(dataRow('Production immobilis\u00e9e', 0, 0))
  addLabelMerge(rows.length - 1)

  // Row 37 (L38): Subventions d'exploitation
  rows.push(dataRow('Subventions d\'exploitation', 0, 0))
  addLabelMerge(rows.length - 1)

  // Row 38 (L39): Autres produits
  rows.push(dataRow('Autres produits (1)', 0, 0))
  addLabelMerge(rows.length - 1)

  // Row 39 (L40): TOTAL AUTRES PRODUITS
  rows.push(dataRow('TOTAL : AUTRES PRODUITS', 0, 0))
  addLabelMerge(rows.length - 1)

  // Row 40 (L41): TOTAL
  rows.push(dataRow('TOTAL', 0, 0))
  addLabelMerge(rows.length - 1)

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 48 — NOTE 22 : ACHATS
//   8 columns (A=0 to H=7)
// ────────────────────────────────────────────────────────────────────────────

function buildNote22(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 8
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 44 -']))
  merges.push(m(0, 0, 0, 7)) // A1:H1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [6, 'NOTE 22\nSYSTEME NORMAL']))
  merges.push(m(1, 6, 1, 7)) // G2:H2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C))
  merges.push(m(5, 2, 5, 3)) // C6:D6 - NTD value

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 22 : ACHATS']))
  merges.push(m(6, 0, 6, 7)) // A7:H7

  // ── Row 7 (L8): column headers ──
  const hdr = emptyRow(C)
  hdr[0] = 'Lib\u00e9ll\u00e9s'
  hdr[5] = 'Ann\u00e9e N'
  hdr[6] = 'Ann\u00e9e N-1'
  hdr[7] = 'Variation\nen %'
  rows.push(hdr)
  merges.push(m(7, 0, 7, 4)) // A8:E8 - Libellés

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
    merges.push(m(rowIdx, 0, rowIdx, 4))
  }

  // ════════════════════════════════════════════════════════════════════════
  // Section 1: Achats de marchandises (rows 8-12, L9-L13)
  // ════════════════════════════════════════════════════════════════════════

  const achatsMarLabels = [
    'Achats de marchandises dans l\'Etat partie',
    'Achats de marchandises dans les autres Etats parties de la R\u00e9gion',
    'Achats de marchandises hors R\u00e9gion',
    'Achats de marchandises groupe',
  ]

  for (const label of achatsMarLabels) {
    rows.push(dataRow(label, 0, 0))
    addLabelMerge(rows.length - 1)
  }

  // Row 12 (L13): TOTAL ACHATS DE MARCHANDISES
  rows.push(dataRow('TOTAL : ACHATS DE MARCHANDISES', 0, 0))
  addLabelMerge(rows.length - 1)

  // ════════════════════════════════════════════════════════════════════════
  // Section 2: Achats matieres premieres (rows 13-17, L14-L18)
  // ════════════════════════════════════════════════════════════════════════

  const achatsMatLabels = [
    'Achats de mati\u00e8res premi\u00e8res dans l\'Etat partie',
    'Achats de mati\u00e8res premi\u00e8res dans les autres Etats parties de la R\u00e9gion',
    'Achats de mati\u00e8res premi\u00e8res hors R\u00e9gion',
    'Achats de mati\u00e8res premi\u00e8res groupe',
  ]

  for (const label of achatsMatLabels) {
    rows.push(dataRow(label, 0, 0))
    addLabelMerge(rows.length - 1)
  }

  // Row 17 (L18): TOTAL ACHATS DE MATIERES PREMIERES
  rows.push(dataRow('TOTAL : ACHATS DE MATIERES PREMIERES', 0, 0))
  addLabelMerge(rows.length - 1)

  // ════════════════════════════════════════════════════════════════════════
  // Section 3: Autres achats (rows 18-32, L19-L33)
  // ════════════════════════════════════════════════════════════════════════

  const autresAchatsLabels = [
    'Mati\u00e8res et fournitures consommables',
    'Mati\u00e8res et fournitures d\'emballages',
    'Mati\u00e8res et fournitures non stock\u00e9es (eau, \u00e9lectricit\u00e9, gaz)',
    'Fournitures d\'entretien',
    'Fournitures de bureau',
    'Petit mat\u00e9riel et outillage',
    'Etudes, prestations, exp\u00e9rimentations',
    'Achats de sous-traitance',
    'Achats de petit \u00e9quipement',
    'Rabais, remises et ristournes obtenus sur achats',
    'Variation de stocks de marchandises',
    'Variation de stocks de mati\u00e8res premi\u00e8res',
    'Variation de stocks d\'autres approvisionnements',
    'Variation de stocks d\'emballages',
  ]

  for (const label of autresAchatsLabels) {
    rows.push(dataRow(label, 0, 0))
    addLabelMerge(rows.length - 1)
  }

  // Row 32 (L33): TOTAL AUTRES ACHATS
  rows.push(dataRow('TOTAL : AUTRES ACHATS', 0, 0))
  addLabelMerge(rows.length - 1)

  // ── Rows 33-38 (L34-L39): comment rows ──
  for (let i = 0; i < 6; i++) {
    rows.push(emptyRow(C))
  }

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 49 — NOTE 23 : TRANSPORTS
//   8 columns (A=0 to H=7)
// ────────────────────────────────────────────────────────────────────────────

function buildNote23(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 8
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 45 -']))
  merges.push(m(0, 0, 0, 7)) // A1:H1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [6, 'NOTE 23\nSYSTEME NORMAL']))
  merges.push(m(1, 6, 1, 7)) // G2:H2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C))
  merges.push(m(5, 2, 5, 3)) // C6:D6 - NTD value

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 23 : TRANSPORTS']))
  merges.push(m(6, 0, 6, 7)) // A7:H7

  // ── Row 7 (L8): column headers ──
  const hdr = emptyRow(C)
  hdr[0] = 'Lib\u00e9ll\u00e9s'
  hdr[5] = 'Ann\u00e9e N'
  hdr[6] = 'Ann\u00e9e N-1'
  hdr[7] = 'Variation\nen %'
  rows.push(hdr)
  merges.push(m(7, 0, 7, 4)) // A8:E8 - Libellés

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
    merges.push(m(rowIdx, 0, rowIdx, 4))
  }

  // ════════════════════════════════════════════════════════════════════════
  // Data rows (rows 8-14, L9-L15)
  // ════════════════════════════════════════════════════════════════════════

  const transportsLabels = [
    'Transports sur ventes',
    'Transports pour le compte de tiers',
    'Transport du personnel',
    'Transports de plis',
    'Voyage d\u00e9placement (transport)',
    'Transport entre \u00e9tablissements ou chantiers',
    'Transports administratifs',
  ]

  for (const label of transportsLabels) {
    rows.push(dataRow(label, 0, 0))
    addLabelMerge(rows.length - 1)
  }

  // Row 15 (L16): TOTAL
  rows.push(dataRow('TOTAL', 0, 0))
  addLabelMerge(rows.length - 1)

  // ── Rows 16-19 (L17-L20): comment rows ──
  for (let i = 0; i < 4; i++) {
    rows.push(emptyRow(C))
  }

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 50 — NOTE 24 : SERVICES EXTERIEURS
//   8 columns (A=0 to H=7)
// ────────────────────────────────────────────────────────────────────────────

function buildNote24(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 8
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 46 -']))
  merges.push(m(0, 0, 0, 7)) // A1:H1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [6, 'NOTE 24\nSYSTEME NORMAL']))
  merges.push(m(1, 6, 1, 7)) // G2:H2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C))
  merges.push(m(5, 2, 5, 3)) // C6:D6 - NTD value

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 24 : SERVICES EXTERIEURS']))
  merges.push(m(6, 0, 6, 7)) // A7:H7

  // ── Row 7 (L8): column headers ──
  const hdr = emptyRow(C)
  hdr[0] = 'Lib\u00e9ll\u00e9s'
  hdr[5] = 'Ann\u00e9e N'
  hdr[6] = 'Ann\u00e9e N-1'
  hdr[7] = 'Variation\nen %'
  rows.push(hdr)
  merges.push(m(7, 0, 7, 4)) // A8:E8 - Libellés

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
    merges.push(m(rowIdx, 0, rowIdx, 4))
  }

  // ════════════════════════════════════════════════════════════════════════
  // Data rows (rows 8-22, L9-L23)
  // ════════════════════════════════════════════════════════════════════════

  const servicesLabels = [
    'Sous-traitance g\u00e9n\u00e9rale',
    'Locations et charges locatives',
    'Redevances de location acquisition',
    'Entretien, r\u00e9parations et maintenance',
    'Primes d\'assurance',
    'Etudes, recherches et documentation',
    'Publicit\u00e9, publications, relations publiques',
    'Frais de t\u00e9l\u00e9communications',
    'Frais bancaires',
    'R\u00e9mun\u00e9rations d\'interm\u00e9diaires et de conseils',
    'Frais de formation du personnel',
    'Redevances pour brevets, licences, logiciels, concession\net droits similaires',
    'Cotisations',
    'R\u00e9mun\u00e9rations de personnel ext\u00e9rieur \u00e0 l\'entit\u00e9',
    'Autres charges externes',
  ]

  for (const label of servicesLabels) {
    rows.push(dataRow(label, 0, 0))
    addLabelMerge(rows.length - 1)
  }

  // Row 23 (L24): TOTAL
  rows.push(dataRow('TOTAL', 0, 0))
  addLabelMerge(rows.length - 1)

  // ── Rows 24-27 (L25-L28): comment rows ──
  for (let i = 0; i < 4; i++) {
    rows.push(emptyRow(C))
  }

  return { rows, merges }
}

// ════════════════════════════════════════════════════════════════════════════
// Exports
// ════════════════════════════════════════════════════════════════════════════

export { buildNote20, buildNote21, buildNote22, buildNote23, buildNote24 }
