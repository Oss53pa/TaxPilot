/**
 * Types pour le module d'Audit de Balance - Moteur de Controles 108 points
 * Conforme SYSCOHADA Revise
 */

import { BalanceEntry } from '@/services/liasseDataService'

// --- Enums / Unions ---

export type Severite = 'BLOQUANT' | 'MAJEUR' | 'MINEUR' | 'INFO' | 'OK'

export type NiveauControle = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export type PhaseAudit = 'PHASE_1' | 'PHASE_2' | 'PHASE_3'

export type StatutSession = 'EN_ATTENTE' | 'EN_COURS' | 'TERMINEE' | 'ERREUR' | 'ANNULEE'

export type StatutControle = 'OK' | 'ANOMALIE' | 'NON_APPLICABLE' | 'ERREUR_EXEC'

export type StatutBalance = 'brute' | 'auditee' | 'corrigee' | 'validee' | 'deployee'

export interface ExerciceConfig {
  year: number
  date_debut: string
  date_fin: string
  type: 'N' | 'N-1'
}

export interface RapportPartie2Item {
  ref: string
  nom: string
  severiteV1: Severite
  severiteV2: Severite
  evolution: 'corrige' | 'non_corrige' | 'nouveau'
}

export interface RapportPartie2 {
  id: string
  sessionAvantId: string
  sessionApresId: string
  dateGeneration: string
  items: RapportPartie2Item[]
  comptesModifies: CompteModifie[]
  synthese: {
    corriges: number
    nonCorriges: number
    nouveaux: number
    bloquantsRestants: number
    conforme: boolean
  }
}

// --- Noms de niveaux ---

export const NIVEAUX_NOMS: Record<NiveauControle, string> = {
  0: 'Controles structurels',
  1: 'Controles fondamentaux',
  2: 'Conformite OHADA',
  3: 'Sens et montants',
  4: 'Inter-comptes',
  5: 'Comparaison N/N-1',
  6: 'Etats financiers',
  7: 'Controles fiscaux',
  8: 'Archives multi-exercices',
}

// --- Resultat d'un controle ---

export interface EcritureComptableLigne {
  sens: 'D' | 'C'
  compte: string
  libelle: string
  montant: number
}

export interface EcritureComptable {
  journal: string
  date: string
  lignes: EcritureComptableLigne[]
  commentaire?: string
}

export interface ResultatControle {
  ref: string
  nom: string
  niveau: NiveauControle
  statut: StatutControle
  severite: Severite
  message: string
  details?: {
    comptes?: string[]
    montants?: Record<string, number>
    ecart?: number
    description?: string
  }
  suggestion?: string
  ecrituresCorrectives?: EcritureComptable[]
  referenceReglementaire?: string
  timestamp: string
}

// --- Definition d'un controle ---

export interface ControleDefinition {
  ref: string
  niveau: NiveauControle
  nom: string
  description: string
  severiteDefaut: Severite
  phase: PhaseAudit
  actif: boolean
}

// --- Contexte d'execution ---

export interface AuditContext {
  balanceN: BalanceEntry[]
  balanceN1?: BalanceEntry[]
  planComptable: import('@/data/SYSCOHADARevisePlan').CompteComptable[]
  liassesArchivees?: ArchiveAudit[]
  exercice?: string
  mappingSyscohada?: typeof import('@/services/liasseDataService').SYSCOHADA_MAPPING
  typeLiasse?: import('@/types').TypeLiasse
}

// --- Session d'audit ---

export interface ResumeAudit {
  totalControles: number
  parSeverite: Record<Severite, number>
  parNiveau: Record<number, { total: number; ok: number; anomalies: number }>
  scoreGlobal: number
  bloquantsRestants: number
}

export interface SessionAudit {
  id: string
  balanceId: string
  exercice: string
  phase: PhaseAudit
  statut: StatutSession
  dateDebut: string
  dateFin?: string
  progression: {
    niveauCourant: NiveauControle
    controleCourant: number
    totalControles: number
    pourcentage: number
  }
  resultats: ResultatControle[]
  resume: ResumeAudit
}

// --- Rapport de corrections ---

export interface CorrectionItem {
  ref: string
  nom: string
  statutAvant: StatutControle
  severiteAvant: Severite
  statutApres: StatutControle
  severiteApres: Severite
  evolution: 'CORRIGE' | 'AMELIORE' | 'INCHANGE' | 'DEGRADE'
}

export interface CompteModifie {
  compte: string
  libelle: string
  soldeAvant: number
  soldeApres: number
  ecart: number
}

export interface RapportCorrection {
  id: string
  sessionAvantId: string
  sessionApresId: string
  dateGeneration: string
  corrections: CorrectionItem[]
  comptesModifies: CompteModifie[]
  synthese: {
    bloquantsAvant: number
    bloquantsApres: number
    majeursAvant: number
    majeursApres: number
    scoreAvant: number
    scoreApres: number
  }
}

// --- Snapshot de balance ---

export interface BalanceSnapshot {
  id: string
  balanceId: string
  date: string
  lignes: BalanceEntry[]
  totalDebit: number
  totalCredit: number
  hash: string
}

// --- Archive ---

export interface ArchiveAudit {
  id: string
  exercice: string
  dateArchivage: string
  session: SessionAudit
  snapshot: BalanceSnapshot
  hash: string
}

// --- Fonction de controle ---

export type ControlFunction = (context: AuditContext) => ResultatControle | ResultatControle[]

// --- Callbacks de progression ---

export interface AuditProgressCallback {
  onProgress: (niveau: NiveauControle, index: number, total: number, ref: string) => void
  onLevelStart: (niveau: NiveauControle, nom: string) => void
  onLevelEnd: (niveau: NiveauControle, resultats: ResultatControle[]) => void
  onComplete: (resume: ResumeAudit) => void
  isCancelled: () => boolean
}
