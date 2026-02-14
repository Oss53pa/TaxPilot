/**
 * Service pour l'audit et le contrôle des liasses fiscales
 * CONNEXION RÉELLE AU BACKEND DJANGO
 */

import { apiClient } from './apiClient'

export interface AuditSession {
  id: string
  entreprise: string
  entreprise_detail?: {
    raison_sociale: string
    numero_contribuable: string
  }
  exercice: string
  liasse: string
  type_audit: 'COHERENCE' | 'CONFORMITE' | 'FISCAL' | 'COMPLET'
  niveau: 'RAPIDE' | 'STANDARD' | 'APPROFONDI'
  statut: 'EN_ATTENTE' | 'EN_COURS' | 'TERMINE' | 'ERREUR'
  progression: number
  auditeur?: string
  date_debut: string
  date_fin?: string
  resultats: {
    score_global: number
    nb_anomalies: number
    nb_warnings: number
    nb_erreurs: number
    conformite_pourcentage: number
  }
  created_at: string
  updated_at: string
}

export interface AuditAnomalie {
  id: string
  audit_session: string
  type: 'ERREUR' | 'WARNING' | 'INFO'
  categorie: 'COHERENCE' | 'CALCUL' | 'REGLEMENTATION' | 'FORMAT'
  code_regle: string
  titre: string
  description: string
  localisation: {
    etat: string
    ligne?: string
    cellule?: string
    compte?: string
  }
  valeur_attendue?: any
  valeur_trouvee?: any
  impact_fiscal?: number
  suggestion?: string
  statut: 'NOUVELLE' | 'EN_COURS' | 'RESOLUE' | 'IGNOREE'
  priorite: 'FAIBLE' | 'MOYENNE' | 'HAUTE' | 'CRITIQUE'
  created_at: string
}

export interface AuditRequest {
  entreprise_id: string
  exercice_id: string
  liasse_id: string
  type_audit: 'COHERENCE' | 'CONFORMITE' | 'FISCAL' | 'COMPLET'
  niveau: 'RAPIDE' | 'STANDARD' | 'APPROFONDI'
  options?: {
    controles_personnalises: string[]
    seuil_materialite?: number
    inclure_recommandations: boolean
  }
}

export interface ControlRule {
  id: string
  code: string
  nom: string
  description: string
  categorie: string
  type_controle: 'AUTOMATIQUE' | 'MANUEL' | 'MIXTE'
  formule?: string
  seuil_alerte?: number
  obligatoire: boolean
  applicable_types: string[]
  created_at: string
}

class AuditService {
  private baseUrl = '/api/v1/audit'

  // Sessions d'audit - CONNEXION RÉELLE AU BACKEND
  async startAudit(request: AuditRequest): Promise<AuditSession> {
    console.log('📤 Starting audit session in backend...', request)
    return apiClient.post(`${this.baseUrl}/sessions/`, request)
  }

  async getAuditSessions(params?: {
    entreprise?: string
    exercice?: string
    type_audit?: string
    statut?: string
    page?: number
    page_size?: number
  }) {
    console.log('🔄 Fetching audit sessions from backend...', params)
    return apiClient.get(`${this.baseUrl}/sessions/`, params)
  }

  async getAuditSession(id: string): Promise<AuditSession> {
    console.log(`🔄 Fetching audit session ${id} from backend...`)
    return apiClient.get(`${this.baseUrl}/sessions/${id}/`)
  }

  async getAuditStatus(id: string): Promise<AuditSession> {
    console.log(`🔄 Getting audit status ${id} from backend...`)
    return apiClient.get(`${this.baseUrl}/sessions/${id}/status/`)
  }

  async cancelAudit(id: string): Promise<void> {
    console.log(`🛑 Cancelling audit ${id} on backend...`)
    return apiClient.post(`${this.baseUrl}/sessions/${id}/cancel/`)
  }

  // Anomalies et résultats - CONNEXION RÉELLE AU BACKEND
  async getAuditAnomalies(sessionId: string, params?: {
    type?: string
    categorie?: string
    statut?: string
    priorite?: string
    page?: number
    page_size?: number
  }) {
    console.log(`🔄 Fetching anomalies for audit ${sessionId}...`, params)
    return apiClient.get(`${this.baseUrl}/sessions/${sessionId}/anomalies/`, params)
  }

  async getAnomalie(id: string): Promise<AuditAnomalie> {
    console.log(`🔄 Fetching anomalie ${id} from backend...`)
    return apiClient.get(`${this.baseUrl}/anomalies/${id}/`)
  }

  async updateAnomalieStatus(id: string, statut: string, commentaire?: string) {
    console.log(`📤 Updating anomalie ${id} status to ${statut}...`)
    return apiClient.patch(`${this.baseUrl}/anomalies/${id}/`, {
      statut,
      commentaire
    })
  }

