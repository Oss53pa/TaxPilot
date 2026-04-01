import { loadStripe, type Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null> | null = null

export function getStripe(): Promise<Stripe | null> {
  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  if (!key) {
    console.warn('[Stripe] VITE_STRIPE_PUBLISHABLE_KEY not configured')
    return Promise.resolve(null)
  }
  if (!stripePromise) {
    stripePromise = loadStripe(key)
  }
  return stripePromise
}

export const STRIPE_PRICES = {
  business_monthly: import.meta.env.VITE_STRIPE_PRICE_BUSINESS_MONTHLY || '',
  business_yearly: import.meta.env.VITE_STRIPE_PRICE_BUSINESS_YEARLY || '',
  enterprise_monthly: import.meta.env.VITE_STRIPE_PRICE_ENTERPRISE_MONTHLY || '',
  enterprise_yearly: import.meta.env.VITE_STRIPE_PRICE_ENTERPRISE_YEARLY || '',
} as const

export type PlanId = 'starter' | 'business' | 'enterprise'
export type BillingInterval = 'monthly' | 'yearly'

export interface PlanConfig {
  id: PlanId
  name: string
  priceMonthly: number
  priceYearly: number
  currency: string
  features: string[]
  liassesLimit: number
  usersLimit: number
  storageLimitMb: number
}

export const PLANS: PlanConfig[] = [
  {
    id: 'starter',
    name: 'Starter',
    priceMonthly: 0,
    priceYearly: 0,
    currency: 'XOF',
    features: [
      '2 liasses fiscales / an',
      'Système Minimal de Trésorerie uniquement',
      'Export basique',
      'Support email',
    ],
    liassesLimit: 2,
    usersLimit: 1,
    storageLimitMb: 100,
  },
  {
    id: 'business',
    name: 'Business',
    priceMonthly: 49000,
    priceYearly: 490000,
    currency: 'XOF',
    features: [
      '12 liasses fiscales / an',
      'Tous types (SN, SMT, SA, Sectoriels)',
      'API + webhooks',
      '5 utilisateurs max',
      'Piste d\'audit',
      'Rétention 3 ans',
      'Support prioritaire',
    ],
    liassesLimit: 12,
    usersLimit: 5,
    storageLimitMb: 1000,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceMonthly: 149000,
    priceYearly: 1490000,
    currency: 'XOF',
    features: [
      'Liasses illimitées',
      'Consolidation multi-entités',
      'API complète + webhooks',
      'Utilisateurs illimités',
      'RBAC avancé',
      'Scellement cryptographique',
      'Intégrations ERP',
      'Rétention 10 ans',
      'Account manager dédié',
      'SLA 99.9%',
    ],
    liassesLimit: -1, // unlimited
    usersLimit: -1,
    storageLimitMb: -1,
  },
]
