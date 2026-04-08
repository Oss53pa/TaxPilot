/**
 * Edge Function: atlas-sso
 * Receives a JWT from Atlas Studio, validates it, creates/finds a local
 * Supabase user + profile. Returns a magic link token_hash.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verifyAtlasJWT } from "../_shared/jwt.ts";
import { getCorsHeaders, jsonResponse, errorResponse } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const jwtSecret = Deno.env.get("JWT_SECRET")!;

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") || "";
  const cors = getCorsHeaders(origin);

  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return errorResponse("Method not allowed", 405, origin);

  try {
    const { token } = await req.json();
    if (!token) return errorResponse("Token manquant", 400, origin);

    const claims = await verifyAtlasJWT(token, jwtSecret);

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Find or create user
    let userId: string;
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u) => u.email === claims.email);

    if (existingUser) {
      userId = existingUser.id;
      await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
          full_name: claims.fullName,
          atlas_studio_id: claims.userId,
          atlas_plan: claims.plan,
          first_name: claims.fullName.split(" ")[0],
          last_name: claims.fullName.split(" ").slice(1).join(" "),
          user_type: "entreprise",
        },
      });
    } else {
      const randomPassword = crypto.randomUUID() + "!Aa1";
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: claims.email,
        password: randomPassword,
        email_confirm: true,
        user_metadata: {
          full_name: claims.fullName,
          atlas_studio_id: claims.userId,
          atlas_plan: claims.plan,
          first_name: claims.fullName.split(" ")[0],
          last_name: claims.fullName.split(" ").slice(1).join(" "),
          user_type: "entreprise",
        },
      });

      if (createError || !newUser.user) {
        console.error("Create user error:", createError);
        return errorResponse("Impossible de créer l'utilisateur", 500, origin);
      }
      userId = newUser.user.id;
    }

    // Ensure profile exists (FiscaSync uses profiles table with user_type)
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();

    if (!existingProfile) {
      await supabase.from("profiles").insert({
        id: userId,
        user_type: "entreprise",
        nom_entreprise: claims.fullName,
      });
    }

    // Generate magic link
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: claims.email,
    });

    if (linkError || !linkData) {
      console.error("Generate link error:", linkError);
      return errorResponse("Impossible de générer le lien de connexion", 500, origin);
    }

    const url = new URL(linkData.properties.action_link);
    const tokenHash = url.searchParams.get("token_hash") || url.hash;

    return jsonResponse({ token_hash: tokenHash, email: claims.email, type: "magiclink" }, 200, origin);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur interne";
    console.error("atlas-sso error:", error);
    return errorResponse(message, 401, origin);
  }
});
