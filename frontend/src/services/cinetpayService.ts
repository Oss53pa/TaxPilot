import { supabase, isSupabaseEnabled } from '@/lib/supabase'
// @ts-expect-error logger used in future payment integration
import { logger } from '@/utils/logger'

const CINETPAY_API_KEY = import.meta.env.VITE_CINETPAY_API_KEY || ''
const CINETPAY_SITE_ID = import.meta.env.VITE_CINETPAY_SITE_ID || ''

export interface CinetPayConfig {
  apiKey: string
  siteId: string
  notifyUrl: string
  returnUrl: string
  cancelUrl: string
}

export interface CinetPayPaymentRequest {
  transactionId: string
  amount: number
  currency: string
  description: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  channels: string // 'ALL', 'MOBILE_MONEY', 'CREDIT_CARD', 'WALLET'
  metadata?: Record<string, string>
}

export interface CinetPayPaymentResponse {
  code: string
  message: string
  data: {
    payment_url: string
    payment_token: string
    transaction_id: string
  }
}

/**
 * Check if CinetPay is configured
 */
export function isCinetPayEnabled(): boolean {
  return !!(CINETPAY_API_KEY && CINETPAY_SITE_ID)
}

/**
 * Generate a unique transaction ID
 */
export function generateTransactionId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `LP-${timestamp}-${random}`.toUpperCase()
}

/**
 * Initialize a CinetPay payment via Supabase Edge Function
 * This avoids exposing the API key on the client
 */
export async function initializePayment(params: {
  plan: 'business' | 'enterprise'
  interval: 'monthly' | 'yearly'
  customerName: string
  customerEmail: string
  customerPhone?: string
}): Promise<{ paymentUrl: string; transactionId: string }> {
  if (!isSupabaseEnabled || !supabase) {
    throw new Error('Service non disponible')
  }

  const { data, error } = await supabase.functions.invoke('cinetpay-checkout', {
    body: {
      plan: params.plan,
      interval: params.interval,
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      customerPhone: params.customerPhone,
      returnUrl: `${window.location.origin}/settings/subscription?payment=success`,
      cancelUrl: `${window.location.origin}/settings/subscription?payment=canceled`,
    },
  })

  if (error) throw new Error(error.message)
  if (!data?.paymentUrl) throw new Error('URL de paiement non reçue')

  return {
    paymentUrl: data.paymentUrl,
    transactionId: data.transactionId,
  }
}

/**
 * Check payment status
 */
export async function checkPaymentStatus(transactionId: string): Promise<{
  status: 'pending' | 'completed' | 'failed'
  message: string
}> {
  if (!isSupabaseEnabled || !supabase) {
    throw new Error('Service non disponible')
  }

  const { data, error } = await supabase.functions.invoke('cinetpay-status', {
    body: { transactionId },
  })

  if (error) throw new Error(error.message)
  return data
}

/**
 * Available mobile money operators by country
 */
export const MOBILE_MONEY_OPERATORS: Record<string, string[]> = {
  CI: ['Orange Money', 'MTN Money', 'Moov Money', 'Wave'],
  SN: ['Orange Money', 'Wave', 'Free Money'],
  ML: ['Orange Money', 'Moov Money'],
  BF: ['Orange Money', 'Moov Money'],
  BJ: ['MTN Money', 'Moov Money'],
  TG: ['Flooz (Moov)', 'T-Money'],
  NE: ['Orange Money', 'Airtel Money'],
  CM: ['Orange Money', 'MTN Money'],
  GA: ['Airtel Money', 'Moov Money'],
  CG: ['MTN Money', 'Airtel Money'],
  GN: ['Orange Money', 'MTN Money'],
  CD: ['M-Pesa', 'Orange Money', 'Airtel Money'],
}
