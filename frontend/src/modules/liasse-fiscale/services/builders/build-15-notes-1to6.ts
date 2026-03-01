/**
 * build-15-notes-1to6.ts
 * Builders for sheets 15-25 of the SYSCOHADA liasse fiscale:
 *   - Sheet 15: NOTE 1  (9 cols)  - Dettes garanties & Engagements financiers
 *   - Sheet 16: NOTE 2  (9 cols)  - Informations obligatoires (text only)
 *   - Sheet 17: NOTE 3A (10 cols) - Immobilisations (brutes)
 *   - Sheet 18: NOTE 3B (12 cols) - Biens pris en location-acquisition
 *   - Sheet 19: NOTE 3C (15 cols) - Immobilisations (amortissements)
 *   - Sheet 20: NOTE 3C BIS (11 cols) - Immobilisations (dépréciations)
 *   - Sheet 21: NOTE 3D (8 cols)  - Plus/Moins-values de cession
 *   - Sheet 22: NOTE 3E (9 cols)  - Réévaluations
 *   - Sheet 23: NOTE 4  (11 cols) - Immobilisations financières
 *   - Sheet 24: NOTE 5  (9 cols)  - Actif circulant & Dettes circulantes HAO
 *   - Sheet 25: NOTE 6  (10 cols) - Stocks et en-cours
 */

import { SheetData, Row, emptyRow, rowAt, m, headerRows } from './helpers'
import type { EntrepriseData, ExerciceData, BalanceEntry } from './helpers'
import { getActifBrut, getAmortProv, getPassif } from './helpers'

// ════════════════════════════════════════════════════════════════════════════
// Helper: compute year from exercise date string
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

// ════════════════════════════════════════════════════════════════════════════
// Helper: variation percentage
// ════════════════════════════════════════════════════════════════════════════

function variationPct(n: number, n1: number): number {
  if (n1 === 0) return 0
  return ((n - n1) / Math.abs(n1)) * 100
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 15 — NOTE 1 : Dettes garanties & Engagements financiers
//   9 columns (A=0 to I=8)
// ────────────────────────────────────────────────────────────────────────────

function buildNote1(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 9
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 11 -']))
  merges.push(m(0, 0, 0, 8)) // A1:I1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [7, 'NOTE 1\nSYSTEME NORMAL']))
  merges.push(m(1, 7, 1, 8)) // H2:I2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C, {
    labelCol: 0,
    valueCol: 2,
    sigleCol: 7,
    sigleValCol: 8,
  }))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 1: DETTES GARANTIES PAR DES SURETES REELLES ET LES ENGAGEMENTS FINANCIERS']))
  merges.push(m(6, 0, 6, 8)) // A7:I7

  // ════════════════════════════════════════════════════════════════════════
  // TABLE 1: Dettes garanties par des sûretés réelles
  // ════════════════════════════════════════════════════════════════════════

  // ── Row 7 (L8): table header row 1 ──
  const r7 = emptyRow(C)
  r7[0] = 'LIBELLES'
  r7[4] = 'Note'
  r7[5] = 'Montant\nbrut (1)'
  r7[6] = 'SURETES REELLES (2)'
  rows.push(r7)
  merges.push(m(7, 0, 8, 3)) // A8:D9 - LIBELLES merged
  merges.push(m(7, 4, 8, 4)) // E8:E9 - Note merged
  merges.push(m(7, 5, 8, 5)) // F8:F9 - Montant brut merged
  merges.push(m(7, 6, 7, 8)) // G8:I8 - SURETES REELLES merged

  // ── Row 8 (L9): table header row 2 ──
  const r8 = emptyRow(C)
  r8[6] = 'Hypothèques'
  r8[7] = 'Nantissements'
  r8[8] = 'Gages / autres'
  rows.push(r8)

  // ── Helper for debt data rows ──
  const debtRow = (label: string, note: string | number | null, f: number, g: number, h: number, i: number): Row => {
    const row = emptyRow(C)
    row[0] = label
    row[4] = note
    row[5] = f
    row[6] = g
    row[7] = h
    row[8] = i
    return row
  }

  // Helper to add label merge for debt rows (A:D)
  const addDebtLabelMerge = (rowIdx: number): void => {
    merges.push(m(rowIdx, 0, rowIdx, 3))
  }

  // ── Row 9 (L10): Section header ──
  rows.push(debtRow('Emprunts et dettes financières diverses :', 16, 0, 0, 0, 0))
  addDebtLabelMerge(rows.length - 1)

  // ── Rows 10-13 (L11-L14): sub-items ──
  rows.push(debtRow('Emprunts obligataires convertibles', null, 0, 0, 0, 0))
  addDebtLabelMerge(rows.length - 1)
  rows.push(debtRow('Autres emprunts obligataires', null, 0, 0, 0, 0))
  addDebtLabelMerge(rows.length - 1)
  rows.push(debtRow('Emprunts et dettes des établissements de crédit', null, 0, 0, 0, 0))
  addDebtLabelMerge(rows.length - 1)
  rows.push(debtRow('Autres dettes financières', null, 0, 0, 0, 0))
  addDebtLabelMerge(rows.length - 1)

  // ── Row 14 (L15): SOUS TOTAL (1) ──
  rows.push(debtRow('SOUS TOTAL (1)', null, 0, 0, 0, 0))
  addDebtLabelMerge(rows.length - 1)

  // ── Row 15 (L16): Section header ──
  rows.push(debtRow('Dettes de location-acquisition :', 16, 0, 0, 0, 0))
  addDebtLabelMerge(rows.length - 1)

  // ── Rows 16-19 (L17-L20): sub-items ──
  rows.push(debtRow('Crédit-bail immobilier', null, 0, 0, 0, 0))
  addDebtLabelMerge(rows.length - 1)
  rows.push(debtRow('Crédit-bail mobilier', null, 0, 0, 0, 0))
  addDebtLabelMerge(rows.length - 1)
  rows.push(debtRow('Location-vente', null, 0, 0, 0, 0))
  addDebtLabelMerge(rows.length - 1)
  rows.push(debtRow('Autres dettes de location-acquisition', null, 0, 0, 0, 0))
  addDebtLabelMerge(rows.length - 1)

  // ── Row 20 (L21): SOUS TOTAL (2) ──
  rows.push(debtRow('SOUS TOTAL (2)', null, 0, 0, 0, 0))
  addDebtLabelMerge(rows.length - 1)

  // ── Row 21 (L22): Section header ──
  rows.push(debtRow('Dettes du passif circulant :', null, 0, 0, 0, 0))
  addDebtLabelMerge(rows.length - 1)

  // ── Rows 22-29 (L23-L30): passif circulant sub-items ──
  rows.push(debtRow('Fournisseurs', 17, 0, 0, 0, 0))
  addDebtLabelMerge(rows.length - 1)
  rows.push(debtRow('Clients', 7, 0, 0, 0, 0))
  addDebtLabelMerge(rows.length - 1)
  rows.push(debtRow('Personnel', 18, 0, 0, 0, 0))
  addDebtLabelMerge(rows.length - 1)
  rows.push(debtRow('Sécurité sociale', 18, 0, 0, 0, 0))
  addDebtLabelMerge(rows.length - 1)
  rows.push(debtRow('Etat', 18, 0, 0, 0, 0))
  addDebtLabelMerge(rows.length - 1)
  rows.push(debtRow('Organismes internationaux', 19, 0, 0, 0, 0))
  addDebtLabelMerge(rows.length - 1)
  rows.push(debtRow('Associés et groupe', 19, 0, 0, 0, 0))
  addDebtLabelMerge(rows.length - 1)
  rows.push(debtRow('Créditeurs divers', 19, 0, 0, 0, 0))
  addDebtLabelMerge(rows.length - 1)

  // ── Row 30 (L31): SOUS TOTAL (3) ──
  rows.push(debtRow('SOUS TOTAL (3)', null, 0, 0, 0, 0))
  addDebtLabelMerge(rows.length - 1)

  // ── Row 31 (L32): TOTAL ──
  rows.push(debtRow('TOTAL (1) + (2) + (3)', null, 0, 0, 0, 0))
  addDebtLabelMerge(rows.length - 1)

  // ════════════════════════════════════════════════════════════════════════
  // TABLE 2: Engagements financiers
  // ════════════════════════════════════════════════════════════════════════

  // ── Row 32 (L33): header ──
  const r32 = emptyRow(C)
  r32[0] = 'ENGAGEMENTS FINANCIERS'
  r32[6] = 'Engagements réciproques'
  r32[7] = 'Engagements donnés'
  r32[8] = 'Engagements reçus'
  rows.push(r32)
  merges.push(m(32, 0, 32, 5)) // A33:F33

  // ── Helper for engagement data rows ──
  const engRow = (label: string, g: number, h: number, i: number): Row => {
    const row = emptyRow(C)
    row[0] = label
    row[6] = g
    row[7] = h
    row[8] = i
    return row
  }

  const addEngLabelMerge = (rowIdx: number): void => {
    merges.push(m(rowIdx, 0, rowIdx, 5))
  }

  // ── Rows 33-43 (L34-L44): engagement items ──
  const engagements = [
    'Avals et cautions',
    'Effets escomptés non échus',
    'Créances cédées non échues',
    'Hypothèques consenties',
    'Nantissements consentis',
    'Garanties données sur marchés publics',
    'Autres engagements donnés',
    'Engagements reçus de tiers',
    'Engagements de crédit-bail',
    'Engagements de retraite',
    'Autres engagements réciproques',
  ]
  for (const label of engagements) {
    rows.push(engRow(label, 0, 0, 0))
    addEngLabelMerge(rows.length - 1)
  }

  // ── Row 44 (L45): TOTAL ──
  rows.push(engRow('TOTAL', 0, 0, 0))
  addEngLabelMerge(rows.length - 1)

  // ── Footnotes ──
  rows.push(emptyRow(C))
  const fn1 = emptyRow(C)
  fn1[0] = '(1) Il s\'agit du montant des dettes figurant au bilan.'
  rows.push(fn1)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 8))

  const fn2 = emptyRow(C)
  fn2[0] = '(2) Les sûretés réelles sont constituées par les hypothèques, les nantissements et les gages.'
  rows.push(fn2)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 8))

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
// Sheet 16 — NOTE 2 : Informations obligatoires (text only)
//   9 columns (A=0 to I=8)
// ────────────────────────────────────────────────────────────────────────────

