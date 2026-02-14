/**
 * Service d'intégration Backend pour la Liasse Fiscale
 *
 * Connecte le service liasseDataService.ts aux API Django
 * Endpoints: /api/generation/liasses/
 */

import apiClient from './apiClient'
import { liasseDataService, BalanceEntry } from './liasseDataService'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface LiasseFiscaleDTO {
  id?: number
  entreprise: number
  exercice: number
  type_liasse: 'NORMAL' | 'SIMPLIFIE' | 'CONSOLIDE'
  date_cloture: string
  statut: 'BROUILLON' | 'EN_COURS' | 'TERMINE' | 'VALIDE' | 'TRANSMIS'
  progression: number
  donnees_json?: any
  created_at?: string
  updated_at?: string
}

export interface EtatFinancierDTO {
  id?: number
  liasse: number
  type_etat: 'BILAN_ACTIF' | 'BILAN_PASSIF' | 'COMPTE_RESULTAT' | 'FLUX_TRESORERIE' | 'NOTE_ANNEXE'
  numero_etat?: string
  libelle: string
  donnees_json: any
  calculs_automatiques?: any
  validations?: any
  created_at?: string
  updated_at?: string
}

export interface ProcessusGenerationDTO {
  id?: number
  liasse: number
  statut: 'INITIALISE' | 'EN_COURS' | 'TERMINE' | 'ERREUR'
  etape_courante?: string
  progression: number
  temps_estime?: number
  temps_reel?: number
  erreurs?: string[]
  logs_json?: any
  date_debut?: string
  date_fin?: string
}

export interface ValidationLiasseResponse {
  score_validation: number
  nb_erreurs_critiques: number
  nb_avertissements: number
  nb_controles_reussis: number
  prete_validation: boolean
  prete_teledeclaration: boolean
  erreurs: Array<{
    code: string
    message: string
    severite: 'CRITIQUE' | 'HAUTE' | 'MOYENNE' | 'BASSE'
    suggestion?: string
  }>
  avertissements: Array<{
    code: string
    message: string
    suggestion?: string
  }>
}

// ============================================================================
// SERVICE LIASSE FISCALE
// ============================================================================

class LiasseService {
  private readonly baseUrl = '/api/generation/liasses'

  /**
   * Crée une nouvelle liasse fiscale
   */
  async createLiasse(data: Partial<LiasseFiscaleDTO>): Promise<LiasseFiscaleDTO> {
    const response = await apiClient.post<LiasseFiscaleDTO>(this.baseUrl + '/', data)
    return response.data
  }

  /**
   * Récupère une liasse par ID
   */
  async getLiasse(id: number): Promise<LiasseFiscaleDTO> {
    const response = await apiClient.get<LiasseFiscaleDTO>(`${this.baseUrl}/${id}/`)
    return response.data
  }

  /**
   * Liste toutes les liasses
   */
  async listLiasses(params?: {
    entreprise?: number
    exercice?: number
    statut?: string
  }): Promise<LiasseFiscaleDTO[]> {
    const response = await apiClient.get<LiasseFiscaleDTO[]>(this.baseUrl + '/', { params })
    return response.data
  }

  /**
   * Met à jour une liasse
   */
  async updateLiasse(id: number, data: Partial<LiasseFiscaleDTO>): Promise<LiasseFiscaleDTO> {
    const response = await apiClient.patch<LiasseFiscaleDTO>(`${this.baseUrl}/${id}/`, data)
    return response.data
  }

