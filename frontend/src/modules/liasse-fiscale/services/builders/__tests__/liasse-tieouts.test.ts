import { describe, it, expect } from 'vitest'
import { buildBilan } from '../build-09-bilan'
import { buildResultat } from '../build-11-passif-resultat'
import { buildNote7 } from '../build-26-notes-7to8c'
import { buildNote16A, buildNote17, buildNote18, buildNote19 } from '../build-39-notes-16to19'
import { buildNote21, buildNote22, buildNote23, buildNote24 } from '../build-46-notes-20to24'
import { buildNote25, buildNote26, buildNote27A } from '../build-51-notes-25to28'
import { getPassif, getChargesNettes } from '../../liasse-calculs'
import { buildNote9, buildNote10, buildNote11 } from '../build-31-notes-9to12'
import { buildNote3A, buildNote3C, buildNote6 } from '../build-15-notes-1to6'
import { getBalanceSolde, getProduits, getCharges } from '../../liasse-calculs'
import { buildCompChargesRows, buildNoteRows, NOTE08_LINES, NOTE17_LINES } from '../../noteBalanceMapping'
import type { BalanceEntry, EntrepriseData } from '../../../types'
import type { ExerciceData } from '../../liasse-export-excel'
import type { Row } from '../helpers'

/**
 * TIE-OUTS du moteur de génération de la liasse fiscale SYSCOHADA.
 *
 * Premier harnais de test du moteur des 84 feuillets (builders/build-*.ts),
 * jusqu'ici NON couvert. On pilote les vrais builders avec une balance
 * SYSCOHADA réaliste et on assert les IDENTITÉS COMPTABLES DURES :
 *
 *   1. Équilibre du bilan : Total Actif (BZ) = Total Passif (DZ).
 *   2. Cohérence du résultat : Résultat net CdR (XI) = −Σ soldes(classes 6,7,8)
 *      (identité robuste indépendante du découpage des postes — détecte tout
 *       trou de mapping ou double comptage).
 *   3. Chiffre d'affaires (XB) = total des ventes (classe 70).
 *   4. Total des charges ordinaires (COMP-CHARGES) = Σ charges classe 6.
 *
 * Ces assertions sont en grande partie MAPPING-AGNOSTIQUES : si un compte
 * standard n'est pas affecté (ou l'est deux fois), elles cassent → bug révélé.
 */

const TOL = 1 // tolérance 1 FCFA

/** Construit une entrée de balance à partir d'un solde net signé (débit > 0). */
function e(compte: string, solde: number): BalanceEntry {
  const sd = solde > 0 ? solde : 0
  const sc = solde < 0 ? -solde : 0
  return { compte, libelle: compte, debit: sd, credit: sc, solde_debit: sd, solde_credit: sc }
}

const ENT = {
  denomination: 'SOCIETE TEST SA',
  sigle: 'STEST',
  adresse: 'Abidjan',
  ncc: 'CI-TEST-001',
  ntd: '',
  exercice_clos: '2024-12-31',
  exercice_precedent_fin: '2023-12-31',
} as unknown as EntrepriseData

const EX = {
  dateDebut: '2024-01-01',
  dateFin: '2024-12-31',
} as unknown as ExerciceData

const EMPTY: BalanceEntry[] = []

/** Cherche une ligne par sa valeur de référence dans une colonne donnée. */
function findByRef(rows: Row[], refCol: number, ref: string): Row | undefined {
  return rows.find((r) => r[refCol] === ref)
}

function num(v: unknown): number {
  return typeof v === 'number' ? v : 0
}

// ════════════════════════════════════════════════════════════════════════════
// FIXTURE A — Balance POST-CLÔTURE équilibrée (résultat affecté au compte 13).
//   Σ débit = Σ crédit ; le bilan doit s'équilibrer (BZ = DZ).
// ════════════════════════════════════════════════════════════════════════════

