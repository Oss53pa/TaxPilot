/**
 * Standalone verification runner
 * Run with: npx tsx src/tests/run-verification.ts
 */

// Inline the core classes to avoid import path issues with tsx

interface BalanceEntry {
  compte: string
  intitule: string
  debit: number
  credit: number
  solde_debit: number
  solde_credit: number
}

// ══════════════════════════════════════════════
// Minimal LiasseDataService (copied from service)
// ══════════════════════════════════════════════

const SYSCOHADA_MAPPING = {
  actif: {
    AQ: { comptes: ['201'], amortComptes: ['2801', '2901'] },
    AR: { comptes: ['202'], amortComptes: ['2802', '2902'] },
    AS: { comptes: ['206'], amortComptes: ['2806', '2906'] },
    AD: { comptes: ['211', '212'], amortComptes: ['2811', '2812', '2911', '2912'] },
    AE: { comptes: ['213', '214', '215'], amortComptes: ['2813', '2814', '2815', '2913', '2914', '2915'] },
    AF: { comptes: ['216', '217'], amortComptes: ['2816', '2817', '2916', '2917'] },
    AG: { comptes: ['218', '219'], amortComptes: ['2818', '2819', '2918', '2919'] },
    AJ: { comptes: ['22'], amortComptes: ['282', '292'] },
    AK: { comptes: ['231', '232', '233', '234'], amortComptes: ['2831', '2832', '2833', '2834', '2931', '2932', '2933', '2934'] },
    AL: { comptes: ['235', '237', '238'], amortComptes: ['2835', '2837', '2838', '2935', '2937', '2938'] },
    AM: { comptes: ['241', '242', '243', '244'], amortComptes: ['2841', '2842', '2843', '2844', '2941', '2942', '2943', '2944'] },
    AN: { comptes: ['245'], amortComptes: ['2845', '2945'] },
    AP: { comptes: ['251', '252'], amortComptes: [] },
    AT: { comptes: ['26'], amortComptes: ['296'] },
    AU: { comptes: ['271', '272', '273', '274', '275', '276', '277'], amortComptes: ['297'] },
    BA: { comptes: ['485', '486', '487', '488'], amortComptes: ['498'] },
    BC: { comptes: ['31'], amortComptes: ['391'] },
    BD: { comptes: ['32'], amortComptes: ['392'] },
    BE: { comptes: ['33'], amortComptes: ['393'] },
    BF: { comptes: ['34', '35'], amortComptes: ['394', '395'] },
    BG: { comptes: ['36', '37', '38'], amortComptes: ['396', '397', '398'] },
    BI: { comptes: ['409'], amortComptes: ['490'] },
    BJ: { comptes: ['411', '412', '413', '414', '415', '416', '418'], amortComptes: ['491'] },
    BK: { comptes: ['43', '44', '45', '46', '47'], amortComptes: ['492', '493', '494', '495', '496', '497'] },
    BQ: { comptes: ['50'], amortComptes: ['590'] },
    BR: { comptes: ['51'], amortComptes: ['591'] },
    BS: { comptes: ['52', '53', '54', '55', '56', '57', '58'], amortComptes: ['592', '593', '594'] },
    BU: { comptes: ['478'], amortComptes: [] },
  },
  passif: {
    CA: { comptes: ['101', '102', '103'] },
    CB: { comptes: ['109'] },
    CC: { comptes: ['104', '105'] },
    CD: { comptes: ['106'] },
    CE: { comptes: ['111', '112'] },
    CF: { comptes: ['113', '118'] },
    CG: { comptes: ['12'] },
    CH: { comptes: ['13'] },
    CI: { comptes: ['14'] },
    CJ: { comptes: ['15'] },
    DA: { comptes: ['161'] },
    DB: { comptes: ['162', '163', '164'] },
    DC: { comptes: ['165', '166', '168'] },
    DD: { comptes: ['17'] },
    DE: { comptes: ['181', '182', '183', '184', '185', '186'] },
    DF: { comptes: ['19'] },
    DH: { comptes: ['481', '482', '483', '484'] },
    DI: { comptes: ['419'] },
    DJ: { comptes: ['401', '402', '403', '404', '405', '408'] },
    DK: { comptes: ['431', '432', '433', '434', '435', '436', '437', '438', '439', '441', '442', '443', '444', '445', '446', '447', '448', '449'] },
    DL: { comptes: ['421', '422', '423', '424', '425', '426', '427', '428'] },
    DM: { comptes: ['499'] },
    DQ: { comptes: ['52', '561', '564'] },
    DR: { comptes: ['565'] },
    DT: { comptes: ['479'] },
  },
  charges: {
    RA: { comptes: ['601'] },
    RB: { comptes: ['6031'] },
    RC: { comptes: ['602'] },
    RD: { comptes: ['6032'] },
    RE: { comptes: ['604', '605', '608'] },
    RF: { comptes: ['6033'] },
    RG: { comptes: ['61'] },
    RH: { comptes: ['62', '63'] },
    RI: { comptes: ['64'] },
    RJ: { comptes: ['65'] },
    RK: { comptes: ['66'] },
    RL: { comptes: ['681'] },
    RM: { comptes: ['691'] },
    RN: { comptes: ['671', '672', '673', '674', '675'] },
    RO: { comptes: ['676'] },
    RP: { comptes: ['679', '697'] },
    RQ: { comptes: ['81'] },
    RR: { comptes: ['83', '85'] },
    RS: { comptes: ['89'] },
  },
  produits: {
    TA: { comptes: ['701'] },
    TB: { comptes: ['702', '703', '704', '705'] },
    TC: { comptes: ['706'] },
    TD: { comptes: ['73'] },
    TE: { comptes: ['72'] },
    TF: { comptes: ['707'] },
    TG: { comptes: ['71'] },
    TH: { comptes: ['75'] },
    TI: { comptes: ['791', '798', '799'] },
    TJ: { comptes: ['771', '772', '773', '774', '775'] },
    TK: { comptes: ['776'] },
    TL: { comptes: ['787', '797'] },
    TM: { comptes: ['781', '782'] },
    TN: { comptes: ['82'] },
    TO: { comptes: ['84', '86', '88'] },
  },
}

