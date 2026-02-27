/**
 * Service pour la gestion des organisations (Multi-tenant SaaS)
 * CONNEXION RÉELLE AU BACKEND DJANGO
 */

import { apiClient } from './apiClient'

export interface Organization {
  id: string // UUID
  name: string
  slug: string

  // Informations légales
  legal_form: string
  rccm: string
  ifu: string

  // Localisation
  country: string
  city: string
  address: string

  // Activité
  sector: string
  annual_revenue_range: string

  // Abonnement
  subscription_plan: 'STARTER' | 'BUSINESS' | 'ENTERPRISE'
  subscription_status: 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'EXPIRED'
  trial_end_date?: string
  subscription_start_date?: string
  subscription_end_date?: string

  // Quotas
  liasses_quota: number
  liasses_used: number
  users_quota: number
  storage_quota_gb: number

  // Propriétaire et membres
  owner: number
  owner_detail?: {
    id: number
    email: string
    first_name: string
    last_name: string
  }

  // État
  is_active: boolean
  is_verified: boolean

  // Paramètres
  settings: Record<string, any>

  // Facturation
  billing_email: string
  stripe_customer_id: string
  stripe_subscription_id: string

  // Métadonnées
  created_at: string
  updated_at: string
}

export interface CreateOrganization {
  name: string
  legal_form?: string
  rccm?: string
  ifu?: string
  country?: string
  city?: string
  address?: string
  sector?: string
  annual_revenue_range?: string
  subscription_plan?: 'STARTER' | 'BUSINESS' | 'ENTERPRISE'
  billing_email?: string
}

export interface OrganizationStats {
  liasses: {
    quota: number
    used: number
    remaining: number | 'unlimited'
    percentage: number
  }
  members: {
    quota: number
    active: number
  }
  subscription: {
    plan: string
    status: string
    trial_end?: string
  }
}

export interface OrganizationFilters {
  search?: string
  subscription_plan?: 'STARTER' | 'BUSINESS' | 'ENTERPRISE'
  subscription_status?: 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'EXPIRED'
  is_active?: boolean
  page?: number
  page_size?: number
}

// ========================================
// TYPES POUR MEMBRES
// ========================================

export interface OrganizationMember {
  id: string
  organization: string
  organization_detail?: {
    name: string
    slug: string
  }
  user: {
    id: number
    email: string
    first_name: string
    last_name: string
  }
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'
  permissions: string[]
  is_active: boolean
  joined_at: string
  invited_by?: number
  invited_by_detail?: {
    id: number
    email: string
    first_name: string
    last_name: string
  }
  created_at: string
  updated_at: string
}

// ========================================
// TYPES POUR SUBSCRIPTIONS
// ========================================

export interface Subscription {
  id: string
  organization: string
  organization_detail?: {
    name: string
    slug: string
  }
  plan: 'STARTER' | 'BUSINESS' | 'ENTERPRISE'
  status: 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'EXPIRED'

  // Dates
  start_date: string
  end_date?: string
  trial_end_date?: string
  cancelled_at?: string

  // Quotas
  liasses_quota: number
  users_quota: number
  storage_quota_gb: number

  // Tarification
  price_monthly: number
  price_yearly?: number
  currency: string

  // Facturation externe (Stripe, PayPal, etc.)
  external_subscription_id?: string
  external_customer_id?: string
  payment_method?: string
  next_billing_date?: string

  // Métadonnées
  created_at: string
  updated_at: string
}

// ========================================
// TYPES POUR INVITATIONS
// ========================================

export interface Invitation {
  id: string
  organization: string
  organization_detail?: {
    name: string
    slug: string
  }
  email: string
  role: 'ADMIN' | 'MEMBER' | 'VIEWER'
  token: string
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED'

  // Metadata invitation
  invited_by: number
  invited_by_detail?: {
    id: number
    email: string
    first_name: string
    last_name: string
  }

  // Dates
  created_at: string
  expires_at: string
  accepted_at?: string
  cancelled_at?: string

  // Message personnalisé
  message?: string
}

class OrganizationService {
  private baseUrl = '/api/v1/organizations'

  /**
   * Récupérer la liste des organisations de l'utilisateur
   */
  async list(filters?: OrganizationFilters): Promise<{
    count: number
    next: string | null
    previous: string | null
    results: Organization[]
  }> {
    console.log('🔄 Fetching organizations from backend...', filters)
    return apiClient.get(this.baseUrl, filters)
  }

