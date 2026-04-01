import { supabase, isSupabaseEnabled } from '@/lib/supabase'
import { logger } from '@/utils/logger'

/**
 * Compute SHA-256 hash of liasse data for integrity verification
 */
async function computeHash(data: unknown): Promise<string> {
  const json = JSON.stringify(data, null, 0)
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(json)
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Lock a liasse after generation, making it immutable.
 * This is irreversible — once locked, the liasse cannot be modified.
 */
export async function lockLiasse(liasseId: string, donneesJson: unknown): Promise<{ success: boolean; hash?: string; error?: string }> {
  if (!isSupabaseEnabled || !supabase) {
    logger.warn('[Immutability] Supabase not available, lock skipped')
    return { success: false, error: 'Supabase non disponible' }
  }

  try {
    const hash = await computeHash(donneesJson)

    const { data, error } = await supabase.rpc('lock_liasse', {
      p_liasse_id: liasseId,
      p_hash: hash,
    })

    if (error) throw new Error(error.message)

    const result = data as { success: boolean; error?: string }
    if (!result.success) {
      return { success: false, error: result.error }
    }

    logger.info(`[Immutability] Liasse ${liasseId} locked. Hash: ${hash.substring(0, 16)}...`)
    return { success: true, hash }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur de verrouillage'
    logger.error('[Immutability] Lock failed:', msg)
    return { success: false, error: msg }
  }
}

/**
 * Verify the integrity of a locked liasse by comparing its hash
 */
export async function verifyLiasseIntegrity(liasseId: string): Promise<{ valid: boolean; message: string }> {
  if (!isSupabaseEnabled || !supabase) {
    return { valid: false, message: 'Supabase non disponible' }
  }

  try {
    const { data, error } = await supabase
      .from('liasses')
      .select('donnees_json, hash_sha256, is_locked')
      .eq('id', liasseId)
      .single()

    if (error || !data) {
      return { valid: false, message: 'Liasse introuvable' }
    }

    if (!data.is_locked) {
      return { valid: true, message: 'Liasse non verrouillée (brouillon)' }
    }

    if (!data.hash_sha256) {
      return { valid: false, message: 'Hash manquant — intégrité non vérifiable' }
    }

    const currentHash = await computeHash(data.donnees_json)
    const isValid = currentHash === data.hash_sha256

    return {
      valid: isValid,
      message: isValid
        ? 'Intégrité vérifiée — la liasse n\'a pas été altérée'
        : 'ALERTE : le hash ne correspond pas — données potentiellement altérées',
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur de vérification'
    return { valid: false, message: msg }
  }
}
