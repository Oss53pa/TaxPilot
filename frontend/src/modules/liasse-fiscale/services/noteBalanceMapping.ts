/**
 * Mapping des comptes de la balance vers les notes annexes.
 * Utilise les memes fonctions que liasse-calculs.ts pour garantir la coherence.
 */
import type { BalanceEntry } from '../types'
import type { Row } from '../components/LiasseTable'
import { getBalanceSolde, getCharges, getProduits } from './liasse-calculs'

// ── Definir les lignes d'une note avec mapping comptable ──

export interface NoteLineDef {
  label: string
  prefixes: string[]
  side?: 'solde' | 'debit' | 'credit' | 'credit_abs'
  isTotal?: boolean
  isSub?: boolean
  totalOf?: number[]  // indices des lignes a sommer pour le total
}

/** Compute the amount for a single line definition */
function computeLineAmount(balance: BalanceEntry[], line: NoteLineDef): number {
  if (line.prefixes.length === 0) return 0
  const side = line.side || 'solde'
  switch (side) {
    case 'debit':
      return getCharges(balance, line.prefixes)
    case 'credit':
      return getProduits(balance, line.prefixes)
    case 'credit_abs':
      return getProduits(balance, line.prefixes)
    case 'solde':
    default:
      return getBalanceSolde(balance, line.prefixes)
  }
}

export function buildNoteRows(
  balance: BalanceEntry[],
  lines: NoteLineDef[],
  amountKey: string = 'montant_n',
  balanceN1?: BalanceEntry[],
): Row[] {
  const values: number[] = []
  const valuesN1: number[] = []

  return lines.map((line, i) => {
    let montant: number | null = null
    let montantN1: number | null = null

    if (line.isSub) {
      values.push(0)
      valuesN1.push(0)
    } else if (line.isTotal && line.totalOf) {
      montant = line.totalOf.reduce((sum, idx) => sum + (values[idx] || 0), 0)
      values.push(montant)
      if (balanceN1 && balanceN1.length > 0) {
        montantN1 = line.totalOf.reduce((sum, idx) => sum + (valuesN1[idx] || 0), 0)
      }
      valuesN1.push(montantN1 || 0)
    } else if (line.prefixes.length > 0) {
      montant = computeLineAmount(balance, line)
      values.push(montant)
      if (balanceN1 && balanceN1.length > 0) {
        montantN1 = computeLineAmount(balanceN1, line)
      }
      valuesN1.push(montantN1 || 0)
    } else {
      values.push(0)
      valuesN1.push(0)
    }

    return {
      id: `${i}`,
      cells: {
        designation: line.label,
        nature: line.label,
        elements: line.label,
        [amountKey]: line.isSub ? '' : montant,
        montant_n1: line.isSub ? '' : montantN1,
      },
      isTotal: line.isTotal,
      isSectionHeader: line.isSub,
      bold: line.isSub || line.isTotal,
    }
  })
}

// ── Generer des lignes detaillees par compte ──

export function buildDetailRows(
  balance: BalanceEntry[],
  prefixes: string[],
  amountKey: string = 'montant_n',
  balanceN1?: BalanceEntry[],
): Row[] {
  const matching: { compte: string; libelle: string; montant: number; montantN1: number | null }[] = []
  let total = 0
  let totalN1 = 0

  for (const entry of balance) {
    const c = entry.compte.replace(/\s/g, '')
    for (const p of prefixes) {
      if (c === p || c.startsWith(p)) {
        const montant = entry.solde_debit - entry.solde_credit
        if (montant !== 0) {
          // Find N-1 value for same account
          let montantN1: number | null = null
          if (balanceN1 && balanceN1.length > 0) {
            const entryN1 = balanceN1.find(en1 => en1.compte.replace(/\s/g, '') === c)
            if (entryN1) {
              montantN1 = entryN1.solde_debit - entryN1.solde_credit
              totalN1 += montantN1
            }
          }
          matching.push({ compte: c, libelle: entry.libelle || c, montant, montantN1 })
          total += montant
        }
        break
      }
    }
  }

  // Sort by account number
  matching.sort((a, b) => a.compte.localeCompare(b.compte))

  const rows: Row[] = matching.map((m, i) => ({
    id: `${i}`,
    cells: {
      designation: `${m.compte} - ${m.libelle}`,
      nature: `${m.compte} - ${m.libelle}`,
      elements: `${m.compte} - ${m.libelle}`,
      [amountKey]: m.montant,
      montant_n1: m.montantN1,
    },
  }))

  // Pad with empty rows if fewer than 3
  while (rows.length < 3) {
    rows.push({
      id: `empty-${rows.length}`,
      cells: { designation: '', nature: '', elements: '', [amountKey]: null, montant_n1: null },
    })
  }

  // Add total row
  rows.push({
    id: 'total',
    cells: {
      designation: 'TOTAL',
      nature: 'TOTAL',
      elements: 'TOTAL',
      [amountKey]: total,
      montant_n1: (balanceN1 && balanceN1.length > 0) ? totalN1 : null,
    },
    isTotal: true,
    bold: true,
  })

  return rows
}