const BALANCE_A: BalanceEntry[] = [
  // ACTIF immobilisé
  e('2151', 1_000_000),   // Logiciels (incorporel)      → AF brut
  e('28151', -200_000),   // Amort. logiciels            → AF amort (réduit le net)
  e('2441', 5_000_000),   // Matériel et mobilier        → AM brut
  e('28441', -1_000_000), // Amort. matériel             → AM amort
  // ACTIF circulant
  e('3111', 2_000_000),   // Stock marchandises          → BB
  e('4111', 3_000_000),   // Clients                     → BI
  // Trésorerie-actif
  e('5211', 1_500_000),   // Banque                      → BS
  e('5711', 200_000),     // Caisse                      → BS
  // PASSIF
  e('1011', -5_000_000),  // Capital social              → CA
  e('1621', -1_000_000),  // Emprunts ets de crédit      → DA
  e('4011', -2_500_000),  // Fournisseurs                → DJ
  e('131', -3_000_000),   // Résultat net (bénéfice)     → CJ
]
// Actif net attendu = (1 000 000 − 200 000) + (5 000 000 − 1 000 000)
//                   + 2 000 000 + 3 000 000 + 1 500 000 + 200 000 = 11 500 000
// Passif attendu    = 5 000 000 + 1 000 000 + 2 500 000 + 3 000 000 = 11 500 000
const TOTAL_BILAN_ATTENDU = 11_500_000

describe('Liasse — équilibre du Bilan (build-09)', () => {
  const { rows } = buildBilan(BALANCE_A, EMPTY, ENT, EX)
  const bz = findByRef(rows, 0, 'BZ') // Total général ACTIF (ref col 0, net col 7)
  const dz = findByRef(rows, 9, 'DZ') // Total général PASSIF (ref col 9, net col 12)

  it('produit bien les lignes de total BZ et DZ', () => {
    expect(bz).toBeDefined()
    expect(dz).toBeDefined()
  })

  it('BZ (Total Actif) = DZ (Total Passif) — bilan équilibré', () => {
    expect(Math.abs(num(bz?.[7]) - num(dz?.[12]))).toBeLessThanOrEqual(TOL)
  })

  it('BZ = montant attendu (11 500 000) — pas de compte standard perdu', () => {
    expect(Math.abs(num(bz?.[7]) - TOTAL_BILAN_ATTENDU)).toBeLessThanOrEqual(TOL)
  })

  it('CJ (résultat au passif) = 3 000 000 (compte 13)', () => {
    const cj = findByRef(rows, 9, 'CJ')
    expect(Math.abs(num(cj?.[12]) - 3_000_000)).toBeLessThanOrEqual(TOL)
  })
})

// ════════════════════════════════════════════════════════════════════════════
// FIXTURE E — Balance équilibrée avec COMPTES MIXTES (42-47 en débit ET crédit).
//   Garantit que la réconciliation du mapping (42→DK, 45→DM, exclusion 478/479)
//   préserve l'équilibre BZ = DZ, y compris pour les avances/créances mixtes.
// ════════════════════════════════════════════════════════════════════════════

const BALANCE_E: BalanceEntry[] = [
  // Actif (débit)
  e('2441', 10_000_000), // Matériel → AM
  e('4111', 3_000_000),  // Clients → BI
  e('4711', 500_000),    // Créditeurs divers — versant débiteur → BJ (471)
  e('4421', 200_000),    // État, TVA récupérable (44 débit) → BJ
  e('5211', 2_000_000),  // Banque → BS
  // Passif (crédit)
  e('1011', -8_000_000), // Capital → CA
  e('4011', -1_500_000), // Fournisseurs → DJ
  e('4221', -1_200_000), // Personnel, rémunérations dues (42 crédit) → DK
  e('4311', -800_000),   // CNPS (43) → DK
  e('4612', -1_000_000), // Associés, compte courant (46) → DM
  e('131', -3_200_000),  // Résultat → CJ
]

describe('Liasse — équilibre du Bilan avec comptes mixtes (42-47)', () => {
  const { rows } = buildBilan(BALANCE_E, EMPTY, ENT, EX)
  const bz = findByRef(rows, 0, 'BZ')
  const dz = findByRef(rows, 9, 'DZ')

  it('BZ = DZ malgré comptes de tiers mixtes (avances personnel, TVA récup, assoc.)', () => {
    expect(Math.abs(num(bz?.[7]) - num(dz?.[12]))).toBeLessThanOrEqual(TOL)
    expect(Math.abs(num(bz?.[7]) - 15_700_000)).toBeLessThanOrEqual(TOL)
  })
})

// ════════════════════════════════════════════════════════════════════════════
// FIXTURE B — Comptes de gestion (classes 6/7/8) pour le Compte de Résultat.
//   Comptes à 4 chiffres (granularité réelle d'une balance).
// ════════════════════════════════════════════════════════════════════════════

