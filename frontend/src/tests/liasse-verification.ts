/**
 * Vérification automatique de la liasse fiscale SYSCOHADA
 *
 * Ce fichier teste le moteur de calcul avec une balance fictive
 * et vérifie 13 contrôles automatiques + cohérence inter-tableaux.
 *
 * Usage : importer et appeler runFullVerification() depuis la console ou un composant.
 */

import { LiasseDataService, SYSCOHADA_MAPPING, type BalanceEntry } from '../services/liasseDataService'

// ══════════════════════════════════════════════
// 1. Balance fictive de test (30+ comptes)
// ══════════════════════════════════════════════

function createTestBalance(): BalanceEntry[] {
  // Helper : créer une entrée débitrice
  const d = (compte: string, intitule: string, montant: number): BalanceEntry => ({
    compte, intitule,
    debit: montant, credit: 0,
    solde_debit: montant, solde_credit: 0,
  })
  // Helper : créer une entrée créditrice
  const c = (compte: string, intitule: string, montant: number): BalanceEntry => ({
    compte, intitule,
    debit: 0, credit: montant,
    solde_debit: 0, solde_credit: montant,
  })

  return [
    // ── Classe 1 : Capitaux propres et emprunts ──
    c('1011', 'Capital social', 50_000_000),
    c('1061', 'Réserve légale', 5_000_000),
    c('1200', 'Report à nouveau', 10_180_000),
    c('1300', 'Résultat net de l\'exercice', 8_120_000),  // CH = 142.12M - 134M
    c('1620', 'Emprunts auprès des établissements de crédit', 20_000_000),
    c('1640', 'Dettes auprès des établissements de crédit', 5_000_000),
    c('1910', 'Provisions pour litiges', 2_000_000),

    // ── Classe 2 : Immobilisations ──
    d('2130', 'Logiciels', 3_000_000),
    d('2150', 'Fonds commercial', 8_000_000),
    d('2310', 'Bâtiments', 45_000_000),
    d('2410', 'Matériel industriel', 25_000_000),
    d('2450', 'Matériel de transport', 15_000_000),
    d('2710', 'Prêts au personnel', 1_500_000),

    // Amortissements (créditeurs)
    c('28130', 'Amort. logiciels', 1_200_000),
    c('28150', 'Amort. fonds commercial', 0),
    c('28310', 'Amort. bâtiments', 9_000_000),
    c('28410', 'Amort. matériel industriel', 10_000_000),
    c('28450', 'Amort. matériel transport', 6_000_000),

    // ── Classe 3 : Stocks ──
    d('3110', 'Marchandises', 12_000_000),
    d('3210', 'Matières premières', 8_000_000),
    d('3710', 'Produits intermédiaires', 5_000_000),

    // ── Classe 4 : Tiers ──
    d('4110', 'Clients', 18_000_000),
    c('4010', 'Fournisseurs', 15_000_000),
    c('4310', 'Sécurité sociale', 2_500_000),
    c('4410', 'État, impôts sur bénéfices', 3_000_000),
    c('4210', 'Personnel, rémunérations dues', 4_200_000),

    // ── Classe 5 : Trésorerie ──
    d('5210', 'Banque BIAO', 9_500_000),
    d('5310', 'Caisse', 1_200_000),

    // ── Classe 6 : Charges ──
    d('6010', 'Achats de marchandises', 45_000_000),
    d('60310', 'Variation stocks marchandises', 2_000_000),  // déstockage
    d('6020', 'Achats de matières premières', 18_000_000),
    d('60320', 'Variation stocks matières premières', 1_000_000),
    d('6050', 'Autres achats', 5_000_000),
    d('6100', 'Transports', 3_000_000),
    d('6210', 'Sous-traitance', 4_000_000),
    d('6300', 'Services extérieurs', 2_500_000),
    d('6410', 'Impôts et taxes', 3_500_000),
    d('6510', 'Pertes sur créances', 500_000),
    d('6610', 'Rémunérations du personnel', 28_000_000),
    d('6810', 'Dotations aux amortissements d\'exploitation', 8_000_000),
    d('6910', 'Dotations aux provisions d\'exploitation', 2_000_000),

    // Charges financières
    d('6710', 'Intérêts des emprunts', 4_000_000),

    // Charges HAO
    d('8100', 'VNC des cessions d\'immobilisations', 3_000_000),
    d('8300', 'Charges HAO', 500_000),

    // Impôt
    d('8910', 'Impôts sur le résultat', 4_000_000),

    // ── Classe 7 : Produits ──
    c('7010', 'Ventes de marchandises', 85_000_000),
    c('7020', 'Ventes de produits fabriqués', 35_000_000),
    c('7060', 'Services vendus', 8_000_000),
    c('7300', 'Production stockée', 3_000_000),  // crédit = stockage positif
    c('7500', 'Autres produits', 1_500_000),
    c('7910', 'Reprises amort. et provisions', 2_500_000),

    // Produits financiers
    c('7710', 'Revenus financiers', 1_000_000),

    // Produits HAO
    c('8200', 'Produits des cessions d\'immobilisations', 5_000_000),
    c('8400', 'Produits HAO divers', 1_120_000),
  ]
}


