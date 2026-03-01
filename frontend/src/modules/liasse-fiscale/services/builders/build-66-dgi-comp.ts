/**
 * build-66-dgi-comp.ts
 * Builders for sheets 66-70 of the SYSCOHADA liasse fiscale:
 *   - Sheet 66: GARDE (DGI-INS)       - Cover page for supplementary states
 *   - Sheet 67: NOTES DGI - INS       - Checklist of supplementary states
 *   - Sheet 68: COMP-CHARGES           - Detail of charges (4 pages, ~275 rows)
 *   - Sheet 69: COMP-TVA              - TVA state
 *   - Sheet 70: COMP-TVA (2)          - TVA supportee non deductible
 */

import { SheetData, Row, emptyRow, rowAt, m, headerRows } from './helpers'
import type { EntrepriseData, ExerciceData, BalanceEntry } from './helpers'

// ════════════════════════════════════════════════════════════════════════════
// Helper: COMP-CHARGES page header (repeated on each of the 4 sub-pages)
// ════════════════════════════════════════════════════════════════════════════

function compChargesPageHeader(
  ent: EntrepriseData,
  ex: ExerciceData,
  pageNum: number,
  rows: Row[],
  merges: ReturnType<typeof m>[],
): void {
  const C = 10
  let r = rows.length

  // Row 0: SYSTEME NORMAL | page | ETAT COMPLEMENTAIRE
  rows.push(rowAt(C,
    [0, 'SYSTEME NORMAL'],
    [3, `- ${pageNum + 1} -`],
    [7, `ETAT COMPLEMENTAIRE N\u00B01 PAGE ${pageNum + 1}/4`],
  ))
  merges.push(m(r, 0, r, 1))   // A:B
  merges.push(m(r, 7, r, 9))   // H:J
  r++

  // Row 1: Denomination
  rows.push(rowAt(C,
    [0, 'D\u00e9nomination sociale :'],
    [2, ent.denomination || ''],
  ))
  merges.push(m(r, 2, r, 6))
  r++

  // Row 2: Adresse
  rows.push(rowAt(C,
    [0, 'Adresse :'],
    [1, ent.adresse || ''],
  ))
  merges.push(m(r, 1, r, 6))
  r++

  // Row 3: NCC
  rows.push(rowAt(C,
    [0, 'N\u00B0 de compte contribuable (NCC) :'],
    [2, ent.ncc || ''],
  ))
  merges.push(m(r, 2, r, 4))
  r++

  // Row 4: NTD
  rows.push(rowAt(C,
    [0, 'N\u00B0 de t\u00e9l\u00e9d\u00e9clarant (NTD) :'],
    [2, ent.ntd || ''],
  ))
  merges.push(m(r, 2, r, 4))
  r++

  // Row 5: Title
  rows.push(rowAt(C, [0, 'ETAT COMPLEMENTAIRE DIRECTION GENERALE DES IMPOTS/COMPTABILITE NATIONALE']))
  merges.push(m(r, 0, r, 9))
  r++

  // Row 6: Column headers line 1
  rows.push(rowAt(C,
    [0, 'DETAIL DES CHARGES EN FCFA'],
    [6, `Exercice N\n${ex.dateFin ? ex.dateFin.slice(0, 4) : ''}`],
    [7, `Exercice N-1\n${ex.dateFin ? String(Number(ex.dateFin.slice(0, 4)) - 1) : ''}`],
    [8, 'Variation N/N-1'],
  ))
  merges.push(m(r, 0, r, 5))   // A:F detail label
  merges.push(m(r, 8, r, 9))   // I:J variation
  r++

  // Row 7: Column headers line 2 (sub-headers for variation)
  rows.push(rowAt(C,
    [8, 'En valeur'],
    [9, 'En %'],
  ))
  r++
}

// ════════════════════════════════════════════════════════════════════════════
// Helper: Generate detail rows for COMP-CHARGES
// ════════════════════════════════════════════════════════════════════════════

/** Add a detail row: account in col A, label in col B, values 0 in G-J */
function addDetailRow(
  rows: Row[],
  account: string,
  label: string,
): void {
  const C = 10
  rows.push(rowAt(C,
    [0, account],
    [1, label],
    [6, 0],
    [7, 0],
    [8, 0],
    [9, 0],
  ))
}

