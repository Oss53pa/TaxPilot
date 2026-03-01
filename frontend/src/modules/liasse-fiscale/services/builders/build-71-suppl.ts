/**
 * build-71-suppl.ts
 * Builders for sheets 71-77 of the SYSCOHADA liasse fiscale:
 *   - Sheet 71: SUPPL1 (14 cols) - Elements statistiques UEMOA
 *   - Sheet 72: SUPPL2 (10 cols) - Repartition du resultat fiscal des societes de personnes
 *   - Sheet 73: SUPPL3 (11 cols) - Complement informations entites individuelles
 *   - Sheet 74: SUPPL4 (14 cols) - Tableau des amortissements et inventaire des immobilisations
 *   - Sheet 75: SUPPL5 (17 cols) - Detail des frais accessoires sur achats
 *   - Sheet 76: SUPPL6 (8 cols)  - Detail des avantages en nature et en especes
 *   - Sheet 77: SUPPL7 (9 cols)  - Creances et dettes echues de l'exercice
 */

import { SheetData, Row, emptyRow, rowAt, m, headerRows } from './helpers'
import type { EntrepriseData, ExerciceData, BalanceEntry } from './helpers'

// ────────────────────────────────────────────────────────────────────────────
// Sheet 71 — SUPPL1 : ELEMENTS STATISTIQUES UEMOA
//   14 columns (A=0 to N=13)
// ────────────────────────────────────────────────────────────────────────────

