/**
 * useTenantPlan — Plan / abonnement actif du tenant courant.
 *
 * Deux plans existent pour Liass'Pilot :
 *   - liass_pilot_entreprise : mono-societe, features cabinet verrouillees
 *   - liass_pilot_cabinet    : multi-societes, toutes les features cabinet
 *
 * Le plan est lu depuis la table Supabase `subscriptions` (migration 005).
 * Fallback : `entreprise` (le plus restrictif) si aucun plan n'est charge.
 */
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase, isSupabaseEnabled } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

export type TenantPlanSlug = 'liass_pilot_entreprise' | 'liass_pilot_cabinet'

/** Features Cabinet — verrouillees sur le plan Entreprise */
export type CabinetFeature =
  | 'multi_societes_illimite'
  | 'tableau_de_bord_portefeuille'
  | 'export_groupe_multi_clients'
  | 'branding_cabinet'
  | 'comparaison_inter_societes'
  | 'rapport_synthetique_cabinet'
  | 'gestion_equipe_cabinet'
  | 'support_dedie'

export interface TenantPlan {
  slug: TenantPlanSlug
  /** Nom lisible du plan ("Entreprise", "Cabinet") */
  displayName: string
  /** Liste des feature keys incluses dans le plan */
  features_included: CabinetFeature[]
  /** Nombre max de societes/dossiers. null = illimite */
  max_companies: number | null
  /** Nombre max d'utilisateurs actifs. null = illimite */
  max_users: number | null
}

/** Features incluses dans le plan Entreprise (toutes cabinet-only sont absentes) */
const ENTREPRISE_FEATURES: CabinetFeature[] = []

/** Features incluses dans le plan Cabinet (toutes) */
const CABINET_FEATURES: CabinetFeature[] = [
  'multi_societes_illimite',
  'tableau_de_bord_portefeuille',
  'export_groupe_multi_clients',
  'branding_cabinet',
  'comparaison_inter_societes',
  'rapport_synthetique_cabinet',
  'gestion_equipe_cabinet',
  'support_dedie',
]

/** Fallback Entreprise — utilise si Supabase indisponible ou pas de plan */
const DEFAULT_ENTREPRISE_PLAN: TenantPlan = {
  slug: 'liass_pilot_entreprise',
  displayName: 'Entreprise',
  features_included: ENTREPRISE_FEATURES,
  max_companies: 1,
  max_users: 5,
}

const DEFAULT_CABINET_PLAN: TenantPlan = {
  slug: 'liass_pilot_cabinet',
  displayName: 'Cabinet',
  features_included: CABINET_FEATURES,
  max_companies: null,
  max_users: null,
}

interface SubscriptionRow {
  plan: string
  users_limit: number | null
}

async function fetchTenantPlan(userId: string | undefined): Promise<TenantPlan> {
  if (!isSupabaseEnabled || !supabase || !userId) {
    return DEFAULT_ENTREPRISE_PLAN
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .select('plan, users_limit')
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data) {
    return DEFAULT_ENTREPRISE_PLAN
  }

  const row = data as SubscriptionRow
  const planRaw = (row.plan || '').toLowerCase()

  // Only explicit cabinet plans unlock cabinet features.
  // `business` / `enterprise` from the generic subscriptions schema map
  // to Entreprise by default unless the slug explicitly says "cabinet".
  const isCabinet =
    planRaw.includes('cabinet') || planRaw === 'liass_pilot_cabinet'

  if (isCabinet) {
    return {
      ...DEFAULT_CABINET_PLAN,
      max_users: row.users_limit ?? null,
    }
  }

  return {
    ...DEFAULT_ENTREPRISE_PLAN,
    max_users: row.users_limit ?? 5,
  }
}

/**
 * Vérifie auprès de Supabase si l'utilisateur peut créer un dossier
 * supplémentaire selon son quota plan. Source de vérité = trigger
 * BEFORE INSERT côté DB (migration 014 plan_gating). Le résultat est
 * mis en cache 60 s pour éviter un round-trip à chaque ouverture du
 * formulaire de création.
 *
 * Retourne :
 *  - `true`  : peut créer (quota non atteint, NULL = pas d'enforcement, ou -1 illimité)
 *  - `false` : quota atteint OU Supabase indisponible / user non auth (defensive)
 */
async function fetchCanCreateDossier(userId: string | undefined): Promise<boolean> {
  if (!isSupabaseEnabled || !supabase || !userId) {
    return true // fallback permissive (le trigger DB reste la source de vérité finale)
  }
  const { data, error } = await supabase.rpc('can_create_dossier', { p_user_id: userId })
  if (error) {
    // RPC non déployée encore (migrations en retard) ou erreur réseau → fallback permissive.
    // Le trigger BEFORE INSERT côté DB rattrapera tout abus.
    return true
  }
  return data === true
}

/**
 * Hook exposant le plan actif + helpers de verification.
 */
export function useTenantPlan() {
  const { user } = useAuthStore()

  const { data: plan, isLoading } = useQuery({
    queryKey: ['tenant-plan', user?.id],
    queryFn: () => fetchTenantPlan(user?.id),
    staleTime: 5 * 60 * 1000, // 5 min
    enabled: !!user,
  })

  const { data: canCreate, isLoading: canCreateLoading } = useQuery({
    queryKey: ['can-create-dossier', user?.id],
    queryFn: () => fetchCanCreateDossier(user?.id),
    staleTime: 60 * 1000, // 1 min — court car le quota change quand un dossier est ajouté/supprimé
    enabled: !!user,
  })

  const activePlan = plan ?? DEFAULT_ENTREPRISE_PLAN

  return useMemo(
    () => ({
      plan: activePlan,
      isLoading: isLoading || canCreateLoading,
      /** Retourne true si la feature est incluse dans le plan actif */
      hasFeature: (feature: CabinetFeature): boolean =>
        activePlan.features_included.includes(feature),
      /** Retourne true si le plan actif est Cabinet */
      isCabinet: activePlan.slug === 'liass_pilot_cabinet',
      /** Retourne true si le plan actif est Entreprise */
      isEntreprise: activePlan.slug === 'liass_pilot_entreprise',
      /**
       * Peut-on créer un dossier supplémentaire ?
       * Source de vérité = RPC `can_create_dossier` (trigger DB derrière).
       * Default `true` si le hook n'a pas encore résolu (UX optimiste).
       */
      canCreateDossier: canCreate ?? true,
    }),
    [activePlan, isLoading, canCreate, canCreateLoading]
  )
}
