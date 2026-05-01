import type { CompteComptable } from '@/data/syscohada/plan'
import type { FonctionnementCompte, ChapitreOperations, EcritureExemple } from '@/data/syscohada/types'
import type { Balance } from '@/types'

// ── Intents ──────────────────────────────────────────────────────────
export type Intent =
  | 'GREETING'
  | 'HELP'
  | 'ACCOUNT_LOOKUP'
  | 'FONCTIONNEMENT'
  | 'CHAPITRE_LOOKUP'
  | 'OPERATION_SEARCH'
  | 'ACCOUNT_SEARCH'
  | 'CLASS_INFO'
  | 'VALIDATE_ACCOUNT'
  | 'STATS'
  // Fiscal
  | 'FISCAL_TAX_RATE'
  | 'FISCAL_CALCULATION'
  | 'FISCAL_DEDUCTIBILITY'
  | 'FISCAL_CALENDAR'
  | 'FISCAL_GENERAL'
  // Liasse
  | 'LIASSE_SHEET'
  | 'LIASSE_REGIME'
  | 'LIASSE_CATEGORY'
  | 'LIASSE_MAPPING'
  // Audit
  | 'AUDIT_CONTROL'
  | 'AUDIT_LEVEL'
  | 'AUDIT_GENERAL'
  | 'AUDIT_EXECUTE'
  // Predictive
  | 'PREDICTION_IS'
  | 'PREDICTION_TVA'
  | 'PREDICTION_RATIOS'
  | 'PREDICTION_TREND'
  | 'PREDICTION_FORECAST'
  | 'PREDICTION_ANOMALY'
  | 'PREDICTION_COHERENCE'
  | 'PREDICTION_GENERAL'
  | 'PREDICTION_SIG'
  | 'PREDICTION_BREAKEVEN'
  | 'PREDICTION_BFR'
  // Conditional reasoning
  | 'CONDITIONAL_DIAGNOSTIC'
  // Memory (Phase 8)
  | 'MEMORY_RECALL'
  | 'WHAT_IF'
  | 'UNKNOWN'

// ── Parsed query ─────────────────────────────────────────────────────
export interface ParsedQuery {
  intent: Intent
  raw: string
  normalized: string
  accountNumber?: string
  chapitreNumber?: number
  classeNumber?: number
  keywords: string[]
  fiscalCategory?: string
  noteNumber?: number
  sheetId?: string
  regimeName?: string
  auditRef?: string
  auditLevel?: number
  numericValue?: number
  posteRef?: string
  negation?: boolean
  temporal?: 'current' | 'previous' | 'comparison'
  secondaryIntents?: Intent[]
}

// ── Rich content blocks for assistant messages ───────────────────────
export interface AccountCard {
  type: 'account'
  compte: CompteComptable
  parent?: CompteComptable
  children?: CompteComptable[]
}

export interface FonctionnementCard {
  type: 'fonctionnement'
  numero: string
  libelle: string
  fonctionnement: FonctionnementCompte
}

export interface ChapitreCard {
  type: 'chapitre'
  chapitre: ChapitreOperations
}

export interface EcritureCard {
  type: 'ecriture'
  description: string
  ecriture: EcritureExemple
}

export interface SearchResultCard {
  type: 'search_results'
  results: { numero: string; libelle: string; detail?: string }[]
}

export interface StatsCard {
  type: 'stats'
  total: number
  obligatoires: number
  facultatifs: number
  parClasse: Record<number, number>
  chapitresOperations: number
}

export interface FiscalInfoCard {
  type: 'fiscal_info'
  category: string
  items: { label: string; value: string }[]
  calculation?: { steps: string[]; result: string }
}

export interface LiasseSheetCard {
  type: 'liasse_sheet'
  sheets: {
    id: string
    name: string
    title: string
    description?: string
    category: string
    required: boolean
    regimes?: Record<string, string>
  }[]
}

