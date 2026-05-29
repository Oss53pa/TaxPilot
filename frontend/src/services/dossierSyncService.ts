/**
 * dossierSyncService — persistance structurée des dossiers dans Supabase.
 *
 * Complète le miroir KV (lp_user_state) par une vraie ligne relationnelle dans
 * la table `public.dossiers` (RLS par user). C'est la fondation qui permettra
 * de rattacher liasses/balances à un dossier côté serveur.
 *
 * Stratégie ANTI-RÉGRESSION (additive) :
 *   - le store dossiers reste la source de lecture synchrone (localStorage) ;
 *   - on écrit en plus dans Supabase (write-through best-effort) ;
 *   - à la connexion, on fusionne les dossiers cloud absents en local
 *     (merge by id, jamais d'écrasement) ;
 *   - seuls les dossiers à id UUID sont synchronisés (la table `dossiers.id`
 *     est de type uuid). Les nouveaux dossiers utilisent crypto.randomUUID().
 *     Les anciens dossiers (id base36) restent sauvegardés via le miroir KV.
 */
import { supabase } from '@/lib/supabase'
import { logger } from '@/utils/logger'
import type { Dossier } from '@/store/dossierStore'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isUuid(id: string): boolean {
  return UUID_RE.test(id)
}

interface DossierRow {
  id: string
  user_id: string
  nom_client: string
  rccm: string | null
  ncc: string | null
  exercice_n: number
  exercice_n1: number | null
  regime: string
  statut: string
  created_at?: string
  updated_at?: string
}

async function uid(): Promise<string | null> {
  if (!supabase) return null
  try {
    const { data } = await supabase.auth.getSession()
    return data.session?.user?.id ?? null
  } catch {
    return null
  }
}

function toRow(d: Dossier, userId: string): DossierRow {
  return {
    id: d.id,
    user_id: userId,
    nom_client: d.nomClient,
    rccm: d.rccm || null,
    ncc: d.ncc || null,
    exercice_n: d.exerciceN,
    exercice_n1: d.exerciceN1 ?? null,
    regime: d.regime,
    statut: d.statut,
  }
}

function fromRow(r: DossierRow): Dossier {
  return {
    id: r.id,
    nomClient: r.nom_client || '',
    rccm: r.rccm || '',
    ncc: r.ncc || '',
    exerciceN: r.exercice_n,
    exerciceN1: r.exercice_n1 ?? r.exercice_n - 1,
    regime: (['normal', 'simplifie', 'forfaitaire'].includes(r.regime) ? r.regime : 'normal') as Dossier['regime'],
    statut: (['en_cours', 'validee', 'exportee'].includes(r.statut) ? r.statut : 'en_cours') as Dossier['statut'],
    dateCreation: r.created_at || new Date().toISOString(),
    dateDerniereModification: r.updated_at || new Date().toISOString(),
    balanceKey: `fiscasync_balance_${r.id}`,
    balanceN1Key: `fiscasync_balance_n1_${r.id}`,
  }
}

/** Write-through best-effort d'un dossier vers Supabase (uuid uniquement). */
export async function pushDossier(d: Dossier): Promise<void> {
  if (!supabase || !isUuid(d.id)) return
  const userId = await uid()
  if (!userId) return
  try {
    const { error } = await supabase.from('dossiers').upsert(toRow(d, userId), { onConflict: 'id' })
    if (error) logger.warn('[dossierSync] push error:', error.message)
  } catch (e) {
    logger.warn('[dossierSync] push failed:', e instanceof Error ? e.message : e)
  }
}

/** Récupère les dossiers du user depuis Supabase (pour fusion en local). */
export async function hydrateDossiersFromCloud(): Promise<Dossier[]> {
  if (!supabase) return []
  const userId = await uid()
  if (!userId) return []
  try {
    const { data, error } = await supabase
      .from('dossiers')
      .select('id, nom_client, rccm, ncc, exercice_n, exercice_n1, regime, statut, created_at, updated_at')
      .eq('user_id', userId)
    if (error || !data) return []
    return (data as DossierRow[]).map(fromRow)
  } catch {
    return []
  }
}
