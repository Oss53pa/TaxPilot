/**
 * liasseHistoryService — journal Supabase des liasses générées.
 *
 * Append-only (table lp_liasse_exports, migration 017). Chaque export de liasse
 * (XLSX/PDF) y est tracé avec une empreinte SHA-256 du contenu → traçabilité /
 * intégrité OHADA, indépendant du mode (Entreprise ou Cabinet).
 *
 * 100% best-effort : si Supabase est indisponible, l'export local n'est jamais
 * bloqué (le record est simplement ignoré).
 */
import { supabase } from '@/lib/supabase'
import { getActiveDossierId } from '@/services/dossierScopeService'
import { logger } from '@/utils/logger'

export interface LiasseExportRecord {
  id: string
  exercice: string
  typeLiasse: string
  format: string
  entreprise: string | null
  hash: string | null
  createdAt: string
}

/** SHA-256 hex d'un objet JSON (Web Crypto). null si indisponible. */
async function sha256Json(value: unknown): Promise<string | null> {
  try {
    if (typeof crypto === 'undefined' || !crypto.subtle) return null
    const data = new TextEncoder().encode(JSON.stringify(value))
    const digest = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  } catch {
    return null
  }
}

export async function recordLiasseExport(params: {
  exercice: string
  typeLiasse: string
  format: 'XLSX' | 'PDF'
  entreprise?: string
  /** Données de la liasse pour calcul de l'empreinte (optionnel). */
  snapshot?: unknown
}): Promise<void> {
  if (!supabase) return
  try {
    const { data: auth } = await supabase.auth.getSession()
    const uid = auth.session?.user?.id
    if (!uid) return

    const hash = params.snapshot !== undefined ? await sha256Json(params.snapshot) : null

    const { error } = await supabase.from('lp_liasse_exports').insert({
      user_id: uid,
      dossier_id: getActiveDossierId(),
      exercice: params.exercice,
      type_liasse: params.typeLiasse,
      format: params.format,
      entreprise: params.entreprise ?? null,
      hash_sha256: hash,
    })
    if (error) logger.warn('[liasseHistory] record error:', error.message)
  } catch (e) {
    logger.warn('[liasseHistory] record failed:', e instanceof Error ? e.message : e)
  }
}

interface ExportRow {
  id: string
  exercice: string
  type_liasse: string
  format: string
  entreprise: string | null
  hash_sha256: string | null
  created_at: string
}

/** Liste le journal des liasses générées pour l'utilisateur courant. */
export async function listLiasseExports(): Promise<LiasseExportRecord[]> {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('lp_liasse_exports')
      .select('id, exercice, type_liasse, format, entreprise, hash_sha256, created_at')
      .order('created_at', { ascending: false })
      .limit(200)
    if (error || !data) return []
    return (data as ExportRow[]).map((r) => ({
      id: r.id,
      exercice: r.exercice,
      typeLiasse: r.type_liasse,
      format: r.format,
      entreprise: r.entreprise,
      hash: r.hash_sha256,
      createdAt: r.created_at,
    }))
  } catch {
    return []
  }
}
