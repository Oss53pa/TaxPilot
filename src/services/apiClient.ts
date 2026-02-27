/**
 * Client API local pour FiscaSync-Lite
 * Remplacement drop-in de l'ancien apiClient.ts basé sur Axios
 * Toutes les données sont stockées dans localStorage via localDatabase
 */

import { localDb } from './localDatabase'

// ============================
// Types (identiques à l'original)
// ============================

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  name?: string
  is_staff: boolean
  is_superuser: boolean
  entreprise_courante?: {
    id: number
    raison_sociale: string
  }
  role?: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    access: string
    refresh: string
    user: User
  }
}

export interface SignupData {
  name: string
  legal_form: string
  rccm?: string
  ifu?: string
  country: string
  city?: string
  address?: string
  sector: string
  annual_revenue_range?: string
  billing_email?: string
  user_first_name: string
  user_last_name: string
  user_email: string
  user_password: string
  user_fonction?: string
  user_telephone?: string
}

export interface Organization {
  id: string
  name: string
  slug: string
  legal_form: string
  rccm: string
  ifu: string
  country: string
  city: string
  sector: string
  subscription_plan: string
  subscription_status: string
  liasses_quota: number
  liasses_used: number
  quota_percentage: number
  has_quota_remaining: boolean
  trial_end_date?: string
}

export interface SignupResponse {
  message: string
  organization: Organization
  user: {
    id: number
    email: string
    first_name: string
    last_name: string
  }
  tokens: {
    access: string
    refresh: string
  }
  onboarding: {
    plan: string
    liasses_remaining: number
    trial_end: string | null
  }
}

// Clés de stockage
const TOKEN_KEY = 'fiscasync_access_token'
const USER_KEY = 'fiscasync_user'

// ============================
// Mapping URL → Collection localStorage
// ============================

interface RouteMapping {
  collection: string
}

