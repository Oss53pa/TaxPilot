import { logger } from '@/utils/logger'
/**
 * Service de contrôle de cohérence comptable SYSCOHADA
 * Vérifie la cohérence entre états de synthèse et notes annexes
 */

export interface ControleCoherence {
  id: string
  type: 'BILAN_NOTES' | 'TFT_IMMOBILISATIONS' | 'RESULTAT_NOTES'
  description: string
  statut: 'CONFORME' | 'ECART' | 'ERREUR'
  ecart?: number
  valeurEtat: number
  valeurNote: number
  seuil: number
  details: string
  recommandation?: string
}

export interface ResultatValidation {
  nombreControles: number
  controlesConformes: number
  controlesEcart: number
  controlesErreur: number
  scoreCoherence: number
  controles: ControleCoherence[]
}

class CoherenceService {
  
  /**
   * ALGORITHME 1: Contrôle cohérence Bilan vs Notes Annexes
   */
  async verifierCoherenceBilanNotes(
    bilanActif: any, 
    bilanPassif: any, 
    notesAnnexes: any
  ): Promise<ControleCoherence[]> {
    const controles: ControleCoherence[] = []

    // 1. Cohérence Immobilisations corporelles (Bilan vs Note sur immobilisations)
    const immoCorporellesBilan = bilanActif.immobilisationsCorporelles || 0
    const immoCorporellesNote = notesAnnexes.tableauImmobilisations?.totalNetCorporelles || 0
    
    controles.push({
      id: 'IMMO_CORP_001',
      type: 'BILAN_NOTES',
      description: 'Cohérence Immobilisations corporelles : Bilan vs Note',
      statut: this.evaluerEcart(immoCorporellesBilan, immoCorporellesNote, 1000),
      ecart: Math.abs(immoCorporellesBilan - immoCorporellesNote),
      valeurEtat: immoCorporellesBilan,
      valeurNote: immoCorporellesNote,
      seuil: 1000,
      details: `Bilan: ${this.formatMontant(immoCorporellesBilan)} vs Note: ${this.formatMontant(immoCorporellesNote)}`,
      recommandation: 'Vérifier les amortissements et réévaluations dans le tableau des immobilisations'
    })

    // 2. Cohérence Immobilisations incorporelles
    const immoIncorporellesBilan = bilanActif.immobilisationsIncorporelles || 0
    const immoIncorporellesNote = notesAnnexes.tableauImmobilisations?.totalNetIncorporelles || 0
    
    controles.push({
      id: 'IMMO_INCORP_001',
      type: 'BILAN_NOTES',
      description: 'Cohérence Immobilisations incorporelles : Bilan vs Note',
      statut: this.evaluerEcart(immoIncorporellesBilan, immoIncorporellesNote, 500),
      ecart: Math.abs(immoIncorporellesBilan - immoIncorporellesNote),
      valeurEtat: immoIncorporellesBilan,
      valeurNote: immoIncorporellesNote,
      seuil: 500,
      details: `Bilan: ${this.formatMontant(immoIncorporellesBilan)} vs Note: ${this.formatMontant(immoIncorporellesNote)}`
    })

    // 3. Cohérence Dettes financières (Bilan vs Note sur dettes)
    const dettesFinancieresBilan = bilanPassif.dettesFinancieres || 0
    const dettesFinancieresNote = notesAnnexes.dettesSurEtablissementCredit?.totalDettes || 0
    
    controles.push({
      id: 'DETTES_FIN_001',
      type: 'BILAN_NOTES',
      description: 'Cohérence Dettes financières : Bilan vs Note',
      statut: this.evaluerEcart(dettesFinancieresBilan, dettesFinancieresNote, 2000),
      ecart: Math.abs(dettesFinancieresBilan - dettesFinancieresNote),
      valeurEtat: dettesFinancieresBilan,
      valeurNote: dettesFinancieresNote,
      seuil: 2000,
      details: `Bilan: ${this.formatMontant(dettesFinancieresBilan)} vs Note: ${this.formatMontant(dettesFinancieresNote)}`
    })

    // 4. Cohérence Provisions (Bilan vs Note sur provisions)
    const provisionsBilan = bilanPassif.provisions || 0
    const provisionsNote = notesAnnexes.tableauProvisions?.totalProvisions || 0
    
    controles.push({
      id: 'PROVISIONS_001',
      type: 'BILAN_NOTES',
      description: 'Cohérence Provisions : Bilan vs Note',
      statut: this.evaluerEcart(provisionsBilan, provisionsNote, 1500),
      ecart: Math.abs(provisionsBilan - provisionsNote),
      valeurEtat: provisionsBilan,
      valeurNote: provisionsNote,
      seuil: 1500,
      details: `Bilan: ${this.formatMontant(provisionsBilan)} vs Note: ${this.formatMontant(provisionsNote)}`
    })

    // 5. Cohérence Stocks (Bilan vs Note sur stocks)
    const stocksBilan = bilanActif.stocks || 0
    const stocksNote = notesAnnexes.mouvementStocks?.valeurFinale || 0
    
    controles.push({
      id: 'STOCKS_001',
      type: 'BILAN_NOTES',
      description: 'Cohérence Stocks : Bilan vs Note',
      statut: this.evaluerEcart(stocksBilan, stocksNote, 1000),
      ecart: Math.abs(stocksBilan - stocksNote),
      valeurEtat: stocksBilan,
      valeurNote: stocksNote,
      seuil: 1000,
      details: `Bilan: ${this.formatMontant(stocksBilan)} vs Note: ${this.formatMontant(stocksNote)}`
    })

    return controles
  }

