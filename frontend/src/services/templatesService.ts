/**
 * Service pour la gestion des templates et modèles
 * CONNEXION RÉELLE AU BACKEND DJANGO
 */

import { apiClient } from './apiClient'

export interface Template {
  id: string
  nom: string
  description: string
  type_template: 'LIASSE' | 'RAPPORT' | 'DOCUMENT' | 'EMAIL' | 'ETIQUETTE'
  categorie: string
  version: string
  norme_applicable: 'SYSCOHADA' | 'IFRS' | 'OHADA' | 'PCG' | 'CUSTOM'
  pays_applicable?: string[]
  secteur_applicable?: string[]
  is_officiel: boolean
  is_public: boolean
  is_actif: boolean
  fichier_template: string
  fichier_apercu?: string
  taille_fichier: number
  format_sortie: string[]
  variables: TemplateVariable[]
  sections: TemplateSection[]
  regles_validation?: string[]
  created_by: string
  usage_count: number
  note_moyenne?: number
  tags: string[]
  created_at: string
  updated_at: string
}

export interface TemplateVariable {
  id: string
  nom: string
  libelle: string
  type: 'TEXT' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'LIST' | 'OBJECT'
  obligatoire: boolean
  valeur_defaut?: any
  validation_regex?: string
  description?: string
  source_donnees?: string
  dependances?: string[]
}

export interface TemplateSection {
  id: string
  nom: string
  ordre: number
  type_section: 'HEADER' | 'BODY' | 'FOOTER' | 'TABLE' | 'CHART' | 'IMAGE'
  contenu_template: string
  conditions_affichage?: string
  style_css?: string
  parametres?: any
}

export interface TemplateInstance {
  id: string
  template: string
  template_detail?: Template
  nom_instance: string
  parametres: Record<string, any>
  donnees_source: any
  fichier_genere?: string
  statut: 'EN_PREPARATION' | 'EN_COURS' | 'TERMINE' | 'ERREUR'
  progression: number
  erreurs?: Array<{
    code: string
    message: string
    section?: string
  }>
  created_by: string
  created_at: string
}

export interface TemplateLibrary {
  id: string
  nom: string
  description: string
  editeur: string
  version: string
  url_source?: string
  templates: Template[]
  is_verified: boolean
  last_sync: string
}

export interface GenerationRequest {
  template_id: string
  nom_instance: string
  parametres: Record<string, any>
  donnees_source?: any
  format_sortie?: string
  options?: {
    inclure_metadata: boolean
    compression: boolean
    watermark?: string
  }
}

class TemplatesService {
  private baseUrl = '/api/v1/templates'

  // Templates - CONNEXION RÉELLE AU BACKEND
  async getTemplates(params?: {
    type_template?: string
    categorie?: string
    norme_applicable?: string
    pays?: string
    secteur?: string
    is_officiel?: boolean
    is_public?: boolean
    search?: string
    tags?: string[]
    page?: number
    page_size?: number
  }) {
    console.log('🔄 Fetching templates from backend...', params)
    return apiClient.get(`${this.baseUrl}/`, params)
  }

  async getTemplate(id: string): Promise<Template> {
    console.log(`🔄 Fetching template ${id} from backend...`)
    return apiClient.get(`${this.baseUrl}/${id}/`)
  }

  async createTemplate(template: Partial<Template>): Promise<Template> {
    console.log('📤 Creating template in backend...', template)
    return apiClient.post(`${this.baseUrl}/`, template)
  }

  async updateTemplate(id: string, template: Partial<Template>): Promise<Template> {
    console.log(`📤 Updating template ${id} in backend...`)
    return apiClient.patch(`${this.baseUrl}/${id}/`, template)
  }

  async deleteTemplate(id: string): Promise<void> {
    console.log(`🗑️ Deleting template ${id} from backend...`)
    return apiClient.delete(`${this.baseUrl}/${id}/`)
  }

  async duplicateTemplate(id: string, newName: string): Promise<Template> {
    console.log(`📋 Duplicating template ${id} as ${newName}...`)
    return apiClient.post(`${this.baseUrl}/${id}/duplicate/`, { nom: newName })
  }

  async publishTemplate(id: string, makePublic: boolean = false): Promise<Template> {
    console.log(`📢 Publishing template ${id}...`)
    return apiClient.post(`${this.baseUrl}/${id}/publish/`, { is_public: makePublic })
  }

  async unpublishTemplate(id: string): Promise<Template> {
    console.log(`📢 Unpublishing template ${id}...`)
    return apiClient.post(`${this.baseUrl}/${id}/unpublish/`)
  }

  // Upload et fichiers - CONNEXION RÉELLE AU BACKEND
  async uploadTemplate(file: File, metadata: {
    nom: string
    description: string
    type_template: string
    categorie: string
    norme_applicable?: string
  }): Promise<Template> {
    console.log('📤 Uploading template file to backend...', metadata)
    return apiClient.upload(`${this.baseUrl}/upload/`, file, metadata)
  }

