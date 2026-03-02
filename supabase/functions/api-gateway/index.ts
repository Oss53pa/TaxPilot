/**
 * API Gateway — Supabase Edge Function
 * Single entry point for all REST API operations.
 *
 * Routes:
 *   POST /api-gateway — JSON body with { action, ...params }
 *
 * Actions:
 *   - auth/signup          — Create account + tenant
 *   - entities/list        — List entities for tenant
 *   - entities/create      — Create entity
 *   - exercices/list       — List exercices for entity
 *   - balance/import       — Import balance data
 *   - balance/get          — Get balance with lines
 *   - liasse/generate      — Generate liasse from balance
 *   - liasse/get           — Get liasse data
 *   - liasse/update        — Update liasse
 *   - audit/run            — Run audit controls
 *   - audit/results        — Get audit results
 *   - declarations/list    — List declarations
 *   - declarations/submit  — Submit declaration
 *   - audit-trail/list     — Get audit trail
 *   - audit-trail/verify   — Verify chain integrity
 */

import { corsHeaders } from '../_shared/cors.ts'
import { authenticate, checkPermission, auditLog, getServiceClient } from '../_shared/auth.ts'
import type { AuthContext } from '../_shared/auth.ts'

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { action, ...params } = body

    if (!action) {
      return jsonResponse({ error: 'Missing action parameter' }, 400)
    }

    // Public actions (no auth required)
    if (action === 'auth/signup') {
      return await handleSignup(params)
    }

    // Authenticated actions
    const ctx = await authenticate(req)
    const supabase = getServiceClient()

    switch (action) {
      // ── ENTITIES ──
      case 'entities/list': {
        const { data, error } = await supabase
          .from('tenant_entities')
          .select('*')
          .eq('tenant_id', ctx.tenantId)
          .eq('is_active', true)
          .order('raison_sociale')
        if (error) throw error
        return jsonResponse({ data })
      }

      case 'entities/create': {
        if (!await checkPermission(ctx, 'parametrage', 'create'))
          return jsonResponse({ error: 'Permission denied' }, 403)
        const { data, error } = await supabase
          .from('tenant_entities')
          .insert({ ...params, tenant_id: ctx.tenantId })
          .select()
          .single()
        if (error) throw error
        await auditLog(ctx, 'CREATE', 'entity', data.id, { raison_sociale: params.raison_sociale })
        return jsonResponse({ data })
      }

      // ── EXERCICES ──
      case 'exercices/list': {
        const { data, error } = await supabase
          .from('exercices')
          .select('*')
          .eq('tenant_id', ctx.tenantId)
          .eq('entity_id', params.entity_id)
          .order('date_debut', { ascending: false })
        if (error) throw error
        return jsonResponse({ data })
      }

      // ── BALANCE ──
      case 'balance/import': {
        if (!await checkPermission(ctx, 'balance', 'create'))
          return jsonResponse({ error: 'Permission denied' }, 403)

        const { exercice_id, nom_fichier, lignes } = params
        if (!exercice_id || !lignes || !Array.isArray(lignes))
          return jsonResponse({ error: 'exercice_id and lignes[] required' }, 400)

        // Create balance header
        const totalDebit = lignes.reduce((s: number, l: { debit_solde?: number }) => s + (l.debit_solde || 0), 0)
        const totalCredit = lignes.reduce((s: number, l: { credit_solde?: number }) => s + (l.credit_solde || 0), 0)

        const { data: balance, error: balErr } = await supabase
          .from('balances')
          .insert({
            tenant_id: ctx.tenantId,
            exercice_id,
            nom_fichier: nom_fichier || 'api-import',
            nb_lignes: lignes.length,
            total_debit: totalDebit,
            total_credit: totalCredit,
            equilibree: Math.abs(totalDebit - totalCredit) < 1,
            created_by: ctx.userId === 'api-key' ? null : ctx.userId,
          })
          .select()
          .single()
        if (balErr) throw balErr

        // Insert lines in batches
        for (let i = 0; i < lignes.length; i += 500) {
          const batch = lignes.slice(i, i + 500).map((l: Record<string, unknown>) => ({
            ...l,
            balance_id: balance.id,
            tenant_id: ctx.tenantId,
          }))
          const { error } = await supabase.from('lignes_balance').insert(batch)
          if (error) throw error
        }

        await auditLog(ctx, 'CREATE', 'balance', balance.id, { nb_lignes: lignes.length })
        return jsonResponse({ data: balance })
      }

      case 'balance/get': {
        if (!await checkPermission(ctx, 'balance', 'read'))
          return jsonResponse({ error: 'Permission denied' }, 403)

        const { data: balance, error: balErr } = await supabase
          .from('balances')
          .select('*')
          .eq('id', params.balance_id)
          .eq('tenant_id', ctx.tenantId)
          .single()
        if (balErr) throw balErr

        const { data: lignes, error: ligErr } = await supabase
          .from('lignes_balance')
          .select('*')
          .eq('balance_id', params.balance_id)
          .order('numero_compte')
        if (ligErr) throw ligErr

        return jsonResponse({ data: { ...balance, lignes } })
      }

      // ── LIASSE ──
      case 'liasse/generate': {
        if (!await checkPermission(ctx, 'liasse', 'create'))
          return jsonResponse({ error: 'Permission denied' }, 403)

        // Check quota
        const { data: tenant } = await supabase
          .from('tenants')
          .select('liasses_used, liasses_quota, plan')
          .eq('id', ctx.tenantId)
          .single()
        if (tenant && tenant.plan !== 'ENTERPRISE' && tenant.liasses_used >= tenant.liasses_quota) {
          return jsonResponse({ error: 'Quota exceeded', quota: tenant.liasses_quota, used: tenant.liasses_used }, 402)
        }

        const { data: liasse, error } = await supabase
          .from('liasses')
          .insert({
            tenant_id: ctx.tenantId,
            exercice_id: params.exercice_id,
            type_liasse: params.type_liasse || 'SN',
            statut: 'BROUILLON',
            donnees_json: params.donnees_json || {},
            score_validation: 0,
            date_generation: new Date().toISOString(),
            created_by: ctx.userId === 'api-key' ? null : ctx.userId,
          })
          .select()
          .single()
        if (error) throw error

        // Increment quota
        if (tenant) {
          await supabase
            .from('tenants')
            .update({ liasses_used: tenant.liasses_used + 1 })
            .eq('id', ctx.tenantId)
        }

        await auditLog(ctx, 'CREATE', 'liasse', liasse.id, { type_liasse: params.type_liasse })
        return jsonResponse({ data: liasse })
      }

      case 'liasse/get': {
        if (!await checkPermission(ctx, 'liasse', 'read'))
          return jsonResponse({ error: 'Permission denied' }, 403)
        const { data, error } = await supabase
          .from('liasses')
          .select('*')
          .eq('id', params.liasse_id)
          .eq('tenant_id', ctx.tenantId)
          .single()
        if (error) throw error
        return jsonResponse({ data })
      }

      case 'liasse/update': {
        if (!await checkPermission(ctx, 'liasse', 'update'))
          return jsonResponse({ error: 'Permission denied' }, 403)
        const { liasse_id, ...changes } = params
        const { data, error } = await supabase
          .from('liasses')
          .update(changes)
          .eq('id', liasse_id)
          .eq('tenant_id', ctx.tenantId)
          .select()
          .single()
        if (error) throw error
        await auditLog(ctx, 'UPDATE', 'liasse', liasse_id, { changes: Object.keys(changes) })
        return jsonResponse({ data })
      }

      // ── AUDIT ──
      case 'audit/run': {
        if (!await checkPermission(ctx, 'audit', 'create'))
          return jsonResponse({ error: 'Permission denied' }, 403)
        const { data, error } = await supabase
          .from('audit_sessions')
          .insert({
            tenant_id: ctx.tenantId,
            liasse_id: params.liasse_id || null,
            balance_id: params.balance_id || null,
            exercice_id: params.exercice_id || null,
            score_global: params.score || 0,
            nb_anomalies: params.nb_anomalies || 0,
            nb_errors: params.nb_errors || 0,
            nb_warnings: params.nb_warnings || 0,
            resultats_json: params.resultats || {},
            created_by: ctx.userId === 'api-key' ? null : ctx.userId,
          })
          .select()
          .single()
        if (error) throw error
        await auditLog(ctx, 'CREATE', 'audit', data.id, { score: params.score })
        return jsonResponse({ data })
      }

      case 'audit/results': {
        const { data, error } = await supabase
          .from('audit_sessions')
          .select('*')
          .eq('tenant_id', ctx.tenantId)
          .order('created_at', { ascending: false })
          .limit(params.limit || 10)
        if (error) throw error
        return jsonResponse({ data })
      }

      // ── DECLARATIONS ──
      case 'declarations/list': {
        const { data, error } = await supabase
          .from('declarations')
          .select('*')
          .eq('tenant_id', ctx.tenantId)
          .order('date_limite', { ascending: false })
        if (error) throw error
        return jsonResponse({ data })
      }

      case 'declarations/submit': {
        if (!await checkPermission(ctx, 'liasse', 'declare'))
          return jsonResponse({ error: 'Permission denied' }, 403)
        const { data, error } = await supabase
          .from('declarations')
          .insert({ ...params, tenant_id: ctx.tenantId })
          .select()
          .single()
        if (error) throw error
        await auditLog(ctx, 'DECLARE', 'declaration', data.id, { type: params.type_declaration })
        return jsonResponse({ data })
      }

      // ── AUDIT TRAIL ──
      case 'audit-trail/list': {
        let query = supabase
          .from('audit_trail')
          .select('*')
          .eq('tenant_id', ctx.tenantId)
          .order('id', { ascending: false })
          .limit(params.limit || 50)
        if (params.resource) query = query.eq('resource', params.resource)
        if (params.action) query = query.eq('action', params.action)
        const { data, error } = await query
        if (error) throw error
        return jsonResponse({ data })
      }

      case 'audit-trail/verify': {
        // Verify chain integrity (last N entries)
        const limit = params.limit || 100
        const { data: entries, error } = await supabase
          .from('audit_trail')
          .select('*')
          .eq('tenant_id', ctx.tenantId)
          .order('id', { ascending: true })
          .limit(limit)
        if (error) throw error

        let prevHash = '0000000000000000000000000000000000000000000000000000000000000000'
        let valid = true
        let brokenAt = null

        for (const entry of entries ?? []) {
          if (entry.prev_hash !== prevHash) {
            valid = false
            brokenAt = entry.id
            break
          }
          prevHash = entry.hash
        }

        return jsonResponse({ valid, checked: entries?.length ?? 0, brokenAt })
      }

      default:
        return jsonResponse({ error: `Unknown action: ${action}` }, 400)
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const status = message.includes('Permission denied') ? 403
      : message.includes('Invalid') || message.includes('Missing') ? 401
      : message.includes('Rate limit') ? 429
      : 500
    return jsonResponse({ error: message }, status)
  }
})

// ── Helpers ──

async function handleSignup(params: Record<string, unknown>) {
  const { email, password, full_name, organisation_name } = params
  if (!email || !password || !organisation_name) {
    return jsonResponse({ error: 'email, password, organisation_name required' }, 400)
  }

  const supabase = getServiceClient()

  // Create tenant
  const slug = (organisation_name as string).toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
  const { data: tenant, error: tenantErr } = await supabase
    .from('tenants')
    .insert({
      nom: organisation_name as string,
      slug: `${slug}-${Date.now().toString(36)}`,
      plan: 'STARTER',
      trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single()
  if (tenantErr) throw tenantErr

  // Create auth user
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email: email as string,
    password: password as string,
    user_metadata: { full_name: full_name || '' },
    email_confirm: true,
  })
  if (authErr) throw authErr

  // Link profile to tenant as OWNER
  await supabase
    .from('profiles')
    .update({ tenant_id: tenant.id, role: 'OWNER', full_name: (full_name as string) || '' })
    .eq('id', authData.user.id)

  return jsonResponse({
    data: {
      user: { id: authData.user.id, email: authData.user.email },
      tenant: { id: tenant.id, nom: tenant.nom, slug: tenant.slug },
    },
  })
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