// ── Actif detail: brut / depreciation / net ──

export function buildActifDetailRows(
  balance: BalanceEntry[],
  lines: readonly { readonly label: string; readonly comptes: readonly string[]; readonly amort: readonly string[] }[],
  balanceN1?: BalanceEntry[],
): Row[] {
  let grandBrut = 0, grandAmort = 0
  let grandNetN1 = 0

  const rows: Row[] = lines.map((line, i) => {
    const brut = getCharges(balance, line.comptes)
    const amort = line.amort.length > 0 ? getProduits(balance, line.amort) : 0
    grandBrut += brut
    grandAmort += amort

    let netN1: number | null = null
    if (balanceN1 && balanceN1.length > 0) {
      const brutN1 = getCharges(balanceN1, line.comptes)
      const amortN1 = line.amort.length > 0 ? getProduits(balanceN1, line.amort) : 0
      netN1 = brutN1 - amortN1
      grandNetN1 += netN1
    }

    return {
      id: `${i}`,
      cells: {
        designation: line.label,
        nature: line.label,
        montant_brut: brut || null,
        depreciation: amort || null,
        montant_net: (brut - amort) || null,
        montant_net_n1: netN1,
      },
    }
  })

  rows.push({
    id: 'total',
    cells: {
      designation: 'TOTAL',
      nature: 'TOTAL',
      montant_brut: grandBrut || null,
      depreciation: grandAmort || null,
      montant_net: (grandBrut - grandAmort) || null,
      montant_net_n1: (balanceN1 && balanceN1.length > 0) ? grandNetN1 : null,
    },
    isTotal: true,
    bold: true,
  })

  return rows
}

// ──────────────────────────────────────────────
// Mappings specifiques par note
// ──────────────────────────────────────────────

export const NOTE_MAPPINGS = {
  // Note 4 : Actif circulant HAO
  note04: [
    { label: 'Creances sur cessions d\'immobilisations', comptes: ['485'], amort: ['498'] },
    { label: 'Autres actifs HAO', comptes: ['486', '487', '488'], amort: [] },
  ],

  // Note 5 : Stocks
  note05: [
    { label: 'Marchandises', comptes: ['31'], amort: ['391'] },
    { label: 'Matieres premieres', comptes: ['32'], amort: ['392'] },
    { label: 'En-cours', comptes: ['33'], amort: ['393'] },
    { label: 'Produits fabriques', comptes: ['34', '35'], amort: ['394', '395'] },
    { label: 'Produits residuels', comptes: ['36', '37', '38'], amort: ['396', '397', '398'] },
  ],

  // Note 6 : Clients
  note06: [
    { label: 'Clients', comptes: ['411'], amort: ['491'] },
    { label: 'Clients - Effets a recevoir', comptes: ['412'], amort: [] },
    { label: 'Clients douteux ou litigieux', comptes: ['416'], amort: [] },
    { label: 'Clients - Factures a etablir', comptes: ['418'], amort: [] },
    { label: 'Autres clients', comptes: ['413', '414', '415'], amort: [] },
  ],

  // Note 7 : Autres creances
  note07: [
    { label: 'Personnel', comptes: ['42'], amort: [] },
    { label: 'Organismes sociaux', comptes: ['43'], amort: ['493'] },
    { label: 'Etat et collectivites', comptes: ['44'], amort: ['494'] },
    { label: 'Associes et groupe', comptes: ['45', '46'], amort: ['495', '496'] },
    { label: 'Debiteurs divers', comptes: ['47'], amort: ['497'] },
  ],
} as const