  /**
   * Récupérer toutes les organisations (sans pagination)
   */
  async getAll(): Promise<Organization[]> {
    console.log('🔄 Fetching all organizations from backend...')
    const data = await apiClient.get(this.baseUrl, { page_size: 100 })
    return data.results || []
  }

  /**
   * Récupérer une organisation par slug
   */
  async getBySlug(slug: string): Promise<Organization> {
    console.log(`🔄 Fetching organization ${slug} from backend...`)
    return apiClient.get(`${this.baseUrl}/${slug}/`)
  }

  /**
   * Créer une nouvelle organisation
   */
  async create(data: CreateOrganization): Promise<Organization> {
    console.log('📤 Creating organization in backend...', data)
    return apiClient.post(this.baseUrl, data)
  }

  /**
   * Mettre à jour une organisation
   */
  async update(slug: string, data: Partial<CreateOrganization>): Promise<Organization> {
    console.log(`📤 Updating organization ${slug} in backend...`, data)
    return apiClient.patch(`${this.baseUrl}/${slug}/`, data)
  }

  /**
   * Supprimer une organisation
   */
  async delete(slug: string): Promise<void> {
    console.log(`🗑️ Deleting organization ${slug} from backend...`)
    return apiClient.delete(`${this.baseUrl}/${slug}/`)
  }

  /**
   * Incrémenter le compteur de liasses utilisées
   */
  async incrementLiasse(slug: string): Promise<Organization> {
    console.log(`📈 Incrementing liasse count for organization ${slug}...`)
    return apiClient.post(`${this.baseUrl}/${slug}/increment_liasse/`)
  }

  /**
   * Réinitialiser le quota annuel
   */
  async resetQuota(slug: string): Promise<{ message: string; liasses_used: number }> {
    console.log(`🔄 Resetting quota for organization ${slug}...`)
    return apiClient.post(`${this.baseUrl}/${slug}/reset_quota/`)
  }

  /**
   * Récupérer les statistiques de l'organisation
   */
  async getStats(slug: string): Promise<OrganizationStats> {
    console.log(`📊 Fetching stats for organization ${slug}...`)
    return apiClient.get(`${this.baseUrl}/${slug}/stats/`)
  }

  /**
   * Vérifier si une organisation peut créer une nouvelle liasse
   */
  async canCreateLiasse(slug: string): Promise<boolean> {
    try {
      const stats = await this.getStats(slug)

      // Entreprise plan = unlimited
      if (stats.liasses.remaining === 'unlimited') {
        return true
      }

      // Vérifier le quota
      return stats.liasses.used < stats.liasses.quota
    } catch (error) {
      console.error('Error checking liasse quota:', error)
      return false
    }
  }

  /**
   * Récupérer l'organisation actuelle de l'utilisateur
   * (Utilise le store si disponible, sinon récupère la première)
   */
  async getCurrent(): Promise<Organization | null> {
    console.log('🔄 Fetching current organization...')
    try {
      const orgs = await this.getAll()
      return orgs.length > 0 ? orgs[0] : null
    } catch (error) {
      console.error('Error fetching current organization:', error)
      return null
    }
  }

  /**
   * Vérifier si l'utilisateur est owner d'une organisation
   */
  async isOwner(slug: string, userId: number): Promise<boolean> {
    try {
      const org = await this.getBySlug(slug)
      return org.owner === userId
    } catch (error) {
      console.error('Error checking ownership:', error)
      return false
    }
  }

  /**
   * Obtenir le plan d'abonnement formaté
   */
  getSubscriptionPlanLabel(plan: Organization['subscription_plan']): string {
    const labels = {
      'STARTER': 'Starter - 2 liasses gratuites',
      'BUSINESS': 'Business - Jusqu\'à 12 liasses/an',
      'ENTERPRISE': 'Enterprise - Liasses illimitées'
    }
    return labels[plan] || plan
  }

  /**
   * Obtenir le statut d'abonnement formaté
   */
  getSubscriptionStatusLabel(status: Organization['subscription_status']): string {
    const labels = {
      'TRIAL': 'Période d\'essai',
      'ACTIVE': 'Actif',
      'SUSPENDED': 'Suspendu',
      'CANCELLED': 'Annulé',
      'EXPIRED': 'Expiré'
    }
    return labels[status] || status
  }

  /**
   * Obtenir la couleur associée au plan
   */
  getSubscriptionPlanColor(plan: Organization['subscription_plan']): string {
    const colors = {
      'STARTER': '#28a745',
      'BUSINESS': '#007bff',
      'ENTERPRISE': '#6f42c1'
    }
    return colors[plan] || '#6c757d'
  }

