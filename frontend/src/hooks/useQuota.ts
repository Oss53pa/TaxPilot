import { useAuthStore } from '@/store/authStore'
import { supabase, isSupabaseEnabled } from '@/lib/supabase'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface Subscription {
  id: string
  plan: 'starter' | 'business' | 'enterprise'
  liassesUsed: number
  liassesLimit: number
  usersLimit: number
  storageUsedMb: number
  storageLimitMb: number
  trialEndsAt: string | null
  isActive: boolean
}

export interface QuotaStatus {
  canGenerate: boolean
  liassesUsed: number
  liassesLimit: number
  percentUsed: number
  isTrialExpired: boolean
  isUnlimited: boolean
  warningLevel: 'none' | 'warning' | 'critical' | 'blocked'
}

function mapSubscription(row: Record<string, unknown>): Subscription {
  return {
    id: row.id as string,
    plan: row.plan as Subscription['plan'],
    liassesUsed: Number(row.liasses_used || 0),
    liassesLimit: Number(row.liasses_limit || 2),
    usersLimit: Number(row.users_limit || 1),
    storageUsedMb: Number(row.storage_used_mb || 0),
    storageLimitMb: Number(row.storage_limit_mb || 100),
    trialEndsAt: row.trial_ends_at as string | null,
    isActive: row.is_active as boolean,
  }
}

export function useSubscription() {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async (): Promise<Subscription | null> => {
      if (!isSupabaseEnabled || !supabase || !user) return null

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) return null
      return mapSubscription(data)
    },
    enabled: !!user,
    staleTime: 60 * 1000, // 1 minute
  })
}

export function useQuota(): QuotaStatus {
  const { data: sub } = useSubscription()

  if (!sub) {
    return {
      canGenerate: false,
      liassesUsed: 0,
      liassesLimit: 0,
      percentUsed: 0,
      isTrialExpired: false,
      isUnlimited: false,
      warningLevel: 'blocked',
    }
  }

  const isUnlimited = sub.plan === 'enterprise'
  const isTrialExpired = sub.trialEndsAt ? new Date(sub.trialEndsAt) < new Date() : false
  const percentUsed = isUnlimited ? 0 : Math.round((sub.liassesUsed / sub.liassesLimit) * 100)

  let canGenerate = sub.isActive && !isTrialExpired
  if (!isUnlimited) {
    canGenerate = canGenerate && sub.liassesUsed < sub.liassesLimit
  }

  let warningLevel: QuotaStatus['warningLevel'] = 'none'
  if (!canGenerate) warningLevel = 'blocked'
  else if (percentUsed >= 90) warningLevel = 'critical'
  else if (percentUsed >= 80) warningLevel = 'warning'

  return {
    canGenerate,
    liassesUsed: sub.liassesUsed,
    liassesLimit: sub.liassesLimit,
    percentUsed,
    isTrialExpired,
    isUnlimited,
    warningLevel,
  }
}

export function useIncrementLiasseCount() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      if (!isSupabaseEnabled || !supabase || !user) {
        throw new Error('Service non disponible')
      }

      const { data, error } = await supabase.rpc('increment_liasse_count', {
        p_user_id: user.id,
      })

      if (error) throw new Error(error.message)

      const result = data as { success: boolean; error?: string; used?: number; limit?: number }
      if (!result.success) {
        switch (result.error) {
          case 'QUOTA_EXCEEDED':
            throw new Error(`Quota atteint : ${result.used}/${result.limit} liasses utilisées`)
          case 'TRIAL_EXPIRED':
            throw new Error('Période d\'essai expirée. Passez à un plan payant.')
          case 'SUBSCRIPTION_INACTIVE':
            throw new Error('Abonnement inactif. Contactez le support.')
          default:
            throw new Error('Erreur de quota')
        }
      }

      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
    },
  })
}