  /**
   * ALGORITHME 2: Contrôle cohérence TFT vs Tableau des Immobilisations
   */
  async verifierCoherenceTFTImmobilisations(
    tft: any, 
    tableauImmobilisations: any
  ): Promise<ControleCoherence[]> {
    const controles: ControleCoherence[] = []

    // 1. Cohérence Acquisitions d'immobilisations
    const acquisitionsTFT = Math.abs(tft.fluxInvestissement.acquisitionsImmobilisations || 0)
    const acquisitionsTableau = tableauImmobilisations.mouvements?.augmentations || 0
    
    controles.push({
      id: 'TFT_IMMO_ACQ_001',
      type: 'TFT_IMMOBILISATIONS',
      description: 'Cohérence Acquisitions : TFT vs Tableau Immobilisations',
      statut: this.evaluerEcart(acquisitionsTFT, acquisitionsTableau, 5000),
      ecart: Math.abs(acquisitionsTFT - acquisitionsTableau),
      valeurEtat: acquisitionsTFT,
      valeurNote: acquisitionsTableau,
      seuil: 5000,
      details: `TFT: ${this.formatMontant(acquisitionsTFT)} vs Tableau: ${this.formatMontant(acquisitionsTableau)}`,
      recommandation: 'Vérifier que toutes les acquisitions sont comptabilisées dans les deux états'
    })

    // 2. Cohérence Cessions d'immobilisations
    const cessionsTFT = tft.fluxInvestissement.cessionImmobilisations || 0
    const cessionsTableau = tableauImmobilisations.mouvements?.diminutions || 0
    
    controles.push({
      id: 'TFT_IMMO_CESS_001',
      type: 'TFT_IMMOBILISATIONS', 
      description: 'Cohérence Cessions : TFT vs Tableau Immobilisations',
      statut: this.evaluerEcart(cessionsTFT, cessionsTableau, 3000),
      ecart: Math.abs(cessionsTFT - cessionsTableau),
      valeurEtat: cessionsTFT,
      valeurNote: cessionsTableau,
      seuil: 3000,
      details: `TFT: ${this.formatMontant(cessionsTFT)} vs Tableau: ${this.formatMontant(cessionsTableau)}`
    })

    // 3. Cohérence Dotations aux amortissements
    const dotationsAmortTFT = tft.fluxExploitation.dotationsAmortissements || 0
    const dotationsAmortTableau = tableauImmobilisations.amortissements?.dotationsExercice || 0
    
    controles.push({
      id: 'TFT_AMORT_001',
      type: 'TFT_IMMOBILISATIONS',
      description: 'Cohérence Dotations amortissements : TFT vs Tableau',
      statut: this.evaluerEcart(dotationsAmortTFT, dotationsAmortTableau, 2000),
      ecart: Math.abs(dotationsAmortTFT - dotationsAmortTableau),
      valeurEtat: dotationsAmortTFT,
      valeurNote: dotationsAmortTableau,
      seuil: 2000,
      details: `TFT: ${this.formatMontant(dotationsAmortTFT)} vs Tableau: ${this.formatMontant(dotationsAmortTableau)}`
    })

    // 4. Contrôle variation nette des immobilisations
    const variationNetteTFT = acquisitionsTFT - cessionsTFT - dotationsAmortTFT
    const variationNetteTableau = (acquisitionsTableau - cessionsTableau) - dotationsAmortTableau
    
    controles.push({
      id: 'TFT_VAR_NET_001',
      type: 'TFT_IMMOBILISATIONS',
      description: 'Cohérence Variation nette immobilisations : TFT vs Tableau',
      statut: this.evaluerEcart(variationNetteTFT, variationNetteTableau, 1000),
      ecart: Math.abs(variationNetteTFT - variationNetteTableau),
      valeurEtat: variationNetteTFT,
      valeurNote: variationNetteTableau,
      seuil: 1000,
      details: `Variation TFT: ${this.formatMontant(variationNetteTFT)} vs Variation Tableau: ${this.formatMontant(variationNetteTableau)}`,
      recommandation: 'Vérifier la cohérence globale des flux d\'investissement'
    })

    // 5. Contrôle spécifique subventions d'investissement
    const subventionsTFT = tft.fluxInvestissement.subventionsRecues || 0
    const subventionsTableau = tableauImmobilisations.subventions?.recuesExercice || 0
    
    if (subventionsTFT > 0 || subventionsTableau > 0) {
      controles.push({
        id: 'TFT_SUBV_001',
        type: 'TFT_IMMOBILISATIONS',
        description: 'Cohérence Subventions d\'investissement : TFT vs Tableau',
        statut: this.evaluerEcart(subventionsTFT, subventionsTableau, 1000),
        ecart: Math.abs(subventionsTFT - subventionsTableau),
        valeurEtat: subventionsTFT,
        valeurNote: subventionsTableau,
        seuil: 1000,
        details: `TFT: ${this.formatMontant(subventionsTFT)} vs Tableau: ${this.formatMontant(subventionsTableau)}`
      })
    }

    return controles
  }

