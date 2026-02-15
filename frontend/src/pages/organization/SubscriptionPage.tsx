import { logger } from '@/utils/logger'
/**
 * Page de gestion de l'abonnement d'une organisation
 * Affiche le plan actuel, l'usage des quotas, et permet l'upgrade/downgrade
 */

import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Paper,
  LinearProgress,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material'
import {
  Check as CheckIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Description as DescriptionIcon,
  // People as PeopleIcon,
  Storage as StorageIcon,
} from '@mui/icons-material'
import organizationService, { Organization, Subscription } from '../../services/organizationService'

interface SubscriptionPageProps {
  organizationSlug: string
}

interface PlanFeature {
  name: string
  starter: boolean | string
  business: boolean | string
  enterprise: boolean | string
}

const PLAN_FEATURES: PlanFeature[] = [
  { name: 'Liasses fiscales / an', starter: '2', business: '12', enterprise: 'Illimité' },
  { name: 'Utilisateurs', starter: '1', business: '5', enterprise: 'Illimité' },
  { name: 'Stockage', starter: '1 GB', business: '10 GB', enterprise: 'Illimité' },
  { name: 'Support technique', starter: 'Email', business: 'Prioritaire', enterprise: 'Dédié 24/7' },
  { name: 'Audit automatique', starter: true, business: true, enterprise: true },
  { name: 'Export PDF/Excel', starter: true, business: true, enterprise: true },
  { name: 'IA Mapping', starter: false, business: true, enterprise: true },
  { name: 'API Access', starter: false, business: false, enterprise: true },
  { name: 'White-label', starter: false, business: false, enterprise: true },
]

const PLAN_PRICES = {
  STARTER: { monthly: 0, yearly: 0, currency: 'XOF' },
  BUSINESS: { monthly: 25000, yearly: 250000, currency: 'XOF' },
  ENTERPRISE: { monthly: 75000, yearly: 750000, currency: 'XOF' },
}