  async resolveAnomalie(id: string, resolution: {
    action: string
    commentaire: string
    nouvelle_valeur?: any
  }) {
    console.log(`✅ Resolving anomalie ${id}...`)
    return apiClient.post(`${this.baseUrl}/anomalies/${id}/resolve/`, resolution)
  }

  // Règles de contrôle - CONNEXION RÉELLE AU BACKEND
  async getControlRules(params?: {
    categorie?: string
    type_controle?: string
    applicable_type?: string
    page?: number
  }) {
    console.log('🔄 Fetching control rules from backend...', params)
    return apiClient.get(`${this.baseUrl}/rules/`, params)
  }

  async getControlRule(id: string): Promise<ControlRule> {
    console.log(`🔄 Fetching control rule ${id} from backend...`)
    return apiClient.get(`${this.baseUrl}/rules/${id}/`)
  }

  async createControlRule(rule: Partial<ControlRule>): Promise<ControlRule> {
    console.log('📤 Creating control rule in backend...', rule)
    return apiClient.post(`${this.baseUrl}/rules/`, rule)
  }

  async updateControlRule(id: string, rule: Partial<ControlRule>): Promise<ControlRule> {
    console.log(`📤 Updating control rule ${id} in backend...`)
    return apiClient.patch(`${this.baseUrl}/rules/${id}/`, rule)
  }

  async deleteControlRule(id: string): Promise<void> {
    console.log(`🗑️ Deleting control rule ${id} from backend...`)
    return apiClient.delete(`${this.baseUrl}/rules/${id}/`)
  }

  // Tests et validations - CONNEXION RÉELLE AU BACKEND
  async testControlRule(ruleId: string, testData: any) {
    console.log(`🧪 Testing control rule ${ruleId} on backend...`)
    return apiClient.post(`${this.baseUrl}/rules/${ruleId}/test/`, testData)
  }

  async validateLiasse(liasseId: string, ruleIds?: string[]) {
    console.log(`🔍 Validating liasse ${liasseId} with custom rules...`)
    return apiClient.post(`${this.baseUrl}/validate/`, {
      liasse_id: liasseId,
      rule_ids: ruleIds
    })
  }

  // Rapports d'audit - CONNEXION RÉELLE AU BACKEND
  async generateAuditReport(sessionId: string, options?: {
    format: 'PDF' | 'EXCEL' | 'XML'
    inclure_annexes: boolean
    niveau_detail: 'RESUME' | 'DETAILLE' | 'COMPLET'
  }) {
    console.log(`📄 Generating audit report for session ${sessionId}...`)
    return apiClient.post(`${this.baseUrl}/sessions/${sessionId}/report/`, options)
  }

  async downloadAuditReport(sessionId: string, format: 'PDF' | 'EXCEL'): Promise<Blob> {
    console.log(`📥 Downloading audit report ${sessionId} as ${format}...`)
    const response = await apiClient.client.get(`${this.baseUrl}/sessions/${sessionId}/download/`, {
      params: { format },
      responseType: 'blob'
    })
    return response.data
  }

  // Statistiques et métriques - CONNEXION RÉELLE AU BACKEND
  async getAuditStats(params?: {
    entreprise?: string
    period?: string
    type_audit?: string
  }) {
    console.log('📊 Getting audit stats from backend...', params)
    return apiClient.get(`${this.baseUrl}/stats/`, params)
  }

  async getAuditTrends(params?: {
    entreprise?: string
    period_start?: string
    period_end?: string
  }) {
    console.log('📈 Getting audit trends from backend...', params)
    return apiClient.get(`${this.baseUrl}/trends/`, params)
  }

  // IA et recommandations - CONNEXION RÉELLE AU BACKEND
  async getAIRecommendations(sessionId: string) {
    console.log(`🤖 Getting AI recommendations for audit ${sessionId}...`)
    return apiClient.get(`${this.baseUrl}/sessions/${sessionId}/ai-recommendations/`)
  }

  async analyzeWithAI(data: {
    liasse_id: string
    focus_areas?: string[]
    analysis_level: 'BASIC' | 'ADVANCED' | 'EXPERT'
  }) {
    console.log('🤖 Starting AI analysis on backend...', data)
    return apiClient.post(`${this.baseUrl}/ai-analyze/`, data)
  }

  // Historique et comparaisons - CONNEXION RÉELLE AU BACKEND
  async getAuditHistory(entrepriseId: string, exerciceId?: string) {
    console.log(`🔄 Getting audit history for entreprise ${entrepriseId}...`)
    return apiClient.get(`${this.baseUrl}/history/`, {
      entreprise: entrepriseId,
      exercice: exerciceId
    })
  }

  async compareAudits(audit1Id: string, audit2Id: string) {
    console.log(`📊 Comparing audits ${audit1Id} and ${audit2Id}...`)
    return apiClient.get(`${this.baseUrl}/compare/`, {
      audit1: audit1Id,
      audit2: audit2Id
    })
  }
}

export const auditService = new AuditService()
export default auditService