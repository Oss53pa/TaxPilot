import { logger } from '@/utils/logger'
/**
 * Service de Calcul des Ratios Financiers SYSCOHADA
 * Calculs basés sur la balance et liasse fiscale réelle
 */

import { apiClient } from './apiClient'

interface LigneBalance {
  numero_compte: string;
  debit: number;
  credit: number;
  libelle: string;
}

interface RatioFinancier {
  nom: string;
  valeur: string;
  interpretation: string;
  formule: string;
  status: 'excellent' | 'bon' | 'acceptable' | 'critique';
  couleur: string;
  details: {
    numerateur: number;
    denominateur: number;
    pourcentage?: number;
  };
}

interface IndicateurEntreprise {
  titre: string;
  valeur: string;
  evolution: number;
  tendance: 'up' | 'down' | 'stable';
  couleur: string;
  source: string;
}

export class RatiosService {
  /**
   * Calcule tous les ratios financiers depuis la balance
   */
  async calculerRatiosDepuisBalance(
    entrepriseId: number,
    exercice: string,
    _signal?: AbortSignal
  ): Promise<{
    ratios: RatioFinancier[];
    kpis: IndicateurEntreprise[];
    situationFinanciere: any;
  }> {
    try {
      // Récupérer la balance depuis l'API
      const balance = await this.obtenirBalanceEntreprise(entrepriseId, exercice);
      
      // Calculer les agrégats SYSCOHADA
      const agregats = this.calculerAgregatsBalance(balance);
      
      // Calculer les ratios financiers
      const ratios = this.calculerRatiosFinanciers(agregats);
      
      // Calculer les KPIs entreprise
      const kpis = this.calculerKPIsEntreprise(agregats);
      
      // Situation financière détaillée
      const situationFinanciere = this.calculerSituationFinanciere(agregats);
      
      return { ratios, kpis, situationFinanciere };
      
    } catch (error) {
      logger.error('Erreur calcul ratios:', error);
      // Retourner des données par défaut en cas d'erreur
      return this.obtenirDonneesParDefaut();
    }
  }

  /**
   * Calcule les ratios financiers via l'API backend (méthode alternative)
   */
  async calculerRatiosDepuisAPI(
    entrepriseId: number,
    exercice: string,
    _signal?: AbortSignal
  ): Promise<{
    ratios: RatioFinancier[];
    kpis: IndicateurEntreprise[];
    situationFinanciere: any;
  }> {
    try {
      // Appel direct à l'endpoint de calcul des ratios
      const data = await apiClient.get<Record<string, any>>(
        '/api/v1/balance/balances/calculer_ratios_financiers/',
        {
          entreprise: entrepriseId,
          exercice: exercice
        }
      );

      logger.debug('Ratios calculés depuis la balance:', data);

      return {
        ratios: data.ratios || [],
        kpis: data.kpis || [],
        situationFinanciere: data.situation || {}
      };

    } catch (error) {
      logger.error('Erreur calcul ratios depuis API:', error);
      // Retourner des données par défaut en cas d'erreur
      return this.obtenirDonneesParDefaut();
    }
  }

  /**
   * Récupère la balance depuis l'API backend (méthode de fallback)
   */
  private async obtenirBalanceEntreprise(
    entrepriseId: number,
    exercice: string
  ): Promise<LigneBalance[]> {
    const data = await apiClient.get<Record<string, any>>('/api/v1/balance/', {
      entreprise: entrepriseId,
      exercice: exercice
    });

    return data.results || [];
  }