const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ organizationSlug }) => {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'STARTER' | 'BUSINESS' | 'ENTERPRISE'>('BUSINESS')
  const [upgrading, setUpgrading] = useState(false)

  useEffect(() => {
    loadData()
  }, [organizationSlug])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [orgData, subData] = await Promise.all([
        organizationService.getBySlug(organizationSlug),
        organizationService.getCurrentSubscription(organizationSlug),
      ])

      setOrganization(orgData)
      setSubscription(subData)
    } catch (err: any) {
      logger.error('Error loading data:', err)
      setError(err.message || 'Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async () => {
    if (!subscription) return

    try {
      setUpgrading(true)
      setError(null)

      await organizationService.upgradeSubscription(subscription.id, selectedPlan)

      setSuccess(`Abonnement mis à niveau vers ${selectedPlan} avec succès!`)
      setUpgradeDialogOpen(false)

      // Recharger les données
      loadData()
    } catch (err: any) {
      logger.error('Error upgrading subscription:', err)
      setError(err.message || 'Erreur lors de la mise à niveau')
    } finally {
      setUpgrading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!subscription || !window.confirm('Êtes-vous sûr de vouloir annuler votre abonnement ?')) {
      return
    }

    try {
      await organizationService.cancelSubscription(subscription.id)
      setSuccess('Abonnement annulé avec succès')
      loadData()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'annulation')
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  if (!organization) {
    return (
      <Alert severity="error">
        Organisation introuvable
      </Alert>
    )
  }

  const liassesPercentage = organization.liasses_quota > 0
    ? Math.round((organization.liasses_used / organization.liasses_quota) * 100)
    : 0

  const isNearLimit = liassesPercentage >= 80
  const currentPlan = organization.subscription_plan

  return (
    <Box>
      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Current Plan Overview */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Votre abonnement actuel
          </Typography>

          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Plan Badge */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
                <Typography variant="h4" gutterBottom>
                  {currentPlan}
                </Typography>
                <Typography variant="h6">
                  {PLAN_PRICES[currentPlan].monthly.toLocaleString()} {PLAN_PRICES[currentPlan].currency}/mois
                </Typography>
                <Chip
                  label={organizationService.getSubscriptionStatusLabel(organization.subscription_status)}
                  sx={{ mt: 2, bgcolor: 'white', color: 'primary.main' }}
                />
              </Paper>
            </Grid>

            {/* Usage Stats */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Utilisation des quotas
                </Typography>

                {/* Liasses */}
                <Box sx={{ mb: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Box display="flex" alignItems="center">
                      <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2">Liasses fiscales</Typography>
                    </Box>
                    <Typography variant="body2" color={isNearLimit ? 'error' : 'textSecondary'}>
                      {organization.liasses_used} / {organization.liasses_quota === -1 ? '∞' : organization.liasses_quota}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(liassesPercentage, 100)}
                    color={isNearLimit ? 'error' : 'primary'}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  {isNearLimit && (
                    <Box display="flex" alignItems="center" mt={1}>
                      <WarningIcon fontSize="small" color="error" sx={{ mr: 0.5 }} />
                      <Typography variant="caption" color="error">
                        Vous approchez de votre limite de liasses
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Storage (exemple) */}
                <Box sx={{ mb: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Box display="flex" alignItems="center">
                      <StorageIcon sx={{ mr: 1, color: 'info.main' }} />
                      <Typography variant="body2">Stockage</Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      2.3 GB / {organization.storage_quota_gb === -1 ? '∞' : `${organization.storage_quota_gb} GB`}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={23}
                    color="info"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                {/* Trial Info */}
                {organization.subscription_status === 'TRIAL' && organization.trial_end_date && (
                  <Alert severity="info" icon={<TrendingUpIcon />}>
                    Période d'essai - {organizationService.getRemainingTrialDays(organization)} jours restants
                  </Alert>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box display="flex" gap={2} mt={3}>
            {currentPlan !== 'ENTERPRISE' && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<TrendingUpIcon />}
                onClick={() => setUpgradeDialogOpen(true)}
              >
                Mettre à niveau
              </Button>
            )}
            {currentPlan !== 'STARTER' && organization.subscription_status === 'ACTIVE' && (
              <Button
                variant="outlined"
                color="error"
                onClick={handleCancelSubscription}
              >
                Annuler l'abonnement
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Plans Comparison */}
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Comparer les plans
          </Typography>

          <Grid container spacing={3} sx={{ mt: 1 }}>
            {(['STARTER', 'BUSINESS', 'ENTERPRISE'] as const).map((plan) => (
              <Grid item xs={12} md={4} key={plan}>
                <Paper
                  sx={{
                    p: 3,
                    height: '100%',
                    border: currentPlan === plan ? 2 : 0,
                    borderColor: 'primary.main',
                  }}
                >
                  <Typography variant="h6" align="center" gutterBottom>
                    {plan}
                  </Typography>
                  <Typography variant="h4" align="center" color="primary" gutterBottom>
                    {PLAN_PRICES[plan].monthly.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" align="center" color="textSecondary" gutterBottom>
                    {PLAN_PRICES[plan].currency}/mois
                  </Typography>

                  {currentPlan === plan && (
                    <Chip label="Plan actuel" color="primary" size="small" sx={{ width: '100%', mb: 2 }} />
                  )}

                  <Divider sx={{ my: 2 }} />

                  <List dense>
                    {PLAN_FEATURES.map((feature) => {
                      const value = feature[plan.toLowerCase() as keyof PlanFeature]
                      const isIncluded = value === true || (typeof value === 'string' && value !== '')

                      return (
                        <ListItem key={feature.name}>
                          <ListItemIcon>
                            <CheckIcon
                              fontSize="small"
                              color={isIncluded ? 'success' : 'disabled'}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={feature.name}
                            secondary={typeof value === 'string' ? value : undefined}
                            primaryTypographyProps={{
                              color: isIncluded ? 'textPrimary' : 'textSecondary',
                            }}
                          />
                        </ListItem>
                      )
                    })}
                  </List>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Upgrade Dialog */}
      <Dialog open={upgradeDialogOpen} onClose={() => setUpgradeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Mettre à niveau votre abonnement</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Sélectionnez le plan vers lequel vous souhaitez migrer :
          </Typography>

          <Box sx={{ mt: 2 }}>
            {(['BUSINESS', 'ENTERPRISE'] as const)
              .filter(plan => plan !== currentPlan)
              .map((plan) => (
                <Paper
                  key={plan}
                  sx={{
                    p: 2,
                    mb: 2,
                    cursor: 'pointer',
                    border: selectedPlan === plan ? 2 : 1,
                    borderColor: selectedPlan === plan ? 'primary.main' : 'divider',
                  }}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <Typography variant="h6">{plan}</Typography>
                  <Typography variant="h5" color="primary">
                    {PLAN_PRICES[plan].monthly.toLocaleString()} {PLAN_PRICES[plan].currency}/mois
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Facturé mensuellement
                  </Typography>
                </Paper>
              ))}
          </Box>

          <Alert severity="info" sx={{ mt: 2 }}>
            Le changement sera effectif immédiatement et la facturation sera ajustée au prorata.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpgradeDialogOpen(false)}>Annuler</Button>
          <Button
            onClick={handleUpgrade}
            variant="contained"
            disabled={upgrading}
            startIcon={upgrading ? <CircularProgress size={16} /> : <TrendingUpIcon />}
          >
            {upgrading ? 'Mise à niveau...' : 'Confirmer la mise à niveau'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SubscriptionPage
