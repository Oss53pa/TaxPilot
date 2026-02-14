/**
 * Page de connexion TaxPilot
 */

import { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Link,
  Divider,
  CircularProgress,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  AccountBalance,
  Email,
  Lock,
} from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useAuthStore } from '@/store/authStore'

// Schéma de validation
const loginSchema = yup.object({
  username: yup
    .string()
    .required('Nom d\'utilisateur requis'),
  password: yup
    .string()
    .min(3, 'Mot de passe trop court')
    .required('Mot de passe requis'),
})

interface LoginFormData {
  username: string
  password: string
}

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading, error } = useAuthStore()

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema) as any,
    mode: 'onChange',
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.username, data.password)
    } catch (err: any) {
      // L'erreur est déjà gérée dans le store
      console.error('Erreur de connexion:', err)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #171717 0%, #525252 100%)',
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: '100%',
          boxShadow: 3,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Logo et titre */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <AccountBalance
              sx={{
                fontSize: 48,
                color: 'primary.main',
                mb: 2,
              }}
            />
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
              TaxPilot
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Solution Fiscale OHADA
            </Typography>
          </Box>

          {/* Erreur d'authentification */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Formulaire de connexion */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Nom d'utilisateur"
                  type="text"
                  error={!!errors.username}
                  helperText={errors.username?.message}
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Mot de passe"
                  type={showPassword ? 'text' : 'password'}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={!isValid || isLoading}
              sx={{
                mb: 2,
                height: 48,
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Se connecter'
              )}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Link href="#" variant="body2" color="primary">
                Mot de passe oublié ?
              </Link>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Informations de démo */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Mode Démonstration
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Utilisateur : admin
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Mot de passe : admin123
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Login