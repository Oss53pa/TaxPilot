/**
 * ForgotPasswordPage.tsx — P2-3: Page de réinitialisation de mot de passe
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
import { resetPassword } from '@/services/supabaseAuthService'

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)
    try {
      await resetPassword(email)
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#fafafa',
      }}
    >
      <Card
        sx={{
          maxWidth: 420,
          width: '100%',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: '1px solid #e5e5e5',
          borderRadius: 2,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, color: '#171717', mb: 0.5 }}
            >
              Liass'Pilot
            </Typography>
            <Typography variant="body2" sx={{ color: '#737373' }}>
              Réinitialiser le mot de passe
            </Typography>
          </Box>

          {/* Success */}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Un email de réinitialisation a été envoyé à {email}
            </Alert>
          )}

          {/* Error */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          {!success && (
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Adresse email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  mb: 2,
                  height: 48,
                  fontSize: '1rem',
                  fontWeight: 600,
                  bgcolor: '#171717',
                  color: '#fafafa',
                  '&:hover': { bgcolor: '#404040' },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: '#fafafa' }} />
                ) : (
                  'Envoyer le lien'
                )}
              </Button>
            </Box>
          )}

          <Box sx={{ textAlign: 'center', mt: success ? 0 : undefined }}>
            <Link
              component="button"
              type="button"
              variant="body2"
              onClick={() => navigate('/login')}
              sx={{ color: '#171717', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              Retour à la connexion
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default ForgotPasswordPage