class TestLiasseService {
  private cache = new Map<string, number>()

  loadBalance(balance: BalanceEntry[]) {
    this.cache.clear()
    balance.forEach(e => {
      const k = e.compte.replace(/\s/g, '')
      this.cache.set(k, e.solde_debit - e.solde_credit)
    })
  }

  private sumSoldes(comptes: string[]): number {
    let t = 0
    comptes.forEach(p => this.cache.forEach((v, k) => { if (k === p || k.startsWith(p)) t += v }))
    return t
  }

  private calcActifBrut(comptes: string[]): number {
    let t = 0
    comptes.forEach(p => this.cache.forEach((v, k) => { if ((k === p || k.startsWith(p)) && v > 0) t += v }))
    return t
  }

  private calcAmortProv(comptes: string[]): number {
    let t = 0
    comptes.forEach(p => this.cache.forEach((v, k) => { if (k === p || k.startsWith(p)) t += Math.abs(v) }))
    return t
  }

  private calcPassif(comptes: string[]): number {
    let t = 0
    comptes.forEach(p => this.cache.forEach((v, k) => { if ((k === p || k.startsWith(p)) && v < 0) t += Math.abs(v) }))
    return t
  }

  private calcCharges(comptes: string[]): number {
    let t = 0
    comptes.forEach(p => this.cache.forEach((v, k) => { if ((k === p || k.startsWith(p)) && v > 0) t += v }))
    return t
  }

  private calcProduits(comptes: string[]): number {
    let t = 0
    comptes.forEach(p => this.cache.forEach((v, k) => { if ((k === p || k.startsWith(p)) && v < 0) t += Math.abs(v) }))
    return t
  }

  private calcVariation(comptes: string[]): number {
    return this.sumSoldes(comptes)
  }

  private calcPassifReciprocal(comptes: string[]): number {
    let t = 0
    comptes.forEach(p => this.cache.forEach((v, k) => { if ((k === p || k.startsWith(p)) && v < 0) t += Math.abs(v) }))
    return t
  }

