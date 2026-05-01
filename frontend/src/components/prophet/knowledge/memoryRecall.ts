/**
 * Knowledge — Mémoire conversationnelle (Phase 8)
 *
 * Permet à Proph3t de :
 *   - Rappeler le dernier calcul effectué (IS, TVA, audit, projection)
 *   - Lister les hypothèses utilisateur en cours
 *   - Afficher l'historique récent des échanges
 *   - Gérer les questions "what-if" (et si CA = 300M ?)
 *
 * Les méthodes ne font que LIRE et FORMATER le contenu de ConversationContext.
 * L'écriture dans la mémoire est faite par Proph3tEngine.ts après chaque réponse.
 */

import type { ConversationContext, Proph3tResponse, FiscalInfoCard, PredictionCard, Intent } from '../types'

// ─── Helpers ──────────────────────────────────────────────────────────

function fmt(n: number): string {
  return Math.round(n).toLocaleString('fr-FR')
}

function ageHumain(timestamp: number, now: number = Date.now()): string {
  const diffMs = now - timestamp
  const sec = Math.round(diffMs / 1000)
  if (sec < 60) return `il y a ${sec}s`
  const min = Math.round(sec / 60)
  if (min < 60) return `il y a ${min}min`
  const h = Math.round(min / 60)
  return `il y a ${h}h`
}

function intentLabel(intent: Intent): string {
  const labels: Record<string, string> = {
    PREDICTION_IS: 'Estimation IS',
    PREDICTION_TVA: 'Estimation TVA',
    PREDICTION_RATIOS: 'Ratios financiers',
    PREDICTION_TREND: 'Tendances N/N-1',
    PREDICTION_FORECAST: 'Projection N+1/N+2',
    PREDICTION_SIG: 'SIG',
    PREDICTION_BFR: 'BFR',
    PREDICTION_BREAKEVEN: 'Seuil de rentabilité',
    PREDICTION_ANOMALY: 'Anomalies',
    PREDICTION_COHERENCE: 'Cohérence',
    PREDICTION_GENERAL: 'Analyse globale',
    AUDIT_EXECUTE: 'Audit complet',
    CONDITIONAL_DIAGNOSTIC: 'Diagnostic fiscal conditionnel',
  }
  return labels[intent] ?? intent
}

// ─── Public API ───────────────────────────────────────────────────────

/**
 * Génère une réponse Proph3t qui rappelle le contenu de la mémoire conversationnelle.
 * Inclut : dernier calcul, dernière projection, dernier score d'audit, hypothèses
 * actives, historique court.
 */