function buildSuppl1(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 14
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 8 -']))
  merges.push(m(0, 0, 0, 13)) // A1:N1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [11, 'ETAT SUPPLEMENTAIRE N\u00b01']))
  merges.push(m(1, 11, 1, 13)) // L2:N2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C, {
    valueCol: 2,
    sigleCol: 11,
    sigleValCol: 13,
  }))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'ETAT COMPLEMENTAIRE : ELEMENTS STATISTIQUES UEMOA']))
  merges.push(m(6, 0, 6, 13)) // A7:N7

  // ── Row 7 (L8): two section headers side by side ──
  const hdr = emptyRow(C)
  hdr[0] = 'COMPLEMENT NOTE ANNEXE (Valeur en francs CFA)'
  hdr[8] = 'COMPLEMENT NOTE 32 (Valeurs en francs CFA)'
  rows.push(hdr)
  merges.push(m(7, 0, 7, 6))   // A8:G8
  merges.push(m(7, 8, 7, 13))  // I8:N8

  // ════════════════════════════════════════════════════════════════════════
  // LEFT SECTION: COMPLEMENT ETAT ANNEXE (rows 8-41, L9-L42)
  // ════════════════════════════════════════════════════════════════════════

  // ── Row 8 (L9): left sub-header ──
  const lh1 = emptyRow(C)
  lh1[0] = 'COMPLEMENT ETAT ANNEXE'
  lh1[3] = 'Montant autres Etats\nde l\'UEMOA'
  lh1[5] = 'Montant autres Etats de la\nR\u00e9gion hors de l\'UEMOA'
  // Right section sub-header
  lh1[8] = 'DESIGNATION DU PRODUIT'
  lh1[11] = 'UNITE DE\nQUANTITE'
  lh1[12] = 'PRODUCTION VENDUE\nen UEMOA'
  rows.push(lh1)
  merges.push(m(8, 0, 8, 2))   // A9:C9 - COMPLEMENT ETAT ANNEXE
  merges.push(m(8, 3, 8, 4))   // D9:E9 - Montant UEMOA
  merges.push(m(8, 5, 8, 6))   // F9:G9 - Montant hors UEMOA
  merges.push(m(8, 8, 9, 10))  // I9:K10 - DESIGNATION DU PRODUIT
  merges.push(m(8, 11, 9, 11)) // L9:L10 - UNITE
  merges.push(m(8, 12, 8, 13)) // M9:N9 - PRODUCTION VENDUE en UEMOA

  // ── Row 9 (L10): right Quantité/Valeur + right PRODUCTION VENDUE hors UEMOA ──
  const lh2 = emptyRow(C)
  lh2[12] = 'Quantit\u00e9'
  lh2[13] = 'Valeur'
  rows.push(lh2)

  // ── Rows 10-12 (L11-L13): left section items ──
  const leftItems1 = [
    'Redevances pour brevets, licences et droits similaires',
    'Location de terrains agricoles',
    'Biens acquis d\'occasion',
  ]

  for (let i = 0; i < leftItems1.length; i++) {
    const row = emptyRow(C)
    row[0] = leftItems1[i]
    row[3] = 0
    row[4] = 0
    row[5] = 0
    row[6] = 0
    // Right section: empty data rows
    row[12] = 0
    row[13] = 0
    rows.push(row)
    merges.push(m(10 + i, 0, 10 + i, 2))   // A:C merge for left label
    merges.push(m(10 + i, 8, 10 + i, 10))  // I:K merge for right designation
  }

  // ── Rows 13-26 (L14-L27): more left items + right production rows ──
  const leftItems2 = [
    'Honoraires vers\u00e9s',
    'Frais de si\u00e8ge ou frais d\'assistance technique',
    'Services ext\u00e9rieurs divers',
    'Achats de marchandises',
    'Achats de mati\u00e8res premi\u00e8res et fournitures li\u00e9es',
    'Autres achats',
    'Transports de biens',
    'Transports de personnel',
    'Assurances (IARD et autres)',
    'Frais bancaires (commissions et agios)',
    'Primes d\'assurance vie',
    'Transferts envoy\u00e9s',
    'Transferts re\u00e7us',
    'Investissements directs',
  ]

  for (let i = 0; i < leftItems2.length; i++) {
    const row = emptyRow(C)
    row[0] = leftItems2[i]
    row[3] = 0
    row[4] = 0
    row[5] = 0
    row[6] = 0
    // Right section: continue production data rows
    row[12] = 0
    row[13] = 0
    rows.push(row)
    const rIdx = 13 + i
    merges.push(m(rIdx, 0, rIdx, 2))   // A:C merge for left label
    merges.push(m(rIdx, 8, rIdx, 10))  // I:K merge for right designation
  }

  // ── Row 27 (L28): right section NON VENTILE ──
  const leftMore1 = emptyRow(C)
  leftMore1[0] = 'Investissements de portefeuille'
  leftMore1[3] = 0
  leftMore1[4] = 0
  leftMore1[5] = 0
  leftMore1[6] = 0
  leftMore1[8] = 'NON VENTILE'
  leftMore1[12] = 0
  leftMore1[13] = 0
  rows.push(leftMore1)
  merges.push(m(27, 0, 27, 2))
  merges.push(m(27, 8, 27, 10))

  // ── Row 28 (L29): right section TOTAL ──
  const leftMore2 = emptyRow(C)
  leftMore2[0] = 'Autres flux financiers'
  leftMore2[3] = 0
  leftMore2[4] = 0
  leftMore2[5] = 0
  leftMore2[6] = 0
  leftMore2[8] = 'TOTAL'
  leftMore2[12] = 0
  leftMore2[13] = 0
  rows.push(leftMore2)
  merges.push(m(28, 0, 28, 2))
  merges.push(m(28, 8, 28, 10))

  // ── Row 29 (L30): separator / left continues ──
  rows.push(emptyRow(C))

  // ── Rows 30-31 (L31-L32): COMPLEMENT NOTE 27B header ──
  const n27bHdr1 = emptyRow(C)
  n27bHdr1[0] = 'COMPLEMENT NOTE 27B : Personnel propre'
  n27bHdr1[3] = 'Effectifs'
  n27bHdr1[5] = 'Masse salariale'
  // Right: COMPLEMENT NOTE 33
  n27bHdr1[8] = 'COMPLEMENT NOTE 33 : Achats destin\u00e9s \u00e0 la production'
  rows.push(n27bHdr1)
  merges.push(m(30, 0, 30, 2))
  merges.push(m(30, 3, 30, 4))
  merges.push(m(30, 5, 30, 6))
  merges.push(m(30, 8, 30, 13))

  // ── Row 31 (L32): sub-headers for personnel / achats ──
  const n27bHdr2 = emptyRow(C)
  n27bHdr2[3] = 'UEMOA'
  n27bHdr2[4] = 'Hors\nUEMOA'
  n27bHdr2[5] = 'UEMOA'
  n27bHdr2[6] = 'Hors\nUEMOA'
  n27bHdr2[8] = 'D\u00e9signation'
  n27bHdr2[11] = 'UEMOA'
  n27bHdr2[12] = 'Hors UEMOA'
  n27bHdr2[13] = 'Total'
  rows.push(n27bHdr2)
  merges.push(m(31, 8, 31, 10))

  // ── Rows 32-39 (L33-L40): personnel categories + right achats rows ──
  const personnelCategories = [
    'Cadres sup\u00e9rieurs',
    'Cadres moyens / Agents de ma\u00eetrise',
    'Employ\u00e9s / Ouvriers qualifi\u00e9s',
    'Manoeuvres',
    'Personnel saisonnier',
    'Personnel ext\u00e9rieur (int\u00e9rimaires)',
    'Stagiaires',
    'Autres',
  ]

  for (let i = 0; i < personnelCategories.length; i++) {
    const row = emptyRow(C)
    row[0] = personnelCategories[i]
    row[3] = 0
    row[4] = 0
    row[5] = 0
    row[6] = 0
    // Right: achats rows
    row[11] = 0
    row[12] = 0
    row[13] = 0
    rows.push(row)
    const rIdx = 32 + i
    merges.push(m(rIdx, 0, rIdx, 2))
    merges.push(m(rIdx, 8, rIdx, 10))
  }

  // ── Row 40 (L41): TOTAL for left personnel + right achats TOTAL ──
  const totRow = emptyRow(C)
  totRow[0] = 'TOTAL'
  totRow[3] = 0
  totRow[4] = 0
  totRow[5] = 0
  totRow[6] = 0
  totRow[8] = 'TOTAL'
  totRow[11] = 0
  totRow[12] = 0
  totRow[13] = 0
  rows.push(totRow)
  merges.push(m(40, 0, 40, 2))
  merges.push(m(40, 8, 40, 10))

  // ── Row 41 (L42): empty separator ──
  rows.push(emptyRow(C))

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 72 — SUPPL2 : REPARTITION DU RESULTAT FISCAL DES SOCIETES DE PERSONNES
//   10 columns (A=0 to J=9)
// ────────────────────────────────────────────────────────────────────────────