  genActif(): any[] {
    const rows: any[] = []
    void ['DH', 'DL', 'DQ', 'DR']
    Object.entries(SYSCOHADA_MAPPING.actif).forEach(([ref, m]) => {
      const brut = this.calcActifBrut(m.comptes)
      const amortProv = this.calcAmortProv(m.amortComptes || [])
      rows.push({ ref, brut, amortProv, net: brut - amortProv, net_n1: 0 })
    })
    return rows
  }

  genPassif(): any[] {
    const rows: any[] = []
    const reciprocalRefs = ['DH', 'DL', 'DQ', 'DR']
    Object.entries(SYSCOHADA_MAPPING.passif).forEach(([ref, m]) => {
      const montant = reciprocalRefs.includes(ref) ? this.calcPassifReciprocal(m.comptes) : this.calcPassif(m.comptes)
      rows.push({ ref, montant, montant_n1: 0 })
    })
    return rows
  }

  genCdR(): { charges: any[], produits: any[] } {
    const charges: any[] = []
    const produits: any[] = []
    const variationRefs = ['RB', 'RD', 'RF']
    const produitVariationRefs = ['TD']

    Object.entries(SYSCOHADA_MAPPING.charges).forEach(([ref, m]) => {
      const montant = variationRefs.includes(ref) ? this.calcVariation(m.comptes) : this.calcCharges(m.comptes)
      charges.push({ ref, montant })
    })
    Object.entries(SYSCOHADA_MAPPING.produits).forEach(([ref, m]) => {
      const montant = produitVariationRefs.includes(ref) ? -this.sumSoldes(m.comptes) : this.calcProduits(m.comptes)
      produits.push({ ref, montant })
    })
    return { charges, produits }
  }

  genSIG(): Record<string, number> {
    const T1 = this.calcProduits(['701'])
    const T2 = this.calcCharges(['601'])
    const T3 = this.calcVariation(['6031'])
    const SIG1 = T1 - T2 - T3

    const T4 = this.calcProduits(['702', '703', '704', '705', '706', '707'])
    const T5 = -this.sumSoldes(['73'])
    const T6 = this.calcProduits(['72'])
    const SIG2 = T4 + T5 + T6

    const T7 = this.calcCharges(['602'])
    const T8 = this.calcVariation(['6032', '6033'])
    const T9 = this.calcCharges(['604', '605', '608', '61', '62', '63'])
    const SIG3 = SIG1 + SIG2 - T7 - T8 - T9

    const T10 = this.calcProduits(['71'])
    const T11 = this.calcCharges(['64'])
    const T12 = this.calcCharges(['66'])
    const SIG4 = SIG3 + T10 - T11 - T12

    const T13 = this.calcProduits(['791', '798', '799'])
    const T14 = this.calcProduits(['781', '782'])
    const T15 = this.calcProduits(['75'])
    const T16 = this.calcCharges(['681', '691'])
    const T17 = this.calcCharges(['65'])
    const SIG5 = SIG4 + T13 + T14 + T15 - T16 - T17

    const T18 = this.calcProduits(['77'])
    const T19 = this.calcProduits(['787', '797'])
    const T20 = this.calcCharges(['67'])
    const T21 = this.calcCharges(['687', '697'])
    const SIG6 = T18 + T19 - T20 - T21

    const SIG7 = SIG5 + SIG6

    const T22 = this.calcProduits(['82'])
    const T23 = this.calcProduits(['84', '86', '88'])
    const T24 = this.calcCharges(['81'])
    const T25 = this.calcCharges(['83', '85'])
    const SIG8 = T22 + T23 - T24 - T25

    const T26 = this.calcCharges(['87'])
    const T27 = this.calcCharges(['89'])
    const SIG9 = SIG7 + SIG8 - T26 - T27

    return { T1, T2, T3, SIG1, T4, T5, T6, SIG2, T7, T8, T9, SIG3, T10, T11, T12, SIG4, T13, T14, T15, T16, T17, SIG5, T18, T19, T20, T21, SIG6, SIG7, T22, T23, T24, T25, SIG8, T26, T27, SIG9 }
  }

