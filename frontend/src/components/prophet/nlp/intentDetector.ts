/**
 * NLP — Détection d'intention multi-pattern pondérée
 * Remplace le detectIntent() inline de Proph3tEngine.ts
 */

import type { ParsedQuery, Intent, ConversationContext } from '../types'
import { normalize, tokenize, extractNumericValue, detectNegation, detectTemporal } from './normalize'
import { canonicalize, hasCanonical } from './synonyms'
import { fuzzyFind } from './fuzzyMatch'

// ── Entity extraction ────────────────────────────────────────────────

function extractAccountNumber(text: string): string | undefined {
  // Skip numbers preceded by keywords that indicate non-account entities
  const cleaned = text.replace(/\b(note|chapitre|classe|niveau|page|feuillet|acompte)\s*\d+/gi, '')
  const match = cleaned.match(/\b(\d{2,8})\b/)
  return match ? match[1] : undefined
}

function extractChapitreNumber(text: string): number | undefined {
  const match = text.match(/chapitre\s*(\d{1,2})/i)
  return match ? parseInt(match[1], 10) : undefined
}

function extractClasseNumber(text: string): number | undefined {
  const match = text.match(/classe\s*(\d)/i)
  return match ? parseInt(match[1], 10) : undefined
}

function extractAuditRef(text: string): string | undefined {
  // Matches: FI-003, ST-001, BA-012, etc.
  const match = text.match(/\b([A-Z]{2}-\d{3})\b/i)
  return match ? match[1].toUpperCase() : undefined
}

function extractAuditLevel(text: string): number | undefined {
  const match = text.match(/\bniveau\s*(\d)\b/i)
  return match ? parseInt(match[1], 10) : undefined
}

function extractNoteNumber(text: string): number | undefined {
  const match = text.match(/\bnote\s*(\d{1,2})\b/i)
  return match ? parseInt(match[1], 10) : undefined
}

function extractPosteRef(text: string): string | undefined {
  // Match "poste AD", "ref BJ", "rubrique CA", "ligne RA"
  const prefixed = text.match(/\b(?:poste|ref|rubrique|ligne|reference)\s+([A-Z]{2})\b/i)
  if (prefixed) return prefixed[1].toUpperCase()
  // Match standalone 2-letter refs in known ranges (A-D for bilan, R for charges, T for produits)
  const standalone = text.match(/\b([A-D][A-Z]|R[A-S]|T[A-O])\b/)
  if (standalone) return standalone[1].toUpperCase()
  return undefined
}

function extractRegimeName(text: string): string | undefined {
  const normalized = normalize(text)
  if (/reel\s*normal/.test(normalized)) return 'REEL_NORMAL'
  if (/reel\s*simplifie/.test(normalized) || /simplifie/.test(normalized)) return 'REEL_SIMPLIFIE'
  if (/forfaitaire/.test(normalized)) return 'FORFAITAIRE'
  if (/micro/.test(normalized)) return 'MICRO'
  return undefined
}

function extractFiscalCategory(text: string): string | undefined {
  const normalized = normalize(text)
  const categories = [
    { pattern: /\b(is|impot\s*societe|impot\s*benefice|bic)\b/, cat: 'IS' },
    { pattern: /\b(tva|taxe\s*valeur)\b/, cat: 'TVA' },
    { pattern: /\b(cnps|cotisation|retraite|securite\s*sociale)\b/, cat: 'CNPS' },
    { pattern: /\b(retenue|airsi|ircm|prelevement)\b/, cat: 'RETENUES' },
    { pattern: /\b(salaire|paie|paye|igr|remuneration)\b/, cat: 'SALAIRES' },
    { pattern: /\b(patente|contribution\s*patente)\b/, cat: 'LOCAUX' },
    { pattern: /\b(enregistrement|cession|baux)\b/, cat: 'ENREGISTREMENT' },
    { pattern: /\b(imf|minimum\s*forfaitaire)\b/, cat: 'IMF' },
  ]
  for (const { pattern, cat } of categories) {
    if (pattern.test(normalized)) return cat
  }
  return undefined
}

