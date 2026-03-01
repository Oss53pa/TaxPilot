/**
 * build-78-gardes-fin.ts
 * Builders for sheets 78-84 of the SYSCOHADA liasse fiscale:
 *   - Sheet 78: GARDE (BIC)  - Cover page for BIC section
 *   - Sheet 79: GARDE (BNC)  - Cover page for BNC section
 *   - Sheet 80: GARDE (BA)   - Cover page for BA section
 *   - Sheet 81: GARDE (301)  - Cover page for Etat 301
 *   - Sheet 82: GARDE (302)  - Cover page for Etat 302
 *   - Sheet 83: GARDE(3)     - Cover page for Commentaires section
 *   - Sheet 84: COMMENTAIRE  - Table of comments cross-referencing all notes
 */

import { SheetData, Row, emptyRow, rowAt, m } from './helpers'
import type { EntrepriseData, ExerciceData, BalanceEntry } from './helpers'

// ════════════════════════════════════════════════════════════════════════════
// Helper: generic garde cover page builder
// ════════════════════════════════════════════════════════════════════════════

function buildGardePage(
  text: string,
  textRow: number,
  totalRows: number,
): SheetData {
  const C = 10
  const rows: Row[] = []
  const merges: ReturnType<typeof m>[] = []

  for (let i = 0; i < totalRows; i++) {
    if (i === textRow) {
      rows.push(rowAt(C, [4, text]))
    } else {
      rows.push(emptyRow(C))
    }
  }

  // Merge from textRow to textRow+3, cols E(4) to J(9)
  merges.push(m(textRow, 4, textRow + 3, 9))

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 78 — GARDE (BIC)
//   10 columns (A=0 to J=9)
// ────────────────────────────────────────────────────────────────────────────

function buildGardeBic(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  _ent: EntrepriseData,
  _ex: ExerciceData,
): SheetData {
  return buildGardePage(
    'DETERMINATION DES BENEFICES  COMMERCIAUX',
    20,
    30,
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 79 — GARDE (BNC)
//   10 columns (A=0 to J=9)
// ────────────────────────────────────────────────────────────────────────────

function buildGardeBnc(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  _ent: EntrepriseData,
  _ex: ExerciceData,
): SheetData {
  return buildGardePage(
    'DETERMINATION DES BENEFICES NON COMMERCIAUX',
    20,
    30,
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 80 — GARDE (BA)
//   10 columns (A=0 to J=9)
// ────────────────────────────────────────────────────────────────────────────

function buildGardeBa(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  _ent: EntrepriseData,
  _ex: ExerciceData,
): SheetData {
  return buildGardePage(
    'DETERMINATION DES BENEFICES  AGRICOLES',
    20,
    30,
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 81 — GARDE (301)
//   10 columns (A=0 to J=9)
// ────────────────────────────────────────────────────────────────────────────

function buildGarde301(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  _ent: EntrepriseData,
  _ex: ExerciceData,
): SheetData {
  return buildGardePage(
    'ETAT ANNUEL DES SALAIRES\n(ETAT 301)',
    20,
    30,
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 82 — GARDE (302)
//   10 columns (A=0 to J=9)
// ────────────────────────────────────────────────────────────────────────────

function buildGarde302(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  _ent: EntrepriseData,
  _ex: ExerciceData,
): SheetData {
  return buildGardePage(
    'ETAT RECAPITULATIF DES REMUNERATIONS VERSEES A DES CONTRIBUABLES N\'AYANT PAS LA QUALITE DE SALARIE',
    20,
    30,
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 83 — GARDE(3)
//   10 columns (A=0 to J=9)
// ────────────────────────────────────────────────────────────────────────────

function buildGarde3(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  _ent: EntrepriseData,
  _ex: ExerciceData,
): SheetData {
  const C = 10
  const rows: Row[] = []
  const merges: ReturnType<typeof m>[] = []

  for (let i = 0; i < 35; i++) {
    if (i === 25) {
      rows.push(rowAt(C, [4, 'COMMENTAIRES']))
    } else {
      rows.push(emptyRow(C))
    }
  }

  // Merge from row 25 to row 28, cols E(4) to J(9)
  merges.push(m(25, 4, 28, 9))

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 84 — COMMENTAIRE
//   8 columns (A=0 to H=7)
// ────────────────────────────────────────────────────────────────────────────

function buildCommentaire(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 8
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): title + page label ──
  const r0 = emptyRow(C)
  r0[0] = 'TABLE DES COMMENTAIRES'
  r0[6] = 'COMMENTAIRES\nPAGE 1/9'
  rows.push(r0)
  merges.push(m(0, 0, 0, 5)) // A1:F1
  merges.push(m(0, 6, 0, 7)) // G1:H1

  // ── Row 1 (L2): Denomination ──
  const r1 = emptyRow(C)
  r1[0] = 'D\u00e9nomination sociale de l\'entit\u00e9 :'
  r1[2] = ent.denomination || ''
  rows.push(r1)

  // ── Row 2 (L3): Adresse + Sigle ──
  const r2 = emptyRow(C)
  r2[0] = 'Adresse :'
  r2[1] = ent.adresse || ''
  r2[5] = 'Sigle usuel :'
  r2[7] = ent.sigle || ''
  rows.push(r2)

  // ── Row 3 (L4): NCC + Exercice + Duree ──
  const r3 = emptyRow(C)
  r3[0] = 'N\u00b0 de compte contribuable (NCC) :'
  r3[2] = ent.ncc || ''
  r3[4] = 'Exercice clos le :'
  r3[5] = ex.dateFin || ''
  r3[6] = 'Dur\u00e9e (en mois) :'
  r3[7] = ex.dureeMois
  rows.push(r3)

  // ── Row 4 (L5): NTD ──
  const r4 = emptyRow(C)
  r4[0] = 'N\u00b0 de t\u00e9l\u00e9d\u00e9clarant (NTD) :'
  r4[2] = ent.ntd || ''
  rows.push(r4)

  // ── Note references and titles ──
  const noteEntries: [string, string][] = [
    ['NOTE 1', 'DETTES GARANTIES PAR DES SURETES REELLES'],
    ['NOTE 3A', 'IMMOBILISATIONS (BRUTES)'],
    ['NOTE 3B', 'BIENS PRIS EN LOCATION-ACQUISITION'],
    ['NOTE 3C', 'IMMOBILISATIONS (AMORTISSEMENTS)'],
    ['NOTE 3C BIS', 'AMORTISSEMENTS (TABLEAU COMPLEMENTAIRE)'],
    ['NOTE 3D', 'IMMOBILISATIONS FINANCIERES'],
    ['NOTE 3E', 'AUTRES IMMOBILISATIONS FINANCIERES'],
    ['NOTE 4', 'ACTIF CIRCULANT HAO'],
    ['NOTE 5', 'STOCKS ET EN-COURS'],
    ['NOTE 6', 'CLIENTS'],
    ['NOTE 7', 'AUTRES CREANCES'],
    ['NOTE 8', 'COORDONNEES DES ASSOCIES'],
    ['NOTE 8A', 'ECHEANCIER DES CREANCES A LA CLOTURE'],
    ['NOTE 8B', 'PRODUITS CONSTATES D\'AVANCE ET CHARGES CONSTATEES D\'AVANCE'],
    ['NOTE 8C', 'ECART DE CONVERSION ACTIF'],
    ['NOTE 9', 'CAPITAL'],
    ['NOTE 10', 'PRIMES ET RESERVES'],
    ['NOTE 11', 'REPORT A NOUVEAU'],
    ['NOTE 12', 'ECARTS DE CONVERSION'],
    ['NOTE 13', 'CAPITAL PAR CATEGORIE D\'ACTIONS'],
    ['NOTE 14', 'SUBVENTIONS ET PROVISIONS REGLEMENTEES'],
    ['NOTE 15A', 'DETTES DE LOCATION ACQUISITION'],
    ['NOTE 15B', 'EFFETS ESCOMPTES NON ECHUS'],
    ['NOTE 16A', 'DETTES FINANCIERES ET RESSOURCES ASSIMILEES'],
    ['NOTE 16B', 'ENGAGEMENTS DE RETRAITE'],
    ['NOTE 16B BIS', 'PROVISION POUR ENGAGEMENTS DE RETRAITE'],
    ['NOTE 16C', 'ACTIFS ET PASSIFS EVENTUELS'],
    ['NOTE 17', 'FOURNISSEURS D\'EXPLOITATION'],
    ['NOTE 18', 'DETTES FISCALES ET SOCIALES'],
    ['NOTE 19', 'AUTRES DETTES ET PROVISIONS'],
    ['NOTE 20', 'BANQUES ET CREDITS'],
    ['NOTE 21', 'CHIFFRE D\'AFFAIRES'],
    ['NOTE 22', 'ACHATS'],
    ['NOTE 23', 'TRANSPORTS'],
    ['NOTE 24', 'SERVICES EXTERIEURS'],
    ['NOTE 25', 'IMPOTS ET TAXES'],
    ['NOTE 26', 'AUTRES CHARGES'],
    ['NOTE 27A', 'CHARGES DE PERSONNEL'],
    ['NOTE 27B', 'EFFECTIFS ET MASSE SALARIALE'],
    ['NOTE 28', 'DOTATIONS ET PROVISIONS'],
    ['NOTE 29', 'CHARGES ET REVENUS FINANCIERS'],
    ['NOTE 30', 'AUTRES CHARGES ET PRODUITS HAO'],
    ['NOTE 31', 'REPARTITION DU RESULTAT'],
    ['NOTE 32', 'PRODUCTION DE L\'EXERCICE'],
    ['NOTE 33', 'ACHATS DESTINES A LA PRODUCTION'],
    ['NOTE 34', 'FICHE DE SYNTHESE'],
    ['NOTE 35', 'INFORMATIONS SOCIALES'],
    ['NOTE 37', 'DETERMINATION IMPOTS'],
    ['NOTE 38', 'EVENEMENTS POSTERIEURS'],
    ['NOTE 39', 'CHANGEMENTS DE METHODES'],
  ]

  for (const [noteRef, noteTitle] of noteEntries) {
    // Row with note reference + title
    const refRow = emptyRow(C)
    refRow[0] = noteRef
    refRow[1] = noteTitle
    rows.push(refRow)
    merges.push(m(rows.length - 1, 1, rows.length - 1, 7)) // B:H merge for title

    // Blank row for comment text
    const commentRow = emptyRow(C)
    commentRow[0] = ''
    rows.push(commentRow)
    merges.push(m(rows.length - 1, 0, rows.length - 1, 7)) // A:H merge for comment
  }

  return { rows, merges }
}

// ════════════════════════════════════════════════════════════════════════════
// Exports
// ════════════════════════════════════════════════════════════════════════════

export { buildGardeBic, buildGardeBnc, buildGardeBa, buildGarde301, buildGarde302, buildGarde3, buildCommentaire }
