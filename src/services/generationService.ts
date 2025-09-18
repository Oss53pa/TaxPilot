/**
 * Service pour la génération de liasses fiscales
 * CONNEXION RÉELLE AU BACKEND DJANGO
 */

import { apiClient } from './apiClient'

export interface LiasseGeneration {
  id: string
  entreprise: string
  entreprise_detail?: {
    raison_sociale: string
    numero_contribuable: string
  }
  exercice: string
  exercice_detail?: {
    nom: string
    date_debut: string
    date_fin: string
  }
  type_liasse: 'SYSCOHADA' | 'IFRS' | 'PME' | 'TPE'
  statut: 'EN_PREPARATION' | 'EN_COURS' | 'TERMINEE' | 'ERREUR'
  progression: number
  balance_source: string
  templates_utilises: string[]
  etats_generes: {
    bilan_actif: boolean
    bilan_passif: boolean
    compte_resultat: boolean
    tableau_flux: boolean
    notes_annexes: boolean
  }
  fichier_pdf?: string
  fichier_excel?: string
  date_generation: string
  erreurs?: Array<{
    code: string
    message: string
    severite: 'WARNING' | 'ERROR'
  }>
  created_at: string
  updated_at: string
}

export interface GenerationRequest {
  entreprise_id: string
  exercice_id: string
  type_liasse: 'SYSCOHADA' | 'IFRS' | 'PME' | 'TPE'
  balance_id: string
  options?: {
    inclure_notes: boolean
    format_export: 'PDF' | 'EXCEL' | 'BOTH'
    validation_auto: boolean
  }
}

export interface ExportOptions {
  format: 'PDF' | 'EXCEL' | 'XML' | 'JSON'
  template?: string
  options?: {
    inclure_annexes: boolean
    watermark: boolean
    compression: boolean
  }
}

class GenerationService {
  private baseUrl = '/api/v1/generation'

  // Génération de liasses - CONNEXION RÉELLE AU BACKEND
  async generateLiasse(request: GenerationRequest): Promise<LiasseGeneration> {
    console.log('📤 Starting liasse generation in backend...', request)
    return apiClient.post(`${this.baseUrl}/liasse/`, request)
  }

  async getLiasseGenerations(params?: {
    entreprise?: string
    exercice?: string
    type_liasse?: string
    statut?: string
    page?: number
    page_size?: number
  }) {
    console.log('🔄 Fetching liasse generations from backend...', params)
    return apiClient.get(`${this.baseUrl}/liasse/`, params)
  }

  async getLiasseGeneration(id: string): Promise<LiasseGeneration> {
    console.log(`🔄 Fetching liasse generation ${id} from backend...`)
    return apiClient.get(`${this.baseUrl}/liasse/${id}/`)
  }

  async getGenerationStatus(id: string): Promise<LiasseGeneration> {
    console.log(`🔄 Getting generation status ${id} from backend...`)
    return apiClient.get(`${this.baseUrl}/liasse/${id}/status/`)
  }

  async cancelGeneration(id: string): Promise<void> {
    console.log(`🛑 Cancelling generation ${id} on backend...`)
    return apiClient.post(`${this.baseUrl}/liasse/${id}/cancel/`)
  }

  // Export et téléchargement - CONNEXION RÉELLE AU BACKEND
  async exportLiasse(id: string, options: ExportOptions) {
    console.log(`📥 Exporting liasse ${id} as ${options.format}...`)
    return apiClient.get(`${this.baseUrl}/liasse/${id}/export/`, options)
  }

  async downloadLiasse(id: string, format: 'PDF' | 'EXCEL'): Promise<Blob> {
    console.log(`📥 Downloading liasse ${id} as ${format}...`)
    const response = await apiClient.client.get(`${this.baseUrl}/liasse/${id}/download/`, {
      params: { format },
      responseType: 'blob'
    })
    return response.data
  }

  // Templates et modèles - CONNEXION RÉELLE AU BACKEND
  async getAvailableTemplates(type_liasse?: string) {
    console.log('🔄 Fetching available templates from backend...', type_liasse)
    return apiClient.get(`${this.baseUrl}/templates/`, { type_liasse })
  }

  async getTemplate(id: string) {
    console.log(`🔄 Fetching template ${id} from backend...`)
    return apiClient.get(`${this.baseUrl}/templates/${id}/`)
  }

  // Validation et contrôles - CONNEXION RÉELLE AU BACKEND
  async validateLiasse(id: string) {
    console.log(`🔍 Validating liasse ${id} on backend...`)
    return apiClient.post(`${this.baseUrl}/liasse/${id}/validate/`)
  }

  async getValidationErrors(id: string) {
    console.log(`🔍 Getting validation errors for liasse ${id}...`)
    return apiClient.get(`${this.baseUrl}/liasse/${id}/validation-errors/`)
  }

  // Statistiques - CONNEXION RÉELLE AU BACKEND
  async getGenerationStats(params?: {
    entreprise?: string
    period?: string
  }) {
    console.log('📊 Getting generation stats from backend...', params)
    return apiClient.get(`${this.baseUrl}/stats/`, params)
  }

  // Historique et versions - CONNEXION RÉELLE AU BACKEND
  async getLiasseHistory(entreprise_id: string, exercice_id: string) {
    console.log(`🔄 Getting liasse history for entreprise ${entreprise_id}, exercice ${exercice_id}...`)
    return apiClient.get(`${this.baseUrl}/history/`, {
      entreprise: entreprise_id,
      exercice: exercice_id
    })
  }

  async compareLiasses(liasse1_id: string, liasse2_id: string) {
    console.log(`📊 Comparing liasses ${liasse1_id} and ${liasse2_id}...`)
    return apiClient.get(`${this.baseUrl}/compare/`, {
      liasse1: liasse1_id,
      liasse2: liasse2_id
    })
  }

  // Preview et aperçu - CONNEXION RÉELLE AU BACKEND
  async previewLiasse(request: GenerationRequest) {
    console.log('👁️ Generating liasse preview on backend...', request)
    return apiClient.post(`${this.baseUrl}/preview/`, request)
  }

  // Batch operations - CONNEXION RÉELLE AU BACKEND
  async batchGenerate(requests: GenerationRequest[]) {
    console.log('📤 Starting batch generation on backend...', requests.length, 'liasses')
    return apiClient.post(`${this.baseUrl}/batch/`, { requests })
  }

  async getBatchStatus(batch_id: string) {
    console.log(`🔄 Getting batch status ${batch_id} from backend...`)
    return apiClient.get(`${this.baseUrl}/batch/${batch_id}/`)
  }
}

export const generationService = new GenerationService()
export default generationService