function buildNote2(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 9
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 12 -']))
  merges.push(m(0, 0, 0, 8)) // A1:I1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [7, 'NOTE 2\nSYSTEME NORMAL']))
  merges.push(m(1, 7, 1, 8)) // H2:I2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C, {
    labelCol: 0,
    valueCol: 2,
    sigleCol: 7,
    sigleValCol: 8,
  }))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 2: INFORMATIONS OBLIGATOIRES']))
  merges.push(m(6, 0, 6, 8)) // A7:I7

  // ── Row 7 (L8): Section A ──
  rows.push(rowAt(C, [0, 'A - DECLARATION DE CONFORMITE AU SYSCOHADA ET FAITS MARQUANTS DE L\'EXERCICE']))
  merges.push(m(7, 0, 7, 8)) // A8:I8

  // ── Row 8 (L9): text ──
  rows.push(rowAt(C, [0, 'Les états financiers annuels sont établis conformément au Système Comptable OHADA. Ils sont présentés selon les principes et méthodes comptables du Plan Comptable Général OHADA.']))
  merges.push(m(8, 0, 8, 8)) // A9:I9

  // ── Row 9 (L10): Section B ──
  rows.push(rowAt(C, [0, 'B - REGLES ET METHODES COMPTABLES']))
  merges.push(m(9, 0, 9, 8)) // A10:I10

  // ── Row 10 (L11): text ──
  rows.push(rowAt(C, [0, 'Les méthodes comptables sont conformes aux règles générales d\'établissement et de présentation des états financiers annuels telles que définies par le SYSCOHADA révisé.']))
  merges.push(m(10, 0, 10, 8)) // A11:I11

  // ── Row 11 (L12): Section C ──
  rows.push(rowAt(C, [0, 'C- DEROGATION AUX POSTULATS ET CONVENTIONS COMPTABLES']))
  merges.push(m(11, 0, 11, 8)) // A12:I12

  // ── Row 12 (L13): text ──
  rows.push(rowAt(C, [0, 'Néant. Aucune dérogation aux postulats et conventions comptables n\'a été pratiquée au cours de l\'exercice.']))
  merges.push(m(12, 0, 12, 8)) // A13:I13

  // ── Row 13 (L14): Section D ──
  rows.push(rowAt(C, [0, 'D - INFORMATIONS COMPLEMENTAIRES RELATIVES AU BILAN ET AU COMPTE DE RESULTAT']))
  merges.push(m(13, 0, 13, 8)) // A14:I14

  // ── Row 14 (L15): text ──
  rows.push(rowAt(C, [0, 'Les informations complémentaires sont fournies dans les notes annexes ci-après, conformément aux dispositions du SYSCOHADA révisé.']))
  merges.push(m(14, 0, 14, 8)) // A15:I15

  // ── Row 15: empty separator ──
  rows.push(emptyRow(C))

  // ── Row 16 (L17): Commentaire ──
  rows.push(rowAt(C, [0, 'Commentaire :']))
  merges.push(m(16, 0, 16, 4)) // A17:E17

  // ── Rows 17-19 (L18-L20): comment bullets ──
  rows.push(rowAt(C, [0, '- Les immobilisations sont évaluées à leur coût d\'acquisition ou de production.']))
  merges.push(m(17, 0, 17, 8)) // A18:I18

  rows.push(rowAt(C, [0, '- Les amortissements sont calculés selon le mode linéaire sur la durée de vie estimée des biens.']))
  merges.push(m(18, 0, 18, 8)) // A19:I19

  rows.push(rowAt(C, [0, '- Les stocks sont évalués selon la méthode du coût moyen pondéré.']))
  merges.push(m(19, 0, 19, 8)) // A20:I20

  // Pad
  while (rows.length < 22) rows.push(emptyRow(C))

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 17 — NOTE 3A : Immobilisations (brutes) - Movement table
//   10 columns (A=0 to J=9)
// ────────────────────────────────────────────────────────────────────────────

/** Account prefixes for each immobilisation line in Note 3A */
interface Immo3ALine {
  label: string
  prefixes: readonly string[]
  isSubtotal?: boolean
  children?: number[] // indices of child rows to sum
}

const IMMO_3A_LINES: Immo3ALine[] = [
  // Row 11 (index 0): subtotal IMMOBILISATIONS INCORPORELLES
  { label: 'IMMOBILISATIONS INCORPORELLES', prefixes: [], isSubtotal: true, children: [1, 2, 3, 4] },
  // Row 12 (index 1)
  { label: 'Frais de développement et de prospection', prefixes: ['201', '202', '206'] },
  // Row 13 (index 2)
  { label: 'Brevets, licences, logiciels, et droits similaires', prefixes: ['212', '213', '214', '215'] },
  // Row 14 (index 3)
  { label: 'Fonds commercial et droit au bail', prefixes: ['216', '217'] },
  // Row 15 (index 4)
  { label: 'Autres immobilisations incorporelles', prefixes: ['211', '218', '219'] },

  // Row 16 (index 5): subtotal IMMOBILISATIONS CORPORELLES
  { label: 'IMMOBILISATIONS CORPORELLES', prefixes: [], isSubtotal: true, children: [6, 7, 8, 9, 10, 11, 12] },
  // Row 17 (index 6)
  { label: 'Terrains hors immeuble de placement', prefixes: ['221', '222'] },
  // Row 18 (index 7)
  { label: 'Terrains - immeuble de placement', prefixes: ['223', '224'] },
  // Row 19 (index 8)
  { label: 'Bâtiments hors immeuble de placement', prefixes: ['231'] },
  // Row 20 (index 9)
  { label: 'Bâtiments - immeuble de placement', prefixes: ['232'] },
  // Row 21 (index 10)
  { label: 'Aménagements, agencements et installations', prefixes: ['241', '242', '243'] },
  // Row 22 (index 11)
  { label: 'Matériel, mobilier et actifs biologiques', prefixes: ['244', '246', '247', '248'] },
  // Row 23 (index 12)
  { label: 'Matériel de transport', prefixes: ['245'] },

  // Row 24 (index 13): AVANCES ET ACOMPTES
  { label: 'AVANCES ET ACOMPTES VERSES SUR IMMOBILISATIONS', prefixes: [], isSubtotal: true, children: [14, 15] },
  // Row 25 (index 14)
  { label: 'Avances et acomptes sur immobilisations incorporelles', prefixes: ['251', '252'] },
  // Row 26 (index 15)
  { label: 'Avances et acomptes sur immobilisations corporelles', prefixes: ['253', '254', '255', '258'] },

  // Row 27 (index 16): subtotal IMMOBILISATIONS FINANCIERES
  { label: 'IMMOBILISATIONS FINANCIERES', prefixes: [], isSubtotal: true, children: [17, 18] },
  // Row 28 (index 17)
  { label: 'Titres de participation', prefixes: ['26'] },
  // Row 29 (index 18)
  { label: 'Autres immobilisations financières', prefixes: ['271', '272', '273', '274', '275', '276', '277', '278'] },
]