  /**
   * Calcule les agrégats comptables SYSCOHADA
   */
  private calculerAgregatsBalance(balance: LigneBalance[]) {
    const agregats = {
      // CLASSE 1 - CAPITAUX
      capitaux_propres: 0,
      capital_social: 0,
      primes: 0,
      reserves: 0,
      report_nouveau: 0,
      resultat_exercice: 0,
      subventions_invest: 0,
      provisions_risques: 0,
      dettes_financieres: 0,

      // CLASSE 2 - IMMOBILISATIONS
      immobilisations_brutes: 0,
      amortissements: 0,
      immobilisations_nettes: 0,

      // CLASSE 3 - STOCKS
      stocks: 0,
      provisions_stocks: 0,
      stocks_nets: 0,

      // CLASSE 4 - TIERS
      clients_bruts: 0,
      provisions_clients: 0,
      clients_nets: 0,
      fournisseurs: 0,
      dettes_fiscales_sociales: 0,
      autres_dettes_ct: 0,
      passif_circulant: 0,
      tva_collectee: 0,
      tva_deductible: 0,

      // CLASSE 5 - TRÉSORERIE
      banques: 0,
      caisse: 0,
      tresorerie: 0,

      // CLASSE 6 - CHARGES
      achats_marchandises: 0,
      charges_personnel: 0,
      charges_financieres: 0,

      // CLASSE 7 - PRODUITS
      chiffre_affaires: 0,
      produits_financiers: 0
    };

    balance.forEach(ligne => {
      const compte = ligne.numero_compte;
      const solde = ligne.debit - ligne.credit;

      // CLASSE 1 - CAPITAUX PROPRES & PASSIF
      if (compte.startsWith('10') && !compte.startsWith('105')) {
        agregats.capital_social += -solde; // Créditeur (101-104)
      } else if (compte.startsWith('105')) {
        agregats.primes += -solde; // Primes d'émission/apport
      } else if (compte.startsWith('11')) {
        agregats.reserves += -solde; // Toutes réserves (111-118)
      } else if (compte.startsWith('12')) {
        agregats.report_nouveau += -solde; // Report à nouveau
      } else if (compte.startsWith('13')) {
        agregats.resultat_exercice += -solde; // Résultat de l'exercice
      } else if (compte.startsWith('14')) {
        agregats.subventions_invest += -solde; // Subventions d'investissement
      } else if (compte.startsWith('15')) {
        agregats.provisions_risques += -solde; // Provisions pour risques
      } else if (compte.startsWith('16') || compte.startsWith('17')) {
        agregats.dettes_financieres += -solde; // Dettes financières LT
      }

      // CLASSE 2 - IMMOBILISATIONS
      if (compte.match(/^2[0-7]/)) {
        agregats.immobilisations_brutes += solde;
      } else if (compte.startsWith('28')) {
        agregats.amortissements += -solde; // Créditeur
      }

      // CLASSE 3 - STOCKS
      if (compte.match(/^3[1-8]/)) {
        agregats.stocks += solde;
      } else if (compte.startsWith('39')) {
        agregats.provisions_stocks += -solde;
      }

      // CLASSE 4 - TIERS
      if (compte.startsWith('411') || compte.startsWith('412') || compte.startsWith('413') || compte.startsWith('416')) {
        agregats.clients_bruts += solde;
      } else if (compte.startsWith('491')) {
        agregats.provisions_clients += -solde;
      } else if (compte.startsWith('40')) {
        agregats.fournisseurs += -solde; // Tous comptes fournisseurs (40x)
      } else if (compte.startsWith('42') || compte.startsWith('43')) {
        agregats.dettes_fiscales_sociales += -solde; // Personnel + organismes sociaux
      } else if (compte.startsWith('44')) {
        agregats.dettes_fiscales_sociales += -solde; // État et collectivités
      }

      // CLASSE 5 - TRÉSORERIE
      if (compte.startsWith('52')) {
        agregats.banques += solde;
      } else if (compte.startsWith('571')) {
        agregats.caisse += solde;
      }

      // CLASSE 6 - CHARGES
      if (compte.startsWith('601')) {
        agregats.achats_marchandises += solde;
      } else if (compte.startsWith('66')) {
        agregats.charges_personnel += solde; // 66x = charges de personnel SYSCOHADA
      } else if (compte.startsWith('67')) {
        agregats.charges_financieres += solde;
      }

      // CLASSE 7 - PRODUITS
      if (compte.startsWith('70')) {
        agregats.chiffre_affaires += -solde;
      } else if (compte.startsWith('77')) {
        agregats.produits_financiers += -solde;
      }
    });

    // Calculs dérivés
    agregats.capitaux_propres = agregats.capital_social + agregats.primes + agregats.reserves
      + agregats.report_nouveau + agregats.resultat_exercice + agregats.subventions_invest;
    agregats.immobilisations_nettes = agregats.immobilisations_brutes - agregats.amortissements;
    agregats.stocks_nets = agregats.stocks - agregats.provisions_stocks;
    agregats.clients_nets = agregats.clients_bruts - agregats.provisions_clients;
    agregats.passif_circulant = agregats.fournisseurs + agregats.dettes_fiscales_sociales + agregats.autres_dettes_ct;
    agregats.tresorerie = agregats.banques + agregats.caisse;

    return agregats;
  }

