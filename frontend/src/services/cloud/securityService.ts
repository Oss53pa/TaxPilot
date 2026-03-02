/**
 * Security Service — MFA, Session Management, Security Policies
 * Supabase Auth supports TOTP-based MFA natively.
 */

import { supabase } from '@/config/supabase'

// ============================================================
// MFA (Multi-Factor Authentication) via TOTP
// ============================================================

/**
 * Enroll user in TOTP MFA — returns QR code URI and secret
 */
export async function enrollMFA(): Promise<{
  id: string
  totp: { qr_code: string; secret: string; uri: string }
} | null> {
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    friendlyName: "Liass'Pilot Authenticator",
  })
  if (error) {
    console.error('MFA enroll error:', error)
    return null
  }
  return data
}

/**
 * Verify TOTP code to complete MFA enrollment
 */
export async function verifyMFA(factorId: string, code: string): Promise<boolean> {
  const { data: challenge, error: challengeErr } = await supabase.auth.mfa.challenge({
    factorId,
  })
  if (challengeErr) return false

  const { error: verifyErr } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.id,
    code,
  })
  return !verifyErr
}

/**
 * Unenroll (remove) MFA factor
 */
export async function unenrollMFA(factorId: string): Promise<boolean> {
  const { error } = await supabase.auth.mfa.unenroll({ factorId })
  return !error
}

/**
 * Get enrolled MFA factors
 */
export async function getMFAFactors() {
  const { data, error } = await supabase.auth.mfa.listFactors()
  if (error) return []
  return data?.totp ?? []
}

/**
 * Check if user has MFA enabled
 */
export async function hasMFAEnabled(): Promise<boolean> {
  const factors = await getMFAFactors()
  return factors.some(f => f.status === 'verified')
}

/**
 * Get current MFA assurance level
 */
export async function getMFAAssuranceLevel(): Promise<'aal1' | 'aal2'> {
  const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  return data?.currentLevel ?? 'aal1'
}

// ============================================================
// Session Management
// ============================================================

const SESSION_TIMEOUT_KEY = 'fiscasync_session_timeout'
const DEFAULT_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes

let sessionTimer: ReturnType<typeof setTimeout> | null = null

/**
 * Start session timeout monitoring
 */
export function startSessionMonitor(onTimeout: () => void, timeoutMs?: number): void {
  const timeout = timeoutMs ?? getSessionTimeoutMs()
  resetSessionTimer(onTimeout, timeout)

  // Reset on user activity
  const events = ['mousedown', 'keydown', 'touchstart', 'scroll']
  const resetHandler = () => resetSessionTimer(onTimeout, timeout)
  events.forEach(e => document.addEventListener(e, resetHandler, { passive: true }))
}

/**
 * Stop session monitoring
 */
export function stopSessionMonitor(): void {
  if (sessionTimer) {
    clearTimeout(sessionTimer)
    sessionTimer = null
  }
}

function resetSessionTimer(onTimeout: () => void, timeoutMs: number): void {
  if (sessionTimer) clearTimeout(sessionTimer)
  sessionTimer = setTimeout(onTimeout, timeoutMs)
  localStorage.setItem(SESSION_TIMEOUT_KEY, String(Date.now() + timeoutMs))
}

function getSessionTimeoutMs(): number {
  return DEFAULT_TIMEOUT_MS
}

/**
 * Check if session has timed out (e.g., after tab becomes active)
 */
export function isSessionExpired(): boolean {
  const expiresAt = localStorage.getItem(SESSION_TIMEOUT_KEY)
  if (!expiresAt) return false
  return Date.now() > parseInt(expiresAt, 10)
}

// ============================================================
// Password Policy
// ============================================================

export interface PasswordStrength {
  score: number   // 0-4
  label: string
  suggestions: string[]
}

export function evaluatePassword(password: string): PasswordStrength {
  let score = 0
  const suggestions: string[] = []

  if (password.length >= 8) score++
  else suggestions.push('Au moins 8 caracteres')

  if (password.length >= 12) score++

  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  else suggestions.push('Melanger majuscules et minuscules')

  if (/\d/.test(password)) score++
  else suggestions.push('Ajouter au moins un chiffre')

  if (/[^A-Za-z0-9]/.test(password)) score++
  else suggestions.push('Ajouter un caractere special')

  const labels = ['Tres faible', 'Faible', 'Moyen', 'Fort', 'Tres fort']
  return { score: Math.min(score, 4), label: labels[Math.min(score, 4)], suggestions }
}

// ============================================================
// Security headers (CSP) — for reference
// These should be set in Supabase Edge Function or hosting config
// ============================================================

export const RECOMMENDED_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://*.supabase.co",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://*.supabase.co",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')
