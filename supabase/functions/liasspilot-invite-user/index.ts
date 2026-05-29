/**
 * Edge Function: liasspilot-invite-user
 * ---------------------------------------------------------------------------
 * Invitation d'un collaborateur par un administrateur Liass'Pilot.
 *
 * Adapté du système « Cockpit FnA » (cockpit-invite-user) au stack réel de
 * Liass'Pilot : tables lp_organizations / lp_user_orgs / lp_org_members
 * (modèle self-org, voir migration 015) + Resend pour l'email HTML.
 *
 * Flux :
 *   1. SEC-01 — authentifie l'appelant via son JWT (Authorization: Bearer).
 *   2. Autorisation — l'appelant doit être admin de son org. L'acheteur
 *      Atlas Studio (aucune appartenance) est admin par défaut : on
 *      « bootstrap » alors son org self (id = son uid) en admin.
 *   3. Crée (ou retrouve) l'utilisateur invité côté auth.
 *   4. Génère un lien Supabase :
 *        - type 'invite'   pour un nouvel utilisateur,
 *        - type 'recovery' si l'utilisateur existe déjà (renvoi).
 *      On extrait le token_hash (anti-prefetch) et on construit un lien
 *      propre vers /auth/accept-invite.
 *   5. Upsert roster lp_org_members + appartenance lp_user_orgs.
 *   6. Envoie l'email HTML via Resend avec le lien d'action injecté.
 *
 * Secrets requis (Supabase → Edge Functions → Secrets) :
 *   - SUPABASE_URL                (auto)
 *   - SUPABASE_SERVICE_ROLE_KEY   (auto)
 *   - SUPABASE_ANON_KEY           (auto)
 *   - RESEND_API_KEY
 *   - RESEND_FROM (ou FROM_EMAIL)  ex: "Liass'Pilot <noreply@liasspilot.com>"
 *   - APP_URL (optionnel)          ex: "https://liasspilot.atlas-studio.org"
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// CORS inline (fonction auto-suffisante — pas de dépendance _shared pour un
// déploiement mono-fichier robuste).
const CORS_ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3006',
  'https://liasspilot.atlasstudio.app',
  'https://liasspilot.atlas-studio.org',
  'https://liasspilot.app',
  'https://atlas-studio.org',
];
function getCorsHeaders(origin: string): Record<string, string> {
  const allowed = CORS_ALLOWED_ORIGINS.includes(origin) ? origin : CORS_ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const RESEND_FROM = Deno.env.get('RESEND_FROM') || Deno.env.get('FROM_EMAIL') ||
  "Liass'Pilot <noreply@liasspilot.com>";

const ALLOWED_APP_URLS = new Set([
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3006',
  'https://liasspilot.atlasstudio.app',
  'https://liasspilot.atlas-studio.org',
  'https://liasspilot.app',
]);
const DEFAULT_APP_URL = Deno.env.get('APP_URL') || 'https://liasspilot.atlas-studio.org';

const INVITABLE_ROLES = new Set(['admin', 'comptable', 'auditeur', 'viewer']);

const ROLE_LABELS: Record<string, string> = {
  owner: 'Propriétaire',
  admin: 'Administrateur',
  comptable: 'Comptable',
  auditeur: 'Auditeur',
  viewer: 'Lecture seule',
};

interface InviteBody {
  email?: string;
  fullName?: string;
  role?: string;
}

function resolveAppUrl(origin: string): string {
  if (origin && ALLOWED_APP_URLS.has(origin)) return origin;
  return DEFAULT_APP_URL;
}

/** Extrait le token_hash de la réponse generateLink (anti-prefetch). */
// deno-lint-ignore no-explicit-any
function extractTokenHash(linkData: any): string | null {
  const props = (linkData?.properties || {}) as Record<string, unknown>;
  let tokenHash =
    (props.hashed_token as string) ||
    (props.token_hash as string) ||
    (props.email_otp as string) ||
    null;
  if (!tokenHash && typeof props.action_link === 'string') {
    try {
      const url = new URL(props.action_link);
      tokenHash =
        url.searchParams.get('token_hash') || url.searchParams.get('token') || null;
    } catch {
      /* invalid URL */
    }
  }
  return tokenHash;
}

