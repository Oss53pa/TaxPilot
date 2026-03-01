/**
 * NLP — Normalisation, tokenization, extraction numérique
 */

const STOP_WORDS = new Set([
  'le', 'la', 'les', 'de', 'du', 'des', 'un', 'une',
  'est', 'et', 'pour', 'dans', 'sur', 'avec', 'au', 'aux',
  'en', 'ce', 'se', 'sa', 'son', 'ses', 'que', 'qui',
  'ne', 'pas', 'plus', 'je', 'tu', 'il', 'nous', 'vous', 'ils',
  'me', 'te', 'ou', 'si', 'mon', 'ma', 'mes', 'ton', 'ta', 'tes',
  'a', 'y',
])

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[''`]/g, "'")
    // Handle French contractions: l', d', n', qu', j', s', c'
    .replace(/\b([ldnjsc]|qu)'/g, '$1 ')
    .replace(/[^\w\s']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function tokenize(text: string): string[] {
  return normalize(text)
    .split(' ')
    .filter(w => w.length > 1 && !STOP_WORDS.has(w))
}

/**
 * Detecte la presence d'une negation dans le texte brut
 * AVANT normalisation (pour ne pas perdre "ne" et "pas" dans les stop words)
 */
export function detectNegation(text: string): boolean {
  const lower = text.toLowerCase()
  return /\b(ne\s+\w+\s+pas|n\s*'\w+\s+pas|pas\s+de|non\s+|pas\s+|aucun|jamais|sans\s+)\b/.test(lower)
}

/**
 * Detecte les marqueurs temporels
 */
export function detectTemporal(text: string): 'current' | 'previous' | 'comparison' | undefined {
  const lower = text.toLowerCase()
  if (/\b(compar|vs|versus|par rapport|entre.*n.*n-1|n\s*et\s*n-1|evolution|progression|variation)\b/.test(lower)) return 'comparison'
  if (/\b(n-1|n ?minus|precedent|dernier|passe|ancien|avant|exercice precedent)\b/.test(lower)) return 'previous'
  if (/\b(actuel|courant|en cours|cette annee|cet exercice)\b/.test(lower)) return 'current'
  return undefined
}

export function extractNumericValue(text: string): number | undefined {
  // "10M", "10 millions" → 10_000_000
  const millionMatch = text.match(/(\d[\d\s.,]*)\s*(?:millions?|m)\b/i)
  if (millionMatch) {
    const num = parseFloat(millionMatch[1].replace(/[\s.]/g, '').replace(',', '.'))
    if (!isNaN(num)) return num * 1_000_000
  }

  // "50K", "50 mille" → 50_000
  const milleMatch = text.match(/(\d[\d\s.,]*)\s*(?:mille|k)\b/i)
  if (milleMatch) {
    const num = parseFloat(milleMatch[1].replace(/[\s.]/g, '').replace(',', '.'))
    if (!isNaN(num)) return num * 1_000
  }

  // "10 milliards" → 10_000_000_000
  const milliardMatch = text.match(/(\d[\d\s.,]*)\s*milliards?\b/i)
  if (milliardMatch) {
    const num = parseFloat(milliardMatch[1].replace(/[\s.]/g, '').replace(',', '.'))
    if (!isNaN(num)) return num * 1_000_000_000
  }

  // Plain number: "5000", "1 000 000", "5.000.000"
  const plainMatch = text.match(/\b(\d[\d\s.,]*\d)\b/)
  if (plainMatch) {
    const cleaned = plainMatch[1].replace(/[\s.]/g, '').replace(',', '.')
    const num = parseFloat(cleaned)
    if (!isNaN(num) && num >= 100) return num
  }

  return undefined
}
