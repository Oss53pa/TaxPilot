import { logger } from '@/utils/logger'
/**
 * Page de connexion TaxPilot - Design élégant et cohérent
 */

import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Container,
  InputAdornment,
  IconButton,
  Grid,
  Stack,
  Fade,
  Paper,
} from '@mui/material'
import {
  AccountCircle,
  Lock,
  Visibility,
  VisibilityOff,
  AccountBalance,
  TrendingUp,
  Security,
  Speed,
  CheckCircle,
  Star,
} from '@mui/icons-material'
import { useAuthStore } from '../../store/authStore'
import { useNavigate } from 'react-router-dom'

const Login: React.FC = () => {
  const navigate = useNavigate()
  const { login, isLoading, error, clearError } = useAuthStore()
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  // Témoignages clients
  const testimonials = [
    {
      text: "TaxPilot a révolutionné notre approche comptable. 80% de temps gagné sur nos liasses fiscales.",
      author: "Marie Dubois",
      role: "Expert-Comptable, Cabinet Expertise Plus",
      rating: 5
    },
    {
      text: "Interface intuitive, conformité SYSCOHADA parfaite. Un outil indispensable pour notre cabinet.",
      author: "Paul Kamdem",
      role: "DAF, Groupe Industriel Cameroun",
      rating: 5
    },
    {
      text: "Les audits automatiques détectent des erreurs qu'on n'aurait jamais vues manuellement.",
      author: "Fatou Seck",
      role: "Comptable Générale, Dakar Solutions",
      rating: 5
    }
  ]

  // Rotation des témoignages
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) clearError()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await login(formData.username, formData.password)
      navigate('/dashboard')
    } catch (err) {
      logger.error('Erreur de connexion:', err)
    }
  }

  const handleAutoLogin = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/auto-login/', {
        method: 'POST',
      })
      const data = await response.json()

      if (data.tokens && data.tokens.access) {
        // Sauvegarder les tokens
        localStorage.setItem('access_token', data.tokens.access)
        localStorage.setItem('refresh_token', data.tokens.refresh)
        localStorage.setItem('user', JSON.stringify(data.user))

        // Rediriger vers le dashboard
        navigate('/dashboard')
      }
    } catch (err) {
      logger.error('Erreur auto-login:', err)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fafafa 0%, #F5F5F5 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Arrière-plan décoratif avec les couleurs TaxPilot */}
      <Box
        sx={{
          position: 'absolute',
          top: '-50%',
          right: '-20%',
          width: '80%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(23, 23, 23, 0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          zIndex: 0,
        }}
      />
      
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: 4 }}>
        <Grid container sx={{ minHeight: '100vh', alignItems: 'center' }}>
          {/* Section gauche - Branding et témoignages */}
          <Grid item xs={12} lg={7} sx={{ display: { xs: 'none', lg: 'block' } }}>
            <Box sx={{ pr: 8, color: 'text.primary' }}>
              {/* Logo et titre avec couleurs TaxPilot */}
              <Fade in timeout={800}>
                <Box sx={{ mb: 6 }}>
                  <Stack direction="row" alignItems="center" spacing={3} sx={{ mb: 3 }}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        backgroundColor: '#171717',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 32px rgba(23, 23, 23, 0.3)',
                      }}
                    >
                      <AccountBalance sx={{ fontSize: 32, color: '#FFFFFF' }} />
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.02em', color: 'text.primary' }}>
                      TaxPilot
                    </Typography>
                  </Stack>
                  
                  <Typography variant="h4" sx={{ mb: 3, fontWeight: 300, color: 'text.primary' }}>
                    L'excellence comptable à portée de clic
                  </Typography>
                  
                  <Typography variant="h6" sx={{ mb: 4, color: 'text.secondary', lineHeight: 1.6 }}>
                    Révolutionnez votre pratique comptable avec la solution SYSCOHADA 
                    la plus avancée d'Afrique. Intelligence artificielle, conformité garantie, 
                    et productivité maximale.
                  </Typography>
                </Box>
              </Fade>

              {/* Statistiques avec couleurs TaxPilot */}
              <Fade in timeout={1000}>
                <Grid container spacing={3} sx={{ mb: 6 }}>
                  {[
                    { value: '17', label: 'Pays OHADA', icon: <TrendingUp />, color: 'text.primary' },
                    { value: '99.9%', label: 'Précision', icon: <Speed />, color: 'text.primary' },
                    { value: '80%', label: 'Gain temps', icon: <Security />, color: 'text.primary' },
                  ].map((stat, index) => (
                    <Grid item xs={4} key={index}>
                      <Paper
                        elevation={3}
                        sx={{
                          p: 3,
                          textAlign: 'center',
                          backgroundColor: '#FFFFFF',
                          borderRadius: 3,
                          border: '1px solid #e5e5e5',
                          transition: 'transform 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 24px rgba(23, 23, 23, 0.15)',
                          },
                        }}
                      >
                        <Box sx={{ color: stat.color, mb: 1 }}>
                          {stat.icon}
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                          {stat.value}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {stat.label}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Fade>

              {/* Témoignage client avec couleurs TaxPilot */}
              <Fade in timeout={1200}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 4,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 3,
                    border: '1px solid #e5e5e5',
                  }}
                >
                  <Box sx={{ display: 'flex', mb: 2 }}>
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <Star key={i} sx={{ color: 'text.primary', fontSize: 20 }} />
                    ))}
                  </Box>
                  <Typography variant="body1" sx={{ mb: 3, fontStyle: 'italic', lineHeight: 1.6, color: 'text.primary' }}>
                    "{testimonials[currentTestimonial].text}"
                  </Typography>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {testimonials[currentTestimonial].author}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {testimonials[currentTestimonial].role}
                    </Typography>
                  </Box>
                </Paper>
              </Fade>
            </Box>
          </Grid>

          {/* Section droite - Formulaire de connexion */}
          <Grid item xs={12} lg={5}>
            <Fade in timeout={600}>
              <Card
                elevation={24}
                sx={{
                  mx: { xs: 2, sm: 4, lg: 0 },
                  borderRadius: 4,
                  overflow: 'hidden',
                  background: 'rgba(255, 255, 255, 0.98)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <CardContent sx={{ p: 6 }}>
                  {/* En-tête */}
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                      Bienvenue
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Connectez-vous à votre espace TaxPilot
                    </Typography>
                  </Box>

                  {/* Alertes */}
                  {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                      {error}
                    </Alert>
                  )}

                  {/* Formulaire */}
                  <Box component="form" onSubmit={handleSubmit}>
                    <TextField
                      fullWidth
                      name="username"
                      label="Nom d'utilisateur"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AccountCircle sx={{ color: 'primary.main' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: '#f8fafc',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: '#f1f5f9',
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'white',
                            boxShadow: '0 0 0 3px rgba(23, 23, 23, 0.1)',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          fontWeight: 500,
                        },
                      }}
                    />

                    <TextField
                      fullWidth
                      name="password"
                      label="Mot de passe"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock sx={{ color: 'primary.main' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={togglePasswordVisibility}
                              disabled={isLoading}
                              sx={{ color: 'primary.main' }}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        mb: 4,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: '#f8fafc',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: '#f1f5f9',
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'white',
                            boxShadow: '0 0 0 3px rgba(23, 23, 23, 0.1)',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          fontWeight: 500,
                        },
                      }}
                    />

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={isLoading || !formData.username || !formData.password}
                      sx={{
                        height: 56,
                        borderRadius: 2,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        backgroundColor: '#171717',
                        boxShadow: '0 8px 32px rgba(23, 23, 23, 0.3)',
                        mb: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: '#262626',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 12px 40px rgba(23, 23, 23, 0.4)',
                        },
                        '&:active': {
                          transform: 'translateY(0)',
                        },
                      }}
                    >
                      {isLoading ? (
                        <>
                          <CircularProgress size={24} sx={{ mr: 2, color: 'white' }} />
                          Connexion...
                        </>
                      ) : (
                        'Se connecter'
                      )}
                    </Button>

                    <Button
                      type="button"
                      fullWidth
                      variant="outlined"
                      size="large"
                      onClick={handleAutoLogin}
                      disabled={isLoading}
                      sx={{
                        height: 48,
                        borderRadius: 2,
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        borderColor: '#22c55e',
                        color: 'success.main',
                        mb: 4,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(34, 197, 94, 0.08)',
                          borderColor: '#22c55e',
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      🚀 Connexion automatique (Dev)
                    </Button>
                  </Box>

                  {/* Section démo avec couleurs TaxPilot */}
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      backgroundColor: '#e5e5e5',
                      border: '1px solid #737373',
                      textAlign: 'center',
                      mb: 3,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                      🎯 Accès Démonstration
                    </Typography>
                    <Stack direction="row" justifyContent="space-around" alignItems="center">
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.primary' }}>Utilisateur</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>admin</Typography>
                      </Box>
                      <Box sx={{ color: 'text.secondary' }}>→</Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.primary' }}>Mot de passe</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>admin123</Typography>
                      </Box>
                    </Stack>
                  </Paper>

                  {/* Footer sécurité avec couleurs TaxPilot */}
                  <Box sx={{ textAlign: 'center' }}>
                    <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                      <Typography variant="body2" sx={{ fontWeight: 500, color: 'success.main' }}>
                        Connexion Sécurisée SSL
                      </Typography>
                    </Stack>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      TaxPilot v1.0.0 - Conforme SYSCOHADA & RGPD
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                      © 2025 Atlas Studio. Tous droits réservés.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default Login