// Note 8 : Tresorerie
export const NOTE08_LINES: NoteLineDef[] = [
  { label: 'TRESORERIE ACTIF', prefixes: [], isSub: true },
  { label: 'Titres de placement', prefixes: ['50'] },
  { label: 'Valeurs a encaisser', prefixes: ['51'] },
  { label: 'Banques', prefixes: ['52'], side: 'debit' },
  { label: 'Cheques postaux', prefixes: ['53'] },
  { label: 'Caisse', prefixes: ['57'] },
  { label: 'Regies d\'avances et accreditifs', prefixes: ['54', '58'] },
  { label: 'SOUS-TOTAL TRESORERIE ACTIF', prefixes: [], isTotal: true, totalOf: [1, 2, 3, 4, 5, 6] },
  { label: 'TRESORERIE PASSIF', prefixes: [], isSub: true },
  { label: 'Credits de tresorerie et d\'escompte', prefixes: ['561', '564', '565'], side: 'credit' },
  { label: 'Banques (soldes crediteurs)', prefixes: ['52'], side: 'credit' },
  { label: 'SOUS-TOTAL TRESORERIE PASSIF', prefixes: [], isTotal: true, totalOf: [9, 10] },
]

// Notes 11 : Primes et reserves
export const NOTE11_LINES: NoteLineDef[] = [
  { label: 'Primes d\'emission', prefixes: ['1041'], side: 'credit_abs' },
  { label: 'Primes d\'apport', prefixes: ['1042'], side: 'credit_abs' },
  { label: 'Primes de fusion', prefixes: ['1043'], side: 'credit_abs' },
  { label: 'Primes de conversion', prefixes: ['1044'], side: 'credit_abs' },
  { label: 'Reserves legales', prefixes: ['111'], side: 'credit_abs' },
  { label: 'Reserves statutaires', prefixes: ['112'], side: 'credit_abs' },
  { label: 'Reserves libres', prefixes: ['113'], side: 'credit_abs' },
  { label: 'Autres reserves', prefixes: ['118'], side: 'credit_abs' },
  { label: 'TOTAL', prefixes: [], isTotal: true, totalOf: [0, 1, 2, 3, 4, 5, 6, 7] },
]

// Note 15B : Fournisseurs
export const NOTE15B_LINES: NoteLineDef[] = [
  { label: 'Fournisseurs', prefixes: ['401'], side: 'credit_abs' },
  { label: 'Fournisseurs - Effets a payer', prefixes: ['402'], side: 'credit_abs' },
  { label: 'Fournisseurs - Factures non parvenues', prefixes: ['408'], side: 'credit_abs' },
  { label: 'Fournisseurs d\'immobilisations', prefixes: ['404', '405'], side: 'credit_abs' },
  { label: 'Fournisseurs - Retenues de garantie', prefixes: ['403'], side: 'credit_abs' },
  { label: 'TOTAL', prefixes: [], isTotal: true, totalOf: [0, 1, 2, 3, 4] },
]

// Note 16A : Dettes fiscales et sociales
export const NOTE16A_LINES: NoteLineDef[] = [
  { label: 'Personnel - Remunerations dues', prefixes: ['42'], side: 'credit_abs' },
  { label: 'Organismes sociaux', prefixes: ['43'], side: 'credit_abs' },
  { label: 'Etat - Impots et taxes', prefixes: ['44'], side: 'credit_abs' },
  { label: 'TOTAL', prefixes: [], isTotal: true, totalOf: [0, 1, 2] },
]

// Notes produits/charges
export const NOTE17_LINES: NoteLineDef[] = [
  { label: 'Ventes de marchandises', prefixes: ['701'], side: 'credit_abs' },
  { label: 'Ventes de produits finis', prefixes: ['702', '703'], side: 'credit_abs' },
  { label: 'Travaux factures', prefixes: ['704', '705'], side: 'credit_abs' },
  { label: 'Services vendus', prefixes: ['706'], side: 'credit_abs' },
  { label: 'Produits accessoires', prefixes: ['707'], side: 'credit_abs' },
  { label: 'Subventions d\'exploitation', prefixes: ['71'], side: 'credit_abs' },
  { label: 'Production immobilisee', prefixes: ['72'], side: 'credit_abs' },
  { label: 'Autres produits', prefixes: ['75'], side: 'credit_abs' },
  { label: 'TOTAL', prefixes: [], isTotal: true, totalOf: [0, 1, 2, 3, 4, 5, 6, 7] },
]

export const NOTE18_LINES: NoteLineDef[] = [
  { label: 'Autres achats', prefixes: ['604', '605', '608'], side: 'debit' },
  { label: 'Variation stocks autres approvisionnements', prefixes: ['6033'] },
  { label: 'TOTAL', prefixes: [], isTotal: true, totalOf: [0, 1] },
]

export const NOTE19_LINES: NoteLineDef[] = [
  { label: 'Transports de personnel', prefixes: ['611'], side: 'debit' },
  { label: 'Transports sur achats', prefixes: ['612'], side: 'debit' },
  { label: 'Transports sur ventes', prefixes: ['613'], side: 'debit' },
  { label: 'Autres frais de transport', prefixes: ['614', '618'], side: 'debit' },
  { label: 'TOTAL', prefixes: [], isTotal: true, totalOf: [0, 1, 2, 3] },
]