  /**
   * Supprime une liasse
   */
  async deleteLiasse(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}/`)
  }

  // ==========================================================================
  // ACTIONS MÉTIER
  // ==========================================================================

  /**
   * Lance la production automatisée d'une liasse
   */
  async lancerProduction(
    liasseId: number,
    balanceData: BalanceEntry[]
  ): Promise<ProcessusGenerationDTO> {
    // Charger la balance dans le service de mapping
    liasseDataService.loadBalance(balanceData)

    // Générer les états financiers via mapping SYSCOHADA
    const bilanActif = liasseDataService.generateBilanActif()
    const bilanPassif = liasseDataService.generateBilanPassif()
    const compteResultat = liasseDataService.generateCompteResultat()

    // Valider la cohérence
    const validation = liasseDataService.validateCoherence()

    // Lancer le processus côté backend
    const response = await apiClient.post<ProcessusGenerationDTO>(
      `${this.baseUrl}/${liasseId}/lancer_production/`,
      {
        balance: balanceData,
        bilan_actif: bilanActif,
        bilan_passif: bilanPassif,
        compte_resultat: compteResultat,
        validation_coherence: validation
      }
    )

    return response.data
  }

  /**
   * Récupère le statut de production
   */
  async getStatutProduction(liasseId: number): Promise<ProcessusGenerationDTO> {
    const response = await apiClient.get<ProcessusGenerationDTO>(
      `${this.baseUrl}/${liasseId}/statut_production/`
    )
    return response.data
  }

  /**
   * Valide une liasse avant soumission
   */
  async validerLiasse(liasseId: number): Promise<ValidationLiasseResponse> {
    const response = await apiClient.post<ValidationLiasseResponse>(
      `${this.baseUrl}/${liasseId}/valider/`
    )
    return response.data
  }

  /**
   * Génère les pré-commentaires automatiques
   */
  async genererPreCommentaires(liasseId: number): Promise<any[]> {
    const response = await apiClient.post<any[]>(
      `${this.baseUrl}/${liasseId}/generer_pre_commentaires/`
    )
    return response.data
  }

  /**
   * Exporte une liasse au format spécifié
   */
  async exporterLiasse(
    liasseId: number,
    format: 'PDF' | 'EXCEL' | 'XML' | 'JSON'
  ): Promise<Blob> {
    const response = await apiClient.post(
      `${this.baseUrl}/${liasseId}/exporter/`,
      { format },
      { responseType: 'blob' }
    )
    return response.data
  }

  /**
   * Télédéclare une liasse validée
   */
  async teledeclarerLiasse(liasseId: number, data: {
    organisme: string
    login: string
    password: string
  }): Promise<{ success: boolean; message: string; numero_depot?: string }> {
    const response = await apiClient.post(
      `${this.baseUrl}/${liasseId}/teledeclarer/`,
      data
    )
    return response.data
  }

  // ==========================================================================
  // ÉTATS FINANCIERS
  // ==========================================================================

  /**
   * Récupère tous les états d'une liasse
   */
  async getEtatsFinanciers(liasseId: number): Promise<EtatFinancierDTO[]> {
    const response = await apiClient.get<EtatFinancierDTO[]>(
      `/api/generation/etats/`,
      { params: { liasse: liasseId } }
    )
    return response.data
  }

  /**
   * Crée ou met à jour un état financier
   */
  async saveEtatFinancier(data: Partial<EtatFinancierDTO>): Promise<EtatFinancierDTO> {
    if (data.id) {
      const response = await apiClient.patch<EtatFinancierDTO>(
        `/api/generation/etats/${data.id}/`,
        data
      )
      return response.data
    } else {
      const response = await apiClient.post<EtatFinancierDTO>(
        `/api/generation/etats/`,
        data
      )
      return response.data
    }
  }

  /**
   * Calcule automatiquement un état financier à partir de la balance
   */
  async calculerEtatAutomatique(
    liasseId: number,
    typeEtat: EtatFinancierDTO['type_etat'],
    balanceData: BalanceEntry[]
  ): Promise<any> {
    // Charger la balance
    liasseDataService.loadBalance(balanceData)

    // Générer l'état selon le type
    let donneesCalculees: any

    switch (typeEtat) {
      case 'BILAN_ACTIF':
        donneesCalculees = liasseDataService.generateBilanActif()
        break
      case 'BILAN_PASSIF':
        donneesCalculees = liasseDataService.generateBilanPassif()
        break
      case 'COMPTE_RESULTAT':
        donneesCalculees = liasseDataService.generateCompteResultat()
        break
      default:
        throw new Error(`Type d'état non supporté: ${typeEtat}`)
    }

    // Sauvegarder l'état
    return await this.saveEtatFinancier({
      liasse: liasseId,
      type_etat: typeEtat,
      libelle: this.getLibelleEtat(typeEtat),
      donnees_json: donneesCalculees,
      calculs_automatiques: {
        date_calcul: new Date().toISOString(),
        source: 'MAPPING_SYSCOHADA',
        nb_comptes_mappes: balanceData.length
      }
    })
  }

  private getLibelleEtat(typeEtat: EtatFinancierDTO['type_etat']): string {
    const libelles = {
      'BILAN_ACTIF': 'Bilan - Actif',
      'BILAN_PASSIF': 'Bilan - Passif',
      'COMPTE_RESULTAT': 'Compte de Résultat',
      'FLUX_TRESORERIE': 'Tableau de Flux de Trésorerie',
      'NOTE_ANNEXE': 'Note Annexe'
    }
    return libelles[typeEtat]
  }

  // ==========================================================================
  // TEMPLATES ET CONFIGURATION
  // ==========================================================================

  /**
   * Récupère les templates disponibles par secteur/juridiction
   */
  async getTemplates(filters?: {
    secteur?: string
    juridiction?: string
    type_liasse?: string
  }): Promise<any[]> {
    const response = await apiClient.get('/api/generation/configurations/', {
      params: filters
    })
    return response.data
  }

  /**
   * Applique un template à une liasse
   */
  async appliquerTemplate(liasseId: number, templateId: number): Promise<LiasseFiscaleDTO> {
    const response = await apiClient.post<LiasseFiscaleDTO>(
      `${this.baseUrl}/${liasseId}/appliquer_template/`,
      { template_id: templateId }
    )
    return response.data
  }
}

// Instance singleton
export const liasseService = new LiasseService()

// Export du service
export default liasseService