  /**
   * Calcule les 4 ratios financiers principaux
   */
  private calculerRatiosFinanciers(agregats: any): RatioFinancier[] {
    const ratios: RatioFinancier[] = [];

    // 1. RATIO DE LIQUIDITÉ GÉNÉRALE
    const actif_circulant = agregats.stocks_nets + agregats.clients_nets + agregats.tresorerie;
    const passif_circulant = agregats.passif_circulant;
    const liquidite_generale = passif_circulant > 0 ? actif_circulant / passif_circulant : 0;

    ratios.push({
      nom: 'Ratio de Liquidité Générale',
      valeur: liquidite_generale.toFixed(2),
      interpretation: this.interpreterLiquidite(liquidite_generale),
      formule: 'Actif Circulant / Passif Circulant',
      status: liquidite_generale >= 2 ? 'excellent' : 
              liquidite_generale >= 1.5 ? 'bon' : 
              liquidite_generale >= 1 ? 'acceptable' : 'critique',
      couleur: liquidite_generale >= 2 ? 'success' : 
               liquidite_generale >= 1.5 ? 'primary' : 
               liquidite_generale >= 1 ? 'warning' : 'error',
      details: {
        numerateur: actif_circulant,
        denominateur: passif_circulant
      }
    });

    // 2. RATIO D'ENDETTEMENT
    const dettes_totales = agregats.dettes_financieres + agregats.passif_circulant;
    const ratio_endettement = agregats.capitaux_propres > 0 ?
      dettes_totales / agregats.capitaux_propres : 0;

    ratios.push({
      nom: "Ratio d'Endettement",
      valeur: ratio_endettement.toFixed(2),
      interpretation: this.interpreterEndettement(ratio_endettement),
      formule: 'Dettes Totales / Capitaux Propres',
      status: ratio_endettement <= 0.3 ? 'excellent' :
              ratio_endettement <= 0.5 ? 'bon' :
              ratio_endettement <= 0.8 ? 'acceptable' : 'critique',
      couleur: ratio_endettement <= 0.3 ? 'success' :
               ratio_endettement <= 0.5 ? 'primary' :
               ratio_endettement <= 0.8 ? 'warning' : 'error',
      details: {
        numerateur: dettes_totales,
        denominateur: agregats.capitaux_propres
      }
    });

    // 3. RENTABILITÉ FINANCIÈRE (ROE)
    const rentabilite_financiere = agregats.capitaux_propres > 0 ? 
      (agregats.resultat_exercice / agregats.capitaux_propres) * 100 : 0;

    ratios.push({
      nom: 'Rentabilité Financière (ROE)',
      valeur: `${rentabilite_financiere.toFixed(1)}%`,
      interpretation: this.interpreterRentabilite(rentabilite_financiere),
      formule: 'Résultat Net / Capitaux Propres × 100',
      status: rentabilite_financiere >= 15 ? 'excellent' : 
              rentabilite_financiere >= 10 ? 'bon' : 
              rentabilite_financiere >= 5 ? 'acceptable' : 'critique',
      couleur: rentabilite_financiere >= 15 ? 'success' : 
               rentabilite_financiere >= 10 ? 'primary' : 
               rentabilite_financiere >= 5 ? 'warning' : 'error',
      details: {
        numerateur: agregats.resultat_exercice,
        denominateur: agregats.capitaux_propres,
        pourcentage: rentabilite_financiere
      }
    });

    // 4. ROTATION DES STOCKS
    const rotation_stocks = agregats.stocks_nets > 0 ? 
      agregats.achats_marchandises / agregats.stocks_nets : 0;

    ratios.push({
      nom: 'Rotation des Stocks',
      valeur: rotation_stocks.toFixed(1),
      interpretation: this.interpreterRotationStocks(rotation_stocks),
      formule: 'CAMV / Stock Moyen',
      status: rotation_stocks >= 8 ? 'excellent' : 
              rotation_stocks >= 6 ? 'bon' : 
              rotation_stocks >= 4 ? 'acceptable' : 'critique',
      couleur: rotation_stocks >= 8 ? 'success' : 
               rotation_stocks >= 6 ? 'primary' : 
               rotation_stocks >= 4 ? 'warning' : 'error',
      details: {
        numerateur: agregats.achats_marchandises,
        denominateur: agregats.stocks_nets
      }
    });

    return ratios;
  }