// ══════════════════════════════════════════════
// 2. Fonctions de vérification
// ══════════════════════════════════════════════

interface VerifResult {
  id: string
  label: string
  expected: string
  actual: string
  pass: boolean
}

function runVerifications(service: LiasseDataService): VerifResult[] {
  const results: VerifResult[] = []
  const tolerance = 1 // 1 FCFA

  // Helper
  const check = (id: string, label: string, expected: number, actual: number) => {
    const pass = Math.abs(expected - actual) < tolerance
    results.push({
      id,
      label,
      expected: fmt(expected),
      actual: fmt(actual),
      pass,
    })
  }

  const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(Math.round(n))

  // ── Générer les données ──
  const actif = service.generateBilanActif()
  const passif = service.generateBilanPassif()
  const { charges, produits } = service.generateCompteResultat()
  const sig = service.generateSIG()
  const tft = service.generateTFT()

  // ── Calculer les totaux ──

  // Actif : sum of net values
  const actifByRef: Record<string, any> = {}
  actif.forEach((r: any) => { actifByRef[r.ref] = r })
  const totalActifNet = actif.reduce((s: number, r: any) => s + (r.net || 0), 0)

  // Passif : sum of montant values
  const passifByRef: Record<string, any> = {}
  passif.forEach((r: any) => { passifByRef[r.ref] = r })
  const totalPassif = passif.reduce((s: number, r: any) => s + (r.montant || 0), 0)

  // CdR totaux
  const totalCharges = charges.reduce((s: number, r: any) => s + (r.montant || 0), 0)
  const totalProduits = produits.reduce((s: number, r: any) => s + (r.montant || 0), 0)
  const resultatCdR = totalProduits - totalCharges

  // CdR par ref
  const chargesByRef: Record<string, number> = {}
  charges.forEach((r: any) => { chargesByRef[r.ref] = r.montant || 0 })
  const produitsByRef: Record<string, number> = {}
  produits.forEach((r: any) => { produitsByRef[r.ref] = r.montant || 0 })

  // SIG par ref
  const sigByRef: Record<string, number> = {}
  sig.forEach((r: any) => { sigByRef[r.ref] = r.montant || 0 })

  // Résultat bilan (CH au passif)
  const resultatBilan = passifByRef['CH']?.montant || 0

  // ═══════════════════════════════════════
  // Vérification 1 : BZ = DZ (Actif = Passif)
  // ═══════════════════════════════════════
  check('V01', 'Total Actif (BZ) = Total Passif (DZ)', totalActifNet, totalPassif)

  // ═══════════════════════════════════════
  // Vérification 2 : CH = XI = SIG9 (Résultat net)
  // ═══════════════════════════════════════
  check('V02a', 'CH (Bilan) = XI (CdR)', resultatBilan, resultatCdR)
  check('V02b', 'CH (Bilan) = SIG9', resultatBilan, sigByRef['SIG9'] || 0)
  check('V02c', 'XI (CdR) = SIG9', resultatCdR, sigByRef['SIG9'] || 0)

  // ═══════════════════════════════════════
  // Vérification 3 : Cascade SIG correcte
  // ═══════════════════════════════════════
  // SIG1 = T1 - T2 - T3
  const sig1Calc = (sigByRef['T1'] || 0) - (sigByRef['T2'] || 0) - (sigByRef['T3'] || 0)
  check('V03a', 'SIG1 = T1 - T2 - T3', sig1Calc, sigByRef['SIG1'] || 0)

  // SIG3 cascade
  const sig3Calc = (sigByRef['SIG1'] || 0) + (sigByRef['SIG2'] || 0) - (sigByRef['T7'] || 0) - (sigByRef['T8'] || 0) - (sigByRef['T9'] || 0)
  check('V03b', 'SIG3 = SIG1 + SIG2 - T7 - T8 - T9', sig3Calc, sigByRef['SIG3'] || 0)

  // SIG7 = SIG5 + SIG6
  check('V03c', 'SIG7 = SIG5 + SIG6', (sigByRef['SIG5'] || 0) + (sigByRef['SIG6'] || 0), sigByRef['SIG7'] || 0)

  // SIG9 = SIG7 + SIG8 - T26 - T27
  const sig9Calc = (sigByRef['SIG7'] || 0) + (sigByRef['SIG8'] || 0) - (sigByRef['T26'] || 0) - (sigByRef['T27'] || 0)
  check('V03d', 'SIG9 = SIG7 + SIG8 - T26 - T27', sig9Calc, sigByRef['SIG9'] || 0)

  // ═══════════════════════════════════════
  // Vérification 4 : Totaux actif cohérents
  // ═══════════════════════════════════════
  // AZ = total immo, BL = total actif circulant, BS = trésorerie actif → BZ = AZ + actif circ + tréso + BU
  // We check that all line items sum correctly
  const groupActifImmo = ['AQ', 'AR', 'AS', 'AD', 'AE', 'AF', 'AG', 'AJ', 'AK', 'AL', 'AM', 'AN', 'AP', 'AT', 'AU']
  const totalImmoNet = groupActifImmo.reduce((s, ref) => s + (actifByRef[ref]?.net || 0), 0)
  check('V04', 'AZ = somme immo nettes', totalImmoNet, totalActifNet - (
    (actifByRef['BA']?.net || 0) +
    (actifByRef['BC']?.net || 0) + (actifByRef['BD']?.net || 0) + (actifByRef['BE']?.net || 0) +
    (actifByRef['BF']?.net || 0) + (actifByRef['BG']?.net || 0) +
    (actifByRef['BI']?.net || 0) + (actifByRef['BJ']?.net || 0) + (actifByRef['BK']?.net || 0) +
    (actifByRef['BQ']?.net || 0) + (actifByRef['BR']?.net || 0) + (actifByRef['BS']?.net || 0) +
    (actifByRef['BU']?.net || 0)
  ))

  // ═══════════════════════════════════════
  // Vérification 5 : Comptes réciproques 52x
  // ═══════════════════════════════════════
  // 52x with debit balance → actif (BS), credit balance → passif (DQ)
  // In our test, 5210 is debit 9.5M → should be in BS, not in DQ
  const bsValue = actifByRef['BS']?.brut || 0
  const dqValue = passifByRef['DQ']?.montant || 0
  check('V05a', 'BS inclut 52x débiteur (9.5M dans banque)', bsValue > 0 ? 1 : 0, 1)
  check('V05b', 'DQ = 0 car pas de 52x créditeur', 0, dqValue)

  // ═══════════════════════════════════════
  // Vérification 6 : Variation stocks (CdR RB, RD)
  // ═══════════════════════════════════════
  // RB = variation stocks marchandises (6031) = 2M (déstockage)
  check('V06a', 'RB = variation stocks marchandises = 2 000 000', 2_000_000, chargesByRef['RB'] || 0)
  check('V06b', 'RD = variation stocks matières = 1 000 000', 1_000_000, chargesByRef['RD'] || 0)

  // ═══════════════════════════════════════
  // Vérification 7 : Production stockée (TD) signe correct
  // ═══════════════════════════════════════
  // Compte 73 crédit 3M → TD = +3M (positif = stockage)
  check('V07', 'TD = production stockée = 3 000 000 (crédit→positif)', 3_000_000, produitsByRef['TD'] || 0)

  // ═══════════════════════════════════════
  // Vérification 8 : CAFG (TFT)
  // ═══════════════════════════════════════
  // CAFG = résultat + dotations - reprises - plus-values
  // résultat = 8 120 000
  // dotations (681+691) = 8 000 000 + 2 000 000 = 10 000 000
  // reprises (791) = 2 500 000
  // plus-values = produits cessions (82=5M) - VNC (81=3M) = 2M
  const cafgExpected = resultatCdR + (tft.FB || 0) - (tft.FC || 0) - (tft.FD || 0)
  check('V08', 'CAFG = Résultat + Dotations - Reprises - Plus-values', tft.FE || 0, cafgExpected)

  // ═══════════════════════════════════════
  // Vérification 9 : Trésorerie nette (TFT)
  // ═══════════════════════════════════════
  // tresoActif = 5210 (9.5M) + 5310 (1.2M) = 10.7M
  // tresoPassif = 0 (pas de 52 créditeur)
  check('V09', 'Trésorerie nette = tresoActif - tresoPassif', 10_700_000, tft.FS || 0)

  // ═══════════════════════════════════════
  // Vérification 10 : Pas de double comptage
  // ═══════════════════════════════════════
  // Total produits CdR = 85M + 35M + 8M + 3M + 1.5M + 2.5M + 1M + 5M + 1.12M = 142.12M
  const expectedProduits = 85_000_000 + 35_000_000 + 8_000_000 + 3_000_000 + 1_500_000 + 2_500_000 + 1_000_000 + 5_000_000 + 1_120_000
  check('V10', 'Total produits CdR = somme connue (142 120 000)', expectedProduits, totalProduits)

  // ═══════════════════════════════════════
  // Vérification 11 : Résultat net calculé
  // ═══════════════════════════════════════
  // Expected = 142 120 000 (produits) - charges
  // Charges = 45M+2M+18M+1M+5M+3M+4M+2.5M+3.5M+0.5M+28M+8M+2M+4M+3M+0.5M+4M = 134 000 000
  const expectedCharges = 134_000_000
  const expectedResultat = expectedProduits - expectedCharges  // 142.12 - 134 = 8.12M
  check('V11a', 'Total charges CdR = 134 000 000', expectedCharges, totalCharges)
  check('V11b', 'Résultat net = 8 120 000', expectedResultat, resultatCdR)

  // ═══════════════════════════════════════
  // Vérification 12 : Amortissements corrects
  // ═══════════════════════════════════════
  const totalAmort = (actifByRef['AD']?.amortProv || 0) + (actifByRef['AE']?.amortProv || 0) +
    (actifByRef['AF']?.amortProv || 0) + (actifByRef['AG']?.amortProv || 0) +
    (actifByRef['AJ']?.amortProv || 0) + (actifByRef['AK']?.amortProv || 0) +
    (actifByRef['AL']?.amortProv || 0) + (actifByRef['AM']?.amortProv || 0) +
    (actifByRef['AN']?.amortProv || 0)
  // 1.2M + 0 + 9M + 10M + 6M = 26.2M
  check('V12', 'Total amortissements = 26 200 000', 26_200_000, totalAmort)

  // ═══════════════════════════════════════
  // Vérification 13 : Marge commerciale (SIG1)
  // ═══════════════════════════════════════
  // SIG1 = Ventes marchandises (85M) - Achats (45M) - Variation stocks (2M) = 38M
  check('V13', 'Marge commerciale = 85M - 45M - 2M = 38 000 000', 38_000_000, sigByRef['SIG1'] || 0)

  return results
}

