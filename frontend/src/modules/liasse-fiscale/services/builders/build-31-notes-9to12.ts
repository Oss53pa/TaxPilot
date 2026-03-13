/**
 * build-31-notes-9to12.ts
 * Builders for sheets 31-34 of the SYSCOHADA liasse fiscale:
 *   - Sheet 31: NOTE 9  (9 cols)  - Titres de placement
 *   - Sheet 32: NOTE 10 (9 cols)  - Valeurs à encaisser
 *   - Sheet 33: NOTE 11 (9 cols)  - Disponibilités
 *   - Sheet 34: NOTE 12 (9 cols)  - Ecarts de conversion et transferts de charges
 */

import { SheetData, Row, emptyRow, rowAt, m, headerRows, exerciceYear, exerciceYearN1, variationPct, getActifBrut, getAmortProv } from './helpers'
import type { EntrepriseData, ExerciceData, BalanceEntry } from './helpers'

// ════════════════════════════════════════════════════════════════════════════
// Shared: push a data row with Libellés(A:D), Année N(E:F), Année N-1(G:H),
// Variation %(I) and associated merges
// ════════════════════════════════════════════════════════════════════════════

function pushDataRow(
  rows: Row[],
  merges: ReturnType<typeof m>[],
  C: number,
  label: string,
  valN: number,
  valN1: number,
  varPct: number,
): void {
  const row = emptyRow(C)
  row[0] = label
  row[4] = valN
  row[6] = valN1
  row[8] = varPct
  rows.push(row)
  const ri = rows.length - 1
  merges.push(m(ri, 0, ri, 3)) // A:D
  merges.push(m(ri, 4, ri, 5)) // E:F
  merges.push(m(ri, 6, ri, 7)) // G:H
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 31 — NOTE 9 : TITRES DE PLACEMENT
//   9 columns (A=0 to I=8)
// ────────────────────────────────────────────────────────────────────────────

function buildNote9(
  bal: BalanceEntry[],
  balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 9
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  const yearN = exerciceYear(ex)
  const yearN1 = exerciceYearN1(ex)

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 27 -']))
  merges.push(m(0, 0, 0, 8)) // A1:I1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [7, 'NOTE 9\nSYSTEME NORMAL']))
  merges.push(m(1, 7, 1, 8)) // H2:I2

  // ── Rows 2-5 (L3-L6): standard header ──
  const hdr = headerRows(ent, ex, C, {
    labelCol: 0,
    valueCol: 2,
    sigleCol: 7,
    sigleValCol: 8,
  })
  // Override L5 to use NIF instead of NCC
  if (hdr.length >= 3) {
    hdr[2][0] = 'N° d\'identification fiscale :'
  }
  rows.push(...hdr)

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 9 : TITRES DE PLACEMENT']))
  merges.push(m(6, 0, 6, 8)) // A7:I7

  // ── Row 7 (L8): column header ──
  const rH = emptyRow(C)
  rH[0] = 'Libellés'
  rH[4] = `Année ${yearN}`
  rH[6] = `Année ${yearN1}`
  rH[8] = 'Variation %'
  rows.push(rH)
  merges.push(m(7, 0, 7, 3)) // A8:D8
  merges.push(m(7, 4, 7, 5)) // E8:F8
  merges.push(m(7, 6, 7, 7)) // G8:H8

  // ── Data rows (L9-L15): detail lines from balance ──
  // SYSCOHADA: 501 Bons du Trésor, 502 Actions, 503 Obligations, 504 Bons souscription,
  // 505 Titres hors région, 506 Intérêts courus, 508 Autres
  const lines: [string, string[]][] = [
    ['Titres de trésor et bons de caisse à court terme', ['501']],
    ['Actions', ['502']],
    ['Obligations', ['503']],
    ['Bons de souscription', ['504']],
    ['Titres négociables hors régions', ['505']],
    ['Intérêts courus', ['506']],
    ['Autres valeurs assimilées', ['508']],
  ]

  const detailValsN: number[] = []
  const detailValsN1: number[] = []

  for (const [label, prefixes] of lines) {
    const valN = getActifBrut(bal, prefixes)
    const valN1Inner = getActifBrut(balN1, prefixes)
    detailValsN.push(valN)
    detailValsN1.push(valN1Inner)
    pushDataRow(rows, merges, C, label, valN || 0, valN1Inner || 0, variationPct(valN, valN1Inner))
  }

  // ── L16: TOTAL BRUT TITRES ──
  const totalBrutN = detailValsN.reduce((a, b) => a + b, 0)
  const totalBrutN1 = detailValsN1.reduce((a, b) => a + b, 0)
  pushDataRow(rows, merges, C, 'TOTAL BRUT TITRES', totalBrutN, totalBrutN1, variationPct(totalBrutN, totalBrutN1))

  // ── L17: Dépréciations des titres (590) ──
  const depN = getAmortProv(bal, ['590'])
  const depN1 = getAmortProv(balN1, ['590'])
  pushDataRow(rows, merges, C, 'Dépréciations des titres', depN, depN1, variationPct(depN, depN1))

  // ── L18: TOTAL NET ──
  const totalNetN = totalBrutN - depN
  const totalNetN1 = totalBrutN1 - depN1
  pushDataRow(rows, merges, C, 'TOTAL NET', totalNetN, totalNetN1, variationPct(totalNetN, totalNetN1))

  // ── Commentaires ──
  rows.push(emptyRow(C))
  const cm = emptyRow(C)
  cm[0] = 'Commentaire :'
  rows.push(cm)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 8))

  rows.push(emptyRow(C))
  rows.push(emptyRow(C))

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 32 — NOTE 10 : VALEURS A ENCAISSER
//   9 columns (A=0 to I=8)
// ────────────────────────────────────────────────────────────────────────────