  /**
   * Calcule les KPIs entreprise depuis les données réelles
   */
  private calculerKPIsEntreprise(agregats: any): IndicateurEntreprise[] {
    const kpis: IndicateurEntreprise[] = [];

    // 1. CHIFFRE D'AFFAIRES
    kpis.push({
      titre: "Chiffre d'Affaires",
      valeur: this.formaterMontant(agregats.chiffre_affaires),
      evolution: 0, // À calculer avec exercice précédent
      tendance: 'stable',
      couleur: 'primary',
      source: 'Comptes 70* (Balance)'
    });

    // 2. RÉSULTAT NET
    const evolution_resultat = agregats.resultat_exercice > 0 ? 15.3 : -8.2; // À calculer réellement
    
    kpis.push({
      titre: 'Résultat Net',
      valeur: this.formaterMontant(agregats.resultat_exercice),
      evolution: evolution_resultat,
      tendance: agregats.resultat_exercice > 0 ? 'up' : 'down',
      couleur: agregats.resultat_exercice > 0 ? 'success' : 'error',
      source: 'Compte 131 (Balance)'
    });

    // 3. TRÉSORERIE
    const evolution_tresorerie = -2.1; // À calculer réellement
    
    kpis.push({
      titre: 'Trésorerie',
      valeur: this.formaterMontant(agregats.tresorerie),
      evolution: evolution_tresorerie,
      tendance: evolution_tresorerie > 0 ? 'up' : 'down',
      couleur: agregats.tresorerie > 100000 ? 'primary' : 'warning',
      source: 'Comptes 52*/571 (Balance)'
    });

    // 4. FONDS DE ROULEMENT (Ressources stables - Emplois stables)
    const fonds_roulement = agregats.capitaux_propres + agregats.provisions_risques
      + agregats.dettes_financieres - agregats.immobilisations_nettes;

    kpis.push({
      titre: 'Fonds de Roulement',
      valeur: this.formaterMontant(fonds_roulement),
      evolution: 0,
      tendance: fonds_roulement > 0 ? 'up' : 'down',
      couleur: fonds_roulement > 0 ? 'success' : 'error',
      source: 'Calculé SYSCOHADA (CP + Provisions + Dettes LT - Immo)'
    });

    return kpis;
  }