function buildNote3A(
  bal: BalanceEntry[],
  balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 10
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 13 -']))
  merges.push(m(0, 0, 0, 9)) // A1:J1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [8, 'NOTE 3A\nSYSTEME NORMAL']))
  merges.push(m(1, 8, 1, 9)) // I2:J2

  // ── Rows 2-5 (L3-L6): standard header ──
  const hdr = headerRows(ent, ex, C, {
    labelCol: 0,
    valueCol: 2,
    sigleCol: 8,
    sigleValCol: 9,
  })
  // Override L5 to use NIF instead of NCC
  if (hdr.length >= 3) {
    hdr[2][0] = 'N° d\'identification fiscale :'
  }
  rows.push(...hdr)

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 3A : IMMOBILISATIONS (BRUTES)']))
  merges.push(m(6, 0, 6, 9)) // A7:J7

  // ── Row 7 (L8): header row 1 ──
  const r7 = emptyRow(C)
  r7[0] = 'SITUATIONS ET MOUVEMENTS'
  r7[3] = 'A'
  r7[4] = 'AUGMENTATIONS B'
  r7[7] = 'DIMINUTIONS C'
  r7[9] = 'D = A + B - C'
  rows.push(r7)
  merges.push(m(7, 0, 7, 2)) // A8:C8
  merges.push(m(7, 4, 7, 6)) // E8:G8
  merges.push(m(7, 7, 7, 8)) // H8:I8

  // ── Row 8 (L9): header row 2 ──
  const r8 = emptyRow(C)
  r8[3] = 'MONTANT BRUT\nA L\'OUVERTURE\nDE L\'EXERCICE'
  r8[4] = 'Acquisitions\nApports\nCréations'
  r8[5] = 'Virements\nde poste à poste'
  r8[6] = 'Suite à une\nréévaluation'
  r8[7] = 'Cessions\nScissions Hors\nservice'
  r8[8] = 'Virements\nde poste à poste'
  r8[9] = 'MONTANT BRUT\nA LA CLOTURE\nDE L\'EXERCICE'
  rows.push(r8)

  // ── Row 9 (L10): RUBRIQUES sub-header ──
  const r9 = emptyRow(C)
  r9[0] = 'RUBRIQUES'
  rows.push(r9)
  merges.push(m(9, 0, 9, 2)) // A10:C10

  // Column header merges (D9:D10 through J9:J10)
  merges.push(m(8, 3, 9, 3))   // D9:D10
  merges.push(m(8, 4, 9, 4))   // E9:E10
  merges.push(m(8, 5, 9, 5))   // F9:F10
  merges.push(m(8, 6, 9, 6))   // G9:G10
  merges.push(m(8, 7, 9, 7))   // H9:H10
  merges.push(m(8, 8, 9, 8))   // I9:I10
  merges.push(m(8, 9, 9, 9))   // J9:J10

  // ── Compute movement values for each detail line ──
  interface MovementVals {
    d: number // opening brut
    e: number // acquisitions
    f: number // virements in
    g: number // réévaluation
    h: number // cessions
    i: number // virements out
    j: number // closing brut
  }

  const lineVals: MovementVals[] = []
  for (const line of IMMO_3A_LINES) {
    if (line.isSubtotal) {
      // Will be computed after detail lines
      lineVals.push({ d: 0, e: 0, f: 0, g: 0, h: 0, i: 0, j: 0 })
    } else {
      const opening = getActifBrut(balN1, line.prefixes)
      const closing = getActifBrut(bal, line.prefixes)
      const acquisitions = Math.max(0, closing - opening)
      const cessions = Math.max(0, opening - closing)
      lineVals.push({
        d: opening,
        e: acquisitions,
        f: 0,
        g: 0,
        h: cessions,
        i: 0,
        j: closing,
      })
    }
  }

  // Compute subtotals
  for (let idx = 0; idx < IMMO_3A_LINES.length; idx++) {
    const line = IMMO_3A_LINES[idx]
    if (line.isSubtotal && line.children) {
      let sd = 0, se = 0, sf = 0, sg = 0, sh = 0, si = 0, sj = 0
      for (const ci of line.children) {
        sd += lineVals[ci].d
        se += lineVals[ci].e
        sf += lineVals[ci].f
        sg += lineVals[ci].g
        sh += lineVals[ci].h
        si += lineVals[ci].i
        sj += lineVals[ci].j
      }
      lineVals[idx] = { d: sd, e: se, f: sf, g: sg, h: sh, i: si, j: sj }
    }
  }

  // ── Output data rows (starting at row index 10) ──
  for (let idx = 0; idx < IMMO_3A_LINES.length; idx++) {
    const line = IMMO_3A_LINES[idx]
    const v = lineVals[idx]
    const row = emptyRow(C)
    row[0] = line.label
    row[3] = v.d
    row[4] = v.e
    row[5] = v.f
    row[6] = v.g
    row[7] = v.h
    row[8] = v.i
    row[9] = v.j
    rows.push(row)
    merges.push(m(rows.length - 1, 0, rows.length - 1, 2)) // A:C merged for labels
  }

  // ── Row 29 (L30): TOTAL GENERAL ──
  // Subtotal indices: 0 (incorporelles) + 5 (corporelles) + 13 (avances) + 16 (financières)
  const totalD = lineVals[0].d + lineVals[5].d + lineVals[13].d + lineVals[16].d
  const totalE = lineVals[0].e + lineVals[5].e + lineVals[13].e + lineVals[16].e
  const totalF = lineVals[0].f + lineVals[5].f + lineVals[13].f + lineVals[16].f
  const totalG = lineVals[0].g + lineVals[5].g + lineVals[13].g + lineVals[16].g
  const totalH = lineVals[0].h + lineVals[5].h + lineVals[13].h + lineVals[16].h
  const totalI = lineVals[0].i + lineVals[5].i + lineVals[13].i + lineVals[16].i
  const totalJ = lineVals[0].j + lineVals[5].j + lineVals[13].j + lineVals[16].j

  const rTotal = emptyRow(C)
  rTotal[0] = 'TOTAL GENERAL'
  rTotal[3] = totalD
  rTotal[4] = totalE
  rTotal[5] = totalF
  rTotal[6] = totalG
  rTotal[7] = totalH
  rTotal[8] = totalI
  rTotal[9] = totalJ
  rows.push(rTotal)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 2)) // A:C merged

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
// Sheet 18 — NOTE 3B : Biens pris en location-acquisition
//   12 columns (A=0 to L=11)
// ────────────────────────────────────────────────────────────────────────────

function buildNote3B(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 12
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 14 -']))
  merges.push(m(0, 0, 0, 11)) // A1:L1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [10, 'NOTE 3B\nSYSTEME NORMAL']))
  merges.push(m(1, 10, 1, 11)) // K2:L2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C, {
    labelCol: 0,
    valueCol: 2,
    sigleCol: 10,
    sigleValCol: 11,
  }))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 3B : BIENS PRIS EN LOCATION ACQUISITION']))
  merges.push(m(6, 0, 6, 11)) // A7:L7

  // ── Row 7 (L8): header row 1 ──
  const r7 = emptyRow(C)
  r7[0] = 'SITUATIONS ET MOUVEMENTS'
  r7[4] = 'NATURE DU\nCONTRAT'
  r7[5] = 'A'
  r7[6] = 'AUGMENTATIONS B'
  r7[9] = 'DIMINUTIONS C'
  r7[11] = 'D = A + B - C'
  rows.push(r7)
  merges.push(m(7, 0, 7, 3))   // A8:D8
  merges.push(m(7, 4, 8, 4))   // E8:E9 - Nature contrat merged 2 rows
  merges.push(m(7, 6, 7, 8))   // G8:I8
  merges.push(m(7, 9, 7, 10))  // J8:K8

  // ── Row 8 (L9): header row 2 ──
  const r8 = emptyRow(C)
  r8[5] = 'MONTANT BRUT\nA L\'OUVERTURE\nDE L\'EXERCICE'
  r8[6] = 'Acquisitions\nApports\nCréations'
  r8[7] = 'Virements\nde poste à poste'
  r8[8] = 'Suite à une\nréévaluation'
  r8[9] = 'Cessions\nScissions Hors\nservice'
  r8[10] = 'Virements\nde poste à poste'
  r8[11] = 'MONTANT BRUT\nA LA CLOTURE\nDE L\'EXERCICE'
  rows.push(r8)

  // ── Row 9 (L10): RUBRIQUES sub-header ──
  const r9 = emptyRow(C)
  r9[0] = 'RUBRIQUES'
  rows.push(r9)
  merges.push(m(9, 0, 9, 3)) // A10:D10

  // Column header merges (rows 8-9)
  merges.push(m(7, 0, 8, 3))   // A8:D9 - SITUATIONS merged
  merges.push(m(8, 5, 9, 5))   // F9:F10
  merges.push(m(8, 6, 9, 6))   // G9:G10
  merges.push(m(8, 7, 9, 7))   // H9:H10
  merges.push(m(8, 8, 9, 8))   // I9:I10
  merges.push(m(8, 9, 9, 9))   // J9:J10
  merges.push(m(8, 10, 9, 10)) // K9:K10
  merges.push(m(8, 11, 9, 11)) // L9:L10

  // ── Data rows (all 0 - manual entry) ──
  const locAcqItems = [
    'Terrains',
    'Bâtiments',
    'Matériel, mobilier et actifs biologiques',
    'Matériel de transport',
  ]

  for (const label of locAcqItems) {
    const row = emptyRow(C)
    row[0] = label
    row[4] = ''  // Nature du contrat (manual)
    row[5] = 0
    row[6] = 0
    row[7] = 0
    row[8] = 0
    row[9] = 0
    row[10] = 0
    row[11] = 0
    rows.push(row)
    merges.push(m(rows.length - 1, 0, rows.length - 1, 3)) // A:D merged
  }

  // ── TOTAL row ──
  const rTotal = emptyRow(C)
  rTotal[0] = 'TOTAL'
  rTotal[5] = 0
  rTotal[6] = 0
  rTotal[7] = 0
  rTotal[8] = 0
  rTotal[9] = 0
  rTotal[10] = 0
  rTotal[11] = 0
  rows.push(rTotal)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 3)) // A:D merged

  // ── Footnotes ──
  rows.push(emptyRow(C))
  const fn1 = emptyRow(C)
  fn1[0] = 'NB : Les contrats de location-acquisition sont des contrats de crédit-bail et de location-vente.'
  rows.push(fn1)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 11))

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
// Sheet 19 — NOTE 3C : Immobilisations (amortissements)
//   15 columns (A=0 to O=14)
// ────────────────────────────────────────────────────────────────────────────

