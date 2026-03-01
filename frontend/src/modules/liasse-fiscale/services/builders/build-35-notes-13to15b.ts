/**
 * build-35-notes-13to15b.ts
 * Builders for sheets 35-38 of the SYSCOHADA liasse fiscale:
 *   - Sheet 35: NOTE 13  (12 cols) - Capital
 *   - Sheet 36: NOTE 14  (8 cols)  - Primes et Réserves
 *   - Sheet 37: NOTE 15A (10 cols) - Subventions d'investissement et Provisions réglementées
 *   - Sheet 38: NOTE 15B (11 cols) - Autres fonds propres
 */

import { SheetData, Row, emptyRow, rowAt, m, headerRows, variationPct } from './helpers'
import type { EntrepriseData, ExerciceData, BalanceEntry } from './helpers'

// ────────────────────────────────────────────────────────────────────────────
// Sheet 35 — NOTE 13 : CAPITAL
//   12 columns (A=0 to L=11)
// ────────────────────────────────────────────────────────────────────────────

function buildNote13(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 12
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 31 -']))
  merges.push(m(0, 0, 0, 11)) // A1:L1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [10, 'NOTE 13\nSYSTEME NORMAL']))
  merges.push(m(1, 10, 1, 11)) // K2:L2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C, {
    labelCol: 0,
    valueCol: 2,
    sigleCol: 10,
    sigleValCol: 11,
  }))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 13 : CAPITAL']))
  merges.push(m(6, 0, 6, 11)) // A7:L7

  // ── Row 7 (L8): Valeur nominale ──
  const r7 = emptyRow(C)
  r7[8] = 'Valeur nominale des actions ou parts :'
  r7[11] = 10000
  rows.push(r7)
  merges.push(m(7, 8, 7, 10)) // I8:K8

  // ── Row 8 (L9): Column headers ──
  const r8 = emptyRow(C)
  r8[0] = 'Nom et prénoms ou raison sociale'
  r8[4] = 'N° de compte contribuable'
  r8[5] = 'Nationalité'
  r8[6] = 'Autres nationalités à préciser'
  r8[7] = 'Pays de résidence'
  r8[8] = 'Nature des\nactions ou parts\n(Ordinaires ou\npréférences)'
  r8[9] = 'Nombre'
  r8[10] = 'Montant total'
  r8[11] = 'Cessions ou\nremboursements\nen cours\nd\'exercice'
  rows.push(r8)
  merges.push(m(8, 0, 8, 3)) // A9:D9

  // ── Rows 9-23 (L10-L24): 15 shareholder rows ──
  for (let i = 0; i < 15; i++) {
    const row = emptyRow(C)
    // All values 0 by default
    row[0] = null  // Nom
    row[4] = null  // NCC
    row[5] = null  // Nationalité
    row[6] = null  // Autres nationalités
    row[7] = null  // Pays de résidence
    row[8] = null  // Nature des actions
    row[9] = 0     // Nombre
    row[10] = 0    // Montant total = valeur nominale * nombre
    row[11] = 0    // Cessions
    rows.push(row)
    merges.push(m(9 + i, 0, 9 + i, 3)) // A:D merge for each row
  }

  // ── Row 24 (L25): Apporteurs, capital non appelé ──
  const r24 = emptyRow(C)
  r24[0] = 'Apporteurs, capital non appelé'
  r24[10] = 0
  rows.push(r24)
  merges.push(m(24, 0, 24, 3)) // A25:D25

  // ── Row 25 (L26): TOTAL ──
  const r25 = emptyRow(C)
  r25[0] = 'TOTAL'
  r25[10] = 0 // SUM(K10:K25)
  rows.push(r25)
  merges.push(m(25, 0, 25, 8)) // A26:I26

  // ── Commentaire ──
  rows.push(emptyRow(C))
  const cm = emptyRow(C)
  cm[0] = 'Commentaire :'
  rows.push(cm)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 5))

  rows.push(emptyRow(C))
  rows.push(emptyRow(C))

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 36 — NOTE 14 : PRIMES ET RESERVES
//   8 columns (A=0 to H=7)
// ────────────────────────────────────────────────────────────────────────────

function buildNote14(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 8
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 32 -']))
  merges.push(m(0, 0, 0, 7)) // A1:H1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [6, 'NOTE 14\nSYSTEME NORMAL']))
  merges.push(m(1, 6, 1, 7)) // G2:H2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C, {
    labelCol: 0,
    valueCol: 2,
    sigleCol: 6,
    sigleValCol: 7,
  }))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 14 : PRIMES ET RESERVES']))
  merges.push(m(6, 0, 6, 7)) // A7:H7

  // ── Row 7 (L8): column headers ──
  const r7 = emptyRow(C)
  r7[0] = 'Libellés'
  r7[5] = 'Année N'
  r7[6] = 'Année N-1'
  r7[7] = 'Variation en valeur'
  rows.push(r7)
  merges.push(m(7, 0, 7, 4)) // A8:E8

  // ── Helper for data rows ──
  const dataRow = (label: string, fVal: number, gVal: number): Row => {
    const row = emptyRow(C)
    row[0] = label
    row[5] = fVal
    row[6] = gVal
    row[7] = fVal - gVal
    return row
  }

  const addLabelMerge = (rowIdx: number): void => {
    merges.push(m(rowIdx, 0, rowIdx, 4)) // A:E merge for labels
  }

  // ── PRIMES section ──

  // Row 8 (L9): Primes d'émission
  rows.push(dataRow('Primes d\'émission', 0, 0))
  addLabelMerge(rows.length - 1)

  // Row 9 (L10): Prime d'apport
  rows.push(dataRow('Prime d\'apport', 0, 0))
  addLabelMerge(rows.length - 1)

  // Row 10 (L11): Prime de fusion
  rows.push(dataRow('Prime de fusion', 0, 0))
  addLabelMerge(rows.length - 1)

  // Row 11 (L12): Prime de conversion
  rows.push(dataRow('Prime de conversion', 0, 0))
  addLabelMerge(rows.length - 1)

  // Row 12 (L13): Autres primes
  rows.push(dataRow('Autres primes', 0, 0))
  addLabelMerge(rows.length - 1)

  // Row 13 (L14): TOTAL PRIMES = SUM(F9:F13), SUM(G9:G13)
  const totalPrimesF = 0 // SUM of rows 8-12 col F
  const totalPrimesG = 0 // SUM of rows 8-12 col G
  rows.push(dataRow('TOTAL PRIMES', totalPrimesF, totalPrimesG))
  addLabelMerge(rows.length - 1)

  // ── RESERVES INDISPONIBLES section ──

  // Row 14 (L15): Réserves légales
  rows.push(dataRow('Réserves légales', 0, 0))
  addLabelMerge(rows.length - 1)

  // Row 15 (L16): Réserves statutaires
  rows.push(dataRow('Réserves statutaires', 0, 0))
  addLabelMerge(rows.length - 1)

  // Row 16 (L17): Réserves de plus-values nettes à long terme
  rows.push(dataRow('Réserves de plus-values nettes à long terme', 0, 0))
  addLabelMerge(rows.length - 1)

  // Row 17 (L18): Réserves d'attribution gratuite d'actions...
  rows.push(dataRow(
    'Réserves d\'attribution gratuite d\'actions au personnel salarié\net aux dirigeants',
    0, 0,
  ))
  addLabelMerge(rows.length - 1)

  // Row 18 (L19): Autres réserves réglementées
  rows.push(dataRow('Autres réserves réglementées', 0, 0))
  addLabelMerge(rows.length - 1)

  // Row 19 (L20): TOTAL RESERVES INDISPONIBLES = SUM(F15:F19)
  const totalReservesF = 0 // SUM of rows 14-18 col F
  const totalReservesG = 0 // SUM of rows 14-18 col G
  rows.push(dataRow('TOTAL RESERVES INDISPONIBLES', totalReservesF, totalReservesG))
  addLabelMerge(rows.length - 1)

  // Row 20 (L21): Réserves libres
  rows.push(dataRow('Réserves libres', 0, 0))
  addLabelMerge(rows.length - 1)

  // Row 21 (L22): Report à nouveau
  rows.push(dataRow('Report à nouveau', 0, 0))
  addLabelMerge(rows.length - 1)

  // ── Commentaire ──
  rows.push(emptyRow(C))
  const cm = emptyRow(C)
  cm[0] = 'Commentaire :'
  rows.push(cm)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 4))

  rows.push(emptyRow(C))
  rows.push(emptyRow(C))

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 37 — NOTE 15A : SUBVENTIONS D'INVESTISSEMENT ET PROVISIONS REGLEMENTEES
//   10 columns (A=0 to J=9)
// ────────────────────────────────────────────────────────────────────────────

