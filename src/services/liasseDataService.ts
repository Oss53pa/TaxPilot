/**
 * Service de gestion des données de la Liasse Fiscale
 * Mapping automatique entre la balance validée et les états financiers SYSCOHADA
 */

export interface BalanceEntry {
  compte: string
  intitule: string
  debit: number
  credit: number
  solde_debit: number
  solde_credit: number
}

export interface LiasseData {
  exercice: string
  entreprise: any
  balance: BalanceEntry[]
  etats: {
    actif: any
    passif: any
    resultat: any
    tft: any
  }
  notes: any[]
}

/**
 * Normalise une entrée de balance brute (tout format) vers BalanceEntry
 * Gère les montants négatifs en débit/crédit (extournes, corrections)
 */
function normalizeEntry(raw: any): BalanceEntry {
  const compte = (raw.compte || raw.numero_compte || '').toString().replace(/\s/g, '')
  let debit = Number(raw.debit) || 0
  let credit = Number(raw.credit) || 0

  // Gestion des montants négatifs (MA-003)
  // Un débit négatif = un crédit, un crédit négatif = un débit
  if (debit < 0) {
    credit += Math.abs(debit)
    debit = 0
  }
  if (credit < 0) {
    debit += Math.abs(credit)
    credit = 0
  }

  let solde_debit = Number(raw.solde_debit || raw.solde_debiteur) || 0
  let solde_credit = Number(raw.solde_credit || raw.solde_crediteur) || 0

  // Normaliser aussi les soldes négatifs
  if (solde_debit < 0) {
    solde_credit += Math.abs(solde_debit)
    solde_debit = 0
  }
  if (solde_credit < 0) {
    solde_debit += Math.abs(solde_credit)
    solde_credit = 0
  }

  // Si les soldes sont nuls, dériver du champ 'solde' ou debit/credit
  if (solde_debit === 0 && solde_credit === 0) {
    const solde = Number(raw.solde)
    if (!isNaN(solde) && solde !== 0) {
      if (solde > 0) solde_debit = solde
      else solde_credit = Math.abs(solde)
    } else {
      const net = debit - credit
      if (net > 0) solde_debit = net
      else if (net < 0) solde_credit = Math.abs(net)
    }
  }

  return {
    compte,
    intitule: raw.intitule || raw.libelle || '',
    debit,
    credit,
    solde_debit,
    solde_credit,
  }
}

/**
 * Mapping SYSCOHADA Révisé
 * Correspondance comptes de la balance → postes des états financiers
 */
