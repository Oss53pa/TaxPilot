// Supabase Edge Function: stripe-webhook
// Handles Stripe webhook events to sync subscription state
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2023-10-16' })
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const PLAN_LIMITS: Record<string, { plan: string; liasses: number; users: number; storage: number }> = {
  business_monthly: { plan: 'business', liasses: 12, users: 5, storage: 1000 },
  business_yearly: { plan: 'business', liasses: 12, users: 5, storage: 1000 },
  enterprise_monthly: { plan: 'enterprise', liasses: 999999, users: 999999, storage: 999999 },
  enterprise_yearly: { plan: 'enterprise', liasses: 999999, users: 999999, storage: 999999 },
}

serve(async (req: Request) => {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Invalid signature'
    return new Response(JSON.stringify({ error: msg }), { status: 400 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.supabase_user_id
      if (!userId) break

      // Get subscription details from Stripe
      const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription as string)
      const priceId = stripeSubscription.items.data[0]?.price.id
      const priceLookupKey = stripeSubscription.items.data[0]?.price.lookup_key || ''
      const limits = PLAN_LIMITS[priceLookupKey] || { plan: 'business', liasses: 12, users: 5, storage: 1000 }

      await supabase.from('subscriptions').update({
        plan: limits.plan,
        liasses_limit: limits.liasses,
        users_limit: limits.users,
        storage_limit_mb: limits.storage,
        stripe_subscription_id: stripeSubscription.id,
        is_active: true,
        trial_ends_at: null,
      }).eq('user_id', userId)

      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      const { data: sub } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_customer_id', customerId)
        .single()

      if (sub) {
        const isActive = subscription.status === 'active' || subscription.status === 'trialing'
        await supabase.from('subscriptions').update({
          is_active: isActive,
        }).eq('user_id', sub.user_id)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      const { data: sub } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_customer_id', customerId)
        .single()

      if (sub) {
        await supabase.from('subscriptions').update({
          plan: 'starter',
          liasses_limit: 2,
          users_limit: 1,
          storage_limit_mb: 100,
          is_active: true,
          stripe_subscription_id: null,
        }).eq('user_id', sub.user_id)
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string

      const { data: sub } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_customer_id', customerId)
        .single()

      if (sub) {
        await supabase.from('subscriptions').update({
          is_active: false,
        }).eq('user_id', sub.user_id)
      }
      break
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
