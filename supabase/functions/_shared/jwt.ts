export interface AtlasStudioClaims {
  userId: string;
  email: string;
  fullName: string;
  appId: string;
  /** Plan acheté côté Atlas Studio (ex: "Entreprise 1 societe", "Cabinet illimite", "Cabinet 10 dossiers") */
  plan: string;
  /** Type de compte dérivé du plan ("entreprise" | "cabinet"). Optionnel — si absent, dérivé du `plan`. */
  accountType?: 'entreprise' | 'cabinet';
  iat: number;
  exp: number;
}

function base64UrlDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/**
 * Verifie la signature et la structure d'un JWT Atlas Studio.
 * IMPORTANT : ne verifie PAS la valeur de appId — la verification est faite
 * dynamiquement par index.ts contre la table public.apps.
 */
export async function verifyAtlasJWT(token: string, secret: string): Promise<AtlasStudioClaims> {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Format JWT invalide");
  const [headerB64, payloadB64, signatureB64] = parts;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  const data = encoder.encode(`${headerB64}.${payloadB64}`);
  const signature = base64UrlDecode(signatureB64);
  const valid = await crypto.subtle.verify("HMAC", key, signature, data);
  if (!valid) throw new Error("Signature JWT invalide");
  const payloadJson = new TextDecoder().decode(base64UrlDecode(payloadB64));
  const claims: AtlasStudioClaims = JSON.parse(payloadJson);
  const now = Math.floor(Date.now() / 1000);
  if (claims.exp && claims.exp < now) throw new Error("Token expiré");
  if (!claims.email || !claims.appId) throw new Error("Claims JWT manquants (email, appId)");
  return claims;
}

/**
 * Dérive le account_type Liass'Pilot à partir du plan Atlas Studio.
 * - Tout plan dont le nom contient "cabinet" (case-insensitive) → cabinet
 * - Sinon → entreprise (default safe)
 *
 * Aligne sur le naming des plans en BDD :
 *  - "Entreprise 1 societe", "Entreprise — Sur mesure" → entreprise
 *  - "Cabinet illimite", "Cabinet 10 dossiers"        → cabinet
 */
export function accountTypeFromPlan(plan: string | undefined): 'entreprise' | 'cabinet' {
  if (!plan) return 'entreprise';
  return plan.toLowerCase().includes('cabinet') ? 'cabinet' : 'entreprise';
}
