/**
 * build-60-notes-33to39.ts
 * Builders for sheets 60-65 of the SYSCOHADA liasse fiscale:
 *   - Sheet 60: NOTE 33 (12 cols) - Achats destines a la production
 *   - Sheet 61: NOTE 34 (8 cols)  - Fiche de synthese des principaux indicateurs financiers
 *   - Sheet 62: NOTE 35 (9 cols)  - Informations sociales, environnementales et societales
 *   - Sheet 63: NOTE 37 (8 cols)  - Determination impots sur le resultat
 *   - Sheet 64: NOTE 38 (9 cols)  - Evenements posterieurs a la cloture de l'exercice
 *   - Sheet 65: NOTE 39 (9 cols)  - Changements de methodes comptables, d'estimations et corrections d'erreurs
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
// Sheet 60 — NOTE 33 : ACHATS DESTINES A LA PRODUCTION
//   12 columns (A=0 to L=11)
// ────────────────────────────────────────────────────────────────────────────

function buildNote33(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 12
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 56 -']))
  merges.push(m(0, 0, 0, 11)) // A1:L1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [10, 'NOTE 33\nSYSTEME NORMAL']))
  merges.push(m(1, 10, 1, 11)) // K2:L2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C, {
    valueCol: 2,
    sigleCol: 10,
    sigleValCol: 11,
  }))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 33 : ACHATS DESTINES A LA PRODUCTION']))
  merges.push(m(6, 0, 6, 11)) // A7:L7

  // ── Row 7 (L8): column headers row 1 ──
  const hdr1 = emptyRow(C)
  hdr1[0] = 'DESIGNATION DES MATIERES ET PRODUITS'
  hdr1[4] = 'UNITE DE\nQUANTITE\nCHOISIE'
  hdr1[5] = 'ACHATS EFFECTUES AU COURS DE L\'EXERCICE'
  hdr1[11] = 'VARIATION\nDES STOCKS\n(en valeur)'
  rows.push(hdr1)
  merges.push(m(7, 0, 10, 3))   // A8:D11 - DESIGNATION
  merges.push(m(7, 4, 10, 4))   // E8:E11 - UNITE
  merges.push(m(7, 5, 7, 10))   // F8:K8 - ACHATS EFFECTUES
  merges.push(m(7, 11, 10, 11)) // L8:L11 - VARIATION

  // ── Row 8 (L9): column headers row 2 ──
  const hdr2 = emptyRow(C)
  hdr2[5] = 'PRODUITS DE L\'ETAT'
  hdr2[7] = 'PRODUITS IMPORTES'
  rows.push(hdr2)
  merges.push(m(8, 5, 9, 6))  // F9:G10 - PRODUITS DE L'ETAT
  merges.push(m(8, 7, 8, 10)) // H9:K9 - PRODUITS IMPORTES

  // ── Row 9 (L10): column headers row 3 ──
  const hdr3 = emptyRow(C)
  hdr3[7] = 'ACHETES DANS L\'ETAT'
  hdr3[9] = 'ACHETES HORS DE L\'ETAT'
  rows.push(hdr3)
  merges.push(m(9, 7, 9, 8))   // H10:I10 - ACHETES DANS L'ETAT
  merges.push(m(9, 9, 9, 10))  // J10:K10 - ACHETES HORS DE L'ETAT

  // ── Row 10 (L11): column headers row 4 ──
  const hdr4 = emptyRow(C)
  hdr4[5] = 'Quantit\u00e9'
  hdr4[6] = 'Valeur'
  hdr4[7] = 'Quantit\u00e9'
  hdr4[8] = 'Valeur'
  hdr4[9] = 'Quantit\u00e9'
  hdr4[10] = 'Valeur'
  rows.push(hdr4)

  // ── Rows 11-27 (L12-L28): 17 empty data rows ──
  for (let i = 0; i < 17; i++) {
    const row = emptyRow(C)
    row[5] = 0
    row[6] = 0
    row[7] = 0
    row[8] = 0
    row[9] = 0
    row[10] = 0
    row[11] = 0
    rows.push(row)
    merges.push(m(11 + i, 0, 11 + i, 3)) // A:D merge for designation
  }

  // ── Row 28 (L29): empty separator ──
  rows.push(emptyRow(C))

  // ── Row 29 (L30): NON VENTILES ──
  const nvRow = emptyRow(C)
  nvRow[0] = 'NON VENTILES (1)'
  nvRow[5] = 0
  nvRow[6] = 0
  nvRow[7] = 0
  nvRow[8] = 0
  nvRow[9] = 0
  nvRow[10] = 0
  nvRow[11] = 0
  rows.push(nvRow)
  merges.push(m(29, 0, 29, 4)) // A30:E30

  // ── Row 30 (L31): TOTAL ──
  const totalRow = emptyRow(C)
  totalRow[0] = 'TOTAL'
  totalRow[5] = 0
  totalRow[6] = 0
  totalRow[7] = 0
  totalRow[8] = 0
  totalRow[9] = 0
  totalRow[10] = 0
  totalRow[11] = 0
  rows.push(totalRow)
  merges.push(m(30, 0, 30, 4)) // A31:E31

  // ── Row 31 (L32): footnote ──
  const fn = emptyRow(C)
  fn[0] = '(1) Si le d\u00e9tail n\'est pas possible, indiquer le montant global des achats'
  rows.push(fn)
  merges.push(m(31, 0, 31, 11)) // A32:L32

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 61 — NOTE 34 : FICHE DE SYNTHESE DES PRINCIPAUX INDICATEURS FINANCIERS
//   8 columns (A=0 to H=7)
// ────────────────────────────────────────────────────────────────────────────

function buildNote34(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 8
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 57 -']))
  merges.push(m(0, 0, 0, 7)) // A1:H1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [6, 'NOTE 34\nSYSTEME NORMAL']))
  merges.push(m(1, 6, 1, 7)) // G2:H2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 34 : FICHE DE SYNTHESE DES PRINCIPAUX INDICATEURS FINANCIERS']))
  merges.push(m(6, 0, 6, 7)) // A7:H7

  // ── Row 7 (L8): column headers ──
  const hdr = emptyRow(C)
  hdr[0] = '( EN  MILLIERS DE FRANCS)'
  hdr[5] = 'Ann\u00e9e N'
  hdr[6] = 'Ann\u00e9e N-1'
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

  const sectionHeader = (label: string): Row => {
    const row = emptyRow(C)
    row[0] = label
    return row
  }

  const addLabelMerge = (rowIdx: number): void => {
    merges.push(m(rowIdx, 0, rowIdx, 4))
  }

  const addFullMerge = (rowIdx: number): void => {
    merges.push(m(rowIdx, 0, rowIdx, 7))
  }

  // ════════════════════════════════════════════════════════════════════════
  // Section 1 - ANALYSE DE L'ACTIVITE (L9)
  // ════════════════════════════════════════════════════════════════════════

  // Row 8 (L9): section header
  rows.push(sectionHeader('ANALYSE DE L\'ACTIVITE'))
  addFullMerge(rows.length - 1)

  // Row 9 (L10): sub-header
  rows.push(sectionHeader('SOLDES INTERMEDIAIRES DE GESTION'))
  addFullMerge(rows.length - 1)

  // Rows 10-18 (L11-L19): SIG items
  const sigLabels = [
    'CHIFFRE D\'AFFAIRES',
    'MARGE COMMERCIALE',
    'VALEUR AJOUTEE',
    'EXCEDENT BRUT D\'EXPLOITATION (EBE)',
    'RESULTAT D\'EXPLOITATION',
    'RESULTAT FINANCIER',
    'RESULTAT DES ACTIVITES ORDINAIRES',
    'RESULTAT HORS ACTIVITES ORDINAIRES',
    'RESULTAT NET',
  ]

  for (const label of sigLabels) {
    rows.push(dataRow(label, 0, 0))
    addLabelMerge(rows.length - 1)
  }

  // ════════════════════════════════════════════════════════════════════════
  // Section 2 - DETERMINATION DE LA CAPACITE D'AUTOFINANCEMENT (L20)
  // ════════════════════════════════════════════════════════════════════════

  // Row 19 (L20): section header
  rows.push(sectionHeader('DETERMINATION DE LA CAPACITE D\'AUTOFINANCEMENT'))
  addFullMerge(rows.length - 1)

  // Rows 20-36 (L21-L37)
  const cafLabels = [
    'Exc\u00e9dent brut d\'exploitation (EBE)',
    '+ Valeurs comptables des cessions courantes d\'immobilisation',
    '- Produits des cessions courantes d\'immobilisation',
    '= CAPACITE D\'AUTOFINANCEMENT D\'EXPLOITATION',
    '+ Revenus financiers',
    '+ Gains de change financiers',
    '+ Transferts de charges financi\u00e8res',
    '+ Produits HAO',
    '+ Transferts de charges HAO',
    '- Frais financiers',
    '- Pertes de change financi\u00e8res',
    '- Charges HAO',
    '- Participations',
    '- Imp\u00f4ts sur les r\u00e9sultats',
    '= CAPACITE D\'AUTOFINANCEMENT GLOBALE (C.A.F.G.)',
    '- Distributions de dividendes',
    '= AUTOFINANCEMENT',
  ]

  for (const label of cafLabels) {
    rows.push(dataRow(label, 0, 0))
    addLabelMerge(rows.length - 1)
  }

  // ════════════════════════════════════════════════════════════════════════
  // Section 3 - ANALYSE DE LA RENTABILITE (L38)
  // ════════════════════════════════════════════════════════════════════════

  // Row 37 (L38): section header
  rows.push(sectionHeader('ANALYSE DE LA RENTABILITE'))
  addFullMerge(rows.length - 1)

  // Row 38 (L39): Rentabilité économique
  const rentaEcoRow = emptyRow(C)
  rentaEcoRow[0] = 'Rentabilit\u00e9 \u00e9conomique : R\u00e9sultat d\'exploitation / Actif \u00e9conomique'
  rentaEcoRow[5] = 0
  rentaEcoRow[6] = 0
  rentaEcoRow[7] = 0 // variation in points
  rows.push(rentaEcoRow)
  addLabelMerge(rows.length - 1)

  // Row 39 (L40): Rentabilité financière
  const rentaFinRow = emptyRow(C)
  rentaFinRow[0] = 'Rentabilit\u00e9 financi\u00e8re : R\u00e9sultat net / Capitaux propres'
  rentaFinRow[5] = 0
  rentaFinRow[6] = 0
  rentaFinRow[7] = 0 // variation in points
  rows.push(rentaFinRow)
  addLabelMerge(rows.length - 1)

  // ════════════════════════════════════════════════════════════════════════
  // Section 4 - ANALYSE DE LA STRUCTURE FINANCIERE (L41)
  // ════════════════════════════════════════════════════════════════════════

  // Row 40 (L41): section header
  rows.push(sectionHeader('ANALYSE DE LA STRUCTURE FINANCIERE'))
  addFullMerge(rows.length - 1)

  // Rows 41-54 (L42-L55)
  const structLabels = [
    '+ Capitaux propres',
    '+ Dettes financi\u00e8res',
    '= ressources stables',
    '- Actif immobilis\u00e9',
    '= FONDS DE ROULEMENT (1)',
    '+ Actif circulant d\'exploitation',
    '- Passif circulant d\'exploitation',
    '= BESOIN DE FINANCEMENT D\'EXPLOITATION (2)',
    '+ Actif circulant HAO',
    '- Passif circulant HAO',
    '= BESOIN DE FINANCEMENT HAO (3)',
    'BESOIN DE FINANCEMENT GLOBAL (4) = (2) + (3)',
    'TRESORERIE NETTE (5) = (1) - (4)',
    'CONTROLE',
  ]

  for (const label of structLabels) {
    rows.push(dataRow(label, 0, 0))
    addLabelMerge(rows.length - 1)
  }

  // ════════════════════════════════════════════════════════════════════════
  // Section 5 - ANALYSE DE LA VARIATION DE LA TRESORERIE (L56)
  // ════════════════════════════════════════════════════════════════════════

  // Row 55 (L56): section header
  rows.push(sectionHeader('ANALYSE DE LA VARIATION DE LA TRESORERIE'))
  addFullMerge(rows.length - 1)

  // Rows 56-59 (L57-L60)
  const tresoLabels = [
    'Flux de tr\u00e9sorerie provenant des activit\u00e9s op\u00e9rationnelles',
    'Flux de tr\u00e9sorerie provenant des activit\u00e9s d\'investissement',
    'Flux de tr\u00e9sorerie provenant des activit\u00e9s de financement',
    'Variation de la tr\u00e9sorerie de la p\u00e9riode',
  ]

  for (const label of tresoLabels) {
    rows.push(dataRow(label, 0, 0))
    addLabelMerge(rows.length - 1)
  }

  // ════════════════════════════════════════════════════════════════════════
  // Section 6 - ANALYSE DE L'ENDETTEMENT (L61)
  // ════════════════════════════════════════════════════════════════════════

  // Row 60 (L61): section header
  rows.push(sectionHeader('ANALYSE DE L\'ENDETTEMENT'))
  addFullMerge(rows.length - 1)

  // Rows 61-63 (L62-L64)
  const endettLabels = [
    'Endettement total / Total bilan',
    'Endettement \u00e0 terme / Capitaux propres',
    'Endettement \u00e0 terme / Capacit\u00e9 d\'autofinancement',
  ]

  for (const label of endettLabels) {
    rows.push(dataRow(label, 0, 0))
    addLabelMerge(rows.length - 1)
  }

  // ── Row 64 (L65): footnote ──
  const fn = emptyRow(C)
  fn[0] = '(1) Toutes les valeurs sont exprim\u00e9es en milliers de francs'
  rows.push(fn)
  addFullMerge(rows.length - 1)

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 62 — NOTE 35 : INFORMATIONS SOCIALES, ENVIRONNEMENTALES ET SOCIETALES
//   9 columns (A=0 to I=8) — TEXT ONLY
// ────────────────────────────────────────────────────────────────────────────

function buildNote35(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 9
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 58 -']))
  merges.push(m(0, 0, 0, 8)) // A1:I1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [7, 'NOTE 35\nSYSTEME NORMAL']))
  merges.push(m(1, 7, 1, 8)) // H2:I2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C, {
    sigleCol: 7,
    sigleValCol: 8,
  }))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 35 : LISTE DES INFORMATIONS SOCIALES, ENVIRONNEMENTALES ET SOCIETALES A FOURNIR']))
  merges.push(m(6, 0, 6, 8)) // A7:I7

  // ── Row 7 (L8): subtitle ──
  rows.push(rowAt(C, [0, 'Note obligatoire pour les entit\u00e9s ayant un effectif de plus de 250 salari\u00e9s']))
  merges.push(m(7, 0, 7, 8)) // A8:I8

  // ── Helper for text rows ──
  const textRow = (text: string): void => {
    rows.push(rowAt(C, [0, text]))
    merges.push(m(rows.length - 1, 0, rows.length - 1, 8))
  }

  // ── Row 8 (L9): empty separator ──
  rows.push(emptyRow(C))

  // ════════════════════════════════════════════════════════════════════════
  // INFORMATIONS SOCIALES
  // ════════════════════════════════════════════════════════════════════════

  textRow('I - INFORMATIONS SOCIALES')
  textRow('')
  textRow('a) Emploi')
  textRow('- L\'effectif total, la r\u00e9partition des salari\u00e9s par sexe, par \u00e2ge et par zone g\u00e9ographique')
  textRow('- Les embauches et les licenciements')
  textRow('- Les r\u00e9mun\u00e9rations et leur \u00e9volution')
  textRow('')
  textRow('b) Organisation du travail')
  textRow('- L\'organisation du temps de travail')
  textRow('- L\'absent\u00e9isme et ses motifs')
  textRow('')
  textRow('c) Relations sociales')
  textRow('- L\'organisation du dialogue social, les proc\u00e9dures d\'information, de consultation du personnel et de n\u00e9gociation')
  textRow('- Le bilan des accords collectifs')
  textRow('')
  textRow('d) Sant\u00e9 et s\u00e9curit\u00e9')
  textRow('- Les conditions de sant\u00e9 et de s\u00e9curit\u00e9 au travail')
  textRow('- Le bilan des accords sign\u00e9s en mati\u00e8re de sant\u00e9 et de s\u00e9curit\u00e9 au travail')
  textRow('- Les accidents du travail (fr\u00e9quence et gravit\u00e9) et les maladies professionnelles')
  textRow('')
  textRow('e) Formation')
  textRow('- Les politiques de formation mises en \u0153uvre')
  textRow('- Le nombre total d\'heures de formation')
  textRow('')
  textRow('f) Egalit\u00e9 de traitement')
  textRow('- Les mesures prises en faveur de l\'\u00e9galit\u00e9 entre les femmes et les hommes')
  textRow('- Les mesures prises en faveur de l\'emploi et de l\'insertion des personnes handicap\u00e9es')
  textRow('- La politique de lutte contre les discriminations')

  // ════════════════════════════════════════════════════════════════════════
  // INFORMATIONS ENVIRONNEMENTALES
  // ════════════════════════════════════════════════════════════════════════

  textRow('')
  textRow('II - INFORMATIONS ENVIRONNEMENTALES')
  textRow('')
  textRow('a) Politique g\u00e9n\u00e9rale en mati\u00e8re environnementale')
  textRow('- L\'organisation de l\'entit\u00e9 pour prendre en compte les questions environnementales')
  textRow('- Les d\u00e9marches de certification en mati\u00e8re d\'environnement')
  textRow('')
  textRow('b) Pollution et gestion des d\u00e9chets')
  textRow('- Les mesures de pr\u00e9vention, de r\u00e9duction ou de r\u00e9paration de rejets dans l\'air, l\'eau et le sol')
  textRow('- Les mesures de pr\u00e9vention, de recyclage et d\'\u00e9limination des d\u00e9chets')
  textRow('')
  textRow('c) Utilisation durable des ressources')
  textRow('- La consommation d\'eau et l\'approvisionnement en eau')
  textRow('- La consommation de mati\u00e8res premi\u00e8res et les mesures prises pour am\u00e9liorer l\'efficacit\u00e9')
  textRow('- La consommation d\'\u00e9nergie, les mesures prises pour am\u00e9liorer l\'efficacit\u00e9 \u00e9nerg\u00e9tique')

  // ════════════════════════════════════════════════════════════════════════
  // INFORMATIONS RELATIVES AUX ENGAGEMENTS SOCIETAUX
  // ════════════════════════════════════════════════════════════════════════

  textRow('')
  textRow('III - INFORMATIONS RELATIVES AUX ENGAGEMENTS SOCIETAUX EN FAVEUR DU DEVELOPPEMENT DURABLE')
  textRow('')
  textRow('a) Impact territorial, \u00e9conomique et social de l\'activit\u00e9 de l\'entit\u00e9')
  textRow('- En mati\u00e8re d\'emploi et de d\u00e9veloppement r\u00e9gional')
  textRow('- Sur les populations riveraines ou locales')
  textRow('')
  textRow('b) Relations entretenues avec les personnes ou les organisations int\u00e9ress\u00e9es par l\'activit\u00e9')
  textRow('- Les conditions du dialogue avec ces personnes ou organisations')
  textRow('- Les actions de partenariat ou de m\u00e9c\u00e9nat')

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 63 — NOTE 37 : DETERMINATION IMPOTS SUR LE RESULTAT
//   8 columns (A=0 to H=7)
// ────────────────────────────────────────────────────────────────────────────

function buildNote37(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 8
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 59 -']))
  merges.push(m(0, 0, 0, 7)) // A1:H1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [6, 'NOTE 37\nSYSTEME NORMAL']))
  merges.push(m(1, 6, 1, 7)) // G2:H2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 37 : DETERMINATION IMP\u00d4TS SUR LE RESULTAT (2)']))
  merges.push(m(6, 0, 6, 7)) // A7:H7

  // ── Row 7 (L8): column headers ──
  const hdr = emptyRow(C)
  hdr[0] = 'Libell\u00e9s'
  hdr[7] = 'Montant'
  rows.push(hdr)
  merges.push(m(7, 0, 7, 6)) // A8:G8 - Libellés

  // ── Helper for data rows ──
  const dataRow = (label: string, val: number): Row => {
    const row = emptyRow(C)
    row[0] = label
    row[7] = val
    return row
  }

  const addLabelMerge = (rowIdx: number): void => {
    merges.push(m(rowIdx, 0, rowIdx, 6))
  }

  const addFullMerge = (rowIdx: number): void => {
    merges.push(m(rowIdx, 0, rowIdx, 7))
  }

  // ── Row 8 (L9): RESULTAT NET COMPTABLE ──
  rows.push(dataRow('RESULTAT NET COMPTABLE DE L\'EXERCICE', 0))
  addLabelMerge(rows.length - 1)

  // ── Row 9 (L10): A REINTEGRER section header ──
  rows.push(rowAt(C, [0, 'A REINTEGRER (1)']))
  addFullMerge(rows.length - 1)

  // ── Rows 10-21 (L11-L22): 12 réintégration items ──
  const reintegrationLabels = [
    'Charges non d\u00e9ductibles li\u00e9es \u00e0 l\'activit\u00e9',
    'Charges non d\u00e9ductibles li\u00e9es au personnel',
    'Charges non d\u00e9ductibles li\u00e9es aux imp\u00f4ts et taxes',
    'Charges non d\u00e9ductibles li\u00e9es aux charges financi\u00e8res',
    'Charges non d\u00e9ductibles li\u00e9es aux amortissements',
    'Charges non d\u00e9ductibles li\u00e9es aux provisions',
    'Charges non d\u00e9ductibles li\u00e9es aux charges HAO',
    'Charges non d\u00e9ductibles diverses',
    'Plus-values de cession impos\u00e9es',
    'R\u00e9int\u00e9grations suite \u00e0 un redressement fiscal',
    'Avantages en nature non d\u00e9clar\u00e9s',
    'Autres r\u00e9int\u00e9grations',
  ]

  for (const label of reintegrationLabels) {
    rows.push(dataRow(label, 0))
    addLabelMerge(rows.length - 1)
  }

  // ── Row 22 (L23): TOTAL DES REINTEGRATIONS ──
  rows.push(dataRow('TOTAL DES REINTEGRATIONS', 0))
  addLabelMerge(rows.length - 1)

  // ── Row 23 (L24): A DEDUIRE section header ──
  rows.push(rowAt(C, [0, 'A DEDUIRE (1)']))
  addFullMerge(rows.length - 1)

  // ── Rows 24-28 (L25-L29): 5 déduction items ──
  const deductionLabels = [
    'Produits non imposables',
    'Plus-values de cession exon\u00e9r\u00e9es',
    'Reprises de provisions ant\u00e9rieurement tax\u00e9es',
    'Dividendes re\u00e7us (r\u00e9gime m\u00e8re-filiale)',
    'Autres d\u00e9ductions',
  ]

  for (const label of deductionLabels) {
    rows.push(dataRow(label, 0))
    addLabelMerge(rows.length - 1)
  }

  // ── Row 29 (L30): TOTAL DES DEDUCTIONS ──
  rows.push(dataRow('TOTAL DES DEDUCTIONS', 0))
  addLabelMerge(rows.length - 1)

  // ── Row 30 (L31): RESULTAT IMPOSABLE ──
  rows.push(dataRow('RESULTAT IMPOSABLE', 0))
  addLabelMerge(rows.length - 1)

  // ── Row 31 (L32): DEFICITS ANTERIEURS ──
  rows.push(dataRow('DEFICITS ANTERIEURS', 0))
  addLabelMerge(rows.length - 1)

  // ── Row 32 (L33): AMORTISSEMENTS REGULIEREMENT DIFFERES ──
  rows.push(dataRow('AMORTISSEMENTS REGULIEREMENT DIFFERES', 0))
  addLabelMerge(rows.length - 1)

  // ── Row 33 (L34): AMORTISSEMENTS A DIFFERER ──
  rows.push(dataRow('AMORTISSEMENTS A DIFFERER', 0))
  addLabelMerge(rows.length - 1)

  // ── Row 34 (L35): RESULTAT FISCAL ──
  rows.push(dataRow('RESULTAT FISCAL', 0))
  addLabelMerge(rows.length - 1)

  // ── Row 35 (L36): IMPOTS SUR LE RESULTAT ──
  const impotRow = emptyRow(C)
  impotRow[0] = 'IMPOTS SUR LE RESULTAT AU TAUX DE :'
  impotRow[3] = 0.25
  impotRow[7] = 0
  rows.push(impotRow)
  merges.push(m(35, 0, 35, 2)) // A36:C36 - label
  // D36 has the tax rate (0.25)

  // ── Row 36 (L37): empty separator ──
  rows.push(emptyRow(C))

  // ── Row 37 (L38): footnote 1 ──
  const fn1 = emptyRow(C)
  fn1[0] = '(1) D\u00e9tailler les principales r\u00e9int\u00e9grations et d\u00e9ductions'
  rows.push(fn1)
  addFullMerge(rows.length - 1)

  // ── Row 38 (L39): footnote 2 ──
  const fn2 = emptyRow(C)
  fn2[0] = '(2) Annexe obligatoire pour les entit\u00e9s soumises \u00e0 l\'imp\u00f4t sur les b\u00e9n\u00e9fices'
  rows.push(fn2)
  addFullMerge(rows.length - 1)

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 64 — NOTE 38 : EVENEMENTS POSTERIEURS A LA CLOTURE DE L'EXERCICE
//   9 columns (A=0 to I=8) — TEXT ONLY
// ────────────────────────────────────────────────────────────────────────────

function buildNote38(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 9
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 60 -']))
  merges.push(m(0, 0, 0, 8)) // A1:I1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [7, 'NOTE 38\nSYSTEME NORMAL']))
  merges.push(m(1, 7, 1, 8)) // H2:I2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C, {
    sigleCol: 7,
    sigleValCol: 8,
  }))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 38 : EVENEMENTS POSTERIEURS A LA CLOTURE DE L\'EXERCICE']))
  merges.push(m(6, 0, 6, 8)) // A7:I7

  // ── Helper for text rows ──
  const textRow = (text: string): void => {
    rows.push(rowAt(C, [0, text]))
    merges.push(m(rows.length - 1, 0, rows.length - 1, 8))
  }

  // ── Row 7 (L8): Date d'arrêté ──
  const r7 = emptyRow(C)
  r7[0] = 'Date d\'arr\u00eat\u00e9 des \u00e9tats financiers :'
  rows.push(r7)
  merges.push(m(7, 0, 7, 2)) // A8:C8

  // ── Row 8 (L9): empty separator ──
  rows.push(emptyRow(C))

  // ── Row 9 (L10): Organe ayant autorisé ──
  const r9 = emptyRow(C)
  r9[0] = 'Organe ayant autoris\u00e9 la publication des comptes :'
  rows.push(r9)
  merges.push(m(9, 0, 9, 2)) // A10:C10
  merges.push(m(9, 3, 9, 8)) // D10:I10

  // ── Row 10 (L11): empty separator ──
  rows.push(emptyRow(C))

  // ── Row 11 (L12): Section A ──
  textRow('A - EVENEMENTS POSTERIEURS A LA DATE DE CLOTURE CONDUISANT A DES AJUSTEMENTS DES ETATS FINANCIERS')

  // ── Row 12 (L13): empty separator ──
  rows.push(emptyRow(C))

  // ── Rows 13-16 (L14-L17): Section A comments ──
  textRow('Nature de l\'\u00e9v\u00e9nement :')
  textRow('')
  textRow('Estimation de l\'impact financier ou mention de l\'impossibilit\u00e9 de proc\u00e9der \u00e0 cette estimation :')
  textRow('')

  // ── Row 17 (L18): empty separator ──
  rows.push(emptyRow(C))

  // ── Row 18 (L19): Section B ──
  textRow('B - EVENEMENTS POSTERIEURS A LA DATE DE CLOTURE NE CONDUISANT PAS A DES AJUSTEMENTS DES ETATS FINANCIERS')

  // ── Row 19 (L20): empty separator ──
  rows.push(emptyRow(C))

  // ── Rows 20-22 (L21-L23): Section B comments ──
  textRow('Nature de l\'\u00e9v\u00e9nement :')
  textRow('')
  textRow('Estimation de l\'impact financier ou mention de l\'impossibilit\u00e9 de proc\u00e9der \u00e0 cette estimation :')

  // ── Row 23 (L24): empty separator ──
  rows.push(emptyRow(C))

  // ── Row 24 (L25): Section C ──
  textRow('C - EVENEMENTS REMETTANT EN CAUSE LA CONTINUITE DE L\'EXPLOITATION')

  // ── Row 25 (L26): empty separator ──
  rows.push(emptyRow(C))

  // ── Rows 26-29 (L27-L30): Section C comments ──
  textRow('Nature de l\'\u00e9v\u00e9nement :')
  textRow('')
  textRow('Mesures prises ou envisag\u00e9es :')
  textRow('')

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 65 — NOTE 39 : CHANGEMENTS DE METHODES COMPTABLES, D'ESTIMATIONS
//   ET CORRECTIONS D'ERREURS
//   9 columns (A=0 to I=8) — TEXT ONLY
// ────────────────────────────────────────────────────────────────────────────

function buildNote39(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 9
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 61 -']))
  merges.push(m(0, 0, 0, 8)) // A1:I1

  // ── Row 1 (L2): sheet label ──
  rows.push(rowAt(C, [7, 'NOTE 39\nSYSTEME NORMAL']))
  merges.push(m(1, 7, 1, 8)) // H2:I2

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C, {
    sigleCol: 7,
    sigleValCol: 8,
  }))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'NOTE 39 : CHANGEMENTS DE METHODES COMPTABLES, D\'ESTIMATIONS\nET CORRECTIONS D\'ERREURS']))
  merges.push(m(6, 0, 6, 8)) // A7:I7

  // ── Helper for text rows ──
  const textRow = (text: string): void => {
    rows.push(rowAt(C, [0, text]))
    merges.push(m(rows.length - 1, 0, rows.length - 1, 8))
  }

  // ════════════════════════════════════════════════════════════════════════
  // A - CHANGEMENTS DE METHODES COMPTABLES
  // ════════════════════════════════════════════════════════════════════════

  textRow('A \u2013 CHANGEMENTS DE METHODES COMPTABLES')
  textRow('')
  textRow('1. Changement de r\u00e9glementation comptable')
  textRow('')
  textRow('- Nature du changement :')
  textRow('')
  textRow('- Justification du changement :')
  textRow('')
  textRow('- M\u00e9thode utilis\u00e9e ant\u00e9rieurement :')
  textRow('')
  textRow('- Nouvelle m\u00e9thode :')
  textRow('')
  textRow('- Impact du changement sur le r\u00e9sultat, les capitaux propres, le bilan et le tableau de flux :')
  textRow('')
  textRow('2. Changement de m\u00e9thode \u00e0 l\'initiative de l\'entit\u00e9')
  textRow('')
  textRow('- Nature du changement :')
  textRow('')
  textRow('- Justification du changement et raison pour laquelle la nouvelle m\u00e9thode fournit une information plus fiable :')
  textRow('')
  textRow('- M\u00e9thode utilis\u00e9e ant\u00e9rieurement :')
  textRow('')
  textRow('- Nouvelle m\u00e9thode :')
  textRow('')
  textRow('- Impact du changement sur le r\u00e9sultat, les capitaux propres, le bilan et le tableau de flux :')
  textRow('')

  // ════════════════════════════════════════════════════════════════════════
  // B - CHANGEMENTS D'ESTIMATIONS
  // ════════════════════════════════════════════════════════════════════════

  textRow('B \u2013 CHANGEMENTS D\'ESTIMATIONS')
  textRow('')
  textRow('- Nature du changement :')
  textRow('')
  textRow('- Justification du changement :')
  textRow('')
  textRow('- Impact du changement sur le r\u00e9sultat de l\'exercice :')
  textRow('')

  // ════════════════════════════════════════════════════════════════════════
  // C - CORRECTIONS D'ERREURS
  // ════════════════════════════════════════════════════════════════════════

  textRow('C \u2013 CORRECTIONS D\'ERREURS')
  textRow('')
  textRow('- Nature de l\'erreur :')
  textRow('')
  textRow('- P\u00e9riode d\'origine :')
  textRow('')
  textRow('- Impact de la correction sur les postes des \u00e9tats financiers :')
  textRow('')
  textRow('- Montant de la correction pour l\'exercice et pour chaque exercice ant\u00e9rieur pr\u00e9sent\u00e9 :')
  textRow('')

  return { rows, merges }
}

// ════════════════════════════════════════════════════════════════════════════
// Exports
// ════════════════════════════════════════════════════════════════════════════

export { buildNote33, buildNote34, buildNote35, buildNote37, buildNote38, buildNote39 }
