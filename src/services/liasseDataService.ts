/**
 * Service de gestion des données de la Liasse Fiscale
 * Mapping automatique entre la balance validée et les états financiers
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
 * Classe de mapping SYSCOHADA
 * Définit la correspondance entre les comptes de la balance et les postes du bilan
 */
export const SYSCOHADA_MAPPING = {
  // ACTIF IMMOBILISÉ
  actif: {
    // Charges immobilisées
    AQ: { // Frais d'établissement
      comptes: ['201'],
      amortComptes: ['2801', '2901']
    },
    AR: { // Charges à répartir
      comptes: ['202'],
      amortComptes: ['2802', '2902']
    },
    AS: { // Primes de remboursement
      comptes: ['206'],
      amortComptes: ['2806', '2906']
    },
    
    // Immobilisations incorporelles
    AD: { // Frais de recherche et développement
      comptes: ['211', '212'],
      amortComptes: ['2811', '2812', '2911', '2912']
    },
    AE: { // Brevets, licences, logiciels
      comptes: ['213', '214', '215'],
      amortComptes: ['2813', '2814', '2815', '2913', '2914', '2915']
    },
    AF: { // Fonds commercial et droit au bail
      comptes: ['216', '217'],
      amortComptes: ['2816', '2817', '2916', '2917']
    },
    AG: { // Autres immobilisations incorporelles
      comptes: ['218', '219'],
      amortComptes: ['2818', '2819', '2918', '2919']
    },
    
    // Immobilisations corporelles
    AJ: { // Terrains
      comptes: ['22'],
      amortComptes: ['282', '292']
    },
    AK: { // Bâtiments
      comptes: ['231', '232', '233', '234'],
      amortComptes: ['2831', '2832', '2833', '2834', '2931', '2932', '2933', '2934']
    },
    AL: { // Installations et agencements
      comptes: ['235', '237', '238'],
      amortComptes: ['2835', '2837', '2838', '2935', '2937', '2938']
    },
    AM: { // Matériel
      comptes: ['241', '242', '243', '244'],
      amortComptes: ['2841', '2842', '2843', '2844', '2941', '2942', '2943', '2944']
    },
    AN: { // Matériel de transport
      comptes: ['245'],
      amortComptes: ['2845', '2945']
    },
    
    // Avances et acomptes
    AP: { // Avances et acomptes sur immobilisations
      comptes: ['251', '252'],
      amortComptes: []
    },
    
    // Immobilisations financières
    AT: { // Titres de participation
      comptes: ['26'],
      amortComptes: ['296']
    },
    AU: { // Autres immobilisations financières
      comptes: ['271', '272', '273', '274', '275', '276', '277'],
      amortComptes: ['297']
    },
    
    // ACTIF CIRCULANT
    BA: { // Actif circulant HAO
      comptes: ['481', '482', '483', '484', '485', '486', '487', '488'],
      amortComptes: ['498']
    },
    
    // Stocks
    BC: { // Marchandises
      comptes: ['31'],
      amortComptes: ['391']
    },
    BD: { // Matières premières
      comptes: ['32'],
      amortComptes: ['392']
    },
    BE: { // Autres approvisionnements
      comptes: ['33'],
      amortComptes: ['393']
    },
    BF: { // Encours
      comptes: ['34', '35'],
      amortComptes: ['394', '395']
    },
    BG: { // Produits fabriqués
      comptes: ['36', '37'],
      amortComptes: ['396', '397']
    },
    
    // Créances
    BI: { // Fournisseurs avances
      comptes: ['409'],
      amortComptes: ['490']
    },
    BJ: { // Clients
      comptes: ['411', '412', '413', '414', '415', '416', '418'],
      amortComptes: ['491']
    },
    BK: { // Autres créances
      comptes: ['421', '422', '423', '424', '425', '426', '427', '428', '43', '44', '45', '46', '47'],
      amortComptes: ['492', '493', '494', '495', '496', '497']
    },
    
    // TRÉSORERIE ACTIF
    BQ: { // Titres de placement
      comptes: ['50'],
      amortComptes: ['590']
    },
    BR: { // Valeurs à encaisser
      comptes: ['51'],
      amortComptes: ['591']
    },
    BS: { // Banques, caisse
      comptes: ['52', '53', '54', '55', '56', '57', '58'],
      amortComptes: ['592', '593', '594']
    },
    
    // Écart de conversion
    BU: { // Écart de conversion actif
      comptes: ['478'],
      amortComptes: []
    }
  },
  
  // PASSIF
  passif: {
    // Capitaux propres
    CA: { // Capital
      comptes: ['101', '102', '103', '104', '105']
    },
    CB: { // Actionnaires non libéré
      comptes: ['109']
    },
    CC: { // Primes et réserves
      comptes: ['11']
    },
    CD: { // Écarts de réévaluation
      comptes: ['106']
    },
    CE: { // Résultat net
      comptes: ['13']
    },
    CF: { // Autres capitaux propres
      comptes: ['14']
    },
    CG: { // Report à nouveau
      comptes: ['12']
    },
    
    // Dettes financières
    DA: { // Emprunts
      comptes: ['161', '162', '163', '164', '165']
    },
    DB: { // Dettes de crédit-bail
      comptes: ['167']
    },
    DC: { // Dettes financières diverses
      comptes: ['166', '168', '181', '182', '183', '184']
    },
    
    // Passif circulant
    DH: { // Dettes circulantes HAO
      comptes: ['481', '482', '483', '484']
    },
    DI: { // Clients avances
      comptes: ['419']
    },
    DJ: { // Fournisseurs
      comptes: ['401', '402', '403', '404', '405', '408']
    },
    DK: { // Dettes fiscales
      comptes: ['441', '442', '443', '444', '445', '446', '447', '448', '449']
    },
    DL: { // Dettes sociales
      comptes: ['421', '422', '423', '424', '425', '426', '427', '428']
    },
    DM: { // Autres dettes
      comptes: ['165', '166', '167', '168', '185', '186', '187', '188']
    },
    DN: { // Risques provisionnés
      comptes: ['499']
    },
    
    // Trésorerie passif
    DQ: { // Banques découverts
      comptes: ['52']
    },
    
    // Écart de conversion
    DZ: { // Écart de conversion passif
      comptes: ['479']
    }
  },
  
  // COMPTE DE RÉSULTAT - CHARGES
  charges: {
    // Activité d'exploitation
    RA: { // Achats de marchandises
      comptes: ['601']
    },
    RB: { // Variation de stocks marchandises
      comptes: ['6031']
    },
    RC: { // Achats de matières premières
      comptes: ['602']
    },
    RD: { // Variation stocks matières
      comptes: ['6032']
    },
    RE: { // Autres achats
      comptes: ['604', '605', '608']
    },
    RF: { // Variation autres stocks
      comptes: ['6033']
    },
    RG: { // Transports
      comptes: ['61']
    },
    RH: { // Services extérieurs
      comptes: ['62', '63']
    },
    RI: { // Impôts et taxes
      comptes: ['64']
    },
    RJ: { // Autres charges
      comptes: ['65']
    },
    RK: { // Charges de personnel
      comptes: ['66']
    },
    RL: { // Dotations aux amortissements
      comptes: ['681', '682']
    },
    RM: { // Dotations aux provisions
      comptes: ['691', '697']
    },
    
    // Activité financière
    RN: { // Frais financiers
      comptes: ['67']
    },
    RO: { // Pertes de change
      comptes: ['676']
    },
    RP: { // Dotations financières
      comptes: ['687', '697']
    },
    
    // HAO
    RQ: { // Charges HAO
      comptes: ['81', '82', '83', '84', '85']
    },
    
    // Impôt
    RS: { // Impôt sur le résultat
      comptes: ['89']
    }
  },
  
  // COMPTE DE RÉSULTAT - PRODUITS
  produits: {
    // Activité d'exploitation
    TA: { // Ventes de marchandises
      comptes: ['701']
    },
    TB: { // Ventes de produits fabriqués
      comptes: ['702', '703', '704', '705']
    },
    TC: { // Travaux, services vendus
      comptes: ['706']
    },
    TD: { // Production stockée
      comptes: ['73']
    },
    TE: { // Production immobilisée
      comptes: ['72']
    },
    TF: { // Produits accessoires
      comptes: ['707']
    },
    TG: { // Subventions d'exploitation
      comptes: ['71']
    },
    TH: { // Autres produits
      comptes: ['75']
    },
    TI: { // Transferts de charges
      comptes: ['78']
    },
    TJ: { // Reprises de provisions
      comptes: ['791', '797', '798']
    },
    
    // Activité financière
    TK: { // Revenus financiers
      comptes: ['77']
    },
    TL: { // Gains de change
      comptes: ['776']
    },
    TM: { // Reprises financières
      comptes: ['787', '797']
    },
    
    // HAO
    TN: { // Produits HAO
      comptes: ['82', '84', '86', '88']
    }
  }
}

