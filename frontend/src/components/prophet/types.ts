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
  // Audit
  | 'AUDIT_CONTROL'
  | 'AUDIT_LEVEL'
  | 'AUDIT_GENERAL'
  // Predictive
  | 'PREDICTION_IS'
  | 'PREDICTION_TVA'
  | 'PREDICTION_RATIOS'
  | 'PREDICTION_TREND'
  | 'PREDICTION_ANOMALY'
  | 'PREDICTION_COHERENCE'
  | 'PREDICTION_GENERAL'
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
}