function buildInvitationEmail(params: {
  fullName: string;
  roleLabel: string;
  actionLink: string;
  inviterName: string;
}): string {
  // Échappement HTML des champs libres (anti-injection dans l'email).
  const esc = (v: string) =>
    (v ?? '').replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
  const fullName = esc(params.fullName);
  const inviterName = esc(params.inviterName);
  const roleLabel = esc(params.roleLabel);
  const { actionLink } = params;
  const greeting = fullName ? `Bonjour ${fullName},` : 'Bonjour,';
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f4;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">
    <div style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8e6;box-shadow:0 4px 20px rgba(15,118,110,0.06);">
      <div style="background:linear-gradient(135deg,#0f766e 0%,#115e59 100%);padding:32px;">
        <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.01em;">Liass'Pilot</h1>
        <p style="margin:6px 0 0;color:#99f6e4;font-size:13px;">Solution Fiscale OHADA</p>
      </div>
      <div style="padding:32px;">
        <p style="color:#0f172a;font-size:16px;margin:0 0 16px;font-weight:600;">${greeting}</p>
        <p style="color:#334155;font-size:15px;line-height:1.6;margin:0 0 16px;">
          <strong>${inviterName}</strong> vous invite à rejoindre son espace Liass'Pilot
          en tant que <strong style="color:#0f766e;">${roleLabel}</strong>.
        </p>
        <p style="color:#334155;font-size:15px;line-height:1.6;margin:0 0 24px;">
          Cliquez sur le bouton ci-dessous pour confirmer votre adresse email,
          définir votre mot de passe et accéder à l'application.
        </p>
        <div style="text-align:center;margin:0 0 24px;">
          <a href="${actionLink}"
             style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;
                    padding:14px 36px;border-radius:10px;font-weight:700;font-size:15px;">
            Activer mon accès
          </a>
        </div>
        <p style="color:#94a3b8;font-size:12px;line-height:1.5;margin:0 0 8px;">
          Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :
        </p>
        <p style="word-break:break-all;font-size:12px;margin:0;">
          <a href="${actionLink}" style="color:#0f766e;">${actionLink}</a>
        </p>
        <hr style="border:none;border-top:1px solid #e2e8e6;margin:24px 0;"/>
        <p style="color:#94a3b8;font-size:12px;margin:0;line-height:1.5;">
          Ce lien est personnel et à usage unique. Si vous n'attendiez pas cette invitation,
          vous pouvez ignorer cet email.<br/>
          &copy; ${new Date().getFullYear()} Liass'Pilot — Solution Fiscale OHADA
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin') || '';
  const cors = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });

  try {
    // ── SEC-01: authentifier l'appelant ──
    const authHeader = req.headers.get('Authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      return json({ error: 'Authentification requise' }, 401);
    }
    const callerClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: callerData, error: callerErr } = await callerClient.auth.getUser();
    if (callerErr || !callerData?.user) {
      return json({ error: 'Session invalide' }, 401);
    }
    const caller = callerData.user;
    const callerName =
      (caller.user_metadata?.full_name as string) ||
      [caller.user_metadata?.first_name, caller.user_metadata?.last_name]
        .filter(Boolean)
        .join(' ') ||
      caller.email ||
      'Un administrateur';

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // ── Autorisation : l'appelant doit être admin de son org ──
    // Source de vérité = lp_user_orgs (cf. migration 015). L'acheteur Atlas
    // Studio sans appartenance est admin par défaut → on bootstrap son org
    // self (id = son uid) + sa ligne admin + sa ligne roster.
    const { data: callerOrg } = await admin
      .from('lp_user_orgs')
      .select('org_id, role, active')
      .eq('user_id', caller.id)
      .eq('active', true)
      .maybeSingle();

    let orgId: string;
    if (!callerOrg) {
      orgId = caller.id;
      await admin.from('lp_organizations').upsert(
        { id: orgId, name: callerName },
        { onConflict: 'id' },
      );
      await admin.from('lp_user_orgs').upsert(
        { user_id: caller.id, org_id: orgId, role: 'admin', active: true },
        { onConflict: 'user_id,org_id' },
      );
      await admin.from('lp_org_members').upsert(
        {
          org_id: orgId,
          email: (caller.email || '').toLowerCase(),
          name: callerName,
          role: 'admin',
          active: true,
          last_login_at: new Date().toISOString(),
        },
        { onConflict: 'org_id,email' },
      );
    } else {
      if (callerOrg.role !== 'admin') {
        return json({ error: 'Accès refusé : rôle administrateur requis.' }, 403);
      }
      orgId = callerOrg.org_id as string;
    }

    // ── Validation du corps ──
    const body = (await req.json()) as InviteBody;
    const email = (body.email || '').trim().toLowerCase();
    const fullName = (body.fullName || '').trim();
    const role = (body.role || 'comptable').trim();

    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return json({ error: 'Adresse email invalide.' }, 400);
    }
    if (!INVITABLE_ROLES.has(role)) {
      return json({ error: `Rôle invalide : ${role}` }, 400);
    }

    // ── L'utilisateur invité existe-t-il déjà ? ──
    // listUsers paginé : on cherche par email (best-effort, 1ère page large).
    const { data: usersPage } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const existing = usersPage?.users?.find(
      (u) => (u.email || '').toLowerCase() === email,
    );

    const appUrl = resolveAppUrl(origin);
    const redirectTo = `${appUrl}/auth/accept-invite`;

    let inviteeId: string | null = existing?.id ?? null;
    let otpType: 'invite' | 'recovery' = existing ? 'recovery' : 'invite';
    // deno-lint-ignore no-explicit-any
    let linkData: any = null;
    // deno-lint-ignore no-explicit-any
    let linkErr: any = null;

    if (!existing) {
      const res = await admin.auth.admin.generateLink({
        type: 'invite',
        email,
        options: {
          data: { full_name: fullName, invited_role: role },
          redirectTo,
        },
      });
      linkData = res.data;
      linkErr = res.error;
      inviteeId = linkData?.user?.id ?? inviteeId;
      otpType = 'invite';

      // Fallback : si l'utilisateur existait en réalité (course), bascule recovery.
      if (linkErr) {
        const rec = await admin.auth.admin.generateLink({
          type: 'recovery',
          email,
          options: { redirectTo },
        });
        linkData = rec.data;
        linkErr = rec.error;
        inviteeId = linkData?.user?.id ?? inviteeId;
        otpType = 'recovery';
      }
    } else {
      const res = await admin.auth.admin.generateLink({
        type: 'recovery',
        email,
        options: { redirectTo },
      });
      linkData = res.data;
      linkErr = res.error;
      inviteeId = linkData?.user?.id ?? inviteeId;
      otpType = 'recovery';
    }

    if (linkErr || !linkData) {
      return json(
        { error: `Impossible de générer le lien d'invitation : ${linkErr?.message ?? 'inconnu'}` },
        500,
      );
    }

    const tokenHash = extractTokenHash(linkData);
    if (!tokenHash || !inviteeId) {
      return json({ error: "Lien d'invitation introuvable dans la réponse Supabase." }, 500);
    }

    // ── Lien propre anti-prefetch vers la page d'acceptation ──
    const actionLink =
      `${appUrl}/auth/accept-invite?token_hash=${encodeURIComponent(tokenHash)}` +
      `&type=${otpType}&email=${encodeURIComponent(email)}`;

    // ── Upsert roster (clé email) ──
    const { error: rosterErr } = await admin.from('lp_org_members').upsert(
      {
        org_id: orgId,
        email,
        name: fullName || email,
        role,
        active: true,
        invited_by: caller.id,
        invited_at: new Date().toISOString(),
      },
      { onConflict: 'org_id,email' },
    );
    if (rosterErr) {
      return json({ error: `Erreur enregistrement membre : ${rosterErr.message}` }, 500);
    }

    // ── Upsert appartenance authoritative (accès effectif dès acceptation) ──
    const { error: membershipErr } = await admin.from('lp_user_orgs').upsert(
      { user_id: inviteeId, org_id: orgId, role, active: true },
      { onConflict: 'user_id,org_id' },
    );
    if (membershipErr) {
      return json({ error: `Erreur enregistrement appartenance : ${membershipErr.message}` }, 500);
    }

    // ── Envoi de l'email HTML via Resend (best-effort) ──
    let emailSent = false;
    let emailError: string | null = null;
    if (RESEND_API_KEY) {
      try {
        const html = buildInvitationEmail({
          fullName,
          roleLabel: ROLE_LABELS[role] || role,
          actionLink,
          inviterName: callerName,
        });
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: RESEND_FROM,
            to: [email],
            subject: `Invitation à rejoindre ${callerName} sur Liass'Pilot`,
            html,
            tags: [{ name: 'type', value: 'invitation' }],
          }),
        });
        if (resendRes.ok) {
          emailSent = true;
        } else {
          emailError = await resendRes.text();
        }
      } catch (e) {
        emailError = e instanceof Error ? e.message : 'Erreur Resend inconnue';
      }
    } else {
      emailError = 'RESEND_API_KEY non configurée';
    }

    return json({
      success: true,
      email,
      userId: inviteeId,
      role,
      resent: !!existing,
      emailSent,
      emailError,
      // Le lien est renvoyé pour permettre à l'admin de le copier/partager
      // manuellement si l'email n'a pas pu être envoyé.
      link: actionLink,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur interne';
    return json({ error: message }, 500);
  }
});
