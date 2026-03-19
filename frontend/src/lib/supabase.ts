/**
 * supabase.ts — P2-1: Client Supabase initialisé depuis les variables d'environnement
 * Architecture frontend-only : pas de backend propriétaire.
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Variables VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY non configurées. ' +
    'L\'app fonctionne en mode local (localStorage uniquement).'
  )
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

/** true si Supabase est configuré et disponible */
export const isSupabaseEnabled = !!supabase