export interface AuditControlCard {
  type: 'audit_control'
  controls: {
    ref: string
    nom: string
    niveau: number
    description: string
    severite: string
    phase: string
  }[]
  summary?: string
}

export interface PredictionCard {
  type: 'prediction'
  title: string
  indicators: {
    label: string
    value: string
    status: 'excellent' | 'bon' | 'acceptable' | 'critique'
    trend?: 'up' | 'down' | 'stable'
  }[]
  narrative?: string
  recommendations?: string[]
}

export type RichContent =
  | AccountCard
  | FonctionnementCard
  | ChapitreCard
  | EcritureCard
  | SearchResultCard
  | StatsCard
  | FiscalInfoCard
  | LiasseSheetCard
  | AuditControlCard
  | PredictionCard

// ── Engine response ──────────────────────────────────────────────────
export interface Proph3tResponse {
  text: string
  content?: RichContent[]
  suggestions?: string[]
}

// ── Chat message ─────────────────────────────────────────────────────
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  content?: RichContent[]
  suggestions?: string[]
  timestamp: number
}

// ── Conversation context ─────────────────────────────────────────────
export interface ConversationContext {
  lastAccountNumber?: string
  lastChapitreNumber?: number
  lastClasseNumber?: number
  balanceData?: { balanceN: Balance[]; balanceN1?: Balance[] }
  lastFiscalCategory?: string
  lastAuditLevel?: number
  lastIntent?: Intent
  regime?: string
  entreprise?: {
    nom?: string
    regime_imposition?: string
    capital?: number
    effectifs?: number
    secteur_activite?: string
    /** Phase 6 — Régimes fiscaux spéciaux (opt-in déclaratifs) */
    /** Zone franche industrielle déclarée (IS exonéré, IMF maintenu) */
    zoneFranche?: boolean
    /** PME éligible au taux IS réduit 20% (CGI Art. 33 bis) */
    pmeEligible?: boolean
    /** Entité à but non lucratif (association/fondation) — IS 0% sur activités non-lucratives */
    ebnl?: boolean
    /** Coopérative agréée — IS 0% sur opérations entre membres */
    cooperative?: boolean
    /** Capital majoritairement détenu par des personnes physiques (critère PME) */
    capitalPhysiquesMajoritaire?: boolean
  }
  /** ID de la page liasse actuellement affichée (ex: 'note-15', 'bilan', 'actif') */
  currentLiassePage?: string
  /** True si une balance a été importée et chargée */
  balanceLoaded?: boolean

  // ─── Phase 8 : Mémoire conversationnelle multi-tours ───
  /**
   * Dernier calcul effectué — permet le rappel ("rappelle-moi mon IS")
   * et les questions de suivi ("et la TVA ?")
   */
  lastComputation?: {
    intent: Intent
    timestamp: number
    summary: string  // résumé textuel court (max 200 chars)
    /** Données structurées pour réutilisation (typage volontairement large) */
    data?: {
      ca?: number
      resultat_fiscal?: number
      is_du?: number
      tva_a_decaisser?: number
      score_audit?: number
      anomalies_count?: number
      [key: string]: number | string | boolean | undefined
    }
  }
  /** Dernière projection N+1/N+2 (Phase 3) pour comparaison ultérieure */
  lastForecast?: {
    timestamp: number
    periods: number
    ca_n1?: number
    ca_n2?: number
    resultat_n1?: number
    resultat_n2?: number
    confidence: string
  }
  /** Hypothèses déclarées par l'utilisateur (persistées sur N tours) */
  userHypotheses?: Record<string, {
    value: number | string | boolean
    description: string
    /** Nombre de tours restant avant expiration auto (défaut: persistant) */
    ttl?: number
  }>
  /** Historique court des derniers échanges (max 10) — pour "qu'est-ce que j'ai demandé ?" */
  history?: {
    role: 'user' | 'assistant'
    intent?: Intent
    text: string
    timestamp: number
  }[]
}