export function handleMemoryRecall(context: ConversationContext): Proph3tResponse {
  const items: { label: string; value: string }[] = []
  const now = Date.now()

  // ── Dernier calcul ──
  if (context.lastComputation) {
    const c = context.lastComputation
    items.push({ label: '── DERNIER CALCUL ──', value: '' })
    items.push({
      label: intentLabel(c.intent),
      value: `${c.summary} (${ageHumain(c.timestamp, now)})`,
    })
    if (c.data) {
      if (c.data.ca !== undefined) items.push({ label: '  CA', value: `${fmt(c.data.ca)} FCFA` })
      if (c.data.resultat_fiscal !== undefined) items.push({ label: '  Résultat fiscal', value: `${fmt(c.data.resultat_fiscal)} FCFA` })
      if (c.data.is_du !== undefined) items.push({ label: '  IS dû', value: `${fmt(c.data.is_du)} FCFA` })
      if (c.data.tva_a_decaisser !== undefined) items.push({ label: '  TVA à décaisser', value: `${fmt(c.data.tva_a_decaisser)} FCFA` })
      if (c.data.score_audit !== undefined) items.push({ label: '  Score audit', value: `${c.data.score_audit}/100` })
      if (c.data.anomalies_count !== undefined) items.push({ label: '  Anomalies', value: `${c.data.anomalies_count}` })
    }
  }

  // ── Dernière projection ──
  if (context.lastForecast) {
    const f = context.lastForecast
    items.push({ label: '── DERNIÈRE PROJECTION ──', value: '' })
    items.push({ label: 'Horizon', value: `N+${f.periods} (${ageHumain(f.timestamp, now)})` })
    if (f.ca_n1 !== undefined) items.push({ label: 'CA N+1', value: `${fmt(f.ca_n1)} FCFA` })
    if (f.ca_n2 !== undefined) items.push({ label: 'CA N+2', value: `${fmt(f.ca_n2)} FCFA` })
    if (f.resultat_n1 !== undefined) items.push({ label: 'Résultat N+1', value: `${fmt(f.resultat_n1)} FCFA` })
    if (f.resultat_n2 !== undefined) items.push({ label: 'Résultat N+2', value: `${fmt(f.resultat_n2)} FCFA` })
    items.push({ label: 'Confidence', value: f.confidence })
  }

  // ── Hypothèses utilisateur ──
  const hyps = context.userHypotheses ?? {}
  const hypEntries = Object.entries(hyps)
  if (hypEntries.length > 0) {
    items.push({ label: '── HYPOTHÈSES ACTIVES ──', value: '' })
    for (const [key, h] of hypEntries) {
      const val = typeof h.value === 'number' ? fmt(h.value) : String(h.value)
      items.push({ label: key, value: `${val} — ${h.description}` })
    }
  }

  // ── Historique récent (3 derniers user messages) ──
  const userHistory = (context.history ?? []).filter((h) => h.role === 'user').slice(-3)
  if (userHistory.length > 0) {
    items.push({ label: '── HISTORIQUE RÉCENT ──', value: '' })
    for (const h of userHistory) {
      const truncated = h.text.length > 60 ? h.text.slice(0, 60) + '...' : h.text
      items.push({ label: ageHumain(h.timestamp, now), value: truncated })
    }
  }

  // ── Si vraiment rien en mémoire ──
  if (items.length === 0) {
    return {
      text: "**Mémoire vide** — Aucun calcul, projection ou hypothèse en mémoire pour le moment.\n\nEffectuez un calcul (estimation IS, audit, projection) puis demandez 'rappelle-moi' pour récupérer les résultats.",
      suggestions: ['Estimation IS', 'Audit', 'Mes ratios', 'Projection N+1'],
    }
  }

  const card: FiscalInfoCard = {
    type: 'fiscal_info',
    category: 'Mémoire conversationnelle',
    items,
  }

  // Compter les sections pour le résumé
  const hasComputation = !!context.lastComputation
  const hasForecast = !!context.lastForecast
  const hasHypotheses = hypEntries.length > 0
  const hasHistory = userHistory.length > 0

  const resumeParts: string[] = []
  if (hasComputation) resumeParts.push(`dernier calcul : **${intentLabel(context.lastComputation!.intent)}**`)
  if (hasForecast) resumeParts.push(`projection N+${context.lastForecast!.periods}`)
  if (hasHypotheses) resumeParts.push(`${hypEntries.length} hypothèse${hypEntries.length > 1 ? 's' : ''} active${hypEntries.length > 1 ? 's' : ''}`)
  if (hasHistory) resumeParts.push(`${userHistory.length} échange${userHistory.length > 1 ? 's' : ''} récent${userHistory.length > 1 ? 's' : ''}`)

  return {
    text: `**Mémoire conversationnelle** — ${resumeParts.join(' · ')}.`,
    content: [card],
    suggestions: [
      hasComputation ? 'Refaire le calcul' : 'Estimation IS',
      hasForecast ? 'Comparer scénarios' : 'Projection N+1',
      'Hypothèses',
      'Effacer mémoire',
    ],
  }
}

// ─── Memory writers — appelés par l'engine après chaque calcul ────────

type ComputationData = NonNullable<ConversationContext['lastComputation']>['data']

/**
 * Écrit dans le contexte le résumé du dernier calcul.
 * À appeler depuis Proph3tEngine.ts après chaque PREDICTION_*.
 */