  /**
   * Obtenir la couleur associée au statut
   */
  getSubscriptionStatusColor(status: Organization['subscription_status']): string {
    const colors = {
      'TRIAL': '#ffc107',
      'ACTIVE': '#28a745',
      'SUSPENDED': '#fd7e14',
      'CANCELLED': '#dc3545',
      'EXPIRED': '#6c757d'
    }
    return colors[status] || '#6c757d'
  }

  /**
   * Vérifier si l'organisation est en période d'essai
   */
  isInTrial(org: Organization): boolean {
    if (org.subscription_status !== 'TRIAL') {
      return false
    }

    if (!org.trial_end_date) {
      return false
    }

    const trialEnd = new Date(org.trial_end_date)
    const now = new Date()

    return now < trialEnd
  }

  /**
   * Calculer les jours restants de la période d'essai
   */
  getRemainingTrialDays(org: Organization): number | null {
    if (!this.isInTrial(org) || !org.trial_end_date) {
      return null
    }

    const trialEnd = new Date(org.trial_end_date)
    const now = new Date()

    const diffTime = trialEnd.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return Math.max(0, diffDays)
  }

  /**
   * Calculer le pourcentage d'utilisation du quota de liasses
   */
  getQuotaPercentage(org: Organization): number {
    if (org.subscription_plan === 'ENTERPRISE') {
      return 0 // Unlimited
    }

    if (org.liasses_quota === 0) {
      return 100
    }

    return Math.round((org.liasses_used / org.liasses_quota) * 100)
  }

  // ========================================
  // MEMBRES D'ORGANISATION (NOUVEAU!)
  // ========================================

  /**
   * Récupérer la liste des membres d'une organisation
   */
  async getMembers(organizationSlug?: string): Promise<OrganizationMember[]> {
    console.log('🔄 Fetching organization members from backend...', organizationSlug)
    const params = organizationSlug ? { organization: organizationSlug } : undefined
    const data = await apiClient.get('/api/v1/members/', params)
    return data.results || []
  }

  /**
   * Récupérer un membre spécifique
   */
  async getMember(id: string): Promise<OrganizationMember> {
    console.log(`🔄 Fetching member ${id} from backend...`)
    return apiClient.get(`/api/v1/members/${id}/`)
  }

  /**
   * Ajouter un membre à une organisation
   */
  async addMember(data: {
    organization: string
    user_email: string
    role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'
  }): Promise<OrganizationMember> {
    console.log('📤 Adding member to organization...', data)
    return apiClient.post('/api/v1/members/', data)
  }

  /**
   * Mettre à jour le rôle d'un membre
   */
  async updateMemberRole(id: string, role: string): Promise<OrganizationMember> {
    console.log(`📤 Updating member ${id} role to ${role}...`)
    return apiClient.patch(`/api/v1/members/${id}/`, { role })
  }

  /**
   * Retirer un membre d'une organisation
   */
  async removeMember(id: string): Promise<void> {
    console.log(`🗑️ Removing member ${id} from organization...`)
    return apiClient.delete(`/api/v1/members/${id}/`)
  }

  /**
   * Obtenir le label d'un rôle
   */
  getMemberRoleLabel(role: OrganizationMember['role']): string {
    const labels = {
      'OWNER': 'Propriétaire',
      'ADMIN': 'Administrateur',
      'MEMBER': 'Membre',
      'VIEWER': 'Observateur'
    }
    return labels[role] || role
  }

  /**
   * Obtenir la couleur d'un rôle
   */
  getMemberRoleColor(role: OrganizationMember['role']): string {
    const colors = {
      'OWNER': '#6f42c1',
      'ADMIN': '#007bff',
      'MEMBER': '#28a745',
      'VIEWER': '#6c757d'
    }
    return colors[role] || '#6c757d'
  }

  // ========================================
  // SUBSCRIPTIONS (NOUVEAU!)
  // ========================================

  /**
   * Récupérer la liste des subscriptions
   */
  async getSubscriptions(organizationSlug?: string): Promise<Subscription[]> {
    console.log('🔄 Fetching subscriptions from backend...', organizationSlug)
    const params = organizationSlug ? { organization: organizationSlug } : undefined
    const data = await apiClient.get('/api/v1/subscriptions/', params)
    return data.results || []
  }

  /**
   * Récupérer une subscription spécifique
   */
  async getSubscription(id: string): Promise<Subscription> {
    console.log(`🔄 Fetching subscription ${id} from backend...`)
    return apiClient.get(`/api/v1/subscriptions/${id}/`)
  }