const BALANCE_B: BalanceEntry[] = [
  // Charges (classe 6) — soldes débiteurs
  e('6011', 4_000_000),  // Achats de marchandises          → RA
  e('6041', 500_000),    // Matières consommables (autres achats) → RE
  e('6111', 300_000),    // Transports sur achats           → RG
  e('6221', 800_000),    // Locations                       → RH
  e('6411', 200_000),    // Impôts fonciers                 → RI
  e('6611', 2_000_000),  // Salaires                        → RK
  e('6811', 600_000),    // Dotations amort. exploitation   → RL
  e('6711', 150_000),    // Intérêts des emprunts           → RM
  // Impôt sur le résultat (classe 8)
  e('8911', 400_000),    // Impôt sur les bénéfices         → RS
  // Produits (classe 7) — soldes créditeurs
  e('7011', -9_000_000), // Ventes de marchandises          → TA (CA)
  e('7061', -1_200_000), // Services vendus                 → TC (CA)
  e('7071', -300_000),   // Produits accessoires            → TD (CA)
  e('7111', -200_000),   // Subventions d'exploitation      → TG
  e('7711', -100_000),   // Revenus financiers              → TK
  e('7811', -50_000),    // Transferts de charges           → TI
]
// Résultat net canonique = −Σ soldes(6,7,8)
//   Σ classe 6 = 8 550 000 ; Σ classe 7 = −10 850 000 ; Σ classe 8 = 400 000
//   Σ = −1 900 000 → résultat net = +1 900 000
const RESULTAT_NET_ATTENDU = 1_900_000
const CA_ATTENDU = 10_500_000 // ventes classe 70 : 9 000 000 + 1 200 000 + 300 000

describe('Liasse — cohérence du Compte de Résultat (build-11)', () => {
  const { rows } = buildResultat(BALANCE_B, EMPTY, ENT, EX)
  const xi = findByRef(rows, 0, 'XI') // Résultat net (net col 8)
  const xb = findByRef(rows, 0, 'XB') // Chiffre d'affaires (net col 8)

  const canonique = -getBalanceSolde(BALANCE_B, ['6', '7', '8'])

  it('produit les lignes XI (résultat net) et XB (CA)', () => {
    expect(xi).toBeDefined()
    expect(xb).toBeDefined()
  })

  it('XI (résultat net CdR) = −Σ soldes(6,7,8) — aucune fuite ni double comptage', () => {
    expect(Math.abs(num(xi?.[8]) - canonique)).toBeLessThanOrEqual(TOL)
  })

  it('XI = montant attendu (1 900 000)', () => {
    expect(Math.abs(num(xi?.[8]) - RESULTAT_NET_ATTENDU)).toBeLessThanOrEqual(TOL)
  })

  it('XB (Chiffre d\'affaires) = total des ventes (classe 70)', () => {
    expect(Math.abs(num(xb?.[8]) - getProduits(BALANCE_B, ['70']))).toBeLessThanOrEqual(TOL)
    expect(Math.abs(num(xb?.[8]) - CA_ATTENDU)).toBeLessThanOrEqual(TOL)
  })
})

describe('Liasse — Notes de charges/produits (module) calculent depuis la balance', () => {
  const noteVal = (sheet: { rows: Row[] }, label: string): number =>
    num(sheet.rows.find((r) => r[0] === label)?.[5])

  it('Note 21 — TOTAL CHIFFRES D\'AFFAIRES = ventes classe 70 (= CdR XB)', () => {
    const n21 = buildNote21(BALANCE_B, EMPTY, ENT, EX)
    const ca = noteVal(n21, 'TOTAL : CHIFFRES D\'AFFAIRES')
    expect(Math.abs(ca - getProduits(BALANCE_B, ['70']))).toBeLessThanOrEqual(TOL)
    expect(Math.abs(ca - 10_500_000)).toBeLessThanOrEqual(TOL)
  })

  it('Note 23 — TOTAL Transports = classe 61 (= CdR RG)', () => {
    const n23 = buildNote23(BALANCE_B, EMPTY, ENT, EX)
    const tot = noteVal(n23, 'TOTAL')
    expect(Math.abs(tot - getChargesNettes(BALANCE_B, ['61']))).toBeLessThanOrEqual(TOL)
    expect(Math.abs(tot - 300_000)).toBeLessThanOrEqual(TOL)
  })

  it('Note 24 — TOTAL Services extérieurs = classes 62+63 (= CdR RH)', () => {
    const n24 = buildNote24(BALANCE_B, EMPTY, ENT, EX)
    const tot = noteVal(n24, 'TOTAL')
    expect(Math.abs(tot - getChargesNettes(BALANCE_B, ['62', '63']))).toBeLessThanOrEqual(TOL)
    expect(Math.abs(tot - 800_000)).toBeLessThanOrEqual(TOL)
  })

  it('Note 22 — sous-totaux achats = classes 601 / 602 / 604+605+608 (= CdR RA/RC/RE)', () => {
    const n22 = buildNote22(BALANCE_B, EMPTY, ENT, EX)
    expect(Math.abs(noteVal(n22, 'TOTAL : ACHATS DE MARCHANDISES') - getCharges(BALANCE_B, ['601']))).toBeLessThanOrEqual(TOL)
    expect(Math.abs(noteVal(n22, 'TOTAL : ACHATS DE MARCHANDISES') - 4_000_000)).toBeLessThanOrEqual(TOL)
    expect(Math.abs(noteVal(n22, 'TOTAL : AUTRES ACHATS') - getCharges(BALANCE_B, ['604', '605', '608']))).toBeLessThanOrEqual(TOL)
    expect(Math.abs(noteVal(n22, 'TOTAL : AUTRES ACHATS') - 500_000)).toBeLessThanOrEqual(TOL)
  })

  it('Note 27A — TOTAL Charges de personnel = classe 66 (= CdR RK)', () => {
    const n27 = buildNote27A(BALANCE_B, EMPTY, ENT, EX)
    const tot = noteVal(n27, 'TOTAL')
    expect(Math.abs(tot - getChargesNettes(BALANCE_B, ['66']))).toBeLessThanOrEqual(TOL)
    expect(Math.abs(tot - 2_000_000)).toBeLessThanOrEqual(TOL)
  })

  it('Note 25 — TOTAL Impôts et taxes = classe 64 (= CdR RI)', () => {
    const n25 = buildNote25(BALANCE_B, EMPTY, ENT, EX)
    const tot = noteVal(n25, 'TOTAL')
    expect(Math.abs(tot - getChargesNettes(BALANCE_B, ['64']))).toBeLessThanOrEqual(TOL)
    expect(Math.abs(tot - 200_000)).toBeLessThanOrEqual(TOL)
  })

  it('Note 26 — TOTAL Autres charges = classe 65 (= CdR RJ)', () => {
    const n26 = buildNote26(BALANCE_B, EMPTY, ENT, EX)
    const tot = noteVal(n26, 'TOTAL')
    expect(Math.abs(tot - getChargesNettes(BALANCE_B, ['65']))).toBeLessThanOrEqual(TOL)
  })
})

describe('Liasse — Note 16A (dettes financières) boucle avec le Bilan (DA)', () => {
  it('Note 16A — TOTAL EMPRUNTS = classe 16 (= Bilan DA)', () => {
    const n16a = buildNote16A(BALANCE_A, EMPTY, ENT, EX)
    const tot = num(n16a.rows.find((r) => r[0] === 'TOTAL EMPRUNTS ET DETTES FINANCIERES')?.[4])
    expect(Math.abs(tot - getPassif(BALANCE_A, ['16']))).toBeLessThanOrEqual(TOL)
    expect(Math.abs(tot - 1_000_000)).toBeLessThanOrEqual(TOL)
  })
})

describe('Liasse — COMP-CHARGES (détail des charges)', () => {
  const rows = buildCompChargesRows(BALANCE_B, EMPTY)
  const totalRow = rows.find((r) => r.isTotal)
  const totalCharges6 = getCharges(BALANCE_B, ['6'])

  it('produit une ligne de total des charges ordinaires', () => {
    expect(totalRow).toBeDefined()
  })

  it('Total charges ordinaires = Σ charges classe 6', () => {
    const montant = num((totalRow?.cells as Record<string, unknown> | undefined)?.montant_n)
    expect(Math.abs(montant - totalCharges6)).toBeLessThanOrEqual(TOL)
  })
})

// ════════════════════════════════════════════════════════════════════════════
// Bouclages Note → État (les notes détaillent une ligne du Bilan / du CdR).
// ════════════════════════════════════════════════════════════════════════════

