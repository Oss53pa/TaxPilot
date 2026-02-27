/**
 * Service pour la gestion des exercices comptables
 * CONNEXION RÉELLE AU BACKEND DJANGO
 */

import { apiClient } from './apiClient'

export interface ExerciceComptable {
  id: number
  entreprise: number
  entreprise_detail?: {
    id: number
    raison_sociale: string
    numero_contribuable: string
  }
  nom: string
  date_debut: string
  date_fin: string
  statut: 'OUVERT' | 'CLOTURE' | 'ARCHIVE'
  est_exercice_actuel: boolean
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
}

export interface CreateExerciceComptable {
  entreprise: number
  nom: string
  date_debut: string
  date_fin: string
  statut?: 'OUVERT' | 'CLOTURE' | 'ARCHIVE'
  est_exercice_actuel?: boolean
}

export interface ExerciceFilters {
  entreprise?: number
  statut?: 'OUVERT' | 'CLOTURE' | 'ARCHIVE'
  est_exercice_actuel?: boolean
  page?: number
  page_size?: number
  ordering?: string
}

class ExerciceService {
  private baseUrl = '/api/v1/parametrage/exercices'

  /**
   * Récupérer la liste des exercices comptables
   */
  async list(filters?: ExerciceFilters): Promise<{
    count: number
    next: string | null
    previous: string | null
    results: ExerciceComptable[]
  }> {
    console.log('🔄 Fetching exercices from backend...', filters)
    return apiClient.get(this.baseUrl, filters)
  }

  /**
   * Récupérer tous les exercices (sans pagination)
   */
  async getAll(filters?: Omit<ExerciceFilters, 'page' | 'page_size'>): Promise<ExerciceComptable[]> {
    console.log('🔄 Fetching all exercices from backend...', filters)
    const data = await apiClient.get(this.baseUrl, { ...filters, page_size: 1000 })
    return data.results || []
  }

  /**
   * Récupérer un exercice comptable par ID
   */
  async getById(id: number): Promise<ExerciceComptable> {
    console.log(`🔄 Fetching exercice ${id} from backend...`)
    return apiClient.get(`${this.baseUrl}/${id}/`)
  }

  /**
   * Créer un nouvel exercice comptable
   */
  async create(data: CreateExerciceComptable): Promise<ExerciceComptable> {
    console.log('📤 Creating exercice in backend...', data)
    return apiClient.post(this.baseUrl, data)
  }

  /**
   * Mettre à jour un exercice comptable
   */
  async update(id: number, data: Partial<CreateExerciceComptable>): Promise<ExerciceComptable> {
    console.log(`📤 Updating exercice ${id} in backend...`, data)
    return apiClient.patch(`${this.baseUrl}/${id}/`, data)
  }

  /**
   * Supprimer un exercice comptable
   */
  async delete(id: number): Promise<void> {
    console.log(`🗑️ Deleting exercice ${id} from backend...`)
    return apiClient.delete(`${this.baseUrl}/${id}/`)
  }

  /**
   * Récupérer les exercices actuels
   */
  async getCurrent(entrepriseId?: number): Promise<ExerciceComptable[]> {
    console.log('🔄 Fetching current exercices from backend...', { entrepriseId })
    const params = entrepriseId ? { entreprise: entrepriseId } : undefined
    return apiClient.get(`${this.baseUrl}/current/`, params)
  }

  /**
   * Récupérer l'exercice actuel d'une entreprise
   */
  async getCurrentForEntreprise(entrepriseId: number): Promise<ExerciceComptable | null> {
    console.log(`🔄 Fetching current exercice for entreprise ${entrepriseId}...`)
    const exercices = await this.getCurrent(entrepriseId)
    return exercices.length > 0 ? exercices[0] : null
  }

  /**
   * Clôturer un exercice comptable
   */
  async cloturer(id: number): Promise<ExerciceComptable> {
    console.log(`🔒 Closing exercice ${id} in backend...`)
    return apiClient.post(`${this.baseUrl}/${id}/cloturer/`)
  }

  /**
   * Rouvrir un exercice comptable clôturé
   */
  async rouvrir(id: number): Promise<ExerciceComptable> {
    console.log(`🔓 Reopening exercice ${id} in backend...`)
    return apiClient.post(`${this.baseUrl}/${id}/rouvrir/`)
  }

  /**
   * Récupérer les exercices d'une entreprise
   */
  async getByEntreprise(entrepriseId: number, includeArchived = false): Promise<ExerciceComptable[]> {
    console.log(`🔄 Fetching exercices for entreprise ${entrepriseId}...`)
    const filters: ExerciceFilters = {
      entreprise: entrepriseId,
      page_size: 1000
    }

    const data = await apiClient.get(this.baseUrl, filters)
    let exercices = data.results || []

    // Filtrer les archivés si demandé
    if (!includeArchived) {
      exercices = exercices.filter((ex: ExerciceComptable) => ex.statut !== 'ARCHIVE')
    }

    return exercices
  }

  /**
   * Récupérer les exercices ouverts d'une entreprise
   */
  async getOuvertsForEntreprise(entrepriseId: number): Promise<ExerciceComptable[]> {
    console.log(`🔄 Fetching open exercices for entreprise ${entrepriseId}...`)
    const data = await apiClient.get(this.baseUrl, {
      entreprise: entrepriseId,
      statut: 'OUVERT',
      page_size: 1000
    })
    return data.results || []
  }

  /**
   * Définir un exercice comme exercice actuel
   */
  async setAsCurrentExercice(id: number): Promise<ExerciceComptable> {
    console.log(`⭐ Setting exercice ${id} as current...`)
    return apiClient.patch(`${this.baseUrl}/${id}/`, {
      est_exercice_actuel: true
    })
  }

  /**
   * Valider qu'un exercice peut être clôturé
   */
  async validateClotureEligibility(id: number): Promise<{
    can_close: boolean
    errors: string[]
    warnings: string[]
  }> {
    console.log(`🔍 Validating cloture eligibility for exercice ${id}...`)
    try {
      const exercice = await this.getById(id)

      const errors: string[] = []
      const warnings: string[] = []

      // Vérifications de base
      if (exercice.statut !== 'OUVERT') {
        errors.push('Seuls les exercices ouverts peuvent être clôturés')
      }

      const today = new Date()
      const dateFin = new Date(exercice.date_fin)

      if (dateFin > today) {
        warnings.push('La date de fin de l\'exercice n\'est pas encore atteinte')
      }

      return {
        can_close: errors.length === 0,
        errors,
        warnings
      }
    } catch (error) {
      console.error('Error validating cloture:', error)
      return {
        can_close: false,
        errors: ['Erreur lors de la validation'],
        warnings: []
      }
    }
  }

  /**
   * Récupérer les statistiques d'un exercice
   */
  async getExerciceStats(id: number): Promise<{
    nb_ecritures?: number
    nb_documents?: number
    is_balanced?: boolean
    solde_debit?: number
    solde_credit?: number
  }> {
    console.log(`📊 Fetching stats for exercice ${id}...`)
    // Cette méthode nécessiterait un endpoint backend spécifique
    // Pour l'instant, retourner un objet vide
    return {}
  }
}

export default new ExerciceService()
