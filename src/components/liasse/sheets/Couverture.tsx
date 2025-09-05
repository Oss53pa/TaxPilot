/**
 * Page de Couverture - Liasse Fiscale SYSCOHADA
 */

import React from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  Chip,
  Stack,
  Avatar,
  Card,
  CardContent,
  useTheme,
  alpha,
} from '@mui/material'
import {
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  AccountBalance as AccountBalanceIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
} from '@mui/icons-material'

interface CouvertureProps {
  data?: {
    entreprise?: {
      raisonSociale?: string
      formeJuridique?: string
      capitalSocial?: number
      rccm?: string
      ifu?: string
      adresse?: string
      telephone?: string
      email?: string
    }
    exercice?: {
      debut?: string
      fin?: string
      duree?: number
    }
    declaration?: {
      type?: string
      regime?: string
      dateDepot?: string
      numeroDeclaration?: string
    }
  }
}

const Couverture: React.FC<CouvertureProps> = ({ data = {} }) => {
  const theme = useTheme()
  const currentYear = new Date().getFullYear()
  
  // Données par défaut si non fournies
  const defaultData = {
    entreprise: {
      raisonSociale: 'ENTREPRISE EXEMPLE SA',
      formeJuridique: 'Société Anonyme (SA)',
      capitalSocial: 100000000,
      rccm: 'RB/COT/2020/B/1234',
      ifu: '3202010123456',
      adresse: '01 BP 1234 Cotonou, Bénin',
      telephone: '+229 21 31 00 00',
      email: 'contact@entreprise.bj',
      ...data.entreprise
    },
    exercice: {
      debut: `01/01/${currentYear}`,
      fin: `31/12/${currentYear}`,
      duree: 12,
      ...data.exercice
    },
    declaration: {
      type: 'DÉCLARATION STATISTIQUE ET FISCALE',
      regime: 'Régime du Système Normal',
      dateDepot: new Date().toLocaleDateString('fr-FR'),
      numeroDeclaration: `DSF/${currentYear}/001`,
      ...data.declaration
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête avec logo République */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          RÉPUBLIQUE DU BÉNIN
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Fraternité - Justice - Travail
        </Typography>
        <Divider sx={{ width: '50%', mx: 'auto', mb: 3 }} />
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          MINISTÈRE DE L'ÉCONOMIE ET DES FINANCES
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          DIRECTION GÉNÉRALE DES IMPÔTS
        </Typography>
      </Box>

      {/* Titre principal */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
          borderLeft: `4px solid ${theme.palette.primary.main}`,
        }}
      >
        <Typography
          variant="h3"
          align="center"
          sx={{
            fontWeight: 700,
            color: theme.palette.primary.main,
            mb: 2,
            textTransform: 'uppercase',
          }}
        >
          Liasse Fiscale
        </Typography>
        <Typography
          variant="h5"
          align="center"
          sx={{ fontWeight: 500, color: 'text.secondary' }}
        >
          {defaultData.declaration.type}
        </Typography>
        <Typography
          variant="h6"
          align="center"
          sx={{ fontWeight: 400, mt: 2, color: 'text.secondary' }}
        >
          Exercice {currentYear}
        </Typography>
      </Paper>

      {/* Informations de l'entreprise */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                width: 56,
                height: 56,
                mr: 2,
              }}
            >
              <BusinessIcon fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {defaultData.entreprise.raisonSociale}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {defaultData.entreprise.formeJuridique}
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    CAPITAL SOCIAL
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {defaultData.entreprise.capitalSocial.toLocaleString('fr-FR')} FCFA
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    RCCM
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {defaultData.entreprise.rccm}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    IFU
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {defaultData.entreprise.ifu}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    ADRESSE
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {defaultData.entreprise.adresse}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    TÉLÉPHONE
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {defaultData.entreprise.telephone}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    EMAIL
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {defaultData.entreprise.email}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Informations de l'exercice et de la déclaration */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Exercice Comptable
                </Typography>
              </Box>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    PÉRIODE
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Du {defaultData.exercice.debut} au {defaultData.exercice.fin}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    DURÉE
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {defaultData.exercice.duree} mois
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Déclaration
                </Typography>
              </Box>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    RÉGIME FISCAL
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {defaultData.declaration.regime}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    NUMÉRO DE DÉCLARATION
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {defaultData.declaration.numeroDeclaration}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    DATE DE DÉPÔT
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {defaultData.declaration.dateDepot}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Statut de conformité */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Chip
          icon={<CheckIcon />}
          label="DÉCLARATION CONFORME AUX NORMES SYSCOHADA RÉVISÉ"
          color="success"
          sx={{ fontSize: '0.9rem', py: 2.5, px: 2 }}
        />
      </Box>

      {/* Note de bas de page */}
      <Box sx={{ mt: 6, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          Cette liasse fiscale est établie conformément aux dispositions du Système Comptable OHADA (SYSCOHADA) révisé
          et aux exigences de la Direction Générale des Impôts du Bénin.
        </Typography>
      </Box>
    </Box>
  )
}

export default Couverture