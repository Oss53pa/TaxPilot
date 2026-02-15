import { logger } from '@/utils/logger'
/**
 * Service pour la gestion des entreprises
 */

import { apiClient } from './apiClient'

export interface Entreprise {
  id: string
  raison_sociale: string
  forme_juridique: string
  numero_contribuable: string
  rccm?: string
  ifu?: string
  adresse_ligne1: string
  adresse_ligne2?: string
  ville: string
  code_postal?: string
  pays: string
  pays_detail?: {
    nom: string
    code_iso: string
  }
  telephone?: string
  email: string
  site_web?: string
  nom_dirigeant: string
  fonction_dirigeant: string
  email_dirigeant?: string
  regime_imposition: string
  centre_impots: string
  secteur_activite: string
  chiffre_affaires_annuel: number
  devise_principale: string
  devise_principale_detail?: {
    code_iso: string
    nom: string
    symbole: string
  }
  precision_montants: number
  logo?: string
  couleur_principale: string
  couleur_secondaire: string
  is_groupe: boolean
  entreprise_mere?: string
  date_souscription: string
  date_fin_abonnement?: string
  statut_abonnement: 'ACTIF' | 'SUSPENDU' | 'EXPIRE'
  type_abonnement: 'STARTER' | 'PME' | 'ENTREPRISE'
  type_liasse_detecte?: TypeLiasse
  capital_social?: number
  numero_comptable?: string
  exercice_debut?: string
  exercice_fin?: string
  date_depot?: string
  telephone_dirigeant?: string
  // R1 - Effectifs & Groupe
  nombre_etablissements?: number
  effectif_permanent?: number
  effectif_temporaire?: number
  masse_salariale?: number
  nom_groupe?: string
  pays_siege_groupe?: string
  cac_nom?: string
  cac_adresse?: string
  cac_numero_inscription?: string
  expert_nom?: string
  expert_adresse?: string
  expert_numero_inscription?: string
  // R2 - Dirigeants & Commissaires (JSON)
  dirigeants?: any[]
  commissaires_comptes?: any[]
  // R3 - Participations (JSON)
  participations_filiales?: any[]
  created_at: string
  updated_at: string
}

export interface TypeLiasse {
  id: string
  code: string
  libelle: string
  description: string
  norme_applicable: 'SYSCOHADA' | 'IFRS' | 'NATIONAL' | 'SECTORIEL'
  seuil_ca_min?: number
  seuil_ca_max?: number
  secteur_applicable?: string
  pays_applicable?: string
  est_officiel: boolean
  templates_requis: string[]
}

export interface EntrepriseStats {
  nb_exercices: number
  exercice_actuel?: any
  nb_balances_importees: number
  nb_liasses_generees: number
  derniere_connexion?: string
  nb_utilisateurs_actifs: number
  taille_donnees_mb: number
}

export interface DashboardStats {
  total_entreprises: number
  entreprises_actives: number
  groupes: number
  filiales: number
  par_secteur: Array<{ secteur_activite: string; count: number }>
  par_forme_juridique: Array<{ forme_juridique: string; count: number }>
  nouveaux_ce_mois: number
}

class EntrepriseService {
  private baseUrl = '/api/v1/parametrage/entreprises'

  // CRUD Operations
  async getEntreprises(params?: {
    page?: number
    page_size?: number
    search?: string
    forme_juridique?: string
    secteur_activite?: string
    pays?: string
  }): Promise<{ results: Entreprise[]; count: number; next?: string; previous?: string }> {
    logger.debug('Fetching entreprises from backend...', params)
    return apiClient.get(this.baseUrl + '/', params)
  }

  async getEntreprise(id: string): Promise<Entreprise> {
    logger.debug(`Fetching entreprise ${id} from backend...`)
    return apiClient.get(`${this.baseUrl}/${id}/`)
  }

  async createEntreprise(data: Partial<Entreprise>): Promise<Entreprise> {
    logger.debug('Creating entreprise in backend...', data)
    return apiClient.post(this.baseUrl + '/', data)
  }

  async updateEntreprise(id: string, data: Partial<Entreprise>): Promise<Entreprise> {
    logger.debug(`Updating entreprise ${id} in backend...`, data)
    return apiClient.patch(`${this.baseUrl}/${id}/`, data)
  }

  async deleteEntreprise(id: string): Promise<void> {
    logger.debug(`Deleting entreprise ${id} from backend...`)
    return apiClient.delete(`${this.baseUrl}/${id}/`)
  }

  // Actions spécifiques
  async getConfiguration(id: string) {
    return apiClient.get(`${this.baseUrl}/${id}/configuration/`)
  }

  async updateConfiguration(id: string, config: any) {
    return apiClient.patch(`${this.baseUrl}/${id}/configuration/`, config)
  }

  async getStats(id: string): Promise<EntrepriseStats> {
    return apiClient.get(`${this.baseUrl}/${id}/stats/`)
  }

  async detectLiasseType(id: string) {
    return apiClient.post(`${this.baseUrl}/${id}/detect_liasse_type/`)
  }

  async searchAdvanced(params: {
    ca_min?: number
    ca_max?: number
    ville?: string
    membre_groupe?: boolean
  }): Promise<Entreprise[]> {
    return apiClient.get(`${this.baseUrl}/search_advanced/`, params)
  }

  async getDashboardStats(): Promise<DashboardStats> {
    return apiClient.get(`${this.baseUrl}/dashboard_stats/`)
  }

  // Types de liasse
  async getTypesLiasse(params?: {
    ca?: number
    secteur?: string
    pays?: string
  }): Promise<TypeLiasse[]> {
    const baseUrl = '/api/v1/parametrage/types-liasse'
    if (params && Object.keys(params).length > 0) {
      return apiClient.get(`${baseUrl}/by_criteria/`, params)
    }
    return apiClient.get(`${baseUrl}/`)
  }

  async getTypesLiasseSyscohada(): Promise<TypeLiasse[]> {
    return apiClient.get('/api/v1/parametrage/types-liasse/officiel_syscohada/')
  }
}

export const entrepriseService = new EntrepriseService()
export default entrepriseService