// Supabase Edge Function: send-email
// Sends transactional emails via Resend API
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'Liass\'Pilot <noreply@liasspilot.com>'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  to: string
  toName?: string
  subject: string
  text: string
  html?: string
  type?: string
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, toName, subject, text, html, type }: EmailRequest = await req.json()

    if (!to || !subject) {
      throw new Error('Missing required fields: to, subject')
    }

    // Build HTML from text if not provided
    const htmlContent = html || buildHtmlEmail(subject, text, toName)

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject: `[Liass'Pilot] ${subject}`,
        html: htmlContent,
        text: text,
        tags: type ? [{ name: 'type', value: type }] : undefined,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Resend API error: ${err}`)
    }

    const data = await res.json()
    return new Response(JSON.stringify({ success: true, id: data.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

function buildHtmlEmail(subject: string, text: string, recipientName?: string): string {
  const greeting = recipientName ? `Bonjour ${recipientName},` : 'Bonjour,'
  const bodyHtml = text.split('\n').map(line => {
    if (line.trim() === '') return '<br/>'
    return `<p style="margin:0 0 8px 0;color:#333;">${line}</p>`
  }).join('')

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:'Exo 2',Helvetica,Arial,sans-serif;background:#f5f5f5;padding:20px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e5e5;">
    <div style="background:#171717;padding:24px 32px;">
      <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700;">Liass'Pilot</h1>
      <p style="margin:4px 0 0;color:#999;font-size:13px;">Solution Fiscale OHADA</p>
    </div>
    <div style="padding:32px;">
      <p style="color:#333;font-size:15px;margin:0 0 16px;">${greeting}</p>
      ${bodyHtml}
      <hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0;"/>
      <p style="color:#999;font-size:12px;margin:0;">
        Cet email a ete envoye automatiquement par Liass'Pilot.<br/>
        &copy; ${new Date().getFullYear()} Liass'Pilot — Solution Fiscale OHADA
      </p>
    </div>
  </div>
</body>
</html>`
}
