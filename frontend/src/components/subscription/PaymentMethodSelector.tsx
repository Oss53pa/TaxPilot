import React, { useState } from 'react'
import {
  Box, Card, CardContent, Typography, Radio, RadioGroup, FormControlLabel,
  Button, TextField, Alert, CircularProgress, Chip, Divider,
} from '@mui/material'
import { CreditCard, PhoneAndroid } from '@mui/icons-material'
import { useStripeCheckout } from '@/hooks/useStripe'
import { useCinetPayCheckout } from '@/hooks/useCinetPay'
import type { BillingInterval } from '@/services/stripeService'

interface PaymentMethodSelectorProps {
  plan: 'business' | 'enterprise'
  interval: BillingInterval
  amount: number
  onCancel: () => void
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  plan, interval, amount, onCancel,
}) => {
  const [method, setMethod] = useState<'stripe' | 'cinetpay'>('cinetpay')
  const [phone, setPhone] = useState('')

  const stripe = useStripeCheckout()
  const cinetpay = useCinetPayCheckout()

  const isLoading = stripe.isLoading || cinetpay.isLoading
  const error = stripe.error || cinetpay.error

  const handlePay = async () => {
    if (method === 'stripe') {
      await stripe.checkout(plan, interval)
    } else {
      await cinetpay.checkout(plan, interval, phone || undefined)
    }
  }

  const formatAmount = (amt: number) => new Intl.NumberFormat('fr-FR').format(amt) + ' XOF'

  return (
    <Box sx={{ maxWidth: 500 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Typography variant="h6" fontWeight={600} gutterBottom>
        Choisir le mode de paiement
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Plan {plan.charAt(0).toUpperCase() + plan.slice(1)} — {formatAmount(amount)} / {interval === 'monthly' ? 'mois' : 'an'}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <RadioGroup value={method} onChange={(e) => setMethod(e.target.value as 'stripe' | 'cinetpay')}>
        {/* CinetPay — Mobile Money */}
        <Card
          variant="outlined"
          sx={{
            mb: 2,
            borderColor: method === 'cinetpay' ? 'primary.main' : 'divider',
            borderWidth: method === 'cinetpay' ? 2 : 1,
          }}
        >
          <CardContent sx={{ pb: '16px !important' }}>
            <FormControlLabel
              value="cinetpay"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneAndroid />
                  <Box>
                    <Typography fontWeight={600}>Mobile Money</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Orange Money, MTN, Wave, Moov
                    </Typography>
                  </Box>
                  <Chip label="Recommande" size="small" color="success" sx={{ ml: 'auto' }} />
                </Box>
              }
              sx={{ width: '100%', m: 0 }}
            />
            {method === 'cinetpay' && (
              <TextField
                fullWidth
                size="small"
                label="Numero de telephone (optionnel)"
                placeholder="+225 07 XX XX XX XX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                sx={{ mt: 2 }}
                helperText="Le numero sera pre-rempli sur la page de paiement"
              />
            )}
          </CardContent>
        </Card>

        {/* Stripe — Card */}
        <Card
          variant="outlined"
          sx={{
            mb: 2,
            borderColor: method === 'stripe' ? 'primary.main' : 'divider',
            borderWidth: method === 'stripe' ? 2 : 1,
          }}
        >
          <CardContent sx={{ pb: '16px !important' }}>
            <FormControlLabel
              value="stripe"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CreditCard />
                  <Box>
                    <Typography fontWeight={600}>Carte bancaire</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Visa, Mastercard, carte internationale
                    </Typography>
                  </Box>
                </Box>
              }
              sx={{ width: '100%', m: 0 }}
            />
          </CardContent>
        </Card>
      </RadioGroup>

      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Button variant="outlined" onClick={onCancel} disabled={isLoading}>
          Annuler
        </Button>
        <Button
          variant="contained"
          onClick={handlePay}
          disabled={isLoading}
          fullWidth
        >
          {isLoading ? <CircularProgress size={24} /> : `Payer ${formatAmount(amount)}`}
        </Button>
      </Box>
    </Box>
  )
}

export default PaymentMethodSelector
