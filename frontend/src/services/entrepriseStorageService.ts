/**
 * entrepriseStorageService — persistance de la configuration entreprise.
 *
 * Source de vérité : table Supabase `public.entreprise_settings`
 *   - 1 ligne par utilisateur (unique user_id), RLS « own settings ».
 *   - colonne `data jsonb` = MAP { [scopePrefix]: Entreprise } pour gérer à la
 *     fois le mode Entreprise (scope '') et le mode Cabinet (un scope par
 *     dossier). Aligné sur le scoping localStorage (dossierScopeService).
 *
 * localStorage = cache local (lecture synchrone immédiate + offline). Il est
 * réhydraté depuis Supabase au démarrage (authStore) et à l'ouverture de la
 * page Paramètres → la config ne « disparaît » plus après une mise à jour /
 * un vidage de cache, contrairement à l'ancien stockage 100 % localStorage.
 */

import type { Entreprise } from './entrepriseService'
import { scopeKey, getScopePrefix } from './dossierScopeService'
import { supabase } from '@/lib/supabase'
import { logger } from '@/utils/logger'

const BASE_KEY = 'fiscasync_entreprise_settings'

/** Clé de scope dans la map jsonb ('' → '_default' pour rester JSON-safe). */
function scopeMapKey(): string {
  return getScopePrefix() || '_default'
}

// ── Cache localStorage (lecture synchrone, API historique inchangée) ──

export function getEntreprise(): Partial<Entreprise> | null {
  try {
    const raw = localStorage.getItem(scopeKey(BASE_KEY))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function setLocal(data: Partial<Entreprise>): void {
  try {
    localStorage.setItem(scopeKey(BASE_KEY), JSON.stringify(data))
  } catch {
    // localStorage plein/indisponible
  }
}

// ── Persistance Supabase (best-effort, ne bloque jamais l'UX) ──

async function persistToCloud(data: Partial<Entreprise>): Promise<void> {
  if (!supabase) return
  try {
    const { data: auth } = await supabase.auth.getUser()
    const uid = auth.user?.id
    if (!uid) return

    // Lecture-modification-écriture de la map (1 seul user, pas de concurrence).
    const { data: existing } = await supabase
      .from('entreprise_settings')
      .select('data')
      .eq('user_id', uid)
      .maybeSingle()

    const map: Record<string, unknown> =
      existing?.data && typeof existing.data === 'object'
        ? { ...(existing.data as Record<string, unknown>) }
        : {}
    map[scopeMapKey()] = data

    const { error } = await supabase
      .from('entreprise_settings')
      .upsert({ user_id: uid, data: map }, { onConflict: 'user_id' })
    if (error) logger.warn('[entreprise] persistToCloud error:', error.message)
  } catch (e) {
    logger.warn('[entreprise] persistToCloud failed:', e instanceof Error ? e.message : e)
  }
}

/**
 * Sauvegarde la config : cache local immédiat + upsert Supabase (asynchrone).
 * Notifie les autres composants (liasse, page de garde) du changement.
 */
export function saveEntreprise(data: Partial<Entreprise>): void {
  setLocal(data)
  window.dispatchEvent(new Event('fiscasync:entreprise-saved'))
  void persistToCloud(data)
}

/**
 * Réhydrate le cache local depuis Supabase pour le scope courant.
 * Renvoie la config du scope courant (ou le cache local si Supabase
 * indisponible / pas de ligne). À appeler au démarrage et à l'ouverture
 * de la page Paramètres.
 */
export async function hydrateEntrepriseFromCloud(): Promise<Partial<Entreprise> | null> {
  if (!supabase) return getEntreprise()
  try {
    const { data: auth } = await supabase.auth.getUser()
    const uid = auth.user?.id
    if (!uid) return getEntreprise()

    const { data: row, error } = await supabase
      .from('entreprise_settings')
      .select('data')
      .eq('user_id', uid)
      .maybeSingle()
    if (error || !row?.data || typeof row.data !== 'object') return getEntreprise()

    const map = row.data as Record<string, Partial<Entreprise>>
    const value = map[scopeMapKey()]
    if (value && typeof value === 'object') {
      setLocal(value)
      window.dispatchEvent(new Event('fiscasync:entreprise-saved'))
      return value
    }
    return getEntreprise()
  } catch {
    return getEntreprise()
  }
}

export function clearEntreprise(): void {
  localStorage.removeItem(scopeKey(BASE_KEY))
}