/** Add a subtotal row: ref in col A, label in col C, values 0 in G-J */
function addSubtotalRow(
  rows: Row[],
  merges: ReturnType<typeof m>[],
  ref: string,
  label: string,
): void {
  const C = 10
  const r = rows.length
  rows.push(rowAt(C,
    [0, ref],
    [2, label],
    [6, 0],
    [7, 0],
    [8, 0],
    [9, 0],
  ))
  merges.push(m(r, 2, r, 5)) // C:F merge for label
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 66 — GARDE (DGI-INS) : Cover page for supplementary states
//   10 columns (A=0 to J=9)
// ────────────────────────────────────────────────────────────────────────────

function buildGardeDgiIns(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  _ent: EntrepriseData,
  _ex: ExerciceData,
): SheetData {
  const C = 10
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ~30 rows, mostly empty
  for (let i = 0; i < 22; i++) rows.push(emptyRow(C))

  // Row 22 (L23): cover text at col E (index 4)
  rows.push(rowAt(C, [4, 'ETATS SUPPLEMENTAIRES \nDIRECTION GENERALE DES IMPOTS ET        INSTITUT NATIONAL DE LA STATISTIQUE']))
  merges.push(m(22, 4, 22, 9)) // E23:J23

  // Pad to ~30 rows
  for (let i = 23; i < 30; i++) rows.push(emptyRow(C))

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 67 — NOTES DGI - INS : Checklist of supplementary states
//   10 columns (A=0 to J=9)
// ────────────────────────────────────────────────────────────────────────────

function buildNotesDgiIns(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 10
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): page number ──
  rows.push(rowAt(C, [0, '- 1 -']))
  merges.push(m(0, 0, 0, 9)) // A1:J1

  // ── Row 1 (L2): label ──
  rows.push(rowAt(C, [8, 'NOTES DGI']))

  // ── Rows 2-5 (L3-L6): standard header ──
  rows.push(...headerRows(ent, ex, C, { sigleCol: 7, sigleValCol: 8 }))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'FICHE RECAPITULATIVE DES ETATS SUPPLEMENTAIRES  DGI & INS  PRESENTES (1)']))
  merges.push(m(6, 0, 6, 9)) // A7:J7

  // ── Row 7 (L8): column headers ──
  rows.push(rowAt(C,
    [0, 'NOTES'],
    [1, 'INTITULES'],
    [8, 'A'],
    [9, 'N/A'],
  ))
  merges.push(m(7, 1, 7, 7)) // B8:H8

  // ── Rows 8-24 (L9-L25): checklist items ──
  const checklistItems: [string, string][] = [
    ['COMP - CHARGES', 'ETAT COMPLEMENTAIRE : DETAIL DES CHARGES'],
    ['COMP - TVA (1)', 'ETAT COMPLEMENTAIRE : TVA'],
    ['COMP - TVA (2)', 'ETAT COMPLEMENTAIRE POUR l\'INS: TVA SUPPORTEE NON DEDUCTIBLE'],
    ['SUPPL 1', 'ELEMENTS STATISTIQUES UEMOA'],
    ['SUPPL 2', 'REPARTITION DU RESULTAT FISCAL DES SOCIETES DE PERSONNES'],
    ['SUPPL 3', 'COMPLEMENT INFORMATIONS ENTITES INDIVIDUELLES'],
    ['SUPPL 4', 'TABLEAU DES AMORTISSEMENTS ET INVENTAIRE DES IMMOBILISATIONS'],
    ['SUPPL 5', 'DETAIL DES FRAIS ACCESSOIRES SUR ACHATS'],
    ['SUPPL 6', 'DETAIL DES AVANTAGES EN NATURE ET EN ESPECES'],
    ['SUPPL 7', 'CREANCES ET DETTES ECHUES DE L\'EXERCICE'],
    ['BIC', 'DETERMINATION DU BENEFICE INDUSTRIEL OU COMMERCIAL'],
    ['BNC', 'DETERMINATION DU BENEFICE NON COMMERCIAL'],
    ['BA', 'DETERMINATION DU BENEFICE AGRICOLE'],
    ['301', 'DECLARATION DES REMUNERATIONS VERSEES AUX SALARIES'],
    ['302', 'DECLARATION DES REMUNERATIONS VERSEES A DES CONTRIBUABLES...'],
    ['\u2026\u2026', 'AUTRES A PRECISER (2)'],
    ['\u2026\u2026', ''],
  ]

  for (let i = 0; i < checklistItems.length; i++) {
    const [note, intitule] = checklistItems[i]
    const r = 8 + i
    rows.push(rowAt(C,
      [0, note],
      [1, intitule],
      [8, null],
      [9, null],
    ))
    merges.push(m(r, 1, r, 7)) // B:H merge for intitule
  }

  // ── Rows 25-33 (L26-L34): empty padding ──
  for (let i = 0; i < 9; i++) rows.push(emptyRow(C))

  // ── Rows 34-37 (L35-L38): footnotes ──
  rows.push(rowAt(C, [0, '(1) Mettre une croix (X) dans la colonne "A" si l\'\u00e9tat est applicable et joint']))
  merges.push(m(34, 0, 34, 9))

  rows.push(rowAt(C, [0, '    ou dans la colonne "N/A" si l\'\u00e9tat n\'est pas applicable']))
  merges.push(m(35, 0, 35, 9))

  rows.push(rowAt(C, [0, '(2) Joindre les \u00e9tats suppl\u00e9mentaires demand\u00e9s par la DGI ou l\'INS']))
  merges.push(m(36, 0, 36, 9))

  rows.push(emptyRow(C))

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 68 — COMP-CHARGES : Detail of charges (4 pages, ~275 rows)
//   10 columns (A=0 to J=9)
// ────────────────────────────────────────────────────────────────────────────

