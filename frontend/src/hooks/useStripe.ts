import { useCallback, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { STRIPE_PRICES, type BillingInterval } from '@/services/stripeService'

export function useStripeCheckout() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkout = useCallback(async (plan: 'business' | 'enterprise', interval: BillingInterval) => {
    setIsLoading(true)
    setError(null)

    try {
      const priceKey = `${plan}_${interval}` as keyof typeof STRIPE_PRICES
      const priceId = STRIPE_PRICES[priceKey]

      if (!priceId) {
        throw new Error('Prix Stripe non configuré. Contactez le support.')
      }

      if (!supabase) throw new Error('Supabase non disponible')

      const { data, error: fnError } = await supabase.functions.invoke('create-checkout', {
        body: {
          priceId,
          successUrl: `${window.location.origin}/settings/subscription?success=true`,
          cancelUrl: `${window.location.origin}/settings/subscription?canceled=true`,
        },
      })

      if (fnError) throw new Error(fnError.message)
      if (!data?.url) throw new Error('URL de paiement non reçue')

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur de paiement'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const openPortal = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (!supabase) throw new Error('Supabase non disponible')

      const { data, error: fnError } = await supabase.functions.invoke('create-portal-session', {
        body: {
          returnUrl: `${window.location.origin}/settings/subscription`,
        },
      })

      if (fnError) throw new Error(fnError.message)
      if (!data?.url) throw new Error('URL du portail non reçue')

      window.location.href = data.url
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { checkout, openPortal, isLoading, error }
}
