/**
 * useUserRole — résout le rôle de l'utilisateur courant dans son organisation
 * et expose `isAdmin` pour le gating du module Paramètres.
 *
 * Règles :
 *   - Supabase indisponible (mode local mono-utilisateur)  → isAdmin = true.
 *   - Acheteur Atlas Studio sans appartenance              → on bootstrap son
 *     org (lp_ensure_org) puis role = 'admin' → isAdmin = true.
 *   - Collaborateur invité                                 → role réel
 *     (comptable/auditeur/viewer) → isAdmin = false ; 'admin' → true.
 */
import { useEffect, useState, useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'
import { userManagementService, type MemberRole } from '@/services/userManagementService'

interface UseUserRoleResult {
  role: MemberRole | null
  isAdmin: boolean
  loading: boolean
  refresh: () => Promise<void>
}

export function useUserRole(): UseUserRoleResult {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const userId = useAuthStore((s) => s.user?.id)
  const [role, setRole] = useState<MemberRole | null>(null)
  const [loading, setLoading] = useState(true)

  const resolve = useCallback(async () => {
    // Mode local : pas de Supabase → l'unique utilisateur est admin.
    if (!userManagementService.isAvailable()) {
      setRole('admin')
      setLoading(false)
      return
    }
    if (!isAuthenticated) {
      setRole(null)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      let r = await userManagementService.getMyRole()
      if (!r) {
        // Aucune appartenance : acheteur → bootstrap self-org en admin.
        await userManagementService.ensureOrg()
        r = await userManagementService.getMyRole()
      }
      setRole(r)
    } catch {
      // RPC indisponible (migration 015 pas encore déployée) ou réseau :
      // fallback PERMISSIF (admin) pour ne pas verrouiller l'acheteur hors
      // des Paramètres. La RLS reste la source de vérité côté serveur.
      setRole('admin')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    void resolve()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, userId])

  // Mode local : admin. Sinon admin ssi role === 'admin'.
  const isAdmin = !userManagementService.isAvailable() ? true : role === 'admin'

  return { role, isAdmin, loading, refresh: resolve }
}

export default useUserRole
