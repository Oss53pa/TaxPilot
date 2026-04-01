/**
 * Types for pre-generation audit validation.
 * These types bridge the existing audit engine (audit.types.ts) with
 * the blocking-validation gate that runs before liasse generation.
 */

export enum AuditSeverity {
  BLOCKING = 'BLOCKING',
  WARNING = 'WARNING',
  INFO = 'INFO',
}

export interface AuditControl {
  id: string
  level: number
  name: string
  description: string
  severity: AuditSeverity
}

export interface AuditResult {
  controlId: string
  status: 'PASS' | 'FAIL' | 'SKIP'
  severity: AuditSeverity
  message: string
  details?: string
  suggestion?: string
}

export interface PreGenerationValidation {
  canGenerate: boolean
  blockingErrors: AuditResult[]
  warnings: AuditResult[]
  infos: AuditResult[]
  totalControls: number
  passedControls: number
}