function buildSuppl2(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 10
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 9 -']))
  merges.push(m(0, 0, 0, 9)) // A1:J1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [8, 'ETAT SUPPLEMENTAIRE N\u00b02']))
  merges.push(m(1, 8, 1, 9)) // I2:J2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C, {
    valueCol: 2,
    sigleCol: 8,
    sigleValCol: 9,
  }))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'REPARTITION DU RESULTAT FISCAL DES SOCIETES DE PERSONNES']))
  merges.push(m(6, 0, 6, 9)) // A7:J7

  // ── Row 7 (L8): column headers ──
  const hdr = emptyRow(C)
  hdr[0] = 'Nom et Pr\u00e9noms'
  hdr[2] = 'Adresse'
  hdr[5] = 'N\u00b0 NCC'
  hdr[6] = 'Part des r\u00e9sultats\nrev. au porteur'
  hdr[7] = 'R\u00e9mun\u00e9ration\ndu g\u00e9rant'
  hdr[8] = 'Total\nimposable'
  hdr[9] = 'N\u00b0 note\n/ ref'
  rows.push(hdr)
  merges.push(m(7, 0, 7, 1)) // A8:B8 - Nom et Prénoms
  merges.push(m(7, 2, 7, 4)) // C8:E8 - Adresse

  // ── Rows 8-29 (L9-L30): 22 blank data rows ──
  for (let i = 0; i < 22; i++) {
    const row = emptyRow(C)
    row[6] = 0
    row[7] = 0
    row[8] = 0
    row[9] = 0
    rows.push(row)
    const rIdx = 8 + i
    merges.push(m(rIdx, 0, rIdx, 1)) // A:B merge for name
    merges.push(m(rIdx, 2, rIdx, 4)) // C:E merge for address
  }

  // ── Row 30 (L31): TOTAL ──
  const totalRow = emptyRow(C)
  totalRow[0] = 'TOTAL'
  totalRow[6] = 0
  totalRow[7] = 0
  totalRow[8] = 0
  totalRow[9] = 0
  rows.push(totalRow)
  merges.push(m(30, 0, 30, 5)) // A31:F31

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 73 — SUPPL3 : COMPLEMENT INFORMATIONS ENTITES INDIVIDUELLES
//   11 columns (A=0 to K=10)
// ────────────────────────────────────────────────────────────────────────────

