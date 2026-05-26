/**
 * AcceptInvitationPage.tsx — Activation d'un compte collaborateur invité.
 *
 * URL produite par l'edge function `invite-user` :
 *   /auth/accept-invite?token_hash=<hash>&type=invite|recovery&email=<email>
 *
 * Flux (conforme à la demande métier) :
 *   1. Vérification du lien via supabase.auth.verifyOtp({ token_hash, type })
 *      → confirme l'email ET ouvre une session (1re authentification).
 *   2. L'utilisateur définit son mot de passe + confirmation (≥ 8 caractères).
 *   3. supabase.auth.updateUser({ password }) puis redirection vers /dashboard.
 *
 * Sécurité :
 *   - Le token_hash est à usage unique et vérifié côté serveur (anti-prefetch).
 *   - Aucune session n'est ouverte sans token_hash valide.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  LinearProgress,
  Chip,
  Stack,
} from '@mui/material'
import { CheckCircleOutline, Lock as LockIcon, MarkEmailRead } from '@mui/icons-material'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { userManagementService } from '@/services/userManagementService'
import { logger } from '@/utils/logger'

interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4
  label: string
  color: 'error' | 'warning' | 'info' | 'success'
}

function evaluatePassword(pwd: string): PasswordStrength {
  let score = 0
  if (pwd.length >= 8) score++
  if (pwd.length >= 12) score++
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++
  if (/\d/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  const clamped = Math.min(4, score) as 0 | 1 | 2 | 3 | 4
  const labels: Record<typeof clamped, PasswordStrength> = {
    0: { score: 0, label: 'Très faible', color: 'error' },
    1: { score: 1, label: 'Faible', color: 'error' },
    2: { score: 2, label: 'Moyen', color: 'warning' },
    3: { score: 3, label: 'Bon', color: 'info' },
    4: { score: 4, label: 'Excellent', color: 'success' },
  }
  return labels[clamped]
}

const palette = {
  bg: '#f1f5f4',
  border: '#e2e8e6',
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  accent: '#0f766e',
  accentHover: '#115e59',
}

type Phase = 'verifying' | 'set-password' | 'done' | 'error'

const Shell: React.FC<{ children: React.ReactNode; maxWidth?: number }> = ({ children, maxWidth = 520 }) => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: palette.bg,
      p: 3,
    }}
  >
    <Card sx={{ maxWidth, width: '100%', border: `1px solid ${palette.border}`, borderRadius: 2 }}>
      <CardContent sx={{ p: 4 }}>{children}</CardContent>
    </Card>
  </Box>
)

const AcceptInvitationPage: React.FC = () => {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const initialize = useAuthStore((s) => s.initialize)

  const tokenHash = params.get('token_hash') || ''
  const rawType = params.get('type') || 'invite'
  const otpType = (rawType === 'recovery' ? 'recovery' : 'invite') as 'invite' | 'recovery'
  const email = params.get('email') || ''

  const [phase, setPhase] = useState<Phase>('verifying')
  const [errorMessage, setErrorMessage] = useState('')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // ── Étape 1 : vérification du lien (confirme email + ouvre session) ──
  useEffect(() => {
    let cancelled = false
    async function verify() {
      if (!supabase) {
        setPhase('error')
        setErrorMessage('Service indisponible (cloud non configuré).')
        return
      }
      if (!tokenHash) {
        setPhase('error')
        setErrorMessage("Lien d'invitation invalide : jeton manquant.")
        return
      }
      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: otpType,
        })
        if (error) throw new Error(error.message)
        if (cancelled) return
        await initialize()
        setPhase('set-password')
      } catch (err) {
        if (cancelled) return
        logger.error('[AcceptInvitation] verifyOtp error:', err)
        setPhase('error')
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "Ce lien d'invitation est invalide ou a expiré.",
        )
      }
    }
    void verify()
    return () => {
      cancelled = true
    }
  }, [tokenHash, otpType, initialize])

  const strength = useMemo(() => evaluatePassword(password), [password])
  const passwordsMatch = password.length > 0 && password === confirmPassword
  const passwordValid = password.length >= 8

  // ── Étape 2 : enregistrement du mot de passe ──
  const handleSetPassword = async () => {
    setSubmitError(null)
    if (!passwordValid) {
      setSubmitError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (!passwordsMatch) {
      setSubmitError('Les deux mots de passe ne correspondent pas.')
      return
    }
    if (!supabase) {
      setSubmitError('Service indisponible.')
      return
    }
    try {
      setSubmitting(true)
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw new Error(error.message)
      // Marque la connexion (last_login_at + statut actif) — best-effort.
      await userManagementService.touchLogin()
      await initialize()
      setPhase('done')
      setTimeout(() => navigate('/dashboard', { replace: true }), 1500)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement.")
    } finally {
      setSubmitting(false)
    }
  }

  if (phase === 'verifying') {
    return (
      <Shell maxWidth={420}>
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <CircularProgress sx={{ color: palette.accent, mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: palette.textPrimary, mb: 0.5 }}>
            Liass'Pilot
          </Typography>
          <Typography variant="body2" sx={{ color: palette.textSecondary }}>
            Vérification de votre invitation…
          </Typography>
        </Box>
      </Shell>
    )
  }

  if (phase === 'error') {
    return (
      <Shell maxWidth={480}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
        <Button fullWidth variant="outlined" onClick={() => navigate('/login')}>
          Retour à la connexion
        </Button>
      </Shell>
    )
  }

  if (phase === 'done') {
    return (
      <Shell maxWidth={480}>
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <CheckCircleOutline sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: palette.textPrimary }}>
            Compte activé
          </Typography>
          <Typography variant="body2" sx={{ color: palette.textSecondary, mb: 3 }}>
            Vous accédez à votre espace Liass'Pilot…
          </Typography>
          <CircularProgress size={24} sx={{ color: palette.accent }} />
        </Box>
      </Shell>
    )
  }

  // phase === 'set-password'
  return (
    <Shell>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: palette.textPrimary, mb: 0.5 }}>
          Liass'Pilot
        </Typography>
        <Typography variant="body2" sx={{ color: palette.textMuted }}>
          Finalisez l'activation de votre compte
        </Typography>
      </Box>

      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3, color: 'success.main' }}>
        <MarkEmailRead fontSize="small" />
        <Typography variant="body2" sx={{ color: palette.textSecondary }}>
          Email confirmé{email && (
            <>
              {' : '}
              <Chip label={email} size="small" sx={{ ml: 0.5 }} />
            </>
          )}
        </Typography>
      </Stack>

      {submitError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {submitError}
        </Alert>
      )}

      <Box component="form" onSubmit={(e) => { e.preventDefault(); void handleSetPassword() }}>
        <Typography
          variant="body2"
          sx={{ color: palette.textSecondary, mb: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <LockIcon fontSize="small" />
          Définissez votre mot de passe pour accéder à l'application
        </Typography>

        <TextField
          fullWidth
          label="Mot de passe"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          helperText="Minimum 8 caractères"
          sx={{ mb: 1 }}
        />
        {password.length > 0 && (
          <Box sx={{ mb: 2.5 }}>
            <LinearProgress
              variant="determinate"
              value={(strength.score / 4) * 100}
              color={strength.color}
              sx={{ height: 4, borderRadius: 2 }}
            />
            <Typography variant="caption" sx={{ color: palette.textMuted, mt: 0.5, display: 'block' }}>
              Force du mot de passe : {strength.label}
            </Typography>
          </Box>
        )}

        <TextField
          fullWidth
          label="Confirmer le mot de passe"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          error={confirmPassword.length > 0 && !passwordsMatch}
          helperText={confirmPassword.length > 0 && !passwordsMatch ? 'Les mots de passe ne correspondent pas' : ' '}
          sx={{ mb: 3 }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={submitting || !passwordValid || !passwordsMatch}
          sx={{
            height: 48,
            bgcolor: palette.accent,
            color: '#ffffff',
            fontWeight: 600,
            '&:hover': { bgcolor: palette.accentHover },
          }}
        >
          {submitting ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Activer mon compte'}
        </Button>
      </Box>
    </Shell>
  )
}

export default AcceptInvitationPage
