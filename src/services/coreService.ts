/**
 * Service pour les fonctionnalités core (paramètres système, pays, devises, etc.)
 * CONNEXION RÉELLE AU BACKEND DJANGO
 */

import { apiClient } from './apiClient'

// ===== PARAMETRES SYSTEME =====

export interface ParametreSysteme {
  id: number
  cle: string
  valeur: any
  type_valeur: 'STRING' | 'INTEGER' | 'FLOAT' | 'BOOLEAN' | 'JSON'
  description: string
  categorie: string
  modifiable: boolean
  created_at: string
  updated_at: string
}

// ===== PAYS =====

export interface Pays {
  id: number
  code_iso: string
  nom: string
  nom_officiel: string
  capitale: string
  continent: string
  fuseau_horaire: string
  indicatif_telephonique: string
  monnaie_principale: number
  is_actif: boolean
  created_at: string
  updated_at: string
}

// ===== DEVISES =====

export interface DeviseMonnaie {
  id: number
  code: string
  nom: string
  symbole: string
  pays: number
  taux_change_euro?: number
  is_principale: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

// ===== TAUX DE CHANGE =====

export interface TauxChange {
  id: number
  devise_source: number
  devise_cible: number
  taux: number
  date_application: string
  source_info: string
  is_actif: boolean
  created_at: string
  updated_at: string
}

// ===== AUDIT TRAIL =====

export interface AuditTrailEntry {
  id: number
  user: number
  user_detail?: {
    email: string
    first_name: string
    last_name: string
  }
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT'
  model: string
  object_id: string
  object_repr: string
  changes: Record<string, any>
  ip_address: string
  user_agent: string
  timestamp: string
  correlation_id?: string
}

// ===== NOTIFICATIONS =====

export interface Notification {
  id: number
  user: number
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS'
  titre: string
  message: string
  lien?: string
  est_lue: boolean
  date_lecture?: string
  created_at: string
}

class CoreService {
  private baseUrl = '/api/v1/core'

  // ===== PARAMETRES SYSTEME =====

  async getParametres(categorie?: string): Promise<ParametreSysteme[]> {
    const params = categorie ? { categorie } : undefined
    const data = await apiClient.get(`${this.baseUrl}/parametres-systeme`, params)
    return data.results || []
  }

  async getParametre(id: number): Promise<ParametreSysteme> {
    return apiClient.get(`${this.baseUrl}/parametres-systeme/${id}/`)
  }

  async updateParametre(id: number, valeur: any): Promise<ParametreSysteme> {
    return apiClient.patch(`${this.baseUrl}/parametres-systeme/${id}/`, { valeur })
  }

  // ===== PAYS =====

  async getPays(): Promise<Pays[]> {
    const data = await apiClient.get(`${this.baseUrl}/pays`, { page_size: 1000 })
    return data.results || []
  }

  async getPaysById(id: number): Promise<Pays> {
    return apiClient.get(`${this.baseUrl}/pays/${id}/`)
  }

  async getPaysActifs(): Promise<Pays[]> {
    const data = await apiClient.get(`${this.baseUrl}/pays`, { is_actif: true, page_size: 1000 })
    return data.results || []
  }

  // ===== DEVISES =====

  async getDevises(): Promise<DeviseMonnaie[]> {
    const data = await apiClient.get(`${this.baseUrl}/devises`, { page_size: 1000 })
    return data.results || []
  }

  async getDeviseById(id: number): Promise<DeviseMonnaie> {
    return apiClient.get(`${this.baseUrl}/devises/${id}/`)
  }

  async getDevisesActives(): Promise<DeviseMonnaie[]> {
    const data = await apiClient.get(`${this.baseUrl}/devises`, { is_active: true, page_size: 1000 })
    return data.results || []
  }

  async getDevisePrincipale(): Promise<DeviseMonnaie | null> {
    const data = await apiClient.get(`${this.baseUrl}/devises`, { is_principale: true })
    const devises = data.results || []
    return devises.length > 0 ? devises[0] : null
  }

  // ===== TAUX DE CHANGE =====

