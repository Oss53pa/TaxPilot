/**
 * proph3t.ts — Intégration Atlas Studio « Proph3t core » pour Liass'Pilot.
 * ----------------------------------------------------------------------------
 * Le cœur IA mutualisé d'Atlas Studio (« Proph3t core ») est hébergé sur le
 * projet Supabase `vgtmljfayiysuvrcmunt`. Toutes les apps satellites s'y
 * connectent pour : mémoire inter-apps, RAG SYSCOHADA/OHADA/CGI, outils
 * centraux, audit chaîné SHA-256 — et, en option, déléguer un tour complet à
 * l'orchestrateur hébergé.
 *
 * PRODUCT = "taxpilot" : id de cette app au catalogue Atlas Studio. Le core
 * normalise les alias (taxpilot→liasspilot) automatiquement — ne pas inventer
 * d'autre id.
 *
 * DEUX MODES, complémentaires :
 *   A) Fédération (SDK @atlas-studio/proph3t-client) → l'agent local garde son
 *      LLM/moteur ; le core fournit recall / searchKnowledge / runTool /
 *      logAudit. Le SDK est chargé en import dynamique OPTIONNEL : Mode A
 *      s'active automatiquement dès `npm i @atlas-studio/proph3t-client`, sans
 *      casser le build tant que le paquet n'est pas publié.
 *   B) Hébergé (POST proph3t-ask) → on délègue tout le tour au core, avec
 *      gouvernance par SENSIBILITÉ des données. Aucune dépendance externe :
 *      `askProph3t()` fonctionne immédiatement.
 *
 * 2 variables d'env pointent sur le CORE (PAS le Supabase de cette app) :
 *   VITE_ATLAS_SUPABASE_URL=https://vgtmljfayiysuvrcmunt.supabase.co
 *   VITE_ATLAS_SUPABASE_ANON_KEY=<anon key du core>   (jamais committée)
 *
 * GARDE-FOU : aucune donnée `confidential` (liasses, paie, relevés, contrats)
 * ne doit partir vers un provider à rétention. `askProph3t(..., "confidential")`
 * laisse le core router vers Ollama/Claude uniquement.
 */

// ⚠️ `supabase` = le client Supabase de CETTE app (pour récupérer le JWT user).
// Il peut être `null` en mode local (localStorage uniquement).
import { supabase } from './supabase'

/** Id de cette app au catalogue Atlas Studio (le core normalise → liasspilot). */
export const PRODUCT = 'taxpilot'

const ATLAS_CORE_URL = import.meta.env.VITE_ATLAS_SUPABASE_URL as string | undefined
const ATLAS_CORE_ANON = import.meta.env.VITE_ATLAS_SUPABASE_ANON_KEY as string | undefined

/** true si les 2 variables du CORE sont configurées (sinon : pas d'appel core). */
export const isProph3tCoreConfigured = !!(ATLAS_CORE_URL && ATLAS_CORE_ANON)

/** JWT de la session Supabase de l'app — passé au core pour que la RLS s'applique. */
async function getUserToken(): Promise<string | undefined> {
  if (!supabase) return undefined
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token
}

// ============================================================
// MODE B — Hébergé : déléguer tout le tour à proph3t-ask
// ============================================================

export type Sensitivity = 'confidential' | 'internal' | 'public'

export interface AskResult {
  conversation_id: string
  answer: string
  citations: unknown[]
  confidence: number
  disclaimer?: string
}

/**
 * Pose une question à l'orchestrateur Proph3t hébergé.
 *
 * `sensitivity` gouverne les providers autorisés côté core :
 *   - "confidential" (DÉFAUT de cette app) → Ollama + Claude uniquement
 *     (aucune rétention). Pour liasses fiscales, paie, relevés, due diligence.
 *   - "internal" / "public" → tous providers selon dispo.
 *
 * Lève une erreur explicite si le core n'est pas configuré (pas de fuite
 * silencieuse vers un tier).
 */
