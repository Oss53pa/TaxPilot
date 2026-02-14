/**
 * Service pour la génération de rapports et statistiques
 * CONNEXION RÉELLE AU BACKEND DJANGO
 */

import { apiClient } from './apiClient'

export interface Report {
  id: string
  nom: string
  type_rapport: 'FINANCIAL' | 'TAX' | 'AUDIT' | 'COMPLIANCE' | 'DASHBOARD'
  periode_debut: string
  periode_fin: string
  entreprise: string
  entreprise_detail?: {
    raison_sociale: string
    numero_contribuable: string
  }
  exercice?: string
  format: 'PDF' | 'EXCEL' | 'CSV' | 'JSON'
  statut: 'EN_PREPARATION' | 'EN_COURS' | 'TERMINE' | 'ERREUR'
  progression: number
  fichier_url?: string
  fichier_genere?: string
  taille_fichier?: number
  nb_pages?: number
  parametres: {
    inclure_details: boolean
    inclure_graphiques: boolean
    inclure_comparaisons: boolean
    niveau_detail: 'RESUME' | 'STANDARD' | 'DETAILLE'
  }
  metadata?: {
    auteur: string
    date_generation: string
    version: string
    signature_digitale?: string
  }
  erreurs?: Array<{
    code: string
    message: string
    ligne?: number
  }>
  created_at: string
  updated_at: string
}

export interface ReportTemplate {
  id: string
  nom: string
  description: string
  type_rapport: string
  format_defaut: string
  sections: Array<{
    id: string
    nom: string
    ordre: number
    obligatoire: boolean
    parametres: any
  }>
  is_public: boolean
  created_by: string
  usage_count: number
}

export interface DashboardStats {
  entreprises_total: number
  liasses_ce_mois: number
  audits_en_cours: number
  revenue_mensuel: number
  croissance_mensuelle: number
  top_erreurs: Array<{
    type: string
    count: number
    pourcentage: number
  }>
  performance: {
    temps_moyen_generation: number
    taux_reussite: number
    satisfaction_client: number
  }
}

export interface AnalyticsData {
  periode: string
  metriques: {
    utilisateurs_actifs: number
    sessions_totales: number
    temps_moyen_session: number
    pages_vues: number
    taux_rebond: number
  }
  utilisation_modules: Array<{
    module: string
    nb_utilisations: number
    temps_total: number
  }>
  erreurs_frequentes: Array<{
    type: string
    message: string
    occurences: number
  }>
}

export interface ReportRequest {
  type_rapport: 'FINANCIAL' | 'TAX' | 'AUDIT' | 'COMPLIANCE' | 'DASHBOARD'
  entreprise_id?: string
  exercice_id?: string
  periode_debut: string
  periode_fin: string
  format: 'PDF' | 'EXCEL' | 'CSV' | 'JSON'
  template_id?: string
  parametres?: {
    inclure_details: boolean
    inclure_graphiques: boolean
    inclure_comparaisons: boolean
    niveau_detail: 'RESUME' | 'STANDARD' | 'DETAILLE'
    filtres_specifiques?: any
  }
}

class ReportingService {
  private baseUrl = '/api/v1/reporting'

  // Génération de rapports - CONNEXION RÉELLE AU BACKEND
  async generateReport(request: ReportRequest): Promise<Report> {
    console.log('📤 Starting report generation in backend...', request)
    return apiClient.post(`${this.baseUrl}/reports/`, request)
  }

  async getReports(params?: {
    type_rapport?: string
    entreprise?: string
    exercice?: string
    statut?: string
    periode_debut?: string
    periode_fin?: string
    page?: number
    page_size?: number
  }) {
    console.log('🔄 Fetching reports from backend...', params)
    return apiClient.get(`${this.baseUrl}/reports/`, params)
  }

  async getReport(id: string): Promise<Report> {
    console.log(`🔄 Fetching report ${id} from backend...`)
    return apiClient.get(`${this.baseUrl}/reports/${id}/`)
  }

  async getReportStatus(id: string): Promise<Report> {
    console.log(`🔄 Getting report status ${id} from backend...`)
    return apiClient.get(`${this.baseUrl}/reports/${id}/status/`)
  }

  async cancelReport(id: string): Promise<void> {
    console.log(`🛑 Cancelling report ${id} on backend...`)
    return apiClient.post(`${this.baseUrl}/reports/${id}/cancel/`)
  }

