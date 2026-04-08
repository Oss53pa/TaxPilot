import React from 'react'
import { Alert, AlertTitle, Button, LinearProgress, Typography } from '@mui/material'
import { Warning as WarningIcon, Block as BlockIcon } from '@mui/icons-material'
import { useQuota } from '@/hooks/useQuota'

const ATLAS_STUDIO_PRICING = 'https://atlasstudio.app/pricing'

const QuotaWarning: React.FC = () => {
  const quota = useQuota()

  if (quota.warningLevel === 'none' || quota.isUnlimited) return null

  const severity = quota.warningLevel === 'blocked' ? 'error'
    : quota.warningLevel === 'critical' ? 'error'
    : 'warning'

  const icon = quota.warningLevel === 'blocked' ? <BlockIcon /> : <WarningIcon />

  const message = quota.warningLevel === 'blocked'
    ? quota.isTrialExpired
      ? 'Votre période d\'essai est expirée.'
      : `Quota atteint : ${quota.liassesUsed}/${quota.liassesLimit} liasses utilisées.`
    : `${quota.percentUsed}% du quota utilisé (${quota.liassesUsed}/${quota.liassesLimit}).`

  return (
    <Alert severity={severity} icon={icon} sx={{ mb: 2 }}>
      <AlertTitle>
        {quota.warningLevel === 'blocked' ? 'Génération bloquée' : 'Quota presque atteint'}
      </AlertTitle>
      <Typography variant="body2">{message}</Typography>
      <LinearProgress
        variant="determinate"
        value={Math.min(quota.percentUsed, 100)}
        color={severity === 'error' ? 'error' : 'warning'}
        sx={{ mt: 1, mb: 1, height: 8, borderRadius: 4 }}
      />
      <Button
        size="small"
        variant="outlined"
        onClick={() => window.open(ATLAS_STUDIO_PRICING, '_blank')}
        sx={{ mt: 1 }}
      >
        Mettre à niveau
      </Button>
    </Alert>
  )
}

export default QuotaWarning
