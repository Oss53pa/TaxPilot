/**
 * Page de Couverture - Liasse Fiscale SYSCOHADA
 */

import React from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Stack,
  Card,
  CardContent,
  Divider,
  useTheme,
  alpha,
} from '@mui/material'
import {
  Business as BusinessIcon,
  Description as DocumentIcon,
  AccountBalance,
  CalendarToday as CalendarIcon,
  AccountBalance as TaxIcon,
} from '@mui/icons-material'

const CouvertureSYSCOHADA: React.FC = () => {
  const theme = useTheme()
  const currentYear = new Date().getFullYear()

  return (
    <Box sx={{ p: 3 }}>
      <Paper
        elevation={0}
        sx={{
          p: 6,
          backgroundColor: '#ffffff',
          border: `2px solid ${theme.palette.primary.main}`,
          position: 'relative',
          minHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* En-tête officiel */}
        <Box sx={{ position: 'absolute', top: 40, width: '100%', textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, letterSpacing: 1 }}>
            RÉPUBLIQUE DU CAMEROUN
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Paix - Travail - Patrie
          </Typography>
          <Divider sx={{ mt: 2, mx: 'auto', width: '60%' }} />
        </Box>

        {/* Titre principal */}
        <Stack spacing={4} alignItems="center" sx={{ mt: -10 }}>
          <Box sx={{ 
            p: 3, 
            border: `3px solid ${theme.palette.primary.main}`,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.primary.main, 0.03)
          }}>
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 700,
                color: theme.palette.primary.main,
                textAlign: 'center',
                letterSpacing: 2
              }}
            >
              LIASSE FISCALE
            </Typography>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 500,
                textAlign: 'center',
                mt: 2,
                color: theme.palette.text.secondary
              }}
            >
              SYSTÈME NORMAL
            </Typography>
          </Box>

          {/* Système comptable */}
          <Card sx={{ 
            width: '80%', 
            backgroundColor: alpha(theme.palette.info.main, 0.05),
            border: `1px solid ${theme.palette.info.main}`
          }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                <AccountBalance sx={{ fontSize: 40, color: theme.palette.info.main }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    SYSTÈME COMPTABLE OHADA RÉVISÉ
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Acte uniforme relatif au droit comptable et à l'information financière
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Exercice fiscal */}
          <Card sx={{ width: '60%' }}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                  <CalendarIcon color="primary" />
                  <Typography variant="h6">
                    EXERCICE FISCAL {currentYear}
                  </Typography>
                </Stack>
                <Divider />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Du : 01/01/{currentYear}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Au : 31/12/{currentYear}
                    </Typography>
                  </Grid>
                </Grid>
              </Stack>
            </CardContent>
          </Card>

          {/* Informations de conformité */}
          <Box sx={{ 
            mt: 4, 
            p: 3, 
            backgroundColor: alpha(theme.palette.warning.main, 0.05),
            border: `1px solid ${theme.palette.warning.main}`,
            borderRadius: 1,
            width: '80%'
          }}>
            <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
              DÉCLARATION CONFORME
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2">
                  • Loi de Finances {currentYear}
                </Typography>
                <Typography variant="body2">
                  • Code Général des Impôts
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  • Système Comptable OHADA Révisé
                </Typography>
                <Typography variant="body2">
                  • Acte Uniforme OHADA
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Stack>

        {/* Pied de page */}
        <Box sx={{ position: 'absolute', bottom: 40, width: '100%', textAlign: 'center' }}>
          <Divider sx={{ mb: 2, mx: 'auto', width: '60%' }} />
          <Typography variant="caption" color="textSecondary">
            Direction Générale des Impôts - Ministère des Finances
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}

export default CouvertureSYSCOHADA