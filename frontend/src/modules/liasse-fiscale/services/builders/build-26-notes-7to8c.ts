/**
 * build-26-notes-7to8c.ts
 * Builders for sheets 26-30 of the SYSCOHADA liasse fiscale:
 *   - Sheet 26: NOTE 7   (10 cols) - Clients
 *   - Sheet 27: NOTE 8   (10 cols) - Autres Creances
 *   - Sheet 28: NOTE 8A  (10 cols) - Charges Immobilisees
 *   - Sheet 29: NOTE 8B  (9 cols)  - Provisions pour charges a repartir
 *   - Sheet 30: NOTE 8C  (9 cols)  - Provisions pour engagements de retraite
 */

import { SheetData, Row, emptyRow, rowAt, m, headerRows } from './helpers'
import type { EntrepriseData, ExerciceData, BalanceEntry } from './helpers'

// ════════════════════════════════════════════════════════════════════════════
// Local helpers
// ════════════════════════════════════════════════════════════════════════════

function exerciceYear(ex: ExerciceData): string {
  if (!ex.dateFin) return 'N'
  const d = new Date(ex.dateFin)
  return isNaN(d.getTime()) ? 'N' : String(d.getFullYear())
}

function exerciceYearN1(ex: ExerciceData): string {
  if (!ex.dateFin) return 'N-1'
  const d = new Date(ex.dateFin)
  return isNaN(d.getTime()) ? 'N-1' : String(d.getFullYear() - 1)
}

function variationPct(n: number, n1: number): number {
  if (n1 === 0) return 0
  return ((n - n1) / Math.abs(n1)) * 100
}

/** Push a data row with label merged A:D and values at specific columns */
function pushDataRow10(
  rows: Row[],
  merges: ReturnType<typeof m>[],
  label: string,
  colVals: [number, number | string][],
): void {
  const C = 10
  const row = emptyRow(C)
  row[0] = label
  for (const [col, val] of colVals) {
    row[col] = val
  }
  rows.push(row)
  const ri = rows.length - 1
  merges.push(m(ri, 0, ri, 3)) // A:D merged
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 26 -- NOTE 7 : CLIENTS
//   10 columns (A=0 to J=9)
// ────────────────────────────────────────────────────────────────────────────

function buildNote7(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 10
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  const yearN = exerciceYear(ex)
  const yearN1 = exerciceYearN1(ex)

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 22 -']))
  merges.push(m(0, 0, 0, 9)) // A1:J1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [8, 'NOTE 7\nSYSTEME NORMAL']))
  merges.push(m(1, 8, 1, 9)) // I2:J2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C, {
    labelCol: 0,
    valueCol: 2,
    sigleCol: 8,
    sigleValCol: 9,
  }))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 7 : CLIENTS']))
  merges.push(m(6, 0, 6, 9)) // A7:J7

  // ── Row 7 (L8): column headers ──
  const rH = emptyRow(C)
  rH[0] = 'Libellés'
  rH[4] = `Année ${yearN}`
  rH[5] = `Année ${yearN1}`
  rH[6] = 'Variation %'
  rH[7] = 'Créances\n≤1an'
  rH[8] = 'Créances\n1-2ans'
  rH[9] = 'Créances\n>2ans'
  rows.push(rH)
  merges.push(m(7, 0, 7, 3)) // A8:D8

  // ── Data rows (L9-L16) — all values default to 0 ──
  const clientLines = [
    'Clients (hors réserves de propriété et Groupe)',
    'Clients effets à recevoir',
    'Clients avec réserves de propriété',
    'Clients et effets à recevoir Groupe',
    'Créances sur cession d\'immobilisations',
    'Clients effets escomptés et non échus',
    'Créances litigieuses ou douteuses',
    'Clients produits à recevoir',
  ]

  const valuesN: number[] = []
  const valuesN1: number[] = []

  for (const label of clientLines) {
    const vN = 0
    const vN1 = 0
    valuesN.push(vN)
    valuesN1.push(vN1)
    const pct = variationPct(vN, vN1)
    pushDataRow10(rows, merges, label, [
      [4, vN],
      [5, vN1],
      [6, pct],
      [7, 0],
      [8, 0],
      [9, 0],
    ])
  }

  // ── Row 16 (L17): TOTAL BRUT CLIENTS ──
  const totalBrutN = valuesN.reduce((a, b) => a + b, 0)
  const totalBrutN1 = valuesN1.reduce((a, b) => a + b, 0)
  pushDataRow10(rows, merges, 'TOTAL BRUT CLIENTS', [
    [4, totalBrutN],
    [5, totalBrutN1],
    [6, variationPct(totalBrutN, totalBrutN1)],
    [7, 0],
    [8, 0],
    [9, 0],
  ])

  // ── Row 17 (L18): Dépréciations des comptes clients ──
  const depN = 0
  const depN1 = 0
  pushDataRow10(rows, merges, 'Dépréciations des comptes clients', [
    [4, depN],
    [5, depN1],
    [6, variationPct(depN, depN1)],
    [7, 0],
    [8, 0],
    [9, 0],
  ])

  // ── Row 18 (L19): TOTAL NET ──
  const totalNetN = totalBrutN - depN
  const totalNetN1 = totalBrutN1 - depN1
  pushDataRow10(rows, merges, 'TOTAL NET', [
    [4, totalNetN],
    [5, totalNetN1],
    [6, variationPct(totalNetN, totalNetN1)],
    [7, 0],
    [8, 0],
    [9, 0],
  ])

  // ── Row 19 (L20): Clients, avances reçues hors groupe ──
  pushDataRow10(rows, merges, 'Clients, avances reçues hors groupe', [
    [4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0],
  ])

  // ── Row 20 (L21): Clients, avances reçues groupe ──
  pushDataRow10(rows, merges, 'Clients, avances reçues groupe', [
    [4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0],
  ])

  // ── Row 21 (L22): Autres clients créditeurs ──
  pushDataRow10(rows, merges, 'Autres clients créditeurs', [
    [4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0],
  ])

  // ── Row 22 (L23): TOTAL CLIENTS CREDITEURS ──
  pushDataRow10(rows, merges, 'TOTAL CLIENTS CREDITEURS', [
    [4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0],
  ])

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
// Sheet 27 -- NOTE 8 : AUTRES CREANCES
//   10 columns (A=0 to J=9)
// ────────────────────────────────────────────────────────────────────────────

