/**
 * Supabase Data Access Layer — TaxPilot
 * Provides typed CRUD operations for all Supabase tables.
 * Services should call these functions when BACKEND_ENABLED = true.
 */

import { supabase } from '@/config/supabase'
import type {
  DbBalance,
  DbLigneBalance,
  DbLiasse,
  DbEntreprise,
  DbExercice,
  DbDeclaration,
  DbAuditSession,
  DbProfile,
  DbOrganisation,
} from '@/config/supabase'

// ============================================================
// Generic paginated response
// ============================================================
export interface PaginatedResult<T> {
  count: number
  results: T[]
  next: string | null
  previous: string | null
}

function paginate<T>(data: T[], page = 1, pageSize = 25): PaginatedResult<T> {
  const start = (page - 1) * pageSize
  const results = data.slice(start, start + pageSize)
  return {
    count: data.length,
    results,
    next: start + pageSize < data.length ? `page=${page + 1}` : null,
    previous: page > 1 ? `page=${page - 1}` : null,
  }
}

// ============================================================
// AUTH
// ============================================================
export const supabaseAuth = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  async signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  },

  async getProfile(): Promise<DbProfile | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    return data
  },
}

// ============================================================
// ORGANISATIONS
// ============================================================
export const supabaseOrganisations = {
  async get(): Promise<DbOrganisation | null> {
    const profile = await supabaseAuth.getProfile()
    if (!profile?.organisation_id) return null
    const { data } = await supabase
      .from('organisations')
      .select('*')
      .eq('id', profile.organisation_id)
      .single()
    return data
  },
}

// ============================================================
// ENTREPRISES
// ============================================================
export const supabaseEntreprises = {
  async list(params?: { page?: number; page_size?: number }): Promise<PaginatedResult<DbEntreprise>> {
    const { data, error } = await supabase
      .from('entreprises')
      .select('*')
      .eq('is_active', true)
      .order('raison_sociale')
    if (error) throw error
    return paginate(data ?? [], params?.page, params?.page_size)
  },

  async getById(id: string): Promise<DbEntreprise | null> {
    const { data, error } = await supabase.from('entreprises').select('*').eq('id', id).single()
    if (error) throw error
    return data
  },

  async create(entreprise: Partial<DbEntreprise>): Promise<DbEntreprise> {
    const { data, error } = await supabase.from('entreprises').insert(entreprise).select().single()
    if (error) throw error
    return data
  },

  async update(id: string, changes: Partial<DbEntreprise>): Promise<DbEntreprise> {
    const { data, error } = await supabase
      .from('entreprises')
      .update(changes)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },
}

// ============================================================
// EXERCICES
// ============================================================
export const supabaseExercices = {
  async list(entrepriseId: string): Promise<DbExercice[]> {
    const { data, error } = await supabase
      .from('exercices')
      .select('*')
      .eq('entreprise_id', entrepriseId)
      .order('date_debut', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  async getCurrent(entrepriseId: string): Promise<DbExercice | null> {
    const { data } = await supabase
      .from('exercices')
      .select('*')
      .eq('entreprise_id', entrepriseId)
      .eq('is_current', true)
      .single()
    return data
  },

  async create(exercice: Partial<DbExercice>): Promise<DbExercice> {
    const { data, error } = await supabase.from('exercices').insert(exercice).select().single()
    if (error) throw error
    return data
  },
}

// ============================================================
// BALANCES
// ============================================================
export const supabaseBalances = {
  async list(params?: { exercice_id?: string; page?: number; page_size?: number }): Promise<PaginatedResult<DbBalance>> {
    let query = supabase.from('balances').select('*').order('date_import', { ascending: false })
    if (params?.exercice_id) query = query.eq('exercice_id', params.exercice_id)
    const { data, error } = await query
    if (error) throw error
    return paginate(data ?? [], params?.page, params?.page_size)
  },

  async getById(id: string): Promise<DbBalance | null> {
    const { data, error } = await supabase.from('balances').select('*').eq('id', id).single()
    if (error) throw error
    return data
  },

  async create(balance: Partial<DbBalance>): Promise<DbBalance> {
    const { data, error } = await supabase.from('balances').insert(balance).select().single()
    if (error) throw error
    return data
  },

  async getLignes(balanceId: string): Promise<DbLigneBalance[]> {
    const { data, error } = await supabase
      .from('lignes_balance')
      .select('*')
      .eq('balance_id', balanceId)
      .order('numero_compte')
    if (error) throw error
    return data ?? []
  },

  async insertLignes(lignes: Partial<DbLigneBalance>[]): Promise<void> {
    // Insert in batches of 500 to avoid payload limits
    for (let i = 0; i < lignes.length; i += 500) {
      const batch = lignes.slice(i, i + 500)
      const { error } = await supabase.from('lignes_balance').insert(batch)
      if (error) throw error
    }
  },
}

// ============================================================
// LIASSES
// ============================================================
export const supabaseLiasses = {
  async list(params?: { exercice_id?: string; page?: number; page_size?: number }): Promise<PaginatedResult<DbLiasse>> {
    let query = supabase.from('liasses').select('*').order('created_at', { ascending: false })
    if (params?.exercice_id) query = query.eq('exercice_id', params.exercice_id)
    const { data, error } = await query
    if (error) throw error
    return paginate(data ?? [], params?.page, params?.page_size)
  },

  async getById(id: string): Promise<DbLiasse | null> {
    const { data, error } = await supabase.from('liasses').select('*').eq('id', id).single()
    if (error) throw error
    return data
  },

  async create(liasse: Partial<DbLiasse>): Promise<DbLiasse> {
    const { data, error } = await supabase.from('liasses').insert(liasse).select().single()
    if (error) throw error
    return data
  },

  async update(id: string, changes: Partial<DbLiasse>): Promise<DbLiasse> {
    const { data, error } = await supabase
      .from('liasses')
      .update(changes)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('liasses').delete().eq('id', id)
    if (error) throw error
  },
}

// ============================================================
// DECLARATIONS
// ============================================================
export const supabaseDeclarations = {
  async list(params?: { entreprise_id?: string; type_declaration?: string }): Promise<PaginatedResult<DbDeclaration>> {
    let query = supabase.from('declarations').select('*').order('date_limite', { ascending: false })
    if (params?.entreprise_id) query = query.eq('entreprise_id', params.entreprise_id)
    if (params?.type_declaration) query = query.eq('type_declaration', params.type_declaration)
    const { data, error } = await query
    if (error) throw error
    return paginate(data ?? [])
  },

  async create(declaration: Partial<DbDeclaration>): Promise<DbDeclaration> {
    const { data, error } = await supabase.from('declarations').insert(declaration).select().single()
    if (error) throw error
    return data
  },

  async update(id: string, changes: Partial<DbDeclaration>): Promise<DbDeclaration> {
    const { data, error } = await supabase
      .from('declarations')
      .update(changes)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },
}

// ============================================================
// AUDIT SESSIONS
// ============================================================
export const supabaseAudits = {
  async list(params?: { liasse_id?: string }): Promise<PaginatedResult<DbAuditSession>> {
    let query = supabase.from('audit_sessions').select('*').order('created_at', { ascending: false })
    if (params?.liasse_id) query = query.eq('liasse_id', params.liasse_id)
    const { data, error } = await query
    if (error) throw error
    return paginate(data ?? [])
  },

  async create(session: Partial<DbAuditSession>): Promise<DbAuditSession> {
    const { data, error } = await supabase.from('audit_sessions').insert(session).select().single()
    if (error) throw error
    return data
  },
}