export const SYSCOHADA_MAPPING = {
  // ═══════════════════════════════════════════
  // BILAN ACTIF
  // ═══════════════════════════════════════════
  actif: {
    // Charges immobilisées
    AQ: { comptes: ['201'], amortComptes: ['2801', '2901'] },
    AR: { comptes: ['202'], amortComptes: ['2802', '2902'] },
    AS: { comptes: ['206'], amortComptes: ['2806', '2906'] },

    // Immobilisations incorporelles
    AD: { comptes: ['211', '212'], amortComptes: ['2811', '2812', '2911', '2912'] },
    AE: { comptes: ['213', '214', '215'], amortComptes: ['2813', '2814', '2815', '2913', '2914', '2915'] },
    AF: { comptes: ['216', '217'], amortComptes: ['2816', '2817', '2916', '2917'] },
    AG: { comptes: ['218', '219'], amortComptes: ['2818', '2819', '2918', '2919'] },

    // Immobilisations corporelles
    AJ: { comptes: ['22'], amortComptes: ['282', '292'] },
    AK: { comptes: ['231', '232', '233', '234'], amortComptes: ['2831', '2832', '2833', '2834', '2931', '2932', '2933', '2934'] },
    AL: { comptes: ['235', '237', '238'], amortComptes: ['2835', '2837', '2838', '2935', '2937', '2938'] },
    AM: { comptes: ['241', '242', '243', '244'], amortComptes: ['2841', '2842', '2843', '2844', '2941', '2942', '2943', '2944'] },
    AN: { comptes: ['245'], amortComptes: ['2845', '2945'] },

    // Avances et acomptes
    AP: { comptes: ['251', '252'], amortComptes: [] },

    // Immobilisations financières
    AT: { comptes: ['26'], amortComptes: ['296'] },
    AU: { comptes: ['271', '272', '273', '274', '275', '276', '277'], amortComptes: ['297'] },

    // ACTIF CIRCULANT
    BA: { comptes: ['481', '482', '483', '484', '485', '486', '487', '488'], amortComptes: ['498'] },

    // Stocks
    BC: { comptes: ['31'], amortComptes: ['391'] },
    BD: { comptes: ['32'], amortComptes: ['392'] },
    BE: { comptes: ['33'], amortComptes: ['393'] },
    BF: { comptes: ['34', '35'], amortComptes: ['394', '395'] },
    BG: { comptes: ['36', '37'], amortComptes: ['396', '397'] },

    // Créances
    BI: { comptes: ['409'], amortComptes: ['490'] },
    BJ: { comptes: ['411', '412', '413', '414', '415', '416', '418'], amortComptes: ['491'] },
    BK: { comptes: ['421', '422', '423', '424', '425', '426', '427', '428', '43', '44', '45', '46', '47'], amortComptes: ['492', '493', '494', '495', '496', '497'] },

    // TRÉSORERIE ACTIF
    BQ: { comptes: ['50'], amortComptes: ['590'] },
    BR: { comptes: ['51'], amortComptes: ['591'] },
    BS: { comptes: ['52', '53', '54', '55', '56', '57', '58'], amortComptes: ['592', '593', '594'] },

    // Écart de conversion
    BU: { comptes: ['478'], amortComptes: [] }
  },

  // ═══════════════════════════════════════════
  // BILAN PASSIF
  // ═══════════════════════════════════════════
  passif: {
    // Capitaux propres
    CA: { comptes: ['101', '102', '103', '104'] },
    CB: { comptes: ['109'] },
    CC: { comptes: ['105'] },
    CD: { comptes: ['106'] },
    CE: { comptes: ['111', '112', '113'] },
    CF: { comptes: ['118'] },
    CG: { comptes: ['12'] },
    CH: { comptes: ['13'] },
    CI: { comptes: ['14'] },
    CJ: { comptes: ['15'] },

    // Dettes financières et ressources assimilées
    DA: { comptes: ['161'] },
    DB: { comptes: ['162', '163'] },
    DC: { comptes: ['164'] },
    DD: { comptes: ['167'] },
    DE: { comptes: ['165', '166', '168', '18'] },
    DF: { comptes: ['19'] },

    // Passif circulant
    DH: { comptes: ['481', '482', '483', '484'] },
    DI: { comptes: ['419'] },
    DJ: { comptes: ['401', '402', '403', '404', '405', '408'] },
    DK: { comptes: ['43', '44'] },
    DL: { comptes: ['42'] },
    DM: { comptes: ['499'] },

    // Trésorerie passif
    DQ: { comptes: ['565'] },
    DR: { comptes: ['52'] },

    // Écart de conversion
    DT: { comptes: ['479'] }
  },

  // ═══════════════════════════════════════════
  // COMPTE DE RÉSULTAT - CHARGES
  // ═══════════════════════════════════════════
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
    RL: { comptes: ['681', '682'] },
    RM: { comptes: ['691', '697'] },
    RN: { comptes: ['67'] },
    RO: { comptes: ['676'] },
    RP: { comptes: ['687', '697'] },
    RQ: { comptes: ['81', '82', '83', '84', '85'] },
    RS: { comptes: ['89'] }
  },

  // ═══════════════════════════════════════════
  // COMPTE DE RÉSULTAT - PRODUITS
  // ═══════════════════════════════════════════
  produits: {
    TA: { comptes: ['701'] },
    TB: { comptes: ['702', '703', '704', '705'] },
    TC: { comptes: ['706'] },
    TD: { comptes: ['73'] },
    TE: { comptes: ['72'] },
    TF: { comptes: ['707'] },
    TG: { comptes: ['71'] },
    TH: { comptes: ['75'] },
    TI: { comptes: ['78'] },
    TJ: { comptes: ['791', '797', '798'] },
    TK: { comptes: ['77'] },
    TL: { comptes: ['776'] },
    TM: { comptes: ['787', '797'] },
    TN: { comptes: ['82', '84', '86', '88'] }
  }
}