export const NOTE20_LINES: NoteLineDef[] = [
  { label: 'Sous-traitance generale', prefixes: ['621'], side: 'debit' },
  { label: 'Locations et charges locatives', prefixes: ['622'], side: 'debit' },
  { label: 'Entretien, reparations', prefixes: ['624'], side: 'debit' },
  { label: 'Primes d\'assurances', prefixes: ['625'], side: 'debit' },
  { label: 'Etudes, recherches', prefixes: ['626'], side: 'debit' },
  { label: 'Publicite, publications', prefixes: ['627'], side: 'debit' },
  { label: 'Autres services exterieurs', prefixes: ['628', '63'], side: 'debit' },
  { label: 'TOTAL', prefixes: [], isTotal: true, totalOf: [0, 1, 2, 3, 4, 5, 6] },
]

export const NOTE21_LINES: NoteLineDef[] = [
  { label: 'Impots et contributions directes', prefixes: ['641'], side: 'debit' },
  { label: 'Taxes indirectes', prefixes: ['642', '645'], side: 'debit' },
  { label: 'Droits d\'enregistrement', prefixes: ['646'], side: 'debit' },
  { label: 'Autres impots et taxes', prefixes: ['648'], side: 'debit' },
  { label: 'TOTAL', prefixes: [], isTotal: true, totalOf: [0, 1, 2, 3] },
]

export const NOTE22_LINES: NoteLineDef[] = [
  { label: 'Pertes sur creances clients', prefixes: ['651'], side: 'debit' },
  { label: 'Quote-part resultat sur operations faites en commun', prefixes: ['652'], side: 'debit' },
  { label: 'Charges pour depreciations', prefixes: ['659'], side: 'debit' },
  { label: 'Autres charges', prefixes: ['653', '654', '655', '658'], side: 'debit' },
  { label: 'TOTAL', prefixes: [], isTotal: true, totalOf: [0, 1, 2, 3] },
]

export const NOTE23_LINES: NoteLineDef[] = [
  { label: 'Salaires et appointements', prefixes: ['661'], side: 'debit' },
  { label: 'Primes et gratifications', prefixes: ['662'], side: 'debit' },
  { label: 'Conges payes', prefixes: ['663'], side: 'debit' },
  { label: 'Indemnites de preavis, licenciement', prefixes: ['664'], side: 'debit' },
  { label: 'Charges sociales', prefixes: ['666', '667', '668'], side: 'debit' },
  { label: 'TOTAL', prefixes: [], isTotal: true, totalOf: [0, 1, 2, 3, 4] },
]

export const NOTE24_LINES: NoteLineDef[] = [
  { label: 'Valeurs comptables des cessions HAO', prefixes: ['81'], side: 'debit' },
  { label: 'Charges HAO', prefixes: ['83', '85'], side: 'debit' },
  { label: 'Dotations HAO aux amortissements', prefixes: ['851', '852'], side: 'debit' },
  { label: 'Dotations HAO aux provisions', prefixes: ['853', '854'], side: 'debit' },
  { label: 'TOTAL', prefixes: [], isTotal: true, totalOf: [0, 1, 2, 3] },
]

export const NOTE25_LINES: NoteLineDef[] = [
  { label: 'Produits des cessions d\'immobilisations', prefixes: ['82'], side: 'credit_abs' },
  { label: 'Produits HAO', prefixes: ['84', '86', '88'], side: 'credit_abs' },
  { label: 'Reprises HAO', prefixes: ['861', '862', '863', '864'], side: 'credit_abs' },
  { label: 'TOTAL', prefixes: [], isTotal: true, totalOf: [0, 1, 2] },
]

export const NOTE26_LINES: NoteLineDef[] = [
  { label: 'Impot sur les benefices', prefixes: ['891'], side: 'debit' },
  { label: 'Autres impots sur le resultat', prefixes: ['892', '893', '894', '895'], side: 'debit' },
  { label: 'TOTAL', prefixes: [], isTotal: true, totalOf: [0, 1] },
]

// ── COMP-TVA : Etat recapitulatif de la TVA ──