  async uploadTemplatePreview(templateId: string, file: File): Promise<Template> {
    console.log(`📤 Uploading preview for template ${templateId}...`)
    return apiClient.upload(`${this.baseUrl}/${templateId}/preview/`, file)
  }

  async downloadTemplate(id: string): Promise<Blob> {
    console.log(`📥 Downloading template ${id} from backend...`)
    const response = await apiClient.client.get(`${this.baseUrl}/${id}/download/`, {
      responseType: 'blob'
    })
    return response.data
  }

  // Variables et sections - CONNEXION RÉELLE AU BACKEND
  async getTemplateVariables(templateId: string) {
    console.log(`🔄 Fetching variables for template ${templateId}...`)
    return apiClient.get(`${this.baseUrl}/${templateId}/variables/`)
  }

  async addTemplateVariable(templateId: string, variable: Partial<TemplateVariable>): Promise<TemplateVariable> {
    console.log(`📤 Adding variable to template ${templateId}...`)
    return apiClient.post(`${this.baseUrl}/${templateId}/variables/`, variable)
  }

  async updateTemplateVariable(templateId: string, variableId: string, variable: Partial<TemplateVariable>): Promise<TemplateVariable> {
    console.log(`📤 Updating variable ${variableId} in template ${templateId}...`)
    return apiClient.patch(`${this.baseUrl}/${templateId}/variables/${variableId}/`, variable)
  }

  async deleteTemplateVariable(templateId: string, variableId: string): Promise<void> {
    console.log(`🗑️ Deleting variable ${variableId} from template ${templateId}...`)
    return apiClient.delete(`${this.baseUrl}/${templateId}/variables/${variableId}/`)
  }

  async getTemplateSections(templateId: string) {
    console.log(`🔄 Fetching sections for template ${templateId}...`)
    return apiClient.get(`${this.baseUrl}/${templateId}/sections/`)
  }

  async addTemplateSection(templateId: string, section: Partial<TemplateSection>): Promise<TemplateSection> {
    console.log(`📤 Adding section to template ${templateId}...`)
    return apiClient.post(`${this.baseUrl}/${templateId}/sections/`, section)
  }

  async updateTemplateSection(templateId: string, sectionId: string, section: Partial<TemplateSection>): Promise<TemplateSection> {
    console.log(`📤 Updating section ${sectionId} in template ${templateId}...`)
    return apiClient.patch(`${this.baseUrl}/${templateId}/sections/${sectionId}/`, section)
  }

  async deleteTemplateSection(templateId: string, sectionId: string): Promise<void> {
    console.log(`🗑️ Deleting section ${sectionId} from template ${templateId}...`)
    return apiClient.delete(`${this.baseUrl}/${templateId}/sections/${sectionId}/`)
  }

  async reorderTemplateSections(templateId: string, sectionOrders: Array<{ id: string; ordre: number }>) {
    console.log(`🔄 Reordering sections for template ${templateId}...`)
    return apiClient.post(`${this.baseUrl}/${templateId}/sections/reorder/`, { sections: sectionOrders })
  }

  // Génération d'instances - CONNEXION RÉELLE AU BACKEND
  async generateInstance(request: GenerationRequest): Promise<TemplateInstance> {
    console.log('📤 Starting template instance generation in backend...', request)
    return apiClient.post(`${this.baseUrl}/generate/`, request)
  }

  async getTemplateInstances(params?: {
    template?: string
    statut?: string
    created_by?: string
    date_debut?: string
    date_fin?: string
    page?: number
  }) {
    console.log('🔄 Fetching template instances from backend...', params)
    return apiClient.get(`${this.baseUrl}/instances/`, params)
  }

  async getTemplateInstance(id: string): Promise<TemplateInstance> {
    console.log(`🔄 Fetching template instance ${id} from backend...`)
    return apiClient.get(`${this.baseUrl}/instances/${id}/`)
  }

  async getInstanceStatus(id: string): Promise<TemplateInstance> {
    console.log(`🔄 Getting instance status ${id} from backend...`)
    return apiClient.get(`${this.baseUrl}/instances/${id}/status/`)
  }

  async cancelInstance(id: string): Promise<void> {
    console.log(`🛑 Cancelling instance ${id} on backend...`)
    return apiClient.post(`${this.baseUrl}/instances/${id}/cancel/`)
  }

  async downloadInstance(id: string): Promise<Blob> {
    console.log(`📥 Downloading instance ${id} from backend...`)
    const response = await apiClient.client.get(`${this.baseUrl}/instances/${id}/download/`, {
      responseType: 'blob'
    })
    return response.data
  }

  // Preview et validation - CONNEXION RÉELLE AU BACKEND
  async previewTemplate(templateId: string, parametres: Record<string, any>, sampleData?: any) {
    console.log(`👁️ Generating template preview for ${templateId}...`)
    return apiClient.post(`${this.baseUrl}/${templateId}/preview/`, {
      parametres,
      sample_data: sampleData
    })
  }