function resolveRoute(url: string): { mapping: RouteMapping; id?: string; action?: string; subId?: string } {
  const cleanUrl = url.replace(/\/+$/, '').replace(/^\/+/, '')

  const routes: Array<{ pattern: RegExp; collection: string }> = [
    // Auth
    { pattern: /^api\/v1\/auth\/login/, collection: '_auth_login' },
    { pattern: /^api\/v1\/auth\/signup/, collection: '_auth_signup' },
    { pattern: /^api\/v1\/auth\/refresh/, collection: '_auth_refresh' },
    { pattern: /^api\/v1\/core\/auth\/me/, collection: '_auth_me' },
    { pattern: /^api\/v1\/core\/health/, collection: '_health' },

    // Balance
    { pattern: /^api\/v1\/balance\/balances/, collection: 'balances' },
    { pattern: /^api\/v1\/balance\/imports/, collection: 'balance_imports' },
    { pattern: /^api\/v1\/balance\/validations/, collection: 'balance_validations' },
    { pattern: /^api\/v1\/balance\/export-balance/, collection: 'balance_exports' },
    { pattern: /^api\/v1\/balance\/mapping-intelligent/, collection: 'balance_mappings_ai' },
    { pattern: /^api\/v1\/balance\/plans-comptables/, collection: 'plans_comptables_balance' },
    { pattern: /^api\/v1\/balance\/comptes/, collection: 'comptes_balance' },
    { pattern: /^api\/v1\/balance\/mappings/, collection: 'balance_mappings' },
    { pattern: /^api\/v1\/balance/, collection: 'balance_general' },

    // Parametrage
    { pattern: /^api\/v1\/parametrage\/entreprises/, collection: 'entreprises' },
    { pattern: /^api\/v1\/parametrage\/types-liasse/, collection: 'types_liasse' },
    { pattern: /^api\/v1\/parametrage\/exercices/, collection: 'exercices' },
    { pattern: /^api\/v1\/parametrage\/regional-settings/, collection: 'regional_settings' },
    { pattern: /^api\/v1\/parametrage\/themes/, collection: 'themes' },
    { pattern: /^api\/v1\/parametrage\/backup-configs/, collection: 'backup_configs' },
    { pattern: /^api\/v1\/parametrage\/backup-history/, collection: 'backup_history' },
    { pattern: /^api\/v1\/parametrage\/restore-operations/, collection: 'restore_operations' },

    // Generation v1
    { pattern: /^api\/v1\/generation\/liasses/, collection: 'generation_liasses' },
    { pattern: /^api\/v1\/generation\/templates/, collection: 'generation_templates' },
    { pattern: /^api\/v1\/generation\/stats/, collection: 'generation_stats' },
    { pattern: /^api\/v1\/generation\/history/, collection: 'generation_history' },
    { pattern: /^api\/v1\/generation\/compare/, collection: 'generation_compare' },
    { pattern: /^api\/v1\/generation\/preview/, collection: 'generation_preview' },
    { pattern: /^api\/v1\/generation\/batch/, collection: 'generation_batch' },

    // Generation legacy (liasseService uses /api/generation/ without v1)
    { pattern: /^api\/generation\/liasses/, collection: 'liasses' },
    { pattern: /^api\/generation\/etats/, collection: 'etats_financiers' },
    { pattern: /^api\/generation\/configurations/, collection: 'liasse_configurations' },

    // Audit
    { pattern: /^api\/v1\/audit\/sessions/, collection: 'audit_sessions' },
    { pattern: /^api\/v1\/audit\/anomalies/, collection: 'audit_anomalies' },
    { pattern: /^api\/v1\/audit\/rules/, collection: 'audit_rules' },
    { pattern: /^api\/v1\/audit\/validate/, collection: 'audit_validate' },
    { pattern: /^api\/v1\/audit\/stats/, collection: 'audit_stats' },
    { pattern: /^api\/v1\/audit\/trends/, collection: 'audit_trends' },
    { pattern: /^api\/v1\/audit\/history/, collection: 'audit_history' },
    { pattern: /^api\/v1\/audit\/compare/, collection: 'audit_compare' },
    { pattern: /^api\/v1\/audit\/ai-analyze/, collection: 'audit_ai' },

    // Reporting
    { pattern: /^api\/v1\/reporting\/reports/, collection: 'reports' },
    { pattern: /^api\/v1\/reporting\/templates/, collection: 'report_templates' },
    { pattern: /^api\/v1\/reporting\/analytics/, collection: 'analytics' },
    { pattern: /^api\/v1\/reporting\/performance/, collection: 'performance' },
    { pattern: /^api\/v1\/reporting\/predefined/, collection: 'predefined_reports' },
    { pattern: /^api\/v1\/reporting\/schedule/, collection: 'report_schedules' },
    { pattern: /^api\/v1\/reporting\/history/, collection: 'report_history' },
    { pattern: /^api\/v1\/reporting\/compare/, collection: 'report_compare' },
    { pattern: /^api\/v1\/reporting\/validate/, collection: 'report_validate' },
    { pattern: /^api\/v1\/reporting\/data-quality/, collection: 'data_quality' },
    { pattern: /^api\/v1\/reporting\/kpis/, collection: 'kpis' },
    { pattern: /^api\/v1\/reporting\/kpi-alerts/, collection: 'kpi_alerts' },

    // Accounting
    { pattern: /^api\/v1\/accounting\/plans-reference/, collection: 'plans_reference' },
    { pattern: /^api\/v1\/accounting\/comptes-reference/, collection: 'comptes_reference' },
    { pattern: /^api\/v1\/accounting\/correspondances/, collection: 'correspondances' },
    { pattern: /^api\/v1\/accounting\/plans/, collection: 'plans_comptables' },
    { pattern: /^api\/v1\/accounting\/comptes/, collection: 'comptes_comptables' },
    { pattern: /^api\/v1\/accounting\/ecritures/, collection: 'ecritures' },
    { pattern: /^api\/v1\/accounting\/journaux/, collection: 'journaux' },
    { pattern: /^api\/v1\/accounting\/balance/, collection: 'accounting_balance' },
    { pattern: /^api\/v1\/accounting\/grand-livre/, collection: 'grand_livre' },
    { pattern: /^api\/v1\/accounting\/journal-general/, collection: 'journal_general' },
    { pattern: /^api\/v1\/accounting\/balance-auxiliaire/, collection: 'balance_auxiliaire' },
    { pattern: /^api\/v1\/accounting\/import/, collection: 'accounting_imports' },
    { pattern: /^api\/v1\/accounting\/export/, collection: 'accounting_exports' },
    { pattern: /^api\/v1\/accounting\/validate/, collection: 'accounting_validate' },
    { pattern: /^api\/v1\/accounting\/anomalies/, collection: 'accounting_anomalies' },
    { pattern: /^api\/v1\/accounting\/cloture/, collection: 'accounting_cloture' },
    { pattern: /^api\/v1\/accounting\/validation_plan_comptable/, collection: 'accounting_validate_plan' },
    { pattern: /^api\/v1\/accounting\/mapping_automatique/, collection: 'accounting_mapping' },
    { pattern: /^api\/v1\/accounting\/determiner_type_liasse/, collection: 'accounting_type_liasse' },

    // Templates
    { pattern: /^api\/v1\/templates\/generate/, collection: 'template_instances' },
    { pattern: /^api\/v1\/templates\/instances/, collection: 'template_instances' },
    { pattern: /^api\/v1\/templates\/categories/, collection: 'template_categories' },
    { pattern: /^api\/v1\/templates\/tags/, collection: 'template_tags' },
    { pattern: /^api\/v1\/templates\/by-tag/, collection: 'templates' },
    { pattern: /^api\/v1\/templates\/libraries/, collection: 'template_libraries' },
    { pattern: /^api\/v1\/templates\/popular/, collection: 'templates' },
    { pattern: /^api\/v1\/templates\/analytics/, collection: 'template_analytics' },
    { pattern: /^api\/v1\/templates\/import/, collection: 'templates' },
    { pattern: /^api\/v1\/templates\/batch-import/, collection: 'templates' },
    { pattern: /^api\/v1\/templates\/upload/, collection: 'templates' },
    { pattern: /^api\/v1\/templates/, collection: 'templates' },

    // Tax
    { pattern: /^api\/v1\/tax\/impots/, collection: 'impots' },
    { pattern: /^api\/v1\/tax\/calcul/, collection: 'tax_calculs' },
    { pattern: /^api\/v1\/tax\/simulation/, collection: 'tax_simulations' },
    { pattern: /^api\/v1\/tax\/declarations/, collection: 'declarations_fiscales' },
    { pattern: /^api\/v1\/tax\/regimes/, collection: 'regimes_fiscaux' },
    { pattern: /^api\/v1\/tax\/obligations/, collection: 'obligations_fiscales' },
    { pattern: /^api\/v1\/tax\/abattements/, collection: 'abattements' },
    { pattern: /^api\/v1\/tax\/analyse/, collection: 'tax_analyses' },
    { pattern: /^api\/v1\/tax\/optimization/, collection: 'tax_optimization' },
    { pattern: /^api\/v1\/tax\/import/, collection: 'tax_imports' },
    { pattern: /^api\/v1\/tax\/export/, collection: 'tax_exports' },
    { pattern: /^api\/v1\/tax\/authorities/, collection: 'tax_authorities' },
    { pattern: /^api\/v1\/tax\/stats/, collection: 'tax_stats' },
    { pattern: /^api\/v1\/tax\/trends/, collection: 'tax_trends' },
    { pattern: /^api\/v1\/tax\/benchmark/, collection: 'tax_benchmark' },

    // Core
    { pattern: /^api\/v1\/core\/parametres-systeme/, collection: 'parametres_systeme' },
    { pattern: /^api\/v1\/core\/pays/, collection: 'pays' },
    { pattern: /^api\/v1\/core\/devises/, collection: 'devises' },
    { pattern: /^api\/v1\/core\/taux-change/, collection: 'taux_change' },
    { pattern: /^api\/v1\/core\/audit-trail/, collection: 'audit_trail' },
    { pattern: /^api\/v1\/core\/notifications/, collection: 'notifications' },

    // Organization
    { pattern: /^api\/v1\/organizations/, collection: 'organizations' },
    { pattern: /^api\/v1\/members/, collection: 'members' },
    { pattern: /^api\/v1\/subscriptions/, collection: 'subscriptions' },
    { pattern: /^api\/v1\/invitations/, collection: 'invitations' },
  ]

  let id: string | undefined
  let action: string | undefined
  let subId: string | undefined

  for (const route of routes) {
    if (route.pattern.test(cleanUrl)) {
      const matchStr = cleanUrl.match(route.pattern)?.[0] || ''
      const remaining = cleanUrl.slice(matchStr.length).replace(/^\/+/, '').replace(/\/+$/, '')

      if (remaining) {
        const parts = remaining.split('/')
        if (parts[0] && /^\d+$/.test(parts[0])) {
          id = parts[0]
          if (parts[1]) {
            if (parts[2] && /^\d+$/.test(parts[2])) {
              action = parts[1]
              subId = parts[2]
            } else {
              action = parts[1]
            }
          }
        } else if (parts[0]) {
          action = parts[0]
          if (parts[1] && /^\d+$/.test(parts[1])) {
            id = parts[1]
          }
        }
      }

      return { mapping: { collection: route.collection }, id, action, subId }
    }
  }

  const segments = cleanUrl.split('/')
  const fallbackCollection = segments.slice(-2, -1)[0] || segments.slice(-1)[0] || 'unknown'
  return { mapping: { collection: fallbackCollection }, id, action }
}

