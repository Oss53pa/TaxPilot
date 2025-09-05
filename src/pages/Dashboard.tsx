/**
 * Page principale - Tableau de bord FiscaSync
 */

import React from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Chip,
  LinearProgress,
  Alert,
  Avatar,
  Divider,
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  Assessment,
  CloudUpload,
  Receipt,
  Warning,
  CheckCircle,
  AccountBalance,
} from '@mui/icons-material'
import { useAuthStore } from '@/store/authStore'
import { useAppSelector } from '@/store'
import { KPICard } from '@/types'

const Dashboard: React.FC = () => {
  const { user } = useAuthStore()
  const { currentAudit } = useAppSelector(state => state.audit)
  const { balances } = useAppSelector(state => state.balance)

  // KPIs factices pour la démo
  const kpis: KPICard[] = [
    {
      title: 'Balance Importée',
      value: balances.length || 0,
      change: 5.2,
      trend: 'up',
      color: 'primary',
    },
    {
      title: 'Score Audit',
      value: currentAudit?.score_global || 0,
      change: -2.1,
      trend: 'down',
      color: 'secondary',
    },
    {
      title: 'Anomalies Détectées',
      value: currentAudit?.nb_anomalies || 0,
      change: 0,
      trend: 'stable',
      color: 'warning',
    },
    {
      title: 'Liasses Générées',
      value: 12,
      change: 8.5,
      trend: 'up',
      color: 'success',
    },
  ]

  const renderKPICard = (kpi: KPICard) => (
    <Grid item xs={12} sm={6} md={3} key={kpi.title}>
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: `${kpi.color}.main` }}>
                {kpi.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {kpi.title}
              </Typography>
            </Box>
            
            {kpi.change !== undefined && (
              <Box sx={{ textAlign: 'right' }}>
                {kpi.trend === 'up' ? (
                  <TrendingUp color="success" />
                ) : kpi.trend === 'down' ? (
                  <TrendingDown color="error" />
                ) : (
                  <TrendingUp color="disabled" />
                )}
                <Typography
                  variant="caption"
                  sx={{
                    color: kpi.trend === 'up' ? 'success.main' : 
                           kpi.trend === 'down' ? 'error.main' : 'text.secondary',
                    fontWeight: 600,
                    display: 'block',
                  }}
                >
                  {kpi.change > 0 ? '+' : ''}{kpi.change}%
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Grid>
  )

  return (
    <Box>
      {/* En-tête */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Bonjour, {user?.first_name || user?.username} !
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Voici un aperçu de votre activité FiscaSync
        </Typography>
      </Box>

      {/* Alertes importantes */}
      <Box sx={{ mb: 3 }}>
        <Alert 
          severity="info" 
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small">
              Configurer
            </Button>
          }
        >
          Complétez le paramétrage de votre entreprise pour accéder à toutes les fonctionnalités
        </Alert>
      </Box>

      {/* KPIs */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpis.map(renderKPICard)}
      </Grid>

      {/* Contenu principal */}
      <Grid container spacing={3}>
        {/* Actions rapides */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Actions Rapides
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<CloudUpload />}
                  fullWidth
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Importer Balance
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Assessment />}
                  fullWidth
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Lancer Audit
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Receipt />}
                  fullWidth
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Générer Liasse
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* État de la balance */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                État de la Balance
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Lignes importées</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {balances.length.toLocaleString()}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={75} 
                  sx={{ mb: 1 }}
                />
                <Typography variant="caption" color="text.secondary">
                  Exercice 2024 - 75% complète
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle color="success" fontSize="small" />
                <Typography variant="body2">
                  Balance équilibrée
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Audit et conformité */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Audit et Conformité
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2">Score Global</Typography>
                  <Chip
                    label={`${currentAudit?.score_global || 0}/100`}
                    color={
                      (currentAudit?.score_global || 0) > 80 ? 'success' :
                      (currentAudit?.score_global || 0) > 60 ? 'warning' : 'error'
                    }
                    size="small"
                  />
                </Box>
                
                {currentAudit?.nb_anomalies ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Warning color="warning" fontSize="small" />
                    <Typography variant="body2" color="warning.main">
                      {currentAudit.nb_anomalies} anomalie(s) détectée(s)
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle color="success" fontSize="small" />
                    <Typography variant="body2" color="success.main">
                      Aucune anomalie détectée
                    </Typography>
                  </Box>
                )}
              </Box>

              <Button
                variant="outlined"
                size="small"
                startIcon={<Assessment />}
                fullWidth
              >
                Voir Détails Audit
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Activité récente */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Activité Récente
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1 }}>
                  <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32 }}>
                    <CloudUpload fontSize="small" />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2">
                      Import balance exercice 2024
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Il y a 2 heures
                    </Typography>
                  </Box>
                  <Chip label="Succès" color="success" size="small" />
                </Box>
                
                <Divider />
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1 }}>
                  <Avatar sx={{ bgcolor: 'warning.light', width: 32, height: 32 }}>
                    <Assessment fontSize="small" />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2">
                      Audit automatique terminé
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Il y a 4 heures
                    </Typography>
                  </Box>
                  <Chip label="5 anomalies" color="warning" size="small" />
                </Box>
                
                <Divider />
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1 }}>
                  <Avatar sx={{ bgcolor: 'success.light', width: 32, height: 32 }}>
                    <Receipt fontSize="small" />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2">
                      Liasse Système Normal générée
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Hier à 16:30
                    </Typography>
                  </Box>
                  <Chip label="PDF" color="info" size="small" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard