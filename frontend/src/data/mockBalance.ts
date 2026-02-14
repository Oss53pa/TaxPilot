/**
 * Balance de démonstration SYSCOHADA
 * Entreprise : TAXPILOT DEMO SARL — Exercice 2024
 * Activité : Commerce général + Services informatiques
 * CA : ~250M FCFA — Résultat : bénéficiaire
 *
 * Auto-équilibrée : le Report à Nouveau (1101) absorbe le solde
 */

import type { BalanceEntry } from '../services/liasseDataService'

const d = (compte: string, intitule: string, montant: number): BalanceEntry => ({
  compte, intitule, debit: montant, credit: 0, solde_debit: montant, solde_credit: 0,
})
const c = (compte: string, intitule: string, montant: number): BalanceEntry => ({
  compte, intitule, debit: 0, credit: montant, solde_debit: 0, solde_credit: montant,
})

// ═══════════════════════════════════════
// Comptes bilan (classes 1-5) — SANS 1101 ni 1300
// ═══════════════════════════════════════

const BILAN_FIXE: BalanceEntry[] = [
  // ── Classe 1 : Capitaux & Dettes financières ──
  c('1011',  'Capital social',                          50_000_000),
  c('1051',  'Primes d\'apport',                         5_000_000),
  c('1061',  'Réserve légale',                           5_000_000),
  c('1130',  'Réserves statutaires',                     3_000_000),
  c('1410',  'Subventions d\'investissement',            2_500_000),
  c('1510',  'Provisions pour litiges',                  3_500_000),
  c('1620',  'Emprunts bancaires',                      45_000_000),
  c('1640',  'Dettes financières diverses',             12_000_000),
  c('1720',  'Dettes de crédit-bail',                    8_000_000),
  c('1910',  'Provisions pour risques',                  4_500_000),

  // ── Classe 2 : Immobilisations ──
  d('2010',  'Frais d\'établissement',                   2_500_000),
  d('2130',  'Logiciels',                                8_500_000),
  d('2150',  'Fonds commercial',                        12_000_000),
  d('2210',  'Terrains',                                20_000_000),
  d('2311',  'Bâtiments industriels',                   55_000_000),
  d('2330',  'Bâtiments administratifs',                30_000_000),
  d('2350',  'Installations techniques',                10_000_000),
  d('2410',  'Matériel industriel',                     38_000_000),
  d('2440',  'Matériel et mobilier de bureau',           7_500_000),
  d('2450',  'Matériel de transport',                   25_000_000),
  d('2510',  'Avances sur immobilisations',              2_000_000),
  d('2610',  'Titres de participation',                  5_000_000),
  d('2710',  'Prêts au personnel',                       2_000_000),
  d('2750',  'Dépôts et cautionnements',                 1_500_000),

  // Amortissements
  c('28010', 'Amort. frais d\'établissement',            1_500_000),
  c('28130', 'Amort. logiciels',                         4_200_000),
  c('28311', 'Amort. bâtiments industriels',            16_500_000),
  c('28330', 'Amort. bâtiments administratifs',          6_000_000),
  c('28350', 'Amort. installations techniques',          4_000_000),
  c('28410', 'Amort. matériel industriel',              19_000_000),
  c('28440', 'Amort. mobilier de bureau',                3_000_000),
  c('28450', 'Amort. matériel de transport',            12_500_000),
  c('29610', 'Dépréciation titres de participation',     1_000_000),

  // ── Classe 3 : Stocks ──
  d('3110',  'Marchandises A',                          16_000_000),
  d('3120',  'Marchandises B',                           6_000_000),
  d('3210',  'Matières premières',                      10_000_000),
  d('3310',  'Autres approvisionnements',                3_000_000),
  d('3410',  'Produits en cours',                        3_500_000),
  d('3710',  'Produits finis',                           7_500_000),
  c('3910',  'Dépréciation marchandises',                1_000_000),
  c('3920',  'Dépréciation matières premières',            400_000),

  // ── Classe 4 : Tiers ──
  d('4110',  'Clients entreprises',                     25_000_000),
  d('4120',  'Clients particuliers',                     5_500_000),
  d('4150',  'Clients effets à recevoir',                3_500_000),
  d('4181',  'Clients factures à établir',               2_000_000),
  d('4452',  'TVA récupérable sur immobilisations',      3_200_000),
  d('4455',  'TVA récupérable sur achats',               4_800_000),
  d('4710',  'Débiteurs divers',                         1_200_000),
  d('4760',  'Charges constatées d\'avance',             2_000_000),
  c('4010',  'Fournisseurs d\'exploitation',            18_000_000),
  c('4190',  'Clients créditeurs (avances reçues)',      3_000_000),
  c('4310',  'Sécurité sociale',                         4_200_000),
  c('4410',  'État, impôt sur les bénéfices',            4_500_000),
  c('4434',  'État, TVA collectée',                      7_500_000),
  c('4210',  'Personnel, rémunérations dues',            5_800_000),
  c('4280',  'Personnel, charges à payer',               1_800_000),
  c('4790',  'Produits constatés d\'avance',             1_500_000),
  c('4910',  'Dépréciation clients',                     2_000_000),

  // ── Classe 5 : Trésorerie ──
  d('5210',  'Banque BIAO-CI',                          12_000_000),
  d('5220',  'Banque SGCI',                              7_000_000),
  d('5310',  'Caisse principale',                        1_500_000),
  d('5320',  'Caisse secondaire',                          400_000),
]

