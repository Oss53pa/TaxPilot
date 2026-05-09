/**
 * LoginPage.tsx — Page de connexion Liass'Pilot (Nordic Slate)
 */
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  CircularProgress,
} from '@mui/material'
import { useAuth } from '@/hooks/useAuth'
import { fiscasyncPalette as P } from '@/theme/fiscasyncTheme'

const FONT_BRAND = '"Grand Hotel", cursive'
const FONT_BODY = '"Dosis", "Inter", "Exo 2", sans-serif'

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

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: P.primary50,
        fontFamily: FONT_BODY,
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 440,
          width: '100%',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
          border: `1px solid ${P.primary200}`,
          borderRadius: 3,
          bgcolor: '#ffffff',
        }}
      >
        <CardContent sx={{ p: { xs: 4, sm: 5 } }}>
          {/* Logo / Brand */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              sx={{
                fontFamily: FONT_BRAND,
                fontSize: '2.4rem',
                color: P.primary900,
                lineHeight: 1,
                mb: 0.75,
              }}
            >
              Liass'Pilot
            </Typography>
            <Typography
              sx={{
                fontFamily: FONT_BODY,
                fontSize: '0.85rem',
                color: P.primary500,
                fontWeight: 500,
                letterSpacing: '0.02em',
              }}
            >
              Solution Fiscale OHADA
            </Typography>
          </Box>

          {/* Error */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Adresse email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': { borderColor: P.primary200 },
                  '&:hover fieldset': { borderColor: P.primary300 },
                  '&.Mui-focused fieldset': { borderColor: P.teal, borderWidth: 1.5 },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: P.teal },
              }}
            />
            <TextField
              fullWidth
              label="Mot de passe"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': { borderColor: P.primary200 },
                  '&:hover fieldset': { borderColor: P.primary300 },
                  '&.Mui-focused fieldset': { borderColor: P.teal, borderWidth: 1.5 },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: P.teal },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{
                mb: 2.5,
                height: 48,
                fontSize: '0.95rem',
                fontWeight: 600,
                fontFamily: FONT_BODY,
                letterSpacing: '0.02em',
                textTransform: 'none',
                bgcolor: P.teal,
                color: '#ffffff',
                borderRadius: 2,
                boxShadow: '0 1px 2px rgba(15,118,110,0.15)',
                '&:hover': {
                  bgcolor: P.tealDark,
                  boxShadow: '0 4px 12px rgba(15,118,110,0.25)',
                },
                '&.Mui-disabled': { bgcolor: P.primary300, color: '#ffffff' },
              }}
            >
              {isLoading ? (
                <CircularProgress size={22} sx={{ color: '#ffffff' }} />
              ) : (
                'Se connecter'
              )}
            </Button>

            <Box sx={{ textAlign: 'center', mb: 1.5 }}>
              <Link
                component="button"
                type="button"
                onClick={() => navigate('/forgot-password')}
                sx={{
                  fontFamily: FONT_BODY,
                  fontSize: '0.85rem',
                  color: P.primary600,
                  textDecoration: 'none',
                  '&:hover': { color: P.teal, textDecoration: 'underline' },
                }}
              >
                Mot de passe oublié ?
              </Link>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontFamily: FONT_BODY, fontSize: '0.85rem', color: P.primary500 }}>
                Pas de compte ?{' '}
                <Link
                  component="button"
                  type="button"
                  onClick={() => navigate('/register')}
                  sx={{
                    fontFamily: FONT_BODY,
                    color: P.teal,
                    fontWeight: 600,
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  S'inscrire
                </Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default LoginPage