function buildNote8(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 10
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  const yearN = exerciceYear(ex)
  const yearN1 = exerciceYearN1(ex)

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 23 -']))
  merges.push(m(0, 0, 0, 9)) // A1:J1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [8, 'NOTE 8\nSYSTEME NORMAL']))
  merges.push(m(1, 8, 1, 9)) // I2:J2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C, {
    labelCol: 0,
    valueCol: 2,
    sigleCol: 8,
    sigleValCol: 9,
  }))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 8 : AUTRES CREANCES']))
  merges.push(m(6, 0, 6, 9)) // A7:J7

  // ── Row 7 (L8): column headers ──
  const rH = emptyRow(C)
  rH[0] = 'Libellés'
  rH[4] = `Année ${yearN}`
  rH[5] = `Année ${yearN1}`
  rH[6] = 'Variation %'
  rH[7] = 'Créances\n≤1an'
  rH[8] = 'Créances\n1-2ans'
  rH[9] = 'Créances\n>2ans'
  rows.push(rH)
  merges.push(m(7, 0, 7, 3)) // A8:D8

  // ── Data rows (L9-L18) — all values default to 0 ──
  const creanceLines = [
    'Personnel',
    'Organismes sociaux',
    'Etat et Collectivités publiques',
    'Organismes internationaux',
    'Apporteurs, associés et groupe',
    'Compte transitoire ajustement spécial lié à la révision du\nSYSCOHADA (Voir Note',
    'Autres débiteurs divers',
    'Comptes permanents non bloqués des établissements et des succursales',
    'Comptes de liaison charges et produits',
    'Comptes de liaison des sociétés en participation',
  ]

  const valuesN: number[] = []
  const valuesN1: number[] = []

  for (const label of creanceLines) {
    const vN = 0
    const vN1 = 0
    valuesN.push(vN)
    valuesN1.push(vN1)
    const pct = variationPct(vN, vN1)
    pushDataRow10(rows, merges, label, [
      [4, vN],
      [5, vN1],
      [6, pct],
      [7, 0],
      [8, 0],
      [9, 0],
    ])
  }

  // ── TOTAL BRUT AUTRES CREANCES ──
  const totalBrutN = valuesN.reduce((a, b) => a + b, 0)
  const totalBrutN1 = valuesN1.reduce((a, b) => a + b, 0)
  pushDataRow10(rows, merges, 'TOTAL BRUT AUTRES CREANCES', [
    [4, totalBrutN],
    [5, totalBrutN1],
    [6, variationPct(totalBrutN, totalBrutN1)],
    [7, 0],
    [8, 0],
    [9, 0],
  ])

  // ── Dépréciations des autres créances ──
  const depN = 0
  const depN1 = 0
  pushDataRow10(rows, merges, 'Dépréciations des autres créances', [
    [4, depN],
    [5, depN1],
    [6, variationPct(depN, depN1)],
    [7, 0],
    [8, 0],
    [9, 0],
  ])

  // ── TOTAL NET ──
  const totalNetN = totalBrutN - depN
  const totalNetN1 = totalBrutN1 - depN1
  pushDataRow10(rows, merges, 'TOTAL NET', [
    [4, totalNetN],
    [5, totalNetN1],
    [6, variationPct(totalNetN, totalNetN1)],
    [7, 0],
    [8, 0],
    [9, 0],
  ])

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
// Sheet 28 -- NOTE 8A : TABLEAU D'ETALEMENT DES CHARGES IMMOBILISEES
//   10 columns (A=0 to J=9)
// ────────────────────────────────────────────────────────────────────────────