function buildSuppl3(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 11
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 10 -']))
  merges.push(m(0, 0, 0, 10)) // A1:K1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [9, 'ETAT SUPPLEMENTAIRE N\u00b03']))
  merges.push(m(1, 9, 1, 10)) // J2:K2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C, {
    valueCol: 2,
    sigleCol: 9,
    sigleValCol: 10,
  }))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'COMPLEMENT INFORMATIONS ENTITES INDIVIDUELLES']))
  merges.push(m(6, 0, 6, 10)) // A7:K7

  // ── Row 7 (L8): sub-header ──
  const hdr = emptyRow(C)
  hdr[4] = 'EXPLOITANTS INDIVIDUELS'
  hdr[10] = 'N\u00b0 note / ref\nde l\'\u00e9tat annex\u00e9'
  rows.push(hdr)
  merges.push(m(7, 4, 7, 6))   // E8:G8
  merges.push(m(7, 10, 8, 10)) // K8:K9

  // ── Row 8 (L9): APPORTS FINANCIERS ──
  const r8 = emptyRow(C)
  r8[0] = 'APPORTS FINANCIERS'
  r8[8] = 0
  rows.push(r8)
  merges.push(m(8, 0, 8, 7))  // A9:H9
  merges.push(m(8, 8, 8, 9))  // I9:J9

  // ── Row 9 (L10): PRELEVEMENTS FINANCIERS ──
  const r9 = emptyRow(C)
  r9[0] = 'PRELEVEMENTS FINANCIERS'
  r9[8] = 0
  rows.push(r9)
  merges.push(m(9, 0, 9, 7))  // A10:H10
  merges.push(m(9, 8, 9, 9))  // I10:J10

  // ── Row 10 (L11): AVANTAGES EN NATURE VALEUR REELLE ──
  const r10 = emptyRow(C)
  r10[0] = 'AVANTAGES EN NATURE VALEUR REELLE'
  r10[8] = 0
  rows.push(r10)
  merges.push(m(10, 0, 10, 7)) // A11:H11
  merges.push(m(10, 8, 10, 9)) // I11:J11

  // ── Row 11 (L12): REMUNERATIONS CONJOINT EXPLOITANT ──
  const r11 = emptyRow(C)
  r11[0] = 'REMUNERATIONS CONJOINT EXPLOITANT'
  r11[8] = 0
  rows.push(r11)
  merges.push(m(11, 0, 11, 7)) // A12:H12
  merges.push(m(11, 8, 11, 9)) // I12:J12

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 74 — SUPPL4 : TABLEAU DES AMORTISSEMENTS ET INVENTAIRE DES IMMOBILISATIONS
//   14 columns (A=0 to N=13)
// ────────────────────────────────────────────────────────────────────────────

