/**
 * Edge Function: atlas-sso v20 — provisionne subscriptions.dossiers_limit
 *
 * v19 → v20 : ajoute provisionLiasspilotSubscription() qui :
 *   - crée ou met à jour public.subscriptions(user_id, app_id='taxpilot'|'liasspilot')
 *   - pose dossiers_limit selon le plan (Solo=1, Group/Business=10, Premium=25,
 *     Cabinet/Enterprise/illimité=-1, default=1)
 *   - active le trigger enforce_dossier_quota côté DB (migration 014)
 *   - best-effort : silently log + continue si la table refuse l'insert
 */
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ALLOWED_ORIGINS = [
  'http://localhost:5173', 'http://localhost:5174',
  'https://advist.atlasstudio.app', 'https://advist.app',
  'https://atlas-studio.org',
  'https://cockpit-fna.atlas-studio.org', 'https://atlas-fna.atlas-studio.org',
  'https://cockpit-journey.atlas-studio.org', 'https://liasspilot.atlas-studio.org',
  'https://scrutix.atlas-studio.org', 'https://tablesmart.atlas-studio.org',
  'https://atlas-crm.atlas-studio.org',
];
function getCorsHeaders(origin: string): Record<string, string> {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  };
}
function jsonResponse(data: unknown, status = 200, origin = ''): Response {
  return new Response(JSON.stringify(data), { status, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } });
}
function errorResponse(message: string, status = 500, origin = ''): Response {
  return jsonResponse({ error: message }, status, origin);
}

interface AtlasStudioClaims {
  userId: string; email: string; fullName: string; appId: string;
  plan?: string; iat: number; exp: number;
}
function base64UrlDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

const SUPPORTED_APPS = new Set([
  'advist', 'cockpit-fa', 'cockpit-journey', 'atlas-fa', 'atlas-compta',
  'taxpilot', 'scrutix', 'tablesmart', 'atlas-crm', 'liasspilot',
  'atlas-lease', 'atlas-mall-suite', 'atlasbanx', 'atlastrade', 'wisefm',
  'docjourney', 'duedeck', 'cashpilot',
]);

async function verifyAtlasJWT(token: string, secret: string): Promise<AtlasStudioClaims> {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Format JWT invalide');
  const [headerB64, payloadB64, signatureB64] = parts;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
  const valid = await crypto.subtle.verify('HMAC', key, base64UrlDecode(signatureB64), encoder.encode(`${headerB64}.${payloadB64}`));
  if (!valid) throw new Error('Signature JWT invalide');
  const claims: AtlasStudioClaims = JSON.parse(new TextDecoder().decode(base64UrlDecode(payloadB64)));
  const now = Math.floor(Date.now() / 1000);
  if (claims.exp && claims.exp < now) throw new Error('Token expire');
  if (!claims.email || !claims.userId) throw new Error('Claims obligatoires manquants');
  if (!SUPPORTED_APPS.has(claims.appId)) throw new Error(`appId non supporte: "${claims.appId}"`);
  return claims;
}

/**
 * Mappe un nom de plan free-text vers son quota de dossiers Liass'Pilot.
 *  -1 = illimité, entier positif = plafond strict, default 1 (le plus restrictif).
 * Plans observés Atlas Studio : Solo, Group, Business, Enterprise, Premium,
 * Entreprise, "Entreprise 1 societe".
 */
function dossiersLimitForPlan(plan: string | null | undefined): number {
  const p = (plan ?? '').toLowerCase().trim();
  if (p.includes('cabinet') || p.includes('illimit') || p.includes('unlimited')) return -1;
  if (p.includes('enterprise') && !p.match(/\b1\b/)) return -1;
  if (p.includes('premium')) return 25;
  if (p.includes('business') || p.includes('group') || p.includes('team')) return 10;
  if (p.includes('solo') || p.includes('starter') || p === 'entreprise' || /entreprise\s*1\s*soci/i.test(p)) return 1;
  return 1;
}

/**
 * Provisionne ou met à jour la subscription Liass'Pilot après SSO.
 * Active le trigger enforce_dossier_quota côté DB (migration 014).
 * Best-effort : ne bloque pas le SSO si la table refuse l'insert.
 */
