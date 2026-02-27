/**
 * Service pour la gestion des balances comptables
 * CONNEXION RÉELLE AU BACKEND DJANGO
 */

import { apiClient } from './apiClient'

export interface Balance {
  id: string
  nom: string
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
  date_balance: string
  type_balance: 'GENERALE' | 'AUXILIAIRE' | 'ANALYTIQUE' | 'AGED'
  statut: 'BROUILLON' | 'VALIDEE' | 'CLOTUREE'
  total_debit: number
  total_credit: number
  nb_lignes: number
  fichier_source?: string
  format_import?: string
  date_import?: string
  commentaires?: string
  statistiques?: {
    nb_comptes_actifs: number
    nb_comptes_mouvementes: number
    equilibre: boolean
    ecart_equilibrage: number
  }
  created_at: string
  updated_at: string
}

export interface LigneBalance {
  id: string
  compte: string
  compte_detail?: {
    numero_compte: string
    libelle: string
    type_compte: string
  }
  libelle_compte?: string
  mouvement_debit: number
  mouvement_credit: number
  solde_debiteur: number
  solde_crediteur: number
  a_nouveau_debiteur: number
  a_nouveau_crediteur: number
  ordre_tri: number
}

export interface ImportBalance {
  id: string
  entreprise: string
  exercice: string
  fichier: string
  format_fichier: 'XLSX' | 'CSV' | 'XML' | 'JSON'
  statut: 'EN_ATTENTE' | 'EN_COURS' | 'REUSSI' | 'ERREUR' | 'ANNULE'
  nb_lignes_fichier: number
  nb_lignes_importees: number
  nb_erreurs: number
  erreurs: Array<{
    ligne: number
    colonne: string
    message: string
    type: string
    valeur: string
  }>
  balance_generee?: string
  created_at: string
}

class BalanceService {
  private baseUrl = '/api/v1/balance'

  // Gestion des balances - CONNEXION RÉELLE AU BACKEND
  async getBalances(params?: {
    entreprise?: string
    exercice?: string
    type_balance?: string
    statut?: string
    page?: number
    page_size?: number
    ordering?: string
  }) {
    console.log('🔄 Fetching balances from backend...', params)
    return apiClient.get(`${this.baseUrl}/balances/`, params)
  }

  async getBalance(id: string): Promise<Balance> {
    console.log(`🔄 Fetching balance ${id} from backend...`)
    return apiClient.get(`${this.baseUrl}/balances/${id}/`)
  }

  async createBalance(data: Partial<Balance>): Promise<Balance> {
    console.log('📤 Creating balance in backend...', data)
    return apiClient.post(`${this.baseUrl}/balances/`, data)
  }

  async updateBalance(id: string, data: Partial<Balance>): Promise<Balance> {
    console.log(`📤 Updating balance ${id} in backend...`, data)
    return apiClient.patch(`${this.baseUrl}/balances/${id}/`, data)
  }

  async deleteBalance(id: string): Promise<void> {
    console.log(`🗑️ Deleting balance ${id} from backend...`)
    return apiClient.delete(`${this.baseUrl}/balances/${id}/`)
  }

  // Lignes de balance - CONNEXION RÉELLE AU BACKEND
  async getLignesBalance(balanceId: string, params?: {
    compte?: string
    page?: number
    page_size?: number
  }) {
    console.log(`🔄 Fetching balance lines for ${balanceId}...`, params)
    return apiClient.get(`${this.baseUrl}/balances/${balanceId}/lignes/`, params)
  }

  async updateLigneBalance(balanceId: string, ligneId: string, data: Partial<LigneBalance>) {
    console.log(`📤 Updating balance line ${ligneId}...`, data)
    return apiClient.patch(`${this.baseUrl}/balances/${balanceId}/lignes/${ligneId}/`, data)
  }

  // Import de balances
  async importBalance(
    entrepriseId: string,
    exerciceId: string,
    file: File,
    params?: {
      format?: string
      mapping?: any
      options?: any
    }
  ): Promise<ImportBalance> {
    const formData = new FormData()
    formData.append('fichier', file)
    formData.append('entreprise', entrepriseId)
    formData.append('exercice', exerciceId)
    
    if (params?.format) {
      formData.append('format_fichier', params.format)
    }
    if (params?.mapping) {
      formData.append('mapping', JSON.stringify(params.mapping))
    }
    if (params?.options) {
      formData.append('options', JSON.stringify(params.options))
    }

    console.log('📤 Importing balance file to backend...', { entrepriseId, exerciceId, file: file.name })
    return apiClient.post(`${this.baseUrl}/imports/`, formData)
  }

  async getImportStatus(importId: string): Promise<ImportBalance> {
    console.log(`🔄 Getting import status ${importId} from backend...`)
    return apiClient.get(`${this.baseUrl}/imports/${importId}/`)
  }

  async getImportHistory(params?: {
    entreprise?: string
    exercice?: string
    statut?: string
    page?: number
  }) {
    console.log('🔄 Getting import history from backend...', params)
    return apiClient.get(`${this.baseUrl}/imports/`, params)
  }

