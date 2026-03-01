/**
 * Service de gestion des données de la Liasse Fiscale
 * Mapping automatique entre la balance validée et les états financiers
 * Supporte SN (Systeme Normal) et SMT (Systeme Minimal de Tresorerie)
 */

import { SMT_MAPPING, SMT_LIBELLES } from './liasseSMTMapping'
import type { TypeLiasse } from '../types'

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
 *
 * RÈGLE FONDAMENTALE:
 * - Actif & Charges: solde normal = DÉBITEUR (solde_debit - solde_credit > 0)
 * - Passif & Produits: solde normal = CRÉDITEUR (solde_credit - solde_debit > 0)
 * - Amort/Provisions (28x, 29x, 39x, 49x, 59x): solde normal = CRÉDITEUR
 * - Comptes réciproques (42x, 48x, 52x): ventilés selon sens du solde
 */
export const SYSCOHADA_MAPPING = {
  // ──────────────── ACTIF IMMOBILISÉ ────────────────
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
    BA: { comptes: ['485', '486', '487', '488'], amortComptes: ['498'] },

    // Stocks
    BC: { comptes: ['31'], amortComptes: ['391'] },
    BD: { comptes: ['32'], amortComptes: ['392'] },
    BE: { comptes: ['33'], amortComptes: ['393'] },
    BF: { comptes: ['34', '35'], amortComptes: ['394', '395'] },
    BG: { comptes: ['36', '37', '38'], amortComptes: ['396', '397', '398'] },

    // Créances
    BI: { comptes: ['409'], amortComptes: ['490'] },
    BJ: { comptes: ['411', '412', '413', '414', '415', '416', '418'], amortComptes: ['491'] },
    BK: { comptes: ['43', '44', '45', '46', '47'], amortComptes: ['492', '493', '494', '495', '496', '497'] },

    // TRÉSORERIE ACTIF
    BQ: { comptes: ['50'], amortComptes: ['590'] },
    BR: { comptes: ['51'], amortComptes: ['591'] },
    BS: { comptes: ['52', '53', '54', '55', '56', '57', '58'], amortComptes: ['592', '593', '594'] },

    // Écart de conversion actif
    BU: { comptes: ['478'], amortComptes: [] }
  },

  // ──────────────── PASSIF ────────────────
  passif: {
    // Capitaux propres
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

    // Dettes financières et ressources assimilées
    DA: { comptes: ['161'] },
    DB: { comptes: ['162', '163', '164'] },
    DC: { comptes: ['165', '166', '168'] },
    DD: { comptes: ['17'] },
    DE: { comptes: ['181', '182', '183', '184', '185', '186'] },
    DF: { comptes: ['19'] },

    // Passif circulant
    DH: { comptes: ['481', '482', '483', '484'] },
    DI: { comptes: ['419'] },
    DJ: { comptes: ['401', '402', '403', '404', '405', '408'] },
    DK: { comptes: ['431', '432', '433', '434', '435', '436', '437', '438', '439', '441', '442', '443', '444', '445', '446', '447', '448', '449'] },
    DL: { comptes: ['421', '422', '423', '424', '425', '426', '427', '428'] },
    DM: { comptes: ['499'] },

    // Trésorerie passif
    DQ: { comptes: ['52', '561', '564'] },
    DR: { comptes: ['565'] },

    // Écart de conversion passif
    DT: { comptes: ['479'] }
  },

  // ──────────────── CHARGES ────────────────
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

    // Activité financière
    RN: { comptes: ['671', '672', '673', '674', '675'] },
    RO: { comptes: ['676'] },
    RP: { comptes: ['679', '697'] },

    // HAO
    RQ: { comptes: ['81'] },
    RR: { comptes: ['83', '85'] },

    // Impôt
    RS: { comptes: ['89'] }
  },

  // ──────────────── PRODUITS ────────────────
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

    // Activité financière
    TJ: { comptes: ['771', '772', '773', '774', '775'] },
    TK: { comptes: ['776'] },
    TL: { comptes: ['787', '797'] },
    TM: { comptes: ['781', '782'] },

    // HAO
    TN: { comptes: ['82'] },
    TO: { comptes: ['84', '86', '88'] }
  }
}

/**
 * Service principal de la liasse fiscale
 */
export class LiasseDataService {
  private balance: BalanceEntry[] = []
  private balanceN1: BalanceEntry[] = []
  private mappingCache: Map<string, number> = new Map()
  private mappingCacheN1: Map<string, number> = new Map()

  /** Indicateur de disponibilité N-1 */
  get hasN1(): boolean {
    return this.balanceN1.length > 0
  }

  /**
   * Charge la balance validée (exercice N)
   */
  loadBalance(balance: BalanceEntry[]) {
    this.balance = balance
    this.buildMappingCache()
  }

  /**
   * Charge la balance de l'exercice précédent (N-1)
   */
  loadBalanceN1(balance: BalanceEntry[]) {
    this.balanceN1 = balance
    this.buildMappingCacheN1()
  }

  /**
   * Construit un cache : compte → solde signé (débit positif, crédit négatif)
   */
  private buildMappingCache() {
    this.mappingCache.clear()
    this.balance.forEach(entry => {
      const compte = entry.compte.replace(/\s/g, '')
      this.mappingCache.set(compte, entry.solde_debit - entry.solde_credit)
    })
  }

  private buildMappingCacheN1() {
    this.mappingCacheN1.clear()
    this.balanceN1.forEach(entry => {
      const compte = entry.compte.replace(/\s/g, '')
      this.mappingCacheN1.set(compte, entry.solde_debit - entry.solde_credit)
    })
  }

  // ────────── Méthodes de calcul signées ──────────

  /**
   * Somme les soldes des comptes correspondants (conserve le signe).
   * Pour un compte avec solde_debit > solde_credit → valeur positive.
   * Pour un compte avec solde_credit > solde_debit → valeur négative.
   */
  private sumSoldes(comptes: string[]): number {
    let total = 0
    comptes.forEach(prefix => {
      this.mappingCache.forEach((value, key) => {
        if (key === prefix || key.startsWith(prefix)) {
          total += value
        }
      })
    })
    return total
  }

  /**
   * Pour l'ACTIF: prend seulement les soldes débiteurs (positifs)
   * Les immobilisations sont normalement débitrices.
   */
  private calculateActifBrut(comptes: string[]): number {
    let total = 0
    comptes.forEach(prefix => {
      this.mappingCache.forEach((value, key) => {
        if (key === prefix || key.startsWith(prefix)) {
          // Actif: on prend le solde débiteur (positif)
          if (value > 0) total += value
        }
      })
    })
    return total
  }

  /**
   * Pour les AMORT/PROVISIONS (28x, 29x, 39x, 49x, 59x):
   * Solde normalement créditeur → valeur négative dans le cache → on prend |value|
   */
  private calculateAmortProv(amortComptes: string[]): number {
    let total = 0
    amortComptes.forEach(prefix => {
      this.mappingCache.forEach((value, key) => {
        if (key === prefix || key.startsWith(prefix)) {
          // Amort: solde normalement créditeur, donc valeur < 0 dans le cache
          total += Math.abs(value)
        }
      })
    })
    return total
  }