/** Account prefixes for amortissement lines */
interface Amort3CLine {
  label: string
  prefixes: readonly string[]
  isSubtotal?: boolean
  children?: number[]
}

const AMORT_3C_LINES: Amort3CLine[] = [
  // Row 11 (index 0): Frais de développement
  { label: 'Frais de développement et de prospection', prefixes: ['2801', '2802', '2806'] },
  // Row 12 (index 1): Brevets, licences, logiciels
  { label: 'Brevets, licences, logiciels, et droits similaires', prefixes: ['2812', '2813', '2814', '2815'] },
  // Row 13 (index 2): Fonds commercial
  { label: 'Fonds commercial et droit au bail', prefixes: ['2816', '2817'] },
  // Row 14 (index 3): Autres incorp
  { label: 'Autres immobilisations incorporelles', prefixes: ['2811', '2818', '2819'] },
  // Row 15 (index 4): subtotal INCORPORELLES
  { label: 'IMMOBILISATIONS INCORPORELLES', prefixes: [], isSubtotal: true, children: [0, 1, 2, 3] },

  // Row 16 (index 5): Terrains hors imm placement
  { label: 'Terrains hors immeuble de placement', prefixes: ['2821', '2822'] },
  // Row 17 (index 6): Terrains imm placement
  { label: 'Terrains - immeuble de placement', prefixes: ['2823', '2824'] },
  // Row 18 (index 7): Bâtiments hors imm placement
  { label: 'Bâtiments hors immeuble de placement', prefixes: ['2831'] },
  // Row 19 (index 8): Bâtiments imm placement
  { label: 'Bâtiments - immeuble de placement', prefixes: ['2832'] },
  // Row 20 (index 9): Aménagements
  { label: 'Aménagements, agencements et installations', prefixes: ['2841', '2842', '2843'] },
  // Row 21 (index 10): Matériel, mobilier
  { label: 'Matériel, mobilier et actifs biologiques', prefixes: ['2844', '2846', '2847', '2848'] },
  // Row 22 (index 11): Matériel de transport
  { label: 'Matériel de transport', prefixes: ['2845'] },
  // Row 23 (index 12): subtotal CORPORELLES
  { label: 'IMMOBILISATIONS CORPORELLES', prefixes: [], isSubtotal: true, children: [5, 6, 7, 8, 9, 10, 11] },

  // Row 24 (index 13): TOTAL GENERAL
  { label: 'TOTAL GENERAL', prefixes: [], isSubtotal: true, children: [] }, // special: sum of 4 + 12
]

function buildNote3C(
  bal: BalanceEntry[],
  balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 15
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 15 -']))
  merges.push(m(0, 0, 0, 14)) // A1:O1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [13, 'NOTE 3C\nSYSTEME NORMAL']))
  merges.push(m(1, 13, 1, 14)) // N2:O2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C, {
    labelCol: 0,
    valueCol: 2,
    sigleCol: 12,
    sigleValCol: 14,
  }))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 3C : IMMOBILISATIONS (AMORTISSEMENTS)']))
  merges.push(m(6, 0, 6, 14)) // A7:O7

  // ── Row 7 (L8): header row 1 ──
  const r7 = emptyRow(C)
  r7[0] = 'SITUATIONS ET MOUVEMENTS'
  r7[3] = 'A'
  r7[5] = 'B - AUGMENTATIONS'
  r7[7] = 'C - DIMINUTIONS'
  r7[11] = 'D'
  r7[13] = 'E = A + B - C - D'
  rows.push(r7)
  merges.push(m(7, 0, 7, 2))   // A8:C8
  merges.push(m(7, 3, 7, 4))   // D8:E8
  merges.push(m(7, 5, 7, 6))   // F8:G8
  merges.push(m(7, 7, 7, 10))  // H8:K8
  merges.push(m(7, 11, 7, 12)) // L8:M8
  merges.push(m(7, 13, 7, 14)) // N8:O8

  // ── Row 8 (L9): header row 2 ──
  const r8 = emptyRow(C)
  r8[3] = 'Amortissements\ncumulés à\nl\'ouverture de\nl\'exercice'
  r8[5] = 'DOTATIONS DE\nL\'EXERCICE'
  r8[7] = 'Amortissements\nrelatifs aux\néléments sortis\nde l\'actif'
  r8[9] = 'Reprises\nd\'amortissements'
  r8[11] = 'Virements\nde poste\nà poste'
  r8[13] = 'Amortissements\ncumulés à la\nclôture de\nl\'exercice'
  rows.push(r8)

  // ── Row 9 (L10): RUBRIQUES sub-header ──
  const r9 = emptyRow(C)
  r9[0] = 'RUBRIQUES'
  rows.push(r9)
  merges.push(m(9, 0, 9, 2))   // A10:C10

  // Column header merges (rows 8-9)
  merges.push(m(8, 3, 9, 4))   // D9:E10
  merges.push(m(8, 5, 9, 6))   // F9:G10
  merges.push(m(8, 7, 9, 8))   // H9:I10
  merges.push(m(8, 9, 9, 10))  // J9:K10
  merges.push(m(8, 11, 9, 12)) // L9:M10
  merges.push(m(8, 13, 9, 14)) // N9:O10

  // ── Compute amort values for each line ──
  interface AmortVals {
    de: number  // D-E: opening cumul (cols 3-4)
    fg: number  // F-G: dotations (cols 5-6)
    hi: number  // H-I: amort elements sortis (cols 7-8)
    jk: number  // J-K: reprises (cols 9-10)
    lm: number  // L-M: virements (cols 11-12)
    no: number  // N-O: closing cumul (cols 13-14)
  }

  const amortVals: AmortVals[] = []
  for (const line of AMORT_3C_LINES) {
    if (line.isSubtotal) {
      amortVals.push({ de: 0, fg: 0, hi: 0, jk: 0, lm: 0, no: 0 })
    } else {
      const opening = getAmortProv(balN1, line.prefixes)
      const closing = getAmortProv(bal, line.prefixes)
      const dotations = Math.max(0, closing - opening)
      const reprises = Math.max(0, opening - closing)
      amortVals.push({
        de: opening,
        fg: dotations,
        hi: 0,
        jk: reprises,
        lm: 0,
        no: closing,
      })
    }
  }

  // Compute subtotals
  for (let idx = 0; idx < AMORT_3C_LINES.length; idx++) {
    const line = AMORT_3C_LINES[idx]
    if (line.isSubtotal && line.children && line.children.length > 0) {
      let sde = 0, sfg = 0, shi = 0, sjk = 0, slm = 0, sno = 0
      for (const ci of line.children) {
        sde += amortVals[ci].de
        sfg += amortVals[ci].fg
        shi += amortVals[ci].hi
        sjk += amortVals[ci].jk
        slm += amortVals[ci].lm
        sno += amortVals[ci].no
      }
      amortVals[idx] = { de: sde, fg: sfg, hi: shi, jk: sjk, lm: slm, no: sno }
    }
  }

  // TOTAL GENERAL = INCORPORELLES + CORPORELLES
  const totalIdx = AMORT_3C_LINES.length - 1
  amortVals[totalIdx] = {
    de: amortVals[4].de + amortVals[12].de,
    fg: amortVals[4].fg + amortVals[12].fg,
    hi: amortVals[4].hi + amortVals[12].hi,
    jk: amortVals[4].jk + amortVals[12].jk,
    lm: amortVals[4].lm + amortVals[12].lm,
    no: amortVals[4].no + amortVals[12].no,
  }

  // ── Output data rows (starting at row index 10) ──
  for (let idx = 0; idx < AMORT_3C_LINES.length; idx++) {
    const line = AMORT_3C_LINES[idx]
    const v = amortVals[idx]
    const row = emptyRow(C)
    row[0] = line.label
    row[3] = v.de
    row[5] = v.fg
    row[7] = v.hi
    row[9] = v.jk
    row[11] = v.lm
    row[13] = v.no
    rows.push(row)
    merges.push(m(rows.length - 1, 0, rows.length - 1, 2)) // A:C merged
  }

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
// Sheet 20 — NOTE 3C BIS : Immobilisations (dépréciations)
//   11 columns (A=0 to K=10)
// ────────────────────────────────────────────────────────────────────────────

/** Account prefixes for depreciation lines */
interface Deprec3CBisLine {
  label: string
  prefixes: readonly string[]
  isSubtotal?: boolean
  children?: number[]
}

