import { SheetData, Row, emptyRow, rowAt, m, headerRows } from './helpers'
import type { EntrepriseData, ExerciceData, BalanceEntry } from './helpers'

// ────────────────────────────────────────────────────────────────────────────
// Sheet 4 — NOTE36 (TABLE DES CODES)  10 cols × 46 rows
// ────────────────────────────────────────────────────────────────────────────

function buildNote36Codes(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 10
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0: page number ──
  const r0 = rowAt(C, [0, '- 2 -'])
  rows.push(r0)
  merges.push(m(0, 0, 0, 9))

  // ── Row 1: NOTE 36 label ──
  const r1 = rowAt(C, [7, 'NOTE 36\nSYSTEME NORMAL'])
  rows.push(r1)
  merges.push(m(1, 7, 1, 9))

  // ── Rows 2-5: standard header ──
  rows.push(...headerRows(ent, ex, C))

  // ── Row 6: title ──
  const r6 = rowAt(C, [0, 'NOTE 36 : TABLE DES CODES'])
  rows.push(r6)
  merges.push(m(6, 0, 6, 9))

  // ── Row 7: empty separator ──
  rows.push(emptyRow(C))

  // ── Row 8: sub-titles ──
  const r8 = rowAt(C, [0, '1- Code forme juridique (1)'], [5, '3- Code pays du siège social'])
  rows.push(r8)

  // ── Row 9: empty ──
  rows.push(emptyRow(C))

  // ── Rows 10-19: Forme juridique (left) + Pays (right) ──
  const formeJuridique: [string, string, string][] = [
    ['SA participation publique', '0', '0'],
    ['SA',                        '0', '1'],
    ['SAS',                       '0', '2'],
    ['SARL',                      '0', '3'],
    ['SCS',                       '0', '4'],
    ['SNC',                       '0', '5'],
    ['SP',                        '0', '6'],
    ['GIE',                       '0', '7'],
    ['Association',               '0', '8'],
    ['Autre',                     '0', '9'],
  ]

  const pays: [string, string, string][] = [
    ['Pays UEMOA',            '', ''],
    ['Pays CEMAC',            '', ''],
    ['Autres pays OHADA',     '', ''],
    ['Afrique du Sud',        '2', '0'],
    ['Autres pays africains', '2', '1'],
    ['Suisse',                '2', '2'],
    ['France',                '2', '3'],
    ['Autres UE',             '3', '9'],
    ['USA',                   '4', '0'],
    ['Canada',                '4', '1'],
    ['Brésil',                '4', '3'],
    ['Autres américains',     '4', '9'],
    ['Chine',                 '5', '0'],
    ['Inde',                  '5', '2'],
    ['Liban',                 '5', '3'],
    ['Autres asiatiques',     '5', '9'],
    ['Russie',                '6', '0'],
    ['Autres pays',           '9', '9'],
  ]

  // Build combined rows for forme juridique (left) and pays (right)
  const maxLen = Math.max(formeJuridique.length, pays.length)
  for (let i = 0; i < maxLen; i++) {
    const row = emptyRow(C)
    if (i < formeJuridique.length) {
      row[0] = formeJuridique[i][0]
      row[3] = formeJuridique[i][1]
      row[4] = formeJuridique[i][2]
    }
    if (i < pays.length) {
      row[5] = pays[i][0]
      row[8] = pays[i][1]
      row[9] = pays[i][2]
    }
    rows.push(row)
  }
  // Fill remaining rows if pays is longer
  // (already handled by loop above since maxLen = max of both)

  // ── Row after pays table: empty separator ──
  // Current row index = 10 + maxLen = 28
  rows.push(emptyRow(C))
  rows.push(emptyRow(C))

  // ── Row 30: Code régime fiscal ──
  const r30 = rowAt(C, [0, '2 - Code régime fiscal'])
  rows.push(r30)

  // ── Row 31: empty ──
  rows.push(emptyRow(C))

  // ── Rows 32-35: Regime codes ──
  const regimes: [string, string][] = [
    ['Réel normal',    '1'],
    ['Réel simplifié', '2'],
    ['Synthétique',    '3'],
    ['Forfait',        '4'],
  ]
  for (const [label, code] of regimes) {
    rows.push(rowAt(C, [0, label], [3, code]))
  }

  // ── Rows 36-40: empty separators to reach footnotes ──
  while (rows.length < 41) {
    rows.push(emptyRow(C))
  }

  // ── Rows 41-44: footnotes ──
  rows.push(rowAt(C, [0, '(1) indiquer en cochant le code correspondant à la forme juridique de l\'entité']))
  rows.push(rowAt(C, [0, '(2) indiquer en cochant le code correspondant au régime fiscal de l\'entité']))
  rows.push(rowAt(C, [0, '(3) indiquer en cochant le code correspondant au pays du siège social de l\'entité']))
  rows.push(rowAt(C, [0, '(4) indiquer le code CIAP de l\'activité principale (cf. nomenclature page suivante)']))

  // Pad to 46 rows
  while (rows.length < 46) {
    rows.push(emptyRow(C))
  }

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 5 — NOTE36 Suite (Nomenclature CIAP)  10 cols × 239 rows
// ────────────────────────────────────────────────────────────────────────────

/** CIAP major section headers (code + label) */
const CIAP_SECTIONS: [string, string][] = [
  ['A01', 'Culture et production animale, chasse et services annexes'],
  ['A02', 'Sylviculture et exploitation forestière'],
  ['A03', 'Pêche et aquaculture'],
  ['B05', 'Extraction de houille et de lignite'],
  ['B06', 'Extraction d\'hydrocarbures'],
  ['B07', 'Extraction de minerais métalliques'],
  ['B08', 'Autres industries extractives'],
  ['B09', 'Services de soutien aux industries extractives'],
  ['C10', 'Industries alimentaires'],
  ['C11', 'Fabrication de boissons'],
  ['C12', 'Fabrication de produits à base de tabac'],
  ['C13', 'Fabrication de textiles'],
  ['C14', 'Industrie de l\'habillement'],
  ['C15', 'Industrie du cuir et de la chaussure'],
  ['C16', 'Travail du bois et fabrication d\'articles en bois'],
  ['C17', 'Industrie du papier et du carton'],
  ['C18', 'Imprimerie et reproduction d\'enregistrements'],
  ['C19', 'Cokéfaction et raffinage'],
  ['C20', 'Industrie chimique'],
  ['C21', 'Industrie pharmaceutique'],
  ['C22', 'Fabrication de produits en caoutchouc et en plastique'],
  ['C23', 'Fabrication d\'autres produits minéraux non métalliques'],
  ['C24', 'Métallurgie'],
  ['C25', 'Fabrication de produits métalliques'],
  ['D35', 'Production et distribution d\'électricité, de gaz, de vapeur et d\'air conditionné'],
  ['E36', 'Captage, traitement et distribution d\'eau'],
  ['E37', 'Collecte et traitement des eaux usées'],
  ['E38', 'Collecte, traitement et élimination des déchets ; récupération'],
  ['E39', 'Dépollution et autres services de gestion des déchets'],
  ['F41', 'Construction de bâtiments'],
  ['F42', 'Génie civil'],
  ['F43', 'Travaux de construction spécialisés'],
  ['G45', 'Commerce et réparation d\'automobiles et de motocycles'],
  ['G46', 'Commerce de gros'],
  ['G47', 'Commerce de détail'],
  ['H49', 'Transports terrestres et transport par conduites'],
  ['H50', 'Transports par eau'],
  ['H51', 'Transports aériens'],
  ['H52', 'Entreposage et services auxiliaires des transports'],
  ['H53', 'Activités de poste et de courrier'],
  ['I55', 'Hébergement'],
  ['I56', 'Restauration'],
  ['J58', 'Édition'],
  ['J59', 'Production de films, vidéo et programmes de télévision ; enregistrement sonore et édition musicale'],
  ['J60', 'Programmation et diffusion'],
  ['J61', 'Télécommunications'],
  ['J62', 'Programmation, conseil et autres activités informatiques'],
  ['J63', 'Services d\'information'],
  ['K64', 'Activités des services financiers, hors assurance et caisses de retraite'],
  ['K65', 'Assurance, réassurance et caisses de retraite'],
  ['K66', 'Activités auxiliaires de services financiers et d\'assurance'],
  ['L68', 'Activités immobilières'],
  ['M69', 'Activités juridiques et comptables'],
  ['M70', 'Activités des sièges sociaux ; conseil de gestion'],
  ['M71', 'Activités d\'architecture et d\'ingénierie'],
  ['M72', 'Recherche-développement scientifique'],
  ['M73', 'Publicité et études de marché'],
  ['M74', 'Autres activités spécialisées, scientifiques et techniques'],
  ['M75', 'Activités vétérinaires'],
  ['N77', 'Activités de location et location-bail'],
  ['N78', 'Activités liées à l\'emploi'],
  ['N79', 'Activités des agences de voyage et services de réservation'],
  ['N80', 'Enquêtes et sécurité'],
  ['N81', 'Services relatifs aux bâtiments et aménagement paysager'],
  ['N82', 'Activités administratives et autres activités de soutien aux entreprises'],
  ['O84', 'Administration publique et défense ; sécurité sociale obligatoire'],
  ['P85', 'Enseignement'],
  ['Q86', 'Activités pour la santé humaine'],
  ['Q87', 'Hébergement médico-social et social'],
  ['Q88', 'Action sociale sans hébergement'],
  ['R90', 'Activités créatives, artistiques et de spectacle'],
  ['R91', 'Bibliothèques, archives, musées et autres activités culturelles'],
  ['R92', 'Organisation de jeux de hasard et d\'argent'],
  ['R93', 'Activités sportives, récréatives et de loisirs'],
  ['S94', 'Activités des organisations associatives'],
  ['S95', 'Réparation d\'ordinateurs et de biens personnels et domestiques'],
  ['S96', 'Autres activités de services personnels'],
  ['T97', 'Activités des ménages en tant qu\'employeurs de personnel domestique'],
  ['T98', 'Activités indifférenciées des ménages en tant que producteurs de biens et services pour usage propre'],
  ['U99', 'Activités des organisations et organismes extraterritoriaux'],
]

function buildNote36Nomenclature(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 10
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0: page number ──
  rows.push(rowAt(C, [0, '- 3 -']))
  merges.push(m(0, 0, 0, 9))

  // ── Row 1: NOTE 36 (suite) label ──
  rows.push(rowAt(C, [7, 'NOTE 36 (suite)\nSYSTEME NORMAL']))
  merges.push(m(1, 7, 1, 9))

  // ── Rows 2-5: standard header ──
  rows.push(...headerRows(ent, ex, C))

  // ── Row 6: title ──
  rows.push(rowAt(C, [0, 'NOTE 36 SUITE : CLASSIFICATION IVOIRIENNE DES ACTIVITES ET DES PRODUITS (CIAP)']))
  merges.push(m(6, 0, 6, 9))

  // ── Rows 7-8: instruction text ──
  rows.push(rowAt(C, [0, 'Indiquer le code CIAP de l\'activité principale de l\'entité.']))
  rows.push(rowAt(C, [0, 'Si l\'entité exerce plusieurs activités, indiquer le code de celle qui génère le plus gros chiffre d\'affaires.']))

  // ── Row 9: section title ──
  rows.push(rowAt(C, [0, 'NOMENCLATURE CIAP']))
  merges.push(m(9, 0, 9, 9))

  // ── Row 10: column headers ──
  rows.push(rowAt(C, [0, 'Code Activité'], [1, 'Activités'], [4, 'Code Activité'], [5, 'Activités']))
  merges.push(m(10, 1, 10, 3))  // "Activités" left spans B-D
  merges.push(m(10, 5, 10, 9))  // "Activités" right spans F-J

  // ── Rows 11-238: CIAP data in two-column layout ──
  // Split sections into left and right halves
  const half = Math.ceil(CIAP_SECTIONS.length / 2)
  const leftSections = CIAP_SECTIONS.slice(0, half)
  const rightSections = CIAP_SECTIONS.slice(half)

  const totalDataRows = 239 - 11 // rows 11 to 238 inclusive = 228 rows
  for (let i = 0; i < totalDataRows; i++) {
    const row = emptyRow(C)
    if (i < leftSections.length) {
      row[0] = leftSections[i][0]
      row[1] = leftSections[i][1]
    }
    if (i < rightSections.length) {
      row[4] = rightSections[i][0]
      row[5] = rightSections[i][1]
    }
    rows.push(row)

    // Add merge for label cells when they have content
    const rowIdx = 11 + i
    if (i < leftSections.length) {
      merges.push(m(rowIdx, 1, rowIdx, 3))
    }
    if (i < rightSections.length) {
      merges.push(m(rowIdx, 5, rowIdx, 9))
    }
  }

  return { rows, merges }
}

export { buildNote36Codes, buildNote36Nomenclature }
