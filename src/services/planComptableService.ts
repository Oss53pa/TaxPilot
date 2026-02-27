/**
 * Service pour la gestion des plans comptables de référence
 * CONNEXION RÉELLE AU BACKEND DJANGO
 */

import { apiClient } from './apiClient'

export interface PlanComptableReference {
  id: number
  code: string
  nom: string
  type_plan:
    | 'SYSCOHADA_GENERAL'
    | 'SYSCOHADA_BANQUE'
    | 'SYSCOHADA_ASSURANCE'
    | 'SYSCOHADA_MICROFINANCE'
    | 'IFRS_SME'
    | 'IFRS_FULL'
    | 'NATIONAL'
    | 'PERSONNALISE'
  type_liasse: number
  pays_applicable?: number

  // Versioning
  version: string
  date_publication: string
  date_application: string
  date_fin_validite?: string

  // Métadonnées
  autorite_publication: string
  reference_officielle: string
  url_reference: string

  // Configuration
  est_actif: boolean
  est_officiel: boolean
  peut_etre_modifie: boolean

  created_at: string
  updated_at: string
}

export interface CompteReference {
  id: number
  plan_comptable: number
  numero: string
  libelle: string

  // Classification
  classe: string
  sous_classe: string
  poste: string
  compte_principal: string

  // Propriétés
  sens_normal: 'DEBIT' | 'CREDIT'
  nature_compte: 'ACTIF' | 'PASSIF' | 'CHARGE' | 'PRODUIT'

  // Hiérarchie
  niveau: number
  compte_parent?: number

  // Paramètres d'utilisation
  accepte_imputation: boolean
  obligatoire_tiers: boolean
  obligatoire_analytique: boolean

  // Correspondances
  equivalence_ifrs: string
  code_fiscal_ohada: string

  // Notes
  note_utilisation: string
  exemples_utilisation: string[]

  created_at: string
  updated_at: string
}

export interface CorrespondanceComptable {
  id: number
  compte_local: number
  compte_syscohada: number
  validee_par?: number
  date_validation?: string
  created_at: string
  updated_at: string
}

export interface PlanFilters {
  type_plan?: string
  est_actif?: boolean
  est_officiel?: boolean
  pays_applicable?: number
  page?: number
  page_size?: number
}

export interface CompteFilters {
  plan_comptable?: number
  classe?: string
  nature_compte?: string
  accepte_imputation?: boolean
  search?: string
  page?: number
  page_size?: number
}

class PlanComptableService {
  private baseUrl = '/api/v1/accounting'

  // ===== PLANS COMPTABLES =====

  /**
   * Récupérer la liste des plans comptables
   */
  async listPlans(filters?: PlanFilters): Promise<{
    count: number
    results: PlanComptableReference[]
  }> {
    console.log('🔄 Fetching plans comptables from backend...', filters)
    return apiClient.get(`${this.baseUrl}/plans-reference`, filters)
  }

  /**
   * Récupérer tous les plans (sans pagination)
   */
  async getAllPlans(filters?: Omit<PlanFilters, 'page' | 'page_size'>): Promise<PlanComptableReference[]> {
    console.log('🔄 Fetching all plans comptables...')
    const data = await apiClient.get(`${this.baseUrl}/plans-reference`, { ...filters, page_size: 1000 })
    return data.results || []
  }

  /**
   * Récupérer un plan comptable par ID
   */
  async getPlanById(id: number): Promise<PlanComptableReference> {
    console.log(`🔄 Fetching plan comptable ${id}...`)
    return apiClient.get(`${this.baseUrl}/plans-reference/${id}/`)
  }

  /**
   * Créer un nouveau plan comptable
   */
  async createPlan(data: Partial<PlanComptableReference>): Promise<PlanComptableReference> {
    console.log('📤 Creating plan comptable...', data)
    return apiClient.post(`${this.baseUrl}/plans-reference`, data)
  }

  /**
   * Mettre à jour un plan comptable
   */
  async updatePlan(id: number, data: Partial<PlanComptableReference>): Promise<PlanComptableReference> {
    console.log(`📤 Updating plan comptable ${id}...`, data)
    return apiClient.patch(`${this.baseUrl}/plans-reference/${id}/`, data)
  }

  /**
   * Supprimer un plan comptable
   */
  async deletePlan(id: number): Promise<void> {
    console.log(`🗑️ Deleting plan comptable ${id}...`)
    return apiClient.delete(`${this.baseUrl}/plans-reference/${id}/`)
  }

  /**
   * Récupérer les plans SYSCOHADA actifs
   */
  async getSYSCOHADAPlans(): Promise<PlanComptableReference[]> {
    console.log('🔄 Fetching SYSCOHADA plans...')
    const data = await apiClient.get(`${this.baseUrl}/plans-reference`, {
      type_plan: 'SYSCOHADA_GENERAL',
      est_actif: true,
      page_size: 100
    })
    return data.results || []
  }

  // ===== COMPTES DE RÉFÉRENCE =====

  /**
   * Récupérer la liste des comptes de référence
   */
  async listComptes(filters?: CompteFilters): Promise<{
    count: number
    results: CompteReference[]
  }> {
    console.log('🔄 Fetching comptes de référence from backend...', filters)
    return apiClient.get(`${this.baseUrl}/comptes-reference`, filters)
  }

  /**
   * Récupérer tous les comptes (sans pagination)
   */
  async getAllComptes(filters?: Omit<CompteFilters, 'page' | 'page_size'>): Promise<CompteReference[]> {
    console.log('🔄 Fetching all comptes de référence...')
    const data = await apiClient.get(`${this.baseUrl}/comptes-reference`, { ...filters, page_size: 10000 })
    return data.results || []
  }