function cellN(row: { cells: Record<string, unknown> } | undefined): number {
  return num(row?.cells?.montant_n)
}

describe('Liasse — Note 17 (produits) boucle avec les produits d\'exploitation', () => {
  const rows = buildNoteRows(BALANCE_B, NOTE17_LINES)
  const total = rows.find((r) => r.isTotal)

  // Produits d'exploitation = ventes (70) + subventions (71) + production immo (72) + autres (75)
  const attendu = getProduits(BALANCE_B, ['70', '71', '72', '75'])

  it('Total Note 17 = Σ produits exploitation (70+71+72+75)', () => {
    expect(Math.abs(cellN(total) - attendu)).toBeLessThanOrEqual(TOL)
    expect(Math.abs(cellN(total) - 10_700_000)).toBeLessThanOrEqual(TOL)
  })
})

describe('Liasse — Notes d\'actif (module) bouclent avec le Bilan', () => {
  const { rows: bilan } = buildBilan(BALANCE_A, EMPTY, ENT, EX)
  const bilanNet = (ref: string) => num(findByRef(bilan, 0, ref)?.[7])

  // Dans les builders module, le « TOTAL NET » est en colonne 4 (libellé en col 0).
  const noteTotalNet = (sheet: { rows: Row[] }): number => {
    const r = sheet.rows.find((row) => row[0] === 'TOTAL NET')
    return num(r?.[4])
  }

  it('Note 6 (Stocks) TOTAL NET = Bilan BB (Stocks et en-cours)', () => {
    const n6 = buildNote6(BALANCE_A, EMPTY, ENT, EX)
    expect(Math.abs(noteTotalNet(n6) - bilanNet('BB'))).toBeLessThanOrEqual(TOL)
    expect(Math.abs(noteTotalNet(n6) - 2_000_000)).toBeLessThanOrEqual(TOL)
  })

  it('Note 7 (Clients) TOTAL NET = Bilan BI (Clients)', () => {
    const n7 = buildNote7(BALANCE_A, EMPTY, ENT, EX)
    expect(Math.abs(noteTotalNet(n7) - bilanNet('BI'))).toBeLessThanOrEqual(TOL)
    expect(Math.abs(noteTotalNet(n7) - 3_000_000)).toBeLessThanOrEqual(TOL)
  })

  it('Note 9 (Titres de placement) TOTAL NET = Bilan BQ', () => {
    const n9 = buildNote9(BALANCE_A, EMPTY, ENT, EX)
    expect(Math.abs(noteTotalNet(n9) - bilanNet('BQ'))).toBeLessThanOrEqual(TOL)
  })

  it('Note 10 (Valeurs à encaisser) TOTAL NET = Bilan BR', () => {
    const n10 = buildNote10(BALANCE_A, EMPTY, ENT, EX)
    expect(Math.abs(noteTotalNet(n10) - bilanNet('BR'))).toBeLessThanOrEqual(TOL)
  })

  it('Note 11 (Disponibilités) TOTAL NET = Bilan BS (banques, caisse)', () => {
    const n11 = buildNote11(BALANCE_A, EMPTY, ENT, EX)
    expect(Math.abs(noteTotalNet(n11) - bilanNet('BS'))).toBeLessThanOrEqual(TOL)
    expect(Math.abs(noteTotalNet(n11) - 1_700_000)).toBeLessThanOrEqual(TOL)
  })
})

// Fixture dédiée aux dettes du passif (classes 42/43/44/46/47, soldes créditeurs).
const BALANCE_D: BalanceEntry[] = [
  e('4221', -800_000), // Personnel, rémunérations dues (42)
  e('4311', -300_000), // CNPS — organismes sociaux (43)
  e('4441', -500_000), // État, TVA due (44)
  e('4621', -400_000), // Associés, compte courant (46)
  e('4711', -200_000), // Créditeurs divers (47)
]

