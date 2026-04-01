import React, { useState } from 'react'
import {
  Box, Card, CardContent, Typography, Button, Chip, ToggleButtonGroup, ToggleButton,
  List, ListItem, ListItemIcon, ListItemText, CircularProgress, Alert,
} from '@mui/material'
import { Check as CheckIcon, Star as StarIcon } from '@mui/icons-material'
import { PLANS, type BillingInterval } from '@/services/stripeService'
import { useStripeCheckout } from '@/hooks/useStripe'
import { useSubscription } from '@/hooks/useQuota'

const PricingCards: React.FC = () => {
  const [interval, setInterval] = useState<BillingInterval>('monthly')
  const { checkout, isLoading, error } = useStripeCheckout()
  const { data: currentSub } = useSubscription()

  const formatPrice = (amount: number) => {
    if (amount === 0) return 'Gratuit'
    return new Intl.NumberFormat('fr-FR').format(amount) + ' XOF'
  }

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <ToggleButtonGroup
          value={interval}
          exclusive
          onChange={(_, v) => v && setInterval(v)}
          size="small"
        >
          <ToggleButton value="monthly">Mensuel</ToggleButton>
          <ToggleButton value="yearly">
            Annuel
            <Chip label="-17%" size="small" color="success" sx={{ ml: 1 }} />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
        {PLANS.map((plan) => {
          const isCurrent = currentSub?.plan === plan.id
          const price = interval === 'monthly' ? plan.priceMonthly : plan.priceYearly
          const isPopular = plan.id === 'business'

          return (
            <Card
              key={plan.id}
              sx={{
                position: 'relative',
                border: isPopular ? '2px solid' : '1px solid',
                borderColor: isPopular ? 'primary.main' : 'divider',
              }}
            >
              {isPopular && (
                <Chip
                  icon={<StarIcon />}
                  label="Populaire"
                  color="primary"
                  size="small"
                  sx={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)' }}
                />
              )}
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" fontWeight={700}>{plan.name}</Typography>
                <Box sx={{ my: 2 }}>
                  <Typography variant="h3" fontWeight={700} component="span">
                    {formatPrice(price)}
                  </Typography>
                  {price > 0 && (
                    <Typography variant="body2" color="text.secondary" component="span">
                      /{interval === 'monthly' ? 'mois' : 'an'}
                    </Typography>
                  )}
                </Box>

                <List dense>
                  {plan.features.map((feature, i) => (
                    <ListItem key={i} disableGutters sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckIcon fontSize="small" color="success" />
                      </ListItemIcon>
                      <ListItemText primary={feature} primaryTypographyProps={{ variant: 'body2' }} />
                    </ListItem>
                  ))}
                </List>

                <Button
                  fullWidth
                  variant={isCurrent ? 'outlined' : 'contained'}
                  disabled={isCurrent || isLoading || plan.id === 'starter'}
                  onClick={() => plan.id !== 'starter' && checkout(plan.id as 'business' | 'enterprise', interval)}
                  sx={{ mt: 2 }}
                >
                  {isLoading ? <CircularProgress size={24} /> :
                   isCurrent ? 'Plan actuel' :
                   plan.id === 'starter' ? 'Plan gratuit' :
                   'Choisir ce plan'}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </Box>
    </Box>
  )
}

export default PricingCards
