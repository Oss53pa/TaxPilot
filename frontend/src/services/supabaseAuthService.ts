/**
 * supabaseAuthService.ts — P2-3: Authentication via Supabase Auth
 * Fallback to localStorage mock auth if Supabase is not configured.
 */
import { supabase, isSupabaseEnabled } from '@/lib/supabase'

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
}

export async function signUp(email: string, password: string, firstName: string, lastName: string): Promise<AuthUser> {
  if (!isSupabaseEnabled || !supabase) {
    // Fallback: mock user stored in localStorage
    const user: AuthUser = { id: 'local-user', email, firstName, lastName }
    localStorage.setItem('fiscasync-auth-user', JSON.stringify(user))
    return user
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { first_name: firstName, last_name: lastName } },
  })
  if (error) throw new Error(error.message)
  if (!data.user) throw new Error('Inscription échouée')

  // Update profile
  await supabase.from('profiles').update({
    nom_entreprise: `${firstName} ${lastName}`,
  }).eq('id', data.user.id)

  return { id: data.user.id, email: data.user.email || email, firstName, lastName }
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  if (!isSupabaseEnabled || !supabase) {
    const stored = localStorage.getItem('fiscasync-auth-user')
    if (stored) return JSON.parse(stored)
    const user: AuthUser = { id: 'local-user', email, firstName: 'Utilisateur', lastName: 'Local' }
    localStorage.setItem('fiscasync-auth-user', JSON.stringify(user))
    return user
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
  if (!data.user) throw new Error('Connexion échouée')

  const meta = data.user.user_metadata || {}
  return {
    id: data.user.id,
    email: data.user.email || email,
    firstName: meta.first_name || '',
    lastName: meta.last_name || '',
  }
}

export async function signOut(): Promise<void> {
  if (!isSupabaseEnabled || !supabase) {
    localStorage.removeItem('fiscasync-auth-user')
    return
  }
  await supabase.auth.signOut()
}

export async function resetPassword(email: string): Promise<void> {
  if (!isSupabaseEnabled || !supabase) {
    throw new Error('Réinitialisation indisponible en mode local')
  }
  const { error } = await supabase.auth.resetPasswordForEmail(email)
  if (error) throw new Error(error.message)
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!isSupabaseEnabled || !supabase) {
    const stored = localStorage.getItem('fiscasync-auth-user')
    return stored ? JSON.parse(stored) : null
  }

  const { data } = await supabase.auth.getUser()
  if (!data.user) return null

  const meta = data.user.user_metadata || {}
  return {
    id: data.user.id,
    email: data.user.email || '',
    firstName: meta.first_name || '',
    lastName: meta.last_name || '',
  }
}