/**
 * Service principal de la liasse fiscale
 * Calcul direction-aware : évite le double-comptage des comptes partagés actif/passif
 */
export class LiasseDataService {
  private balance: BalanceEntry[] = []
  // Cache signé : positif = solde débiteur, négatif = solde créditeur
  private mappingCache: Map<string, number> = new Map()

  /**
   * Charge la balance validée (accepte tout format d'entrée)
   */
  loadBalance(rawEntries: any[]) {
    this.balance = rawEntries.map(e => normalizeEntry(e))
    this.buildMappingCache()
  }

  /**
   * Construit le cache de mapping signé
   */
  private buildMappingCache() {
    this.mappingCache.clear()
    this.balance.forEach(entry => {
      const compte = entry.compte
      if (compte) {
        this.mappingCache.set(compte, entry.solde_debit - entry.solde_credit)
      }
    })
  }

  /**
   * Somme les soldes débiteurs (valeurs positives) des comptes correspondants
   * Utilisé pour : actif brut, charges
   */
  private sumDebit(comptes: string[]): number {
    let total = 0
    comptes.forEach(prefix => {
      this.mappingCache.forEach((value, key) => {
        if (key === prefix || key.startsWith(prefix)) {
          if (value > 0) total += value
        }
      })
    })
    return total
  }

  /**
   * Somme les soldes créditeurs (valeur absolue des négatifs) des comptes correspondants
   * Utilisé pour : amortissements, provisions, passif, produits
   */
  private sumCredit(comptes: string[]): number {
    let total = 0
    comptes.forEach(prefix => {
      this.mappingCache.forEach((value, key) => {
        if (key === prefix || key.startsWith(prefix)) {
          if (value < 0) total += Math.abs(value)
        }
      })
    })
    return total
  }

  /**
   * Génère les données du Bilan Actif
   */
  generateBilanActif(): any {
    const rows: any[] = []

    Object.entries(SYSCOHADA_MAPPING.actif).forEach(([ref, mapping]) => {
      const brut = this.sumDebit(mapping.comptes)
      const amortProv = this.sumCredit(mapping.amortComptes || [])
      const net = brut - amortProv

      rows.push({
        ref,
        brut,
        amortProv,
        net,
        net_n1: 0
      })
    })

    return rows
  }

  /**
   * Génère les données du Bilan Passif
   */
  generateBilanPassif(): any {
    const rows: any[] = []

    Object.entries(SYSCOHADA_MAPPING.passif).forEach(([ref, mapping]) => {
      let montant: number
      if (ref === 'CB') {
        // CB (Actionnaires non appelé) a un solde débiteur, le composant le soustrait
        montant = this.sumDebit(mapping.comptes)
      } else {
        montant = this.sumCredit(mapping.comptes)
      }

      rows.push({
        ref,
        montant,
        montant_n1: 0
      })
    })

    return rows
  }

  /**
   * Génère les données du Compte de Résultat
   */
  generateCompteResultat(): any {
    const charges: any[] = []
    const produits: any[] = []

    Object.entries(SYSCOHADA_MAPPING.charges).forEach(([ref, mapping]) => {
      const montant = this.sumDebit(mapping.comptes)
      charges.push({ ref, montant, montant_n1: 0 })
    })

    Object.entries(SYSCOHADA_MAPPING.produits).forEach(([ref, mapping]) => {
      const montant = this.sumCredit(mapping.comptes)
      produits.push({ ref, montant, montant_n1: 0 })
    })

    return { charges, produits }
  }