// ── Intent scoring ───────────────────────────────────────────────────

interface ScoredIntent {
  intent: Intent
  score: number
}

function scoreIntents(
  normalized: string,
  _tokens: string[],
  canonTokens: string[],
  negation: boolean,
  temporal: 'current' | 'previous' | 'comparison' | undefined,
  ctx: ConversationContext,
  rawInput: string,
): ScoredIntent[] {
  const scores: ScoredIntent[] = []

  function add(intent: Intent, score: number) {
    scores.push({ intent, score })
  }

  // ── Greeting ──
  if (/^(bonjour|salut|hello|hi|hey|bonsoir|coucou|yo)\b/.test(normalized)) {
    add('GREETING', 100)
  }

  // ── Help ──
  if (/\b(aide|help|que peux|quoi faire|comment utiliser|fonctionnalite|capacite)\b/.test(normalized)) {
    add('HELP', 100)
  }

  // ── Stats ──
  if (/\b(combien|statistique|statistiques|stats|nombre total|resume plan)\b/.test(normalized)) {
    add('STATS', 80)
  }

  // ── Fiscal domain ──
  const hasFiscal = hasCanonical(canonTokens, 'impot') || hasCanonical(canonTokens, 'tva') ||
    hasCanonical(canonTokens, 'is') || hasCanonical(canonTokens, 'patente') ||
    hasCanonical(canonTokens, 'cnps') || hasCanonical(canonTokens, 'retenue') ||
    /\b(fiscal|fiscaux|fiscalite|imposition)\b/.test(normalized)

  if (hasFiscal) {
    // Tax rate questions
    if (/\b(taux|pourcentage|combien|quel)\b/.test(normalized) || /\btaux\b/.test(normalized)) {
      add('FISCAL_TAX_RATE', 85)
    }
    // Calculation
    if (/\b(calculer|calcul|combien|montant)\b/.test(normalized) && extractNumericValue(normalized)) {
      add('FISCAL_CALCULATION', 90)
    }
    // Deductibility
    if (/\b(deductib|non deductib|plafond|deduction)\b/.test(normalized)) {
      add('FISCAL_DEDUCTIBILITY', 85)
    }
    // Calendar
    if (/\b(calendrier|echeance|date|quand|delai|acompte|declaration)\b/.test(normalized)) {
      add('FISCAL_CALENDAR', 85)
    }
    // General fiscal
    add('FISCAL_GENERAL', 60)
  }

  // ── Liasse domain ──
  const hasLiasse = hasCanonical(canonTokens, 'liasse') ||
    /\b(feuillet|note\s*\d|note\s*annexe|annexe)\b/.test(normalized)

  if (hasLiasse || extractNoteNumber(normalized) !== undefined) {
    if (extractNoteNumber(normalized) !== undefined || /\b(feuillet|onglet|sheet)\b/.test(normalized)) {
      add('LIASSE_SHEET', 85)
    }
    if (extractRegimeName(normalized) || /\b(regime|reel|simplifie|forfaitaire|micro)\b/.test(normalized)) {
      add('LIASSE_REGIME', 85)
    }
    if (/\b(categorie|type|cover|guards|fiches|statements|notes|supplements)\b/.test(normalized)) {
      add('LIASSE_CATEGORY', 80)
    }
    if (hasLiasse) {
      add('LIASSE_SHEET', 55)
    }
  }

  // ── Liasse mapping domain ──
  if (/\b(mapping|correspondance|ventilation|ou va|quel poste|dans quel|dans la liasse|compose|composition|rubrique|dans le bilan|dans le compte de resultat|quel.* compte.* compose|quels comptes)\b/.test(normalized)) {
    add('LIASSE_MAPPING', 85)
  }
  if (/\b(?:poste|ref|rubrique|ligne)\s+[a-z]{2}\b/.test(normalized)) {
    add('LIASSE_MAPPING', 90)
  }

  // ── Audit domain ──
  const hasAudit = hasCanonical(canonTokens, 'audit') ||
    /\b(audit|controle\s*audit|verification|inspection)\b/.test(normalized)

  if (hasAudit || extractAuditRef(rawInput) || extractAuditLevel(normalized) !== undefined) {
    if (extractAuditRef(rawInput)) {
      add('AUDIT_CONTROL', 90)
    }
    if (extractAuditLevel(normalized) !== undefined) {
      add('AUDIT_LEVEL', 85)
    }
    // Audit execution (run controls on balance)
    if (/\b(lance|lancer|execut|audite|auditer|controler?\s*ma|verif.*balance|scanner|diagnostiqu|lance.*controle|execut.*controle|run|lancer.*audit)\b/.test(normalized)) {
      add('AUDIT_EXECUTE', 90)
    }
    if (hasAudit) {
      add('AUDIT_GENERAL', 60)
    }
  }

  // ── Prediction domain ──
  const hasPrediction = hasCanonical(canonTokens, 'prevision') || hasCanonical(canonTokens, 'ratio') ||
    /\b(analyser|analyse|prediction|prevision|situation|sante|diagnostic|prospectif)\b/.test(normalized)

  if (hasPrediction || /\b(ratio|indicateur|tendance|anomalie|sig|soldes?\s*intermediaires?|ebe|marge\s*commerciale|cafg|seuil\s*(?:de\s+)?rentabilite|point\s*mort|break\s*even|breakeven|bfr|besoin\s*(?:en\s+)?fonds?\s*(?:de\s+)?roulement|dso|dpo|dsi|cycle\s*(?:de\s+)?cash|cycle\s*(?:de\s+)?tresorerie|fonds?\s*(?:de\s+)?roulement)\b/.test(normalized)) {
    if (/\b(is|impot|benefice|resultat\s*fiscal)\b/.test(normalized) && hasPrediction) {
      add('PREDICTION_IS', 80)
    }
    if (/\b(tva|taxe\s*valeur)\b/.test(normalized) && hasPrediction) {
      add('PREDICTION_TVA', 80)
    }
    if (hasCanonical(canonTokens, 'ratio') || /\b(ratio|indicateur|kpi|liquidite|endettement|rentabilite)\b/.test(normalized)) {
      add('PREDICTION_RATIOS', 80)
    }
    if (/\b(tendance|evolution|comparaison|compare|progression)\b/.test(normalized)) {
      add('PREDICTION_TREND', 80)
    }
    if (/\b(anomalie|alerte|risque|probleme|irregularite)\b/.test(normalized)) {
      add('PREDICTION_ANOMALY', 80)
    }
    if (/\b(coherence|coherent|equilibre|equilibr|verif.*coherence|controle.*coherence|incoherence|bilan.*passif|actif.*passif)\b/.test(normalized)) {
      add('PREDICTION_COHERENCE', 85)
    }
    // SIG
    if (/\b(sig|soldes?\s*intermediaires?|cascade|marge\s*commerciale|valeur\s*ajoutee|ebe|excedent\s*brut|cafg)\b/.test(normalized)) {
      add('PREDICTION_SIG', 85)
    }
    // Seuil de rentabilite / breakeven
    if (/\b(seuil\s*(?:de\s+)?rentabilite|point\s*mort|break\s*even|breakeven|seuil\s*(?:d\s*)?equilibre|charges?\s*fixes?\s*(?:et\s+)?variables?)\b/.test(normalized)) {
      add('PREDICTION_BREAKEVEN', 92)
    }
    // BFR
    if (/\b(bfr|besoin\s*(?:en\s+)?fonds?\s*(?:de\s+)?roulement|dso|dpo|dsi|cycle\s*(?:de\s+)?cash|cycle\s*(?:de\s+)?tresorerie|tresorerie\s*nette|fonds?\s*(?:de\s+)?roulement)\b/.test(normalized)) {
      add('PREDICTION_BFR', 85)
    }
    if (hasPrediction && /\b(general|global|complet|situation|sante|diagnostic|synthese)\b/.test(normalized)) {
      add('PREDICTION_GENERAL', 75)
    }
    // Conditional diagnostic (regime-aware, deductibility, seuils)
    if (/\b(diagnostic|conseil|recommandation|optimis|regime.*adapt|quel regime|mon regime|seuil|deductib.*analyse|obligations?\s*fiscal|bilan fiscal|situation fiscal)\b/.test(normalized)) {
      add('CONDITIONAL_DIAGNOSTIC', 88)
    }
    // Bare "analyse" or "prediction" without specific sub-domain
    if (hasPrediction) {
      add('PREDICTION_GENERAL', 50)
    }
  }

  // ── SYSCOHADA domain (existing intents) ──
  if (/\b(valide|existe|verif|correct)\b/.test(normalized)) {
    add('VALIDATE_ACCOUNT', 70)
  }
  if (/\b(fonctionnement|debit.?credit|fonctionne|mouvement)\b/.test(normalized)) {
    add('FONCTIONNEMENT', 75)
  }
  if (/chapitre\s*\d/.test(normalized)) {
    add('CHAPITRE_LOOKUP', 80)
  }
  if (/classe\s*\d/.test(normalized)) {
    add('CLASS_INFO', 80)
  }
  if (/\b(comptabiliser|ecriture|enregistrer|journal|operation|passer|saisir)\b/.test(normalized)) {
    add('OPERATION_SEARCH', 70)
  }
  if (/\b(chercher|trouver|rechercher|quel compte|quel est le compte)\b/.test(normalized)) {
    add('ACCOUNT_SEARCH', 70)
  }

  // ── Negation adjustments ──
  if (negation) {
    // "pas deductible" / "non deductible" → boost deductibility intent
    if (/\b(deductib|conforme|valide)\b/.test(normalized)) {
      add('FISCAL_DEDUCTIBILITY', 90)
    }
    // "pas coherent" / "incoherent" → boost coherence
    if (/\b(coherent|equilibr|correct)\b/.test(normalized)) {
      add('PREDICTION_COHERENCE', 90)
    }
    // "pas conforme" → boost anomaly detection
    if (/\b(conforme|normal|regulier)\b/.test(normalized)) {
      add('PREDICTION_ANOMALY', 85)
    }
  }

  // ── Temporal adjustments ──
  if (temporal === 'comparison' || temporal === 'previous') {
    // Boost trend analysis for temporal queries
    add('PREDICTION_TREND', 88)
  }

  // ── Contextual follow-up boosting ──
  if (ctx.lastIntent) {
    const isShort = normalized.split(' ').length <= 4
    if (isShort) {
      // "et la TVA?" after PREDICTION_IS → boost PREDICTION_TVA
      if (ctx.lastIntent.startsWith('PREDICTION_') && /\b(tva)\b/.test(normalized)) {
        add('PREDICTION_TVA', 92)
      }
      if (ctx.lastIntent.startsWith('PREDICTION_') && /\b(is|impot)\b/.test(normalized)) {
        add('PREDICTION_IS', 92)
      }
      if (ctx.lastIntent.startsWith('PREDICTION_') && /\b(ratio)\b/.test(normalized)) {
        add('PREDICTION_RATIOS', 92)
      }
      if (ctx.lastIntent.startsWith('PREDICTION_') && /\b(coherence)\b/.test(normalized)) {
        add('PREDICTION_COHERENCE', 92)
      }
      // "et l'audit?" after any analysis
      if (ctx.lastIntent.startsWith('PREDICTION_') && /\b(audit)\b/.test(normalized)) {
        add('AUDIT_EXECUTE', 92)
      }
    }
  }

  // ── Compound query escalation ──
  // "analyse complete", "tout verifier", "diagnostic complet"
  if (/\b(complet|tout|global|synthese complete|tout verifier|full|bilan complet)\b/.test(normalized) && hasPrediction) {
    add('PREDICTION_GENERAL', 90)
  }

  return scores
}

