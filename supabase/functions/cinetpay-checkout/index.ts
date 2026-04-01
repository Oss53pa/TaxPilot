// Supabase Edge Function: cinetpay-checkout
// Creates a CinetPay payment session for subscription
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const CINETPAY_API_KEY = Deno.env.get('CINETPAY_API_KEY')!
const CINETPAY_SITE_ID = Deno.env.get('CINETPAY_SITE_ID')!
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const PLAN_PRICES: Record<string, Record<string, number>> = {
  business: { monthly: 49000, yearly: 490000 },
  enterprise: { monthly: 149000, yearly: 1490000 },
}

const PLAN_LIMITS: Record<string, { liasses: number; users: number; storage: number }> = {
  business: { liasses: 12, users: 5, storage: 1000 },
  enterprise: { liasses: 999999, users: 999999, storage: 999999 },
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('No authorization header')
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) throw new Error('Unauthorized')

    const { plan, interval, customerName, customerEmail, customerPhone, returnUrl, cancelUrl } = await req.json()

    if (!plan || !interval) throw new Error('plan and interval are required')
    if (!PLAN_PRICES[plan]) throw new Error(`Invalid plan: ${plan}`)

    const amount = PLAN_PRICES[plan][interval]
    if (!amount) throw new Error(`Invalid interval: ${interval}`)

    // Generate transaction ID
    const transactionId = `LP-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`.toUpperCase()

    // Determine notify URL (webhook)
    const notifyUrl = `${supabaseUrl}/functions/v1/cinetpay-webhook`

    // Call CinetPay API to initialize payment
    const cinetpayResponse = await fetch('https://api-checkout.cinetpay.com/v2/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apikey: CINETPAY_API_KEY,
        site_id: CINETPAY_SITE_ID,
        transaction_id: transactionId,
        amount: amount,
        currency: 'XOF',
        description: `Liass'Pilot - Plan ${plan} (${interval})`,
        notify_url: notifyUrl,
        return_url: returnUrl,
        cancel_url: cancelUrl,
        channels: 'ALL',
        customer_name: customerName || '',
        customer_email: customerEmail || user.email || '',
        customer_phone_number: customerPhone || '',
        customer_city: '',
        customer_country: 'CI',
        customer_zip_code: '',
        metadata: JSON.stringify({
          user_id: user.id,
          plan,
          interval,
        }),
      }),
    })

    const cinetpayData = await cinetpayResponse.json()

    if (cinetpayData.code !== '201') {
      throw new Error(cinetpayData.message || 'CinetPay initialization failed')
    }

    // Record pending payment
    await supabase.from('payment_history').insert({
      user_id: user.id,
      provider: 'cinetpay',
      transaction_id: transactionId,
      amount,
      currency: 'XOF',
      status: 'pending',
      plan,
      billing_interval: interval,
      metadata: { cinetpay_token: cinetpayData.data?.payment_token },
    })

    return new Response(JSON.stringify({
      paymentUrl: cinetpayData.data.payment_url,
      transactionId,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