export const COMP_TVA_LINES: NoteLineDef[] = [
  { label: 'TVA FACTUREE', prefixes: [], isSub: true },
  { label: 'TVA sur ventes de marchandises', prefixes: ['4431'], side: 'credit_abs' },
  { label: 'TVA sur prestations de services', prefixes: ['4432'], side: 'credit_abs' },
  { label: 'TVA sur travaux', prefixes: ['4433'], side: 'credit_abs' },
  { label: 'TVA sur production livree a soi-meme', prefixes: ['4434'], side: 'credit_abs' },
  { label: 'TVA sur factures a etablir', prefixes: ['4435'], side: 'credit_abs' },
  { label: 'Sous-total TVA facturee', prefixes: [], isTotal: true, totalOf: [1, 2, 3, 4, 5] },
  { label: 'TVA exigible', prefixes: ['4431', '4432', '4433', '4434', '4435'], side: 'credit_abs' },
  { label: 'TVA RECUPERABLE', prefixes: [], isSub: true },
  { label: 'TVA sur immobilisations', prefixes: ['4451'], side: 'debit' },
  { label: 'TVA sur achats', prefixes: ['4452'], side: 'debit' },
  { label: 'TVA sur transport', prefixes: ['4453'], side: 'debit' },
  { label: 'TVA sur services exterieurs', prefixes: ['4454'], side: 'debit' },
  { label: 'TVA sur factures non parvenues', prefixes: ['4455'], side: 'debit' },
  { label: 'TVA transferee par d\'autres entreprises', prefixes: ['4456'], side: 'debit' },
  { label: 'Sous-total TVA recuperable', prefixes: [], isTotal: true, totalOf: [9, 10, 11, 12, 13, 14] },
  { label: 'TVA effectivement recuperee', prefixes: ['4451', '4452', '4453', '4454', '4455', '4456'], side: 'debit' },
  { label: 'Prorata de deduction (%)', prefixes: [] },
  { label: 'TVA due (facturee - recuperable)', prefixes: [] },
  { label: 'Credit de TVA a reporter', prefixes: ['4449'], side: 'debit' },
  { label: 'TOTAL TVA DUE OU CREDIT', prefixes: [], isTotal: true, totalOf: [18, 19] },
]

// ── COMP-TVA 2 : TVA non deductible ──

export const COMP_TVA2_LINES: NoteLineDef[] = [
  { label: 'TVA supportee non deductible sur immobilisations', prefixes: ['6351'], side: 'debit' },
  { label: 'TVA supportee non deductible sur achats de biens et services', prefixes: ['6352', '6353'], side: 'debit' },
  { label: 'TOTAL TVA NON DEDUCTIBLE', prefixes: [], isTotal: true, totalOf: [0, 1] },
]

// ── COMP-CHARGES : Detail des charges ──

export interface CompChargeLine {
  compte: string
  label: string
  isSubtotal?: boolean
  isFinalTotal?: boolean
}

