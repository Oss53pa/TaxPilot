/**
 * Builders for the first 3 Excel sheets of the SYSCOHADA liasse fiscale:
 *   1. COUVERTURE  - Administrative cover page
 *   2. GARDE       - Document checklist page
 *   3. RECEVABILITE - Conditions of admissibility
 */

import { SheetData, Row, emptyRow, rowAt, m, formatDate } from './helpers'
import type { EntrepriseData, ExerciceData } from './helpers'

// ────────────────────────────────────────────────────────────────────────────
// Sheet 1: COUVERTURE (13 columns, 53 rows)
// ────────────────────────────────────────────────────────────────────────────

function buildCouverture(
  _bal: unknown,
  _balN1: unknown,
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 13
  const rows: Row[] = []

  // L1-L5: empty rows before ministry header
  for (let i = 0; i < 5; i++) rows.push(emptyRow(C))

  // L6 (index 5): MINISTERE EN CHARGE DES FINANCES  -> col F (index 5)
  rows.push(rowAt(C, [5, 'MINISTERE EN CHARGE DES FINANCES']))

  // L7: empty
  rows.push(emptyRow(C))

  // L8 (index 7): DIRECTION GENERALE DES IMPOTS  -> col F (index 5)
  rows.push(rowAt(C, [5, 'DIRECTION GENERALE DES IMPOTS']))

  // L9-L10: empty
  rows.push(emptyRow(C))
  rows.push(emptyRow(C))

  // L11 (index 10): CENTRE DE DEPOT DE :  -> col G (index 6)
  rows.push(rowAt(C, [6, 'CENTRE DE DEPÔT DE :']))

  // L12: empty
  rows.push(emptyRow(C))

  // L13 (index 12): centre_depot value  -> col G (index 6)
  rows.push(rowAt(C, [6, ent.centre_depot || '']))

  // L14-L30: empty rows (17 rows)
  for (let i = 0; i < 17; i++) rows.push(emptyRow(C))

  // L31 (index 30): LIASSE SYSTEME NORMAL  -> col E (index 4)
  rows.push(rowAt(C, [4, 'LIASSE SYSTEME NORMAL']))

  // L32-L33: empty
  rows.push(emptyRow(C))
  rows.push(emptyRow(C))

  // L34 (index 33): EXERCICE CLOS LE  -> col F (index 5)
  rows.push(rowAt(C, [5, 'EXERCICE CLOS LE']))

  // L35 (index 34): formatted date  -> col F (index 5)
  rows.push(rowAt(C, [5, formatDate(ex.dateFin)]))

  // L36-L37: empty
  rows.push(emptyRow(C))
  rows.push(emptyRow(C))

  // L38 (index 37): DENOMINATION SOCIALE : | value
  rows.push(rowAt(C, [4, 'DENOMINATION SOCIALE :'], [6, ent.denomination || '']))

  // L39-L40: empty
  rows.push(emptyRow(C))
  rows.push(emptyRow(C))

  // L41 (index 40): SIGLE USUEL : | value
  rows.push(rowAt(C, [4, 'SIGLE USUEL :'], [6, ent.sigle || '']))

  // L42: empty
  rows.push(emptyRow(C))

  // L43 (index 42): ADRESSE COMPLETE : | value
  rows.push(rowAt(C, [4, 'ADRESSE COMPLETE :'], [6, ent.adresse || '']))

  // L44: empty
  rows.push(emptyRow(C))

  // L45 (index 44): N COMPTE CONTRIBUABLE (NCC) : | value -> col H (index 7)
  rows.push(rowAt(C, [4, 'N\u00B0 COMPTE CONTRIBUABLE (NCC) :'], [7, ent.ncc || '']))

  // L46 (index 45): N DE TELEDECLARANT (NTD): | value -> col H (index 7)
  rows.push(rowAt(C, [4, 'N\u00B0 DE TELEDECLARANT (NTD):'], [7, ent.ntd || '']))

  // L47-L53: empty rows to reach ~53 total
  while (rows.length < 53) rows.push(emptyRow(C))

  const merges = [
    // E31:J31 -> 0-indexed: row 30, col 4 to col 9
    m(30, 4, 30, 9),
    // F34:I34 -> 0-indexed: row 33, col 5 to col 8
    m(33, 5, 33, 8),
    // F35:I35 -> 0-indexed: row 34, col 5 to col 8
    m(34, 5, 34, 8),
  ]

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 2: GARDE (12 columns, 48 rows)
// ────────────────────────────────────────────────────────────────────────────

function buildGarde(
  _bal: unknown,
  _balN1: unknown,
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 12
  const rows: Row[] = []

  // L1: empty
  rows.push(emptyRow(C))

  // L2 (index 1): REPUBLIQUE DE COTE D'IVOIRE  -> col B (index 1)
  rows.push(rowAt(C, [1, "REPUBLIQUE DE C\u00D4TE D'IVOIRE"]))

  // L3 (index 2): MINISTERE EN CHARGE DES FINANCES  -> col B (index 1)
  rows.push(rowAt(C, [1, 'MINISTERE EN CHARGE DES FINANCES']))

  // L4 (index 3): DIRECTION GENERALE DES IMPOTS  -> col B (index 1)
  rows.push(rowAt(C, [1, 'DIRECTION GENERALE DES IMP\u00D4TS']))

  // L5-L7: empty
  rows.push(emptyRow(C))
  rows.push(emptyRow(C))
  rows.push(emptyRow(C))

  // L8 (index 7): CENTRE DE DEPOT DE  -> col C (index 2)
  rows.push(rowAt(C, [2, 'CENTRE DE DEPOT DE']))

  // L9 (index 8): centre_depot value  -> col D (index 3)
  rows.push(rowAt(C, [3, ent.centre_depot || '']))

  // L10-L11: empty
  rows.push(emptyRow(C))
  rows.push(emptyRow(C))

  // L12 (index 11): ETATS FINANCIERS...  -> col C (index 2)
  rows.push(rowAt(C, [2, 'ETATS FINANCIERS NORMALISES\nSYSTEME COMPTABLE OHADA (SYSCOHADA)']))

  // L13-L15: empty
  rows.push(emptyRow(C))
  rows.push(emptyRow(C))
  rows.push(emptyRow(C))

  // L16 (index 15): EXERCICE CLOS LE  -> col E (index 4)
  rows.push(rowAt(C, [4, 'EXERCICE CLOS LE']))

  // L17 (index 16): formatted date  -> col E (index 4)
  rows.push(rowAt(C, [4, formatDate(ex.dateFin)]))

  // L18-L19: empty
  rows.push(emptyRow(C))
  rows.push(emptyRow(C))

  // L20 (index 19): DESIGNATION DE L'ENTITE  -> col D (index 3)
  rows.push(rowAt(C, [3, "DESIGNATION DE L'ENTITE"]))

  // L21: empty
  rows.push(emptyRow(C))

  // L22 (index 21): DENOMINATION SOCIALE : | value  -> col B, col D
  rows.push(rowAt(C, [1, 'DENOMINATION SOCIALE :'], [3, ent.denomination || '']))

  // L23-L25: empty
  rows.push(emptyRow(C))
  rows.push(emptyRow(C))
  rows.push(emptyRow(C))

  // L26 (index 25): SIGLE USUEL : | value  -> col B, col C
  rows.push(rowAt(C, [1, 'SIGLE USUEL :'], [2, ent.sigle || '']))

  // L27: empty
  rows.push(emptyRow(C))

  // L28 (index 27): ADRESSE COMPLETE : | value  -> col B, col C
  rows.push(rowAt(C, [1, 'ADRESSE COMPLETE :'], [2, ent.adresse || '']))

  // L29: empty
  rows.push(emptyRow(C))

  // L30 (index 29): NCC  -> col B, col D
  rows.push(rowAt(C, [1, 'N\u00B0 COMPTE CONTRIBUABLE (NCC) :'], [3, ent.ncc || '']))

  // L31 (index 30): NTD  -> col B, col D
  rows.push(rowAt(C, [1, 'N\u00B0 DE TELEDECLARANT (NTD):'], [3, ent.ntd || '']))

  // L32 (index 31): SYSTEME NORMAL  -> col B
  rows.push(rowAt(C, [1, 'SYSTEME NORMAL']))

  // L33 (index 32): Documents deposes | Reserved header
  rows.push(rowAt(C, [1, 'Documents d\u00E9pos\u00E9s'], [7, 'R\u00E9serv\u00E9 \u00E0 la Direction G\u00E9n\u00E9rale des Imp\u00F4ts']))

  // L34: empty separator
  rows.push(emptyRow(C))

  // L35-L40 (indices 34-39): Document checklist with X marks in col F (index 5)
  const documents = [
    'Bilan',
    'Compte de R\u00E9sultat',
    'Tableau des Flux de Tr\u00E9sorerie',
    'Notes annexes',
    'Fiche compl\u00E9mentaire',
    'Etat suppl\u00E9mentaire statistique et fiscal',
  ]
  for (const doc of documents) {
    rows.push(rowAt(C, [1, doc], [5, 'X']))
  }

  // L41-L43: empty
  rows.push(emptyRow(C))
  rows.push(emptyRow(C))
  rows.push(emptyRow(C))

  // L44 (index 43): Nombre de pages deposees
  rows.push(rowAt(C, [1, 'Nombre de pages d\u00E9pos\u00E9es par exemplaire :']))

  // L45 (index 44): Nombre d'exemplaires deposes
  rows.push(rowAt(C, [1, "Nombre d'exemplaires d\u00E9pos\u00E9s :"]))

  // Pad to ~48 rows
  while (rows.length < 48) rows.push(emptyRow(C))

  return { rows }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 3: RECEVABILITE (2 columns, 47 rows)
// ────────────────────────────────────────────────────────────────────────────

function buildRecevabilite(
  _bal: unknown,
  _balN1: unknown,
  _ent: EntrepriseData,
  _ex: ExerciceData,
): SheetData {
  const C = 2
  const rows: Row[] = []

  // L1 (index 0): page number  -> col A
  rows.push(rowAt(C, [0, '- 1 -']))

  // L2-L4: empty
  rows.push(emptyRow(C))
  rows.push(emptyRow(C))
  rows.push(emptyRow(C))

  // L5 (index 4): CONDITIONS DE RECEVABILITE  -> col B (index 1)
  rows.push(rowAt(C, [1, 'CONDITIONS DE RECEVABILITE']))

  // L6-L8: empty
  rows.push(emptyRow(C))
  rows.push(emptyRow(C))
  rows.push(emptyRow(C))

  // L9 (index 8): Section header
  rows.push(rowAt(C, [1, 'Entit\u00E9s utilisant des imprim\u00E9s']))

  // L10-L11: empty
  rows.push(emptyRow(C))
  rows.push(emptyRow(C))

  // L12-L22 (indices 11-21): Bullet points with rules
  const rulesImprimes = [
    '\u2022 Les \u00E9tats financiers doivent \u00EAtre \u00E9tablis sur les imprim\u00E9s conformes au mod\u00E8le officiel.',
    '\u2022 Ils doivent \u00EAtre remplis \u00E0 l\'encre noire ou au stylo bille noir.',
    '\u2022 Les ratures et surcharges ne sont pas admises.',
    '\u2022 Les montants doivent \u00EAtre arrondis au millier de francs le plus proche.',
    '\u2022 Les montants n\u00E9gatifs doivent \u00EAtre pr\u00E9c\u00E9d\u00E9s du signe moins (-).',
    '\u2022 Les cases non utilis\u00E9es doivent \u00EAtre barr\u00E9es d\'un trait.',
    '\u2022 Chaque page doit comporter la d\u00E9nomination sociale et le NCC de l\'entit\u00E9.',
    '\u2022 Chaque page doit \u00EAtre sign\u00E9e par le repr\u00E9sentant l\u00E9gal de l\'entit\u00E9.',
    '\u2022 La liasse doit \u00EAtre d\u00E9pos\u00E9e en deux exemplaires.',
    '\u2022 Les \u00E9tats financiers doivent \u00EAtre dat\u00E9s et sign\u00E9s.',
    '\u2022 Les pages doivent \u00EAtre num\u00E9rot\u00E9es de fa\u00E7on continue.',
  ]
  for (const rule of rulesImprimes) {
    rows.push(rowAt(C, [1, rule]))
  }

  // L23-L24: empty
  rows.push(emptyRow(C))
  rows.push(emptyRow(C))

  // L25 (index 24): Section header
  rows.push(rowAt(C, [1, 'Entit\u00E9s produisant les \u00E9tats financiers \u00E0 l\'aide de l\'outil informatique']))

  // L26-L27: empty
  rows.push(emptyRow(C))
  rows.push(emptyRow(C))

  // L28-L36 (indices 27-35): More bullet points
  const rulesInformatique = [
    '\u2022 Les \u00E9tats financiers doivent \u00EAtre \u00E9dit\u00E9s sur papier blanc de format A4.',
    '\u2022 Ils doivent respecter strictement la pr\u00E9sentation des imprim\u00E9s officiels.',
    '\u2022 L\'impression doit \u00EAtre lisible et de bonne qualit\u00E9.',
    '\u2022 Les pages doivent \u00EAtre num\u00E9rot\u00E9es de fa\u00E7on continue.',
    '\u2022 Chaque page doit comporter la d\u00E9nomination sociale et le NCC de l\'entit\u00E9.',
    '\u2022 Chaque page doit \u00EAtre sign\u00E9e par le repr\u00E9sentant l\u00E9gal de l\'entit\u00E9.',
    '\u2022 La liasse doit \u00EAtre d\u00E9pos\u00E9e en deux exemplaires.',
    '\u2022 Les \u00E9tats financiers doivent \u00EAtre dat\u00E9s et sign\u00E9s.',
    '\u2022 Le logiciel utilis\u00E9 doit \u00EAtre agr\u00E9\u00E9 par la Direction G\u00E9n\u00E9rale des Imp\u00F4ts.',
  ]
  for (const rule of rulesInformatique) {
    rows.push(rowAt(C, [1, rule]))
  }

  // L37-L38: empty
  rows.push(emptyRow(C))
  rows.push(emptyRow(C))

  // L39 (index 38): Section header
  rows.push(rowAt(C, [1, 'Etats financiers']))

  // L40: empty
  rows.push(emptyRow(C))

  // L41-L47 (indices 40-46): More bullet points
  const rulesEtats = [
    '\u2022 Le Bilan doit \u00EAtre \u00E9quilibr\u00E9 : Total Actif = Total Passif.',
    '\u2022 Le R\u00E9sultat net du Compte de R\u00E9sultat doit \u00EAtre \u00E9gal au R\u00E9sultat net du Bilan.',
    '\u2022 Le Tableau des Flux de Tr\u00E9sorerie doit \u00EAtre coh\u00E9rent avec le Bilan.',
    '\u2022 Les Notes annexes doivent \u00EAtre compl\u00E8tes et conformes.',
    '\u2022 Les chiffres de l\'exercice pr\u00E9c\u00E9dent (N-1) doivent correspondre aux \u00E9tats financiers d\u00E9pos\u00E9s.',
    '\u2022 Les montants doivent \u00EAtre exprim\u00E9s en milliers de francs CFA.',
    '\u2022 Les \u00E9tats financiers annuels doivent former un tout indissociable.',
  ]
  for (const rule of rulesEtats) {
    rows.push(rowAt(C, [1, rule]))
  }

  // Pad to 47 rows
  while (rows.length < 47) rows.push(emptyRow(C))

  // Merge A1:B1 -> 0-indexed: row 0, col 0 to col 1
  const merges = [m(0, 0, 0, 1)]

  return { rows, merges }
}

export { buildCouverture, buildGarde, buildRecevabilite }