  /**
   * Valide la cohérence des données
   */
  validateCoherence(): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    const totalActif = this.calculateTotalActif()
    const totalPassif = this.calculateTotalPassif()

    if (Math.abs(totalActif - totalPassif) > 0.01) {
      errors.push(`Le bilan n'est pas équilibré: Actif=${totalActif.toLocaleString()}, Passif=${totalPassif.toLocaleString()}`)
    }

    const resultatBilan = this.getResultatFromBilan()
    const resultatCompte = this.getResultatFromCompteResultat()

    if (Math.abs(resultatBilan - resultatCompte) > 0.01) {
      errors.push(`Incohérence du résultat: Bilan=${resultatBilan.toLocaleString()}, Compte=${resultatCompte.toLocaleString()}`)
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  private calculateTotalActif(): number {
    const actifData = this.generateBilanActif()
    return actifData.reduce((sum: number, row: any) => sum + row.net, 0)
  }

  private calculateTotalPassif(): number {
    const passifData = this.generateBilanPassif()
    return passifData.reduce((sum: number, row: any) => sum + row.montant, 0)
  }

  private getResultatFromBilan(): number {
    return this.sumCredit(SYSCOHADA_MAPPING.passif.CH.comptes)
  }

  private getResultatFromCompteResultat(): number {
    const { charges, produits } = this.generateCompteResultat()
    const totalCharges = charges.reduce((sum: number, row: any) => sum + row.montant, 0)
    const totalProduits = produits.reduce((sum: number, row: any) => sum + row.montant, 0)
    return totalProduits - totalCharges
  }

  /**
   * Retourne les entrées de balance correspondant aux préfixes donnés
   */
  getAccountsByPrefix(prefixes: string[]): BalanceEntry[] {
    return this.balance.filter(entry =>
      prefixes.some(prefix => entry.compte === prefix || entry.compte.startsWith(prefix))
    )
  }

  /**
   * Retourne le solde net signé d'un ensemble de comptes
   * Positif = débiteur, Négatif = créditeur
   */
  getNetBalance(prefixes: string[]): number {
    let total = 0
    prefixes.forEach(prefix => {
      this.mappingCache.forEach((value, key) => {
        if (key === prefix || key.startsWith(prefix)) {
          total += value
        }
      })
    })
    return total
  }

  /**
   * Vérifie si la balance est chargée
   */
  isLoaded(): boolean {
    return this.balance.length > 0
  }

  /**
   * Retourne la balance brute
   */
  getBalance(): BalanceEntry[] {
    return this.balance
  }

  /**
   * Génère les données pour Note 14 - Emprunts et dettes financières
   * Comptes 16x
   */
  generateNote14(): any[] {
    const prefixes = ['161', '162', '163', '164', '165', '166', '167', '168', '169']
    const entries = this.getAccountsByPrefix(prefixes)
    return entries.map(e => ({
      compte: e.compte,
      intitule: e.intitule,
      solde: e.solde_credit - e.solde_debit,
      debit: e.debit,
      credit: e.credit,
    }))
  }

  /**
   * Génère les données pour Note 3A - Immobilisations brutes (mouvements)
   * Utilise les mouvements débit/crédit sur comptes 2x pour déduire acquisitions/cessions
   */
  generateNote3A(): { incorporelles: any[]; corporelles: any[]; financieres: any[]; avances: any[] } {
    const IMMOB_LABELS: Record<string, string> = {
      '201': 'Frais d\'établissement',
      '202': 'Charges à répartir',
      '206': 'Primes de remboursement des obligations',
      '211': 'Frais de recherche et développement',
      '212': 'Brevets, licences, concessions',
      '213': 'Logiciels',
      '214': 'Marques',
      '215': 'Fonds commercial',
      '216': 'Droit au bail',
      '217': 'Investissements de création',
      '218': 'Autres droits et valeurs incorporels',
      '219': 'Immobilisations incorporelles en cours',
      '22': 'Terrains',
      '231': 'Bâtiments industriels',
      '232': 'Bâtiments administratifs et commerciaux',
      '233': 'Ouvrages d\'infrastructure',
      '234': 'Installations techniques',
      '235': 'Aménagements de bureaux',
      '237': 'Bâtiments en cours',
      '238': 'Autres constructions',
      '241': 'Matériel industriel',
      '242': 'Matériel de transport',
      '243': 'Matériel de bureau et informatique',
      '244': 'Mobilier',
      '245': 'Matériel d\'emballage',
      '251': 'Avances et acomptes sur immobilisations incorporelles',
      '252': 'Avances et acomptes sur immobilisations corporelles',
      '26': 'Titres de participation',
      '271': 'Prêts et créances non courantes',
      '272': 'Prêts au personnel',
      '273': 'Créances sur l\'État',
      '274': 'Titres immobilisés',
      '275': 'Dépôts et cautionnements versés',
      '276': 'Intérêts courus',
      '277': 'Créances rattachées à des participations',
    }

    const mapLines = (prefixes: string[]) => {
      const lines: any[] = []
      prefixes.forEach(p => {
        const accounts = this.getAccountsByPrefix([p])
        if (accounts.length === 0) return
        const brut = accounts.reduce((s, a) => s + a.solde_debit, 0)
        const mvtDebit = accounts.reduce((s, a) => s + a.debit, 0)
        const mvtCredit = accounts.reduce((s, a) => s + a.credit, 0)
        if (brut === 0 && mvtDebit === 0 && mvtCredit === 0) return
        lines.push({
          rubrique: accounts[0]?.intitule || IMMOB_LABELS[p] || `Comptes ${p}x`,
          prefix: p,
          brutCloture: brut,
          acquisitions: mvtDebit,
          cessions: mvtCredit,
          // Without N-1 data: ouverture = clôture - acquisitions + cessions
          brutOuverture: brut - mvtDebit + mvtCredit,
          virements: 0,
          reevaluation: 0,
          virementsSortie: 0,
        })
      })
      return lines
    }

    return {
      incorporelles: mapLines(['211', '212', '213', '214', '215', '216', '217', '218', '219']),
      corporelles: mapLines(['22', '231', '232', '233', '234', '235', '237', '238', '241', '242', '243', '244', '245']),
      financieres: mapLines(['26', '271', '272', '273', '274', '275', '276', '277']),
      avances: mapLines(['251', '252']),
    }
  }

  /**
   * Génère les données pour Note 3C - Amortissements
   * Comptes 28x
   */
  generateNote3C(): any[] {
    const AMORT_MAP: Record<string, { label: string; prefixes: string[] }> = {
      'incorp': { label: 'Immobilisations incorporelles', prefixes: ['281'] },
      'terrains': { label: 'Terrains', prefixes: ['282'] },
      'batiments': { label: 'Bâtiments', prefixes: ['2831', '2832', '2833', '2838'] },
      'install': { label: 'Installations techniques', prefixes: ['2834'] },
      'mat_indus': { label: 'Matériel industriel', prefixes: ['2841'] },
      'mat_transp': { label: 'Matériel de transport', prefixes: ['2842'] },
      'mat_bureau': { label: 'Matériel bureau & informatique', prefixes: ['2843'] },
      'mobilier': { label: 'Mobilier', prefixes: ['2844'] },
      'autres': { label: 'Autres immobilisations', prefixes: ['2845', '285', '286', '287', '288'] },
    }

    const lines: any[] = []
    Object.entries(AMORT_MAP).forEach(([key, { label, prefixes }]) => {
      const accounts = this.getAccountsByPrefix(prefixes)
      if (accounts.length === 0) return
      const cumulCloture = accounts.reduce((s, a) => s + a.solde_credit, 0)
      const dotations = accounts.reduce((s, a) => s + a.credit, 0)
      const reprises = accounts.reduce((s, a) => s + a.debit, 0)
      if (cumulCloture === 0 && dotations === 0 && reprises === 0) return
      lines.push({
        rubrique: label,
        key,
        cumulOuverture: cumulCloture - dotations + reprises,
        dotations,
        reprises,
        virements: 0,
        cumulCloture,
      })
    })
    return lines
  }

  /**
   * Génère les données pour Note 3C BIS - Dépréciations
   * Comptes 29x
   */
  generateNote3CBis(): any[] {
    const DEPREC_MAP: Record<string, { label: string; prefixes: string[] }> = {
      'incorp': { label: 'Immobilisations incorporelles', prefixes: ['291'] },
      'terrains': { label: 'Terrains', prefixes: ['292'] },
      'corp': { label: 'Immobilisations corporelles', prefixes: ['293', '294'] },
      'financ': { label: 'Immobilisations financières', prefixes: ['296', '297'] },
    }

    const lines: any[] = []
    Object.entries(DEPREC_MAP).forEach(([key, { label, prefixes }]) => {
      const accounts = this.getAccountsByPrefix(prefixes)
      if (accounts.length === 0) return
      const cloture = accounts.reduce((s, a) => s + a.solde_credit, 0)
      const dotations = accounts.reduce((s, a) => s + a.credit, 0)
      const reprises = accounts.reduce((s, a) => s + a.debit, 0)
      if (cloture === 0 && dotations === 0 && reprises === 0) return
      lines.push({
        rubrique: label,
        key,
        ouverture: cloture - dotations + reprises,
        dotations,
        reprises,
        cloture,
      })
    })
    return lines
  }

  /**
   * Génère les données pour Note 8 - Stocks
   * Comptes 31-37 (brut), 39x (provisions)
   */
  generateNote8(): any[] {
    const STOCK_MAP: Record<string, { label: string; categorie: string; prefixes: string[]; provPrefixes: string[] }> = {
      'matieres': { label: 'Matières premières', categorie: 'matieres_premieres', prefixes: ['31'], provPrefixes: ['391'] },
      'autres_appro': { label: 'Autres approvisionnements', categorie: 'matieres_premieres', prefixes: ['32'], provPrefixes: ['392'] },
      'encours': { label: 'En-cours de production', categorie: 'produits_cours', prefixes: ['33', '34'], provPrefixes: ['393', '394'] },
      'produits_finis': { label: 'Produits finis', categorie: 'produits_finis', prefixes: ['35'], provPrefixes: ['395'] },
      'marchandises': { label: 'Marchandises', categorie: 'marchandises', prefixes: ['36', '37'], provPrefixes: ['396', '397'] },
    }

    const lines: any[] = []
    Object.entries(STOCK_MAP).forEach(([key, { label, categorie, prefixes, provPrefixes }]) => {
      const brut = this.sumDebit(prefixes)
      const provision = this.sumCredit(provPrefixes)
      if (brut === 0 && provision === 0) return
      lines.push({
        id: key,
        categorie,
        designation: label,
        valeurComptable: brut,
        provision,
        valeurNette: brut - provision,
      })
    })
    return lines
  }

  /**
   * Génère les données pour Note 11 - Capital social
   * Comptes 10x
   */
  generateNote11(): { capitalSocial: number; primes: number; ecartReevaluation: number; capitalNonAppele: number; reserves: number; reportNouveau: number; resultat: number } {
    return {
      capitalSocial: this.sumCredit(['101', '102', '103', '104']),
      capitalNonAppele: this.sumDebit(['109']),
      primes: this.sumCredit(['105']),
      ecartReevaluation: this.sumCredit(['106']),
      reserves: this.sumCredit(['111', '112', '113', '118']),
      reportNouveau: this.getNetBalance(['12']),
      resultat: this.getNetBalance(['13']),
    }
  }

  /**
   * Génère les données pour Note 17 - Chiffre d'affaires
   * Comptes 70x, 71, 72, 73
   */
  generateNote17(): any[] {
    const CA_MAP: Record<string, { label: string; prefixes: string[] }> = {
      'marchandises': { label: 'Ventes de marchandises', prefixes: ['701'] },
      'produits': { label: 'Ventes de produits fabriqués', prefixes: ['702', '703', '704', '705'] },
      'services': { label: 'Prestations de services', prefixes: ['706'] },
      'accessoires': { label: 'Produits accessoires', prefixes: ['707'] },
      'stockee': { label: 'Production stockée', prefixes: ['73'] },
      'immobilisee': { label: 'Production immobilisée', prefixes: ['72'] },
      'subventions': { label: 'Subventions d\'exploitation', prefixes: ['71'] },
    }

    const lines: any[] = []
    Object.entries(CA_MAP).forEach(([key, { label, prefixes }]) => {
      const montant = this.sumCredit(prefixes)
      if (montant === 0) return
      lines.push({
        id: key,
        activite: label,
        montantN: montant,
        montantN1: 0,
      })
    })
    return lines
  }

  /**
   * Génère les données pour Note 6 - Immobilisations corporelles (synthèse)
   * Comptes 22-245 (brut) et 28x (amort) agrégés par catégorie
   */
  generateNote6(): any[] {
    const CORP_MAP: Record<string, { label: string; brutPrefixes: string[]; amortPrefixes: string[] }> = {
      'terrains': { label: 'Terrains', brutPrefixes: ['22'], amortPrefixes: ['282'] },
      'constructions': { label: 'Constructions', brutPrefixes: ['231', '232', '233', '238'], amortPrefixes: ['2831', '2832', '2833', '2838'] },
      'installations': { label: 'Installations techniques', brutPrefixes: ['234'], amortPrefixes: ['2834'] },
      'materiel_outillage': { label: 'Matériel et outillage', brutPrefixes: ['241'], amortPrefixes: ['2841'] },
      'materiel_transport': { label: 'Matériel de transport', brutPrefixes: ['242'], amortPrefixes: ['2842'] },
      'materiel_bureau': { label: 'Matériel de bureau et informatique', brutPrefixes: ['243'], amortPrefixes: ['2843'] },
      'mobilier': { label: 'Mobilier', brutPrefixes: ['244'], amortPrefixes: ['2844'] },
      'autres': { label: 'Autres immobilisations corporelles', brutPrefixes: ['245', '235', '237'], amortPrefixes: ['2845', '2835', '2837'] },
    }

    const lines: any[] = []
    Object.entries(CORP_MAP).forEach(([key, { label, brutPrefixes, amortPrefixes }]) => {
      const brut = this.sumDebit(brutPrefixes)
      const amort = this.sumCredit(amortPrefixes)
      if (brut === 0 && amort === 0) return
      lines.push({
        id: key,
        categorie: key,
        label,
        valeurBrute: brut,
        amortissements: amort,
        valeurNette: brut - amort,
      })
    })
    return lines
  }

  /**
   * Génère les données pour Note 19 - Charges de personnel
   * Comptes 64x, 66x
   */
  generateNote19(): any[] {
    const CHARGES_MAP: Record<string, { label: string; prefixes: string[] }> = {
      'remunerations': { label: 'Rémunérations directes', prefixes: ['641'] },
      'primes': { label: 'Primes et gratifications', prefixes: ['642'] },
      'conges': { label: 'Indemnités et avantages divers', prefixes: ['643'] },
      'charges_sociales': { label: 'Charges sociales', prefixes: ['644', '645', '646'] },
      'impots_remun': { label: 'Impôts et taxes sur rémunérations', prefixes: ['647', '648'] },
      'personnel_ext': { label: 'Personnel extérieur', prefixes: ['637'] },
    }

    const lines: any[] = []
    Object.entries(CHARGES_MAP).forEach(([key, { label, prefixes }]) => {
      const montant = this.sumDebit(prefixes)
      if (montant === 0) return
      lines.push({
        id: key,
        designation: label,
        montantN: montant,
        montantN1: 0,
      })
    })
    return lines
  }
}

// Instance singleton du service
export const liasseDataService = new LiasseDataService()