function buildNote8A(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 10
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 24 -']))
  merges.push(m(0, 0, 0, 9)) // A1:J1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [8, 'NOTE 8A\nSYSTEME NORMAL']))
  merges.push(m(1, 8, 1, 9)) // I2:J2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C, {
    labelCol: 0,
    valueCol: 2,
    sigleCol: 8,
    sigleValCol: 9,
  }))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 8A : TABLEAU D\'ETALEMENT DES CHARGES IMMOBILISEES']))
  merges.push(m(6, 0, 6, 9)) // A7:J7

  // ── Row 7 (L8): section headers ──
  const rH = emptyRow(C)
  rH[0] = 'LIBELLES'
  rH[4] = 'Frais d\'établissement'
  rH[6] = 'Charges à repartir'
  rH[8] = 'Primes de remboursement\ndes obligations'
  rows.push(rH)
  merges.push(m(7, 0, 7, 3))  // A8:D8
  merges.push(m(7, 4, 7, 5))  // E8:F8
  merges.push(m(7, 6, 7, 7))  // G8:H8
  merges.push(m(7, 8, 7, 9))  // I8:J8

  // ── Row 8 (L9): info text ──
  const rInfo = emptyRow(C)
  rInfo[0] = 'Indiquer les montants à étaler et les modalités d\'étalement retenues'
  rows.push(rInfo)
  merges.push(m(8, 0, 8, 9)) // A9:J9

  // ── Row 9 (L10): Montant global ──
  const rMontant = emptyRow(C)
  rMontant[0] = 'Montant global à étaler au 1er janvier 2018'
  rMontant[4] = 0
  rMontant[6] = 0
  rMontant[8] = 0
  rows.push(rMontant)
  merges.push(m(9, 0, 9, 3)) // A10:D10

  // ── Row 10 (L11): Durée d'étalement ──
  const rDuree = emptyRow(C)
  rDuree[0] = 'Durée d\'étalement retenue'
  rDuree[4] = 0
  rDuree[6] = 0
  rDuree[8] = 0
  rows.push(rDuree)
  merges.push(m(10, 0, 10, 3)) // A11:D11

  // ── Row 11 (L12): Sub-headers Comptes | Montants ──
  const rSub = emptyRow(C)
  rSub[4] = 'Comptes'
  rSub[5] = 'Montants'
  rSub[6] = 'Comptes'
  rSub[7] = 'Montants'
  rSub[8] = 'Comptes'
  rSub[9] = 'Montants'
  rows.push(rSub)
  merges.push(m(11, 0, 11, 3)) // A12:D12

  // ── Rows 12-21 (L13-L22): account lines ──
  const accountLabels = [
    '60...',
    '61...',
    '62...',
    '63...',
    '64...',
    '65...',
    '66...',
    '67...',
    '68...',
    '69...',
  ]

  // This block merges A12:D22 as one big cell
  // We place the account labels in column E, G, I with 0 amounts in F, H, J
  const accountStartRow = 12 // 0-indexed row for L13
  for (let i = 0; i < accountLabels.length; i++) {
    const row = emptyRow(C)
    row[4] = accountLabels[i]
    row[5] = 0
    row[6] = accountLabels[i]
    row[7] = 0
    row[8] = accountLabels[i]
    row[9] = 0
    rows.push(row)
  }
  // Big merge for A13:D22 (rows 12-21 in 0-indexed)
  merges.push(m(accountStartRow, 0, accountStartRow + 9, 3))

  // ── Rows 22-26 (L23-L27): Total exercice 2018-2022 ──
  const exerciceYears = [
    'Total exercice 2018',
    'Total exercice 2019',
    'Total exercice 2020',
    'Total exercice 2021',
    'Total exercice 2022',
  ]

  for (const label of exerciceYears) {
    const row = emptyRow(C)
    row[0] = label
    row[5] = 0
    row[7] = 0
    row[9] = 0
    rows.push(row)
    merges.push(m(rows.length - 1, 0, rows.length - 1, 3)) // A:D merged
  }

  // ── Row 27 (L28): TOTAL GENERAL ──
  // F28=SUM(F23:F27), H28=SUM(H23:H27), J28=SUM(J23:J27)
  // All sub-totals are 0, so totals are 0
  const rTotal = emptyRow(C)
  rTotal[0] = 'TOTAL GENERAL'
  rTotal[5] = 0  // SUM(F23:F27)
  rTotal[7] = 0  // SUM(H23:H27)
  rTotal[9] = 0  // SUM(J23:J27)
  rows.push(rTotal)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 3)) // A28:D28

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
// Sheet 29 -- NOTE 8B : TABLEAU D'ETALEMENT DE PROVISIONS POUR CHARGES
//             A REPARTIR
//   9 columns (A=0 to I=8)
// ────────────────────────────────────────────────────────────────────────────