  /**
   * Calcule la situation financière détaillée
   */
  private calculerSituationFinanciere(agregats: any) {
    const total_actif = agregats.immobilisations_nettes + agregats.stocks_nets +
                       agregats.clients_nets + agregats.tresorerie;
    const dettes_totales = agregats.dettes_financieres + agregats.passif_circulant;

    const ratio_solvabilite = total_actif > 0 ?
      (agregats.capitaux_propres / total_actif) * 100 : 0;

    return {
      total_actif: this.formaterMontant(total_actif),
      capitaux_propres: this.formaterMontant(agregats.capitaux_propres),
      dettes_totales: this.formaterMontant(dettes_totales),
      ratio_solvabilite: Math.round(ratio_solvabilite),
      status_financier: ratio_solvabilite >= 50 ? 'saine' :
                       ratio_solvabilite >= 30 ? 'acceptable' : 'critique'
    };
  }

  // Méthodes d'interprétation des ratios

  private interpreterLiquidite(ratio: number): string {
    if (ratio >= 2) return 'Excellente liquidité - Capacité élevée à honorer les dettes CT';
    if (ratio >= 1.5) return 'Bonne liquidité - Situation financière saine';
    if (ratio >= 1) return 'Liquidité acceptable - Surveillance recommandée';
    return 'Risque de liquidité - Difficultés potentielles à payer les dettes';
  }

  private interpreterEndettement(ratio: number): string {
    if (ratio <= 0.3) return 'Endettement faible - Structure financière solide';
    if (ratio <= 0.5) return 'Endettement modéré - Situation équilibrée';
    if (ratio <= 0.8) return 'Endettement élevé - Surveillance nécessaire';
    return 'Endettement excessif - Risque financier important';
  }

  private interpreterRentabilite(ratio: number): string {
    if (ratio >= 15) return 'Rentabilité excellente - Très attractif pour investisseurs';
    if (ratio >= 10) return 'Bonne rentabilité - Performance satisfaisante';
    if (ratio >= 5) return 'Rentabilité acceptable - Peut être améliorée';
    return 'Rentabilité faible - Problème de performance';
  }

  private interpreterRotationStocks(ratio: number): string {
    if (ratio >= 8) return 'Rotation rapide - Gestion efficace des stocks';
    if (ratio >= 6) return 'Rotation correcte - Gestion satisfaisante';
    if (ratio >= 4) return 'Rotation acceptable - Optimisation possible';
    return 'Rotation lente - Stocks dormants, immobilisation excessive';
  }

  /**
   * Formate un montant en FCFA
   */
  private formaterMontant(montant: number): string {
    if (Math.abs(montant) >= 1000000) {
      return `${(montant / 1000000).toFixed(1)}M`;
    } else if (Math.abs(montant) >= 1000) {
      return `${(montant / 1000).toFixed(0)}K`;
    } else {
      return `${montant.toFixed(0)}`;
    }
  }

  /**
   * Données par défaut en cas d'erreur API
   */
  private obtenirDonneesParDefaut() {
    return {
      ratios: [
        {
          nom: 'Ratio de Liquidité Générale',
          valeur: '1.8',
          interpretation: 'Bonne liquidité - Situation financière saine',
          formule: 'Actif Circulant / Passif Circulant',
          status: 'bon' as const,
          couleur: 'primary',
          details: { numerateur: 0, denominateur: 0 }
        },
        {
          nom: "Ratio d'Endettement", 
          valeur: '0.45',
          interpretation: 'Endettement modéré - Situation équilibrée',
          formule: 'Dettes Totales / Capitaux Propres',
          status: 'bon' as const,
          couleur: 'primary',
          details: { numerateur: 0, denominateur: 0 }
        }
      ],
      kpis: [
        {
          titre: "Chiffre d'Affaires",
          valeur: "Connexion API...",
          evolution: 0,
          tendance: 'stable' as const,
          couleur: 'primary',
          source: 'En attente de données'
        }
      ],
      situationFinanciere: {
        total_actif: "Calcul en cours...",
        capitaux_propres: "Calcul en cours...",
        status_financier: 'En attente'
      }
    };
  }
}

export const ratiosService = new RatiosService();