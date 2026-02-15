import { logger } from '@/utils/logger'
/**
 * Service pour la gestion des journaux comptables
 * CONNEXION RÉELLE AU BACKEND DJANGO
 */

import { apiClient } from './apiClient'

export interface Journal {
  id: number
  entreprise: number
  entreprise_detail?: {
    raison_sociale: string
  }
  code: string
  libelle: string
  type_journal: 'VENTE' | 'ACHAT' | 'BANQUE' | 'CAISSE' | 'OD' | 'REPORT'
  is_actif: boolean
  sequence_actuelle: number
  prefixe_numero: string
  comptes_autorises: string[]
  created_at: string
  updated_at: string
}

export interface CreateJournal {
  entreprise: number
  code: string
  libelle: string
  type_journal: 'VENTE' | 'ACHAT' | 'BANQUE' | 'CAISSE' | 'OD' | 'REPORT'
  is_actif?: boolean
  prefixe_numero?: string
  comptes_autorises?: string[]
}

export interface JournalFilters {
  entreprise?: number
  type_journal?: 'VENTE' | 'ACHAT' | 'BANQUE' | 'CAISSE' | 'OD' | 'REPORT'
  is_actif?: boolean
  search?: string
  page?: number
  page_size?: number
}

class JournalService {
  private baseUrl = '/api/v1/accounting/journaux'

  async list(filters?: JournalFilters): Promise<{ count: number; results: Journal[] }> {
    logger.debug('Fetching journaux from backend...', filters)
    return apiClient.get(this.baseUrl, filters)
  }

  async getAll(filters?: Omit<JournalFilters, 'page' | 'page_size'>): Promise<Journal[]> {
    const data = await apiClient.get<Record<string, any>>(this.baseUrl, { ...filters, page_size: 1000 })
    return data.results || []
  }

  async getById(id: number): Promise<Journal> {
    return apiClient.get(`${this.baseUrl}/${id}/`)
  }

  async create(data: CreateJournal): Promise<Journal> {
    logger.debug('Creating journal...', data)
    return apiClient.post(this.baseUrl, data)
  }

  async update(id: number, data: Partial<CreateJournal>): Promise<Journal> {
    return apiClient.patch(`${this.baseUrl}/${id}/`, data)
  }

  async delete(id: number): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}/`)
  }

  async getByEntreprise(entrepriseId: number): Promise<Journal[]> {
    const data = await apiClient.get<Record<string, any>>(this.baseUrl, { entreprise: entrepriseId, page_size: 1000 })
    return data.results || []
  }

  async getActifs(entrepriseId: number): Promise<Journal[]> {
    const data = await apiClient.get<Record<string, any>>(this.baseUrl, {
      entreprise: entrepriseId,
      is_actif: true,
      page_size: 1000
    })
    return data.results || []
  }

  getTypeJournalLabel(type: Journal['type_journal']): string {
    const labels = {
      'VENTE': 'Journal des Ventes',
      'ACHAT': 'Journal des Achats',
      'BANQUE': 'Journal de Banque',
      'CAISSE': 'Journal de Caisse',
      'OD': 'Opérations Diverses',
      'REPORT': 'À-nouveaux / Reports'
    }
    return labels[type] || type
  }
}

export default new JournalService()