function buildNote8B(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 9
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 25 -']))
  merges.push(m(0, 0, 0, 8)) // A1:I1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [7, 'NOTE 8B\nSYSTEME NORMAL']))
  merges.push(m(1, 7, 1, 8)) // H2:I2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C, {
    labelCol: 0,
    valueCol: 2,
    sigleCol: 7,
    sigleValCol: 8,
  }))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 8B : TABLEAU D\'ETALEMENT DE PROVISIONS POUR CHARGES A REPARTIR']))
  merges.push(m(6, 0, 6, 8)) // A7:I7

  // ── Row 7 (L8): section headers ──
  const rH = emptyRow(C)
  rH[0] = 'LIBELLES'
  rH[4] = 'PROVISIONS POUR CHARGES A REPARTIR'
  rows.push(rH)
  merges.push(m(7, 0, 7, 3))  // A8:D8
  merges.push(m(7, 4, 7, 8))  // E8:I8

  // ── Row 8 (L9): info text ──
  const rInfo = emptyRow(C)
  rInfo[0] = 'Indiquer les montants à étaler et les modalités d\'étalement retenues'
  rows.push(rInfo)
  merges.push(m(8, 0, 8, 8)) // A9:I9

  // ── Row 9 (L10): Montant global ──
  const rMontant = emptyRow(C)
  rMontant[0] = 'Montant global à étaler au 1er janvier 2018'
  rMontant[4] = 0
  rows.push(rMontant)
  merges.push(m(9, 0, 9, 3)) // A10:D10

  // ── Row 10 (L11): Durée d'étalement ──
  const rDuree = emptyRow(C)
  rDuree[0] = 'Durée d\'étalement retenue'
  rDuree[4] = 0
  rows.push(rDuree)
  merges.push(m(10, 0, 10, 3)) // A11:D11

  // ── Row 11 (L12): Sub-headers Comptes | Montants ──
  const rSub = emptyRow(C)
  rSub[4] = 'Comptes'
  rSub[7] = 'Montants'
  rows.push(rSub)
  merges.push(m(11, 0, 11, 3)) // A12:D12
  merges.push(m(11, 4, 11, 6)) // E12:G12 - Comptes
  merges.push(m(11, 7, 11, 8)) // H12:I12 - Montants

  // ── Row 12 (L13): single account line ──
  const rAcct = emptyRow(C)
  rAcct[0] = '791 Reprises de provisions d\'exploitation'
  rAcct[7] = 0
  rows.push(rAcct)
  merges.push(m(12, 0, 12, 6)) // A13:G13
  merges.push(m(12, 7, 12, 8)) // H13:I13

  // ── Rows 13-17 (L14-L18): Total exercice 2018-2022 ──
  const exerciceYears = [
    'Total exercice 2018',
    'Total exercice 2019',
    'Total exercice 2020',
    'Total exercice 2021',
    'Total exercice 2022',
  ]

  for (const label of exerciceYears) {
    const row = emptyRow(C)
    row[0] = label
    row[7] = 0
    rows.push(row)
    merges.push(m(rows.length - 1, 0, rows.length - 1, 6)) // A:G merged
    merges.push(m(rows.length - 1, 7, rows.length - 1, 8)) // H:I merged
  }

  // ── Row 18 (L19): TOTAL GENERAL ──
  // H19 = SUM(H14:H18) = 0
  const rTotal = emptyRow(C)
  rTotal[0] = 'TOTAL GENERAL'
  rTotal[7] = 0
  rows.push(rTotal)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 6)) // A19:G19
  merges.push(m(rows.length - 1, 7, rows.length - 1, 8)) // H19:I19

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
// Sheet 30 -- NOTE 8C : TABLEAU D'ETALEMENT DE PROVISIONS POUR
//             ENGAGEMENTS DE RETRAITE
//   9 columns (A=0 to I=8)
// ────────────────────────────────────────────────────────────────────────────

