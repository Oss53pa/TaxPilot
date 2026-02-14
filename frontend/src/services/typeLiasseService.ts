/**
 * Service pour la gestion des types de liasses fiscales
 * CONNEXION RÉELLE AU BACKEND DJANGO
 */

import { apiClient } from './apiClient'

export interface TypeLiasse {
  id: number
  code: string
  libelle: string
  description: string
  norme_applicable: 'SYSCOHADA' | 'IFRS' | 'NATIONAL' | 'SECTORIEL'

  // Critères d'application
  seuil_ca_min?: number
  seuil_ca_max?: number
  secteur_applicable: string
  pays_applicable: string

  // Propriétés
  est_officiel: boolean
  templates_requis: string[]

  created_at: string
  updated_at: string
}

export interface CreateTypeLiasse {
  code: string
  libelle: string
  description?: string
  norme_applicable: 'SYSCOHADA' | 'IFRS' | 'NATIONAL' | 'SECTORIEL'
  seuil_ca_min?: number
  seuil_ca_max?: number
  secteur_applicable?: string
  pays_applicable?: string
  est_officiel?: boolean
  templates_requis?: string[]
}

export interface TypeLiasseFilters {
  norme_applicable?: 'SYSCOHADA' | 'IFRS' | 'NATIONAL' | 'SECTORIEL'
  est_officiel?: boolean
  pays_applicable?: string
  secteur_applicable?: string
  search?: string
  page?: number
  page_size?: number
}

class TypeLiasseService {
  private baseUrl = '/api/v1/parametrage/types-liasse'

  /**
   * Récupérer la liste des types de liasses
   */
  async list(filters?: TypeLiasseFilters): Promise<{
    count: number
    next: string | null
    previous: string | null
    results: TypeLiasse[]
  }> {
    console.log('🔄 Fetching types de liasse from backend...', filters)
    return apiClient.get(this.baseUrl, filters)
  }

  /**
   * Récupérer tous les types (sans pagination)
   */
  async getAll(filters?: Omit<TypeLiasseFilters, 'page' | 'page_size'>): Promise<TypeLiasse[]> {
    console.log('🔄 Fetching all types de liasse...')
    const data = await apiClient.get<Record<string, any>>(this.baseUrl, { ...filters, page_size: 1000 })
    return data.results || []
  }

  /**
   * Récupérer un type de liasse par ID
   */
  async getById(id: number): Promise<TypeLiasse> {
    console.log(`🔄 Fetching type de liasse ${id}...`)
    return apiClient.get(`${this.baseUrl}/${id}/`)
  }

  /**
   * Créer un nouveau type de liasse
   */
  async create(data: CreateTypeLiasse): Promise<TypeLiasse> {
    console.log('📤 Creating type de liasse...', data)
    return apiClient.post(this.baseUrl, data)
  }

  /**
   * Mettre à jour un type de liasse
   */
  async update(id: number, data: Partial<CreateTypeLiasse>): Promise<TypeLiasse> {
    console.log(`📤 Updating type de liasse ${id}...`, data)
    return apiClient.patch(`${this.baseUrl}/${id}/`, data)
  }

  /**
   * Supprimer un type de liasse
   */
  async delete(id: number): Promise<void> {
    console.log(`🗑️ Deleting type de liasse ${id}...`)
    return apiClient.delete(`${this.baseUrl}/${id}/`)
  }

  /**
   * Récupérer les types SYSCOHADA
   */
  async getSYSCOHADATypes(): Promise<TypeLiasse[]> {
    console.log('🔄 Fetching SYSCOHADA types...')
    const data = await apiClient.get<Record<string, any>>(this.baseUrl, {
      norme_applicable: 'SYSCOHADA',
      page_size: 100
    })
    return data.results || []
  }

  /**
   * Récupérer les types officiels
   */
  async getOfficiels(): Promise<TypeLiasse[]> {
    console.log('🔄 Fetching official types de liasse...')
    const data = await apiClient.get<Record<string, any>>(this.baseUrl, {
      est_officiel: true,
      page_size: 100
    })
    return data.results || []
  }

  /**
   * Récupérer les types applicables pour une entreprise
   */
  async getApplicableTypes(params: {
    chiffre_affaires?: number
    secteur?: string
    pays?: string
  }): Promise<TypeLiasse[]> {
    console.log('🔄 Fetching applicable types for criteria...', params)

    const allTypes = await this.getAll()

    return allTypes.filter(type => {
      // Filtre par CA
      if (params.chiffre_affaires) {
        if (type.seuil_ca_min && params.chiffre_affaires < type.seuil_ca_min) {
          return false
        }
        if (type.seuil_ca_max && params.chiffre_affaires > type.seuil_ca_max) {
          return false
        }
      }

      // Filtre par secteur
      if (params.secteur && type.secteur_applicable) {
        if (type.secteur_applicable !== params.secteur) {
          return false
        }
      }

      // Filtre par pays
      if (params.pays && type.pays_applicable) {
        if (type.pays_applicable !== params.pays) {
          return false
        }
      }

      return true
    })
  }

  /**
   * Obtenir le libellé de la norme
   */
  getNormeLabel(norme: TypeLiasse['norme_applicable']): string {
    const labels = {
      'SYSCOHADA': 'SYSCOHADA Révisé',
      'IFRS': 'Normes IFRS',
      'NATIONAL': 'Normes Nationales',
      'SECTORIEL': 'Normes Sectorielles'
    }
    return labels[norme] || norme
  }

  /**
   * Vérifier si un type nécessite des templates spécifiques
   */
  requiresTemplates(type: TypeLiasse): boolean {
    return type.templates_requis.length > 0
  }

  /**
   * Formater les seuils de CA
   */
  formatSeuilCA(type: TypeLiasse): string {
    if (!type.seuil_ca_min && !type.seuil_ca_max) {
      return 'Tous CA'
    }

    if (type.seuil_ca_min && type.seuil_ca_max) {
      return `${this.formatMontant(type.seuil_ca_min)} - ${this.formatMontant(type.seuil_ca_max)}`
    }

    if (type.seuil_ca_min) {
      return `> ${this.formatMontant(type.seuil_ca_min)}`
    }

    if (type.seuil_ca_max) {
      return `< ${this.formatMontant(type.seuil_ca_max)}`
    }

    return ''
  }

  /**
   * Formater un montant
   */
  private formatMontant(montant: number): string {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(montant)
  }
}

export default new TypeLiasseService()
