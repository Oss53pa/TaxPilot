/**
 * AtlasStudioRedirect — redirige vers le portail centralisé Atlas Studio
 * pour les routes auth qui ne sont pas gérées localement.
 */
import React, { useEffect } from 'react'
import { Box, Paper, Typography, Button } from '@mui/material'
import { OpenInNew } from '@mui/icons-material'

interface Props {
  destination: 'forgot-password' | 'reset-password' | 'signup' | 'portal'
  message?: string
}

const DEST: Record<Props['destination'], string> = {
  signup: 'https://atlas-studio.org/portal/signup',
  'forgot-password': 'https://atlas-studio.org/portal/forgot-password',
  'reset-password': 'https://atlas-studio.org/portal/reset-password',
  portal: 'https://atlas-studio.org/portal',
}

export const AtlasStudioRedirect: React.FC<Props> = ({ destination, message }) => {
  const url = DEST[destination]
  useEffect(() => {
    const t = setTimeout(() => {
      window.location.href = url
    }, 1500)
    return () => clearTimeout(t)
  }, [url])

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        bgcolor: 'background.default',
      }}
    >
      <Paper sx={{ p: 4, maxWidth: 420, textAlign: 'center' }} elevation={3}>
        <Box
          sx={{
            width: 64,
            height: 64,
            mx: 'auto',
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            bgcolor: 'primary.50',
            color: 'primary.main',
          }}
        >
          <OpenInNew sx={{ fontSize: 32 }} />
        </Box>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
          Redirection Atlas Studio
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {message || 'La gestion de compte est centralisée sur le portail Atlas Studio.'}
        </Typography>
        <Button
          href={url}
          variant="contained"
          fullWidth
          size="large"
          sx={{ mb: 1 }}
        >
          Continuer
        </Button>
        <Typography variant="caption" color="text.secondary">
          Redirection automatique…
        </Typography>
      </Paper>
    </Box>
  )
}

export default AtlasStudioRedirect
