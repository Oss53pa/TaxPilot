/**
 * cloudStateService — miroir cloud du localStorage métier (BaaS Supabase).
 *
 * Problème résolu : toute la persistance métier (balance, dossiers, saisies
 * manuelles, config, stores zustand persistés…) vivait UNIQUEMENT dans le
 * localStorage → volatile (vidage de cache, "Clear site data", changement
 * d'appareil → données perdues).
 *
 * Mécanisme générique, sans toucher les ~30 sites d'écriture :
 *   1. On intercepte localStorage.setItem (monkey-patch) → toute clé métier
 *      écrite est répliquée (debounce) dans la table Supabase `lp_user_state`
 *      (KV par utilisateur, RLS own).
 *   2. À la connexion, hydrateAllFromCloud() recharge le cloud dans le
 *      localStorage (FILL-ABSENT : on n'écrase JAMAIS une valeur locale
 *      existante → pas de perte de données fraîches) puis réhydrate les stores
 *      zustand persistés.
 *
 * Garanties anti-régression :
 *   - STRICTEMENT ADDITIF : le setItem original est toujours appelé d'abord ;
 *     si Supabase est indisponible, le comportement local est inchangé.
 *   - removeItem n'est volontairement PAS propagé : la purge localStorage du
 *     logout ne doit pas vider la sauvegarde cloud.
 *   - Désactivé en mode test pour ne pas perturber les suites localStorage.
 */

import { supabase } from '@/lib/supabase'
import { logger } from '@/utils/logger'

const SYNC_PREFIXES = ['fiscasync-', 'fiscasync_', 'dossier_']

/** Clés à NE PAS synchroniser : préférences par appareil, secrets, et la
 *  config entreprise (chemin dédié entreprise_settings). */
const EXCLUDE_EXACT = new Set<string>([
  'fiscasync-theme',
  'fiscasync-lang',
  'fiscasync_device_id_v1',
])
function shouldSync(key: string | null): boolean {
  if (!key) return false
  if (EXCLUDE_EXACT.has(key)) return false
  if (key.includes('session_secret')) return false
  if (key.includes('fiscasync_entreprise_settings')) return false // chemin dédié
  return SYNC_PREFIXES.some((p) => key.startsWith(p))
}

// Garde-fou : on ne réplique pas les valeurs anormalement grosses (≈ 3 Mo) pour
// éviter des uploads coûteux à chaque écriture. Elles restent en local.
const MAX_VALUE_LEN = 3_000_000
function syncable(key: string | null, value: string | null): boolean {
  return shouldSync(key) && typeof value === 'string' && value.length <= MAX_VALUE_LEN
}

const IS_TEST =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE === 'test') ||
  (typeof process !== 'undefined' && !!process.env?.VITEST)

const hasLS = typeof window !== 'undefined' && !!window.localStorage

// Références aux méthodes natives (non patchées) pour usage interne.
const nativeSetItem = hasLS ? localStorage.setItem.bind(localStorage) : null
const nativeGetItem = hasLS ? localStorage.getItem.bind(localStorage) : null

async function currentUserId(): Promise<string | null> {
  if (!supabase) return null
  try {
    const { data } = await supabase.auth.getSession()
    return data.session?.user?.id ?? null
  } catch {
    return null
  }
}

// ── Push debouncé des écritures ──
const pending = new Map<string, string>()
let flushTimer: ReturnType<typeof setTimeout> | null = null

function scheduleFlush(): void {
  if (flushTimer) return
  flushTimer = setTimeout(() => {
    flushTimer = null
    void flush()
  }, 1500)
}

async function flush(): Promise<void> {
  if (!supabase || pending.size === 0) return
  const uid = await currentUserId()
  if (!uid) return
  const now = new Date().toISOString()
  const rows = Array.from(pending.entries()).map(([key, value]) => ({
    user_id: uid,
    key,
    value,
    updated_at: now,
  }))
  pending.clear()
  try {
    const { error } = await supabase.from('lp_user_state').upsert(rows, { onConflict: 'user_id,key' })
    if (error) logger.warn('[cloudState] flush error:', error.message)
  } catch (e) {
    logger.warn('[cloudState] flush failed:', e instanceof Error ? e.message : e)
  }
}