function buildNote10(
  bal: BalanceEntry[],
  balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 9
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  const yearN = exerciceYear(ex)
  const yearN1 = exerciceYearN1(ex)

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 28 -']))
  merges.push(m(0, 0, 0, 8)) // A1:I1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [7, 'NOTE 10\nSYSTEME NORMAL']))
  merges.push(m(1, 7, 1, 8)) // H2:I2

  // ── Rows 2-5 (L3-L6): standard header ──
  const hdr = headerRows(ent, ex, C, {
    labelCol: 0,
    valueCol: 2,
    sigleCol: 7,
    sigleValCol: 8,
  })
  // Override L5 to use NIF instead of NCC
  if (hdr.length >= 3) {
    hdr[2][0] = 'N° d\'identification fiscale :'
  }
  rows.push(...hdr)

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 10 : VALEURS A ENCAISSER']))
  merges.push(m(6, 0, 6, 8)) // A7:I7

  // ── Row 7 (L8): column header ──
  const rH = emptyRow(C)
  rH[0] = 'Libellés'
  rH[4] = `Année ${yearN}`
  rH[6] = `Année ${yearN1}`
  rH[8] = 'Variation %'
  rows.push(rH)
  merges.push(m(7, 0, 7, 3)) // A8:D8
  merges.push(m(7, 4, 7, 5)) // E8:F8
  merges.push(m(7, 6, 7, 7)) // G8:H8

  // ── Data rows (L9-L14): detail lines from balance ──
  // SYSCOHADA: 511 Effets à encaisser, 512 Effets à l'encaissement,
  // 513 Chèques à encaisser, 514 Chèques à l'encaissement,
  // 515 Cartes crédit, 518 Autres
  const lines: [string, string[]][] = [
    ['Effets à encaisser', ['511']],
    ['Effets à l\'encaissement', ['512']],
    ['Chèques à encaisser', ['513']],
    ['Chèques à l\'encaissement', ['514']],
    ['Cartes de crédit à encaisser', ['515']],
    ['Autres valeurs à encaisser', ['516', '518']],
  ]

  const detailValsN: number[] = []
  const detailValsN1: number[] = []

  for (const [label, prefixes] of lines) {
    const valN = getActifBrut(bal, prefixes)
    const valN1Inner = getActifBrut(balN1, prefixes)
    detailValsN.push(valN)
    detailValsN1.push(valN1Inner)
    pushDataRow(rows, merges, C, label, valN || 0, valN1Inner || 0, variationPct(valN, valN1Inner))
  }

  // ── L15: TOTAL BRUT VALEURS A ENCAISSER ──
  const totalBrutN = detailValsN.reduce((a, b) => a + b, 0)
  const totalBrutN1 = detailValsN1.reduce((a, b) => a + b, 0)
  pushDataRow(rows, merges, C, 'TOTAL BRUT VALEURS A ENCAISSER', totalBrutN, totalBrutN1, variationPct(totalBrutN, totalBrutN1))

  // ── L16: Dépréciations des valeurs à encaisser (591) ──
  const depN = getAmortProv(bal, ['591'])
  const depN1 = getAmortProv(balN1, ['591'])
  pushDataRow(rows, merges, C, 'Dépréciations des valeurs à encaisser', depN, depN1, variationPct(depN, depN1))

  // ── L17: TOTAL NET ──
  const totalNetN = totalBrutN - depN
  const totalNetN1 = totalBrutN1 - depN1
  pushDataRow(rows, merges, C, 'TOTAL NET', totalNetN, totalNetN1, variationPct(totalNetN, totalNetN1))

  // ── Commentaires ──
  rows.push(emptyRow(C))
  const cm = emptyRow(C)
  cm[0] = 'Commentaire :'
  rows.push(cm)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 8))

  rows.push(emptyRow(C))
  rows.push(emptyRow(C))

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 33 — NOTE 11 : DISPONIBILITES
//   9 columns (A=0 to I=8)
// ────────────────────────────────────────────────────────────────────────────