  /**
   * ALGORITHME 3: Contrôle cohérence Compte de Résultat vs Notes
   */
  async verifierCoherenceResultatNotes(
    compteResultat: any,
    notesAnnexes: any
  ): Promise<ControleCoherence[]> {
    const controles: ControleCoherence[] = []

    // 1. Cohérence Chiffre d'affaires (Compte résultat vs Note 17)
    const caResultat = compteResultat.chiffreAffaires || 0
    const caNote17 = notesAnnexes.chiffreAffaires?.totalCA || 0
    
    controles.push({
      id: 'CA_NOTE17_001',
      type: 'RESULTAT_NOTES',
      description: 'Cohérence Chiffre d\'affaires : Résultat vs Note 17',
      statut: this.evaluerEcart(caResultat, caNote17, 10000),
      ecart: Math.abs(caResultat - caNote17),
      valeurEtat: caResultat,
      valeurNote: caNote17,
      seuil: 10000,
      details: `Résultat: ${this.formatMontant(caResultat)} vs Note 17: ${this.formatMontant(caNote17)}`,
      recommandation: 'Vérifier la ventilation du CA par nature d\'activité dans la Note 17'
    })

    // 2. Cohérence Dotations aux amortissements
    const dotationsResultat = compteResultat.dotationsAmortissements || 0
    const dotationsNote = notesAnnexes.tableauAmortissements?.dotationsExercice || 0
    
    controles.push({
      id: 'DOT_AMORT_001',
      type: 'RESULTAT_NOTES',
      description: 'Cohérence Dotations amortissements : Résultat vs Note',
      statut: this.evaluerEcart(dotationsResultat, dotationsNote, 5000),
      ecart: Math.abs(dotationsResultat - dotationsNote),
      valeurEtat: dotationsResultat,
      valeurNote: dotationsNote,
      seuil: 5000,
      details: `Résultat: ${this.formatMontant(dotationsResultat)} vs Note: ${this.formatMontant(dotationsNote)}`
    })

    // 3. Cohérence Dotations aux provisions
    const dotationsProvisions = compteResultat.dotationsProvisions || 0
    const provisionsNote = notesAnnexes.tableauProvisions?.dotationsExercice || 0
    
    controles.push({
      id: 'DOT_PROV_001',
      type: 'RESULTAT_NOTES',
      description: 'Cohérence Dotations provisions : Résultat vs Note',
      statut: this.evaluerEcart(dotationsProvisions, provisionsNote, 2000),
      ecart: Math.abs(dotationsProvisions - provisionsNote),
      valeurEtat: dotationsProvisions,
      valeurNote: provisionsNote,
      seuil: 2000,
      details: `Résultat: ${this.formatMontant(dotationsProvisions)} vs Note: ${this.formatMontant(provisionsNote)}`
    })

    return controles
  }