  /**
   * Pour le PASSIF: prend la valeur absolue des soldes créditeurs (négatifs dans le cache)
   */
  private calculatePassif(comptes: string[]): number {
    let total = 0
    comptes.forEach(prefix => {
      this.mappingCache.forEach((value, key) => {
        if (key === prefix || key.startsWith(prefix)) {
          // Passif: solde normalement créditeur → valeur < 0, on prend |value|
          if (value < 0) total += Math.abs(value)
        }
      })
    })
    return total
  }

  /**
   * Pour les CHARGES: prend les soldes débiteurs
   */
  private calculateCharges(comptes: string[]): number {
    let total = 0
    comptes.forEach(prefix => {
      this.mappingCache.forEach((value, key) => {
        if (key === prefix || key.startsWith(prefix)) {
          // Charges normalement débitrices
          if (value > 0) total += value
        }
      })
    })
    return total
  }

  /**
   * Pour les PRODUITS: prend les soldes créditeurs (valeur absolue)
   */
  private calculateProduits(comptes: string[]): number {
    let total = 0
    comptes.forEach(prefix => {
      this.mappingCache.forEach((value, key) => {
        if (key === prefix || key.startsWith(prefix)) {
          // Produits normalement créditeurs
          if (value < 0) total += Math.abs(value)
        }
      })
    })
    return total
  }

  /**
   * Pour les VARIATIONS DE STOCKS (peuvent être + ou -):
   * Renvoie le solde signé (positif = déstockage = charge, négatif = stockage)
   */
  private calculateVariation(comptes: string[]): number {
    return this.sumSoldes(comptes)
  }