  async getTauxChange(filters?: {
    devise_source?: number
    devise_cible?: number
    date_application?: string
  }): Promise<TauxChange[]> {
    const data = await apiClient.get(`${this.baseUrl}/taux-change`, filters)
    return data.results || []
  }

  async getTauxChangeById(id: number): Promise<TauxChange> {
    return apiClient.get(`${this.baseUrl}/taux-change/${id}/`)
  }

  async createTauxChange(data: {
    devise_source: number
    devise_cible: number
    taux: number
    date_application: string
    source_info?: string
  }): Promise<TauxChange> {
    return apiClient.post(`${this.baseUrl}/taux-change`, data)
  }

  async getTauxActuel(deviseSourceId: number, deviseCibleId: number): Promise<number | null> {
    const data = await apiClient.get(`${this.baseUrl}/taux-change`, {
      devise_source: deviseSourceId,
      devise_cible: deviseCibleId,
      is_actif: true,
      ordering: '-date_application'
    })
    const taux = data.results || []
    return taux.length > 0 ? taux[0].taux : null
  }

  // ===== AUDIT TRAIL =====

  async getAuditTrail(filters?: {
    user?: number
    action?: string
    model?: string
    date_min?: string
    date_max?: string
    page?: number
    page_size?: number
  }): Promise<{ count: number; results: AuditTrailEntry[] }> {
    return apiClient.get(`${this.baseUrl}/audit-trail`, filters)
  }

  async getAuditTrailById(id: number): Promise<AuditTrailEntry> {
    return apiClient.get(`${this.baseUrl}/audit-trail/${id}/`)
  }

  async getAuditTrailForObject(model: string, objectId: string): Promise<AuditTrailEntry[]> {
    const data = await apiClient.get(`${this.baseUrl}/audit-trail`, {
      model,
      object_id: objectId,
      page_size: 1000
    })
    return data.results || []
  }

  // ===== NOTIFICATIONS =====

  async getNotifications(filters?: {
    est_lue?: boolean
    type?: string
    page?: number
    page_size?: number
  }): Promise<{ count: number; results: Notification[] }> {
    return apiClient.get(`${this.baseUrl}/notifications`, filters)
  }

  async getNotificationById(id: number): Promise<Notification> {
    return apiClient.get(`${this.baseUrl}/notifications/${id}/`)
  }

  async marquerCommeLue(id: number): Promise<Notification> {
    return apiClient.patch(`${this.baseUrl}/notifications/${id}/`, {
      est_lue: true,
      date_lecture: new Date().toISOString()
    })
  }

  async marquerToutesCommeLues(): Promise<void> {
    return apiClient.post(`${this.baseUrl}/notifications/mark_all_read/`)
  }

  async getNotificationsNonLues(): Promise<Notification[]> {
    const data = await apiClient.get(`${this.baseUrl}/notifications`, {
      est_lue: false,
      page_size: 100
    })
    return data.results || []
  }

  async deleteNotification(id: number): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/notifications/${id}/`)
  }

  // ===== HELPERS =====

  getActionLabel(action: AuditTrailEntry['action']): string {
    const labels = {
      'CREATE': 'Création',
      'UPDATE': 'Modification',
      'DELETE': 'Suppression',
      'VIEW': 'Consultation',
      'EXPORT': 'Export'
    }
    return labels[action] || action
  }

  getNotificationTypeColor(type: Notification['type']): string {
    const colors = {
      'INFO': '#2196f3',
      'WARNING': '#ff9800',
      'ERROR': '#f44336',
      'SUCCESS': '#4caf50'
    }
    return colors[type] || '#9e9e9e'
  }

  formatMontantDevise(montant: number, devise: DeviseMonnaie): string {
    return `${montant.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${devise.symbole}`
  }

  async convertirMontant(montant: number, deviseSourceId: number, deviseCibleId: number): Promise<number | null> {
    const taux = await this.getTauxActuel(deviseSourceId, deviseCibleId)
    return taux ? montant * taux : null
  }
}

export default new CoreService()