  /**
   * ALGORITHME 4: Validation croisée mathématique du TFT
   */
  async verifierCoherenceMathematiqueTFT(tft: any): Promise<ControleCoherence[]> {
    const controles: ControleCoherence[] = []

    // Calculs de vérification
    const fluxExploitation = tft.fluxExploitation.total || 0
    const fluxInvestissement = tft.fluxInvestissement.total || 0
    const fluxFinancement = tft.fluxFinancement.total || 0
    const variationTresorerie = tft.variationTresorerie || 0
    
    const calculVariation = fluxExploitation + fluxInvestissement + fluxFinancement
    
    // Contrôle équilibre mathématique du TFT
    controles.push({
      id: 'TFT_EQUIL_001',
      type: 'TFT_IMMOBILISATIONS',
      description: 'Équilibre mathématique TFT : Flux = Variation trésorerie',
      statut: this.evaluerEcart(calculVariation, variationTresorerie, 100),
      ecart: Math.abs(calculVariation - variationTresorerie),
      valeurEtat: calculVariation,
      valeurNote: variationTresorerie,
      seuil: 100,
      details: `Somme flux: ${this.formatMontant(calculVariation)} vs Variation: ${this.formatMontant(variationTresorerie)}`,
      recommandation: 'L\'équilibre mathématique du TFT doit être parfait (écart = 0)'
    })

    return controles
  }

  /**
   * MÉTHODE PRINCIPALE: Lancer tous les contrôles de cohérence
   */
  async lancerControlesCoherence(donneesLiasse: any): Promise<ResultatValidation> {
    const todControles: ControleCoherence[] = []

    try {
      // 1. Contrôles Bilan vs Notes
      const controlesBilan = await this.verifierCoherenceBilanNotes(
        donneesLiasse.bilanActif,
        donneesLiasse.bilanPassif, 
        donneesLiasse.notesAnnexes
      )
      todControles.push(...controlesBilan)

      // 2. Contrôles TFT vs Immobilisations
      const controlesTFT = await this.verifierCoherenceTFTImmobilisations(
        donneesLiasse.tft,
        donneesLiasse.notesAnnexes.tableauImmobilisations
      )
      todControles.push(...controlesTFT)

      // 3. Contrôles Compte de Résultat vs Notes
      const controlesResultat = await this.verifierCoherenceResultatNotes(
        donneesLiasse.compteResultat,
        donneesLiasse.notesAnnexes
      )
      todControles.push(...controlesResultat)

      // 4. Contrôles mathématiques TFT
      const controlesMath = await this.verifierCoherenceMathematiqueTFT(donneesLiasse.tft)
      todControles.push(...controlesMath)

      // Calcul des statistiques
      const nombreControles = todControles.length
      const controlesConformes = todControles.filter(c => c.statut === 'CONFORME').length
      const controlesEcart = todControles.filter(c => c.statut === 'ECART').length
      const controlesErreur = todControles.filter(c => c.statut === 'ERREUR').length
      
      const scoreCoherence = Math.round((controlesConformes / nombreControles) * 100)

      return {
        nombreControles,
        controlesConformes,
        controlesEcart,
        controlesErreur,
        scoreCoherence,
        controles: todControles
      }

    } catch (error) {
      logger.error('Erreur lors des contrôles de cohérence:', error)
      return {
        nombreControles: 0,
        controlesConformes: 0,
        controlesEcart: 0,
        controlesErreur: 1,
        scoreCoherence: 0,
        controles: [{
          id: 'ERROR_001',
          type: 'BILAN_NOTES',
          description: 'Erreur lors de l\'exécution des contrôles',
          statut: 'ERREUR',
          valeurEtat: 0,
          valeurNote: 0,
          seuil: 0,
          details: error instanceof Error ? error.message : 'Erreur inconnue'
        }]
      }
    }
  }