const DEPREC_3CBIS_LINES: Deprec3CBisLine[] = [
  // Row 11 (index 0): Frais de développement
  { label: 'Frais de développement et de prospection', prefixes: ['2901', '2902', '2906'] },
  // Row 12 (index 1): Brevets, licences
  { label: 'Brevets, licences, logiciels, et droits similaires', prefixes: ['2912', '2913', '2914', '2915'] },
  // Row 13 (index 2): Fonds commercial
  { label: 'Fonds commercial et droit au bail', prefixes: ['2916', '2917'] },
  // Row 14 (index 3): Autres incorp
  { label: 'Autres immobilisations incorporelles', prefixes: ['2911', '2918', '2919'] },
  // Row 15 (index 4): subtotal INCORPORELLES
  { label: 'IMMOBILISATIONS INCORPORELLES', prefixes: [], isSubtotal: true, children: [0, 1, 2, 3] },

  // Row 16 (index 5): Terrains hors imm placement
  { label: 'Terrains hors immeuble de placement', prefixes: ['2921', '2922'] },
  // Row 17 (index 6): Terrains imm placement
  { label: 'Terrains - immeuble de placement', prefixes: ['2923', '2924'] },
  // Row 18 (index 7): Bâtiments hors
  { label: 'Bâtiments hors immeuble de placement', prefixes: ['2931'] },
  // Row 19 (index 8): Bâtiments imm placement
  { label: 'Bâtiments - immeuble de placement', prefixes: ['2932'] },
  // Row 20 (index 9): Aménagements
  { label: 'Aménagements, agencements et installations', prefixes: ['2941', '2942', '2943'] },
  // Row 21 (index 10): Matériel, mobilier
  { label: 'Matériel, mobilier et actifs biologiques', prefixes: ['2944', '2946', '2947', '2948'] },
  // Row 22 (index 11): Matériel de transport
  { label: 'Matériel de transport', prefixes: ['2945'] },
  // Row 23 (index 12): subtotal CORPORELLES
  { label: 'IMMOBILISATIONS CORPORELLES', prefixes: [], isSubtotal: true, children: [5, 6, 7, 8, 9, 10, 11] },

  // Row 24 (index 13): Immobilisations financières
  { label: 'IMMOBILISATIONS FINANCIERES', prefixes: ['296', '297'] },

  // Row 25 (index 14): TOTAL GENERAL
  { label: 'TOTAL GENERAL', prefixes: [], isSubtotal: true, children: [] }, // special
]

function buildNote3CBis(
  bal: BalanceEntry[],
  balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 11
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 16 -']))
  merges.push(m(0, 0, 0, 10)) // A1:K1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [9, 'NOTE 3C BIS\nSYSTEME NORMAL']))
  merges.push(m(1, 9, 1, 10)) // J2:K2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C, {
    labelCol: 0,
    valueCol: 2,
    sigleCol: 9,
    sigleValCol: 10,
  }))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 3C BIS : IMMOBILISATIONS (DEPRECIATIONS)']))
  merges.push(m(6, 0, 6, 10)) // A7:K7

  // ── Row 7 (L8): header row 1 ──
  const r7 = emptyRow(C)
  r7[0] = 'SITUATIONS ET MOUVEMENTS'
  r7[3] = 'A'
  r7[5] = 'AUGMENTATIONS B'
  r7[7] = 'DIMINUTIONS C'
  r7[9] = 'D = A + B - C'
  rows.push(r7)
  merges.push(m(7, 0, 7, 2))  // A8:C8
  merges.push(m(7, 3, 7, 4))  // D8:E8
  merges.push(m(7, 5, 7, 6))  // F8:G8
  merges.push(m(7, 7, 7, 8))  // H8:I8
  merges.push(m(7, 9, 7, 10)) // J8:K8

  // ── Row 8 (L9): header row 2 ──
  const r8 = emptyRow(C)
  r8[3] = 'Dépréciations\ncumulées à\nl\'ouverture de\nl\'exercice'
  r8[5] = 'Dotations de\nl\'exercice'
  r8[7] = 'Reprises de\nl\'exercice'
  r8[9] = 'Dépréciations\ncumulées à la\nclôture de\nl\'exercice'
  rows.push(r8)

  // ── Row 9 (L10): RUBRIQUES sub-header ──
  const r9 = emptyRow(C)
  r9[0] = 'RUBRIQUES'
  rows.push(r9)
  merges.push(m(9, 0, 9, 2)) // A10:C10

  // Column header merges (rows 8-9)
  merges.push(m(8, 3, 9, 4))   // D9:E10
  merges.push(m(8, 5, 9, 6))   // F9:G10
  merges.push(m(8, 7, 9, 8))   // H9:I10
  merges.push(m(8, 9, 9, 10))  // J9:K10

  // ── Compute depreciation values ──
  interface DeprecVals {
    de: number  // D-E: opening
    fg: number  // F-G: dotations
    hi: number  // H-I: reprises
    jk: number  // J-K: closing = de + fg - hi
  }

  const deprecVals: DeprecVals[] = []
  for (const line of DEPREC_3CBIS_LINES) {
    if (line.isSubtotal) {
      deprecVals.push({ de: 0, fg: 0, hi: 0, jk: 0 })
    } else {
      const opening = getAmortProv(balN1, line.prefixes)
      const closing = getAmortProv(bal, line.prefixes)
      const dotations = Math.max(0, closing - opening)
      const reprises = Math.max(0, opening - closing)
      deprecVals.push({
        de: opening,
        fg: dotations,
        hi: reprises,
        jk: closing,
      })
    }
  }

  // Compute subtotals
  for (let idx = 0; idx < DEPREC_3CBIS_LINES.length; idx++) {
    const line = DEPREC_3CBIS_LINES[idx]
    if (line.isSubtotal && line.children && line.children.length > 0) {
      let sde = 0, sfg = 0, shi = 0, sjk = 0
      for (const ci of line.children) {
        sde += deprecVals[ci].de
        sfg += deprecVals[ci].fg
        shi += deprecVals[ci].hi
        sjk += deprecVals[ci].jk
      }
      deprecVals[idx] = { de: sde, fg: sfg, hi: shi, jk: sjk }
    }
  }

  // TOTAL GENERAL = INCORPORELLES(4) + CORPORELLES(12) + FINANCIERES(13)
  const totalIdx = DEPREC_3CBIS_LINES.length - 1
  deprecVals[totalIdx] = {
    de: deprecVals[4].de + deprecVals[12].de + deprecVals[13].de,
    fg: deprecVals[4].fg + deprecVals[12].fg + deprecVals[13].fg,
    hi: deprecVals[4].hi + deprecVals[12].hi + deprecVals[13].hi,
    jk: deprecVals[4].jk + deprecVals[12].jk + deprecVals[13].jk,
  }

  // ── Output data rows ──
  for (let idx = 0; idx < DEPREC_3CBIS_LINES.length; idx++) {
    const line = DEPREC_3CBIS_LINES[idx]
    const v = deprecVals[idx]
    const row = emptyRow(C)
    row[0] = line.label
    row[3] = v.de
    row[5] = v.fg
    row[7] = v.hi
    row[9] = v.jk
    rows.push(row)
    merges.push(m(rows.length - 1, 0, rows.length - 1, 2)) // A:C merged
  }

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
// Sheet 21 — NOTE 3D : Plus-values et moins-values de cession
//   8 columns (A=0 to H=7)
// ────────────────────────────────────────────────────────────────────────────

interface Cession3DLine {
  label: string
  brutPfx: readonly string[]
  amortPfx: readonly string[]
  isSubtotal?: boolean
  children?: number[]
}

const CESSION_3D_LINES: Cession3DLine[] = [
  // IMMOBILISATIONS INCORPORELLES
  { label: 'IMMOBILISATIONS INCORPORELLES', brutPfx: [], amortPfx: [], isSubtotal: true, children: [1, 2, 3, 4] },
  { label: 'Frais de développement et de prospection', brutPfx: ['201', '202', '206'], amortPfx: ['2801', '2802', '2806'] },
  { label: 'Brevets, licences, logiciels, et droits similaires', brutPfx: ['212', '213', '214', '215'], amortPfx: ['2812', '2813', '2814', '2815'] },
  { label: 'Fonds commercial et droit au bail', brutPfx: ['216', '217'], amortPfx: ['2816', '2817'] },
  { label: 'Autres immobilisations incorporelles', brutPfx: ['211', '218', '219'], amortPfx: ['2811', '2818', '2819'] },

  // IMMOBILISATIONS CORPORELLES
  { label: 'IMMOBILISATIONS CORPORELLES', brutPfx: [], amortPfx: [], isSubtotal: true, children: [6, 7, 8, 9, 10, 11, 12] },
  { label: 'Terrains hors immeuble de placement', brutPfx: ['221', '222'], amortPfx: ['2821', '2822'] },
  { label: 'Terrains - immeuble de placement', brutPfx: ['223', '224'], amortPfx: ['2823', '2824'] },
  { label: 'Bâtiments hors immeuble de placement', brutPfx: ['231'], amortPfx: ['2831'] },
  { label: 'Bâtiments - immeuble de placement', brutPfx: ['232'], amortPfx: ['2832'] },
  { label: 'Aménagements, agencements et installations', brutPfx: ['241', '242', '243'], amortPfx: ['2841', '2842', '2843'] },
  { label: 'Matériel, mobilier et actifs biologiques', brutPfx: ['244', '246', '247', '248'], amortPfx: ['2844', '2846', '2847', '2848'] },
  { label: 'Matériel de transport', brutPfx: ['245'], amortPfx: ['2845'] },

  // IMMOBILISATIONS FINANCIERES
  { label: 'IMMOBILISATIONS FINANCIERES', brutPfx: [], amortPfx: [], isSubtotal: true, children: [14, 15] },
  { label: 'Titres de participation', brutPfx: ['26'], amortPfx: ['296'] },
  { label: 'Autres immobilisations financières', brutPfx: ['271', '272', '273', '274', '275', '276', '277', '278'], amortPfx: ['297'] },

  // TOTAL GENERAL
  { label: 'TOTAL GENERAL', brutPfx: [], amortPfx: [], isSubtotal: true, children: [] }, // special
]