async function provisionLiasspilotSubscription(
  supabase: SupabaseClient,
  userId: string,
  plan: string | null | undefined,
  appId: string,
): Promise<void> {
  if (appId !== 'liasspilot' && appId !== 'taxpilot') return;
  const limit = dossiersLimitForPlan(plan);

  const { data: existing, error: lookupErr } = await supabase
    .from('subscriptions')
    .select('id, plan, dossiers_limit')
    .eq('user_id', userId)
    .eq('app_id', appId)
    .maybeSingle();

  if (lookupErr) {
    console.warn('[atlas-sso] subscription lookup error:', lookupErr.message);
    return;
  }

  if (existing) {
    if (existing.plan !== plan || existing.dossiers_limit !== limit) {
      const { error: updErr } = await supabase
        .from('subscriptions')
        .update({
          plan: plan ?? existing.plan,
          dossiers_limit: limit,
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
      if (updErr) {
        console.warn('[atlas-sso] subscription update error:', updErr.message);
      } else {
        console.log(`[atlas-sso] subscription updated: user=${userId} app=${appId} plan="${plan}" dossiers_limit=${limit}`);
      }
    }
  } else {
    const { error: insErr } = await supabase.from('subscriptions').insert({
      user_id: userId,
      app_id: appId,
      plan: plan ?? 'Solo',
      dossiers_limit: limit,
      status: 'active',
      billing_cycle: 'monthly',
    });
    if (insErr) {
      console.warn('[atlas-sso] subscription insert error:', insErr.message);
    } else {
      console.log(`[atlas-sso] subscription created: user=${userId} app=${appId} plan="${plan}" dossiers_limit=${limit}`);
    }
  }
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const jwtSecret = Deno.env.get('JWT_SECRET')!;

Deno.serve(async (req) => {
  const origin = req.headers.get('origin') || '';
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(origin) });
  if (req.method !== 'POST') return errorResponse('Method not allowed', 405, origin);

  const supabase = createClient(supabaseUrl, supabaseServiceKey, { auth: { autoRefreshToken: false, persistSession: false } });

  const debugLog = async (payload: unknown) => {
    try { await supabase.from('proph3t_debug_log').insert({ fn: 'atlas-sso', payload }); } catch { /* ignore */ }
  };

  try {
    const { token } = await req.json();
    if (!token) return errorResponse('Token manquant', 400, origin);

    const claims = await verifyAtlasJWT(token, jwtSecret);

    let userId: string;
    const planMetadata: Record<string, string> = claims.plan ? { [`${claims.appId.replace(/-/g, '_')}_plan`]: claims.plan } : {};

    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u) => u.email === claims.email);

    if (existingUser) {
      userId = existingUser.id;
      await supabase.auth.admin.updateUserById(userId, {
        user_metadata: { full_name: claims.fullName, atlas_studio_id: claims.userId },
        app_metadata: { ...(existingUser.app_metadata ?? {}), ...planMetadata },
      });
    } else {
      const randomPassword = crypto.randomUUID() + '!Aa1';
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: claims.email, password: randomPassword, email_confirm: true,
        user_metadata: { full_name: claims.fullName, atlas_studio_id: claims.userId },
        app_metadata: planMetadata,
      });
      if (createError || !newUser.user) {
        await debugLog({ step: 'createUser', error: createError });
        return errorResponse("Impossible de creer l'utilisateur", 500, origin);
      }
      userId = newUser.user.id;
    }

    // Profile
    const { data: existingProfile } = await supabase.from('profiles').select('id').eq('id', userId).maybeSingle();
    if (!existingProfile) {
      const nameParts = claims.fullName.split(' ');
      await supabase.from('profiles').insert({
        id: userId, email: claims.email, full_name: claims.fullName,
        first_name: nameParts[0] || claims.fullName, last_name: nameParts.slice(1).join(' ') || '',
        role: 'client', is_active: true,
      });
    }

    // Provision Liass'Pilot subscription (dossiers_limit via trigger DB migration 014)
    if (claims.appId === 'liasspilot' || claims.appId === 'taxpilot') {
      try {
        await provisionLiasspilotSubscription(supabase, userId, claims.plan, claims.appId);
      } catch (subErr) {
        console.warn('[atlas-sso] provisionLiasspilotSubscription failed (non-fatal):',
          subErr instanceof Error ? subErr.message : subErr);
      }
    }

    // Generate magic link
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink', email: claims.email,
    });
    if (linkError || !linkData) {
      await debugLog({ step: 'generateLink', error: linkError });
      return errorResponse('Impossible de generer le lien de connexion', 500, origin);
    }

    // deno-lint-ignore no-explicit-any
    const props = (linkData.properties || {}) as Record<string, any>;
    let tokenHash: string | null = props.hashed_token || props.token_hash || props.email_otp || null;

    if (!tokenHash && props.action_link) {
      try {
        const url = new URL(props.action_link);
        tokenHash = url.searchParams.get('token_hash') || url.searchParams.get('token') || null;
      } catch { /* invalid URL */ }
    }

    if (!tokenHash) {
      await debugLog({ step: 'extract_token_hash', linkData_keys: Object.keys(linkData), properties_keys: Object.keys(props), action_link_preview: (props.action_link || '').slice(0, 200) });
      return errorResponse('hashed_token introuvable dans la reponse Supabase', 500, origin);
    }

    return jsonResponse({ token_hash: tokenHash, email: claims.email, type: 'magiclink', appId: claims.appId }, 200, origin);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur interne';
    await debugLog({ step: 'catch', error: message });
    return errorResponse(message, 401, origin);
  }
});
