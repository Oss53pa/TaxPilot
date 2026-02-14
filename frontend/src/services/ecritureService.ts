/**
 * Service pour la gestion des écritures comptables
 * CONNEXION RÉELLE AU BACKEND DJANGO
 */

import { apiClient } from './apiClient'

export interface LigneEcriture {
  id?: number
  numero_compte: string
  libelle_compte?: string
  libelle: string
  debit: number
  credit: number
  piece_justificative?: string
  lettrage?: string
  analytique?: string
}

export interface EcritureComptable {
  id: number
  entreprise: number
  journal: number
  journal_detail?: {
    code: string
    libelle: string
    type_journal: string
  }
  exercice: number
  numero_piece: string
  date_ecriture: string
  date_saisie: string
  libelle: string
  reference_externe?: string
  montant_total: number
  lignes: LigneEcriture[]
  est_equilibree: boolean
  est_validee: boolean
  est_lettree: boolean
  created_at: string
  updated_at: string
}

export interface CreateEcriture {
  entreprise: number
  journal: number
  exercice: number
  numero_piece?: string
  date_ecriture: string
  libelle: string
  reference_externe?: string
  lignes: Omit<LigneEcriture, 'id'>[]
}

export interface EcritureFilters {
  entreprise?: number
  journal?: number
  exercice?: number
  date_ecriture_min?: string
  date_ecriture_max?: string
  est_validee?: boolean
  est_lettree?: boolean
  search?: string
  page?: number
  page_size?: number
}

class EcritureService {
  private baseUrl = '/api/v1/accounting/ecritures'

  async list(filters?: EcritureFilters): Promise<{ count: number; results: EcritureComptable[] }> {
    console.log('🔄 Fetching écritures from backend...', filters)
    return apiClient.get(this.baseUrl, filters)
  }

  async getById(id: number): Promise<EcritureComptable> {
    return apiClient.get(`${this.baseUrl}/${id}/`)
  }

  async create(data: CreateEcriture): Promise<EcritureComptable> {
    console.log('📤 Creating écriture...', data)
    return apiClient.post(this.baseUrl, data)
  }

  async update(id: number, data: Partial<CreateEcriture>): Promise<EcritureComptable> {
    return apiClient.patch(`${this.baseUrl}/${id}/`, data)
  }

  async delete(id: number): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}/`)
  }

  async valider(id: number): Promise<EcritureComptable> {
    console.log(`✅ Validating écriture ${id}...`)
    return apiClient.post(`${this.baseUrl}/${id}/valider/`)
  }

  async annulerValidation(id: number): Promise<EcritureComptable> {
    console.log(`🔓 Canceling validation for écriture ${id}...`)
    return apiClient.post(`${this.baseUrl}/${id}/annuler_validation/`)
  }

  validateEquilibre(lignes: LigneEcriture[]): { equilibree: boolean; ecart: number } {
    const totalDebit = lignes.reduce((sum, l) => sum + l.debit, 0)
    const totalCredit = lignes.reduce((sum, l) => sum + l.credit, 0)
    const ecart = Math.abs(totalDebit - totalCredit)
    return { equilibree: ecart < 0.01, ecart }
  }
}

export default new EcritureService()