  async downloadReport(id: string): Promise<Blob> {
    console.log(`📥 Downloading report ${id} from backend...`)
    const response = await apiClient.client.get(`${this.baseUrl}/reports/${id}/download/`, {
      responseType: 'blob'
    })
    return response.data
  }

  // Templates de rapports - CONNEXION RÉELLE AU BACKEND
  async getReportTemplates(params?: {
    type_rapport?: string
    is_public?: boolean
    page?: number
  }) {
    console.log('🔄 Fetching report templates from backend...', params)
    return apiClient.get(`${this.baseUrl}/templates/`, params)
  }

  async getReportTemplate(id: string): Promise<ReportTemplate> {
    console.log(`🔄 Fetching report template ${id} from backend...`)
    return apiClient.get(`${this.baseUrl}/templates/${id}/`)
  }

  async createReportTemplate(template: Partial<ReportTemplate>): Promise<ReportTemplate> {
    console.log('📤 Creating report template in backend...', template)
    return apiClient.post(`${this.baseUrl}/templates/`, template)
  }

  async updateReportTemplate(id: string, template: Partial<ReportTemplate>): Promise<ReportTemplate> {
    console.log(`📤 Updating report template ${id} in backend...`)
    return apiClient.patch(`${this.baseUrl}/templates/${id}/`, template)
  }

  async deleteReportTemplate(id: string): Promise<void> {
    console.log(`🗑️ Deleting report template ${id} from backend...`)
    return apiClient.delete(`${this.baseUrl}/templates/${id}/`)
  }

  async duplicateReportTemplate(id: string, newName: string): Promise<ReportTemplate> {
    console.log(`📋 Duplicating report template ${id} as ${newName}...`)
    return apiClient.post(`${this.baseUrl}/templates/${id}/duplicate/`, { nom: newName })
  }

  // Dashboard et statistiques - CONNEXION RÉELLE AU BACKEND
  async getDashboardStats(params?: {
    periode?: string
    entreprise?: string
  }): Promise<DashboardStats> {
    console.log('📊 Getting dashboard stats from backend...', params)
    return apiClient.get(`${this.baseUrl}/reports/stats/`, params)
  }

  async getAnalytics(params?: {
    periode_debut?: string
    periode_fin?: string
    granularite?: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH'
  }): Promise<AnalyticsData> {
    console.log('📈 Getting analytics data from backend...', params)
    return apiClient.get(`${this.baseUrl}/analytics/`, params)
  }

  async getPerformanceMetrics(params?: {
    module?: string
    periode?: string
  }) {
    console.log('⚡ Getting performance metrics from backend...', params)
    return apiClient.get(`${this.baseUrl}/performance/`, params)
  }

  // Rapports prédéfinis - CONNEXION RÉELLE AU BACKEND
  async getFinancialReport(entreprise_id: string, exercice_id: string, options?: {
    inclure_comparaison: boolean
    format: 'PDF' | 'EXCEL'
  }) {
    console.log(`📊 Generating financial report for entreprise ${entreprise_id}...`)
    return apiClient.post(`${this.baseUrl}/predefined/financial/`, {
      entreprise_id,
      exercice_id,
      ...options
    })
  }

  async getTaxReport(entreprise_id: string, exercice_id: string, options?: {
    type_impot: string[]
    format: 'PDF' | 'EXCEL'
  }) {
    console.log(`🧾 Generating tax report for entreprise ${entreprise_id}...`)
    return apiClient.post(`${this.baseUrl}/predefined/tax/`, {
      entreprise_id,
      exercice_id,
      ...options
    })
  }

  async getAuditReport(audit_session_id: string, options?: {
    inclure_recommandations: boolean
    niveau_detail: 'RESUME' | 'DETAILLE'
    format: 'PDF' | 'EXCEL'
  }) {
    console.log(`🔍 Generating audit report for session ${audit_session_id}...`)
    return apiClient.post(`${this.baseUrl}/predefined/audit/`, {
      audit_session_id,
      ...options
    })
  }

  async getComplianceReport(entreprise_id: string, periode_debut: string, periode_fin: string) {
    console.log(`📋 Generating compliance report for entreprise ${entreprise_id}...`)
    return apiClient.post(`${this.baseUrl}/predefined/compliance/`, {
      entreprise_id,
      periode_debut,
      periode_fin
    })
  }