// ══════════════════════════════════════════════
// 3. Rapport final
// ══════════════════════════════════════════════

export interface FullVerificationReport {
  balance: BalanceEntry[]
  results: VerifResult[]
  summary: {
    total: number
    passed: number
    failed: number
    percent: number
  }
  tableText: string
}

export function runFullVerification(): FullVerificationReport {
  const service = new LiasseDataService()
  const balance = createTestBalance()
  service.loadBalance(balance)

  const results = runVerifications(service)

  const passed = results.filter(r => r.pass).length
  const total = results.length
  const failed = total - passed

  // Generate text table
  let table = '╔════════╦══════════════════════════════════════════════════════╦══════════════════╦══════════════════╦════════╗\n'
  table +=    '║ ID     ║ Vérification                                         ║ Attendu          ║ Obtenu           ║ Statut ║\n'
  table +=    '╠════════╬══════════════════════════════════════════════════════╬══════════════════╬══════════════════╬════════╣\n'

  for (const r of results) {
    const id = r.id.padEnd(6)
    const label = r.label.substring(0, 52).padEnd(52)
    const expected = r.expected.substring(0, 16).padStart(16)
    const actual = r.actual.substring(0, 16).padStart(16)
    const status = r.pass ? '  OK  ' : ' FAIL '
    table += `║ ${id} ║ ${label} ║ ${expected} ║ ${actual} ║${status}║\n`
  }

  table += '╠════════╬══════════════════════════════════════════════════════╬══════════════════╬══════════════════╬════════╣\n'
  table += `║ TOTAL  ║ ${passed}/${total} vérifications réussies (${Math.round(passed / total * 100)}%)${''.padEnd(52 - `${passed}/${total} vérifications réussies (${Math.round(passed / total * 100)}%)`.length)} ║                  ║                  ║${failed === 0 ? ' 100% ' : ' FAIL '}║\n`
  table += '╚════════╩══════════════════════════════════════════════════════╩══════════════════╩══════════════════╩════════╝\n'

  return {
    balance,
    results,
    summary: { total, passed, failed, percent: Math.round(passed / total * 100) },
    tableText: table,
  }
}

// Export test balance for use in other components
export { createTestBalance }