function buildNote11(
  bal: BalanceEntry[],
  balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 9
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  const yearN = exerciceYear(ex)
  const yearN1 = exerciceYearN1(ex)

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 29 -']))
  merges.push(m(0, 0, 0, 8)) // A1:I1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [7, 'NOTE 11\nSYSTEME NORMAL']))
  merges.push(m(1, 7, 1, 8)) // H2:I2

  // ── Rows 2-5 (L3-L6): standard header ──
  // Note 11 uses default NCC label (not NIF)
  rows.push(...headerRows(ent, ex, C, {
    labelCol: 0,
    valueCol: 2,
    sigleCol: 7,
    sigleValCol: 8,
  }))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 11 : DISPONIBILITES']))
  merges.push(m(6, 0, 6, 8)) // A7:I7

  // ── Row 7 (L8): column header ──
  const rH = emptyRow(C)
  rH[0] = 'Libellés'
  rH[4] = `Année ${yearN}`
  rH[6] = `Année ${yearN1}`
  rH[8] = 'Variation %'
  rows.push(rH)
  merges.push(m(7, 0, 7, 3)) // A8:D8
  merges.push(m(7, 4, 7, 5)) // E8:F8
  merges.push(m(7, 6, 7, 7)) // G8:H8

  // ── Data rows (L9-L20): detail lines from balance ──
  // SYSCOHADA: 521 Banques locales, 522 Banques autres états, 523 Dépôts à terme,
  // 524 Autres banques, 525 Intérêts courus, 531 Chèques postaux,
  // 532 Trésors, 54x Autres établ. fin., 541 Intérêts courus,
  // 55x Instruments trésorerie, 571 Caisse, 581-585 Régies/virements
  const lines: [string, string[]][] = [
    ['Banques locales', ['5211']],
    ['Banques autres états région', ['5212']],
    ['Banques, dépôt à terme', ['523']],
    ['Autres Banques', ['5213', '5214', '5215', '5216', '5217', '5218']],
    ['Banques intérêts courus', ['525']],
    ['Chèques postaux', ['531']],
    ['Autres établissement financiers', ['532', '533', '534', '537', '538']],
    ['Etablissement financiers intérêts courus', ['535']],
    ['Instruments de trésorerie', ['551', '552', '553', '554', '555', '558']],
    ['Instruments de monnaie électronique', ['556', '557']],
    ['Caisse', ['571', '572', '573', '574', '575', '576', '577', '578']],
    ['Régies d\'avances et virements accréditifs', ['581', '582', '585', '586', '588']],
  ]

  const detailValsN: number[] = []
  const detailValsN1: number[] = []

  for (const [label, prefixes] of lines) {
    const valN = getActifBrut(bal, prefixes)
    const valN1Inner = getActifBrut(balN1, prefixes)
    detailValsN.push(valN)
    detailValsN1.push(valN1Inner)
    pushDataRow(rows, merges, C, label, valN || 0, valN1Inner || 0, variationPct(valN, valN1Inner))
  }

  // ── L21: TOTAL BRUT DISPONIBILITES ──
  const totalBrutN = detailValsN.reduce((a, b) => a + b, 0)
  const totalBrutN1 = detailValsN1.reduce((a, b) => a + b, 0)
  pushDataRow(rows, merges, C, 'TOTAL BRUT DISPONIBILITES', totalBrutN, totalBrutN1, variationPct(totalBrutN, totalBrutN1))

  // ── L22: Dépréciations (592, 593, 594, 595) ──
  const depN = getAmortProv(bal, ['592', '593', '594', '595'])
  const depN1 = getAmortProv(balN1, ['592', '593', '594', '595'])
  pushDataRow(rows, merges, C, 'Dépréciations', depN, depN1, variationPct(depN, depN1))

  // ── L23: TOTAL NET ──
  const totalNetN = totalBrutN - depN
  const totalNetN1 = totalBrutN1 - depN1
  pushDataRow(rows, merges, C, 'TOTAL NET', totalNetN, totalNetN1, variationPct(totalNetN, totalNetN1))

  // ── Commentaires ──
  rows.push(emptyRow(C))
  const cm = emptyRow(C)
  cm[0] = 'Commentaire :'
  rows.push(cm)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 8))

  rows.push(emptyRow(C))
  rows.push(emptyRow(C))

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 34 — NOTE 12 : ECARTS DE CONVERSION ET TRANSFERTS DE CHARGES
//   9 columns (A=0 to I=8)
// ────────────────────────────────────────────────────────────────────────────

