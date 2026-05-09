export interface AtlasStudioClaims {
  userId: string;
  email: string;
  fullName: string;
  appId: string;
  /** Plan acheté côté Atlas Studio (ex: "entreprise", "cabinet_10", "cabinet_unlimited") */
  plan: string;
  /** Type de profil dérivé du plan ("entreprise" | "cabinet") — optionnel, fallback dérivé de `plan` */
  userType?: 'entreprise' | 'cabinet';
  iat: number;
  exp: number;
}

/**
 * Dérive le user_type Liass'Pilot à partir du plan Atlas Studio.
 * - Tout plan dont l'identifiant commence par "cabinet" → cabinet
 * - Sinon → entreprise (default safe fallback)
 */
export function userTypeFromPlan(plan: string | undefined): 'entreprise' | 'cabinet' {
  if (!plan) return 'entreprise';
  return plan.toLowerCase().startsWith('cabinet') ? 'cabinet' : 'entreprise';
}

function base64UrlDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function verifyAtlasJWT(
  token: string,
  secret: string
): Promise<AtlasStudioClaims> {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Format JWT invalide");

  const [headerB64, payloadB64, signatureB64] = parts;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );

  const data = encoder.encode(`${headerB64}.${payloadB64}`);
  const signature = base64UrlDecode(signatureB64);
  const valid = await crypto.subtle.verify("HMAC", key, signature, data);
  if (!valid) throw new Error("Signature JWT invalide");

  const payloadJson = new TextDecoder().decode(base64UrlDecode(payloadB64));
  const claims: AtlasStudioClaims = JSON.parse(payloadJson);

  const now = Math.floor(Date.now() / 1000);
  if (claims.exp && claims.exp < now) throw new Error("Token expiré");
  if (!claims.email || !claims.userId) throw new Error("Claims obligatoires manquants");
  if (claims.appId !== "taxpilot") {
    throw new Error(`Token destiné à "${claims.appId}", attendu "taxpilot"`);
  }

  return claims;
}