export function rememberComputation(
  context: ConversationContext,
  intent: Intent,
  summary: string,
  data?: ComputationData,
): ConversationContext {
  return {
    ...context,
    lastComputation: {
      intent,
      timestamp: Date.now(),
      summary: summary.length > 200 ? summary.slice(0, 200) + '...' : summary,
      data,
    },
  }
}

/**
 * Écrit la dernière projection (handlePredictionForecast).
 */
export function rememberForecast(
  context: ConversationContext,
  forecast: ConversationContext['lastForecast'],
): ConversationContext {
  return { ...context, lastForecast: forecast }
}

/**
 * Ajoute une hypothèse utilisateur. Les hypothèses persistent jusqu'à
 * suppression explicite ou expiration TTL.
 */
export function addHypothesis(
  context: ConversationContext,
  key: string,
  value: number | string | boolean,
  description: string,
  ttl?: number,
): ConversationContext {
  return {
    ...context,
    userHypotheses: {
      ...(context.userHypotheses ?? {}),
      [key]: { value, description, ttl },
    },
  }
}

/**
 * Décrémente le TTL des hypothèses et supprime celles expirées.
 * À appeler à chaque tour si TTL est utilisé.
 */
export function tickHypothesesTtl(context: ConversationContext): ConversationContext {
  const hyps = context.userHypotheses
  if (!hyps) return context

  const next: typeof hyps = {}
  for (const [key, h] of Object.entries(hyps)) {
    if (h.ttl === undefined) {
      next[key] = h // pas de TTL → persistant
    } else if (h.ttl > 1) {
      next[key] = { ...h, ttl: h.ttl - 1 }
    }
    // sinon expiré → on ne le met pas dans `next`
  }
  return { ...context, userHypotheses: next }
}

/**
 * Ajoute un message à l'historique court (max 10 entrées, FIFO).
 */
export function appendToHistory(
  context: ConversationContext,
  role: 'user' | 'assistant',
  text: string,
  intent?: Intent,
): ConversationContext {
  const MAX_HISTORY = 10
  const newEntry = { role, text, intent, timestamp: Date.now() }
  const history = [...(context.history ?? []), newEntry].slice(-MAX_HISTORY)
  return { ...context, history }
}

/**
 * Vide la mémoire conversationnelle (Phase 8 fields uniquement).
 *
 * Préserve les autres états du contexte (`balanceData`, `entreprise`, `regime`,
 * `lastAccountNumber`, etc.) qui sont des navigation/preferences et pas de la
 * mémoire conversationnelle. Pour vider l'intégralité du contexte, utiliser
 * un nouveau `ConversationContext` vide.
 */
export function clearConversationalMemory(context: ConversationContext): ConversationContext {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { lastComputation, lastForecast, userHypotheses, history, ...rest } = context
  return rest
}

/**
 * @deprecated Use `clearConversationalMemory` instead. Will be removed in v2.
 */
export const clearMemory = clearConversationalMemory

// ─── What-If handler (Phase 8.B) ──────────────────────────────────────

/**
 * Parse une requête what-if pour extraire l'hypothèse :
 *   "et si CA = 300M" → { key: 'ca', value: 300_000_000 }
 *   "imagine 50M de charges en plus" → { key: 'charges_diff', value: 50_000_000 }
 *   "considère un déficit de 30M" → { key: 'deficit_anterieur', value: 30_000_000 }
 *
 * Retourne null si l'hypothèse n'est pas exploitable.
 */