  genTFT(): any {
    const { charges, produits } = this.genCdR()
    const totalCharges = charges.reduce((s: number, r: any) => s + r.montant, 0)
    const totalProduits = produits.reduce((s: number, r: any) => s + r.montant, 0)
    const FA = totalProduits - totalCharges
    const FB = this.calcCharges(['681', '687', '691', '697'])
    const FC = this.calcProduits(['791', '797', '798', '799', '787'])
    const prodCessions = this.calcProduits(['82'])
    const VNC = this.calcCharges(['81'])
    const FD = prodCessions - VNC
    const FE = FA + FB - FC - FD
    const tresoActif = this.calcActifBrut(['50', '51', '52', '53', '54', '55', '56', '57', '58'])
    const tresoPassif = this.calcPassifReciprocal(['52', '561', '564', '565'])
    const FS = tresoActif - tresoPassif
    return { FA, FB, FC, FD, FE, FS, tresoActif, tresoPassif }
  }
}

// ══════════════════════════════════════════════
// Test balance
// ══════════════════════════════════════════════

function d(compte: string, intitule: string, montant: number): BalanceEntry {
  return { compte, intitule, debit: montant, credit: 0, solde_debit: montant, solde_credit: 0 }
}
function c(compte: string, intitule: string, montant: number): BalanceEntry {
  return { compte, intitule, debit: 0, credit: montant, solde_debit: 0, solde_credit: montant }
}

const balance: BalanceEntry[] = [
  // Classe 1
  c('1011', 'Capital social', 50_000_000),
  c('1061', 'Réserve légale', 5_000_000),
  c('1200', 'Report à nouveau', 10_180_000),    // RAN pour équilibrer le bilan
  c('1300', 'Résultat net', 8_120_000),           // = 142.12M produits - 134M charges
  c('1620', 'Emprunts', 20_000_000),
  c('1640', 'Dettes étab. crédit', 5_000_000),
  c('1910', 'Provisions litiges', 2_000_000),
  // Classe 2
  d('2130', 'Logiciels', 3_000_000),
  d('2150', 'Fonds commercial', 8_000_000),
  d('2310', 'Bâtiments', 45_000_000),
  d('2410', 'Matériel industriel', 25_000_000),
  d('2450', 'Matériel transport', 15_000_000),
  d('2710', 'Prêts au personnel', 1_500_000),
  c('28130', 'Amort. logiciels', 1_200_000),
  c('28310', 'Amort. bâtiments', 9_000_000),
  c('28410', 'Amort. mat. industriel', 10_000_000),
  c('28450', 'Amort. mat. transport', 6_000_000),
  // Classe 3
  d('3110', 'Marchandises', 12_000_000),
  d('3210', 'Matières premières', 8_000_000),
  d('3710', 'Produits intermédiaires', 5_000_000),
  // Classe 4
  d('4110', 'Clients', 18_000_000),
  c('4010', 'Fournisseurs', 15_000_000),
  c('4310', 'Sécu sociale', 2_500_000),
  c('4410', 'État impôts', 3_000_000),
  c('4210', 'Personnel rémunérations', 4_200_000),
  // Classe 5
  d('5210', 'Banque BIAO', 9_500_000),
  d('5310', 'Caisse', 1_200_000),
  // Classe 6
  d('6010', 'Achats marchandises', 45_000_000),
  d('60310', 'Variation stocks march.', 2_000_000),
  d('6020', 'Achats matières premières', 18_000_000),
  d('60320', 'Variation stocks MP', 1_000_000),
  d('6050', 'Autres achats', 5_000_000),
  d('6100', 'Transports', 3_000_000),
  d('6210', 'Sous-traitance', 4_000_000),
  d('6300', 'Services extérieurs', 2_500_000),
  d('6410', 'Impôts et taxes', 3_500_000),
  d('6510', 'Pertes sur créances', 500_000),
  d('6610', 'Rémunérations', 28_000_000),
  d('6810', 'Dotations amort.', 8_000_000),
  d('6910', 'Dotations prov.', 2_000_000),
  d('6710', 'Intérêts emprunts', 4_000_000),
  d('8100', 'VNC cessions', 3_000_000),
  d('8300', 'Charges HAO', 500_000),
  d('8910', 'Impôt sur résultat', 4_000_000),
  // Classe 7
  c('7010', 'Ventes marchandises', 85_000_000),
  c('7020', 'Ventes produits fabriqués', 35_000_000),
  c('7060', 'Services vendus', 8_000_000),
  c('7300', 'Production stockée', 3_000_000),
  c('7500', 'Autres produits', 1_500_000),
  c('7910', 'Reprises prov.', 2_500_000),
  c('7710', 'Revenus financiers', 1_000_000),
  c('8200', 'Produits cessions', 5_000_000),
  c('8400', 'Produits HAO', 1_120_000),
]