// ============================
// Gestionnaires d'actions spéciales
// ============================

function handleSpecialAction(collection: string, id: string | undefined, action: string, data?: any): any {
  switch (action) {
    case 'validate':
    case 'valider':
    case 'validate_complete':
      if (id) return localDb.update(collection, id, { statut: 'valide', validated_at: new Date().toISOString() })
      return { success: true, message: 'Validation effectuee' }

    case 'cancel':
    case 'annuler_validation':
      if (id) return localDb.update(collection, id, { statut: 'annule', cancelled_at: new Date().toISOString() })
      return { success: true }

    case 'stats':
    case 'dashboard_stats':
    case 'backup_stats': {
      const items = localDb.getAll(collection)
      return {
        total: items.length,
        actifs: items.filter((i: any) => i.statut === 'actif' || i.status === 'active').length,
        en_cours: items.filter((i: any) => i.statut === 'en_cours' || i.status === 'in_progress').length,
        termines: items.filter((i: any) => i.statut === 'termine' || i.status === 'completed').length,
        entreprises_total: localDb.getAll('entreprises').length,
        liasses_ce_mois: localDb.getAll('liasses').length,
        audits_en_cours: localDb.getAll('audit_sessions').length,
        revenue_mensuel: 0,
        croissance_mensuelle: 0,
        top_erreurs: [],
        performance: { temps_moyen_generation: 0, taux_reussite: 100, satisfaction_client: 0 },
      }
    }

    case 'status':
    case 'statut_production':
      if (id) return localDb.getById(collection, id) || { status: 'completed', progress: 100 }
      return { status: 'ok' }

    case 'lignes': {
      const lignes = localDb.getAll<any>('lignes_balance').filter((l: any) => String(l.balance_id) === String(id))
      return { count: lignes.length, results: lignes, next: null, previous: null }
    }

    case 'anomalies': {
      const anomalies = localDb.getAll<any>('audit_anomalies').filter((a: any) => String(a.session_id) === String(id))
      return { count: anomalies.length, results: anomalies, next: null, previous: null }
    }

    case 'report':
    case 'validation-report':
      return { success: true, report: { id, generated_at: new Date().toISOString(), items: [] } }

    case 'download':
    case 'export':
    case 'exporter':
    case 'pdf':
      return { success: true, message: 'Export non disponible en mode local', url: '#' }

    case 'duplicate':
      if (id) {
        const original = localDb.getById<any>(collection, id)
        if (original) {
          const { id: _id, ...rest } = original
          return localDb.create(collection, { ...rest, name: (rest.name || rest.nom || '') + ' (copie)' })
        }
      }
      return null

    case 'search':
    case 'search_advanced':
      return localDb.getPaginated(collection, data)

    case 'current':
      return localDb.getAll<any>(collection).filter((i: any) => i.is_current || i.en_cours || i.statut === 'ouvert')

    case 'cloturer':
      if (id) return localDb.update(collection, id, { statut: 'cloture', cloture_at: new Date().toISOString() })
      return { success: true }

    case 'rouvrir':
      if (id) return localDb.update(collection, id, { statut: 'ouvert', cloture_at: null })
      return { success: true }

    case 'publish':
    case 'activate':
      if (id) return localDb.update(collection, id, { is_published: true, is_active: true })
      return { success: true }

    case 'unpublish':
      if (id) return localDb.update(collection, id, { is_published: false })
      return { success: true }

    case 'resolve':
      if (id) return localDb.update(collection, id, { statut: 'resolu', resolved_at: new Date().toISOString() })
      return { success: true }

    case 'mark-done':
      if (id) return localDb.update(collection, id, { statut: 'termine', completed_at: new Date().toISOString() })
      return { success: true }

    case 'test':
    case 'preview':
      return { success: true, result: data, message: 'Preview genere localement' }

    case 'share':
      return { success: true, message: 'Partage non disponible en mode local' }

    case 'hierarchy':
      return localDb.getAll<any>('comptes_comptables').filter((c: any) => String(c.plan_id) === String(id))

    case 'variables':
      if (!data) return localDb.getAll<any>('template_variables').filter((v: any) => String(v.template_id) === String(id))
      return localDb.create('template_variables', { ...data, template_id: id })

    case 'sections':
      if (!data) return localDb.getAll<any>('template_sections').filter((s: any) => String(s.template_id) === String(id))
      return localDb.create('template_sections', { ...data, template_id: id })

    case 'reorder':
      return { success: true }

    case 'configuration':
      if (id) return localDb.getById<any>(collection, id)?.configuration || {}
      return {}

    case 'detect_liasse_type':
    case 'determiner_type_liasse':
      return { type_liasse: 'SN', confidence: 1.0 }

    case 'by_criteria':
    case 'officiel_syscohada':
      return localDb.getAll(collection)

    case 'lancer_production':
      if (id) localDb.update(collection, id, { statut: 'en_production', production_started_at: new Date().toISOString() })
      return { id, statut: 'en_production', progress: 0 }

    case 'generer_pre_commentaires':
      return [{ id: 1, texte: 'Commentaire automatique genere localement', type: 'observation' }]

    case 'teledeclarer':
    case 'declarer_liasse':
      if (id) localDb.update(collection, id, { statut: 'declare' })
      return { success: true, message: 'Teledeclaration simulee en mode local' }

    case 'appliquer_template':
      if (id) return localDb.getById(collection, id)
      return { success: true }

    case 'verrouiller':
      if (id) return localDb.update(collection, id, { statut: 'verrouille', verrouille: true })
      return { success: true }

    case 'finaliser':
      if (id) return localDb.update(collection, id, { statut: 'finalise' })
      return { success: true }

    case 'invalider_liasse':
      if (id) return localDb.update(collection, id, { statut: 'invalide' })
      return { success: true }

    case 'archiver_liasse':
      if (id) return localDb.update(collection, id, { statut: 'archive' })
      return { success: true }

    case 'remettre_brouillon':
      if (id) return localDb.update(collection, id, { statut: 'brouillon', verrouille: false })
      return { success: true }

    case 'get_transitions':
      return [
        { name: 'valider', label: 'Valider' },
        { name: 'verrouiller', label: 'Verrouiller' },
        { name: 'finaliser', label: 'Finaliser' },
      ]

    case 'transition':
      if (id && data?.transition) return localDb.update(collection, id, { statut: data.transition })
      return { success: true }

    case 'check-prerequisites':
    case 'validation-errors':
      return { success: true, errors: [], warnings: [] }

    case 'calendar':
    case 'echeances':
      return localDb.getAll(collection)

    case 'compare':
    case 'compare-years':
      return { comparison: [], summary: {} }

    case 'ai-recommendations':
    case 'ai-analyze':
      return { recommendations: [{ titre: 'Recommandation locale', description: 'Analyse non disponible en mode local' }] }

    case 'mark_all_read': {
      const notifs = localDb.getAll<any>(collection)
      notifs.forEach((n: any) => localDb.update(collection, n.id, { read: true }))
      return { success: true }
    }

    case 'calculer_ratios_financiers':
      return { ratios: [], message: 'Calcul local' }

    case 'default_settings':
    case 'timezones':
    case 'predefined_themes':
    case 'available_fonts':
    case 'storage_types':
      return []

    case 'active_theme': {
      const themes = localDb.getAll<any>(collection)
      return themes.find((t: any) => t.is_active) || themes[0] || null
    }

    case 'execute_backup':
    case 'start_restore':
    case 'cancel_restore':
      return { success: true, message: `Action ${action} simulee en mode local` }

    case 'recent':
      return localDb.getAll(collection).slice(0, 10)

    case 'increment_liasse':
      if (id) {
        const org = localDb.getById<any>(collection, id)
        if (org) return localDb.update(collection, id, { liasses_used: (org.liasses_used || 0) + 1 })
      }
      return { success: true }

    case 'reset_quota':
      if (id) return localDb.update(collection, id, { liasses_used: 0 })
      return { success: true }

    case 'resend':
    case 'accept':
      return { success: true, message: 'Action simulee en mode local' }

    case 'rate':
    case 'ratings':
      return { success: true, average: 4.5, count: 1 }

    case 'sync':
    case 'install':
    case 'connect':
      return { success: true, message: 'Non disponible en mode local' }

    case 'recalculate':
      return { success: true, value: 0 }

    case 'optimal':
      return localDb.getAll(collection)[0] || null

    case 'eligibles':
      return localDb.getAll(collection)

    case 'export_batch':
    case 'download_batch':
      return { success: true, message: 'Export batch non disponible en mode local' }

    case 'submit':
      if (id) return localDb.update(collection, id, { statut: 'soumis', submitted_at: new Date().toISOString() })
      return { success: true }

    case 'start':
      return { success: true, status: 'started' }

    case 'calculate':
      return { success: true, result: 0 }

    case 'position':
    case 'suggestions':
      return { data: [], suggestions: [] }

    default:
      if (id) return localDb.getById(collection, id)
      return { success: true, message: `Action ${action} traitee localement` }
  }
}