let installed = false

/** Installe le miroir (idempotent). Auto-appelé à l'import (sauf en test). */
export function installCloudMirror(): void {
  if (installed || IS_TEST || !hasLS || !nativeSetItem) return
  installed = true

  // Monkey-patch setItem : écriture locale d'abord, puis réplication cloud.
  localStorage.setItem = function patchedSetItem(key: string, value: string): void {
    nativeSetItem(key, value)
    try {
      if (syncable(key, value)) {
        pending.set(key, value)
        scheduleFlush()
      }
    } catch {
      /* ne jamais casser une écriture locale */
    }
  }

  // Flush opportuniste quand l'onglet passe en arrière-plan / se ferme.
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void flush()
  })
  window.addEventListener('pagehide', () => {
    void flush()
  })
}

/** Snapshot complet du localStorage métier courant vers le cloud (best-effort). */
export async function pushAllToCloud(): Promise<void> {
  if (!supabase || !hasLS || !nativeGetItem) return
  const uid = await currentUserId()
  if (!uid) return
  const now = new Date().toISOString()
  const rows: { user_id: string; key: string; value: string; updated_at: string }[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!shouldSync(key)) continue
    const value = nativeGetItem(key as string)
    if (value == null || !syncable(key, value)) continue
    rows.push({ user_id: uid, key: key as string, value, updated_at: now })
  }
  if (rows.length === 0) return
  try {
    const { error } = await supabase.from('lp_user_state').upsert(rows, { onConflict: 'user_id,key' })
    if (error) logger.warn('[cloudState] pushAll error:', error.message)
  } catch (e) {
    logger.warn('[cloudState] pushAll failed:', e instanceof Error ? e.message : e)
  }
}

/**
 * Réhydrate le localStorage depuis le cloud (FILL-ABSENT) puis réhydrate les
 * stores zustand persistés. Ne renvoie rien ; best-effort.
 */
export async function hydrateAllFromCloud(): Promise<void> {
  if (!supabase || !hasLS || !nativeSetItem || !nativeGetItem) return
  const uid = await currentUserId()
  if (!uid) return
  try {
    const { data, error } = await supabase
      .from('lp_user_state')
      .select('key, value')
      .eq('user_id', uid)
    if (error || !data) return

    let filled = 0
    for (const row of data as { key: string; value: string }[]) {
      if (!shouldSync(row.key)) continue
      // FILL-ABSENT : ne jamais écraser une valeur locale (potentiellement
      // plus fraîche). On utilise nativeSetItem pour ne pas re-déclencher un push.
      if (nativeGetItem(row.key) == null) {
        nativeSetItem(row.key, row.value)
        filled++
      }
    }
    if (filled > 0) await rehydratePersistedStores()
  } catch (e) {
    logger.warn('[cloudState] hydrate failed:', e instanceof Error ? e.message : e)
  }
}

/** Recharge les stores zustand persistés depuis le localStorage fraîchement rempli. */
async function rehydratePersistedStores(): Promise<void> {
  try {
    const mods = await Promise.all([
      import('@/store/dossierStore'),
      import('@/store/modeStore'),
      import('@/store/exerciceStore'),
      import('@/store/tauxFiscauxStore'),
      import('@/store/tenantStore'),
      import('@/store/organizationStore'),
    ])
    for (const mod of mods) {
      for (const exported of Object.values(mod as Record<string, unknown>)) {
        const store = exported as { persist?: { rehydrate?: () => void | Promise<void> } }
        if (typeof exported === 'function' && store.persist?.rehydrate) {
          try {
            await store.persist.rehydrate()
          } catch {
            /* ignore */
          }
        }
      }
    }
  } catch {
    /* import/rehydrate best-effort */
  }
}

// Auto-installation à l'import (hors test).
installCloudMirror()
