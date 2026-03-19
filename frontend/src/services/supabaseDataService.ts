/**
 * supabaseDataService.ts — P2-4: Data persistence via Supabase with localStorage fallback
 * All methods check isSupabaseEnabled first. If false, delegate to localStorage services.
 */
import { supabase, isSupabaseEnabled } from '@/lib/supabase'

// ── Dossiers ──

export async function fetchDossiers(userId: string) {
  if (!isSupabaseEnabled || !supabase) return null // fallback to Zustand store
  const { data, error } = await supabase
    .from('dossiers')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data
}

export async function upsertDossier(dossier: {
  id?: string
  user_id: string
  nom_client: string
  rccm?: string
  ncc?: string
  exercice_n: number
  exercice_n1?: number
  regime: string
  statut?: string
}) {
  if (!isSupabaseEnabled || !supabase) return null
  const { data, error } = await supabase
    .from('dossiers')
    .upsert(dossier)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteDossierRemote(dossierId: string) {
  if (!isSupabaseEnabled || !supabase) return
  const { error } = await supabase.from('dossiers').delete().eq('id', dossierId)
  if (error) throw error
}

// ── Balances ──

export async function saveBalanceRemote(dossierId: string, annee: 'N' | 'N-1', entries: unknown[]) {
  if (!isSupabaseEnabled || !supabase) return null
  // Upsert: replace existing balance for this dossier+annee
  const { data: existing } = await supabase
    .from('balances')
    .select('id')
    .eq('dossier_id', dossierId)
    .eq('annee', annee)
    .single()

  const totalDebit = (entries as { solde_debit?: number }[]).reduce((s, e) => s + (e.solde_debit || 0), 0)
  const totalCredit = (entries as { solde_credit?: number }[]).reduce((s, e) => s + (e.solde_credit || 0), 0)

  const record = {
    dossier_id: dossierId,
    annee,
    data: entries,
    nombre_comptes: entries.length,
    total_debit: totalDebit,
    total_credit: totalCredit,
  }

  if (existing?.id) {
    const { error } = await supabase.from('balances').update(record).eq('id', existing.id)
    if (error) throw error
  } else {
    const { error } = await supabase.from('balances').insert(record)
    if (error) throw error
  }
}

export async function fetchBalance(dossierId: string, annee: 'N' | 'N-1') {
  if (!isSupabaseEnabled || !supabase) return null
  const { data, error } = await supabase
    .from('balances')
    .select('data')
    .eq('dossier_id', dossierId)
    .eq('annee', annee)
    .single()
  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows
  return data?.data || null
}

// ── Saisies manuelles ──

export async function saveSaisieManuelle(dossierId: string, pageRef: string, champ: string, valeur: number, userId: string) {
  if (!isSupabaseEnabled || !supabase) return null
  const { error } = await supabase
    .from('saisies_manuelles')
    .upsert({
      dossier_id: dossierId,
      page_ref: pageRef,
      champ,
      valeur,
      modifie_par: userId,
      modifie_le: new Date().toISOString(),
    }, { onConflict: 'dossier_id,page_ref,champ' })
  if (error) throw error
}

export async function fetchSaisiesManuelles(dossierId: string, pageRef: string) {
  if (!isSupabaseEnabled || !supabase) return null
  const { data, error } = await supabase
    .from('saisies_manuelles')
    .select('champ, valeur')
    .eq('dossier_id', dossierId)
    .eq('page_ref', pageRef)
  if (error) throw error
  return data
}

// ── Entreprise Settings (mode Entreprise) ──

export async function saveEntrepriseSettings(userId: string, settings: Record<string, unknown>) {
  if (!isSupabaseEnabled || !supabase) return null
  const { error } = await supabase
    .from('entreprise_settings')
    .upsert({ user_id: userId, ...settings }, { onConflict: 'user_id' })
  if (error) throw error
}

export async function fetchEntrepriseSettings(userId: string) {
  if (!isSupabaseEnabled || !supabase) return null
  const { data, error } = await supabase
    .from('entreprise_settings')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}