function handleStatsEndpoint(collection: string, params?: any): any {
  if (collection === 'generation_stats') {
    return {
      total_generations: localDb.getAll('generation_liasses').length || localDb.getAll('liasses').length,
      successful: 0, in_progress: 0, failed: 0,
    }
  }
  if (collection === 'audit_stats') {
    return {
      total_sessions: localDb.getAll('audit_sessions').length,
      total_anomalies: localDb.getAll('audit_anomalies').length,
      resolved: 0,
    }
  }
  if (collection === 'tax_stats') {
    return { total_declarations: localDb.getAll('declarations_fiscales').length, obligations_en_cours: localDb.getAll('obligations_fiscales').length }
  }
  if (collection === 'analytics' || collection === 'performance' || collection === 'data_quality') {
    return { data: [], summary: {}, score: 95, issues: [] }
  }
  return localDb.getPaginated(collection, params)
}

// ============================
// Classe ApiClient locale
// ============================

class ApiClient {
  private authenticated = false

  constructor() {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) this.authenticated = true
  }

  public getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  }

  public getCurrentUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY)
    return userStr ? JSON.parse(userStr) : null
  }

  public isAuthenticated(): boolean {
    return this.authenticated && !!localStorage.getItem(TOKEN_KEY)
  }

  public async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const users = localDb.getAll<any>('users')
    const user = users.find(
      (u: any) => (u.username === credentials.username || u.email === credentials.username) && u.password === credentials.password
    )

    if (!user) throw new Error('Identifiants invalides')

    const token = 'local_token_' + Date.now()
    localStorage.setItem(TOKEN_KEY, token)

    const userData: User = {
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      is_staff: user.is_staff || false,
      is_superuser: user.is_superuser || false,
      role: user.role || 'admin',
    }

    localStorage.setItem(USER_KEY, JSON.stringify(userData))
    this.authenticated = true

    return {
      success: true,
      message: 'Connexion reussie',
      data: { access: token, refresh: 'local_refresh_' + Date.now(), user: userData },
    }
  }

  public async signup(signupData: SignupData): Promise<SignupResponse> {
    const userId = Date.now()
    const orgSlug = signupData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    localDb.create('users', {
      id: userId,
      username: signupData.user_email,
      email: signupData.user_email,
      password: signupData.user_password,
      first_name: signupData.user_first_name,
      last_name: signupData.user_last_name,
      is_staff: true,
      is_superuser: true,
      role: 'owner',
    })

    const org: Organization = {
      id: String(userId), name: signupData.name, slug: orgSlug,
      legal_form: signupData.legal_form, rccm: signupData.rccm || '', ifu: signupData.ifu || '',
      country: signupData.country, city: signupData.city || '', sector: signupData.sector,
      subscription_plan: 'trial', subscription_status: 'active',
      liasses_quota: 10, liasses_used: 0, quota_percentage: 0, has_quota_remaining: true,
    }
    localDb.create('organizations', org)

    const token = 'local_token_' + Date.now()
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify({
      id: userId, username: signupData.user_email, email: signupData.user_email,
      first_name: signupData.user_first_name, last_name: signupData.user_last_name,
      is_staff: true, is_superuser: true,
    }))
    this.authenticated = true

    return {
      message: 'Inscription reussie',
      organization: org,
      user: { id: userId, email: signupData.user_email, first_name: signupData.user_first_name, last_name: signupData.user_last_name },
      tokens: { access: token, refresh: 'local_refresh_' + Date.now() },
      onboarding: { plan: 'trial', liasses_remaining: 10, trial_end: null },
    }
  }

  public logout(): void {
    this.authenticated = false
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    sessionStorage.removeItem('fiscasync_refresh_token')
    sessionStorage.removeItem('fiscasync_user')
    sessionStorage.removeItem('fiscasync_organization')
  }

  // === METHODES HTTP ===

  public async get<T>(url: string, params?: any): Promise<T> {
    await delay()
    const { mapping, id, action } = resolveRoute(url)
    const collection = mapping.collection

    if (collection === '_health') return { status: 'ok', local: true } as any
    if (collection === '_auth_me') return { success: true, data: this.getCurrentUser() } as any

    if (['generation_stats', 'audit_stats', 'tax_stats', 'analytics', 'performance', 'data_quality'].includes(collection)) {
      return handleStatsEndpoint(collection, params) as T
    }

    if (action) return handleSpecialAction(collection, id, action, params) as T
    if (id) {
      const item = localDb.getById<T>(collection, id)
      if (!item) throw new Error(`Ressource ${id} non trouvee dans ${collection}`)
      return item
    }

    return localDb.getPaginated<any>(collection, params) as T
  }

  public async post<T>(url: string, data?: any): Promise<T> {
    await delay()
    const { mapping, id, action } = resolveRoute(url)
    const collection = mapping.collection

    if (collection === '_auth_login') return this.login(data) as any
    if (collection === '_auth_signup') return this.signup(data) as any
    if (collection === '_auth_refresh') return { access: this.getAccessToken() || 'refreshed_token' } as any

    if (action) return handleSpecialAction(collection, id, action, data) as T
    return localDb.create<T>(collection, data || {})
  }

  public async put<T>(url: string, data?: any): Promise<T> {
    await delay()
    const { mapping, id } = resolveRoute(url)
    if (id) return (localDb.update<T>(mapping.collection, id, data || {}) || data) as T
    return localDb.create<T>(mapping.collection, data || {})
  }

  public async patch<T>(url: string, data?: any): Promise<T> {
    await delay()
    const { mapping, id, action, subId } = resolveRoute(url)
    const collection = mapping.collection

    if (collection === '_auth_me') {
      const currentUser = this.getCurrentUser()
      if (currentUser) {
        const updated = { ...currentUser, ...data }
        localStorage.setItem(USER_KEY, JSON.stringify(updated))
        return { success: true, data: updated } as T
      }
    }

    if (action && subId) {
      const subCollection = action === 'variables' ? 'template_variables' : action === 'sections' ? 'template_sections' : action
      return (localDb.update<T>(subCollection, subId, data || {}) || data) as T
    }

    if (action && id) return handleSpecialAction(collection, id, action, data) as T
    if (id) return (localDb.update<T>(collection, id, data || {}) || data) as T
    return data as T
  }

  public async delete<T>(url: string): Promise<T> {
    await delay()
    const { mapping, id, action, subId } = resolveRoute(url)

    if (action && subId) {
      const subCollection = action === 'variables' ? 'template_variables' : action === 'sections' ? 'template_sections' : action
      localDb.remove(subCollection, subId)
      return {} as T
    }

    if (id) localDb.remove(mapping.collection, id)
    return {} as T
  }

  public async upload<T>(url: string, file: File, additionalData?: any): Promise<T> {
    await delay()
    const { mapping } = resolveRoute(url)
    return localDb.create<T>(mapping.collection, {
      name: file.name, size: file.size, type: file.type,
      uploaded_at: new Date().toISOString(), ...additionalData,
    })
  }

  // Compatibilite: propriete client (utilisee par l'export default pour liasseService.ts)
  public get client(): any {
    const self = this
    return {
      get: async (url: string, config?: any) => ({ data: await self.get(url, config?.params) }),
      post: async (url: string, body?: any) => ({ data: await self.post(url, body) }),
      put: async (url: string, body?: any) => ({ data: await self.put(url, body) }),
      patch: async (url: string, body?: any) => ({ data: await self.patch(url, body) }),
      delete: async (url: string) => ({ data: await self.delete(url) }),
      interceptors: {
        request: { use: () => {}, eject: () => {} },
        response: { use: () => {}, eject: () => {} },
      },
      defaults: { headers: { common: {} } },
    }
  }
}

function delay(ms = 50): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Export d'une instance unique (Singleton)
export const apiClient = new ApiClient()

// Export pour compatibilite avec liasseService.ts qui fait: import apiClient from './apiClient'
export default apiClient.client
