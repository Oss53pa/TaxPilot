/**
 * Service de gestion de la documentation juridique
 * Lois de Finances, Évolutions SYSCOHADA, Synthèses SYSCOHADA
 */

import { apiClient } from './apiClient'

// === Interfaces ===

export interface DocumentJuridique {
  id: string
  titre: string
  pays: string
  annee: number
  thematique: string
  format: 'PDF' | 'Word' | 'Excel'
  dateImport: string
  tailleFichier: string
  description?: string
  contenuExtrait?: string
}

export interface EvolutionSyscohada {
  id: string
  titre: string
  type: 'Norme' | 'Circulaire' | 'Modification plan'
  dateEffet: string
  pays: string
  statut: 'En vigueur' | 'En attente' | 'Abrogé'
  description?: string
  contenuExtrait?: string
  dateImport: string
  format: 'PDF' | 'Word' | 'Excel'
  tailleFichier: string
}

export interface SyntheseSyscohada {
  id: string
  titre: string
  categorie: 'Principes comptables' | 'Règles de comptabilisation' | 'Traitements spécifiques' | 'Référentiel SYSCOHADA' | 'États financiers' | 'Erreurs fréquentes'
  resume: string
  documentSource: string
  documentSourceId: string
  dateGeneration: string
  genereParIA: boolean
}

export interface RegleValidation {
  id: string
  code: string
  libelle: string
  categorie: 'Principes fondamentaux' | 'Présentation états financiers' | 'Évaluation & comptabilisation' | 'Amortissements & provisions' | 'Opérations spécifiques' | 'Contrôles de cohérence' | 'Obligations fiscales'
  severite: 'BLOQUANT' | 'MAJEUR' | 'MINEUR' | 'INFO'
  articleReference: string
  description: string
  controleAssocie?: string
  actif: boolean
}

export interface DocumentFilters {
  pays?: string
  annee?: number
  thematique?: string
  type?: string
  categorie?: string
  recherche?: string
  page?: number
  pageSize?: number
}

export interface PaginatedResponse<T> {
  results: T[]
  count: number
  page: number
  pageSize: number
}

export interface DocumentPreview {
  id: string
  titre: string
  contenuExtrait: string
  format: string
}

// === Service ===

class DocumentationJuridiqueService {
  private baseUrl = '/api/v1/parametrage/documentation-juridique'

  // --- Lois de Finances ---

  async getLoisFinances(filters?: DocumentFilters): Promise<PaginatedResponse<DocumentJuridique>> {
    console.log('🔄 Fetching lois de finances...', filters)
    return apiClient.get(`${this.baseUrl}/lois-finances/`, filters)
  }

  async uploadLoiFinance(file: File, metadata: Partial<DocumentJuridique>): Promise<DocumentJuridique> {
    console.log('📤 Uploading loi de finance...', metadata)
    const formData = new FormData()
    formData.append('file', file)
    Object.entries(metadata).forEach(([key, value]) => {
      if (value !== undefined) formData.append(key, String(value))
    })
    return apiClient.post(`${this.baseUrl}/lois-finances/`, formData)
  }

  async deleteLoiFinance(id: string): Promise<void> {
    console.log('🗑️ Deleting loi de finance...', id)
    return apiClient.delete(`${this.baseUrl}/lois-finances/${id}/`)
  }

  // --- Évolutions SYSCOHADA ---

  async getEvolutionsSyscohada(filters?: DocumentFilters): Promise<PaginatedResponse<EvolutionSyscohada>> {
    console.log('🔄 Fetching évolutions SYSCOHADA...', filters)
    return apiClient.get(`${this.baseUrl}/evolutions-syscohada/`, filters)
  }

  async uploadEvolutionSyscohada(file: File, metadata: Partial<EvolutionSyscohada>): Promise<EvolutionSyscohada> {
    console.log('📤 Uploading évolution SYSCOHADA...', metadata)
    const formData = new FormData()
    formData.append('file', file)
    Object.entries(metadata).forEach(([key, value]) => {
      if (value !== undefined) formData.append(key, String(value))
    })
    return apiClient.post(`${this.baseUrl}/evolutions-syscohada/`, formData)
  }

  async deleteEvolutionSyscohada(id: string): Promise<void> {
    console.log('🗑️ Deleting évolution SYSCOHADA...', id)
    return apiClient.delete(`${this.baseUrl}/evolutions-syscohada/${id}/`)
  }

  // --- Synthèses SYSCOHADA ---

  async getSynthesesSyscohada(filters?: DocumentFilters): Promise<PaginatedResponse<SyntheseSyscohada>> {
    console.log('🔄 Fetching synthèses SYSCOHADA...', filters)
    return apiClient.get(`${this.baseUrl}/syntheses-syscohada/`, filters)
  }

  async genererSynthese(documentId: string): Promise<SyntheseSyscohada> {
    console.log('🤖 Generating synthèse for document...', documentId)
    return apiClient.post(`${this.baseUrl}/syntheses-syscohada/generer/`, { documentId })
  }

  // --- Règles de validation ---

  async getReglesValidation(filters?: DocumentFilters): Promise<PaginatedResponse<RegleValidation>> {
    console.log('🔄 Fetching règles de validation SYSCOHADA...', filters)
    return apiClient.get(`${this.baseUrl}/regles-validation/`, filters)
  }

  async toggleRegle(id: string, actif: boolean): Promise<RegleValidation> {
    console.log('🔄 Toggle règle...', id, actif)
    return apiClient.patch(`${this.baseUrl}/regles-validation/${id}/`, { actif })
  }

  // --- Commun ---

  async downloadDocument(id: string): Promise<Blob> {
    console.log('📥 Downloading document...', id)
    return apiClient.get(`${this.baseUrl}/documents/${id}/download/`, { responseType: 'blob' })
  }

  async getDocumentPreview(id: string): Promise<DocumentPreview> {
    console.log('👁️ Fetching document preview...', id)
    return apiClient.get(`${this.baseUrl}/documents/${id}/preview/`)
  }
}

export const documentationJuridiqueService = new DocumentationJuridiqueService()
export default documentationJuridiqueService