function buildNote12(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 9
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  const yearN = exerciceYear(ex)
  const yearN1 = exerciceYearN1(ex)

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 30 -']))
  merges.push(m(0, 0, 0, 8)) // A1:I1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [7, 'NOTE 12\nSYSTEME NORMAL']))
  merges.push(m(1, 7, 1, 8)) // H2:I2

  // ── Rows 2-5 (L3-L6): standard header ──
  // Note 12 uses default NCC label (not NIF)
  rows.push(...headerRows(ent, ex, C, {
    labelCol: 0,
    valueCol: 2,
    sigleCol: 7,
    sigleValCol: 8,
  }))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 12 : ECARTS DE CONVERSION ET TRANSFERTS DE CHARGES']))
  merges.push(m(6, 0, 6, 8)) // A7:I7

  // ════════════════════════════════════════════════════════════════════════
  // TABLE 1: ECARTS DE CONVERSION (rows 7-24)
  // ════════════════════════════════════════════════════════════════════════

  // ── Row 7 (L8): sub-table title ──
  rows.push(rowAt(C, [0, 'ECARTS DE CONVERSION']))
  merges.push(m(7, 0, 7, 8)) // A8:I8

  // ── Row 8 (L9): column headers ──
  const rHConv = emptyRow(C)
  rHConv[0] = 'Libellés'
  rHConv[4] = 'Devises'
  rHConv[5] = 'Montant en devises'
  rHConv[6] = 'Cours UML\nAnnée acquisition'
  rHConv[7] = 'Cours UML\n31/12'
  rHConv[8] = 'Variation en valeur'
  rows.push(rHConv)
  merges.push(m(8, 0, 8, 3)) // A9:D9

  // ── Row 9 (L10): Ecart de conversion actif section header ──
  const rConvActif = emptyRow(C)
  rConvActif[0] = 'Ecart de conversion actif :\ndétailler les créances et dettes concernées'
  rows.push(rConvActif)
  merges.push(m(9, 0, 9, 3)) // A10:D10

  // ── Rows 10-15 (L11-L16): 6 empty detail rows for actif ──
  for (let i = 0; i < 6; i++) {
    const row = emptyRow(C)
    row[0] = null
    row[4] = null
    row[5] = 0
    row[6] = 0
    row[7] = 0
    row[8] = 0  // formula: F*G - F*H
    rows.push(row)
    const ri = rows.length - 1
    merges.push(m(ri, 0, ri, 3)) // A:D
  }

  // ── Row 16 (L17): Ecart de conversion passif section header ──
  const rConvPassif = emptyRow(C)
  rConvPassif[0] = 'Ecart de conversion passif :\ndétailler les créances et dettes concernées'
  rows.push(rConvPassif)
  merges.push(m(16, 0, 16, 3)) // A17:D17

  // ── Rows 17-23 (L18-L24): 7 empty detail rows for passif ──
  for (let i = 0; i < 7; i++) {
    const row = emptyRow(C)
    row[0] = null
    row[4] = null
    row[5] = 0
    row[6] = 0
    row[7] = 0
    row[8] = 0  // formula: F*G - F*H
    rows.push(row)
    const ri = rows.length - 1
    merges.push(m(ri, 0, ri, 3)) // A:D
  }

  // ── Row 24 (L25): UML footnote ──
  const rUML = emptyRow(C)
  rUML[0] = 'UML : Unités Monétaires légales\nCommentaire: Faire un commentaire.'
  rows.push(rUML)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 4)) // A25:E25

  // ════════════════════════════════════════════════════════════════════════
  // TABLE 2: TRANSFERTS DE CHARGES (rows 25-42)
  // ════════════════════════════════════════════════════════════════════════

  // ── Row 25 (L26): sub-table title ──
  rows.push(rowAt(C, [0, 'TRANSFERTS DE CHARGES']))
  merges.push(m(rows.length - 1, 0, rows.length - 1, 8)) // A26:I26

  // ── Row 26 (L27): column headers ──
  const rHTransf = emptyRow(C)
  rHTransf[0] = 'Libellés'
  rHTransf[6] = `Année ${yearN}`
  rHTransf[7] = `Année ${yearN1}`
  rHTransf[8] = 'Variation %'
  rows.push(rHTransf)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 5)) // A27:F27

  // ── Row 27 (L28): Transferts de charges d'exploitation section header ──
  const rExpl = emptyRow(C)
  rExpl[0] = 'Transferts de charges d\'exploitation :\ndétailler la nature des charges transférées'
  rows.push(rExpl)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 5)) // A28:F28

  // ── Rows 28-33 (L29-L34): 6 empty detail rows for exploitation ──
  for (let i = 0; i < 6; i++) {
    const row = emptyRow(C)
    row[0] = null
    row[6] = 0
    row[7] = 0
    row[8] = 0  // formula: IFERROR((G-H)/H,"")
    rows.push(row)
    const ri = rows.length - 1
    merges.push(m(ri, 0, ri, 5)) // A:F
  }

  // ── Row 34 (L35): Transferts de charges financières section header ──
  const rFin = emptyRow(C)
  rFin[0] = 'Transferts de charges financières :\ndétailler la nature des charges transférées'
  rows.push(rFin)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 5)) // A35:F35

  // ── Rows 35-41 (L36-L42): 7 empty detail rows for financières ──
  for (let i = 0; i < 7; i++) {
    const row = emptyRow(C)
    row[0] = null
    row[6] = 0
    row[7] = 0
    row[8] = 0  // formula: IFERROR((G-H)/H,"")
    rows.push(row)
    const ri = rows.length - 1
    merges.push(m(ri, 0, ri, 5)) // A:F
  }

  // ── Row 42 (L43): footnote ──
  const rFootnote = emptyRow(C)
  rFootnote[0] = '(1) Le transfert de charge est la contrepartie d\'une charge qui a été imputée à un compte de bilan.'
  rows.push(rFootnote)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 8))

  // ── Row 43 (L44): commentaire ──
  const rComment = emptyRow(C)
  rComment[0] = 'Commentaire: Faire un commentaire.'
  rows.push(rComment)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 8))

  rows.push(emptyRow(C))
  rows.push(emptyRow(C))

  return { rows, merges }
}

export { buildNote9, buildNote10, buildNote11, buildNote12 }