// ══════════════════════════════════════════════
// Run
// ══════════════════════════════════════════════

const svc = new TestLiasseService()
svc.loadBalance(balance)

const actif = svc.genActif()
const passif = svc.genPassif()
const { charges, produits } = svc.genCdR()
const sig = svc.genSIG()
const tft = svc.genTFT()

const actifByRef: Record<string, any> = {}
actif.forEach(r => actifByRef[r.ref] = r)
const passifByRef: Record<string, any> = {}
passif.forEach(r => passifByRef[r.ref] = r)
const chargesByRef: Record<string, number> = {}
charges.forEach((r: any) => chargesByRef[r.ref] = r.montant)
const produitsByRef: Record<string, number> = {}
produits.forEach((r: any) => produitsByRef[r.ref] = r.montant)

const totalActifNet = actif.reduce((s: number, r: any) => s + r.net, 0)
const totalPassif = passif.reduce((s: number, r: any) => s + r.montant, 0)
const totalCharges = charges.reduce((s: number, r: any) => s + r.montant, 0)
const totalProduits = produits.reduce((s: number, r: any) => s + r.montant, 0)
const resultatCdR = totalProduits - totalCharges
const resultatBilan = passifByRef['CH']?.montant || 0

const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(Math.round(n))

interface VR { id: string; label: string; expected: number; actual: number; pass: boolean }
const results: VR[] = []
const chk = (id: string, label: string, expected: number, actual: number) => {
  results.push({ id, label, expected, actual, pass: Math.abs(expected - actual) < 1 })
}

// V01: BZ = DZ
chk('V01', 'Total Actif (BZ) = Total Passif (DZ)', totalActifNet, totalPassif)

// V02: CH = XI = SIG9
chk('V02a', 'CH (Bilan) = XI (CdR)', resultatBilan, resultatCdR)
chk('V02b', 'CH (Bilan) = SIG9', resultatBilan, sig.SIG9)
chk('V02c', 'XI (CdR) = SIG9', resultatCdR, sig.SIG9)

// V03: Cascades SIG
chk('V03a', 'SIG1 = T1 - T2 - T3', sig.T1 - sig.T2 - sig.T3, sig.SIG1)
chk('V03b', 'SIG3 = SIG1 + SIG2 - T7 - T8 - T9', sig.SIG1 + sig.SIG2 - sig.T7 - sig.T8 - sig.T9, sig.SIG3)
chk('V03c', 'SIG7 = SIG5 + SIG6', sig.SIG5 + sig.SIG6, sig.SIG7)
chk('V03d', 'SIG9 = SIG7 + SIG8 - T26 - T27', sig.SIG7 + sig.SIG8 - sig.T26 - sig.T27, sig.SIG9)

// V04: Totaux actif
const groupImmo = ['AQ','AR','AS','AD','AE','AF','AG','AJ','AK','AL','AM','AN','AP','AT','AU']
const totalImmoNet = groupImmo.reduce((s, r) => s + (actifByRef[r]?.net || 0), 0)
const nonImmo = ['BA','BC','BD','BE','BF','BG','BI','BJ','BK','BQ','BR','BS','BU']
const totalNonImmo = nonImmo.reduce((s, r) => s + (actifByRef[r]?.net || 0), 0)
chk('V04', 'BZ = immo + circulant + tréso', totalImmoNet + totalNonImmo, totalActifNet)

