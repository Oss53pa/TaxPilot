/**
 * NotFoundPage — 404 Nordic Slate.
 * Affichée en catch-all au lieu d'un Navigate silencieux vers '/' qui
 * désorientait l'utilisateur sur typo URL ou route renommée.
 */

import React from 'react'
import { Box, Button, Stack, Typography } from '@mui/material'
import { ArrowBack as ArrowBackIcon, Home as HomeIcon, Email as MailIcon } from '@mui/icons-material'
import { useLocation, useNavigate } from 'react-router-dom'
import { fiscasyncPalette as P } from '@/theme/fiscasyncTheme'

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: P.primary50,
      px: 3,
      textAlign: 'center',
    }}>
      {/* Eyebrow tag teal */}
      <Box sx={{
        display: 'inline-flex', alignItems: 'center', gap: 0.8,
        px: 1.5, py: 0.4, mb: 3,
        bgcolor: P.tealBg,
        border: `1px solid ${P.tealBorder}`,
        borderRadius: 999,
      }}>
        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: P.error }} />
        <Typography sx={{
          fontSize: '0.7rem', fontWeight: 600, color: P.tealDark,
          textTransform: 'uppercase', letterSpacing: 1.2,
        }}>
          Erreur · 404
        </Typography>
      </Box>

      <Typography sx={{
        fontSize: { xs: '5rem', md: '7rem' },
        fontWeight: 800,
        color: P.primary900,
        lineHeight: 1,
        letterSpacing: '-0.04em',
        fontVariantNumeric: 'tabular-nums',
      }}>
        404
      </Typography>

      <Typography sx={{
        fontSize: { xs: '1.4rem', md: '1.75rem' },
        fontWeight: 700,
        color: P.primary900,
        mt: 1, mb: 1,
      }}>
        Page introuvable
      </Typography>

      <Typography sx={{
        maxWidth: 520, color: P.primary600, fontSize: '0.95rem',
        lineHeight: 1.6, mb: 4,
      }}>
        L{'’'}adresse <Box component="code" sx={{
          bgcolor: P.primary100, px: 0.8, py: 0.2,
          borderRadius: 1, fontFamily: '"JetBrains Mono", monospace',
          fontSize: '0.85em', color: P.primary800,
        }}>{location.pathname}</Box> n{'’'}existe pas (ou plus). Elle a peut-être été
        déplacée, renommée, ou la page que vous cherchez n{'’'}est pas encore disponible.
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <Button
          variant="contained"
          size="large"
          startIcon={<HomeIcon />}
          onClick={() => navigate('/', { replace: true })}
          sx={{
            bgcolor: P.primary900, color: P.white,
            textTransform: 'none', fontWeight: 600, borderRadius: 999,
            px: 3, py: 1,
            '&:hover': { bgcolor: P.primary800 },
          }}
        >
          Retour à l{'’'}accueil
        </Button>
        <Button
          variant="outlined"
          size="large"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{
            borderColor: P.primary200, color: P.primary700, bgcolor: P.white,
            textTransform: 'none', fontWeight: 500, borderRadius: 999,
            px: 3, py: 1,
            '&:hover': {
              borderColor: P.teal, color: P.tealDark, bgcolor: P.tealBg,
            },
          }}
        >
          Page précédente
        </Button>
      </Stack>

      <Box sx={{
        display: 'inline-flex', alignItems: 'center', gap: 0.6,
        mt: 5, color: P.primary500, fontSize: '0.82rem',
      }}>
        <MailIcon sx={{ fontSize: 16 }} />
        <Typography sx={{ fontSize: 'inherit' }}>
          Un lien cassé ?{' '}
          <Box component="a" href="mailto:support@liasspilot.app" sx={{
            color: P.teal, textDecoration: 'none', fontWeight: 500,
            '&:hover': { textDecoration: 'underline', color: P.tealDark },
          }}>
            Signalez-le
          </Box>
        </Typography>
      </Box>
    </Box>
  )
}

export default NotFoundPage