  // Export et partage - CONNEXION RÉELLE AU BACKEND
  async shareReport(id: string, options: {
    emails: string[]
    message?: string
    expiration_date?: string
    require_password: boolean
  }) {
    console.log(`📤 Sharing report ${id}...`)
    return apiClient.post(`${this.baseUrl}/reports/${id}/share/`, options)
  }

  async scheduleReport(template_id: string, schedule: {
    cron_expression: string
    destinataires: string[]
    parametres: any
  }) {
    console.log(`⏰ Scheduling report with template ${template_id}...`)
    return apiClient.post(`${this.baseUrl}/schedule/`, {
      template_id,
      ...schedule
    })
  }

  async getScheduledReports() {
    console.log('🔄 Fetching scheduled reports from backend...')
    return apiClient.get(`${this.baseUrl}/schedule/`)
  }

  async updateScheduledReport(id: string, schedule: Partial<any>) {
    console.log(`📤 Updating scheduled report ${id}...`)
    return apiClient.patch(`${this.baseUrl}/schedule/${id}/`, schedule)
  }

  async deleteScheduledReport(id: string): Promise<void> {
    console.log(`🗑️ Deleting scheduled report ${id}...`)
    return apiClient.delete(`${this.baseUrl}/schedule/${id}/`)
  }

  // Historique et comparaisons - CONNEXION RÉELLE AU BACKEND
  async getReportHistory(params?: {
    entreprise?: string
    type_rapport?: string
    limit?: number
  }) {
    console.log('🔄 Getting report history from backend...', params)
    return apiClient.get(`${this.baseUrl}/history/`, params)
  }

  async compareReports(report1_id: string, report2_id: string) {
    console.log(`📊 Comparing reports ${report1_id} and ${report2_id}...`)
    return apiClient.get(`${this.baseUrl}/compare/`, {
      report1: report1_id,
      report2: report2_id
    })
  }

  // Validation et qualité - CONNEXION RÉELLE AU BACKEND
  async validateReportData(data: any) {
    console.log('🔍 Validating report data on backend...')
    return apiClient.post(`${this.baseUrl}/validate/`, data)
  }

  async getDataQualityReport(entreprise_id: string, exercice_id: string) {
    console.log(`📊 Getting data quality report for entreprise ${entreprise_id}...`)
    return apiClient.get(`${this.baseUrl}/data-quality/`, {
      entreprise: entreprise_id,
      exercice: exercice_id
    })
  }

  // KPI Management - CONNEXION RÉELLE AU BACKEND
  async getKPIs(params?: { entreprise?: string; page?: number; page_size?: number }) {
    console.log('📊 Getting KPIs from backend...', params)
    return apiClient.get(`${this.baseUrl}/kpis/`, params)
  }

  async getKPIHistory(id: string, params?: { periode_debut?: string; periode_fin?: string }) {
    console.log(`📈 Getting KPI history for ${id}...`)
    return apiClient.get(`${this.baseUrl}/kpis/${id}/history/`, params)
  }

  async getKPIAlertes(params?: { entreprise?: string; active_only?: boolean }) {
    console.log('🚨 Getting KPI alerts from backend...', params)
    return apiClient.get(`${this.baseUrl}/kpi-alerts/`, params)
  }

  async createKPI(kpi: any) {
    console.log('📤 Creating KPI in backend...', kpi)
    return apiClient.post(`${this.baseUrl}/kpis/`, kpi)
  }

  async updateKPI(id: string, kpi: any) {
    console.log(`📤 Updating KPI ${id} in backend...`)
    return apiClient.patch(`${this.baseUrl}/kpis/${id}/`, kpi)
  }

  async deleteKPI(id: string) {
    console.log(`🗑️ Deleting KPI ${id} from backend...`)
    return apiClient.delete(`${this.baseUrl}/kpis/${id}/`)
  }

  async recalculateKPI(id: string) {
    console.log(`🔄 Recalculating KPI ${id}...`)
    return apiClient.post(`${this.baseUrl}/kpis/${id}/recalculate/`)
  }

  async resolveKPIAlerte(id: string) {
    console.log(`✅ Resolving KPI alert ${id}...`)
    return apiClient.patch(`${this.baseUrl}/kpi-alerts/${id}/`, { resolved: true })
  }

  // Method aliases for compatibility
  async getDashboardStatistics(params?: any) {
    return this.getDashboardStats(params)
  }

  async lancerExport(request: ReportRequest) {
    return this.generateReport(request)
  }

  async getExport(id: string) {
    return this.getReport(id)
  }
}

export const reportingService = new ReportingService()
export default reportingService