function buildNote3D(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 8
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 17 -']))
  merges.push(m(0, 0, 0, 7)) // A1:H1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [6, 'NOTE 3D\nSYSTEME NORMAL']))
  merges.push(m(1, 6, 1, 7)) // G2:H2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C, {
    labelCol: 0,
    valueCol: 2,
    sigleCol: 6,
    sigleValCol: 7,
  }))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 3D : PLUS-VALUES ET MOINS-VALUES DE CESSION']))
  merges.push(m(6, 0, 6, 7)) // A7:H7

  // ── Row 7 (L8): header row 1 ──
  const r7 = emptyRow(C)
  r7[0] = 'RUBRIQUES'
  r7[3] = 'Montant brut'
  r7[4] = 'Amortissements\npratiqués'
  r7[5] = 'V.C.N.'
  r7[6] = 'Prix de\ncession'
  r7[7] = 'Plus/Moins\nvalue'
  rows.push(r7)
  merges.push(m(7, 0, 8, 2)) // A8:C9 - RUBRIQUES merged

  // ── Row 8 (L9): sub-headers ──
  const r8 = emptyRow(C)
  r8[3] = 'A'
  r8[4] = 'B'
  r8[5] = 'C = A - B'
  r8[6] = 'D'
  r8[7] = 'E = D - C'
  rows.push(r8)

  // ── Data rows (all 0 - cessions are manual entry) ──
  interface CessionVals {
    a: number // montant brut
    b: number // amortissements pratiqués
    c: number // VCN = A - B
    d: number // prix cession
    e: number // plus/moins value = D - C
  }

  const cessionVals: CessionVals[] = []
  for (let _i = 0; _i < CESSION_3D_LINES.length; _i++) {
    // Cessions are manual entry items; default to 0
    cessionVals.push({ a: 0, b: 0, c: 0, d: 0, e: 0 })
  }

  // Compute subtotals
  for (let idx = 0; idx < CESSION_3D_LINES.length; idx++) {
    const line = CESSION_3D_LINES[idx]
    if (line.isSubtotal && line.children && line.children.length > 0) {
      let sa = 0, sb = 0, sc = 0, sd = 0, se = 0
      for (const ci of line.children) {
        sa += cessionVals[ci].a
        sb += cessionVals[ci].b
        sc += cessionVals[ci].c
        sd += cessionVals[ci].d
        se += cessionVals[ci].e
      }
      cessionVals[idx] = { a: sa, b: sb, c: sc, d: sd, e: se }
    }
  }

  // TOTAL GENERAL = INCORPORELLES(0) + CORPORELLES(5) + FINANCIERES(13)
  const totalIdx = CESSION_3D_LINES.length - 1
  cessionVals[totalIdx] = {
    a: cessionVals[0].a + cessionVals[5].a + cessionVals[13].a,
    b: cessionVals[0].b + cessionVals[5].b + cessionVals[13].b,
    c: cessionVals[0].c + cessionVals[5].c + cessionVals[13].c,
    d: cessionVals[0].d + cessionVals[5].d + cessionVals[13].d,
    e: cessionVals[0].e + cessionVals[5].e + cessionVals[13].e,
  }

  // ── Output data rows ──
  for (let idx = 0; idx < CESSION_3D_LINES.length; idx++) {
    const line = CESSION_3D_LINES[idx]
    const v = cessionVals[idx]
    const row = emptyRow(C)
    row[0] = line.label
    row[3] = v.a
    row[4] = v.b
    row[5] = v.c
    row[6] = v.d
    row[7] = v.e
    rows.push(row)
    merges.push(m(rows.length - 1, 0, rows.length - 1, 2)) // A:C merged
  }

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
// Sheet 22 — NOTE 3E : Informations sur les réévaluations
//   9 columns (A=0 to I=8)
// ────────────────────────────────────────────────────────────────────────────

function buildNote3E(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 9
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 18 -']))
  merges.push(m(0, 0, 0, 8)) // A1:I1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [7, 'NOTE 3E\nSYSTEME NORMAL']))
  merges.push(m(1, 7, 1, 8)) // H2:I2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C, {
    labelCol: 0,
    valueCol: 2,
    sigleCol: 7,
    sigleValCol: 8,
  }))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 3E : INFORMATIONS SUR LES REEVALUATIONS EFFECTUEES PAR L\'ENTITE']))
  merges.push(m(6, 0, 6, 8)) // A7:I7

  // ── Row 7 (L8): text introduction ──
  rows.push(rowAt(C, [0, 'L\'entité indique ci-après les informations relatives aux réévaluations effectuées.']))
  merges.push(m(7, 0, 7, 8)) // A8:I8

  // ── Row 8: empty separator ──
  rows.push(emptyRow(C))

  // ── Row 9 (L10): table header ──
  const r9 = emptyRow(C)
  r9[0] = 'Eléments réévalués'
  r9[3] = 'Montants coûts\nhistoriques'
  r9[5] = 'Montants\nréévalués'
  r9[7] = 'Ecarts de\nréévaluation'
  r9[8] = 'Amortissements\nsupplémentaires'
  rows.push(r9)
  merges.push(m(9, 0, 9, 2)) // A10:C10
  merges.push(m(9, 3, 9, 4)) // D10:E10
  merges.push(m(9, 5, 9, 6)) // F10:G10

  // ── Data rows (all 0 - réévaluations are manual) ──
  const reevItems = [
    'Terrains',
    'Bâtiments',
    'Matériel et outillage',
    'Matériel de transport',
    'Autres immobilisations',
  ]

  for (const label of reevItems) {
    const row = emptyRow(C)
    row[0] = label
    row[3] = 0
    row[5] = 0
    row[7] = 0
    row[8] = 0
    rows.push(row)
    merges.push(m(rows.length - 1, 0, rows.length - 1, 2))
    merges.push(m(rows.length - 1, 3, rows.length - 1, 4))
    merges.push(m(rows.length - 1, 5, rows.length - 1, 6))
  }

  // ── TOTAL ──
  const rTotal = emptyRow(C)
  rTotal[0] = 'TOTAL'
  rTotal[3] = 0
  rTotal[5] = 0
  rTotal[7] = 0
  rTotal[8] = 0
  rows.push(rTotal)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 2))
  merges.push(m(rows.length - 1, 3, rows.length - 1, 4))
  merges.push(m(rows.length - 1, 5, rows.length - 1, 6))

  // ── Separator ──
  rows.push(emptyRow(C))

  // ── Text about method ──
  rows.push(rowAt(C, [0, 'Méthode utilisée pour la réévaluation :']))
  merges.push(m(rows.length - 1, 0, rows.length - 1, 8))

  rows.push(rowAt(C, [0, '']))
  merges.push(m(rows.length - 1, 0, rows.length - 1, 8))

  // ── Text about fiscal treatment ──
  rows.push(rowAt(C, [0, 'Traitement fiscal de l\'écart de réévaluation :']))
  merges.push(m(rows.length - 1, 0, rows.length - 1, 8))

  rows.push(rowAt(C, [0, '']))
  merges.push(m(rows.length - 1, 0, rows.length - 1, 8))

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
// Sheet 23 — NOTE 4 : Immobilisations financières
//   11 columns (A=0 to K=10)
// ────────────────────────────────────────────────────────────────────────────

interface ImmoFin4Line {
  label: string
  prefixes: readonly string[]
}

const IMMO_FIN_4_LINES: ImmoFin4Line[] = [
  { label: 'Titres de participation', prefixes: ['26'] },
  { label: 'Prêts et créances non commerciales', prefixes: ['271'] },
  { label: 'Prêt au personnel', prefixes: ['272'] },
  { label: 'Créances sur l\'état', prefixes: ['273'] },
  { label: 'Titres immobilisés', prefixes: ['274'] },
  { label: 'Dépôts et cautionnements versés', prefixes: ['275'] },
  { label: 'Intérêts courus', prefixes: ['276'] },
  { label: 'Créances rattachées à des participations et avances au GIE', prefixes: ['277'] },
  { label: 'Immobilisations financières diverses', prefixes: ['278'] },
]