// ── Main detect function ─────────────────────────────────────────────

export function detectIntent(input: string, ctx: ConversationContext): ParsedQuery {
  const normalized = normalize(input)
  const tokens = tokenize(input)
  const canonTokens = tokens.map(t => canonicalize(t))

  const accountNumber = extractAccountNumber(normalized)
  const chapitreNumber = extractChapitreNumber(normalized)
  const classeNumber = extractClasseNumber(normalized)
  const auditRef = extractAuditRef(input) // Use raw input for case-sensitive refs
  const auditLevel = extractAuditLevel(normalized)
  const noteNumber = extractNoteNumber(normalized)
  const regimeName = extractRegimeName(normalized)
  const fiscalCategory = extractFiscalCategory(normalized)
  const numericValue = extractNumericValue(normalized)
  const posteRef = extractPosteRef(input)
  const negation = detectNegation(input)
  const temporal = detectTemporal(input)

  const base: ParsedQuery = {
    intent: 'UNKNOWN',
    raw: input,
    normalized,
    keywords: tokens,
    accountNumber,
    chapitreNumber,
    classeNumber,
    auditRef,
    auditLevel,
    noteNumber,
    regimeName,
    fiscalCategory,
    numericValue,
    posteRef,
    negation,
    temporal,
  }

  // ── Contextual follow-ups (check before scoring) ──
  if (/\b(son fonctionnement|ses sous|sous.?comptes|detail|plus d.?info)\b/.test(normalized) && ctx.lastAccountNumber) {
    if (/fonctionnement/.test(normalized)) {
      return { ...base, accountNumber: ctx.lastAccountNumber, intent: 'FONCTIONNEMENT' }
    }
    return { ...base, accountNumber: ctx.lastAccountNumber, intent: 'ACCOUNT_LOOKUP' }
  }

  // ── Direct account number (high priority) ──
  if (accountNumber && /^\d{2,8}$/.test(normalized.trim())) {
    return { ...base, intent: 'ACCOUNT_LOOKUP' }
  }
  if (/\bcompte\s+\d/.test(normalized) && accountNumber) {
    return { ...base, intent: 'ACCOUNT_LOOKUP' }
  }

  // Score all intents
  const scores = scoreIntents(normalized, tokens, canonTokens, negation, temporal, ctx, input)

  // If we have scores, pick the highest + extract secondary intents
  if (scores.length > 0) {
    scores.sort((a, b) => b.score - a.score)
    base.intent = scores[0].intent

    // Multi-intent: detect compound queries with "et", "aussi", "egalement"
    if (/\b(et\s+(?:aussi|egalement)?|aussi|egalement|ainsi que|plus)\b/.test(normalized) && scores.length >= 2) {
      // Collect unique secondary intents (different from primary, score >= 70)
      const secondaries = scores
        .filter((s, i) => i > 0 && s.intent !== base.intent && s.score >= 70)
        .map(s => s.intent)
        .filter((v, i, a) => a.indexOf(v) === i) // unique
        .slice(0, 2)
      if (secondaries.length > 0) {
        base.secondaryIntents = secondaries
      }
    }

    return base
  }

  // ── Fallback: if there's an account number, try lookup ──
  if (accountNumber) {
    return { ...base, intent: 'ACCOUNT_LOOKUP' }
  }

  // ── Fuzzy fallback for fiscal keywords ──
  const fiscalKeywords = ['impot', 'fiscalite', 'tva', 'patente', 'cnps', 'retenue', 'deductible', 'liasse', 'audit', 'ratio', 'prevision', 'analyse']
  for (const token of tokens) {
    const match = fuzzyFind(token, fiscalKeywords, 2)
    if (match) {
      if (['impot', 'fiscalite', 'tva', 'patente', 'cnps', 'retenue'].includes(match)) {
        return { ...base, intent: 'FISCAL_GENERAL' }
      }
      if (match === 'deductible') return { ...base, intent: 'FISCAL_DEDUCTIBILITY' }
      if (match === 'liasse') return { ...base, intent: 'LIASSE_SHEET' }
      if (match === 'audit') return { ...base, intent: 'AUDIT_GENERAL' }
      if (['ratio', 'prevision', 'analyse'].includes(match)) return { ...base, intent: 'PREDICTION_GENERAL' }
    }
  }

  return base
}
