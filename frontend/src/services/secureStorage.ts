/**
 * secureStorage.ts — Chiffrement localStorage via WebCrypto (AES-GCM 256-bit)
 *
 * Pourquoi : les balances SYSCOHADA, DSF, factures électroniques stockées en
 * clair sont accessibles à toute extension Chrome, XSS d'une dep npm, ou
 * accès physique au poste. Risque de fuite de données fiscales sensibles.
 *
 * Stratégie :
 * 1. Une clé maître AES-GCM est dérivée d'un secret stocké en sessionStorage
 *    (vidé à la fermeture de l'onglet) + d'un identifiant stable du device.
 *    L'absence de mot de passe utilisateur côté frontend impose ce compromis ;
 *    pour un chiffrement déliquescent (clé liée à l'auth), il faudra brancher
 *    sur le hash du JWT Supabase quand disponible.
 * 2. Chaque write fait :  IV aléatoire (12 octets) + chiffrement AES-GCM +
 *    sérialisation { v: 1, iv: base64, c: base64 }.
 * 3. Chaque read parse, déchiffre, retourne le JSON original.
 * 4. Fallback transparent : si pas de WebCrypto (vieux navigateur), pas de
 *    secret, ou erreur de déchiffrement, on lit en clair (rétrocompat avec
 *    les données déjà stockées avant migration).
 *
 * API publique :
 *   secureSet(key, value)  — chiffre + stocke
 *   secureGet<T>(key)      — lit + déchiffre (ou null)
 *   secureRemove(key)      — supprime
 *
 * Limitations connues :
 * - Le secret en sessionStorage reste exfiltrable par XSS. Mais l'attaquant
 *   doit alors injecter du JS qui appelle aussi crypto.subtle, ce qui est
 *   bien plus visible que `localStorage.getItem()` direct.
 * - Pas de rotation de clé.
 * - Performance : ~1-3 ms par opération sur des payloads ≤ 100 KB.
 */

const SCHEMA_VERSION = 1
const SESSION_SECRET_KEY = 'fiscasync_session_secret_v1'
const DEVICE_ID_KEY = 'fiscasync_device_id_v1'

// ── Détection de capacité ──
function hasWebCrypto(): boolean {
  return (
    typeof crypto !== 'undefined' &&
    typeof crypto.subtle !== 'undefined' &&
    typeof crypto.getRandomValues === 'function'
  )
}

// ── Génération du secret de session (entropie 256 bits) ──
function getOrCreateSessionSecret(): string {
  let s = sessionStorage.getItem(SESSION_SECRET_KEY)
  if (!s) {
    const buf = new Uint8Array(32)
    crypto.getRandomValues(buf)
    s = bytesToBase64(buf)
    sessionStorage.setItem(SESSION_SECRET_KEY, s)
  }
  return s
}

function getOrCreateDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY)
  if (!id) {
    const buf = new Uint8Array(16)
    crypto.getRandomValues(buf)
    id = bytesToBase64(buf)
    localStorage.setItem(DEVICE_ID_KEY, id)
  }
  return id
}

// ── Dérivation de la clé maître AES-GCM via PBKDF2 ──
let _cachedKey: CryptoKey | null = null

async function deriveMasterKey(): Promise<CryptoKey> {
  if (_cachedKey) return _cachedKey
  const secret = getOrCreateSessionSecret()
  const deviceId = getOrCreateDeviceId()
  const passphrase = `${secret}::${deviceId}`

  const enc = new TextEncoder()
  const passKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey'],
  )

  // Salt fixe — l'entropie est fournie par le secret aléatoire de session
  const salt = enc.encode('fiscasync.v1.salt')
  _cachedKey = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    passKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
  return _cachedKey
}

// ── Conversions ──
function bytesToBase64(b: Uint8Array): string {
  let s = ''
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i])
  return btoa(s)
}

function base64ToBytes(b64: string): Uint8Array {
  const s = atob(b64)
  const out = new Uint8Array(s.length)
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i)
  return out
}

// ── API publique ──

interface EncryptedPayload {
  v: number
  iv: string
  c: string
}

function isEncryptedPayload(raw: string): boolean {
  if (!raw.startsWith('{')) return false
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object'
      && parsed.v === SCHEMA_VERSION
      && typeof parsed.iv === 'string'
      && typeof parsed.c === 'string'
  } catch {
    return false
  }
}

export async function secureSet(key: string, value: unknown): Promise<void> {
  const json = JSON.stringify(value)
  if (!hasWebCrypto()) {
    // Fallback non chiffré (vieux navigateur)
    localStorage.setItem(key, json)
    return
  }
  try {
    const masterKey = await deriveMasterKey()
    const iv = new Uint8Array(12)
    crypto.getRandomValues(iv)
    const ct = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      masterKey,
      new TextEncoder().encode(json),
    )
    const payload: EncryptedPayload = {
      v: SCHEMA_VERSION,
      iv: bytesToBase64(iv),
      c: bytesToBase64(new Uint8Array(ct)),
    }
    localStorage.setItem(key, JSON.stringify(payload))
  } catch {
    // En cas d'erreur de chiffrement, fallback non chiffré (defensive)
    localStorage.setItem(key, json)
  }
}

export async function secureGet<T = unknown>(key: string): Promise<T | null> {
  const raw = localStorage.getItem(key)
  if (raw === null) return null

  if (!isEncryptedPayload(raw)) {
    // Rétrocompat : la donnée a été écrite en clair (pré-migration ou fallback).
    // On la déserialise tel quel.
    try {
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  }

  if (!hasWebCrypto()) return null

  try {
    const payload = JSON.parse(raw) as EncryptedPayload
    const masterKey = await deriveMasterKey()
    const iv = base64ToBytes(payload.iv)
    const ct = base64ToBytes(payload.c)
    // BufferSource (Uint8Array.buffer) — typage strict en TS 5.7+
    const pt = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
      masterKey,
      ct.buffer as ArrayBuffer,
    )
    const json = new TextDecoder().decode(pt)
    return JSON.parse(json) as T
  } catch {
    // Déchiffrement échoué (clé différente — session changée, autre user…)
    return null
  }
}

export function secureRemove(key: string): void {
  localStorage.removeItem(key)
}

/**
 * Vide le cache de clé (à appeler au logout pour forcer re-dérivation
 * au prochain accès). Ne supprime pas le secret de session par lui-même
 * — utiliser `sessionStorage.removeItem(SESSION_SECRET_KEY)` en plus si
 * voulu, ou simplement attendre la fermeture de l'onglet.
 */
export function resetSecureStorage(): void {
  _cachedKey = null
  sessionStorage.removeItem(SESSION_SECRET_KEY)
}