function buildNote15A(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 10
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 33 -']))
  merges.push(m(0, 0, 0, 9)) // A1:J1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [8, 'NOTE 15A\nSYSTEME NORMAL']))
  merges.push(m(1, 8, 1, 9)) // I2:J2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C, {
    labelCol: 0,
    valueCol: 2,
    sigleCol: 8,
    sigleValCol: 9,
  }))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 15A : SUBVENTIONS D\'INVESTISSEMENT ET PROVISIONS REGLEMENTEES']))
  merges.push(m(6, 0, 6, 9)) // A7:J7

  // ── Row 7 (L8): column headers ──
  const r7 = emptyRow(C)
  r7[0] = 'Libellés'
  r7[3] = 'NOTE'
  r7[4] = 'Année N'
  r7[5] = 'Année N-1'
  r7[6] = 'Variation en valeur'
  r7[7] = 'Variation en %'
  r7[8] = 'Régime fiscal'
  r7[9] = 'Echéances'
  rows.push(r7)
  merges.push(m(7, 0, 7, 2)) // A8:C8

  // ── Helper for data rows ──
  const dataRow = (label: string, note: number | string | null, eVal: number, fVal: number): Row => {
    const row = emptyRow(C)
    row[0] = label
    row[3] = note
    row[4] = eVal
    row[5] = fVal
    row[6] = eVal - fVal
    row[7] = variationPct(eVal, fVal)
    row[8] = null
    row[9] = null
    return row
  }

  const addLabelMerge = (rowIdx: number): void => {
    merges.push(m(rowIdx, 0, rowIdx, 2)) // A:C merge for labels
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SUBVENTIONS D'INVESTISSEMENT section (rows 8-16, L9-L17)
  // ═══════════════════════════════════════════════════════════════════════

  // Row 8 (L9): État
  rows.push(dataRow('État', 0, 0, 0))
  addLabelMerge(rows.length - 1)

  // Row 9 (L10): Régions
  rows.push(dataRow('Régions', null, 0, 0))
  addLabelMerge(rows.length - 1)

  // Row 10 (L11): Départements
  rows.push(dataRow('Départements', null, 0, 0))
  addLabelMerge(rows.length - 1)

  // Row 11 (L12): Communes et collectivités publiques décentralisées
  rows.push(dataRow('Communes et collectivités publiques décentralisées', null, 0, 0))
  addLabelMerge(rows.length - 1)

  // Row 12 (L13): Entités publiques ou mixtes
  rows.push(dataRow('Entités publiques ou mixtes', null, 0, 0))
  addLabelMerge(rows.length - 1)

  // Row 13 (L14): Entités et organismes privés
  rows.push(dataRow('Entités et organismes privés', null, 0, 0))
  addLabelMerge(rows.length - 1)

  // Row 14 (L15): Organismes internationaux
  rows.push(dataRow('Organismes internationaux', null, 0, 0))
  addLabelMerge(rows.length - 1)

  // Row 15 (L16): Autres
  rows.push(dataRow('Autres', null, 0, 0))
  addLabelMerge(rows.length - 1)

  // Row 16 (L17): TOTAL SUBVENTIONS = SUM(E9:E16)
  rows.push(dataRow('TOTAL SUBVENTIONS', null, 0, 0))
  addLabelMerge(rows.length - 1)

  // ═══════════════════════════════════════════════════════════════════════
  // PROVISIONS REGLEMENTEES section (rows 17-24, L18-L25)
  // ═══════════════════════════════════════════════════════════════════════

  // Row 17 (L18): Amortissements dérogatoires
  rows.push(dataRow('Amortissements dérogatoires', null, 0, 0))
  addLabelMerge(rows.length - 1)

  // Row 18 (L19): Plus-value de cession à réinvestir
  rows.push(dataRow('Plus-value de cession à réinvestir', null, 0, 0))
  addLabelMerge(rows.length - 1)

  // Row 19 (L20): Provisions spéciales de réévaluation
  rows.push(dataRow('Provisions spéciales de réévaluation', '3E', 0, 0))
  addLabelMerge(rows.length - 1)

  // Row 20 (L21): Provisions réglementées relatives aux immobilisations
  rows.push(dataRow('Provisions réglementées relatives aux immobilisations', null, 0, 0))
  addLabelMerge(rows.length - 1)

  // Row 21 (L22): Provisions réglementées relatives aux stocks
  rows.push(dataRow('Provisions réglementées relatives aux stocks', null, 0, 0))
  addLabelMerge(rows.length - 1)

  // Row 22 (L23): Provisions pour investissement
  rows.push(dataRow('Provisions pour investissement', null, 0, 0))
  addLabelMerge(rows.length - 1)

  // Row 23 (L24): Autres provisions et fonds réglementées
  rows.push(dataRow('Autres provisions et fonds réglementées', null, 0, 0))
  addLabelMerge(rows.length - 1)

  // Row 24 (L25): TOTAL PROVISIONS = SUM(E18:E24)
  rows.push(dataRow('TOTAL PROVISIONS REGLEMENTEES', null, 0, 0))
  addLabelMerge(rows.length - 1)

  // Row 25 (L26): TOTAL SUBVENTIONS ET PROVISIONS = E17 + E25
  rows.push(dataRow('TOTAL SUBVENTIONS ET PROVISIONS REGLEMENTEES', null, 0, 0))
  addLabelMerge(rows.length - 1)

  // ── Commentaire ──
  rows.push(emptyRow(C))
  const cm = emptyRow(C)
  cm[0] = 'Commentaire :'
  rows.push(cm)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 4))

  rows.push(emptyRow(C))
  rows.push(emptyRow(C))

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 38 — NOTE 15B : AUTRES FONDS PROPRES (1)
//   11 columns (A=0 to K=10)
// ────────────────────────────────────────────────────────────────────────────