  // Validation et contrôles - CONNEXION RÉELLE AU BACKEND
  async validateBalance(balanceId: string) {
    console.log(`🔍 Validating balance ${balanceId} on backend...`)
    return apiClient.post(`${this.baseUrl}/balances/${balanceId}/valider/`)
  }

  async getValidationErrors(balanceId: string) {
    console.log(`🔍 Getting validation errors for ${balanceId}...`)
    return apiClient.get(`${this.baseUrl}/balances/${balanceId}/validation-errors/`)
  }

  async getValidationHistory(params?: {
    balance?: string
    start_date?: string
    end_date?: string
    page?: number
    page_size?: number
  }) {
    console.log('📋 Fetching validation history from backend...', params)
    return apiClient.get(`${this.baseUrl}/validations/`, params)
  }

  // Export - CONNEXION RÉELLE AU BACKEND
  async exportBalance(balanceId: string, format: 'XLSX' | 'CSV' | 'PDF') {
    console.log(`📥 Exporting balance ${balanceId} as ${format}...`)
    return apiClient.get(`${this.baseUrl}/export-balance/`, {
      balance_id: balanceId,
      format
    })
  }

  async exportBalanceAdvanced(
    balanceId: string,
    format: 'XLSX' | 'CSV' | 'PDF',
    options?: {
      includeLignes?: boolean
      includeStatistiques?: boolean
      includeGraphiques?: boolean
    }
  ): Promise<Blob> {
    console.log(`📥 Exporting balance ${balanceId} with advanced options...`, options)

    const params = {
      balance_id: balanceId,
      format,
      ...options,
    }

    const response = await apiClient.client.get(
      `${this.baseUrl}/export-balance/`,
      {
        params,
        responseType: 'blob'
      }
    )

    // Télécharger automatiquement le fichier
    const url = window.URL.createObjectURL(response.data)
    const link = document.createElement('a')
    link.href = url
    link.download = `balance_${balanceId}.${format.toLowerCase()}`
    link.click()
    window.URL.revokeObjectURL(url)

    return response.data
  }

  // Mapping intelligent (IA) - CONNEXION RÉELLE AU BACKEND
  async intelligentMapping(balanceId: string) {
    console.log(`🤖 Starting intelligent mapping for balance ${balanceId}...`)
    return apiClient.post(`${this.baseUrl}/mapping-intelligent/`, {
      balance_id: balanceId
    })
  }

  // Comparaison - CONNEXION RÉELLE AU BACKEND
  async compareBalances(balance1Id: string, balance2Id: string) {
    console.log(`📊 Comparing balances ${balance1Id} and ${balance2Id}...`)
    return apiClient.get(`${this.baseUrl}/balances/compare/`, {
      balance1: balance1Id,
      balance2: balance2Id
    })
  }

  // Statistiques - CONNEXION RÉELLE AU BACKEND
  async getBalanceStats(balanceId: string) {
    console.log(`📊 Getting stats for balance ${balanceId}...`)
    return apiClient.get(`${this.baseUrl}/balances/${balanceId}/stats/`)
  }

  // ===== PLANS COMPTABLES D'ENTREPRISE =====

  async getPlansComptables(entrepriseId: number): Promise<any[]> {
    console.log(`🔄 Fetching plans comptables for entreprise ${entrepriseId}...`)
    const data = await apiClient.get(`${this.baseUrl}/plans-comptables`, { entreprise: entrepriseId })
    return data.results || []
  }

  async getPlanComptable(id: number): Promise<any> {
    return apiClient.get(`${this.baseUrl}/plans-comptables/${id}/`)
  }

  async createPlanComptable(data: any): Promise<any> {
    console.log('📤 Creating plan comptable...', data)
    return apiClient.post(`${this.baseUrl}/plans-comptables`, data)
  }

  // ===== COMPTES D'ENTREPRISE =====

  async getComptes(planComptableId?: number): Promise<any[]> {
    const params = planComptableId ? { plan_comptable: planComptableId } : undefined
    const data = await apiClient.get(`${this.baseUrl}/comptes`, params)
    return data.results || []
  }

  async getCompte(id: number): Promise<any> {
    return apiClient.get(`${this.baseUrl}/comptes/${id}/`)
  }

  async createCompte(data: any): Promise<any> {
    console.log('📤 Creating compte...', data)
    return apiClient.post(`${this.baseUrl}/comptes`, data)
  }

  async updateCompte(id: number, data: any): Promise<any> {
    return apiClient.patch(`${this.baseUrl}/comptes/${id}/`, data)
  }

  // ===== MAPPINGS =====

  async getMappings(filters?: { compte_local?: number; compte_reference?: number }): Promise<any[]> {
    const data = await apiClient.get(`${this.baseUrl}/mappings`, filters)
    return data.results || []
  }

  async createMapping(data: { compte_local: number; compte_reference: number }): Promise<any> {
    console.log('📤 Creating mapping...', data)
    return apiClient.post(`${this.baseUrl}/mappings`, data)
  }

  async deleteMapping(id: number): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/mappings/${id}/`)
  }
}

export const balanceService = new BalanceService()
export default balanceService