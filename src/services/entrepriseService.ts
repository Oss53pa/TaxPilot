/**
 * Service pour la gestion des entreprises
 */

import { apiService } from './api'

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
  private baseUrl = '/api/v1/parametrage/api/entreprises'

  // CRUD Operations
  async getEntreprises(params?: {
    page?: number
    page_size?: number
    search?: string
    forme_juridique?: string
    secteur_activite?: string
    pays?: string
  }): Promise<{ results: Entreprise[]; count: number; next?: string; previous?: string }> {
    return apiService.get(this.baseUrl + '/', params)
  }

  async getEntreprise(id: string): Promise<Entreprise> {
    return apiService.get(`${this.baseUrl}/${id}/`)
  }

  async createEntreprise(data: Partial<Entreprise>): Promise<Entreprise> {
    return apiService.post(this.baseUrl + '/', data)
  }

  async updateEntreprise(id: string, data: Partial<Entreprise>): Promise<Entreprise> {
    return apiService.patch(`${this.baseUrl}/${id}/`, data)
  }

  async deleteEntreprise(id: string): Promise<void> {
    return apiService.delete(`${this.baseUrl}/${id}/`)
  }

  // Actions spécifiques
  async getConfiguration(id: string) {
    return apiService.get(`${this.baseUrl}/${id}/configuration/`)
  }

  async updateConfiguration(id: string, config: any) {
    return apiService.patch(`${this.baseUrl}/${id}/configuration/`, config)
  }

  async getStats(id: string): Promise<EntrepriseStats> {
    return apiService.get(`${this.baseUrl}/${id}/stats/`)
  }

  async detectLiasseType(id: string) {
    return apiService.post(`${this.baseUrl}/${id}/detect_liasse_type/`)
  }

  async searchAdvanced(params: {
    ca_min?: number
    ca_max?: number
    ville?: string
    membre_groupe?: boolean
  }): Promise<Entreprise[]> {
    return apiService.get(`${this.baseUrl}/search_advanced/`, params)
  }

  async getDashboardStats(): Promise<DashboardStats> {
    return apiService.get(`${this.baseUrl}/dashboard_stats/`)
  }

  // Types de liasse
  async getTypesLiasse(params?: {
    ca?: number
    secteur?: string
    pays?: string
  }): Promise<TypeLiasse[]> {
    const baseUrl = '/api/v1/parametrage/api/types-liasse'
    if (params && Object.keys(params).length > 0) {
      return apiService.get(`${baseUrl}/by_criteria/`, params)
    }
    return apiService.get(`${baseUrl}/`)
  }

  async getTypesLiasseSyscohada(): Promise<TypeLiasse[]> {
    return apiService.get('/api/v1/parametrage/api/types-liasse/officiel_syscohada/')
  }
}

export const entrepriseService = new EntrepriseService()
export default entrepriseService