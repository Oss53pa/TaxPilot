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