  /**
   * UTILITAIRES DE VALIDATION
   */
  private evaluerEcart(valeur1: number, valeur2: number, seuil: number): 'CONFORME' | 'ECART' | 'ERREUR' {
    const ecart = Math.abs(valeur1 - valeur2)
    
    if (ecart === 0) return 'CONFORME'
    if (ecart <= seuil) return 'ECART'
    return 'ERREUR'
  }

  private formatMontant(montant: number): string {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(montant)
  }

  /**
   * ALGORITHME AVANCÉ: Détection automatique d'incohérences suspectes
   */
  async detecterIncoherencesSuspectes(donneesLiasse: any): Promise<ControleCoherence[]> {
    const controles: ControleCoherence[] = []

    // Détection de ratios anormaux qui indiquent des incohérences
    const totalActif = donneesLiasse.bilanActif.totalActif || 1
    const totalPassif = donneesLiasse.bilanPassif.totalPassif || 1
    
    // 1. Équilibre fondamental du bilan
    controles.push({
      id: 'BILAN_EQUIL_001',
      type: 'BILAN_NOTES',
      description: 'Équilibre Actif = Passif',
      statut: this.evaluerEcart(totalActif, totalPassif, 10),
      ecart: Math.abs(totalActif - totalPassif),
      valeurEtat: totalActif,
      valeurNote: totalPassif,
      seuil: 10,
      details: `Actif: ${this.formatMontant(totalActif)} vs Passif: ${this.formatMontant(totalPassif)}`,
      recommandation: 'L\'équilibre du bilan doit être parfait (Actif = Passif)'
    })

    // 2. Cohérence CA vs créances clients
    const chiffreAffaires = donneesLiasse.compteResultat.chiffreAffaires || 0
    const creancesClients = donneesLiasse.bilanActif.creancesClients || 0
    const ratioCA = creancesClients / (chiffreAffaires / 12) // Rotation en mois

    if (ratioCA > 6) { // Plus de 6 mois de CA en créances = suspect
      controles.push({
        id: 'RATIO_CA_001',
        type: 'BILAN_NOTES',
        description: 'Ratio créances/CA anormalement élevé',
        statut: 'ECART',
        ecart: ratioCA - 6,
        valeurEtat: ratioCA,
        valeurNote: 6,
        seuil: 6,
        details: `Ratio: ${ratioCA.toFixed(1)} mois vs Normal: <6 mois`,
        recommandation: 'Vérifier la provision pour créances douteuses'
      })
    }

    return controles
  }

  /**
   * Export des résultats pour audit
   */
  async exporterRapportCoherence(resultats: ResultatValidation): Promise<string> {
    let rapport = `# RAPPORT DE CONTRÔLE DE COHÉRENCE SYSCOHADA\n\n`
    rapport += `**Date**: ${new Date().toLocaleDateString('fr-FR')}\n`
    rapport += `**Score global**: ${resultats.scoreCoherence}%\n\n`
    
    rapport += `## STATISTIQUES\n`
    rapport += `- Contrôles effectués: ${resultats.nombreControles}\n`
    rapport += `- Conformes: ${resultats.controlesConformes}\n`
    rapport += `- Écarts: ${resultats.controlesEcart}\n`
    rapport += `- Erreurs: ${resultats.controlesErreur}\n\n`
    
    rapport += `## DÉTAIL DES CONTRÔLES\n\n`
    
    for (const controle of resultats.controles) {
      const emoji = controle.statut === 'CONFORME' ? '✅' : controle.statut === 'ECART' ? '⚠️' : '❌'
      rapport += `### ${emoji} ${controle.description}\n`
      rapport += `**Statut**: ${controle.statut}\n`
      rapport += `**Détails**: ${controle.details}\n`
      if (controle.ecart && controle.ecart > 0) {
        rapport += `**Écart**: ${this.formatMontant(controle.ecart)}\n`
      }
      if (controle.recommandation) {
        rapport += `**Recommandation**: ${controle.recommandation}\n`
      }
      rapport += `\n---\n\n`
    }

    return rapport
  }
}

export const coherenceService = new CoherenceService()
export default coherenceService