function buildCompCharges(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ════════════════════════════════════════════════════════════════════════
  // Account sections definition
  // ════════════════════════════════════════════════════════════════════════

  // Page 1 sections
  const page1Sections: { accounts: [string, string][]; ref: string; label: string }[] = [
    {
      accounts: [
        ['6011', 'Achats de marchandises dans la r\u00e9gion'],
        ['6012', 'Achats de marchandises hors r\u00e9gion'],
        ['6013', 'Achats de marchandises import\u00e9es du reste du monde'],
        ['6014', 'Achats de marchandises import\u00e9es - groupe'],
        ['6015', 'Achats de marchandises dans la r\u00e9gion - groupe'],
        ['6019', 'Rabais, remises, ristournes obtenus (non ventil\u00e9s)'],
      ],
      ref: 'RA',
      label: 'ACHATS DE MARCHANDISES',
    },
    {
      accounts: [
        ['6031', 'Variations des stocks de marchandises'],
      ],
      ref: 'RB',
      label: 'VARIATIONS DE STOCKS DE MARCHANDISES',
    },
    {
      accounts: [
        ['6021', 'Achats de mati\u00e8res premi\u00e8res et fournitures li\u00e9es dans la r\u00e9gion'],
        ['6022', 'Achats de mati\u00e8res premi\u00e8res hors r\u00e9gion'],
        ['6023', 'Achats de mati\u00e8res premi\u00e8res import\u00e9es du reste du monde'],
        ['6024', 'Achats de mati\u00e8res premi\u00e8res import\u00e9es - groupe'],
        ['6025', 'Achats de mati\u00e8res premi\u00e8res dans la r\u00e9gion - groupe'],
        ['6029', 'Rabais, remises, ristournes obtenus (non ventil\u00e9s) - MP'],
      ],
      ref: 'RC',
      label: 'ACHATS DE MATIERES PREMIERES ET FOURNITURES LIEES',
    },
    {
      accounts: [
        ['6032', 'Variations des stocks de mati\u00e8res premi\u00e8res'],
      ],
      ref: 'RD',
      label: 'VARIATIONS DE STOCKS DE MATIERES PREMIERES',
    },
    {
      accounts: [
        ['6041', 'Mati\u00e8res consommables'],
        ['6042', 'Mati\u00e8res combustibles'],
        ['6043', 'Produits d\'entretien'],
        ['6044', 'Fournitures d\'atelier et d\'usine'],
        ['6045', 'Fournitures de magasin'],
        ['6046', 'Fournitures de bureau'],
        ['6047', 'Achats de petit mat\u00e9riel et outillage'],
        ['6049', 'Rabais, remises, ristournes obtenus - autres achats'],
        ['6051', 'Fournitures non stockables - eau'],
        ['6052', 'Fournitures non stockables - \u00e9lectricit\u00e9'],
        ['6053', 'Fournitures non stockables - autres \u00e9nergies'],
        ['6054', 'Fournitures d\'entretien non stockables'],
        ['6055', 'Fournitures de bureau non stockables'],
        ['6056', 'Achats de petit mat\u00e9riel et outillage non stockable'],
        ['6057', 'Achats d\'\u00e9tudes et de prestations de services'],
        ['6058', 'Achats de travaux, mat\u00e9riels et \u00e9quipements'],
        ['6059', 'Rabais, remises, ristournes obtenus - non stockables'],
        ['6081', 'Achats d\'emballages perdus'],
        ['6082', 'Achats d\'emballages r\u00e9cup\u00e9rables non identifiables'],
        ['6083', 'Achats d\'emballages \u00e0 usage mixte'],
        ['6085', 'Achats d\'emballages - groupe'],
        ['6089', 'Rabais, remises, ristournes obtenus - emballages'],
      ],
      ref: 'RE',
      label: 'AUTRES ACHATS',
    },
    {
      accounts: [
        ['6033', 'Variations des stocks d\'autres approvisionnements'],
      ],
      ref: 'RF',
      label: 'VARIATIONS DE STOCKS D\'AUTRES APPROVISIONNEMENTS',
    },
    {
      accounts: [
        ['612', 'Transports sur achats'],
        ['613', 'Transports pour le compte de tiers'],
        ['614', 'Transports du personnel'],
        ['616', 'Transports de plis'],
        ['6181', 'Voyages et d\u00e9placements'],
        ['6182', 'Transports entre \u00e9tablissements ou chantiers'],
        ['6183', 'Transports administratifs'],
        ['619', 'Rabais, remises, ristournes obtenus - transports'],
      ],
      ref: 'RG',
      label: 'TRANSPORTS',
    },
  ]

  // Trailing accounts on page 1 (start of Services ext\u00e9rieurs, no subtotal yet)
  const page1Trailing: [string, string][] = [
    ['621', 'Sous-traitance g\u00e9n\u00e9rale'],
    ['6221', 'Locations de terrains'],
    ['6222', 'Locations de b\u00e2timents'],
    ['6223', 'Locations de mat\u00e9riel et outillage'],
    ['6224', 'Locations de mat\u00e9riel de transport'],
    ['6225', 'Locations de mat\u00e9riel informatique'],
    ['6226', 'Locations de mat\u00e9riel de bureau'],
    ['6228', 'Locations et charges locatives diverses'],
    ['6232', 'Cr\u00e9dit-bail immobilier'],
    ['6233', 'Cr\u00e9dit-bail mobilier'],
    ['6234', 'Cr\u00e9dit-bail de mat\u00e9riel de transport'],
  ]

  // Page 2 sections
  const page2Accounts: [string, string][] = [
    ['6238', 'Autres cr\u00e9dits-bails'],
    ['6241', 'Entretien et r\u00e9parations des biens immobiliers'],
    ['6242', 'Entretien et r\u00e9parations des biens mobiliers'],
    ['6243', 'Entretien et r\u00e9parations des biens mobiliers de transport'],
    ['6244', 'Maintenance'],
    ['6248', 'Autres entretiens et r\u00e9parations'],
    ['6251', 'Assurances multirisques'],
    ['6252', 'Assurances mat\u00e9riel de transport'],
    ['6253', 'Assurances risques d\'exploitation'],
    ['6254', 'Assurances responsabilit\u00e9 du chef d\'entreprise'],
    ['6255', 'Assurances insolvabilit\u00e9 clients'],
    ['6257', 'Assurances marchandises transport\u00e9es'],
    ['6258', 'Autres primes d\'assurances'],
    ['6261', 'Etudes, recherches et documentation g\u00e9n\u00e9rale'],
    ['6265', 'Documentation g\u00e9n\u00e9rale'],
    ['6266', 'Documentation technique'],
    ['6271', 'Annonces et insertions'],
    ['6272', 'Catalogues et imprim\u00e9s publicitaires'],
    ['6273', 'Echantillons, foires et expositions'],
    ['6274', 'Cadeaux \u00e0 la client\u00e8le'],
    ['6275', 'Primes de publicit\u00e9'],
    ['6276', 'Publications'],
    ['6277', 'Frais de colloques, s\u00e9minaires et conf\u00e9rences'],
    ['6278', 'Autres charges de publicit\u00e9 et relations publiques'],
    ['6281', 'T\u00e9l\u00e9phone'],
    ['6282', 'T\u00e9l\u00e9copie (fax)'],
    ['6283', 'Internet'],
    ['6284', 'Affranchissements postaux'],
    ['6288', 'Autres frais de t\u00e9l\u00e9communications'],
    ['6311', 'Frais bancaires sur emprunts'],
    ['6312', 'Frais bancaires sur op\u00e9rations d\'escompte'],
    ['6313', 'Frais sur effets impay\u00e9s'],
    ['6314', 'Commissions bancaires sur achats et ventes de devises'],
    ['6315', 'Commissions bancaires sur cautions et avals'],
    ['6316', 'Frais de tenue de compte'],
    ['6317', 'Frais sur cartes de cr\u00e9dit'],
    ['6318', 'Autres frais bancaires'],
    ['6322', 'R\u00e9mun\u00e9rations d\'interm\u00e9diaires et de conseils - honoraires'],
    ['6324', 'Honoraires des professionnels comptables'],
    ['6325', 'R\u00e9mun\u00e9ration des transitaires'],
    ['6326', 'Frais d\'actes et de contentieux'],
    ['6327', 'Frais de commissariat aux comptes'],
    ['6328', 'Divers frais'],
    ['633', 'Frais de formation du personnel'],
    ['6342', 'Redevances pour brevets, licences, marques et proc\u00e9d\u00e9s'],
    ['6343', 'Redevances pour logiciels'],
    ['6344', 'Redevances pour droits et valeurs similaires'],
    ['6345', 'Redevances pour concessions, brevets et droits similaires'],
    ['6346', 'Redevances de franchisage'],
    ['6351', 'Cotisations aux organisations patronales'],
    ['6358', 'Cotisations aux autres organismes'],
    ['6371', 'R\u00e9mun\u00e9rations du personnel ext\u00e9rieur \u00e0 l\'entit\u00e9'],
    ['6372', 'Personnel int\u00e9rimaire'],
    ['6381', 'Frais de recrutement du personnel'],
    ['6382', 'Frais de d\u00e9m\u00e9nagement'],
    ['6383', 'R\u00e9ceptions'],
    ['6384', 'Missions'],
    ['6385', 'Frais de s\u00e9curit\u00e9'],
    ['6388', 'Autres charges externes diverses'],
  ]

  const page2SubtotalRef = 'RH'
  const page2SubtotalLabel = 'SERVICES EXTERIEURS'

  const page2TrailingImpots: [string, string][] = [
    ['6411', 'Imp\u00f4ts fonciers'],
    ['6412', 'Patentes et licences'],
    ['6413', 'Taxes sur les v\u00e9hicules de soci\u00e9t\u00e9'],
    ['6414', 'Taxes sur les salaires'],
  ]

  // Page 3 sections
  const page3AccountsImpots: [string, string][] = [
    ['6415', 'Taxe d\'apprentissage'],
    ['6418', 'Autres imp\u00f4ts et contributions'],
    ['645', 'Imp\u00f4ts et taxes indirects'],
    ['6461', 'Droits d\'enregistrement'],
    ['6462', 'Droits de timbre'],
    ['6463', 'Taxes sur les v\u00e9hicules'],
    ['6464', 'Vignettes'],
    ['6468', 'Autres droits'],
    ['6471', 'Imp\u00f4ts et taxes recouvrables sur des tiers'],
    ['6472', 'Imp\u00f4ts et taxes recouvrables sur des associ\u00e9s'],
    ['6473', 'Taxes professionnelles'],
    ['6474', 'Imp\u00f4ts et taxes sur le chiffre d\'affaires'],
    ['6478', 'Autres imp\u00f4ts et taxes'],
    ['648', 'Autres imp\u00f4ts et taxes'],
  ]

  const page3Sections: { accounts: [string, string][]; ref: string; label: string }[] = [
    {
      accounts: page3AccountsImpots,
      ref: 'RI',
      label: 'IMPOTS ET TAXES',
    },
    {
      accounts: [
        ['6511', 'Pertes sur cr\u00e9ances clients et autres d\u00e9biteurs'],
        ['6515', 'Pertes sur cr\u00e9ances de l\'exercice'],
        ['6521', 'Valeurs comptables de cessions courantes d\'immobilisations incorporelles'],
        ['6525', 'Valeurs comptables de cessions courantes d\'immobilisations financi\u00e8res'],
        ['6541', 'Valeurs comptables de cessions - titres immobilis\u00e9s'],
        ['6542', 'Valeurs comptables de cessions - titres de placement'],
        ['656', 'Abandons de cr\u00e9ances consentis'],
        ['657', 'Charges provisonn\u00e9es d\'exploitation'],
        ['6581', 'Jetons de pr\u00e9sence et autres r\u00e9mun\u00e9rations d\'administrateurs'],
        ['6582', 'Dons'],
        ['6583', 'M\u00e9c\u00e9nat'],
        ['6588', 'Autres charges diverses'],
        ['6591', 'Charges provisonn\u00e9es sur risques \u00e0 court terme'],
        ['6593', 'Charges provisonn\u00e9es sur risques \u00e0 long terme'],
        ['6594', 'Charges provisonn\u00e9es sur litiges'],
        ['6598', 'Autres charges provisonn\u00e9es'],
      ],
      ref: 'RJ',
      label: 'AUTRES CHARGES',
    },
  ]

  const page3Personnel: [string, string][] = [
    ['6611', 'Appointements salaires et commissions - personnel national'],
    ['6612', 'Appointements salaires et commissions - personnel non national'],
    ['6613', 'Primes et gratifications'],
    ['6614', 'Indemnit\u00e9s de pr\u00e9avis, licenciement et recherche d\'embauche'],
    ['6615', 'Indemnit\u00e9s de maladie vers\u00e9es aux travailleurs'],
    ['6616', 'Suppl\u00e9ment familial'],
    ['6617', 'Avantages en nature'],
    ['6618', 'Autres r\u00e9mun\u00e9rations directes'],
    ['6621', 'Cong\u00e9s pay\u00e9s'],
    ['6622', 'Primes d\'assurance maladie'],
    ['6623', 'Indemnit\u00e9s de logement'],
    ['6624', 'Indemnit\u00e9s de repr\u00e9sentation'],
    ['6625', 'Indemnit\u00e9s de transport'],
    ['6626', 'Indemnit\u00e9s de nourriture'],
    ['6627', 'Autres indemnit\u00e9s et avantages divers'],
    ['6628', 'Autres charges de personnel'],
    ['6631', 'Charges sociales (CNPS et organismes nationaux)'],
    ['6632', 'Caisses de retraite compl\u00e9mentaire'],
    ['6633', 'Prestations directes'],
    ['6634', 'Versements aux syndicats et comit\u00e9s d\'entreprise'],
    ['6638', 'Autres charges sociales'],
    ['6641', 'Charges de personnel ext\u00e9rieur d\u00e9tach\u00e9 ou pr\u00eat\u00e9 \u00e0 l\'entit\u00e9'],
    ['6642', 'Charges de personnel int\u00e9rimaire'],
    ['6661', 'R\u00e9mun\u00e9rations vers\u00e9es aux dirigeants'],
    ['6662', 'Charges sociales sur r\u00e9mun\u00e9rations des dirigeants'],
    ['6671', 'R\u00e9mun\u00e9ration transf\u00e9r\u00e9e du personnel - national'],
    ['6672', 'R\u00e9mun\u00e9ration transf\u00e9r\u00e9e du personnel - non national'],
    ['6681', 'Indemnit\u00e9s forfaitaires vers\u00e9es au personnel'],
    ['6682', 'Versements aux \u0153uvres sociales'],
    ['6683', 'Versements aux comit\u00e9s d\'hygi\u00e8ne et de s\u00e9curit\u00e9'],
  ]

  // Page 4 sections
  const page4TrailingPersonnel: [string, string][] = [
    ['6684', 'M\u00e9decine du travail et pharmacie'],
    ['6685', 'Assurances compl\u00e9mentaires du personnel'],
    ['6686', 'R\u00e9mun\u00e9rations des stagiaires'],
    ['6687', 'Charges li\u00e9es aux \u0153uvres sociales internes'],
    ['6688', 'Autres charges sociales diverses'],
  ]

  const page4Sections: { accounts: [string, string][]; ref: string; label: string }[] = [
    {
      accounts: page4TrailingPersonnel,
      ref: 'RK',
      label: 'CHARGES DE PERSONNEL',
    },
    {
      accounts: [
        ['6711', 'Int\u00e9r\u00eats des emprunts'],
        ['6712', 'Int\u00e9r\u00eats dans loyers de cr\u00e9dit-bail'],
        ['6713', 'Int\u00e9r\u00eats des dettes commerciales'],
        ['6714', 'Int\u00e9r\u00eats des comptes courants bloqu\u00e9s'],
        ['6721', 'Int\u00e9r\u00eats dans loyers des biens pris en cr\u00e9dit-bail immobilier'],
        ['6722', 'Int\u00e9r\u00eats dans loyers des biens pris en cr\u00e9dit-bail mobilier'],
        ['6723', 'Int\u00e9r\u00eats dans loyers des biens pris en cr\u00e9dit-bail - mat\u00e9riel de transport'],
        ['6728', 'Autres int\u00e9r\u00eats cr\u00e9dit-bail'],
        ['673', 'Escomptes accord\u00e9s'],
        ['6741', 'Pertes de change financi\u00e8res - emprunts'],
        ['6742', 'Pertes de change financi\u00e8res - cr\u00e9ances'],
        ['6743', 'Pertes de change financi\u00e8res - avances'],
        ['6744', 'Pertes de change financi\u00e8res - d\u00e9p\u00f4ts et cautionnements'],
        ['6745', 'Pertes de change financi\u00e8res - titres de placement'],
        ['6748', 'Autres pertes de change financi\u00e8res'],
        ['675', 'Escomptes des effets de commerce'],
        ['676', 'Pertes de change sur cr\u00e9ances et dettes commerciales'],
        ['6771', 'Pertes sur cessions de titres de placement'],
        ['6772', 'Pertes sur cessions de titres immobilis\u00e9s'],
        ['6781', 'Int\u00e9r\u00eats sur dettes commerciales'],
        ['6782', 'Charges nettes sur cessions de valeurs mobili\u00e8res de placement'],
        ['6784', 'Charges financi\u00e8res diverses'],
        ['6791', 'Charges provisonn\u00e9es financi\u00e8res - risques \u00e0 court terme'],
        ['6795', 'Charges provisonn\u00e9es financi\u00e8res - risques \u00e0 long terme'],
        ['6798', 'Autres charges provisonn\u00e9es financi\u00e8res'],
      ],
      ref: 'RM',
      label: 'FRAIS FINANCIERS ET CHARGES ASSIMILEES',
    },
    {
      accounts: [
        ['6812', 'Dotations aux amortissements des immobilisations corporelles'],
        ['6813', 'Dotations aux amortissements des immobilisations incorporelles'],
        ['6911', 'Dotations aux provisions d\'exploitation'],
        ['6913', 'Dotations aux provisions pour d\u00e9pr\u00e9ciation des stocks'],
        ['6914', 'Dotations aux provisions pour d\u00e9pr\u00e9ciation des cr\u00e9ances'],
      ],
      ref: 'RL',
      label: 'DOTATIONS AUX AMORTISSEMENTS ET AUX PROVISIONS',
    },
    {
      accounts: [
        ['6971', 'Dotations aux provisions financi\u00e8res d\'exploitation'],
        ['6972', 'Dotations aux provisions financi\u00e8res pour risques et charges'],
      ],
      ref: 'RN',
      label: 'DOTATIONS AUX PROVISIONS FINANCIERES',
    },
  ]

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 1
  // ════════════════════════════════════════════════════════════════════════

  compChargesPageHeader(ent, ex, 0, rows, merges)

  for (const section of page1Sections) {
    for (const [acct, label] of section.accounts) {
      addDetailRow(rows, acct, label)
    }
    addSubtotalRow(rows, merges, section.ref, section.label)
  }

  // Trailing accounts (start of Services ext\u00e9rieurs, continuing on page 2)
  for (const [acct, label] of page1Trailing) {
    addDetailRow(rows, acct, label)
  }

  // Blank separator
  rows.push(emptyRow(10))

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 2
  // ════════════════════════════════════════════════════════════════════════

  compChargesPageHeader(ent, ex, 1, rows, merges)

  for (const [acct, label] of page2Accounts) {
    addDetailRow(rows, acct, label)
  }
  addSubtotalRow(rows, merges, page2SubtotalRef, page2SubtotalLabel)

  // Trailing impots at end of page 2
  for (const [acct, label] of page2TrailingImpots) {
    addDetailRow(rows, acct, label)
  }

  // Blank separator
  rows.push(emptyRow(10))

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 3
  // ════════════════════════════════════════════════════════════════════════

  compChargesPageHeader(ent, ex, 2, rows, merges)

  for (const section of page3Sections) {
    for (const [acct, label] of section.accounts) {
      addDetailRow(rows, acct, label)
    }
    addSubtotalRow(rows, merges, section.ref, section.label)
  }

  // Personnel accounts continuing to page 4
  for (const [acct, label] of page3Personnel) {
    addDetailRow(rows, acct, label)
  }

  // Blank separator
  rows.push(emptyRow(10))

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 4
  // ════════════════════════════════════════════════════════════════════════

  compChargesPageHeader(ent, ex, 3, rows, merges)

  for (const section of page4Sections) {
    for (const [acct, label] of section.accounts) {
      addDetailRow(rows, acct, label)
    }
    addSubtotalRow(rows, merges, section.ref, section.label)
  }

  // TOTAL DES CHARGES ORDINAIRES
  rows.push(emptyRow(10))
  const totalR = rows.length
  rows.push(rowAt(10,
    [0, 'TOTAL'],
    [2, 'TOTAL DES CHARGES ORDINAIRES'],
    [6, 0],
    [7, 0],
    [8, 0],
    [9, 0],
  ))
  merges.push(m(totalR, 2, totalR, 5))

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 69 — COMP-TVA : Etat TVA
//   8 columns (A=0 to H=7)
// ────────────────────────────────────────────────────────────────────────────

function buildCompTva(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 8
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): header ──
  rows.push(rowAt(C,
    [0, 'SYSTEME NORMAL'],
    [4, '- 6 -'],
    [6, 'ETAT COMPLEMENTAIRE N\u00B02 PAGE 1/1'],
  ))
  merges.push(m(0, 0, 0, 1))   // A1:B1
  merges.push(m(0, 6, 0, 7))   // G1:H1

  // ── Rows 1-4 (L2-L5): ent info ──
  rows.push(rowAt(C,
    [0, 'D\u00e9nomination sociale :'],
    [2, ent.denomination || ''],
  ))
  merges.push(m(1, 2, 1, 5))

  rows.push(rowAt(C,
    [0, 'Adresse :'],
    [1, ent.adresse || ''],
  ))
  merges.push(m(2, 1, 2, 5))

  rows.push(rowAt(C,
    [0, 'N\u00B0 de compte contribuable (NCC) :'],
    [2, ent.ncc || ''],
  ))
  merges.push(m(3, 2, 3, 4))

  rows.push(rowAt(C,
    [0, 'N\u00B0 de t\u00e9l\u00e9d\u00e9clarant (NTD) :'],
    [2, ent.ntd || ''],
  ))
  merges.push(m(4, 2, 4, 4))

  // ── Row 5 (L6): empty separator ──
  rows.push(emptyRow(C))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'ETAT COMPLEMENTAIRE DIRECTION GENERALE DES IMPOTS/COMPTABILITE NATIONALE']))
  merges.push(m(6, 0, 6, 7)) // A7:H7

  // ── Row 7 (L8): empty separator ──
  rows.push(emptyRow(C))

  // ── Row 8 (L9): column headers ──
  rows.push(rowAt(C,
    [0, 'ETAT TVA\n(Inscrire les mouvements de la p\u00e9riode uniquement)'],
    [6, `Exercice N\n${ex.dateFin ? ex.dateFin.slice(0, 4) : ''}`],
    [7, `Exercice N-1\n${ex.dateFin ? String(Number(ex.dateFin.slice(0, 4)) - 1) : ''}`],
  ))
  merges.push(m(8, 0, 8, 5)) // A9:F9

  // ── Helper for TVA data rows ──
  const tvaRow = (col: number, label: string): void => {
    const r = emptyRow(C)
    r[col] = label
    r[6] = 0
    r[7] = 0
    rows.push(r)
  }

  const tvaMergedRow = (col: number, label: string): void => {
    const ri = rows.length
    tvaRow(col, label)
    if (col <= 2) merges.push(m(ri, col, ri, 5))
  }

  // ── Rows 9-13 (L10-L14): TVA factur\u00e9e ──
  tvaMergedRow(1, 'TVA factur\u00e9e sur ventes')
  tvaMergedRow(1, 'TVA factur\u00e9e sur prestations')
  tvaMergedRow(1, 'TVA factur\u00e9e sur travaux')
  tvaMergedRow(1, 'TVA factur\u00e9e sur production livr\u00e9e \u00e0 soi-m\u00eame')
  tvaMergedRow(1, 'TVA factur\u00e9e sur factures \u00e0 \u00e9tablir')

  // ── Row 14 (L15): TVA factur\u00e9e de la p\u00e9riode ──
  tvaMergedRow(2, 'TVA factur\u00e9e de la p\u00e9riode')

  // ── Row 15 (L16): TVA exigible ──
  tvaMergedRow(2, 'TVA exigible de la p\u00e9riode')

  // ── Rows 16-21 (L17-L22): TVA r\u00e9cup\u00e9rable ──
  tvaMergedRow(1, 'TVA r\u00e9cup\u00e9rable sur immobilisations')
  tvaMergedRow(1, 'TVA r\u00e9cup\u00e9rable sur achats')
  tvaMergedRow(1, 'TVA r\u00e9cup\u00e9rable sur transports')
  tvaMergedRow(1, 'TVA r\u00e9cup\u00e9rable sur services')
  tvaMergedRow(1, 'TVA r\u00e9cup\u00e9rable sur autres charges')
  tvaMergedRow(1, 'TVA sur factures non parvenues')

  // ── Row 22 (L23): TVA R\u00e9cup\u00e9rable de la p\u00e9riode ──
  tvaMergedRow(2, 'TVA R\u00e9cup\u00e9rable de la p\u00e9riode')

  // ── Row 23 (L24): TVA R\u00e9cup\u00e9r\u00e9e ──
  tvaMergedRow(2, 'TVA R\u00e9cup\u00e9r\u00e9e de la p\u00e9riode')

  // ── Row 24 (L25): Prorata ──
  tvaMergedRow(2, 'Prorata de d\u00e9duction')

  // ── Rows 25-26 (L26-L27): TVA due / Cr\u00e9dit ──
  tvaMergedRow(1, 'Etat TVA due')
  tvaMergedRow(1, 'Cr\u00e9dit TVA \u00e0 reporter')

  // ── Row 27 (L28): TVA Due ou cr\u00e9dit ──
  tvaMergedRow(2, 'TVA Due ou cr\u00e9dit')

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 70 — COMP-TVA (2) : TVA support\u00e9e non d\u00e9ductible
//   8 columns (A=0 to H=7)
// ────────────────────────────────────────────────────────────────────────────