  /**
   * Récupérer un compte de référence par ID
   */
  async getCompteById(id: number): Promise<CompteReference> {
    console.log(`🔄 Fetching compte de référence ${id}...`)
    return apiClient.get(`${this.baseUrl}/comptes-reference/${id}/`)
  }

  /**
   * Créer un nouveau compte de référence
   */
  async createCompte(data: Partial<CompteReference>): Promise<CompteReference> {
    console.log('📤 Creating compte de référence...', data)
    return apiClient.post(`${this.baseUrl}/comptes-reference`, data)
  }

  /**
   * Mettre à jour un compte de référence
   */
  async updateCompte(id: number, data: Partial<CompteReference>): Promise<CompteReference> {
    console.log(`📤 Updating compte de référence ${id}...`, data)
    return apiClient.patch(`${this.baseUrl}/comptes-reference/${id}/`, data)
  }

  /**
   * Supprimer un compte de référence
   */
  async deleteCompte(id: number): Promise<void> {
    console.log(`🗑️ Deleting compte de référence ${id}...`)
    return apiClient.delete(`${this.baseUrl}/comptes-reference/${id}/`)
  }

  /**
   * Récupérer les comptes d'un plan comptable
   */
  async getComptesByPlan(planId: number): Promise<CompteReference[]> {
    console.log(`🔄 Fetching comptes for plan ${planId}...`)
    const data = await apiClient.get(`${this.baseUrl}/comptes-reference`, {
      plan_comptable: planId,
      page_size: 10000
    })
    return data.results || []
  }

  /**
   * Récupérer les comptes par classe
   */
  async getComptesByClasse(planId: number, classe: string): Promise<CompteReference[]> {
    console.log(`🔄 Fetching comptes classe ${classe} for plan ${planId}...`)
    const data = await apiClient.get(`${this.baseUrl}/comptes-reference`, {
      plan_comptable: planId,
      classe: classe,
      page_size: 10000
    })
    return data.results || []
  }

  /**
   * Rechercher des comptes
   */
  async searchComptes(query: string, planId?: number): Promise<CompteReference[]> {
    console.log(`🔍 Searching comptes: ${query}...`)
    const data = await apiClient.get(`${this.baseUrl}/comptes-reference`, {
      search: query,
      ...(planId && { plan_comptable: planId }),
      page_size: 100
    })
    return data.results || []
  }

  // ===== CORRESPONDANCES COMPTABLES =====

  /**
   * Récupérer les correspondances comptables
   */
  async listCorrespondances(filters?: { compte_local?: number }): Promise<{
    count: number
    results: CorrespondanceComptable[]
  }> {
    console.log('🔄 Fetching correspondances comptables...', filters)
    return apiClient.get(`${this.baseUrl}/correspondances`, filters)
  }

  /**
   * Créer une correspondance comptable
   */
  async createCorrespondance(data: {
    compte_local: number
    compte_syscohada: number
  }): Promise<CorrespondanceComptable> {
    console.log('📤 Creating correspondance comptable...', data)
    return apiClient.post(`${this.baseUrl}/correspondances`, data)
  }

  /**
   * Valider une correspondance
   */
  async validateCorrespondance(id: number): Promise<CorrespondanceComptable> {
    console.log(`✅ Validating correspondance ${id}...`)
    return apiClient.patch(`${this.baseUrl}/correspondances/${id}/`, {
      date_validation: new Date().toISOString()
    })
  }

  // ===== HELPERS =====

  /**
   * Obtenir le libellé du type de plan
   */
  getTypePlanLabel(type: PlanComptableReference['type_plan']): string {
    const labels = {
      'SYSCOHADA_GENERAL': 'SYSCOHADA Général',
      'SYSCOHADA_BANQUE': 'SYSCOHADA Bancaire',
      'SYSCOHADA_ASSURANCE': 'SYSCOHADA Assurance',
      'SYSCOHADA_MICROFINANCE': 'SYSCOHADA Microfinance',
      'IFRS_SME': 'IFRS pour PME',
      'IFRS_FULL': 'IFRS Complet',
      'NATIONAL': 'Plan National',
      'PERSONNALISE': 'Plan Personnalisé'
    }
    return labels[type] || type
  }

  /**
   * Obtenir la classe d'un compte (premier chiffre)
   */
  getClasse(numero: string): string {
    return numero.charAt(0)
  }

  /**
   * Obtenir le libellé de la classe
   */
  getClasseLabel(classe: string): string {
    const labels: Record<string, string> = {
      '1': 'Comptes de ressources durables',
      '2': 'Comptes d\'actif immobilisé',
      '3': 'Comptes de stocks',
      '4': 'Comptes de tiers',
      '5': 'Comptes de trésorerie',
      '6': 'Comptes de charges',
      '7': 'Comptes de produits',
      '8': 'Comptes de résultats'
    }
    return labels[classe] || `Classe ${classe}`
  }

  /**
   * Vérifier si un compte est imputable
   */
  isCompteImputable(compte: CompteReference): boolean {
    return compte.accepte_imputation
  }

  /**
   * Formater le numéro de compte (ajouter espaces selon niveau)
   */
  formatNumeroCompte(numero: string, niveau: number): string {
    // Formater le numéro selon le niveau hiérarchique
    // Exemple: niveau 1 = "6", niveau 2 = "60", niveau 3 = "601", etc.
    return numero
  }
}

export default new PlanComptableService()
