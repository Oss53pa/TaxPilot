/**
 * LoginPage.tsx — Page de connexion Liass'Pilot (Nordic Slate)
 *
 * Layout vitrine en deux volets :
 *  - Volet de marque (gauche, md+) : dégradé charcoal→teal, wordmark Grand Hotel,
 *    promesse produit + preuves chiffrées, halos décoratifs.
 *  - Volet formulaire (droite) : connexion épurée, accent teal, focus rings.
 * Sur mobile, le volet de marque se replie en en-tête compact.
 */
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  CircularProgress,
} from '@mui/material'
import { CheckRounded, AutoAwesome } from '@mui/icons-material'
import { useAuth } from '@/hooks/useAuth'
import { fiscasyncPalette as P, gradients, shadows } from '@/theme/fiscasyncTheme'

const FONT_BRAND = '"Grand Hotel", cursive'
const FONT_BODY = '"Dosis", "Inter", "Exo 2", sans-serif'

const PROOFS = [
  'Liasse SYSCOHADA complète en quelques minutes',
  '169 contrôles de cohérence automatiques',
  'Export Excel conforme DGI — 84 onglets',
  'Pensé pour les 17 pays de l’espace OHADA',
]

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login, error: authError, isLoading, clearError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState('')

  const error = localError || authError

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')
    clearError()
    try {
      await login(email, password)
    } catch (err: any) {
      setLocalError(err.message || 'Erreur de connexion')
    }
  }

  const fieldSx = {
    mb: 2.5,
    '& .MuiOutlinedInput-root': {
      borderRadius: 2.5,
      bgcolor: P.white,
      '& fieldset': { borderColor: P.primary200 },
      '&:hover fieldset': { borderColor: P.primary300 },
      '&.Mui-focused fieldset': { borderColor: P.teal, borderWidth: 1.5 },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: P.teal },
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', fontFamily: FONT_BODY }}>
      {/* ── Volet de marque (gauche) — md+ ── */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: '1 1 52%',
          position: 'relative',
          overflow: 'hidden',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: gradients.brandPanel,
          color: P.white,
          px: 7,
          py: 6,
        }}
      >
        {/* Halos décoratifs */}
        <Box
          sx={{
            position: 'absolute', top: '-12%', right: '-8%',
            width: 460, height: 460, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(94,234,212,0.16) 0%, rgba(94,234,212,0) 70%)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute', bottom: '-18%', left: '-10%',
            width: 520, height: 520, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(15,118,110,0.28) 0%, rgba(15,118,110,0) 70%)',
            pointerEvents: 'none',
          }}
        />
        {/* Grille fine */}
        <Box
          sx={{
            position: 'absolute', inset: 0, opacity: 0.5, pointerEvents: 'none',
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
            maskImage: 'radial-gradient(120% 100% at 30% 20%, #000 30%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(120% 100% at 30% 20%, #000 30%, transparent 80%)',
          }}
        />

        {/* Haut : wordmark */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography sx={{ fontFamily: FONT_BRAND, fontSize: '2.6rem', lineHeight: 1, color: P.white }}>
            Liass'Pilot
          </Typography>
          <Box
            sx={{
              display: 'inline-flex', alignItems: 'center', gap: 0.7, mt: 1.5,
              px: 1.5, py: 0.5, borderRadius: 999,
              bgcolor: 'rgba(94,234,212,0.10)', border: '1px solid rgba(94,234,212,0.25)',
            }}
          >
            <AutoAwesome sx={{ fontSize: 14, color: P.tealLight }} />
            <Typography sx={{ fontSize: '0.74rem', fontWeight: 600, letterSpacing: '0.08em', color: P.tealLight, textTransform: 'uppercase' }}>
              Solution Fiscale OHADA
            </Typography>
          </Box>
        </Box>

        {/* Milieu : promesse + preuves */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            sx={{
              fontFamily: FONT_BODY, fontWeight: 700, lineHeight: 1.2,
              fontSize: { md: '2rem', lg: '2.4rem' }, color: P.white, mb: 1,
            }}
          >
            Votre balance entre.
            <br />
            <Box
              component="span"
              sx={{
                background: gradients.tealText,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontStyle: 'italic',
                fontWeight: 600,
              }}
            >
              Votre liasse sort.
            </Box>
          </Typography>
          <Typography sx={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.62)', maxWidth: 420, mb: 4 }}>
            La production, le contrôle et la télédéclaration de votre liasse fiscale,
            réunis dans un seul outil.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.6 }}>
            {PROOFS.map((p) => (
              <Box key={p} sx={{ display: 'flex', alignItems: 'center', gap: 1.4 }}>
                <Box
                  sx={{
                    width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: 'rgba(94,234,212,0.14)', border: '1px solid rgba(94,234,212,0.3)',
                  }}
                >
                  <CheckRounded sx={{ fontSize: 15, color: P.tealLight }} />
                </Box>
                <Typography sx={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.86)' }}>{p}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Bas : preuve sociale */}
        <Typography sx={{ position: 'relative', zIndex: 1, fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)' }}>
          Rejoint par 500+ entreprises en Afrique · Archivage SHA-256
        </Typography>
      </Box>

      {/* ── Volet formulaire (droite) ── */}
      <Box
        sx={{
          flex: '1 1 48%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 3, sm: 6 },
          py: 6,
          bgcolor: P.primary50,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          {/* Wordmark mobile (volet de marque masqué) */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, textAlign: 'center', mb: 4 }}>
            <Typography sx={{ fontFamily: FONT_BRAND, fontSize: '2.4rem', color: P.primary900, lineHeight: 1 }}>
              Liass'Pilot
            </Typography>
          </Box>

          <Typography sx={{ fontFamily: FONT_BODY, fontSize: '1.6rem', fontWeight: 700, color: P.primary900, mb: 0.5 }}>
            Bon retour
          </Typography>
          <Typography sx={{ fontFamily: FONT_BODY, fontSize: '0.92rem', color: P.primary500, mb: 4 }}>
            Connectez-vous pour reprendre votre liasse.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Adresse email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              sx={fieldSx}
            />
            <TextField
              fullWidth
              label="Mot de passe"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              sx={{ ...fieldSx, mb: 1.5 }}
            />

            <Box sx={{ textAlign: 'right', mb: 3 }}>
              <Link
                component="button"
                type="button"
                onClick={() => navigate('/forgot-password')}
                sx={{
                  fontFamily: FONT_BODY, fontSize: '0.84rem', color: P.primary600,
                  textDecoration: 'none', '&:hover': { color: P.teal, textDecoration: 'underline' },
                }}
              >
                Mot de passe oublié ?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{
                mb: 3,
                height: 50,
                fontSize: '0.98rem',
                fontWeight: 600,
                fontFamily: FONT_BODY,
                letterSpacing: '0.02em',
                textTransform: 'none',
                background: gradients.teal,
                color: '#ffffff',
                borderRadius: 2.5,
                boxShadow: shadows.xs,
                '&:hover': {
                  background: gradients.teal,
                  boxShadow: shadows.tealHalo,
                  transform: 'translateY(-1px)',
                },
                '&.Mui-disabled': { background: P.primary300, color: '#ffffff' },
              }}
            >
              {isLoading ? <CircularProgress size={22} sx={{ color: '#ffffff' }} /> : 'Se connecter'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontFamily: FONT_BODY, fontSize: '0.88rem', color: P.primary500 }}>
                Pas de compte ?{' '}
                <Link
                  component="button"
                  type="button"
                  onClick={() => navigate('/register')}
                  sx={{
                    fontFamily: FONT_BODY, color: P.teal, fontWeight: 600,
                    textDecoration: 'none', '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  S'inscrire
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default LoginPage
