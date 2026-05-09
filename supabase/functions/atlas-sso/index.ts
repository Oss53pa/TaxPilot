import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verifyAtlasJWT, accountTypeFromPlan } from "../_shared/jwt.ts";
import { corsHeaders, jsonResponse, errorResponse } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const jwtSecret = Deno.env.get("JWT_SECRET")!;

async function findUserByEmail(supabase: SupabaseClient, email: string) {
  const perPage = 1000;
  for (let page = 1; ; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const found = data.users.find((u) => u.email === email);
    if (found) return found;
    if (data.users.length < perPage) return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return errorResponse("Method not allowed", 405);

  try {
    const { token } = await req.json();
    if (!token) return errorResponse("Token manquant", 400);

    // 1) Verifier la signature et la structure du JWT (sans verifier l'appId — on le fait dynamiquement ensuite)
    const claims = await verifyAtlasJWT(token, jwtSecret);

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 2) LOOKUP DYNAMIQUE : verifier que l'appId existe dans la table apps et est available
    const { data: appRow, error: appErr } = await supabase
      .from("apps")
      .select("id, name, status")
      .eq("id", claims.appId)
      .maybeSingle();
    if (appErr) {
      console.error("[atlas-sso] apps lookup error:", appErr.message);
      return errorResponse("Erreur lookup apps: " + appErr.message, 500);
    }
    if (!appRow) {
      return errorResponse(`App inconnue : ${claims.appId} (absente du catalogue Atlas Studio)`, 401);
    }
    if (appRow.status !== "available") {
      return errorResponse(`App ${claims.appId} non disponible (status: ${appRow.status})`, 403);
    }

    // 2bis) Derivation account_type depuis le plan acheté (entreprise|cabinet)
    //       Source de vérité = JWT.plan posé par Atlas Studio à l'achat.
    //       Override possible via JWT.accountType si Atlas Studio le fournit explicitement.
    const accountType = claims.accountType ?? accountTypeFromPlan(claims.plan);

    // 3) Trouver ou creer l'utilisateur
    let userId: string;
    const existingUser = await findUserByEmail(supabase, claims.email);
    if (existingUser) {
      userId = existingUser.id;
      await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
          full_name: claims.fullName,
          atlas_studio_id: claims.userId,
          account_type: accountType,
          // Alias backward-compat pour code legacy lisant user_type
          user_type: accountType,
        },
      });
    } else {
      const randomPassword = crypto.randomUUID() + "!Aa1";
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: claims.email, password: randomPassword, email_confirm: true,
        user_metadata: {
          full_name: claims.fullName,
          atlas_studio_id: claims.userId,
          account_type: accountType,
          user_type: accountType,
        },
      });
      if (createError || !newUser.user) {
        return errorResponse("Impossible de créer l'utilisateur: " + (createError?.message || "unknown"), 500);
      }
      userId = newUser.user.id;
    }

    // 4) Mettre a jour / creer le profile (avec account_type synchronisé sur le plan courant)
    const { data: adminRole, error: roleErr } = await supabase
      .from("roles").select("id").eq("code", "admin").single();
    if (!adminRole) {
      return errorResponse("Rôle admin introuvable: " + (roleErr?.message || "empty"), 500);
    }

    const { data: existingProfile } = await supabase
      .from("profiles").select("id").eq("id", userId).maybeSingle();

    if (existingProfile) {
      const { error: updProfErr } = await supabase.from("profiles").update({
        email: claims.email,
        first_name: claims.fullName.split(" ")[0] || claims.fullName,
        last_name: claims.fullName.split(" ").slice(1).join(" ") || "",
        role_id: adminRole.id,
        is_active: true,
        account_type: accountType,
        updated_at: new Date().toISOString(),
      }).eq("id", userId);
      if (updProfErr) {
        return errorResponse("Erreur update profile: " + updProfErr.message, 500);
      }
    } else {
      const { error: insProfErr } = await supabase.from("profiles").insert({
        id: userId,
        email: claims.email,
        username: claims.email.split("@")[0],
        first_name: claims.fullName.split(" ")[0] || claims.fullName,
        last_name: claims.fullName.split(" ").slice(1).join(" ") || "",
        role_id: adminRole.id,
        is_active: true,
        account_type: accountType,
      });
      if (insProfErr) {
        return errorResponse("Erreur insert profile: " + insProfErr.message, 500);
      }
    }

    // 5) Generer un token_hash (mecanisme magiclink interne, transparent pour l'user)
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "magiclink", email: claims.email,
    });
    if (linkError || !linkData) {
      return errorResponse("Impossible de générer le lien: " + (linkError?.message || "unknown"), 500);
    }

    // deno-lint-ignore no-explicit-any
    const props = linkData.properties as any;
    let tokenHash: string | null = props?.hashed_token || null;
    if (!tokenHash && props?.action_link) {
      try {
        const url = new URL(props.action_link);
        tokenHash = url.searchParams.get("token_hash") || url.searchParams.get("token") || null;
      } catch (_e) { /* ignore */ }
    }
    if (!tokenHash) {
      console.error("[atlas-sso] No token_hash in properties:", JSON.stringify(props));
      return errorResponse("token_hash absent du linkData", 500);
    }

    return jsonResponse({
      token_hash: tokenHash,
      email: claims.email,
      type: "magiclink",
      appId: claims.appId,
      appName: appRow.name,
      account_type: accountType,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur interne";
    console.error("[atlas-sso] CATCH:", message, error instanceof Error ? error.stack : "");
    return errorResponse(message, 401);
  }
});
