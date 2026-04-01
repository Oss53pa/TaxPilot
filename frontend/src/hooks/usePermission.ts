import { useAuthStore } from '@/store/authStore'
import { supabase, isSupabaseEnabled } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'

export type Role = 'owner' | 'admin' | 'comptable' | 'auditeur' | 'viewer'
export type Permission =
  | 'create:dossier'
  | 'update:dossier'
  | 'delete:dossier'
  | 'create:liasse'
  | 'update:liasse'
  | 'delete:liasse'
  | 'export:liasse'
  | 'run:audit'
  | 'manage:members'
  | 'manage:subscription'
  | 'view:audit_log'
  | 'view:dossier'
  | 'view:liasse'

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: [
    'create:dossier', 'update:dossier', 'delete:dossier',
    'create:liasse', 'update:liasse', 'delete:liasse', 'export:liasse',
    'run:audit', 'manage:members', 'manage:subscription',
    'view:audit_log', 'view:dossier', 'view:liasse',
  ],
  admin: [
    'create:dossier', 'update:dossier', 'delete:dossier',
    'create:liasse', 'update:liasse', 'delete:liasse', 'export:liasse',
    'run:audit', 'manage:members',
    'view:audit_log', 'view:dossier', 'view:liasse',
  ],
  comptable: [
    'create:dossier', 'update:dossier',
    'create:liasse', 'update:liasse', 'export:liasse',
    'run:audit',
    'view:audit_log', 'view:dossier', 'view:liasse',
  ],
  auditeur: [
    'run:audit',
    'view:audit_log', 'view:dossier', 'view:liasse',
  ],
  viewer: [
    'view:dossier', 'view:liasse',
  ],
}

export function useUserRole() {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async (): Promise<Role> => {
      if (!isSupabaseEnabled || !supabase || !user) return 'viewer'

      const { data, error } = await supabase
        .from('organization_members')
        .select('role')
        .eq('user_id', user.id)
        .limit(1)
        .single()

      if (error || !data) {
        // No org membership found — treat as owner in entreprise mode (self-managed)
        return 'owner'
      }

      return data.role as Role
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  })
}

export function usePermission(permission: Permission): boolean {
  const { data: role } = useUserRole()
  if (!role) return false
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function useHasRole(minimumRole: Role): boolean {
  const roleHierarchy: Role[] = ['viewer', 'auditeur', 'comptable', 'admin', 'owner']
  const { data: userRole } = useUserRole()
  if (!userRole) return false
  return roleHierarchy.indexOf(userRole) >= roleHierarchy.indexOf(minimumRole)
}