export function parseWhatIf(input: string): { key: string; value: number; description: string } | null {
  const lower = input.toLowerCase()

  // Extract the numeric value (with units M/K/milliards)
  const numMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*(milliards?|m|millions?|k|mille)?\b/)
  if (!numMatch) return null
  let value = parseFloat(numMatch[1].replace(',', '.'))
  const unit = numMatch[2]
  if (unit?.startsWith('milliard')) value *= 1_000_000_000
  else if (unit === 'm' || unit?.startsWith('million')) value *= 1_000_000
  else if (unit === 'k' || unit === 'mille') value *= 1_000

  // Identifier le concept
  if (/\bca\b|chiffre\s*affaire/.test(lower)) {
    return { key: 'ca_hypothetique', value, description: `CA hypothétique = ${fmt(value)} FCFA` }
  }
  if (/\bcharges?\b/.test(lower)) {
    return { key: 'charges_hypothetique', value, description: `Charges hypothétiques = ${fmt(value)} FCFA` }
  }
  if (/\bdeficit|deficitaire/.test(lower)) {
    return { key: 'deficit_anterieur', value, description: `Déficit antérieur = ${fmt(value)} FCFA (reportable 5 ans, CGI Art. 4)` }
  }
  if (/\bresultat\b/.test(lower)) {
    return { key: 'resultat_hypothetique', value, description: `Résultat hypothétique = ${fmt(value)} FCFA` }
  }
  return null
}

/**
 * Handler what-if — enregistre l'hypothèse et explique l'impact qualitatif.
 * Le recalcul effectif nécessitera un appel ultérieur à PREDICTION_IS / etc.
 */
export function handleWhatIf(
  input: string,
  context: ConversationContext,
): { response: Proph3tResponse; newContext: ConversationContext } {
  const parsed = parseWhatIf(input)

  if (!parsed) {
    return {
      response: {
        text: "**What-if** — Je n'ai pas pu extraire d'hypothèse de votre question.\n\nFormats supportés :\n- `et si CA = 300M`\n- `considère un déficit antérieur de 30M`\n- `imagine 50M de charges en plus`\n- `que se passe-t-il si résultat = 100M`",
        suggestions: ['Estimation IS', 'Mes ratios', 'Effacer hypothèses'],
      },
      newContext: context,
    }
  }

  const newContext = addHypothesis(context, parsed.key, parsed.value, parsed.description)

  // Indicateurs sur l'impact attendu
  const indicators: PredictionCard['indicators'] = []

  if (parsed.key === 'ca_hypothetique') {
    indicators.push({ label: 'CA hypothétique', value: `${fmt(parsed.value)} FCFA`, status: 'bon' })
    indicators.push({ label: 'Impact IMF', value: `${fmt(Math.max(3_000_000, Math.min(parsed.value * 0.005, 35_000_000)))} FCFA`, status: 'acceptable' })
  } else if (parsed.key === 'deficit_anterieur') {
    indicators.push({ label: 'Déficit reportable', value: `${fmt(parsed.value)} FCFA`, status: 'acceptable' })
    indicators.push({ label: 'Imputable jusqu\'à', value: '5 exercices', status: 'bon' })
  } else if (parsed.key === 'charges_hypothetique') {
    indicators.push({ label: 'Charges hypothétiques', value: `${fmt(parsed.value)} FCFA`, status: 'acceptable' })
    indicators.push({ label: 'Impact résultat', value: `-${fmt(parsed.value)} FCFA`, status: 'critique' })
  } else if (parsed.key === 'resultat_hypothetique') {
    indicators.push({ label: 'Résultat hypothétique', value: `${fmt(parsed.value)} FCFA`, status: parsed.value > 0 ? 'bon' : 'critique' })
    indicators.push({ label: 'IS estimé (25%)', value: `${fmt(Math.max(0, parsed.value * 0.25))} FCFA`, status: 'acceptable' })
  }

  const card: PredictionCard = {
    type: 'prediction',
    title: 'Hypothèse enregistrée',
    indicators,
    narrative: `Hypothèse '${parsed.key}' = ${fmt(parsed.value)} FCFA enregistrée. Demandez maintenant un nouveau calcul (estimation IS, projection, ratios) pour appliquer cette hypothèse.`,
  }

  return {
    response: {
      text: `**Hypothèse enregistrée** : ${parsed.description}\n\nElle sera prise en compte dans les prochains calculs. Tapez 'mémoire' pour voir toutes les hypothèses actives, ou 'estimation IS' pour relancer un calcul avec cette hypothèse.`,
      content: [card],
      suggestions: ['Estimation IS', 'Projection N+1', 'Mémoire', 'Effacer hypothèses'],
    },
    newContext,
  }
}
