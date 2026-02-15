import { logger } from '@/utils/logger'
/**
 * Page de Couverture - Liasse Fiscale SYSCOHADA
 */

import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Stack,
  Card,
  CardContent,
  TextField,
  Divider,
  useTheme,
  alpha,
} from '@mui/material'
import {
  AccountBalance,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material'
import EditableToolbar from '../shared/EditableToolbar'

const CouvertureSYSCOHADA: React.FC = () => {
  const theme = useTheme()
  const currentYear = new Date().getFullYear()
  const [isEditMode, setIsEditMode] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const [coverData, setCoverData] = useState({
    pays: 'RÉPUBLIQUE DU CAMEROUN',
    devise: 'Paix - Travail - Patrie',
    regime: 'SYSTÈME NORMAL',
    systeme: 'SYSTÈME COMPTABLE OHADA RÉVISÉ',
    dateDebut: `01/01/${currentYear}`,
    dateFin: `31/12/${currentYear}`,
  })

  const updateField = (field: string, value: string) => {
    setCoverData(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const renderField = (field: string, value: string, variant: 'h6' | 'body2' | 'h5' | 'h4' = 'body2', sx?: object) => {
    if (isEditMode) {
      return (
        <TextField
          value={value}
          onChange={(e) => updateField(field, e.target.value)}
          size="small"
          fullWidth
          variant="outlined"
          sx={{ ...sx }}
        />
      )
    }
    return <Typography variant={variant} sx={sx}>{value}</Typography>
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Toolbar */}
      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
        <EditableToolbar
          isEditMode={isEditMode}
          onToggleEdit={() => setIsEditMode(!isEditMode)}
          hasChanges={hasChanges}
          onSave={() => { logger.debug('Sauvegarde couverture', coverData); setHasChanges(false) }}
        />
      </Stack>

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
          {renderField('pays', coverData.pays, 'h6', { fontWeight: 600, letterSpacing: 1 })}
          <Box sx={{ mt: 1 }}>
            {renderField('devise', coverData.devise, 'body2')}
          </Box>
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
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              {renderField('regime', coverData.regime, 'h4', {
                fontWeight: 500,
                color: theme.palette.text.secondary,
              })}
            </Box>
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
                  {renderField('systeme', coverData.systeme, 'h5', { fontWeight: 600 })}
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
                    {isEditMode ? (
                      <TextField
                        label="Du"
                        value={coverData.dateDebut}
                        onChange={(e) => updateField('dateDebut', e.target.value)}
                        size="small"
                        fullWidth
                      />
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Du : {coverData.dateDebut}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={6}>
                    {isEditMode ? (
                      <TextField
                        label="Au"
                        value={coverData.dateFin}
                        onChange={(e) => updateField('dateFin', e.target.value)}
                        size="small"
                        fullWidth
                      />
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Au : {coverData.dateFin}
                      </Typography>
                    )}
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