// ═══════════════════════════════════════
// Comptes de résultat (classes 6-7-8)
// ═══════════════════════════════════════

const CHARGES: BalanceEntry[] = [
  // Achats et variations
  d('6011',  'Achats marchandises zone UEMOA',          65_000_000),
  d('6012',  'Achats marchandises import',              20_000_000),
  d('60310', 'Variation stocks marchandises',            3_000_000),
  d('6021',  'Achats de matières premières',            25_000_000),
  d('60320', 'Variation stocks matières premières',      1_000_000),
  d('6040',  'Achats matières consommables',             5_000_000),
  d('6050',  'Fournitures non stockées',                 3_800_000),
  d('60330', 'Variation stocks approv.',                   600_000),
  // Services
  d('6110',  'Transports sur achats',                    2_800_000),
  d('6120',  'Transports sur ventes',                    2_500_000),
  d('6130',  'Transports pour tiers',                    1_200_000),
  d('6210',  'Sous-traitance générale',                  4_800_000),
  d('6220',  'Locations',                                4_200_000),
  d('6250',  'Primes d\'assurance',                      2_000_000),
  d('6310',  'Frais bancaires',                          1_500_000),
  d('6320',  'Rémunérations intermédiaires',             2_800_000),
  // Impôts et taxes
  d('6410',  'Impôts et taxes directs',                  2_500_000),
  d('6420',  'Droits d\'enregistrement',                   400_000),
  d('6450',  'Impôts et taxes indirects',                1_000_000),
  // Autres charges
  d('6510',  'Pertes sur créances clients',              1_200_000),
  d('6540',  'Pénalités',                                  200_000),
  // Personnel
  d('6611',  'Salaires et commissions',                 35_000_000),
  d('6630',  'Indemnités de logement',                   4_200_000),
  d('6640',  'Charges sociales',                        11_500_000),
  d('6660',  'Frais de formation',                       1_000_000),
  // Dotations
  d('6811',  'Dotations amort. exploitation',           14_000_000),
  d('6812',  'Dotations amort. charges immo.',             500_000),
  d('6910',  'Dotations provisions exploitation',        3_500_000),
  // Charges financières
  d('6711',  'Intérêts des emprunts',                    4_800_000),
  d('6720',  'Frais de découvert',                       1_500_000),
  d('6760',  'Pertes de change',                           600_000),
  // HAO
  d('8110',  'VNC des immobilisations cédées',           4_000_000),
  d('8310',  'Charges HAO',                                500_000),
  d('8510',  'Dotations HAO',                              400_000),
  // Impôt
  d('8910',  'Impôt sur les bénéfices',                  7_500_000),
]