export const COMP_CHARGES_LINES: CompChargeLine[] = [
  // RA — Achats de marchandises
  { compte: '', label: 'ACHATS DE MARCHANDISES', isSubtotal: true },
  { compte: '6011', label: 'Achats de marchandises dans la region' },
  { compte: '6012', label: 'Achats de marchandises hors region' },
  { compte: '6013', label: 'Achats de marchandises a l\'etranger' },
  { compte: '6014', label: 'Achats stockes de marchandises' },
  { compte: '6015', label: 'Achats de marchandises en cours de route' },
  { compte: '6019', label: 'Rabais, remises et ristournes obtenus' },
  { compte: 'RA', label: 'TOTAL ACHATS DE MARCHANDISES (RA)', isSubtotal: true },
  // RB — Variation de stocks de marchandises
  { compte: '', label: 'VARIATION DE STOCKS', isSubtotal: true },
  { compte: '6031', label: 'Variation de stocks de marchandises' },
  { compte: 'RB', label: 'TOTAL VARIATION DE STOCKS (RB)', isSubtotal: true },
  // RC — Achats de matieres premieres
  { compte: '', label: 'ACHATS DE MATIERES PREMIERES ET FOURNITURES LIEES', isSubtotal: true },
  { compte: '6021', label: 'Achats de matieres premieres locales' },
  { compte: '6022', label: 'Achats de matieres premieres importees' },
  { compte: '6023', label: 'Achats de fournitures liees' },
  { compte: '6024', label: 'Achats stockes de matieres premieres' },
  { compte: '6025', label: 'Achats de matieres premieres en cours de route' },
  { compte: '6029', label: 'Rabais, remises et ristournes obtenus' },
  { compte: 'RC', label: 'TOTAL ACHATS DE MATIERES PREMIERES (RC)', isSubtotal: true },
  // RD — Variation stocks matieres
  { compte: '', label: 'VARIATION DE STOCKS DE MATIERES PREMIERES', isSubtotal: true },
  { compte: '6032', label: 'Variation de stocks de matieres premieres' },
  { compte: 'RD', label: 'TOTAL VARIATION DE STOCKS MATIERES (RD)', isSubtotal: true },
  // RE — Autres achats
  { compte: '', label: 'AUTRES ACHATS', isSubtotal: true },
  { compte: '6041', label: 'Matieres consommables' },
  { compte: '6042', label: 'Matieres combustibles' },
  { compte: '6043', label: 'Produits d\'entretien' },
  { compte: '6044', label: 'Fournitures d\'atelier et d\'usine' },
  { compte: '6046', label: 'Fournitures de magasin' },
  { compte: '6047', label: 'Fournitures de bureau' },
  { compte: '6048', label: 'Autres achats de matieres et fournitures' },
  { compte: '6051', label: 'Fournitures non stockables - eau' },
  { compte: '6052', label: 'Fournitures non stockables - electricite' },
  { compte: '6053', label: 'Fournitures non stockables - autres energies' },
  { compte: '6054', label: 'Fournitures d\'entretien non stockables' },
  { compte: '6055', label: 'Fournitures de bureau non stockables' },
  { compte: '6056', label: 'Achats de petit materiel et outillage' },
  { compte: '6057', label: 'Achats d\'etudes et de prestations de services' },
  { compte: '6058', label: 'Achats de travaux, materiels et equipements' },
  { compte: '6081', label: 'Achats d\'emballages' },
  { compte: '6082', label: 'Achats de matieres et fournitures a stocker' },
  { compte: '6083', label: 'Achats d\'emballages recupérables' },
  { compte: 'RE', label: 'TOTAL AUTRES ACHATS (RE)', isSubtotal: true },
  // RF — Variation stocks autres
  { compte: '', label: 'VARIATION DE STOCKS AUTRES APPROVISIONNEMENTS', isSubtotal: true },
  { compte: '6033', label: 'Variation de stocks d\'autres approvisionnements' },
  { compte: 'RF', label: 'TOTAL VARIATION STOCKS AUTRES (RF)', isSubtotal: true },
  // RG — Transports
  { compte: '', label: 'TRANSPORTS', isSubtotal: true },
  { compte: '6111', label: 'Transports sur achats' },
  { compte: '6112', label: 'Transports sur ventes' },
  { compte: '6113', label: 'Transports pour le compte de tiers' },
  { compte: '6114', label: 'Transports du personnel' },
  { compte: '6181', label: 'Voyages et deplacements' },
  { compte: '6182', label: 'Transports entre etablissements' },
  { compte: '6183', label: 'Transports administratifs' },
  { compte: 'RG', label: 'TOTAL TRANSPORTS (RG)', isSubtotal: true },
  // RH — Services exterieurs
  { compte: '', label: 'SERVICES EXTERIEURS', isSubtotal: true },
  { compte: '6211', label: 'Sous-traitance generale' },
  { compte: '6221', label: 'Locations de terrains' },
  { compte: '6222', label: 'Locations de batiments' },
  { compte: '6223', label: 'Locations de materiels et outillages' },
  { compte: '6224', label: 'Malis sur emballages restitues' },
  { compte: '6225', label: 'Locations d\'emballages' },
  { compte: '6232', label: 'Charges locatives et de copropriete' },
  { compte: '6241', label: 'Entretien et reparations des biens immobiliers' },
  { compte: '6242', label: 'Entretien et reparations des biens mobiliers' },
  { compte: '6243', label: 'Maintenance' },
  { compte: '6251', label: 'Assurances multirisques' },
  { compte: '6252', label: 'Assurances materiels de transport' },
  { compte: '6253', label: 'Assurances risques d\'exploitation' },
  { compte: '6254', label: 'Assurances du personnel' },
  { compte: '6261', label: 'Etudes et recherches' },
  { compte: '6262', label: 'Redevances pour brevets, licences' },
  { compte: '6271', label: 'Annonces, insertions' },
  { compte: '6272', label: 'Catalogues, imprimes publicitaires' },
  { compte: '6273', label: 'Echantillons, foires et expositions' },
  { compte: '6274', label: 'Publications' },
  { compte: '6275', label: 'Cadeaux a la clientele' },
  { compte: '6276', label: 'Missions, receptions' },
  { compte: '6281', label: 'Frais de telephone et de telecommunication' },
  { compte: '6282', label: 'Cotisations' },
  { compte: '6283', label: 'Frais de colloques, seminaires' },
  { compte: '6311', label: 'Frais sur titres' },
  { compte: '6325', label: 'Honoraires' },
  { compte: '6326', label: 'Frais d\'actes et de contentieux' },
  { compte: '6328', label: 'Autres frais et commissions' },
  { compte: '6381', label: 'Charges diverses de gestion courante' },
  { compte: '6382', label: 'Frais de recrutement de personnel' },
  { compte: 'RH', label: 'TOTAL SERVICES EXTERIEURS (RH)', isSubtotal: true },
  // RI — Impots et taxes
  { compte: '', label: 'IMPOTS ET TAXES', isSubtotal: true },
  { compte: '6411', label: 'Impots fonciers' },
  { compte: '6412', label: 'Patentes, licences et taxes annexes' },
  { compte: '6413', label: 'Taxes sur appointements et salaires' },
  { compte: '6414', label: 'Taxes d\'apprentissage' },
  { compte: '6415', label: 'Formation professionnelle continue' },
  { compte: '6418', label: 'Autres impots et contributions directes' },
  { compte: '6451', label: 'Taxes sur le chiffre d\'affaires non recuperables' },
  { compte: '6452', label: 'Droits de douane' },
  { compte: '6453', label: 'Taxes a l\'exportation' },
  { compte: '6454', label: 'Autres taxes indirectes' },
  { compte: '6461', label: 'Droits d\'enregistrement' },
  { compte: '6462', label: 'Droits de timbre' },
  { compte: '6463', label: 'Taxes sur les vehicules' },
  { compte: '6464', label: 'Vignettes' },
  { compte: '6468', label: 'Autres droits' },
  { compte: 'RI', label: 'TOTAL IMPOTS ET TAXES (RI)', isSubtotal: true },
  // RJ — Autres charges
  { compte: '', label: 'AUTRES CHARGES', isSubtotal: true },
  { compte: '6511', label: 'Pertes sur creances clients' },
  { compte: '6521', label: 'Quote-part de perte sur operations en commun' },
  { compte: '6531', label: 'Indemnites de fonction' },
  { compte: '6532', label: 'Jetons de presence et commissions CA' },
  { compte: '6541', label: 'Creances devenues irrecouvrables' },
  { compte: '6581', label: 'Charges diverses de gestion courante' },
  { compte: '6591', label: 'Charges provisionnees d\'exploitation' },
  { compte: '6598', label: 'Autres charges provisionnees' },
  { compte: 'RJ', label: 'TOTAL AUTRES CHARGES (RJ)', isSubtotal: true },
  // RK — Charges de personnel
  { compte: '', label: 'CHARGES DE PERSONNEL', isSubtotal: true },
  { compte: '6611', label: 'Appointements et salaires' },
  { compte: '6612', label: 'Primes et gratifications' },
  { compte: '6613', label: 'Conges payes' },
  { compte: '6614', label: 'Indemnites de preavis et licenciement' },
  { compte: '6615', label: 'Indemnites de maladie' },
  { compte: '6616', label: 'Supplement familial' },
  { compte: '6617', label: 'Avantages en nature' },
  { compte: '6618', label: 'Autres remunerations directes' },
  { compte: '6621', label: 'Remunerations de l\'exploitant' },
  { compte: '6631', label: 'Indemnites de logement' },
  { compte: '6632', label: 'Indemnites de representation' },
  { compte: '6633', label: 'Indemnites d\'expatriation' },
  { compte: '6641', label: 'Charges sociales sur remunerations du personnel national' },
  { compte: '6642', label: 'Charges sociales sur remunerations du personnel non national' },
  { compte: '6661', label: 'Remunerations versees au personnel interimaire' },
  { compte: '6662', label: 'Remunerations versees au personnel detache' },
  { compte: '6681', label: 'Autres charges sociales' },
  { compte: 'RK', label: 'TOTAL CHARGES DE PERSONNEL (RK)', isSubtotal: true },
  // RL — Dotations amortissements et provisions
  { compte: '', label: 'DOTATIONS AUX AMORTISSEMENTS ET AUX PROVISIONS', isSubtotal: true },
  { compte: '6811', label: 'Dotations aux amortissements d\'exploitation' },
  { compte: '6812', label: 'Dotations aux amortissements des charges immobilisees' },
  { compte: '6813', label: 'Dotations aux provisions d\'exploitation' },
  { compte: '6814', label: 'Dotations aux provisions pour depreciation' },
  { compte: '6871', label: 'Dotations aux amortissements HAO' },
  { compte: '6872', label: 'Dotations aux provisions HAO' },
  { compte: 'RL', label: 'TOTAL DOTATIONS AMORT. ET PROVISIONS (RL)', isSubtotal: true },
  // RM — Frais financiers
  { compte: '', label: 'FRAIS FINANCIERS ET CHARGES ASSIMILEES', isSubtotal: true },
  { compte: '6711', label: 'Interets des emprunts' },
  { compte: '6712', label: 'Interets dans loyers de credit-bail' },
  { compte: '6713', label: 'Interets des dettes commerciales' },
  { compte: '6714', label: 'Interets des dettes diverses' },
  { compte: '6741', label: 'Pertes de change' },
  { compte: '6751', label: 'Escomptes accordes' },
  { compte: '6781', label: 'Autres frais financiers' },
  { compte: 'RM', label: 'TOTAL FRAIS FINANCIERS (RM)', isSubtotal: true },
  // RN — Dotations provisions financieres
  { compte: '', label: 'DOTATIONS AUX PROVISIONS FINANCIERES', isSubtotal: true },
  { compte: '6911', label: 'Dotations aux provisions pour depreciation des titres' },
  { compte: '6971', label: 'Dotations aux provisions financieres' },
  { compte: 'RN', label: 'TOTAL DOTATIONS PROVISIONS FINANCIERES (RN)', isSubtotal: true },
  // FINAL TOTAL
  { compte: 'TOTAL', label: 'TOTAL DES CHARGES ORDINAIRES', isFinalTotal: true },
]

