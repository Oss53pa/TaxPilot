import { useCallback, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { initializePayment, isCinetPayEnabled } from '@/services/cinetpayService'
import type { BillingInterval } from '@/services/stripeService'

export function useCinetPayCheckout() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuthStore()

  const checkout = useCallback(async (
    plan: 'business' | 'enterprise',
    interval: BillingInterval,
    phone?: string
  ) => {
    if (!isCinetPayEnabled()) {
      setError('CinetPay non configure')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await initializePayment({
        plan,
        interval,
        customerName: user ? `${user.firstName} ${user.lastName}` : '',
        customerEmail: user?.email || '',
        customerPhone: phone,
      })

      // Redirect to CinetPay payment page
      window.location.href = result.paymentUrl
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur de paiement'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  return { checkout, isLoading, error, isEnabled: isCinetPayEnabled() }
}
