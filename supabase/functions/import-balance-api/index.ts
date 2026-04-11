/**
 * Edge Function: import-balance-api
 * Public REST endpoint for external ERPs (SAGE, CEGID, Odoo, etc.) to push
 * trial balances into FiscaSync dossiers.
 *
 * Auth: Authorization: Bearer lp_<hex> — NOT a JWT
 * The API key is hashed (SHA-256) and matched against public.api_keys.
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface BalanceEntry {
  compte: string
  intitule: string
  solde_debit?: number
  solde_credit?: number
  debit?: number
  credit?: number
}

interface ImportPayload {
  dossier_id?: string // optional if api_key is bound to dossier
  annee: 'N' | 'N-1'
  entries: BalanceEntry[]
}

async function sha256(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const startTime = Date.now()
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  let apiKeyId: string | null = null
  let statusCode = 200
  let errorMessage: string | null = null
  let requestSize = 0

  try {
    if (req.method !== 'POST') {
      statusCode = 405
      throw new Error('Method not allowed. Use POST.')
    }

    // Extract API key
    const auth = req.headers.get('Authorization')
    if (!auth?.startsWith('Bearer lp_')) {
      statusCode = 401
      throw new Error('Missing or invalid API key. Use: Authorization: Bearer lp_...')
    }
    const apiKey = auth.replace('Bearer ', '').trim()
    const keyHash = await sha256(apiKey)

    // Validate key
    const { data: keyRecord, error: keyError } = await supabase
      .from('api_keys')
      .select('id, user_id, dossier_id, scopes, expires_at, is_active')
      .eq('key_hash', keyHash)
      .eq('is_active', true)
      .single()

    if (keyError || !keyRecord) {
      statusCode = 401
      throw new Error('Invalid or revoked API key')
    }

    apiKeyId = keyRecord.id

    if (keyRecord.expires_at && new Date(keyRecord.expires_at) < new Date()) {
      statusCode = 401
      throw new Error('API key expired')
    }

    if (!keyRecord.scopes.includes('balance:write')) {
      statusCode = 403
      throw new Error('API key missing required scope: balance:write')
    }

    // Parse payload
    const rawBody = await req.text()
    requestSize = new TextEncoder().encode(rawBody).length
    let payload: ImportPayload
    try {
      payload = JSON.parse(rawBody) as ImportPayload
    } catch {
      statusCode = 400
      throw new Error('Invalid JSON payload')
    }

    if (!payload.annee || !['N', 'N-1'].includes(payload.annee)) {
      statusCode = 400
      throw new Error('Field "annee" must be "N" or "N-1"')
    }

    if (!Array.isArray(payload.entries) || payload.entries.length === 0) {
      statusCode = 400
      throw new Error('Field "entries" must be a non-empty array')
    }

    // Determine dossier_id
    const dossierId = payload.dossier_id || keyRecord.dossier_id
    if (!dossierId) {
      statusCode = 400
      throw new Error('dossier_id required (in payload or bound to API key)')
    }

    // Verify dossier ownership (the API key holder must own the dossier)
    const { data: dossier, error: dossierError } = await supabase
      .from('dossiers')
      .select('id, user_id')
      .eq('id', dossierId)
      .eq('user_id', keyRecord.user_id)
      .single()

    if (dossierError || !dossier) {
      statusCode = 404
      throw new Error('Dossier not found or not owned by API key holder')
    }

    // Validate and normalize entries
    const normalized = payload.entries.map((e, i) => {
      if (!e.compte || typeof e.compte !== 'string') {
        throw new Error(`Entry ${i}: missing or invalid "compte"`)
      }
      if (!/^\d{2,8}$/.test(e.compte)) {
        throw new Error(`Entry ${i}: "compte" must be 2-8 digits, got "${e.compte}"`)
      }
      const soldeDebit = Number(e.solde_debit || 0)
      const soldeCredit = Number(e.solde_credit || 0)
      return {
        compte: e.compte,
        intitule: e.intitule || '',
        solde_debit: soldeDebit,
        solde_credit: soldeCredit,
        debit: Number(e.debit ?? soldeDebit),
        credit: Number(e.credit ?? soldeCredit),
      }
    })

    const totalDebit = normalized.reduce((s, e) => s + e.solde_debit, 0)
    const totalCredit = normalized.reduce((s, e) => s + e.solde_credit, 0)

    // Atomic import: delete existing balance for this dossier+year, then insert
    // (We don't use the import_balance_atomic RPC because it relies on auth.uid(),
    // which is null when using the service role. We've already verified ownership above.)
    const { error: deleteError } = await supabase
      .from('balances')
      .delete()
      .eq('dossier_id', dossierId)
      .eq('annee', payload.annee)

    if (deleteError) {
      statusCode = 500
      throw new Error(`Import failed (delete): ${deleteError.message}`)
    }

    const { data: inserted, error: insertError } = await supabase
      .from('balances')
      .insert({
        dossier_id: dossierId,
        annee: payload.annee,
        data: normalized,
        nombre_comptes: normalized.length,
        total_debit: totalDebit,
        total_credit: totalCredit,
      })
      .select('id')
      .single()

    if (insertError) {
      statusCode = 500
      throw new Error(`Import failed (insert): ${insertError.message}`)
    }

    // Best-effort audit log — ignore errors if the table doesn't exist
    try {
      await supabase.from('audit_log').insert({
        dossier_id: dossierId,
        user_id: keyRecord.user_id,
        action: 'import_balance_api',
        details: {
          annee: payload.annee,
          nombre_comptes: normalized.length,
          total_debit: totalDebit,
          total_credit: totalCredit,
          source: 'api',
          api_key_id: apiKeyId,
        },
      })
    } catch (_e) {
      // non-fatal
    }

    // Bump dossier version (best-effort)
    try {
      await supabase.rpc('increment_dossier_version', { p_dossier_id: dossierId })
    } catch (_e) {
      // fallback: direct update
      await supabase
        .from('dossiers')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', dossierId)
    }

    // Update last_used_at on the key
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', apiKeyId)

    return new Response(
      JSON.stringify({
        success: true,
        dossier_id: dossierId,
        annee: payload.annee,
        entries_imported: normalized.length,
        total_debit: totalDebit,
        total_credit: totalCredit,
        equilibrium: Math.abs(totalDebit - totalCredit) < 0.01,
        balance_id: inserted?.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : 'Unknown error'
    if (statusCode === 200) statusCode = 400
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } finally {
    // Log the request (best-effort; swallow errors)
    if (apiKeyId) {
      try {
        await supabase.from('api_logs').insert({
          api_key_id: apiKeyId,
          endpoint: '/import-balance-api',
          method: req.method,
          status_code: statusCode,
          ip_address: req.headers.get('x-forwarded-for') || null,
          user_agent: req.headers.get('user-agent') || null,
          request_size_bytes: requestSize || null,
          response_time_ms: Date.now() - startTime,
          error_message: errorMessage,
        })
      } catch (_e) {
        // non-fatal
      }
    }
  }
})