const PRODUITS: BalanceEntry[] = [
  // Ventes
  c('7011',  'Ventes marchandises zone UEMOA',         142_000_000),
  c('7012',  'Ventes marchandises export',              18_000_000),
  c('7020',  'Ventes de produits fabriqués',            55_000_000),
  c('7060',  'Services vendus',                         25_000_000),
  c('7070',  'Produits accessoires',                     5_000_000),
  // Production
  c('7300',  'Production stockée',                       4_000_000),
  c('7200',  'Production immobilisée',                   1_800_000),
  // Subventions et autres produits
  c('7100',  'Subventions d\'exploitation',              1_200_000),
  c('7500',  'Autres produits',                          2_500_000),
  // Reprises
  c('7910',  'Reprises provisions exploitation',         3_800_000),
  c('7980',  'Reprises d\'amortissements',                 800_000),
  // Produits financiers
  c('7710',  'Intérêts de prêts',                          600_000),
  c('7720',  'Revenus de participations',                1_000_000),
  c('7760',  'Gains de change',                            400_000),
  c('7870',  'Reprises provisions financières',            600_000),
  // HAO
  c('8200',  'Produits cessions immobilisations',        6_500_000),
  c('8400',  'Produits HAO divers',                      1_100_000),
]

// ═══════════════════════════════════════
// Construction auto-équilibrée
// ═══════════════════════════════════════

function buildMockBalance(): BalanceEntry[] {
  // 1. Calculer le résultat CdR
  const totalCharges = CHARGES.reduce((s, e) => s + e.debit, 0)
  const totalProduits = PRODUITS.reduce((s, e) => s + e.credit, 0)
  const resultatNet = totalProduits - totalCharges

  // 2. Calculer actif net et passif (sans RAN ni résultat)
  const bilanDebit = BILAN_FIXE.reduce((s, e) => s + e.debit, 0)
  const bilanCredit = BILAN_FIXE.reduce((s, e) => s + e.credit, 0)

  // 3. RAN = actif - passif_fixe - résultat
  const ran = bilanDebit - bilanCredit - resultatNet

  // 4. Assembler la balance
  const balance: BalanceEntry[] = [
    ...BILAN_FIXE,
  ]

  // Insérer RAN et Résultat dans la bonne position (après classe 1 fixe)
  if (ran >= 0) {
    balance.push(c('1101', 'Report à nouveau créditeur', ran))
  } else {
    balance.push(d('1290', 'Report à nouveau débiteur', Math.abs(ran)))
  }

  balance.push(c('1300', 'Résultat net de l\'exercice', Math.max(0, resultatNet)))
  if (resultatNet < 0) {
    // Si perte, on met le débit
    balance.push(d('1390', 'Résultat net déficitaire', Math.abs(resultatNet)))
  }

  balance.push(...CHARGES, ...PRODUITS)

  return balance
}

export const MOCK_BALANCE = buildMockBalance()

/**
 * Infos de la balance pour debug
 */
export function getBalanceInfo() {
  const totalD = MOCK_BALANCE.reduce((s, e) => s + e.debit, 0)
  const totalC = MOCK_BALANCE.reduce((s, e) => s + e.credit, 0)
  const totalCharges = CHARGES.reduce((s, e) => s + e.debit, 0)
  const totalProduits = PRODUITS.reduce((s, e) => s + e.credit, 0)
  return {
    comptes: MOCK_BALANCE.length,
    totalDebit: totalD,
    totalCredit: totalC,
    ecart: Math.abs(totalD - totalC),
    isBalanced: Math.abs(totalD - totalC) < 1,
    totalCharges,
    totalProduits,
    resultatNet: totalProduits - totalCharges,
  }
}