function buildNote8C(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 9
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 26 -']))
  merges.push(m(0, 0, 0, 8)) // A1:I1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [7, 'NOTE 8C\nSYSTEME NORMAL']))
  merges.push(m(1, 7, 1, 8)) // H2:I2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C, {
    labelCol: 0,
    valueCol: 2,
    sigleCol: 7,
    sigleValCol: 8,
  }))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 8C : TABLEAU D\'ETALEMENT DE PROVISIONS POUR ENGAGEMENTS DE RETRAITE']))
  merges.push(m(6, 0, 6, 8)) // A7:I7

  // ── Row 7 (L8): section headers ──
  const rH = emptyRow(C)
  rH[0] = 'LIBELLES'
  rH[4] = 'PROVISIONS POUR ENGAGEMENTS DE RETRAITE'
  rows.push(rH)
  merges.push(m(7, 0, 7, 3))  // A8:D8
  merges.push(m(7, 4, 7, 8))  // E8:I8

  // ── Row 8 (L9): info text ──
  const rInfo = emptyRow(C)
  rInfo[0] = 'Indiquer les montants à étaler et les modalités d\'étalement retenues'
  rows.push(rInfo)
  merges.push(m(8, 0, 8, 8)) // A9:I9

  // ── Row 9 (L10): Montant global ──
  const rMontant = emptyRow(C)
  rMontant[0] = 'Montant global à étaler au 1er janvier 2018'
  rMontant[4] = 0
  rows.push(rMontant)
  merges.push(m(9, 0, 9, 3)) // A10:D10

  // ── Row 10 (L11): Durée d'étalement ──
  const rDuree = emptyRow(C)
  rDuree[0] = 'Durée d\'étalement retenue'
  rDuree[4] = 0
  rows.push(rDuree)
  merges.push(m(10, 0, 10, 3)) // A11:D11

  // ── Row 11 (L12): Sub-headers Comptes | Montants ──
  const rSub = emptyRow(C)
  rSub[4] = 'Comptes'
  rSub[7] = 'Montants'
  rows.push(rSub)
  merges.push(m(11, 0, 11, 3)) // A12:D12
  merges.push(m(11, 4, 11, 6)) // E12:G12 - Comptes
  merges.push(m(11, 7, 11, 8)) // H12:I12 - Montants

  // ── Row 12 (L13): single account line ──
  const rAcct = emptyRow(C)
  rAcct[0] = '6911 Dotation aux provisions pour risques et charges'
  rAcct[7] = 0
  rows.push(rAcct)
  merges.push(m(12, 0, 12, 6)) // A13:G13
  merges.push(m(12, 7, 12, 8)) // H13:I13

  // ── Rows 13-17 (L14-L18): Total exercice 2018-2022 ──
  const exerciceYears = [
    'Total exercice 2018',
    'Total exercice 2019',
    'Total exercice 2020',
    'Total exercice 2021',
    'Total exercice 2022',
  ]

  for (const label of exerciceYears) {
    const row = emptyRow(C)
    row[0] = label
    row[7] = 0
    rows.push(row)
    merges.push(m(rows.length - 1, 0, rows.length - 1, 6)) // A:G merged
    merges.push(m(rows.length - 1, 7, rows.length - 1, 8)) // H:I merged
  }

  // ── Row 18 (L19): TOTAL GENERAL ──
  // H19 = SUM(H14:H18) = 0
  const rTotal = emptyRow(C)
  rTotal[0] = 'TOTAL GENERAL'
  rTotal[7] = 0
  rows.push(rTotal)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 6)) // A19:G19
  merges.push(m(rows.length - 1, 7, rows.length - 1, 8)) // H19:I19

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

export {
  buildNote7,
  buildNote8,
  buildNote8A,
  buildNote8B,
  buildNote8C,
}