// Subtotal reference codes for COMP_CHARGES
const SUBTOTAL_CODES = ['RA', 'RB', 'RC', 'RD', 'RE', 'RF', 'RG', 'RH', 'RI', 'RJ', 'RK', 'RL', 'RM', 'RN']

// Map subtotal code to the range of detail line indices it sums
function getSubtotalRange(lines: CompChargeLine[], subtotalIdx: number): number[] {
  // Walk backwards from subtotalIdx to find the previous section header or subtotal
  const indices: number[] = []
  for (let i = subtotalIdx - 1; i >= 0; i--) {
    if (lines[i].isSubtotal || lines[i].isFinalTotal) break
    if (lines[i].compte && !SUBTOTAL_CODES.includes(lines[i].compte)) {
      indices.push(i)
    }
  }
  return indices
}

export function buildCompChargesRows(
  balance: BalanceEntry[],
  balanceN1?: BalanceEntry[],
): Row[] {
  const lines = COMP_CHARGES_LINES
  const values: number[] = new Array(lines.length).fill(0)
  const valuesN1: number[] = new Array(lines.length).fill(0)

  // First pass: compute individual account amounts
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.isSubtotal || line.isFinalTotal || !line.compte || SUBTOTAL_CODES.includes(line.compte)) continue
    values[i] = getCharges(balance, [line.compte])
    if (balanceN1 && balanceN1.length > 0) {
      valuesN1[i] = getCharges(balanceN1, [line.compte])
    }
  }

  // Second pass: compute subtotals
  const subtotalValues: Record<string, number> = {}
  const subtotalValuesN1: Record<string, number> = {}
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (SUBTOTAL_CODES.includes(line.compte)) {
      const detailIndices = getSubtotalRange(lines, i)
      values[i] = detailIndices.reduce((s, idx) => s + values[idx], 0)
      valuesN1[i] = detailIndices.reduce((s, idx) => s + valuesN1[idx], 0)
      subtotalValues[line.compte] = values[i]
      subtotalValuesN1[line.compte] = valuesN1[i]
    }
  }

  // Final total
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].isFinalTotal) {
      values[i] = SUBTOTAL_CODES.reduce((s, code) => s + (subtotalValues[code] || 0), 0)
      valuesN1[i] = SUBTOTAL_CODES.reduce((s, code) => s + (subtotalValuesN1[code] || 0), 0)
    }
  }

  return lines.map((line, i) => {
    const isHeader = line.isSubtotal && !SUBTOTAL_CODES.includes(line.compte) && line.compte === ''
    const isSubRow = SUBTOTAL_CODES.includes(line.compte)
    const montantN = values[i]
    const montantN1 = valuesN1[i]
    const variationVal = montantN - montantN1
    const variationPct = montantN1 !== 0 ? ((montantN - montantN1) / Math.abs(montantN1)) * 100 : 0

    return {
      id: `${i}`,
      cells: {
        compte: isHeader ? '' : (isSubRow || line.isFinalTotal) ? '' : line.compte,
        designation: line.label,
        montant_n: isHeader ? '' : montantN || null,
        montant_n1: isHeader ? '' : montantN1 || null,
        variation_val: isHeader ? '' : variationVal || null,
        variation_pct: isHeader ? '' : variationPct ? Math.round(variationPct) : null,
      },
      isSectionHeader: isHeader,
      isSubtotal: isSubRow,
      isTotal: line.isFinalTotal,
      bold: isSubRow || line.isFinalTotal,
    }
  })
}
