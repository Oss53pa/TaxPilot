/**
 * Service pour la gestion comptable et plan de comptes
 * CONNEXION RÉELLE AU BACKEND DJANGO
 */

import { apiClient } from './apiClient'

export interface CompteComptable {
  id: string
  numero: string
  libelle: string
  classe: number
  niveau: number
  type_compte: 'DETAIL' | 'TITRE' | 'SOUS_TITRE'
  nature: 'DEBIT' | 'CREDIT' | 'SOLDE'
  is_actif: boolean
  compte_parent?: string
  comptes_enfants?: CompteComptable[]
  solde_debiteur?: number
  solde_crediteur?: number
  mouvements_count?: number
  derniere_utilisation?: string
  created_at: string
  updated_at: string
}

export interface PlanComptable {
  id: string
  nom: string
  version: string
  norme: 'SYSCOHADA' | 'IFRS' | 'PCG' | 'OHADA'
  pays: string
  description: string
  is_officiel: boolean
  is_default: boolean
  comptes: CompteComplet[]
  created_at: string
  updated_at: string
}

export interface CompteComplet extends CompteComptable {
  plan_comptable: string
  regles_validation?: string[]
  comptes_lies?: string[]
  mapping_fiscal?: {
    code_impot: string
    taux_applicable?: number
    exemption?: boolean
  }
}

export interface EcritureComptable {
  id: string
  numero_piece: string
  date_ecriture: string
  libelle: string
  montant_total: number
  devise: string
  statut: 'BROUILLON' | 'VALIDEE' | 'CLOTUREE'
  journal: string
  exercice: string
  lignes: LigneEcriture[]
  piece_jointe?: string
  created_by: string
  validated_by?: string
  created_at: string
  updated_at: string
}

export interface LigneEcriture {
  id: string
  compte: string
  compte_detail?: CompteComptable
  libelle: string
  debit: number
  credit: number
  ordre: number
  reference?: string
  tiers?: string
  created_at: string
}

export interface Journal {
  id: string
  code: string
  libelle: string
  type_journal: 'VENTE' | 'ACHAT' | 'BANQUE' | 'CAISSE' | 'OD' | 'REPORT'
  is_actif: boolean
  sequence_actuelle: number
  prefixe_numero?: string
  comptes_autorises?: string[]
  created_at: string
}

export interface Balance {
  exercice: string
  date_arret: string
  comptes: Array<{
    numero: string
    libelle: string
    solde_initial_debit: number
    solde_initial_credit: number
    mouvements_debit: number
    mouvements_credit: number
    solde_final_debit: number
    solde_final_credit: number
  }>
  totaux: {
    total_debits: number
    total_credits: number
    equilibre: boolean
  }
}

export interface GrandLivre {
  compte: string
  compte_detail?: CompteComptable
  periode_debut: string
  periode_fin: string
  solde_initial: number
  mouvements: Array<{
    date: string
    numero_piece: string
    libelle: string
    debit: number
    credit: number
    solde_progressif: number
  }>
  solde_final: number
  total_debit: number
  total_credit: number
}

class AccountingService {
  private baseUrl = '/api/v1/accounting'

  // Plan comptable - CONNEXION RÉELLE AU BACKEND
  async getPlansComptables(params?: {
    norme?: string
    pays?: string
    is_officiel?: boolean
    page?: number
  }) {
    console.log('🔄 Fetching plans comptables from backend...', params)
    return apiClient.get(`${this.baseUrl}/plans/`, params)
  }

  async getPlanComptable(id: string): Promise<PlanComptable> {
    console.log(`🔄 Fetching plan comptable ${id} from backend...`)
    return apiClient.get(`${this.baseUrl}/plans/${id}/`)
  }

  async createPlanComptable(plan: Partial<PlanComptable>): Promise<PlanComptable> {
    console.log('📤 Creating plan comptable in backend...', plan)
    return apiClient.post(`${this.baseUrl}/plans/`, plan)
  }

  async updatePlanComptable(id: string, plan: Partial<PlanComptable>): Promise<PlanComptable> {
    console.log(`📤 Updating plan comptable ${id} in backend...`)
    return apiClient.patch(`${this.baseUrl}/plans/${id}/`, plan)
  }

  async deletePlanComptable(id: string): Promise<void> {
    console.log(`🗑️ Deleting plan comptable ${id} from backend...`)
    return apiClient.delete(`${this.baseUrl}/plans/${id}/`)
  }

  async duplicatePlanComptable(id: string, newName: string): Promise<PlanComptable> {
    console.log(`📋 Duplicating plan comptable ${id} as ${newName}...`)
    return apiClient.post(`${this.baseUrl}/plans/${id}/duplicate/`, { nom: newName })
  }