describe('Liasse — Notes 18 & 19 (dettes) calculent depuis la balance', () => {
  const noteTotal = (sheet: { rows: Row[] }, label: string): number =>
    num(sheet.rows.find((r) => r[0] === label)?.[4])

  it('Note 18 — TOTAL DETTES FISCALES ET SOCIALES = Σ classes 42+43+44 (crédit)', () => {
    const n18 = buildNote18(BALANCE_D, EMPTY, ENT, EX)
    const total = noteTotal(n18, 'TOTAL DETTES FISCALES ET SOCIALES')
    expect(Math.abs(total - getPassif(BALANCE_D, ['42', '43', '44']))).toBeLessThanOrEqual(TOL)
    expect(Math.abs(total - 1_600_000)).toBeLessThanOrEqual(TOL)
  })

  it('Note 19 — TOTAL AUTRES DETTES = Σ classes 45+46+47+18 (crédit)', () => {
    const n19 = buildNote19(BALANCE_D, EMPTY, ENT, EX)
    const total = noteTotal(n19, 'TOTAL AUTRES DETTES')
    expect(Math.abs(total - getPassif(BALANCE_D, ['45', '46', '47', '18']))).toBeLessThanOrEqual(TOL)
    expect(Math.abs(total - 600_000)).toBeLessThanOrEqual(TOL)
  })
})

describe('Liasse — Note 17 (Fournisseurs) boucle avec le Bilan (DJ)', () => {
  const { rows: bilan } = buildBilan(BALANCE_A, EMPTY, ENT, EX)
  const dj = num(findByRef(bilan, 9, 'DJ')?.[12]) // Fournisseurs d'exploitation (passif net col 12)

  it('Note 17 — TOTAL FOURNISSEURS CREDITEURS = Bilan DJ', () => {
    const n17 = buildNote17(BALANCE_A, EMPTY, ENT, EX)
    const totalCred = n17.rows.find((r) => r[0] === 'TOTAL FOURNISSEURS CREDITEURS')
    expect(Math.abs(num(totalCred?.[5]) - dj)).toBeLessThanOrEqual(TOL)
    expect(Math.abs(num(totalCred?.[5]) - 2_500_000)).toBeLessThanOrEqual(TOL)
  })
})

describe('Liasse — Notes 3 (immobilisations) bouclent avec le Bilan', () => {
  // N-1 vide → ouverture = 0, clôture = soldes N. Le total de clôture des notes
  // de mouvements doit égaler le brut / l'amortissement de l'actif immobilisé.
  const { rows: bilan } = buildBilan(BALANCE_A, EMPTY, ENT, EX)
  const az = findByRef(bilan, 0, 'AZ') // Total actif immobilisé : brut col 5, amort col 6
  const azBrut = num(az?.[5])
  const azAmort = num(az?.[6])

  const totalGeneral = (sheet: { rows: Row[] }): Row | undefined =>
    sheet.rows.find((row) => row[0] === 'TOTAL GENERAL')

  it('Note 3A — clôture brute (TOTAL GENERAL) = Bilan AZ brut', () => {
    const n3a = buildNote3A(BALANCE_A, EMPTY, ENT, EX)
    const closingBrut = num(totalGeneral(n3a)?.[9]) // col J = montant brut à la clôture
    expect(Math.abs(closingBrut - azBrut)).toBeLessThanOrEqual(TOL)
    expect(Math.abs(closingBrut - 6_000_000)).toBeLessThanOrEqual(TOL)
  })

  it('Note 3C — amortissements cumulés clôture (TOTAL GENERAL) = Bilan AZ amort', () => {
    const n3c = buildNote3C(BALANCE_A, EMPTY, ENT, EX)
    const closingAmort = num(totalGeneral(n3c)?.[13]) // col N = amort cumulés à la clôture
    expect(Math.abs(closingAmort - azAmort)).toBeLessThanOrEqual(TOL)
    expect(Math.abs(closingAmort - 1_200_000)).toBeLessThanOrEqual(TOL)
  })
})

describe('Liasse — Note 8 (trésorerie) boucle avec le Bilan (BT)', () => {
  const noteRows = buildNoteRows(BALANCE_A, NOTE08_LINES)
  const sousTotalActif = noteRows.find(
    (r) => (r.cells as Record<string, unknown>).designation === 'SOUS-TOTAL TRESORERIE ACTIF',
  )
  const { rows: bilanRows } = buildBilan(BALANCE_A, EMPTY, ENT, EX)
  const bt = findByRef(bilanRows, 0, 'BT') // Total trésorerie-actif (net col 7)

  it('Sous-total trésorerie-actif Note 8 = Bilan BT', () => {
    expect(Math.abs(cellN(sousTotalActif) - num(bt?.[7]))).toBeLessThanOrEqual(TOL)
    expect(Math.abs(cellN(sousTotalActif) - 1_700_000)).toBeLessThanOrEqual(TOL)
  })
})