  /**
   * Récupérer la subscription active d'une organisation
   */
  async getCurrentSubscription(organizationSlug: string): Promise<Subscription | null> {
    console.log(`🔄 Fetching current subscription for organization ${organizationSlug}...`)
    const data = await apiClient.get('/api/v1/subscriptions/', {
      organization: organizationSlug,
      status: 'ACTIVE'
    })
    const subscriptions = data.results || []
    return subscriptions.length > 0 ? subscriptions[0] : null
  }

  /**
   * Créer une nouvelle subscription
   */
  async createSubscription(data: {
    organization: string
    plan: 'STARTER' | 'BUSINESS' | 'ENTERPRISE'
  }): Promise<Subscription> {
    console.log('📤 Creating subscription...', data)
    return apiClient.post('/api/v1/subscriptions/', data)
  }

  /**
   * Mettre à niveau une subscription
   */
  async upgradeSubscription(subscriptionId: string, newPlan: string): Promise<Subscription> {
    console.log(`⬆️ Upgrading subscription ${subscriptionId} to ${newPlan}...`)
    return apiClient.patch(`/api/v1/subscriptions/${subscriptionId}/`, {
      plan: newPlan
    })
  }

  /**
   * Annuler une subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<Subscription> {
    console.log(`❌ Cancelling subscription ${subscriptionId}...`)
    return apiClient.patch(`/api/v1/subscriptions/${subscriptionId}/`, {
      status: 'CANCELLED'
    })
  }

  /**
   * Réactiver une subscription
   */
  async reactivateSubscription(subscriptionId: string): Promise<Subscription> {
    console.log(`✅ Reactivating subscription ${subscriptionId}...`)
    return apiClient.patch(`/api/v1/subscriptions/${subscriptionId}/`, {
      status: 'ACTIVE'
    })
  }

  // ========================================
  // INVITATIONS (NOUVEAU!)
  // ========================================

  /**
   * Récupérer la liste des invitations
   */
  async getInvitations(organizationSlug?: string): Promise<Invitation[]> {
    console.log('🔄 Fetching invitations from backend...', organizationSlug)
    const params = organizationSlug ? { organization: organizationSlug } : undefined
    const data = await apiClient.get('/api/v1/invitations/', params)
    return data.results || []
  }

  /**
   * Récupérer une invitation spécifique
   */
  async getInvitation(id: string): Promise<Invitation> {
    console.log(`🔄 Fetching invitation ${id} from backend...`)
    return apiClient.get(`/api/v1/invitations/${id}/`)
  }

  /**
   * Envoyer une invitation
   */
  async sendInvitation(data: {
    organization: string
    email: string
    role: 'ADMIN' | 'MEMBER' | 'VIEWER'
  }): Promise<Invitation> {
    console.log('📤 Sending invitation...', data)
    return apiClient.post('/api/v1/invitations/', data)
  }

  /**
   * Renvoyer une invitation
   */
  async resendInvitation(id: string): Promise<Invitation> {
    console.log(`📤 Resending invitation ${id}...`)
    return apiClient.post(`/api/v1/invitations/${id}/resend/`)
  }

  /**
   * Annuler une invitation
   */
  async cancelInvitation(id: string): Promise<void> {
    console.log(`❌ Cancelling invitation ${id}...`)
    return apiClient.delete(`/api/v1/invitations/${id}/`)
  }

  /**
   * Accepter une invitation
   */
  async acceptInvitation(token: string): Promise<{ message: string; organization: Organization }> {
    console.log('✅ Accepting invitation...')
    return apiClient.post('/api/v1/invitations/accept/', { token })
  }

  /**
   * Récupérer les invitations en attente
   */
  async getPendingInvitations(): Promise<Invitation[]> {
    console.log('🔄 Fetching pending invitations...')
    const data = await apiClient.get('/api/v1/invitations/', {
      status: 'PENDING'
    })
    return data.results || []
  }

  /**
   * Obtenir le label d'un statut d'invitation
   */
  getInvitationStatusLabel(status: Invitation['status']): string {
    const labels = {
      'PENDING': 'En attente',
      'ACCEPTED': 'Acceptée',
      'EXPIRED': 'Expirée',
      'CANCELLED': 'Annulée'
    }
    return labels[status] || status
  }

  /**
   * Obtenir la couleur d'un statut d'invitation
   */
  getInvitationStatusColor(status: Invitation['status']): string {
    const colors = {
      'PENDING': '#ffc107',
      'ACCEPTED': '#28a745',
      'EXPIRED': '#6c757d',
      'CANCELLED': '#dc3545'
    }
    return colors[status] || '#6c757d'
  }
}

export default new OrganizationService()
