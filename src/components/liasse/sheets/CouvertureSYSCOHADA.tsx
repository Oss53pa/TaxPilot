/**
 * Page de Couverture - Liasse Fiscale SYSCOHADA
 * Connectée à la configuration entreprise
 */

import React, { useState, useEffect } from 'react'
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
  AccountBalance,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material'
import { useLiasseData } from '../DataProvider'
import { entrepriseService } from '../../../services/entrepriseService'

const CouvertureSYSCOHADA: React.FC = () => {
  const theme = useTheme()
  const liasseData = useLiasseData()
  const [entreprise, setEntreprise] = useState<any>(null)

  useEffect(() => {
    // Charger depuis le context liasse ou directement depuis le service
    if (liasseData?.entreprise) {
      setEntreprise(liasseData.entreprise)
    } else {
      loadEntreprise()
    }
  }, [liasseData?.entreprise])

  const loadEntreprise = async () => {
    try {
      const res = await entrepriseService.getEntreprises({ page_size: 1 })
      const ent = (res as any)?.results?.[0] || null
      if (ent) setEntreprise(ent)
    } catch (e) {
      console.warn('Could not load entreprise for couverture:', e)
    }
  }

  const raisonSociale = entreprise?.raison_sociale || ''
  const formeJuridique = entreprise?.forme_juridique || ''
  const pays = entreprise?.pays_detail?.nom || entreprise?.pays || ''
  const ville = entreprise?.ville || ''
  const numeroContribuable = entreprise?.numero_contribuable || ''
  const rccm = entreprise?.rccm || ''
  const regimeImposition = entreprise?.regime_imposition || ''
  const secteurActivite = entreprise?.secteur_activite || ''

  // Devise depuis la config
  const deviseLabel = entreprise?.devise_principale_detail?.nom || entreprise?.devise_principale || 'XOF'

  // Exercice fiscal - prendre depuis liasse ou année en cours
  const exerciceYear = liasseData?.exercice?.annee || new Date().getFullYear()
  const dateDebut = liasseData?.exercice?.date_debut || `01/01/${exerciceYear}`
  const dateFin = liasseData?.exercice?.date_fin || `31/12/${exerciceYear}`

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
            {pays ? `RÉPUBLIQUE DU ${pays.toUpperCase()}` : 'RÉPUBLIQUE'}
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

          {/* Informations de l'entreprise */}
          {raisonSociale && (
            <Card sx={{
              width: '80%',
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
              border: `1px solid ${theme.palette.primary.main}`
            }}>
              <CardContent>
                <Stack spacing={1} alignItems="center">
                  <BusinessIcon sx={{ fontSize: 36, color: theme.palette.primary.main }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center' }}>
                    {raisonSociale}
                  </Typography>
                  {formeJuridique && (
                    <Typography variant="h6" color="textSecondary">
                      {formeJuridique}
                    </Typography>
                  )}
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    {numeroContribuable && (
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ textAlign: 'center' }}>
                          <strong>N° Contribuable :</strong> {numeroContribuable}
                        </Typography>
                      </Grid>
                    )}
                    {rccm && (
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ textAlign: 'center' }}>
                          <strong>RCCM :</strong> {rccm}
                        </Typography>
                      </Grid>
                    )}
                    {ville && (
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ textAlign: 'center' }}>
                          <strong>Siège :</strong> {ville}{pays ? `, ${pays}` : ''}
                        </Typography>
                      </Grid>
                    )}
                    {secteurActivite && (
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ textAlign: 'center' }}>
                          <strong>Secteur :</strong> {secteurActivite}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Stack>
              </CardContent>
            </Card>
          )}

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
                  {deviseLabel && (
                    <Typography variant="body2" color="textSecondary">
                      Monnaie de présentation : {deviseLabel}
                    </Typography>
                  )}
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
                    EXERCICE FISCAL {exerciceYear}
                  </Typography>
                </Stack>
                <Divider />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Du : {dateDebut}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Au : {dateFin}
                    </Typography>
                  </Grid>
                </Grid>
                {regimeImposition && (
                  <>
                    <Divider />
                    <Typography variant="body2" sx={{ textAlign: 'center' }}>
                      <strong>Régime d'imposition :</strong> {regimeImposition}
                    </Typography>
                  </>
                )}
              </Stack>
            </CardContent>
          </Card>
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