  /**
   * Pour les comptes réciproques (42x, 48x, 52x) côté ACTIF:
   * Ne prend que les soldes débiteurs individuels
   */
  // @ts-expect-error kept for future use
  private calculateActifReciprocal(comptes: string[]): number {
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
   * Pour les comptes réciproques côté PASSIF:
   * Ne prend que les soldes créditeurs individuels
   */
  private calculatePassifReciprocal(comptes: string[]): number {
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

  // ────────── Méthodes N-1 (même logique, cache différent) ──────────

  private sumSoldesN1(comptes: string[]): number {
    let total = 0
    comptes.forEach(prefix => {
      this.mappingCacheN1.forEach((value, key) => {
        if (key === prefix || key.startsWith(prefix)) total += value
      })
    })
    return total
  }

  private calculateActifBrutN1(comptes: string[]): number {
    let total = 0
    comptes.forEach(prefix => {
      this.mappingCacheN1.forEach((value, key) => {
        if ((key === prefix || key.startsWith(prefix)) && value > 0) total += value
      })
    })
    return total
  }

  private calculateAmortProvN1(amortComptes: string[]): number {
    let total = 0
    amortComptes.forEach(prefix => {
      this.mappingCacheN1.forEach((value, key) => {
        if (key === prefix || key.startsWith(prefix)) total += Math.abs(value)
      })
    })
    return total
  }

  private calculatePassifN1(comptes: string[]): number {
    let total = 0
    comptes.forEach(prefix => {
      this.mappingCacheN1.forEach((value, key) => {
        if ((key === prefix || key.startsWith(prefix)) && value < 0) total += Math.abs(value)
      })
    })
    return total
  }

  private calculateChargesN1(comptes: string[]): number {
    let total = 0
    comptes.forEach(prefix => {
      this.mappingCacheN1.forEach((value, key) => {
        if ((key === prefix || key.startsWith(prefix)) && value > 0) total += value
      })
    })
    return total
  }

  private calculateProduitsN1(comptes: string[]): number {
    let total = 0
    comptes.forEach(prefix => {
      this.mappingCacheN1.forEach((value, key) => {
        if ((key === prefix || key.startsWith(prefix)) && value < 0) total += Math.abs(value)
      })
    })
    return total
  }

  private calculatePassifReciprocalN1(comptes: string[]): number {
    let total = 0
    comptes.forEach(prefix => {
      this.mappingCacheN1.forEach((value, key) => {
        if ((key === prefix || key.startsWith(prefix)) && value < 0) total += Math.abs(value)
      })
    })
    return total
  }

  // ────────── Génération Bilan Actif ──────────

  generateBilanActif(typeLiasse: TypeLiasse = 'SN'): any {
    if (typeLiasse === 'SMT') return this.generateBilanActifSMT()

    const rows: any[] = []

    Object.entries(SYSCOHADA_MAPPING.actif).forEach(([ref, mapping]) => {
      const brut = this.calculateActifBrut(mapping.comptes)
      const amortProv = this.calculateAmortProv(mapping.amortComptes || [])
      const net = brut - amortProv

      let net_n1 = 0
      if (this.hasN1) {
        const brutN1 = this.calculateActifBrutN1(mapping.comptes)
        const amortN1 = this.calculateAmortProvN1(mapping.amortComptes || [])
        net_n1 = brutN1 - amortN1
      }

      rows.push({ ref, brut, amortProv, net, net_n1 })
    })

    return rows
  }

  // ────────── Génération Bilan Passif ──────────

  generateBilanPassif(typeLiasse: TypeLiasse = 'SN'): any {
    if (typeLiasse === 'SMT') return this.generateBilanPassifSMT()

    const rows: any[] = []

    // Comptes réciproques pour le passif (42x côté créditeur, 48x côté créditeur, 52x côté créditeur)
    const reciprocalRefs = ['DH', 'DL', 'DQ', 'DR']
    // Comptes signés : peuvent avoir un solde débiteur légitime dans le passif
    // CG (12) = Report à nouveau (+/-)
    const signedRefs = ['CG']
    // Contre-compte débiteur : toujours débiteur, présenté en déduction
    const debitContraRefs = ['CB']
    // Détecter si la balance est pré-clôture (comptes classes 6/7 présents)
    const hasClassesPL = Array.from(this.mappingCache.keys()).some(k => k.startsWith('6') || k.startsWith('7'))

    Object.entries(SYSCOHADA_MAPPING.passif).forEach(([ref, mapping]) => {
      let montant: number
      if (ref === 'CH') {
        // Résultat net : calculé depuis le CdR si balance pré-clôture,
        // sinon depuis le compte 13
        const cdrResult = this.getResultatFromCompteResultat()
        montant = hasClassesPL ? cdrResult : -this.sumSoldes(mapping.comptes)
      } else if (reciprocalRefs.includes(ref)) {
        montant = this.calculatePassifReciprocal(mapping.comptes)
      } else if (signedRefs.includes(ref)) {
        // Crédit → positif (report créditeur), Débit → négatif (report débiteur)
        montant = -this.sumSoldes(mapping.comptes)
      } else if (debitContraRefs.includes(ref)) {
        // Toujours débiteur, montant positif affiché en déduction par le UI
        montant = Math.abs(this.sumSoldes(mapping.comptes))
      } else {
        montant = this.calculatePassif(mapping.comptes)
      }

      let montant_n1 = 0
      if (this.hasN1) {
        const hasClassesPLN1 = Array.from(this.mappingCacheN1.keys()).some(k => k.startsWith('6') || k.startsWith('7'))
        if (ref === 'CH') {
          const cdrN1 = this.getResultatFromCompteResultatN1()
          montant_n1 = hasClassesPLN1 ? cdrN1 : -this.sumSoldesN1(mapping.comptes)
        } else if (reciprocalRefs.includes(ref)) {
          montant_n1 = this.calculatePassifReciprocalN1(mapping.comptes)
        } else if (signedRefs.includes(ref)) {
          montant_n1 = -this.sumSoldesN1(mapping.comptes)
        } else if (debitContraRefs.includes(ref)) {
          montant_n1 = Math.abs(this.sumSoldesN1(mapping.comptes))
        } else {
          montant_n1 = this.calculatePassifN1(mapping.comptes)
        }
      }

      rows.push({ ref, montant, montant_n1 })
    })

    return rows
  }

  // ────────── Génération Compte de Résultat ──────────

  generateCompteResultat(typeLiasse: TypeLiasse = 'SN'): any {
    if (typeLiasse === 'SMT') return this.generateCompteResultatSMT()

    const charges: any[] = []
    const produits: any[] = []

    // Refs de variation de stocks (signe conservé)
    const variationRefs = ['RB', 'RD', 'RF']

    Object.entries(SYSCOHADA_MAPPING.charges).forEach(([ref, mapping]) => {
      const montant = variationRefs.includes(ref)
        ? this.calculateVariation(mapping.comptes)
        : this.calculateCharges(mapping.comptes)
      const montant_n1 = this.hasN1
        ? (variationRefs.includes(ref) ? this.sumSoldesN1(mapping.comptes) : this.calculateChargesN1(mapping.comptes))
        : 0
      charges.push({ ref, montant, montant_n1 })
    })

    // TD (Production stockée, compte 73) est une variation classe 7 : signe inversé
    const produitVariationRefs = ['TD']

    Object.entries(SYSCOHADA_MAPPING.produits).forEach(([ref, mapping]) => {
      const montant = produitVariationRefs.includes(ref)
        ? -this.sumSoldes(mapping.comptes)  // Classe 7 variation: crédit=positif, débit=négatif
        : this.calculateProduits(mapping.comptes)
      const montant_n1 = this.hasN1
        ? (produitVariationRefs.includes(ref) ? -this.sumSoldesN1(mapping.comptes) : this.calculateProduitsN1(mapping.comptes))
        : 0
      produits.push({ ref, montant, montant_n1 })
    })

    return { charges, produits }
  }

  // ────────── SMT Generation Methods ──────────

  private generateBilanActifSMT(): any {
    const rows: any[] = []
    Object.entries(SMT_MAPPING.actif).forEach(([ref, mapping]) => {
      const brut = this.calculateActifBrut(mapping.comptes)
      const amortProv = this.calculateAmortProv(mapping.amortComptes || [])
      const net = brut - amortProv
      rows.push({
        ref,
        libelle: SMT_LIBELLES.actif[ref as keyof typeof SMT_LIBELLES.actif],
        brut, amortProv, net, net_n1: 0,
      })
    })
    return rows
  }

  private generateBilanPassifSMT(): any {
    const rows: any[] = []
    Object.entries(SMT_MAPPING.passif).forEach(([ref, mapping]) => {
      const montant = this.calculatePassif(mapping.comptes)
      rows.push({
        ref,
        libelle: SMT_LIBELLES.passif[ref as keyof typeof SMT_LIBELLES.passif],
        montant, montant_n1: 0,
      })
    })
    return rows
  }

  private generateCompteResultatSMT(): any {
    const charges: any[] = []
    const produits: any[] = []

    // CH_3 = variations de stocks (603): conserve le signe (débit=déstockage, crédit=stockage)
    const chargeVariationRefs = ['CH_3']

    Object.entries(SMT_MAPPING.charges).forEach(([ref, mapping]) => {
      const montant = chargeVariationRefs.includes(ref)
        ? this.calculateVariation(mapping.comptes)
        : this.calculateCharges(mapping.comptes)
      charges.push({
        ref,
        libelle: SMT_LIBELLES.charges[ref as keyof typeof SMT_LIBELLES.charges],
        montant, montant_n1: 0,
      })
    })

    // PR_3 = production stockée (73) + immobilisée (72)
    // Compte 73 est une variation classe 7: crédit=positif, débit=négatif → -sumSoldes
    // Compte 72 est un produit normal → calculateProduits
    Object.entries(SMT_MAPPING.produits).forEach(([ref, mapping]) => {
      let montant: number
      if (ref === 'PR_3') {
        // Séparer 72 (produit normal) et 73 (variation)
        const prodImmo = this.calculateProduits(['72'])
        const prodStockee = -this.sumSoldes(['73'])
        montant = prodImmo + prodStockee
      } else {
        montant = this.calculateProduits(mapping.comptes)
      }
      produits.push({
        ref,
        libelle: SMT_LIBELLES.produits[ref as keyof typeof SMT_LIBELLES.produits],
        montant, montant_n1: 0,
      })
    })

    return { charges, produits }
  }

  // ────────── Validation de cohérence ──────────

  validateCoherence(): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    const totalActif = this.calculateTotalActif()
    const totalPassif = this.calculateTotalPassif()

    if (Math.abs(totalActif - totalPassif) > 0.01) {
      errors.push(`Le bilan n'est pas équilibré: Actif=${totalActif}, Passif=${totalPassif}`)
    }

    const resultatBilan = this.getResultatFromBilan()
    const resultatCompte = this.getResultatFromCompteResultat()

    if (Math.abs(resultatBilan - resultatCompte) > 0.01) {
      errors.push(`Incohérence du résultat: Bilan=${resultatBilan}, Compte=${resultatCompte}`)
    }

    return { isValid: errors.length === 0, errors }
  }

  /**
   * Validation détaillée avec valeurs structurées pour le ValidationPanel
   */
  validateCoherenceDetailed(): {
    checks: Array<{
      code: string
      label: string
      valeurA: number
      labelA: string
      valeurB: number
      labelB: string
      ecart: number
      ok: boolean
    }>
    isValid: boolean
  } {
    const totalActif = this.calculateTotalActif()
    const totalPassif = this.calculateTotalPassif()
    const resultatBilan = this.getResultatFromBilan()
    const resultatCdR = this.getResultatFromCompteResultat()

    const checks = [
      {
        code: 'BZ=DZ',
        label: 'Equilibre du Bilan (Total Actif = Total Passif)',
        valeurA: totalActif,
        labelA: 'Total Actif (BZ)',
        valeurB: totalPassif,
        labelB: 'Total Passif (DZ)',
        ecart: Math.abs(totalActif - totalPassif),
        ok: Math.abs(totalActif - totalPassif) <= 1,
      },
      {
        code: 'XI=CJ',
        label: 'Coherence Resultat (CdR = Bilan)',
        valeurA: resultatCdR,
        labelA: 'Resultat CdR (XI)',
        valeurB: resultatBilan,
        labelB: 'Resultat Bilan (CJ)',
        ecart: Math.abs(resultatCdR - resultatBilan),
        ok: Math.abs(resultatCdR - resultatBilan) <= 1,
      },
    ]

    return { checks, isValid: checks.every(c => c.ok) }
  }

  private calculateTotalActif(): number {
    const actifData = this.generateBilanActif()
    return actifData.reduce((sum: number, row: any) => sum + row.net, 0)
  }

  private calculateTotalPassif(): number {
    const passifData = this.generateBilanPassif()
    return passifData.reduce((sum: number, row: any) => {
      // CB (capital non appelé) est un contre-compte affiché en déduction
      if (row.ref === 'CB') return sum - row.montant
      return sum + row.montant
    }, 0)
  }

  private getResultatFromBilan(): number {
    // Si balance pré-clôture → résultat calculé depuis CdR
    const hasClassesPL = Array.from(this.mappingCache.keys()).some(k => k.startsWith('6') || k.startsWith('7'))
    if (hasClassesPL) return this.getResultatFromCompteResultat()
    // Sinon compte 13 : crédit = bénéfice (positif), débit = perte (négatif)
    return -this.sumSoldes(SYSCOHADA_MAPPING.passif.CH.comptes)
  }

  getResultatFromCompteResultat(): number {
    const { charges, produits } = this.generateCompteResultat()
    const totalCharges = charges.reduce((sum: number, row: any) => sum + row.montant, 0)
    const totalProduits = produits.reduce((sum: number, row: any) => sum + row.montant, 0)
    return totalProduits - totalCharges
  }

  private getResultatFromCompteResultatN1(): number {
    const { charges, produits } = this.generateCompteResultat()
    const totalCharges = charges.reduce((sum: number, row: any) => sum + (row.montant_n1 || 0), 0)
    const totalProduits = produits.reduce((sum: number, row: any) => sum + (row.montant_n1 || 0), 0)
    return totalProduits - totalCharges
  }

  // ────────── Génération SIG (Soldes Intermédiaires de Gestion) ──────────

  generateSIG(): any[] {
    // Helper: calcul N et N-1 en une passe
    const p = (comptes: string[]) => this.calculateProduits(comptes)
    const c = (comptes: string[]) => this.calculateCharges(comptes)
    const v = (comptes: string[]) => this.calculateVariation(comptes)
    const s = (comptes: string[]) => this.sumSoldes(comptes)
    const pN1 = (comptes: string[]) => this.hasN1 ? this.calculateProduitsN1(comptes) : 0
    const cN1 = (comptes: string[]) => this.hasN1 ? this.calculateChargesN1(comptes) : 0
    const sN1 = (comptes: string[]) => this.hasN1 ? this.sumSoldesN1(comptes) : 0

    // ── Marge Commerciale ──
    const T1 = p(['701']),         T1n = pN1(['701'])
    const T2 = c(['601']),         T2n = cN1(['601'])
    const T3 = v(['6031']),        T3n = this.hasN1 ? sN1(['6031']) : 0
    const SIG1 = T1 - T2 - T3,    SIG1n = T1n - T2n - T3n

    // ── Production de l'Exercice ──
    const T4 = p(['702', '703', '704', '705', '706', '707']), T4n = pN1(['702', '703', '704', '705', '706', '707'])
    const T5 = -s(['73']),         T5n = this.hasN1 ? -sN1(['73']) : 0
    const T6 = p(['72']),          T6n = pN1(['72'])
    const SIG2 = T4 + T5 + T6,    SIG2n = T4n + T5n + T6n

    // ── Valeur Ajoutée ──
    const T7 = c(['602']),         T7n = cN1(['602'])
    const T8 = v(['6032', '6033']), T8n = this.hasN1 ? sN1(['6032', '6033']) : 0
    const T9 = c(['604', '605', '608', '61', '62', '63']), T9n = cN1(['604', '605', '608', '61', '62', '63'])
    const SIG3 = SIG1 + SIG2 - T7 - T8 - T9, SIG3n = SIG1n + SIG2n - T7n - T8n - T9n

    // ── EBE ──
    const T10 = p(['71']),         T10n = pN1(['71'])
    const T11 = c(['64']),         T11n = cN1(['64'])
    const T12 = c(['66']),         T12n = cN1(['66'])
    const SIG4 = SIG3 + T10 - T11 - T12, SIG4n = SIG3n + T10n - T11n - T12n

    // ── Résultat d'Exploitation ──
    const T13 = p(['791', '798', '799']), T13n = pN1(['791', '798', '799'])
    const T14 = p(['781', '782']),        T14n = pN1(['781', '782'])
    const T15 = p(['75']),                T15n = pN1(['75'])
    const T16 = c(['681', '691']),        T16n = cN1(['681', '691'])
    const T17 = c(['65']),                T17n = cN1(['65'])
    const SIG5 = SIG4 + T13 + T14 + T15 - T16 - T17
    const SIG5n = SIG4n + T13n + T14n + T15n - T16n - T17n

    // ── Résultat Financier ──
    const T18 = p(['77']),          T18n = pN1(['77'])
    const T19 = p(['787', '797']), T19n = pN1(['787', '797'])
    const T20 = c(['67']),          T20n = cN1(['67'])
    const T21 = c(['687', '697']), T21n = cN1(['687', '697'])
    const SIG6 = T18 + T19 - T20 - T21, SIG6n = T18n + T19n - T20n - T21n

    // ── RAO ──
    const SIG7 = SIG5 + SIG6, SIG7n = SIG5n + SIG6n

    // ── Résultat HAO ──
    const T22 = p(['82']),          T22n = pN1(['82'])
    const T23 = p(['84', '86', '88']), T23n = pN1(['84', '86', '88'])
    const T24 = c(['81']),          T24n = cN1(['81'])
    const T25 = c(['83', '85']),   T25n = cN1(['83', '85'])
    const SIG8 = T22 + T23 - T24 - T25, SIG8n = T22n + T23n - T24n - T25n

    // ── Résultat Net ──
    const T26 = c(['87']),   T26n = cN1(['87'])
    const T27 = c(['89']),   T27n = cN1(['89'])
    const SIG9 = SIG7 + SIG8 - T26 - T27, SIG9n = SIG7n + SIG8n - T26n - T27n

    return [
      { ref: 'T1', label: 'Ventes de marchandises', type: 'line', montant: T1, montant_n1: T1n },
      { ref: 'T2', label: 'Achats de marchandises', type: 'line', montant: T2, montant_n1: T2n, negative: true },
      { ref: 'T3', label: 'Variation stocks marchandises', type: 'line', montant: T3, montant_n1: T3n, negative: true },
      { ref: 'SIG1', label: 'MARGE COMMERCIALE', type: 'sig', montant: SIG1, montant_n1: SIG1n },

      { ref: 'T4', label: 'Production vendue', type: 'line', montant: T4, montant_n1: T4n },
      { ref: 'T5', label: 'Production stockée (ou déstockage)', type: 'line', montant: T5, montant_n1: T5n },
      { ref: 'T6', label: 'Production immobilisée', type: 'line', montant: T6, montant_n1: T6n },
      { ref: 'SIG2', label: 'PRODUCTION DE L\'EXERCICE', type: 'sig', montant: SIG2, montant_n1: SIG2n },

      { ref: 'T7', label: 'Achats de matières premières', type: 'line', montant: T7, montant_n1: T7n, negative: true },
      { ref: 'T8', label: 'Variation stocks matières premières', type: 'line', montant: T8, montant_n1: T8n, negative: true },
      { ref: 'T9', label: 'Autres achats et charges externes', type: 'line', montant: T9, montant_n1: T9n, negative: true },
      { ref: 'SIG3', label: 'VALEUR AJOUTÉE', type: 'sig', montant: SIG3, montant_n1: SIG3n },

      { ref: 'T10', label: 'Subventions d\'exploitation', type: 'line', montant: T10, montant_n1: T10n },
      { ref: 'T11', label: 'Impôts et taxes', type: 'line', montant: T11, montant_n1: T11n, negative: true },
      { ref: 'T12', label: 'Charges de personnel', type: 'line', montant: T12, montant_n1: T12n, negative: true },
      { ref: 'SIG4', label: 'EXCÉDENT BRUT D\'EXPLOITATION (EBE)', type: 'sig', montant: SIG4, montant_n1: SIG4n },

      { ref: 'T13', label: 'Reprises d\'amortissements et provisions', type: 'line', montant: T13, montant_n1: T13n },
      { ref: 'T14', label: 'Transferts de charges d\'exploitation', type: 'line', montant: T14, montant_n1: T14n },
      { ref: 'T15', label: 'Autres produits', type: 'line', montant: T15, montant_n1: T15n },
      { ref: 'T16', label: 'Dotations aux amortissements et provisions', type: 'line', montant: T16, montant_n1: T16n, negative: true },
      { ref: 'T17', label: 'Autres charges', type: 'line', montant: T17, montant_n1: T17n, negative: true },
      { ref: 'SIG5', label: 'RÉSULTAT D\'EXPLOITATION', type: 'sig', montant: SIG5, montant_n1: SIG5n },

      { ref: 'T18', label: 'Produits financiers', type: 'line', montant: T18, montant_n1: T18n },
      { ref: 'T19', label: 'Reprises de provisions financières', type: 'line', montant: T19, montant_n1: T19n },
      { ref: 'T20', label: 'Charges financières', type: 'line', montant: T20, montant_n1: T20n, negative: true },
      { ref: 'T21', label: 'Dotations aux provisions financières', type: 'line', montant: T21, montant_n1: T21n, negative: true },
      { ref: 'SIG6', label: 'RÉSULTAT FINANCIER', type: 'sig', montant: SIG6, montant_n1: SIG6n },

      { ref: 'SIG7', label: 'RÉSULTAT DES ACTIVITÉS ORDINAIRES (RAO)', type: 'sig', montant: SIG7, montant_n1: SIG7n },

      { ref: 'T22', label: 'Produits des cessions d\'immobilisations', type: 'line', montant: T22, montant_n1: T22n },
      { ref: 'T23', label: 'Autres produits HAO', type: 'line', montant: T23, montant_n1: T23n },
      { ref: 'T24', label: 'Valeurs comptables des cessions', type: 'line', montant: T24, montant_n1: T24n, negative: true },
      { ref: 'T25', label: 'Autres charges HAO', type: 'line', montant: T25, montant_n1: T25n, negative: true },
      { ref: 'SIG8', label: 'RÉSULTAT HAO', type: 'sig', montant: SIG8, montant_n1: SIG8n },

      { ref: 'T26', label: 'Participation des travailleurs', type: 'line', montant: T26, montant_n1: T26n, negative: true },
      { ref: 'T27', label: 'Impôts sur le résultat', type: 'line', montant: T27, montant_n1: T27n, negative: true },
      { ref: 'SIG9', label: 'RÉSULTAT NET', type: 'grandtotal', montant: SIG9, montant_n1: SIG9n },
    ]
  }

  // ────────── Génération TFT (Tableau des Flux de Trésorerie) ──────────

  generateTFT(): any {
    // ── Helpers N et N-1 ──
    const cN1 = (comptes: string[]) => this.hasN1 ? this.calculateChargesN1(comptes) : 0
    const pN1 = (comptes: string[]) => this.hasN1 ? this.calculateProduitsN1(comptes) : 0

    // FA = Résultat net depuis CdR
    const FA = this.getResultatFromCompteResultat()
    const FA_N1 = this.hasN1 ? this.getResultatFromCompteResultatN1() : 0

    // FB = Dotations aux amortissements et provisions (charges non décaissées)
    const FB = this.calculateCharges(['681', '687', '691', '697'])
    const FB_N1 = cN1(['681', '687', '691', '697'])

    // FC = Reprises (produits non encaissés)
    const FC = this.calculateProduits(['791', '797', '798', '799', '787'])
    const FC_N1 = pN1(['791', '797', '798', '799', '787'])

    // FD = Plus/moins-values de cession (produit non encaissé à éliminer)
    const produitsCessions = this.calculateProduits(['82'])
    const VNCCessions = this.calculateCharges(['81'])
    const FD = produitsCessions - VNCCessions
    const FD_N1 = pN1(['82']) - cN1(['81'])

    // FE = CAFG (Capacité d'Autofinancement Globale)
    const FE = FA + FB - FC - FD
    const FE_N1 = FA_N1 + FB_N1 - FC_N1 - FD_N1

    // FF = Variation du BFR
    let FF = 0
    if (this.hasN1) {
      // BFR = Stocks + Créances clients - Fournisseurs
      const stocksN = this.calculateActifBrut(['31', '32', '33', '34', '35', '36', '37', '38'])
      const creancesN = this.calculateActifBrut(['411', '412', '413', '414', '415', '416', '418'])
      const fourN = this.calculatePassif(['401', '402', '403', '404', '405', '408'])
      const bfrN = stocksN + creancesN - fourN

      const stocksN1 = this.calculateActifBrutN1(['31', '32', '33', '34', '35', '36', '37', '38'])
      const creancesN1 = this.calculateActifBrutN1(['411', '412', '413', '414', '415', '416', '418'])
      const fourN1 = this.calculatePassifN1(['401', '402', '403', '404', '405', '408'])
      const bfrN1 = stocksN1 + creancesN1 - fourN1

      FF = -(bfrN - bfrN1) // Augmentation BFR = emploi = négatif pour la trésorerie
    }
    // FF N-1 nécessiterait la balance N-2 (non disponible)
    const FF_N1 = 0

    // FG = Flux de trésorerie opérationnels
    const FG = FE + FF
    const FG_N1 = FE_N1 + FF_N1

    // Investissement
    let FH = 0 // Acquisitions immo
    const FI = produitsCessions // Cessions = encaissements
    const FI_N1 = pN1(['82'])
    let FJ = 0 // Variation immo financières
    if (this.hasN1) {
      // FH = Immobilisations brutes N - Immobilisations brutes N-1 + VNC cessions
      const immoCorpN = this.calculateActifBrut(['21', '22', '23', '24', '25'])
      const immoCorpN1 = this.calculateActifBrutN1(['21', '22', '23', '24', '25'])
      FH = immoCorpN - immoCorpN1 + VNCCessions

      // FJ = Immobilisations financières N - N-1
      const immoFinN = this.calculateActifBrut(['26', '27'])
      const immoFinN1 = this.calculateActifBrutN1(['26', '27'])
      FJ = immoFinN - immoFinN1
    }
    // FH/FJ N-1 nécessiteraient la balance N-2
    const FH_N1 = 0
    const FJ_N1 = 0
    const FK = -FH + FI - FJ
    const FK_N1 = -FH_N1 + FI_N1 - FJ_N1

    // Financement
    let FL = 0 // Augmentation capital
    let FM = 0 // Emprunts nouveaux
    let FN = 0 // Remboursement emprunts
    const FO = 0  // Dividendes versés (from account 46x N-1, or manual)
    if (this.hasN1) {
      const capitalN = this.calculatePassif(['101', '102', '103', '104', '105'])
      const capitalN1 = this.calculatePassifN1(['101', '102', '103', '104', '105'])
      FL = Math.max(0, capitalN - capitalN1)

      const dettesFinN = this.calculatePassif(['16', '17'])
      const dettesFinN1 = this.calculatePassifN1(['16', '17'])
      const deltaDettes = dettesFinN - dettesFinN1
      FM = Math.max(0, deltaDettes)
      FN = Math.max(0, -deltaDettes)
    }
    // FL/FM/FN N-1 nécessiteraient la balance N-2
    const FL_N1 = 0, FM_N1 = 0, FN_N1 = 0, FO_N1 = 0
    const FP = FL + FM - FN - FO
    const FP_N1 = FL_N1 + FM_N1 - FN_N1 - FO_N1

    // Synthèse
    const FQ = FG + FK + FP
    const FQ_N1 = FG_N1 + FK_N1 + FP_N1

    // Trésorerie fin d'exercice (calculable depuis la balance courante)
    const tresoActif = this.calculateActifBrut(['50', '51', '52', '53', '54', '55', '56', '57', '58'])
    const tresoPassif = this.calculatePassifReciprocal(['52', '561', '564', '565'])
    const FS = tresoActif - tresoPassif

    // Trésorerie début = Trésorerie fin N-1
    let FR = 0
    let FS_N1 = 0
    if (this.hasN1) {
      const tresoActifN1 = this.calculateActifBrutN1(['50', '51', '52', '53', '54', '55', '56', '57', '58'])
      const tresoPassifN1 = this.calculatePassifReciprocalN1(['52', '561', '564', '565'])
      FR = tresoActifN1 - tresoPassifN1
      FS_N1 = FR // Trésorerie fin N-1 = Trésorerie début N
    }
    const FR_N1 = 0 // Trésorerie début N-1 nécessiterait N-2
    const FT = FS - FR - FQ  // Contrôle : devrait être 0
    const FT_N1 = FS_N1 - FR_N1 - FQ_N1

    return {
      FA, FB, FC, FD, FE, FF, FG,
      FH, FI, FJ, FK,
      FL, FM, FN, FO, FP,
      FQ, FR, FS, FT,
      // Valeurs N-1
      FA_N1, FB_N1, FC_N1, FD_N1, FE_N1, FF_N1, FG_N1,
      FH_N1, FI_N1, FJ_N1, FK_N1,
      FL_N1, FM_N1, FN_N1, FO_N1, FP_N1,
      FQ_N1, FR_N1, FS_N1, FT_N1,
      tresoActif, tresoPassif,
      hasN1: this.hasN1
    }
  }

  // ────────── Génération TAFIRE (Tableau Financier des Ressources et Emplois) ──────────

  generateTAFIRE(): any {
    const tft = this.generateTFT()
    const sig = this.generateSIG()
    const findSIG = (ref: string) => sig.find((s: any) => s.ref === ref)?.montant ?? 0

    // ═══ PARTIE I : ACTIVITÉ ═══

    // CAFG = EBE + Produits encaissables hors exploitation - Charges décaissables hors exploitation
    const EBE = findSIG('SIG4')
    const dotations = this.calculateCharges(['681', '687', '691', '697'])
    const reprises = this.calculateProduits(['791', '797', '798', '799', '787'])
    const CAFG = tft.FE

    // Dividendes distribués (compte 465 ou depuis TFT)
    const dividendes = tft.FO

    // Autofinancement = CAFG - Dividendes
    const autofinancement = CAFG - dividendes

    // ═══ PARTIE II : INVESTISSEMENT / DÉSINVESTISSEMENT ═══
    const acquisImmo = tft.FH
    const cessions = tft.FI
    const varImmoFin = tft.FJ

    // ═══ PARTIE III : FINANCEMENT ═══
    const augCapital = tft.FL
    const empruntsNouveaux = tft.FM
    const remboursements = tft.FN

    // ═══ VARIATION BFR ═══
    let varStocks = 0
    let varCreances = 0
    let varFournisseurs = 0
    if (this.hasN1) {
      const stocksN = this.calculateActifBrut(['31', '32', '33', '34', '35', '36', '37', '38'])
      const stocksN1 = this.calculateActifBrutN1(['31', '32', '33', '34', '35', '36', '37', '38'])
      varStocks = stocksN - stocksN1

      const creancesN = this.calculateActifBrut(['411', '412', '413', '414', '415', '416', '418', '43', '44', '45', '46', '47'])
      const creancesN1 = this.calculateActifBrutN1(['411', '412', '413', '414', '415', '416', '418', '43', '44', '45', '46', '47'])
      varCreances = creancesN - creancesN1

      const fourN = this.calculatePassif(['401', '402', '403', '404', '405', '408', '42', '43', '44'])
      const fourN1 = this.calculatePassifN1(['401', '402', '403', '404', '405', '408', '42', '43', '44'])
      varFournisseurs = fourN - fourN1
    }
    const varBFR = varStocks + varCreances - varFournisseurs

    // ═══ SYNTHÈSE ═══
    // EMPLOIS
    const totalEmplois = acquisImmo + varImmoFin + remboursements + dividendes + Math.max(0, varBFR)
    // RESSOURCES
    const totalRessources = CAFG + cessions + augCapital + empruntsNouveaux + Math.max(0, -varBFR)
    // Variation trésorerie
    const varTresorerie = totalRessources - totalEmplois

    // CAFG N-1
    let CAFG_N1 = 0
    if (this.hasN1) {
      const FA_N1 = this.calculateProduitsN1(['70', '71', '72', '73', '75']) - this.calculateChargesN1(['60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '81', '83', '85', '87', '89'])
      const FB_N1 = this.calculateChargesN1(['681', '687', '691', '697'])
      const FC_N1 = this.calculateProduitsN1(['791', '797', '798', '799', '787'])
      CAFG_N1 = FA_N1 + FB_N1 - FC_N1
    }

    return {
      // Partie I - Activité
      CAFG, CAFG_N1,
      dividendes,
      autofinancement,

      // Partie II - Investissement
      acquisImmo,
      cessions,
      varImmoFin,

      // Partie III - Financement
      augCapital,
      empruntsNouveaux,
      remboursements,

      // Variation BFR
      varStocks,
      varCreances,
      varFournisseurs,
      varBFR,

      // Synthèse
      totalEmplois,
      totalRessources,
      varTresorerie,

      // Détails TFT pour cross-check
      EBE,
      dotations,
      reprises,

      hasN1: this.hasN1,
    }
  }

  // ────────── Helper public pour les Notes ──────────

  isLoaded(): boolean {
    return this.balance.length > 0
  }

  /** Somme des soldes débiteurs pour des préfixes (actifs/charges) */
  sumDebit(prefixes: string[]): number {
    let total = 0
    prefixes.forEach(prefix => {
      this.mappingCache.forEach((value, key) => {
        if (key === prefix || key.startsWith(prefix)) {
          if (value > 0) total += value
        }
      })
    })
    return total
  }

  /** Somme des soldes créditeurs (abs) pour des préfixes (passif/amort/produits) */
  sumCredit(prefixes: string[]): number {
    let total = 0
    prefixes.forEach(prefix => {
      this.mappingCache.forEach((value, key) => {
        if (key === prefix || key.startsWith(prefix)) {
          if (value < 0) total += Math.abs(value)
        }
      })
    })
    return total
  }

  /** Solde net (débit - crédit) pour des préfixes */
  getNetBalance(prefixes: string[]): number {
    return this.sumSoldes(prefixes)
  }

  // ────────── Génération Note 3A - Immobilisations (Brutes) ──────────

  generateNote3A(): any[] {
    const IMMO_MAP: Record<string, { label: string; categorie: string; prefixes: string[]; amortPrefixes: string[] }> = {
      'frais_etabl': { label: 'Frais d\'établissement', categorie: 'incorporelles', prefixes: ['201'], amortPrefixes: ['2801'] },
      'brevets': { label: 'Brevets, licences, logiciels', categorie: 'incorporelles', prefixes: ['212', '213', '214'], amortPrefixes: ['2812', '2813', '2814'] },
      'fonds_commercial': { label: 'Fonds commercial', categorie: 'incorporelles', prefixes: ['215', '216'], amortPrefixes: ['2815', '2816'] },
      'autres_incorp': { label: 'Autres immobilisations incorporelles', categorie: 'incorporelles', prefixes: ['211', '217', '218', '219'], amortPrefixes: ['2811', '2817', '2818', '2819'] },
      'terrains': { label: 'Terrains', categorie: 'corporelles', prefixes: ['22'], amortPrefixes: ['282'] },
      'constructions': { label: 'Bâtiments, constructions', categorie: 'corporelles', prefixes: ['231', '232', '233', '234'], amortPrefixes: ['2831', '2832', '2833', '2834'] },
      'installations': { label: 'Installations techniques', categorie: 'corporelles', prefixes: ['235', '237', '238'], amortPrefixes: ['2835', '2837', '2838'] },
      'materiel': { label: 'Matériel et outillage', categorie: 'corporelles', prefixes: ['241', '242', '243', '244'], amortPrefixes: ['2841', '2842', '2843', '2844'] },
      'transport': { label: 'Matériel de transport', categorie: 'corporelles', prefixes: ['245'], amortPrefixes: ['2845'] },
      'titres_participation': { label: 'Titres de participation', categorie: 'financieres', prefixes: ['26'], amortPrefixes: ['296'] },
      'autres_financieres': { label: 'Autres immobilisations financières', categorie: 'financieres', prefixes: ['271', '272', '273', '274', '275', '276', '277'], amortPrefixes: ['297'] },
      'avances': { label: 'Avances et acomptes', categorie: 'avances', prefixes: ['251', '252'], amortPrefixes: [] },
    }

    const lines: any[] = []
    Object.entries(IMMO_MAP).forEach(([key, { label, categorie, prefixes, amortPrefixes }]) => {
      const brut = this.sumDebit(prefixes)
      const amort = amortPrefixes.length > 0 ? this.sumCredit(amortPrefixes) : 0
      if (brut === 0 && amort === 0) return
      lines.push({ id: key, categorie, designation: label, valeurBrute: brut, amortissements: amort, valeurNette: brut - amort })
    })
    return lines
  }

  // ────────── Génération Note 3C - Amortissements ──────────

  generateNote3C(): any[] {
    const AMORT_MAP: Record<string, { label: string; prefixes: string[] }> = {
      'frais_etabl': { label: 'Frais d\'établissement', prefixes: ['2801', '2901'] },
      'brevets': { label: 'Brevets, licences, logiciels', prefixes: ['2812', '2813', '2814'] },
      'fonds_commercial': { label: 'Fonds commercial', prefixes: ['2815', '2816'] },
      'terrains': { label: 'Terrains', prefixes: ['282'] },
      'constructions': { label: 'Bâtiments', prefixes: ['2831', '2832', '2833', '2834'] },
      'installations': { label: 'Installations techniques', prefixes: ['2835', '2837', '2838'] },
      'materiel': { label: 'Matériel et outillage', prefixes: ['2841', '2842', '2843', '2844'] },
      'transport': { label: 'Matériel de transport', prefixes: ['2845'] },
    }

    const lines: any[] = []
    Object.entries(AMORT_MAP).forEach(([key, { label, prefixes }]) => {
      const cumulDebut = 0 // N-1 amort not tracked separately
      const dotation = this.sumCredit(prefixes)
      if (dotation === 0) return
      lines.push({ id: key, designation: label, cumulDebut, dotation, reprises: 0, cumulFin: dotation })
    })
    return lines
  }

  // ────────── Génération Note 3C BIS - Dépréciations ──────────

  generateNote3CBis(): any[] {
    const DEPREC_MAP: Record<string, { label: string; prefixes: string[] }> = {
      'incorp': { label: 'Immobilisations incorporelles', prefixes: ['291', '292'] },
      'corp': { label: 'Immobilisations corporelles', prefixes: ['293', '294'] },
      'fin': { label: 'Immobilisations financières', prefixes: ['296', '297'] },
    }

    const lines: any[] = []
    Object.entries(DEPREC_MAP).forEach(([key, { label, prefixes }]) => {
      const montant = this.sumCredit(prefixes)
      if (montant === 0) return
      lines.push({ id: key, designation: label, cumulDebut: 0, dotation: montant, reprises: 0, cumulFin: montant })
    })
    return lines
  }

  // ────────── Génération Note 6 - Immobilisations corporelles ──────────

  generateNote6(): any[] {
    const CORP_MAP: Record<string, { label: string; categorie: string; prefixes: string[]; amortPrefixes: string[] }> = {
      'terrains': { label: 'Terrains', categorie: 'terrains', prefixes: ['22'], amortPrefixes: ['282', '292'] },
      'constructions': { label: 'Bâtiments, constructions', categorie: 'constructions', prefixes: ['231', '232', '233', '234'], amortPrefixes: ['2831', '2832', '2833', '2834'] },
      'installations': { label: 'Installations techniques', categorie: 'installations', prefixes: ['235', '237', '238'], amortPrefixes: ['2835', '2837', '2838'] },
      'materiel_outillage': { label: 'Matériel et outillage', categorie: 'materiel_outillage', prefixes: ['241', '242', '243', '244'], amortPrefixes: ['2841', '2842', '2843', '2844'] },
      'materiel_transport': { label: 'Matériel de transport', categorie: 'materiel_transport', prefixes: ['245'], amortPrefixes: ['2845', '2945'] },
    }

    const lines: any[] = []
    Object.entries(CORP_MAP).forEach(([key, { label, categorie, prefixes, amortPrefixes }]) => {
      const brut = this.sumDebit(prefixes)
      const amort = this.sumCredit(amortPrefixes)
      if (brut === 0 && amort === 0) return
      lines.push({ id: key, categorie, label, valeurBrute: brut, amortissements: amort, valeurNette: brut - amort })
    })
    return lines
  }

  // ────────── Génération Note 8 - Stocks ──────────

  generateNote8(): any[] {
    const STOCK_MAP: Record<string, { label: string; categorie: string; prefixes: string[]; provPrefixes: string[] }> = {
      'matieres': { label: 'Matières premières', categorie: 'matieres_premieres', prefixes: ['31'], provPrefixes: ['391'] },
      'en_cours': { label: 'Produits en cours', categorie: 'en_cours', prefixes: ['34', '35'], provPrefixes: ['394', '395'] },
      'produits_finis': { label: 'Produits finis', categorie: 'produits_finis', prefixes: ['36', '37'], provPrefixes: ['396', '397'] },
      'marchandises': { label: 'Marchandises', categorie: 'marchandises', prefixes: ['38'], provPrefixes: ['398'] },
      'autres': { label: 'Autres approvisionnements', categorie: 'autres', prefixes: ['32', '33'], provPrefixes: ['392', '393'] },
    }

    const lines: any[] = []
    Object.entries(STOCK_MAP).forEach(([key, { label, categorie, prefixes, provPrefixes }]) => {
      const brut = this.sumDebit(prefixes)
      const provision = this.sumCredit(provPrefixes)
      if (brut === 0 && provision === 0) return
      lines.push({ id: key, categorie, designation: label, valeurComptable: brut, provision, valeurNette: brut - provision })
    })
    return lines
  }

  // ────────── Génération Note 11 - Capitaux propres ──────────

  generateNote11(): any[] {
    const CAPITAUX_MAP: Record<string, { label: string; prefixes: string[] }> = {
      'capital': { label: 'Capital social', prefixes: ['101', '102', '103', '104'] },
      'primes': { label: 'Primes liées au capital', prefixes: ['105'] },
      'reserves': { label: 'Réserves', prefixes: ['106'] },
      'capital_non_appele': { label: 'Capital non appelé (-)', prefixes: ['109'] },
      'ecart_reevaluation': { label: 'Écart de réévaluation', prefixes: ['111', '112', '113', '118'] },
      'report_nouveau': { label: 'Report à nouveau', prefixes: ['12'] },
      'resultat_net': { label: 'Résultat net de l\'exercice', prefixes: ['13'] },
      'subventions': { label: 'Subventions d\'investissement', prefixes: ['14'] },
      'provisions_reglementees': { label: 'Provisions réglementées', prefixes: ['15'] },
    }

    const lines: any[] = []
    Object.entries(CAPITAUX_MAP).forEach(([key, { label, prefixes }]) => {
      // Most capital accounts are credit-balance
      const debit = this.sumDebit(prefixes)
      const credit = this.sumCredit(prefixes)
      const montant = key === 'capital_non_appele' ? debit : credit
      if (montant === 0 && debit === 0) return
      lines.push({ id: key, designation: label, montantN: montant, montantN1: 0 })
    })
    return lines
  }

  // ────────── Génération Note 14 - Dettes financières ──────────

  generateNote14(): any[] {
    const DETTES_MAP: Record<string, { label: string; categorie: string; prefixes: string[] }> = {
      'emprunts_obligataires': { label: 'Emprunts obligataires', categorie: 'long_terme', prefixes: ['161'] },
      'emprunts_creditbail': { label: 'Emprunts et dettes de crédit-bail', categorie: 'long_terme', prefixes: ['162', '163', '164'] },
      'emprunts_autres': { label: 'Autres emprunts et dettes', categorie: 'long_terme', prefixes: ['165', '166', '168'] },
      'dettes_credit': { label: 'Dettes de crédit-bail immobilier', categorie: 'moyen_terme', prefixes: ['17'] },
      'dettes_diverses': { label: 'Dettes financières diverses', categorie: 'court_terme', prefixes: ['181', '182', '183', '184', '185', '186'] },
      'provisions': { label: 'Provisions pour risques et charges', categorie: 'provisions', prefixes: ['19'] },
    }

    const lines: any[] = []
    Object.entries(DETTES_MAP).forEach(([key, { label, categorie, prefixes }]) => {
      const montant = this.sumCredit(prefixes)
      if (montant === 0) return
      lines.push({ id: key, categorie, designation: label, montantN: montant, montantN1: 0, echeanceCT: 0, echeanceLT: montant })
    })
    return lines
  }

  // ────────── Génération Note 17 - Chiffre d'affaires ──────────

  generateNote17(): any[] {
    const CA_MAP: Record<string, { label: string; categorie: string; prefixes: string[] }> = {
      'ventes_marchandises': { label: 'Ventes de marchandises', categorie: 'ventes', prefixes: ['701'] },
      'ventes_produits': { label: 'Ventes de produits fabriqués', categorie: 'ventes', prefixes: ['702', '703'] },
      'prestations_services': { label: 'Prestations de services', categorie: 'services', prefixes: ['704', '705', '706'] },
      'produits_accessoires': { label: 'Produits accessoires', categorie: 'accessoires', prefixes: ['707'] },
      'production_stockee': { label: 'Production stockée', categorie: 'production', prefixes: ['73'] },
      'production_immobilisee': { label: 'Production immobilisée', categorie: 'production', prefixes: ['72'] },
      'subventions': { label: 'Subventions d\'exploitation', categorie: 'subventions', prefixes: ['71'] },
    }

    const lines: any[] = []
    Object.entries(CA_MAP).forEach(([key, { label, categorie, prefixes }]) => {
      // Revenue accounts have credit balance
      const montant = this.sumCredit(prefixes)
      if (montant === 0) return
      lines.push({ id: key, categorie, designation: label, montantN: montant, montantN1: 0 })
    })
    return lines
  }

  // ────────── Génération Note 19 - Charges de personnel ──────────

  generateNote19(): any[] {
    const PERSONNEL_MAP: Record<string, { label: string; prefixes: string[] }> = {
      'salaires': { label: 'Salaires et traitements', prefixes: ['641', '642'] },
      'charges_sociales': { label: 'Charges sociales', prefixes: ['643', '644', '645', '646'] },
      'autres_charges': { label: 'Autres charges de personnel', prefixes: ['647', '648'] },
      'impots_salaires': { label: 'Impôts sur salaires', prefixes: ['637'] },
    }

    const lines: any[] = []
    Object.entries(PERSONNEL_MAP).forEach(([key, { label, prefixes }]) => {
      const montant = this.sumDebit(prefixes)
      if (montant === 0) return
      lines.push({ id: key, designation: label, montantN: montant, montantN1: 0 })
    })
    return lines
  }
}

// Instance singleton du service
export const liasseDataService = new LiasseDataService()
