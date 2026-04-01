// Supabase Edge Function: cinetpay-webhook
// Handles CinetPay payment notifications (IPN)
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const CINETPAY_API_KEY = Deno.env.get('CINETPAY_API_KEY')!
const CINETPAY_SITE_ID = Deno.env.get('CINETPAY_SITE_ID')!
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const PLAN_LIMITS: Record<string, { liasses: number; users: number; storage: number }> = {
  business: { liasses: 12, users: 5, storage: 1000 },
  enterprise: { liasses: 999999, users: 999999, storage: 999999 },
}

serve(async (req: Request) => {
  try {
    const body = await req.json()
    const transactionId = body.cpm_trans_id

    if (!transactionId) {
      return new Response('Missing transaction ID', { status: 400 })
    }

    // Verify payment status with CinetPay API
    const verifyResponse = await fetch('https://api-checkout.cinetpay.com/v2/payment/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apikey: CINETPAY_API_KEY,
        site_id: CINETPAY_SITE_ID,
        transaction_id: transactionId,
      }),
    })

    const verifyData = await verifyResponse.json()
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the pending payment record
    const { data: payment } = await supabase
      .from('payment_history')
      .select('*')
      .eq('transaction_id', transactionId)
      .eq('provider', 'cinetpay')
      .single()

    if (!payment) {
      return new Response('Payment not found', { status: 404 })
    }

    const paymentStatus = verifyData.code === '00' ? 'completed' : 'failed'

    // Update payment history
    await supabase
      .from('payment_history')
      .update({
        status: paymentStatus,
        metadata: { ...((payment.metadata as Record<string, unknown>) || {}), cinetpay_response: verifyData },
      })
      .eq('id', payment.id)

    // If payment successful, upgrade subscription
    if (paymentStatus === 'completed') {
      const plan = payment.plan
      const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.business
      const interval = payment.billing_interval

      // Calculate next payment date
      const now = new Date()
      const nextPayment = new Date(now)
      if (interval === 'yearly') {
        nextPayment.setFullYear(nextPayment.getFullYear() + 1)
      } else {
        nextPayment.setMonth(nextPayment.getMonth() + 1)
      }

      await supabase.from('subscriptions').update({
        plan,
        liasses_limit: limits.liasses,
        users_limit: limits.users,
        storage_limit_mb: limits.storage,
        payment_method: 'cinetpay',
        is_active: true,
        trial_ends_at: null,
        last_payment_date: now.toISOString(),
        next_payment_date: nextPayment.toISOString(),
      }).eq('user_id', payment.user_id)

      // Log the upgrade
      await supabase.from('audit_log').insert({
        user_id: payment.user_id,
        action: 'subscription_upgrade',
        details: {
          plan,
          interval,
          amount: payment.amount,
          provider: 'cinetpay',
          transaction_id: transactionId,
        },
      })
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('CinetPay webhook error:', message)
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