  async validateTemplate(templateId: string, testData?: any) {
    console.log(`🔍 Validating template ${templateId} on backend...`)
    return apiClient.post(`${this.baseUrl}/${templateId}/validate/`, { test_data: testData })
  }

  async testTemplateGeneration(templateId: string, testData: any) {
    console.log(`🧪 Testing template generation for ${templateId}...`)
    return apiClient.post(`${this.baseUrl}/${templateId}/test/`, testData)
  }

  // Catégories et tags - CONNEXION RÉELLE AU BACKEND
  async getCategories() {
    console.log('🔄 Fetching template categories from backend...')
    return apiClient.get(`${this.baseUrl}/categories/`)
  }

  async createCategorie(nom: string, description?: string) {
    console.log(`📤 Creating template category: ${nom}...`)
    return apiClient.post(`${this.baseUrl}/categories/`, { nom, description })
  }

  async getTags() {
    console.log('🔄 Fetching template tags from backend...')
    return apiClient.get(`${this.baseUrl}/tags/`)
  }

  async getTemplatesByTag(tag: string) {
    console.log(`🔄 Fetching templates by tag: ${tag}...`)
    return apiClient.get(`${this.baseUrl}/by-tag/`, { tag })
  }

  // Librairies de templates - CONNEXION RÉELLE AU BACKEND
  async getTemplateLibraries() {
    console.log('🔄 Fetching template libraries from backend...')
    return apiClient.get(`${this.baseUrl}/libraries/`)
  }

  async getTemplateLibrary(id: string): Promise<TemplateLibrary> {
    console.log(`🔄 Fetching template library ${id} from backend...`)
    return apiClient.get(`${this.baseUrl}/libraries/${id}/`)
  }

  async syncTemplateLibrary(id: string) {
    console.log(`🔄 Syncing template library ${id}...`)
    return apiClient.post(`${this.baseUrl}/libraries/${id}/sync/`)
  }

  async installTemplateFromLibrary(libraryId: string, templateId: string) {
    console.log(`📥 Installing template ${templateId} from library ${libraryId}...`)
    return apiClient.post(`${this.baseUrl}/libraries/${libraryId}/install/`, { template_id: templateId })
  }

  // Statistiques et analytics - CONNEXION RÉELLE AU BACKEND
  async getTemplateStats(templateId: string) {
    console.log(`📊 Getting stats for template ${templateId}...`)
    return apiClient.get(`${this.baseUrl}/${templateId}/stats/`)
  }

  async getUsageAnalytics(params?: {
    periode_debut?: string
    periode_fin?: string
    template?: string
    utilisateur?: string
  }) {
    console.log('📈 Getting template usage analytics from backend...', params)
    return apiClient.get(`${this.baseUrl}/analytics/usage/`, params)
  }

  async getPopularTemplates(limit: number = 10) {
    console.log(`🔥 Getting top ${limit} popular templates...`)
    return apiClient.get(`${this.baseUrl}/popular/`, { limit })
  }

  // Notation et commentaires - CONNEXION RÉELLE AU BACKEND
  async rateTemplate(templateId: string, rating: number, commentaire?: string) {
    console.log(`⭐ Rating template ${templateId}: ${rating}/5...`)
    return apiClient.post(`${this.baseUrl}/${templateId}/rate/`, { rating, commentaire })
  }

  async getTemplateRatings(templateId: string) {
    console.log(`🔄 Getting ratings for template ${templateId}...`)
    return apiClient.get(`${this.baseUrl}/${templateId}/ratings/`)
  }

  async reportTemplate(templateId: string, motif: string, description: string) {
    console.log(`🚨 Reporting template ${templateId}...`)
    return apiClient.post(`${this.baseUrl}/${templateId}/report/`, { motif, description })
  }

  // Import/Export - CONNEXION RÉELLE AU BACKEND
  async exportTemplate(templateId: string, includeData: boolean = false): Promise<Blob> {
    console.log(`📥 Exporting template ${templateId}...`)
    const response = await apiClient.client.get(`${this.baseUrl}/${templateId}/export/`, {
      params: { include_data: includeData },
      responseType: 'blob'
    })
    return response.data
  }

  async importTemplate(file: File, options?: {
    override_existing: boolean
    preserve_ids: boolean
  }): Promise<Template> {
    console.log('📤 Importing template to backend...', options)
    return apiClient.upload(`${this.baseUrl}/import/`, file, options)
  }

  async batchImportTemplates(file: File, options?: {
    library_name?: string
    override_existing: boolean
  }) {
    console.log('📤 Batch importing templates to backend...', options)
    return apiClient.upload(`${this.baseUrl}/batch-import/`, file, options)
  }
}

export const templatesService = new TemplatesService()
export default templatesService