function buildCompTva2(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 8
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0 (L1): header ──
  rows.push(rowAt(C,
    [0, 'SYSTEME NORMAL'],
    [4, '- 7 -'],
    [6, 'ETAT COMPLEMENTAIRE N\u00B03 PAGE 1/1'],
  ))
  merges.push(m(0, 0, 0, 1))   // A1:B1
  merges.push(m(0, 6, 0, 7))   // G1:H1

  // ── Rows 1-4 (L2-L5): ent info ──
  rows.push(rowAt(C,
    [0, 'D\u00e9nomination sociale :'],
    [2, ent.denomination || ''],
  ))
  merges.push(m(1, 2, 1, 5))

  rows.push(rowAt(C,
    [0, 'Adresse :'],
    [1, ent.adresse || ''],
  ))
  merges.push(m(2, 1, 2, 5))

  rows.push(rowAt(C,
    [0, 'N\u00B0 de compte contribuable (NCC) :'],
    [2, ent.ncc || ''],
  ))
  merges.push(m(3, 2, 3, 4))

  rows.push(rowAt(C,
    [0, 'N\u00B0 de t\u00e9l\u00e9d\u00e9clarant (NTD) :'],
    [2, ent.ntd || ''],
  ))
  merges.push(m(4, 2, 4, 4))

  // ── Row 5 (L6): empty separator ──
  rows.push(emptyRow(C))

  // ── Row 6 (L7): title ──
  rows.push(rowAt(C, [0, 'ETAT COMPLEMENTAIRE COMPTABILITE NATIONALE']))
  merges.push(m(6, 0, 6, 7)) // A7:H7

  // ── Row 7 (L8): subtitle ──
  rows.push(rowAt(C, [0, 'ETAT TVA SUPPORTEE NON DEDUCTIBLE']))
  merges.push(m(7, 0, 7, 7)) // A8:H8

  // ── Row 8 (L9): column headers ──
  rows.push(rowAt(C,
    [0, 'DESIGNATION'],
    [6, `Exercice N\n${ex.dateFin ? ex.dateFin.slice(0, 4) : ''}`],
    [7, `Exercice N-1\n${ex.dateFin ? String(Number(ex.dateFin.slice(0, 4)) - 1) : ''}`],
  ))
  merges.push(m(8, 0, 8, 5)) // A9:F9

  // ── Row 9 (L10): TVA sur immobilisations ──
  const r9 = emptyRow(C)
  r9[1] = 'TVA support\u00e9e non d\u00e9ductible sur les immobilisations'
  r9[6] = 0
  r9[7] = 0
  rows.push(r9)
  merges.push(m(9, 1, 9, 5))

  // ── Row 10 (L11): TVA sur achats ──
  const r10 = emptyRow(C)
  r10[1] = 'TVA support\u00e9e non d\u00e9ductible sur les achats'
  r10[6] = 0
  r10[7] = 0
  rows.push(r10)
  merges.push(m(10, 1, 10, 5))

  // ── Row 11 (L12): Total ──
  const r11 = emptyRow(C)
  r11[2] = 'Total'
  r11[6] = 0 // SUM(G10:G11)
  r11[7] = 0 // SUM(H10:H11)
  rows.push(r11)
  merges.push(m(11, 2, 11, 5))

  return { rows, merges }
}

// ════════════════════════════════════════════════════════════════════════════
// Exports
// ════════════════════════════════════════════════════════════════════════════

export { buildGardeDgiIns, buildNotesDgiIns, buildCompCharges, buildCompTva, buildCompTva2 }