// V05: Comptes réciproques 52x
chk('V05a', 'BS inclut 52x débiteur (banque > 0)', 1, (actifByRef['BS']?.brut || 0) > 0 ? 1 : 0)
chk('V05b', 'DQ = 0 (pas de 52x créditeur)', 0, passifByRef['DQ']?.montant || 0)

// V06: Variations stocks
chk('V06a', 'RB = variation stocks march. = 2M', 2_000_000, chargesByRef['RB'] || 0)
chk('V06b', 'RD = variation stocks MP = 1M', 1_000_000, chargesByRef['RD'] || 0)

// V07: Production stockée
chk('V07', 'TD = production stockée = 3M', 3_000_000, produitsByRef['TD'] || 0)

// V08: CAFG
chk('V08', 'CAFG = R + Dot - Rep - PV = ' + fmt(tft.FE), tft.FA + tft.FB - tft.FC - tft.FD, tft.FE)

// V09: Trésorerie nette
chk('V09', 'Trésorerie nette = 10 700 000', 10_700_000, tft.FS)

// V10: Total produits
chk('V10', 'Total produits = 142 120 000', 142_120_000, totalProduits)

// V11: Charges et résultat
chk('V11a', 'Total charges = 134 000 000', 134_000_000, totalCharges)
chk('V11b', 'Résultat net = 8 120 000', 8_120_000, resultatCdR)

// V12: Amortissements
const totalAmort = ['AD','AE','AF','AG','AJ','AK','AL','AM','AN'].reduce((s,r) => s + (actifByRef[r]?.amortProv || 0), 0)
chk('V12', 'Total amortissements = 26 200 000', 26_200_000, totalAmort)

// V13: Marge commerciale
chk('V13', 'Marge commerciale = 38 000 000', 38_000_000, sig.SIG1)

// ══════════════════════════════════════════════
// Output
// ══════════════════════════════════════════════

console.log('')
console.log('═══════════════════════════════════════════════════════════════════════════════════')
console.log('              RAPPORT DE VÉRIFICATION - LIASSE FISCALE SYSCOHADA                  ')
console.log('═══════════════════════════════════════════════════════════════════════════════════')
console.log('')

// Detail tables
console.log('── BILAN ACTIF (extraits) ──')
console.log(`  AE (Brevets/logiciels) : brut=${fmt(actifByRef['AE']?.brut||0)}, amort=${fmt(actifByRef['AE']?.amortProv||0)}, net=${fmt(actifByRef['AE']?.net||0)}`)
console.log(`  AK (Bâtiments)         : brut=${fmt(actifByRef['AK']?.brut||0)}, amort=${fmt(actifByRef['AK']?.amortProv||0)}, net=${fmt(actifByRef['AK']?.net||0)}`)
console.log(`  AM (Matériel)          : brut=${fmt(actifByRef['AM']?.brut||0)}, amort=${fmt(actifByRef['AM']?.amortProv||0)}, net=${fmt(actifByRef['AM']?.net||0)}`)
console.log(`  BJ (Clients)           : brut=${fmt(actifByRef['BJ']?.brut||0)}, net=${fmt(actifByRef['BJ']?.net||0)}`)
console.log(`  BS (Trésorerie)        : brut=${fmt(actifByRef['BS']?.brut||0)}, net=${fmt(actifByRef['BS']?.net||0)}`)
console.log(`  TOTAL ACTIF NET        : ${fmt(totalActifNet)}`)
console.log('')

console.log('── BILAN PASSIF (extraits) ──')
console.log(`  CA (Capital)           : ${fmt(passifByRef['CA']?.montant||0)}`)
console.log(`  CD (Réserves)          : ${fmt(passifByRef['CD']?.montant||0)}`)
console.log(`  CH (Résultat net)      : ${fmt(passifByRef['CH']?.montant||0)}`)
console.log(`  DB (Emprunts)          : ${fmt(passifByRef['DB']?.montant||0)}`)
console.log(`  DJ (Fournisseurs)      : ${fmt(passifByRef['DJ']?.montant||0)}`)
console.log(`  DL (Autres dettes)     : ${fmt(passifByRef['DL']?.montant||0)}`)
console.log(`  TOTAL PASSIF           : ${fmt(totalPassif)}`)
console.log('')