function buildNote4(
  bal: BalanceEntry[],
  balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 11
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  const yearN = exerciceYear(ex)
  const yearN1 = exerciceYearN1(ex)

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 19 -']))
  merges.push(m(0, 0, 0, 10)) // A1:K1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [9, 'NOTE 4\nSYSTEME NORMAL']))
  merges.push(m(1, 9, 1, 10)) // J2:K2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C, {
    labelCol: 0,
    valueCol: 2,
    sigleCol: 9,
    sigleValCol: 10,
  }))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 4 : IMMOBILISATIONS FINANCIERES']))
  merges.push(m(6, 0, 6, 10)) // A7:K7

  // ════════════════════════════════════════════════════════════════════════
  // TABLE 1: Immobilisations financières - détail
  // ════════════════════════════════════════════════════════════════════════

  // ── Row 7 (L8): header ──
  const r7 = emptyRow(C)
  r7[0] = 'Libellés'
  r7[5] = `Année ${yearN}`
  r7[6] = `Année ${yearN1}`
  r7[7] = 'Variation %'
  r7[8] = 'Créances\n≤ 1 an'
  r7[9] = 'Créances\n1 à 2 ans'
  r7[10] = 'Créances\n> 2 ans'
  rows.push(r7)
  merges.push(m(7, 0, 7, 4)) // A8:E8

  // ── Compute values for each line ──
  let totalBrutN = 0
  let totalBrutN1 = 0

  const detailRows: Row[] = []
  for (const line of IMMO_FIN_4_LINES) {
    const valN = getActifBrut(bal, line.prefixes)
    const valN1 = getActifBrut(balN1, line.prefixes)
    totalBrutN += valN
    totalBrutN1 += valN1
    const varPct = variationPct(valN, valN1)

    const row = emptyRow(C)
    row[0] = line.label
    row[5] = valN
    row[6] = valN1
    row[7] = varPct
    row[8] = 0
    row[9] = 0
    row[10] = 0
    detailRows.push(row)
  }

  for (const row of detailRows) {
    rows.push(row)
    merges.push(m(rows.length - 1, 0, rows.length - 1, 4)) // A:E merged
  }

  // ── TOTAL BRUT ──
  const rTotalBrut = emptyRow(C)
  rTotalBrut[0] = 'TOTAL BRUT'
  rTotalBrut[5] = totalBrutN
  rTotalBrut[6] = totalBrutN1
  rTotalBrut[7] = variationPct(totalBrutN, totalBrutN1)
  rTotalBrut[8] = 0
  rTotalBrut[9] = 0
  rTotalBrut[10] = 0
  rows.push(rTotalBrut)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 4))

  // ── Dépréciations titres de participation ──
  const depTitresN = getAmortProv(bal, ['296'])
  const depTitresN1 = getAmortProv(balN1, ['296'])

  const rDepTitres = emptyRow(C)
  rDepTitres[0] = 'Dépréciations titres de participation'
  rDepTitres[5] = depTitresN
  rDepTitres[6] = depTitresN1
  rDepTitres[7] = variationPct(depTitresN, depTitresN1)
  rows.push(rDepTitres)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 4))

  // ── Dépréciations autres ──
  const depAutresN = getAmortProv(bal, ['297'])
  const depAutresN1 = getAmortProv(balN1, ['297'])

  const rDepAutres = emptyRow(C)
  rDepAutres[0] = 'Dépréciations autres immobilisations financières'
  rDepAutres[5] = depAutresN
  rDepAutres[6] = depAutresN1
  rDepAutres[7] = variationPct(depAutresN, depAutresN1)
  rows.push(rDepAutres)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 4))

  // ── TOTAL NET ──
  const totalNetN = totalBrutN - depTitresN - depAutresN
  const totalNetN1 = totalBrutN1 - depTitresN1 - depAutresN1

  const rTotalNet = emptyRow(C)
  rTotalNet[0] = 'TOTAL NET'
  rTotalNet[5] = totalNetN
  rTotalNet[6] = totalNetN1
  rTotalNet[7] = variationPct(totalNetN, totalNetN1)
  rows.push(rTotalNet)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 4))

  // ════════════════════════════════════════════════════════════════════════
  // TABLE 2: Liste des filiales et participations
  // ════════════════════════════════════════════════════════════════════════

  rows.push(emptyRow(C))

  const rT2Title = emptyRow(C)
  rT2Title[0] = 'LISTE DES FILIALES ET PARTICIPATIONS'
  rows.push(rT2Title)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 10))

  // ── Table 2 header ──
  const rT2Hdr = emptyRow(C)
  rT2Hdr[0] = 'Dénomination'
  rT2Hdr[2] = 'Localisation'
  rT2Hdr[4] = 'Valeur\nd\'acquisition'
  rT2Hdr[5] = '% Détenu'
  rT2Hdr[6] = 'Capitaux\npropres'
  rT2Hdr[7] = 'Chiffre\nd\'affaires'
  rT2Hdr[8] = 'Résultat'
  rT2Hdr[9] = 'Dividendes\nreçus'
  rT2Hdr[10] = 'Part de\nbénéfice'
  rows.push(rT2Hdr)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 1)) // A:B merged
  merges.push(m(rows.length - 1, 2, rows.length - 1, 3)) // C:D merged

  // ── Empty data rows for filiales (5 placeholder lines) ──
  for (let i = 0; i < 5; i++) {
    const row = emptyRow(C)
    row[0] = ''
    row[2] = ''
    row[4] = 0
    row[5] = 0
    row[6] = 0
    row[7] = 0
    row[8] = 0
    row[9] = 0
    row[10] = 0
    rows.push(row)
    merges.push(m(rows.length - 1, 0, rows.length - 1, 1))
    merges.push(m(rows.length - 1, 2, rows.length - 1, 3))
  }

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
// Sheet 24 — NOTE 5 : Actif circulant et dettes circulantes HAO
//   9 columns (A=0 to I=8)
// ────────────────────────────────────────────────────────────────────────────

function buildNote5(
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
  rows.push(rowAt(C, [0, '- 20 -']))
  merges.push(m(0, 0, 0, 8)) // A1:I1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [7, 'NOTE 5\nSYSTEME NORMAL']))
  merges.push(m(1, 7, 1, 8)) // H2:I2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C, {
    labelCol: 0,
    valueCol: 2,
    sigleCol: 7,
    sigleValCol: 8,
  }))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 5 : ACTIF CIRCULANT ET DETTES CIRCULANTES HAO']))
  merges.push(m(6, 0, 6, 8)) // A7:I7

  // ════════════════════════════════════════════════════════════════════════
  // SUB-TABLE 1: ACTIF CIRCULANT HAO
  // ════════════════════════════════════════════════════════════════════════

  // ── Header ──
  const rH1 = emptyRow(C)
  rH1[0] = 'ACTIF CIRCULANT HAO'
  rH1[4] = `Année ${yearN}`
  rH1[6] = `Année ${yearN1}`
  rH1[8] = 'Variation %'
  rows.push(rH1)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 3)) // A:D merged
  merges.push(m(rows.length - 1, 4, rows.length - 1, 5)) // E:F merged
  merges.push(m(rows.length - 1, 6, rows.length - 1, 7)) // G:H merged

  // ── Sub-header ──
  const rSH1 = emptyRow(C)
  rSH1[0] = 'Libellés'
  rows.push(rSH1)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 3))

  // Créances sur cessions d'immobilisations
  const creanceCessionN = getActifBrut(bal, ['485'])
  const creanceCessionN1 = getActifBrut(balN1, ['485'])

  const rCreanceCession = emptyRow(C)
  rCreanceCession[0] = 'Créances sur cessions d\'immobilisations'
  rCreanceCession[4] = creanceCessionN
  rCreanceCession[6] = creanceCessionN1
  rCreanceCession[8] = variationPct(creanceCessionN, creanceCessionN1)
  rows.push(rCreanceCession)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 3))
  merges.push(m(rows.length - 1, 4, rows.length - 1, 5))
  merges.push(m(rows.length - 1, 6, rows.length - 1, 7))

  // Autres créances HAO
  const autresCreancesHAON = getActifBrut(bal, ['481', '482', '488'])
  const autresCreancesHAON1 = getActifBrut(balN1, ['481', '482', '488'])

  const rAutresCreances = emptyRow(C)
  rAutresCreances[0] = 'Autres créances HAO'
  rAutresCreances[4] = autresCreancesHAON
  rAutresCreances[6] = autresCreancesHAON1
  rAutresCreances[8] = variationPct(autresCreancesHAON, autresCreancesHAON1)
  rows.push(rAutresCreances)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 3))
  merges.push(m(rows.length - 1, 4, rows.length - 1, 5))
  merges.push(m(rows.length - 1, 6, rows.length - 1, 7))

  // TOTAL BRUT
  const totalBrutActifHAON = creanceCessionN + autresCreancesHAON
  const totalBrutActifHAON1 = creanceCessionN1 + autresCreancesHAON1

  const rTotalBrutActif = emptyRow(C)
  rTotalBrutActif[0] = 'TOTAL BRUT'
  rTotalBrutActif[4] = totalBrutActifHAON
  rTotalBrutActif[6] = totalBrutActifHAON1
  rTotalBrutActif[8] = variationPct(totalBrutActifHAON, totalBrutActifHAON1)
  rows.push(rTotalBrutActif)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 3))
  merges.push(m(rows.length - 1, 4, rows.length - 1, 5))
  merges.push(m(rows.length - 1, 6, rows.length - 1, 7))

  // Dépréciations
  const depActifHAON = getAmortProv(bal, ['490'])
  const depActifHAON1 = getAmortProv(balN1, ['490'])

  const rDepActif = emptyRow(C)
  rDepActif[0] = 'Dépréciations'
  rDepActif[4] = depActifHAON
  rDepActif[6] = depActifHAON1
  rDepActif[8] = variationPct(depActifHAON, depActifHAON1)
  rows.push(rDepActif)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 3))
  merges.push(m(rows.length - 1, 4, rows.length - 1, 5))
  merges.push(m(rows.length - 1, 6, rows.length - 1, 7))

  // TOTAL NET
  const totalNetActifHAON = totalBrutActifHAON - depActifHAON
  const totalNetActifHAON1 = totalBrutActifHAON1 - depActifHAON1

  const rTotalNetActif = emptyRow(C)
  rTotalNetActif[0] = 'TOTAL NET'
  rTotalNetActif[4] = totalNetActifHAON
  rTotalNetActif[6] = totalNetActifHAON1
  rTotalNetActif[8] = variationPct(totalNetActifHAON, totalNetActifHAON1)
  rows.push(rTotalNetActif)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 3))
  merges.push(m(rows.length - 1, 4, rows.length - 1, 5))
  merges.push(m(rows.length - 1, 6, rows.length - 1, 7))

  // ═══════════════════════════════════════════════════════════════════════
  // Separator
  // ═══════════════════════════════════════════════════════════════════════
  rows.push(emptyRow(C))

  // ════════════════════════════════════════════════════════════════════════
  // SUB-TABLE 2: DETTES CIRCULANTES HAO
  // ════════════════════════════════════════════════════════════════════════

  // ── Header ──
  const rH2 = emptyRow(C)
  rH2[0] = 'DETTES CIRCULANTES HAO'
  rH2[4] = `Année ${yearN}`
  rH2[6] = `Année ${yearN1}`
  rH2[8] = 'Variation %'
  rows.push(rH2)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 3))
  merges.push(m(rows.length - 1, 4, rows.length - 1, 5))
  merges.push(m(rows.length - 1, 6, rows.length - 1, 7))

  // ── Sub-header ──
  const rSH2 = emptyRow(C)
  rSH2[0] = 'Libellés'
  rows.push(rSH2)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 3))

  // Fournisseurs d'investissements
  const fournInvestN = getPassif(bal, ['481', '482'])
  const fournInvestN1 = getPassif(balN1, ['481', '482'])

  const rFournInvest = emptyRow(C)
  rFournInvest[0] = 'Fournisseurs d\'investissements'
  rFournInvest[4] = fournInvestN
  rFournInvest[6] = fournInvestN1
  rFournInvest[8] = variationPct(fournInvestN, fournInvestN1)
  rows.push(rFournInvest)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 3))
  merges.push(m(rows.length - 1, 4, rows.length - 1, 5))
  merges.push(m(rows.length - 1, 6, rows.length - 1, 7))

  // Fournisseurs investissements effets à payer
  const rFournEffets = emptyRow(C)
  rFournEffets[0] = 'Fournisseurs d\'investissements - effets à payer'
  rFournEffets[4] = 0
  rFournEffets[6] = 0
  rFournEffets[8] = 0
  rows.push(rFournEffets)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 3))
  merges.push(m(rows.length - 1, 4, rows.length - 1, 5))
  merges.push(m(rows.length - 1, 6, rows.length - 1, 7))

  // Versements restant sur titres non libérés
  const rVersements = emptyRow(C)
  rVersements[0] = 'Versements restant à effectuer sur titres non libérés'
  rVersements[4] = 0
  rVersements[6] = 0
  rVersements[8] = 0
  rows.push(rVersements)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 3))
  merges.push(m(rows.length - 1, 4, rows.length - 1, 5))
  merges.push(m(rows.length - 1, 6, rows.length - 1, 7))

  // Autres dettes HAO
  const rAutresDettes = emptyRow(C)
  rAutresDettes[0] = 'Autres dettes HAO'
  rAutresDettes[4] = 0
  rAutresDettes[6] = 0
  rAutresDettes[8] = 0
  rows.push(rAutresDettes)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 3))
  merges.push(m(rows.length - 1, 4, rows.length - 1, 5))
  merges.push(m(rows.length - 1, 6, rows.length - 1, 7))

  // TOTAL
  const totalDettesN = fournInvestN
  const totalDettesN1 = fournInvestN1

  const rTotalDettes = emptyRow(C)
  rTotalDettes[0] = 'TOTAL'
  rTotalDettes[4] = totalDettesN
  rTotalDettes[6] = totalDettesN1
  rTotalDettes[8] = variationPct(totalDettesN, totalDettesN1)
  rows.push(rTotalDettes)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 3))
  merges.push(m(rows.length - 1, 4, rows.length - 1, 5))
  merges.push(m(rows.length - 1, 6, rows.length - 1, 7))

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
// Sheet 25 — NOTE 6 : Stocks et en-cours
//   10 columns (A=0 to J=9)
// ────────────────────────────────────────────────────────────────────────────

