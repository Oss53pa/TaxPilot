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
    return apiClient.post(`${this.baseUrl}/liasses/`, request)
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
    return apiClient.get(`${this.baseUrl}/liasses/`, params)
  }

  async getLiasseGeneration(id: string): Promise<LiasseGeneration> {
    console.log(`🔄 Fetching liasse generation ${id} from backend...`)
    return apiClient.get(`${this.baseUrl}/liasses/${id}/`)
  }

  async getGenerationStatus(id: string): Promise<LiasseGeneration> {
    console.log(`🔄 Getting generation status ${id} from backend...`)
    return apiClient.get(`${this.baseUrl}/liasses/${id}/status/`)
  }

  async cancelGeneration(id: string): Promise<void> {
    console.log(`🛑 Cancelling generation ${id} on backend...`)
    return apiClient.post(`${this.baseUrl}/liasses/${id}/cancel/`)
  }

  // Export et téléchargement - CONNEXION RÉELLE AU BACKEND
  async exportLiasse(id: string, options: ExportOptions) {
    console.log(`📥 Exporting liasse ${id} as ${options.format}...`)
    return apiClient.get(`${this.baseUrl}/liasses/${id}/export/`, options)
  }

  async downloadLiasse(id: string, format: 'PDF' | 'EXCEL'): Promise<Blob> {
    console.log(`📥 Downloading liasse ${id} as ${format}...`)
    const response = await apiClient.client.get(`${this.baseUrl}/liasses/${id}/download/`, {
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
    return apiClient.post(`${this.baseUrl}/liasses/${id}/validate/`)
  }

  async getValidationErrors(id: string) {
    console.log(`🔍 Getting validation errors for liasse ${id}...`)
    return apiClient.get(`${this.baseUrl}/liasses/${id}/validation-errors/`)
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

  // Validation approfondie - CONNEXION RÉELLE AU BACKEND
  async checkPrerequisites(liasseId: string) {
    console.log(`🔍 Checking prerequisites for liasse ${liasseId}...`)
    return apiClient.get(`${this.baseUrl}/liasses/${liasseId}/check-prerequisites/`)
  }

  async validateComplete(liasseId: string) {
    console.log(`🔍 Performing complete validation for liasse ${liasseId}...`)
    return apiClient.post(`${this.baseUrl}/liasses/${liasseId}/validate_complete/`)
  }

  async getValidationReport(liasseId: string) {
    console.log(`📋 Getting validation report for liasse ${liasseId}...`)
    return apiClient.get(`${this.baseUrl}/liasses/${liasseId}/validation-report/`)
  }

  // Workflow statuts - CONNEXION RÉELLE AU BACKEND
  async getTransitions(liasseId: string) {
    console.log(`🔄 Getting available transitions for liasse ${liasseId}...`)
    return apiClient.get(`${this.baseUrl}/liasses/${liasseId}/get_transitions/`)
  }

  async transition(liasseId: string, action: string) {
    console.log(`🔄 Performing transition '${action}' on liasse ${liasseId}...`)
    return apiClient.post(`${this.baseUrl}/liasses/${liasseId}/transition/`, { action })
  }

  async verrouiller(liasseId: string) {
    console.log(`🔒 Locking liasse ${liasseId}...`)
    return apiClient.post(`${this.baseUrl}/liasses/${liasseId}/verrouiller/`)
  }

  async finaliser(liasseId: string) {
    console.log(`✅ Finalizing liasse ${liasseId}...`)
    return apiClient.post(`${this.baseUrl}/liasses/${liasseId}/finaliser/`)
  }

  async invalider(liasseId: string) {
    console.log(`❌ Invalidating liasse ${liasseId}...`)
    return apiClient.post(`${this.baseUrl}/liasses/${liasseId}/invalider_liasse/`)
  }

  async archiver(liasseId: string) {
    console.log(`📦 Archiving liasse ${liasseId}...`)
    return apiClient.post(`${this.baseUrl}/liasses/${liasseId}/archiver_liasse/`)
  }

  async remettreEnBrouillon(liasseId: string) {
    console.log(`🔄 Resetting liasse ${liasseId} to draft...`)
    return apiClient.post(`${this.baseUrl}/liasses/${liasseId}/remettre_brouillon/`)
  }

  async declarer(liasseId: string) {
    console.log(`📤 Declaring liasse ${liasseId} to DGI...`)
    return apiClient.post(`${this.baseUrl}/liasses/${liasseId}/declarer_liasse/`)
  }

  // Export batch avancé - CONNEXION RÉELLE AU BACKEND
  async exportBatch(liasseIds: string[], format: 'PDF' | 'EXCEL') {
    console.log(`📤 Starting batch export for ${liasseIds.length} liasses...`)
    return apiClient.post(`${this.baseUrl}/liasses/export_batch/`, {
      liasse_ids: liasseIds,
      format,
    })
  }

  async getBatchExportStatus(batchId: string) {
    console.log(`🔄 Getting batch export status ${batchId}...`)
    return apiClient.get(`${this.baseUrl}/liasses/export_batch/${batchId}/status/`)
  }

  async downloadBatch(batchId: string): Promise<Blob> {
    console.log(`📥 Downloading batch export ${batchId}...`)
    const response = await apiClient.client.get(
      `${this.baseUrl}/liasses/download_batch/`,
      {
        params: { batch_id: batchId },
        responseType: 'blob'
      }
    )
    return response.data
  }
}

export const generationService = new GenerationService()
export default generationService