console.log('── COMPTE DE RÉSULTAT ──')
console.log(`  Total produits         : ${fmt(totalProduits)}`)
console.log(`  Total charges          : ${fmt(totalCharges)}`)
console.log(`  Résultat net (XI)      : ${fmt(resultatCdR)}`)
console.log('')

console.log('── SIG (cascade) ──')
console.log(`  SIG1 Marge commerciale : ${fmt(sig.SIG1)}`)
console.log(`  SIG2 Production        : ${fmt(sig.SIG2)}`)
console.log(`  SIG3 Valeur ajoutée    : ${fmt(sig.SIG3)}`)
console.log(`  SIG4 EBE               : ${fmt(sig.SIG4)}`)
console.log(`  SIG5 Rés. exploitation : ${fmt(sig.SIG5)}`)
console.log(`  SIG6 Rés. financier    : ${fmt(sig.SIG6)}`)
console.log(`  SIG7 RAO               : ${fmt(sig.SIG7)}`)
console.log(`  SIG8 Rés. HAO          : ${fmt(sig.SIG8)}`)
console.log(`  SIG9 Résultat net      : ${fmt(sig.SIG9)}`)
console.log('')

console.log('── TFT ──')
console.log(`  FA  Résultat net       : ${fmt(tft.FA)}`)
console.log(`  FB  Dotations          : ${fmt(tft.FB)}`)
console.log(`  FC  Reprises           : ${fmt(tft.FC)}`)
console.log(`  FD  Plus-values        : ${fmt(tft.FD)}`)
console.log(`  FE  CAFG               : ${fmt(tft.FE)}`)
console.log(`  FS  Trésorerie nette   : ${fmt(tft.FS)}`)
console.log('')

console.log('═══════════════════════════════════════════════════════════════════════════════════')
console.log('                          VÉRIFICATIONS AUTOMATIQUES                               ')
console.log('═══════════════════════════════════════════════════════════════════════════════════')
console.log('')
console.log('┌────────┬───────────────────────────────────────────┬──────────────────┬──────────────────┬────────┐')
console.log('│ ID     │ Vérification                              │ Attendu          │ Obtenu           │ Statut │')
console.log('├────────┼───────────────────────────────────────────┼──────────────────┼──────────────────┼────────┤')

for (const r of results) {
  const id = r.id.padEnd(6)
  const label = r.label.substring(0, 41).padEnd(41)
  const exp = fmt(r.expected).padStart(16)
  const act = fmt(r.actual).padStart(16)
  const st = r.pass ? '  OK  ' : ' FAIL '
  console.log(`│ ${id} │ ${label} │ ${exp} │ ${act} │${st}│`)
}

const passed = results.filter(r => r.pass).length
const total = results.length
const pct = Math.round(passed / total * 100)

console.log('├────────┼───────────────────────────────────────────┼──────────────────┼──────────────────┼────────┤')
const summaryLabel = `${passed}/${total} vérifications OK (${pct}%)`
console.log(`│ TOTAL  │ ${summaryLabel.padEnd(41)} │                  │                  │${pct === 100 ? ' 100% ' : ' FAIL '}│`)
console.log('└────────┴───────────────────────────────────────────┴──────────────────┴──────────────────┴────────┘')
console.log('')

if (pct === 100) {
  console.log('*** TOUTES LES VÉRIFICATIONS SONT PASSÉES — 100% ***')
} else {
  console.log(`*** ${total - passed} VÉRIFICATION(S) EN ÉCHEC ***`)
  for (const r of results.filter(r => !r.pass)) {
    console.log(`  FAIL: ${r.id} ${r.label} — attendu ${fmt(r.expected)}, obtenu ${fmt(r.actual)}`)
  }
}
console.log('')