  // Comptes comptables - CONNEXION RÉELLE AU BACKEND
  async getComptes(params?: {
    plan_comptable?: string
    classe?: number
    niveau?: number
    type_compte?: string
    search?: string
    is_actif?: boolean
    page?: number
  }) {
    console.log('🔄 Fetching comptes from backend...', params)
    return apiClient.get(`${this.baseUrl}/comptes/`, params)
  }

  async getCompte(id: string): Promise<CompteComplet> {
    console.log(`🔄 Fetching compte ${id} from backend...`)
    return apiClient.get(`${this.baseUrl}/comptes/${id}/`)
  }

  async createCompte(compte: Partial<CompteComplet>): Promise<CompteComplet> {
    console.log('📤 Creating compte in backend...', compte)
    return apiClient.post(`${this.baseUrl}/comptes/`, compte)
  }

  async updateCompte(id: string, compte: Partial<CompteComplet>): Promise<CompteComplet> {
    console.log(`📤 Updating compte ${id} in backend...`)
    return apiClient.patch(`${this.baseUrl}/comptes/${id}/`, compte)
  }

  async deleteCompte(id: string): Promise<void> {
    console.log(`🗑️ Deleting compte ${id} from backend...`)
    return apiClient.delete(`${this.baseUrl}/comptes/${id}/`)
  }

  async getCompteHierarchy(plan_id: string) {
    console.log(`🌳 Getting compte hierarchy for plan ${plan_id}...`)
    return apiClient.get(`${this.baseUrl}/plans/${plan_id}/hierarchy/`)
  }

  async searchComptes(query: string, plan_id?: string) {
    console.log(`🔍 Searching comptes: ${query}...`)
    return apiClient.get(`${this.baseUrl}/comptes/search/`, { q: query, plan_comptable: plan_id })
  }

  // Écritures comptables - CONNEXION RÉELLE AU BACKEND
  async getEcritures(params?: {
    journal?: string
    exercice?: string
    date_debut?: string
    date_fin?: string
    statut?: string
    compte?: string
    page?: number
  }) {
    console.log('🔄 Fetching écritures from backend...', params)
    return apiClient.get(`${this.baseUrl}/ecritures/`, params)
  }

  async getEcriture(id: string): Promise<EcritureComptable> {
    console.log(`🔄 Fetching écriture ${id} from backend...`)
    return apiClient.get(`${this.baseUrl}/ecritures/${id}/`)
  }

  async createEcriture(ecriture: Partial<EcritureComptable>): Promise<EcritureComptable> {
    console.log('📤 Creating écriture in backend...', ecriture)
    return apiClient.post(`${this.baseUrl}/ecritures/`, ecriture)
  }

  async updateEcriture(id: string, ecriture: Partial<EcritureComptable>): Promise<EcritureComptable> {
    console.log(`📤 Updating écriture ${id} in backend...`)
    return apiClient.patch(`${this.baseUrl}/ecritures/${id}/`, ecriture)
  }

  async deleteEcriture(id: string): Promise<void> {
    console.log(`🗑️ Deleting écriture ${id} from backend...`)
    return apiClient.delete(`${this.baseUrl}/ecritures/${id}/`)
  }

  async validateEcriture(id: string): Promise<EcritureComptable> {
    console.log(`✅ Validating écriture ${id} on backend...`)
    return apiClient.post(`${this.baseUrl}/ecritures/${id}/validate/`)
  }

  async unvalidateEcriture(id: string): Promise<EcritureComptable> {
    console.log(`❌ Unvalidating écriture ${id} on backend...`)
    return apiClient.post(`${this.baseUrl}/ecritures/${id}/unvalidate/`)
  }

  async duplicateEcriture(id: string): Promise<EcritureComptable> {
    console.log(`📋 Duplicating écriture ${id}...`)
    return apiClient.post(`${this.baseUrl}/ecritures/${id}/duplicate/`)
  }

  // Journaux - CONNEXION RÉELLE AU BACKEND
  async getJournaux(params?: {
    type_journal?: string
    is_actif?: boolean
    page?: number
  }) {
    console.log('🔄 Fetching journaux from backend...', params)
    return apiClient.get(`${this.baseUrl}/journaux/`, params)
  }

  async getJournal(id: string): Promise<Journal> {
    console.log(`🔄 Fetching journal ${id} from backend...`)
    return apiClient.get(`${this.baseUrl}/journaux/${id}/`)
  }

  async createJournal(journal: Partial<Journal>): Promise<Journal> {
    console.log('📤 Creating journal in backend...', journal)
    return apiClient.post(`${this.baseUrl}/journaux/`, journal)
  }

  async updateJournal(id: string, journal: Partial<Journal>): Promise<Journal> {
    console.log(`📤 Updating journal ${id} in backend...`)
    return apiClient.patch(`${this.baseUrl}/journaux/${id}/`, journal)
  }

  async deleteJournal(id: string): Promise<void> {
    console.log(`🗑️ Deleting journal ${id} from backend...`)
    return apiClient.delete(`${this.baseUrl}/journaux/${id}/`)
  }