/**
 * Service principal de la liasse fiscale
 */
export class LiasseDataService {
  private balance: BalanceEntry[] = []
  private mappingCache: Map<string, number> = new Map()

  /**
   * Charge la balance validée
   */
  loadBalance(balance: BalanceEntry[]) {
    this.balance = balance
    this.buildMappingCache()
  }

  /**
   * Construit un cache pour accélérer les recherches
   */
  private buildMappingCache() {
    this.mappingCache.clear()
    this.balance.forEach(entry => {
      const compte = entry.compte.replace(/\s/g, '')
      this.mappingCache.set(compte, entry.solde_debit - entry.solde_credit)
    })
  }

  /**
   * Calcule la valeur brute d'un poste
   */
  private calculateBrut(comptes: string[]): number {
    let total = 0
    comptes.forEach(compte => {
      // Recherche exacte et par préfixe
      this.mappingCache.forEach((value, key) => {
        if (key === compte || key.startsWith(compte)) {
          total += Math.abs(value)
        }
      })
    })
    return total
  }

  /**
   * Calcule les amortissements/provisions d'un poste
   */
  private calculateAmortProv(amortComptes: string[]): number {
    let total = 0
    amortComptes.forEach(compte => {
      this.mappingCache.forEach((value, key) => {
        if (key === compte || key.startsWith(compte)) {
          total += Math.abs(value)
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
    
    // Parcourir tous les postes de l'actif
    Object.entries(SYSCOHADA_MAPPING.actif).forEach(([ref, mapping]) => {
      const brut = this.calculateBrut(mapping.comptes)
      const amortProv = this.calculateAmortProv(mapping.amortComptes || [])
      const net = brut - amortProv
      
      rows.push({
        ref,
        brut,
        amortProv,
        net,
        net_n1: 0 // À récupérer depuis l'exercice précédent
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
      const montant = this.calculateBrut(mapping.comptes)
      
      rows.push({
        ref,
        montant,
        montant_n1: 0 // À récupérer depuis l'exercice précédent
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
    
    // Charges
    Object.entries(SYSCOHADA_MAPPING.charges).forEach(([ref, mapping]) => {
      const montant = this.calculateBrut(mapping.comptes)
      charges.push({
        ref,
        montant,
        montant_n1: 0
      })
    })
    
    // Produits
    Object.entries(SYSCOHADA_MAPPING.produits).forEach(([ref, mapping]) => {
      const montant = this.calculateBrut(mapping.comptes)
      produits.push({
        ref,
        montant,
        montant_n1: 0
      })
    })
    
    return { charges, produits }
  }

  /**
   * Valide la cohérence des données
   */
  validateCoherence(): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    // Vérifier l'équilibre du bilan
    const totalActif = this.calculateTotalActif()
    const totalPassif = this.calculateTotalPassif()
    
    if (Math.abs(totalActif - totalPassif) > 0.01) {
      errors.push(`Le bilan n'est pas équilibré: Actif=${totalActif}, Passif=${totalPassif}`)
    }
    
    // Vérifier la cohérence du résultat
    const resultatBilan = this.getResultatFromBilan()
    const resultatCompte = this.getResultatFromCompteResultat()
    
    if (Math.abs(resultatBilan - resultatCompte) > 0.01) {
      errors.push(`Incohérence du résultat: Bilan=${resultatBilan}, Compte=${resultatCompte}`)
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
    // Récupérer le résultat depuis le poste CE du passif
    const resultat = this.calculateBrut(SYSCOHADA_MAPPING.passif.CE.comptes)
    return resultat
  }

  private getResultatFromCompteResultat(): number {
    const { charges, produits } = this.generateCompteResultat()
    const totalCharges = charges.reduce((sum: number, row: any) => sum + row.montant, 0)
    const totalProduits = produits.reduce((sum: number, row: any) => sum + row.montant, 0)
    return totalProduits - totalCharges
  }
}

// Instance singleton du service
export const liasseDataService = new LiasseDataService()