interface Stock6Line {
  label: string
  prefixes: readonly string[]
}

const STOCK_6_LINES: Stock6Line[] = [
  { label: 'Marchandises', prefixes: ['31'] },
  { label: 'Matières premières et fournitures liées', prefixes: ['32'] },
  { label: 'Autres approvisionnements', prefixes: ['33'] },
  { label: 'Produits en cours', prefixes: ['34'] },
  { label: 'Services en cours', prefixes: ['35'] },
  { label: 'Produits finis', prefixes: ['36'] },
  { label: 'Produits intermédiaires et résiduels', prefixes: ['37'] },
  { label: 'Stocks en cours de route, en consignation ou en dépôt', prefixes: ['38'] },
]

function buildNote6(
  bal: BalanceEntry[],
  balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 10
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  const yearN = exerciceYear(ex)
  const yearN1 = exerciceYearN1(ex)

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 21 -']))
  merges.push(m(0, 0, 0, 9)) // A1:J1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [8, 'NOTE 6\nSYSTEME NORMAL']))
  merges.push(m(1, 8, 1, 9)) // I2:J2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C, {
    labelCol: 0,
    valueCol: 2,
    sigleCol: 8,
    sigleValCol: 9,
  }))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 6 : STOCKS ET EN-COURS']))
  merges.push(m(6, 0, 6, 9)) // A7:J7

  // ── Row 7 (L8): header ──
  const r7 = emptyRow(C)
  r7[0] = 'Libellés'
  r7[4] = `Année ${yearN}`
  r7[6] = `Année ${yearN1}`
  r7[8] = 'Variation\nstock valeur'
  r7[9] = 'Variation %'
  rows.push(r7)
  merges.push(m(7, 0, 7, 3))  // A8:D8
  merges.push(m(7, 4, 7, 5))  // E8:F8
  merges.push(m(7, 6, 7, 7))  // G8:H8

  // ── Compute stock values ──
  let totalBrutN = 0
  let totalBrutN1 = 0

  for (const line of STOCK_6_LINES) {
    const valN = getActifBrut(bal, line.prefixes)
    const valN1 = getActifBrut(balN1, line.prefixes)
    totalBrutN += valN
    totalBrutN1 += valN1
    const varVal = valN - valN1
    const varPct = variationPct(valN, valN1)

    const row = emptyRow(C)
    row[0] = line.label
    row[4] = valN
    row[6] = valN1
    row[8] = varVal
    row[9] = varPct
    rows.push(row)
    merges.push(m(rows.length - 1, 0, rows.length - 1, 3)) // A:D merged
    merges.push(m(rows.length - 1, 4, rows.length - 1, 5)) // E:F merged
    merges.push(m(rows.length - 1, 6, rows.length - 1, 7)) // G:H merged
  }

  // ── TOTAL BRUT ──
  const totalVarVal = totalBrutN - totalBrutN1
  const totalVarPct = variationPct(totalBrutN, totalBrutN1)

  const rTotalBrut = emptyRow(C)
  rTotalBrut[0] = 'TOTAL BRUT'
  rTotalBrut[4] = totalBrutN
  rTotalBrut[6] = totalBrutN1
  rTotalBrut[8] = totalVarVal
  rTotalBrut[9] = totalVarPct
  rows.push(rTotalBrut)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 3))
  merges.push(m(rows.length - 1, 4, rows.length - 1, 5))
  merges.push(m(rows.length - 1, 6, rows.length - 1, 7))

  // ── Dépréciations ──
  const depN = getAmortProv(bal, ['39'])
  const depN1 = getAmortProv(balN1, ['39'])
  const depVarVal = depN - depN1
  const depVarPct = variationPct(depN, depN1)

  const rDep = emptyRow(C)
  rDep[0] = 'Dépréciations'
  rDep[4] = depN
  rDep[6] = depN1
  rDep[8] = depVarVal
  rDep[9] = depVarPct
  rows.push(rDep)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 3))
  merges.push(m(rows.length - 1, 4, rows.length - 1, 5))
  merges.push(m(rows.length - 1, 6, rows.length - 1, 7))

  // ── TOTAL NET ──
  const totalNetN = totalBrutN - depN
  const totalNetN1 = totalBrutN1 - depN1
  const totalNetVarVal = totalNetN - totalNetN1
  const totalNetVarPct = variationPct(totalNetN, totalNetN1)

  const rTotalNet = emptyRow(C)
  rTotalNet[0] = 'TOTAL NET'
  rTotalNet[4] = totalNetN
  rTotalNet[6] = totalNetN1
  rTotalNet[8] = totalNetVarVal
  rTotalNet[9] = totalNetVarPct
  rows.push(rTotalNet)
  merges.push(m(rows.length - 1, 0, rows.length - 1, 3))
  merges.push(m(rows.length - 1, 4, rows.length - 1, 5))
  merges.push(m(rows.length - 1, 6, rows.length - 1, 7))

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
  buildNote1,
  buildNote2,
  buildNote3A,
  buildNote3B,
  buildNote3C,
  buildNote3CBis,
  buildNote3D,
  buildNote3E,
  buildNote4,
  buildNote5,
  buildNote6,
}