export async function askProph3t(params: {
  message: string
  sensitivity?: Sensitivity
  conversationId?: string
  societyId?: string
}): Promise<AskResult> {
  if (!ATLAS_CORE_URL || !ATLAS_CORE_ANON) {
    throw new Error(
      'Proph3t core non configuré : définissez VITE_ATLAS_SUPABASE_URL et ' +
        'VITE_ATLAS_SUPABASE_ANON_KEY (projet core, pas le Supabase de cette app).',
    )
  }

  const token = await getUserToken()
  const res = await fetch(`${ATLAS_CORE_URL}/functions/v1/proph3t-ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: ATLAS_CORE_ANON,
      Authorization: `Bearer ${token ?? ATLAS_CORE_ANON}`,
    },
    body: JSON.stringify({
      message: params.message,
      product: PRODUCT,
      // Défaut "confidential" : cette app manipule des liasses fiscales.
      sensitivity: params.sensitivity ?? 'confidential',
      conversation_id: params.conversationId,
      society_id: params.societyId,
    }),
  })

  if (!res.ok) {
    throw new Error(`proph3t-ask ${res.status}: ${await res.text()}`)
  }
  return res.json() as Promise<AskResult>
}

// ============================================================
// MODE A — Fédération : enrichissement via le SDK (chargé dynamiquement)
// ============================================================

/**
 * Surface minimale du client de fédération exposée par
 * `@atlas-studio/proph3t-client`. Déclarée localement pour ne pas dépendre des
 * types du paquet tant qu'il n'est pas installé.
 */
export interface Proph3tFederationClient {
  recall(args: { query: string; limit?: number }): Promise<unknown>
  searchKnowledge(args: {
    query: string
    sourceType?: string
    topK?: number
  }): Promise<unknown>
  runTool(args: { name: string; args: Record<string, unknown> }): Promise<unknown>
  logAudit(args: {
    action: string
    subjectType?: string
    subjectId?: string
    content?: unknown
  }): Promise<unknown>
}

/**
 * Construit un client Proph3t fédéré, scopé sur l'utilisateur courant.
 *
 * Le SDK `@atlas-studio/proph3t-client` est chargé en import dynamique
 * optionnel : tant qu'il n'est pas installé, cette fonction lève une erreur
 * claire (le reste de l'app — dont Mode B — n'est pas impacté et le build
 * reste vert).
 *
 * @param societyId  société/tenant courant (multi-tenant), optionnel.
 */
export async function getProph3t(
  societyId?: string,
): Promise<Proph3tFederationClient> {
  if (!ATLAS_CORE_URL || !ATLAS_CORE_ANON) {
    throw new Error(
      'Proph3t core non configuré (VITE_ATLAS_SUPABASE_URL / VITE_ATLAS_SUPABASE_ANON_KEY).',
    )
  }

  // Specifier non littéral + @vite-ignore : le bundler ne tente pas de résoudre
  // le paquet au build. `npm i @atlas-studio/proph3t-client` active Mode A.
  const sdk = '@atlas-studio/proph3t-client'
  let mod: { Proph3tClient: new (cfg: unknown) => Proph3tFederationClient }
  try {
    mod = (await import(/* @vite-ignore */ sdk)) as typeof mod
  } catch {
    throw new Error(
      'Mode A (fédération) indisponible : exécutez ' +
        '`npm i @atlas-studio/proph3t-client` pour activer le SDK.',
    )
  }

  const token = await getUserToken()
  return new mod.Proph3tClient({
    product: PRODUCT,
    supabaseUrl: ATLAS_CORE_URL,
    apiKey: ATLAS_CORE_ANON,
    userToken: token, // RLS appliquée ; sans token → endpoints publics seulement
    societyId,
  })
}

/* — Exemples d'usage (mode A, une fois le SDK installé) ————————————————

  const proph3t = await getProph3t(societyId)

  // Mémoire inter-apps Atlas
  const past = await proph3t.recall({ query: userMessage, limit: 5 })

  // Ancrer un prompt dans le savoir partagé (SYSCOHADA/OHADA/CGI)
  const refs = await proph3t.searchKnowledge({ query: userMessage, sourceType: 'syscohada', topK: 5 })

  // Déléguer un calcul lourd à un outil central
  const r = await proph3t.runTool({ name: 'compute_irpp_uemoa', args: { salaire_brut: 500_000, pays: 'CI' } })

  // Tracer dans l'audit chaîné (conformité OHADA, archivage 10 ans)
  await proph3t.logAudit({ action: 'generate_liasse_fiscale', subjectType: 'society', subjectId: societyId, content: { exercice: 2025 } })

———————————————————————————————————————————————————————————————————————— */
