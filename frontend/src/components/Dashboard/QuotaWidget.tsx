/**
 * Widget d'affichage des quotas SaaS pour le dashboard
 * Phase 2: SaaS Multi-Tenant
 */

import React from 'react'
import {
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Box,
  Chip,
  Alert,
  Button,
  Stack,
} from '@mui/material'
import {
  TrendingUp,
  Warning,
  CheckCircle,
  Upgrade,
  Info,
} from '@mui/icons-material'
import { useOrganizationStore } from '@/store/organizationStore'
import { useNavigate } from 'react-router-dom'

interface QuotaWidgetProps {
  compact?: boolean
}

const QuotaWidget: React.FC<QuotaWidgetProps> = ({ compact = false }) => {
  const navigate = useNavigate()
  const { organization, getQuotaRemaining, getQuotaPercentage } = useOrganizationStore()

  if (!organization) {
    return null
  }

  const quotaRemaining = getQuotaRemaining()
  const quotaPercentage = getQuotaPercentage()
  const isUnlimited = organization.subscription_plan === 'ENTERPRISE'

  // Déterminer la couleur selon l'usage
  const getQuotaColor = () => {
    if (isUnlimited) return 'success'
    if (quotaPercentage >= 90) return 'error'
    if (quotaPercentage >= 70) return 'warning'
    return 'primary'
  }

  // Message d'alerte
  const getAlertMessage = () => {
    if (isUnlimited) return null

    if (quotaPercentage >= 90) {
      return {
        severity: 'error' as const,
        message: `Attention ! Il vous reste ${quotaRemaining} liasse${Number(quotaRemaining) > 1 ? 's' : ''} sur ${organization.liasses_quota}. Pensez à upgrader votre plan.`,
      }
    }

    if (quotaPercentage >= 70) {
      return {
        severity: 'warning' as const,
        message: `Vous avez utilisé ${quotaPercentage}% de votre quota. ${quotaRemaining} liasse${Number(quotaRemaining) > 1 ? 's' : ''} restante${Number(quotaRemaining) > 1 ? 's' : ''}.`,
      }
    }

    return null
  }

  const alertInfo = getAlertMessage()

  // Vue compacte (pour sidebar ou header)
  if (compact) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={1}>
            <Typography variant="caption" color="text.secondary">
              Liasses restantes
            </Typography>
            <Typography variant="h6" fontWeight="bold" color={getQuotaColor()}>
              {isUnlimited ? '∞' : `${quotaRemaining} / ${organization.liasses_quota}`}
            </Typography>
            {!isUnlimited && (
              <LinearProgress
                variant="determinate"
                value={quotaPercentage}
                color={getQuotaColor()}
                sx={{ height: 6, borderRadius: 3 }}
              />
            )}
          </Stack>
        </CardContent>
      </Card>
    )
  }

  // Vue complète
  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={600}>
              Quota de Liasses
            </Typography>
            <Chip
              label={organization.subscription_plan}
              color={getQuotaColor()}
              size="small"
              icon={isUnlimited ? <CheckCircle /> : <TrendingUp />}
            />
          </Box>

          {/* Alerte si nécessaire */}
          {alertInfo && (
            <Alert
              severity={alertInfo.severity}
              icon={alertInfo.severity === 'error' ? <Warning /> : <Info />}
            >
              {alertInfo.message}
            </Alert>
          )}

          {/* Quota principal */}
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="baseline" mb={1}>
              <Typography variant="body2" color="text.secondary">
                Liasses générées cette année
              </Typography>
              <Typography variant="h4" fontWeight="bold" color={getQuotaColor()}>
                {isUnlimited ? (
                  <>
                    {organization.liasses_used} <Typography component="span" variant="body2" color="text.secondary">/ Illimité</Typography>
                  </>
                ) : (
                  `${organization.liasses_used} / ${organization.liasses_quota}`
                )}
              </Typography>
            </Box>

            {!isUnlimited && (
              <>
                <LinearProgress
                  variant="determinate"
                  value={quotaPercentage}
                  color={getQuotaColor()}
                  sx={{ height: 10, borderRadius: 5, mb: 1 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {quotaPercentage}% utilisé • {quotaRemaining} restante{Number(quotaRemaining) > 1 ? 's' : ''}
                </Typography>
              </>
            )}
          </Box>

          {/* Informations plan */}
          <Box
            p={2}
            bgcolor="action.hover"
            borderRadius={2}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                Plan {(organization as any).get_subscription_plan_display || organization.subscription_plan}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {organization.subscription_status === 'TRIAL'
                  ? `Période d'essai${organization.trial_end_date ? ` jusqu'au ${new Date(organization.trial_end_date).toLocaleDateString()}` : ''}`
                  : `Statut: ${organization.subscription_status}`}
              </Typography>
            </Box>

            {!isUnlimited && quotaPercentage >= 70 && (
              <Button
                variant="contained"
                size="small"
                startIcon={<Upgrade />}
                onClick={() => navigate('/pricing')}
              >
                Upgrader
              </Button>
            )}
          </Box>

          {/* Autres quotas */}
          <Stack direction="row" spacing={2}>
            <Box flex={1}>
              <Typography variant="caption" color="text.secondary">
                Utilisateurs
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {(organization as any).members?.length || 0} / {(organization as any).users_quota}
              </Typography>
            </Box>
            <Box flex={1}>
              <Typography variant="caption" color="text.secondary">
                Stockage
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {(organization as any).storage_quota_gb} GB
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default QuotaWidget