function buildSuppl4(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 14
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 11 -']))
  merges.push(m(0, 0, 0, 13)) // A1:N1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [12, 'ETAT SUPPLEMENTAIRE N\u00b04']))
  merges.push(m(1, 12, 1, 13)) // M2:N2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C, {
    valueCol: 2,
    sigleCol: 12,
    sigleValCol: 13,
  }))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'TABLEAU DES AMORTISSEMENTS ET INVENTAIRE DES IMMOBILISATIONS']))
  merges.push(m(6, 0, 6, 13)) // A7:N7

  // ── Row 7 (L8): column headers row 1 ──
  const hdr1 = emptyRow(C)
  hdr1[0] = 'NUMERO DE\nCOMPTE'
  hdr1[1] = 'DESIGNATION DES IMMOBILISATIONS'
  hdr1[4] = 'TAUX\nAMORT. %'
  hdr1[5] = 'DATE MISE\nSERVICE'
  hdr1[6] = 'VALEUR\nD\'ACQUISITION'
  hdr1[7] = 'AMORTISSEMENTS'
  hdr1[10] = 'VALEUR\nRESIDUELLE'
  hdr1[11] = 'PRIX\nCESSION'
  hdr1[12] = 'PLUS-VALUE'
  hdr1[13] = 'MOINS-VALUES'
  rows.push(hdr1)
  merges.push(m(7, 0, 8, 0))   // A8:A9 - NUMERO DE COMPTE
  merges.push(m(7, 1, 8, 3))   // B8:D9 - DESIGNATION DES IMMOBILISATIONS
  merges.push(m(7, 4, 8, 4))   // E8:E9 - TAUX
  merges.push(m(7, 5, 8, 5))   // F8:F9 - DATE MISE SERVICE
  merges.push(m(7, 6, 8, 6))   // G8:G9 - VALEUR D'ACQUISITION
  merges.push(m(7, 7, 7, 9))   // H8:J8 - AMORTISSEMENTS
  merges.push(m(7, 10, 8, 10)) // K8:K9 - VALEUR RESIDUELLE
  merges.push(m(7, 11, 8, 11)) // L8:L9 - PRIX CESSION
  merges.push(m(7, 12, 8, 12)) // M8:M9 - PLUS-VALUE
  merges.push(m(7, 13, 8, 13)) // N8:N9 - MOINS-VALUES

  // ── Row 8 (L9): column headers row 2 - AMORTISSEMENTS sub-headers ──
  const hdr2 = emptyRow(C)
  hdr2[7] = 'ANTERIEURS'
  hdr2[8] = 'DE\nL\'EXERCICE'
  hdr2[9] = 'TOTAL'
  rows.push(hdr2)

  // ════════════════════════════════════════════════════════════════════════
  // IMMOBILISATIONS INCORPORELLES (rows 9-21, L10-L22)
  // ════════════════════════════════════════════════════════════════════════

  // ── Row 9 (L10): IMMOBILISATIONS INCORPORELLES header ──
  const incorpHdr = emptyRow(C)
  incorpHdr[1] = 'IMMOBILISATIONS INCORPORELLES'
  incorpHdr[6] = 0
  incorpHdr[7] = 0
  incorpHdr[8] = 0
  incorpHdr[9] = 0  // J = H + I
  incorpHdr[10] = 0 // K = G - J
  incorpHdr[11] = 0
  incorpHdr[12] = 0
  incorpHdr[13] = 0
  rows.push(incorpHdr)
  merges.push(m(9, 1, 9, 3)) // B10:D10

  // ── Rows 10-21 (L11-L22): incorporelles detail items (4 categories x 3 rows each) ──
  const incorpCategories = [
    'Frais de d\u00e9veloppement et de prospection',
    'Brevets, licences, logiciels et droits similaires',
    'Fonds commercial et droit au bail',
    'Autres immobilisations incorporelles',
  ]

  for (const cat of incorpCategories) {
    // Category name row
    const catRow = emptyRow(C)
    catRow[1] = cat
    catRow[6] = 0
    catRow[7] = 0
    catRow[8] = 0
    catRow[9] = 0
    catRow[10] = 0
    catRow[11] = 0
    catRow[12] = 0
    catRow[13] = 0
    rows.push(catRow)
    merges.push(m(rows.length - 1, 1, rows.length - 1, 3))

    // 2 blank detail rows
    for (let j = 0; j < 2; j++) {
      const blankRow = emptyRow(C)
      blankRow[6] = 0
      blankRow[7] = 0
      blankRow[8] = 0
      blankRow[9] = 0
      blankRow[10] = 0
      blankRow[11] = 0
      blankRow[12] = 0
      blankRow[13] = 0
      rows.push(blankRow)
      merges.push(m(rows.length - 1, 1, rows.length - 1, 3))
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  // IMMOBILISATIONS CORPORELLES (rows 22-38, L23-L39)
  // ════════════════════════════════════════════════════════════════════════

  // ── Row 22 (L23): IMMOBILISATIONS CORPORELLES header ──
  const corpHdr = emptyRow(C)
  corpHdr[1] = 'IMMOBILISATIONS CORPORELLES'
  corpHdr[6] = 0
  corpHdr[7] = 0
  corpHdr[8] = 0
  corpHdr[9] = 0
  corpHdr[10] = 0
  corpHdr[11] = 0
  corpHdr[12] = 0
  corpHdr[13] = 0
  rows.push(corpHdr)
  merges.push(m(rows.length - 1, 1, rows.length - 1, 3))

  // ── Rows 23-38 (L24-L39): corporelles detail items (5 categories, roughly 3 rows each, ~16 rows total) ──
  const corpCategories = [
    'Terrains',
    'B\u00e2timents, installations techniques et agencements',
    'Mat\u00e9riel de transport',
    'Mat\u00e9riel et outillage industriel et commercial',
    'Autres immobilisations corporelles',
  ]

  for (const cat of corpCategories) {
    // Category name row
    const catRow = emptyRow(C)
    catRow[1] = cat
    catRow[6] = 0
    catRow[7] = 0
    catRow[8] = 0
    catRow[9] = 0
    catRow[10] = 0
    catRow[11] = 0
    catRow[12] = 0
    catRow[13] = 0
    rows.push(catRow)
    merges.push(m(rows.length - 1, 1, rows.length - 1, 3))

    // 2 blank detail rows
    for (let j = 0; j < 2; j++) {
      const blankRow = emptyRow(C)
      blankRow[6] = 0
      blankRow[7] = 0
      blankRow[8] = 0
      blankRow[9] = 0
      blankRow[10] = 0
      blankRow[11] = 0
      blankRow[12] = 0
      blankRow[13] = 0
      rows.push(blankRow)
      merges.push(m(rows.length - 1, 1, rows.length - 1, 3))
    }
  }

  // ── TOTAL row: sums of INCORPORELLES + CORPORELLES ──
  const totalRow = emptyRow(C)
  totalRow[1] = 'TOTAL'
  totalRow[6] = 0
  totalRow[7] = 0
  totalRow[8] = 0
  totalRow[9] = 0
  totalRow[10] = 0
  totalRow[11] = 0
  totalRow[12] = 0
  totalRow[13] = 0
  rows.push(totalRow)
  merges.push(m(rows.length - 1, 1, rows.length - 1, 3))

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 75 — SUPPL5 : DETAIL DES FRAIS ACCESSOIRES SUR ACHATS
//   17 columns (A=0 to Q=16)
// ────────────────────────────────────────────────────────────────────────────

function buildSuppl5(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 17
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 12 -']))
  merges.push(m(0, 0, 0, 16)) // A1:Q1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [14, 'ETAT SUPPLEMENTAIRE N\u00b05']))
  merges.push(m(1, 14, 1, 16)) // O2:Q2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C, {
    valueCol: 2,
    sigleCol: 14,
    sigleValCol: 16,
  }))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'DETAIL DES FRAIS ACCESSOIRES SUR ACHATS']))
  merges.push(m(6, 0, 6, 16)) // A7:Q7

  // ── Row 7 (L8): column headers ──
  const hdr = emptyRow(C)
  hdr[3] = 'Achats de\nmarchandises'
  hdr[5] = 'Achats de mati\u00e8res\npremi\u00e8res et\nfournitures li\u00e9es'
  hdr[7] = 'Achats stock\u00e9s\nd\'autres\napprovisionnements'
  hdr[9] = 'Achats\nd\'emballages'
  hdr[11] = 'Autres\nachats'
  hdr[13] = 'Total\nrubriques'
  hdr[15] = 'Immobilisations'
  rows.push(hdr)
  merges.push(m(7, 0, 7, 2))   // A8:C8 - blank
  merges.push(m(7, 3, 7, 4))   // D8:E8
  merges.push(m(7, 5, 7, 6))   // F8:G8
  merges.push(m(7, 7, 7, 8))   // H8:I8
  merges.push(m(7, 9, 7, 10))  // J8:K8
  merges.push(m(7, 11, 7, 12)) // L8:M8
  merges.push(m(7, 13, 7, 14)) // N8:O8
  merges.push(m(7, 15, 7, 16)) // P8:Q8

  // ── Rows 8-13 (L9-L14): 6 detail items ──
  const fraisItems = [
    'Droits de douane',
    'Frets et transports',
    'Assurances transport',
    'Commissions et courtages',
    'R\u00e9mun\u00e9ration du transitaire',
    'Autres frais accessoires',
  ]

  for (let i = 0; i < fraisItems.length; i++) {
    const row = emptyRow(C)
    row[0] = fraisItems[i]
    row[3] = 0
    row[4] = 0
    row[5] = 0
    row[6] = 0
    row[7] = 0
    row[8] = 0
    row[9] = 0
    row[10] = 0
    row[11] = 0
    row[12] = 0
    row[13] = 0
    row[14] = 0
    row[15] = 0
    row[16] = 0
    rows.push(row)
    merges.push(m(8 + i, 0, 8 + i, 2)) // A:C merge for label
  }

  // ── Row 14 (L15): TOTAL ──
  const totalRow = emptyRow(C)
  totalRow[0] = 'Total'
  totalRow[3] = 0
  totalRow[4] = 0
  totalRow[5] = 0
  totalRow[6] = 0
  totalRow[7] = 0
  totalRow[8] = 0
  totalRow[9] = 0
  totalRow[10] = 0
  totalRow[11] = 0
  totalRow[12] = 0
  totalRow[13] = 0
  totalRow[14] = 0
  totalRow[15] = 0
  totalRow[16] = 0
  rows.push(totalRow)
  merges.push(m(14, 0, 14, 2)) // A15:C15

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 76 — SUPPL6 : DETAIL DES AVANTAGES EN NATURE ET EN ESPECES
//   8 columns (A=0 to H=7)
// ────────────────────────────────────────────────────────────────────────────

function buildSuppl6(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 8
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 13 -']))
  merges.push(m(0, 0, 0, 7)) // A1:H1

  // ── Row 1 (L2): sheet label + SYSTEME NORMAL label ──
  const l2 = emptyRow(C)
  l2[0] = 'SYSTEME NORMAL'
  l2[6] = 'ETAT SUPPLEMENTAIRE N\u00b06'
  rows.push(l2)
  merges.push(m(1, 0, 1, 1)) // A2:B2 - SYSTEME NORMAL
  merges.push(m(1, 6, 1, 7)) // G2:H2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'DETAIL DES AVANTAGES EN NATURE ET EN ESPECES IMPOSES\nALLOUES AU PERSONNEL  (1)']))
  merges.push(m(6, 0, 6, 7)) // A7:H7

  // ── Row 7 (L8): column headers ──
  const hdr = emptyRow(C)
  hdr[6] = 'Forfait (Bar\u00e8me)\nF.CFA'
  hdr[7] = 'Montant r\u00e9el\nF.CFA'
  rows.push(hdr)
  merges.push(m(7, 0, 7, 5)) // A8:F8 - blank

  // ── Helper for data rows ──
  const addLabelMerge = (rowIdx: number): void => {
    merges.push(m(rowIdx, 0, rowIdx, 5)) // A:F merge for labels
  }

  // ── Rows 8-24 (L9-L25): 17 avantage items ──
  const avantageItems = [
    'Loyers logement',
    'Frais d\'h\u00f4tels',
    'Frais de cantine',
    'Eau',
    'Electricit\u00e9',
    'T\u00e9l\u00e9communication',
    'Frais t\u00e9l\u00e9phone mobile',
    'Gardiennage',
    'Frais transport',
    'Voyages cong\u00e9s',
    'Assurance vie',
    'Retraite compl\u00e9mentaire',
    'Caisses sociales \u00e9trang\u00e8res',
    'Cotisation club golf',
    'Frais scolarit\u00e9 enfants',
    'Dons au personnel',
    'Divers',
  ]

  for (let i = 0; i < avantageItems.length; i++) {
    const row = emptyRow(C)
    row[0] = avantageItems[i]
    row[6] = 0
    row[7] = 0
    rows.push(row)
    addLabelMerge(rows.length - 1)
  }

  // ── Row 25 (L26): TOTAL ──
  const totalRow = emptyRow(C)
  totalRow[0] = 'TOTAL'
  totalRow[6] = 0
  totalRow[7] = 0
  rows.push(totalRow)
  addLabelMerge(rows.length - 1)

  // ── Row 26 (L27): empty separator ──
  rows.push(emptyRow(C))

  // ── Row 27 (L28): footnote ──
  const fn = emptyRow(C)
  fn[0] = '(1) R\u00e9capitulatif des avantages en nature et en esp\u00e8ces impos\u00e9s allou\u00e9s au personnel.'
  rows.push(fn)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 7))

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 77 — SUPPL7 : CREANCES ET DETTES ECHUES DE L'EXERCICE
//   9 columns (A=0 to I=8)
// ────────────────────────────────────────────────────────────────────────────

function buildSuppl7(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 9
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 14 -']))
  merges.push(m(0, 0, 0, 8)) // A1:I1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [7, 'ETAT SUPPLEMENTAIRE N\u00b07']))
  merges.push(m(1, 7, 1, 8)) // H2:I2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C, {
    sigleCol: 7,
    sigleValCol: 8,
  }))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'CREANCES & DETTES ECHUES DE L\'EXERCICE']))
  merges.push(m(6, 0, 6, 8)) // A7:I7

  // ── Row 7 (L8): CREANCES section header ──
  const crHdr = emptyRow(C)
  crHdr[0] = 'CREANCES ECHUES DE L\'EXERCICE'
  crHdr[7] = 'PRINCIPAL'
  crHdr[8] = 'INTERETS'
  rows.push(crHdr)
  merges.push(m(7, 0, 7, 6)) // A8:G8

  // ── Rows 8-17 (L9-L18): 10 blank créances rows ──
  for (let i = 0; i < 10; i++) {
    const row = emptyRow(C)
    row[7] = 0
    row[8] = 0
    rows.push(row)
    merges.push(m(8 + i, 0, 8 + i, 6)) // A:G merge for label
  }

  // ── Row 18 (L19): DETTES section header ──
  const dtHdr = emptyRow(C)
  dtHdr[0] = 'DETTES ECHUES DE L\'EXERCICE'
  dtHdr[7] = 'PRINCIPAL'
  dtHdr[8] = 'INTERETS'
  rows.push(dtHdr)
  merges.push(m(18, 0, 18, 6)) // A19:G19

  // ── Rows 19-28 (L20-L29): 10 blank dettes rows ──
  for (let i = 0; i < 10; i++) {
    const row = emptyRow(C)
    row[7] = 0
    row[8] = 0
    rows.push(row)
    merges.push(m(19 + i, 0, 19 + i, 6)) // A:G merge for label
  }

  return { rows, merges }
}

// ════════════════════════════════════════════════════════════════════════════
// Exports
// ════════════════════════════════════════════════════════════════════════════

export { buildSuppl1, buildSuppl2, buildSuppl3, buildSuppl4, buildSuppl5, buildSuppl6, buildSuppl7 }