  // États comptables - CONNEXION RÉELLE AU BACKEND
  async getBalance(params: {
    exercice: string
    date_arret?: string
    comptes_debut?: string
    comptes_fin?: string
    niveau_detail?: number
  }): Promise<Balance> {
    console.log('📊 Getting balance from backend...', params)
    return apiClient.get(`${this.baseUrl}/balance/`, params)
  }

  async getGrandLivre(params: {
    compte: string
    periode_debut: string
    periode_fin: string
    inclure_ods?: boolean
  }): Promise<GrandLivre> {
    console.log(`📖 Getting grand livre for compte ${params.compte}...`)
    return apiClient.get(`${this.baseUrl}/grand-livre/`, params)
  }

  async getJournalGeneral(params: {
    journal: string
    periode_debut: string
    periode_fin: string
    page?: number
  }) {
    console.log(`📑 Getting journal général for ${params.journal}...`)
    return apiClient.get(`${this.baseUrl}/journal-general/`, params)
  }

  async getBalanceAuxiliaire(params: {
    exercice: string
    type_tiers: 'CLIENT' | 'FOURNISSEUR'
    date_arret?: string
  }) {
    console.log('📊 Getting balance auxiliaire from backend...', params)
    return apiClient.get(`${this.baseUrl}/balance-auxiliaire/`, params)
  }

  // Import/Export - CONNEXION RÉELLE AU BACKEND
  async importEcritures(file: File, options?: {
    journal_id: string
    format: 'CSV' | 'EXCEL' | 'FEC'
    mapping?: any
  }) {
    console.log('📤 Importing écritures to backend...', options)
    return apiClient.upload(`${this.baseUrl}/import/ecritures/`, file, options)
  }

  async importPlanComptable(file: File, options?: {
    format: 'CSV' | 'EXCEL'
    replace_existing: boolean
  }) {
    console.log('📤 Importing plan comptable to backend...', options)
    return apiClient.upload(`${this.baseUrl}/import/plan/`, file, options)
  }

  async exportBalance(params: {
    exercice: string
    format: 'EXCEL' | 'CSV' | 'PDF'
    date_arret?: string
  }): Promise<Blob> {
    console.log('📥 Exporting balance from backend...', params)
    const response = await apiClient.client.get(`${this.baseUrl}/export/balance/`, {
      params,
      responseType: 'blob'
    })
    return response.data
  }

  async exportGrandLivre(params: {
    compte: string
    periode_debut: string
    periode_fin: string
    format: 'EXCEL' | 'CSV' | 'PDF'
  }): Promise<Blob> {
    console.log('📥 Exporting grand livre from backend...', params)
    const response = await apiClient.client.get(`${this.baseUrl}/export/grand-livre/`, {
      params,
      responseType: 'blob'
    })
    return response.data
  }

  async exportFEC(exercice: string): Promise<Blob> {
    console.log(`📥 Exporting FEC for exercice ${exercice}...`)
    const response = await apiClient.client.get(`${this.baseUrl}/export/fec/`, {
      params: { exercice },
      responseType: 'blob'
    })
    return response.data
  }

  // Validation et contrôles - CONNEXION RÉELLE AU BACKEND
  async validateBalance(exercice: string) {
    console.log(`🔍 Validating balance for exercice ${exercice}...`)
    return apiClient.post(`${this.baseUrl}/validate/balance/`, { exercice })
  }

  async validateEcrituresLot(ecriture_ids: string[]) {
    console.log(`✅ Batch validating ${ecriture_ids.length} écritures...`)
    return apiClient.post(`${this.baseUrl}/validate/ecritures-lot/`, { ecriture_ids })
  }

  async getAnomaliesComptables(params?: {
    exercice?: string
    type_anomalie?: string
    severite?: string
  }) {
    console.log('🔍 Getting anomalies comptables from backend...', params)
    return apiClient.get(`${this.baseUrl}/anomalies/`, params)
  }

  // Clôture d'exercice - CONNEXION RÉELLE AU BACKEND
  async startCloture(exercice: string, options?: {
    generer_reports: boolean
    valider_toutes_ecritures: boolean
  }) {
    console.log(`🔒 Starting clôture for exercice ${exercice}...`)
    return apiClient.post(`${this.baseUrl}/cloture/start/`, { exercice, ...options })
  }

  async getClotureStatus(exercice: string) {
    console.log(`🔄 Getting clôture status for exercice ${exercice}...`)
    return apiClient.get(`${this.baseUrl}/cloture/status/`, { exercice })
  }

  async cancelCloture(exercice: string) {
    console.log(`❌ Cancelling clôture for exercice ${exercice}...`)
    return apiClient.post(`${this.baseUrl}/cloture/cancel/`, { exercice })
  }
}

export const accountingService = new AccountingService()
export default accountingService