function buildNote15B(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 11
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 34 -']))
  merges.push(m(0, 0, 0, 10)) // A1:K1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [9, 'NOTE 15B\nSYSTEME NORMAL']))
  merges.push(m(1, 9, 1, 10)) // J2:K2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C, {
    labelCol: 0,
    valueCol: 2,
    sigleCol: 9,
    sigleValCol: 10,
  }))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 15B : AUTRES FONDS PROPRES (1)']))
  merges.push(m(6, 0, 6, 10)) // A7:K7

  // ── Row 7 (L8): column headers ──
  const r7 = emptyRow(C)
  r7[0] = 'Libellés'
  r7[5] = 'NOTE'
  r7[6] = 'Année N'
  r7[7] = 'Année N-1'
  r7[8] = 'Variation en valeur'
  r7[9] = 'Variation en %'
  r7[10] = 'Echéances'
  rows.push(r7)
  merges.push(m(7, 0, 7, 4)) // A8:E8

  // ── Helper for data rows ──
  const dataRow = (label: string, note: number | string | null, gVal: number, hVal: number): Row => {
    const row = emptyRow(C)
    row[0] = label
    row[5] = note
    row[6] = gVal
    row[7] = hVal
    row[8] = gVal - hVal
    row[9] = variationPct(gVal, hVal)
    row[10] = null
    return row
  }

  const addLabelMerge = (rowIdx: number): void => {
    merges.push(m(rowIdx, 0, rowIdx, 4)) // A:E merge for labels
  }

  // ── Row 8 (L9): Titres participatifs ──
  rows.push(dataRow('Titres participatifs', null, 0, 0))
  addLabelMerge(rows.length - 1)

  // ── Row 9 (L10): Avances conditionnées ──
  rows.push(dataRow('Avances conditionnées', null, 0, 0))
  addLabelMerge(rows.length - 1)

  // ── Row 10 (L11): T.S.D.I. ──
  rows.push(dataRow('Titres subordonnés à durée indéterminée (T.S.D.I.)', null, 0, 0))
  addLabelMerge(rows.length - 1)

  // ── Row 11 (L12): O.R.A. ──
  rows.push(dataRow('Obligations remboursables en actions (O.R.A.)', null, 0, 0))
  addLabelMerge(rows.length - 1)

  // ── Row 12 (L13): Autres avances et dettes... ──
  rows.push(dataRow('Autres avances et dettes assorties de conditions particulières', null, 0, 0))
  addLabelMerge(rows.length - 1)

  // ── Row 13 (L14): TOTAL AUTRES FONDS PROPRES = SUM(G9:G13) ──
  rows.push(dataRow('TOTAL AUTRES FONDS PROPRES', null, 0, 0))
  addLabelMerge(rows.length - 1)

  // ── Row 14 (L15): empty separator ──
  rows.push(emptyRow(C))

  // ── Row 15 (L16): footnote ──
  const fn = emptyRow(C)
  fn[0] = '(1) Le cas échéant, fournir toute information pertinente sur les conditions et les caractéristiques de ces fonds propres.'
  rows.push(fn)
  merges.push(m(15, 0, 15, 10)) // A16:K16

  // ── Commentaire ──
  rows.push(emptyRow(C))
  const cm = emptyRow(C)
  cm[0] = 'Commentaire :'
  rows.push(cm)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 5))

  rows.push(emptyRow(C))
  rows.push(emptyRow(C))

  return { rows, merges }
}

export { buildNote13, buildNote14, buildNote15A, buildNote15B }
