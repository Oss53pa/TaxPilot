import { AuditSeverity, type AuditResult, type PreGenerationValidation } from '@/types/audit'

/**
 * Severity classification for all audit controls.
 * Controls starting with S- (structural) and F- (fundamental) are BLOCKING.
 * Level 2 conformity controls are BLOCKING.
 * Level 3-5 are WARNING.
 * Level 6+ are INFO (unless they detect data loss).
 */
const SEVERITY_MAP: Record<string, AuditSeverity> = {
  // Level 0: Structural — ALL BLOCKING
  'S-001': AuditSeverity.BLOCKING,
  'S-002': AuditSeverity.BLOCKING,
  'S-003': AuditSeverity.BLOCKING,
  'S-004': AuditSeverity.BLOCKING,
  'S-005': AuditSeverity.BLOCKING,
  'S-006': AuditSeverity.BLOCKING,
  'S-007': AuditSeverity.WARNING,
  'S-008': AuditSeverity.WARNING,
  'S-009': AuditSeverity.WARNING,
  'S-010': AuditSeverity.INFO,
  // Level 1: Fundamental Balance — BLOCKING
  'F-001': AuditSeverity.BLOCKING, // Equilibre general
  'F-002': AuditSeverity.WARNING,  // Equilibre N-1
  'F-003': AuditSeverity.BLOCKING, // Coherence resultat
  'F-004': AuditSeverity.BLOCKING, // Equilibre bilan
  'F-005': AuditSeverity.BLOCKING, // Classes essentielles
  'F-006': AuditSeverity.BLOCKING, // Compte capital
  'F-007': AuditSeverity.WARNING,
  'F-008': AuditSeverity.WARNING,
  'F-009': AuditSeverity.WARNING,
  'F-010': AuditSeverity.INFO,
  'F-011': AuditSeverity.INFO,
  'F-012': AuditSeverity.INFO,
  // Level 2: OHADA Conformity — BLOCKING for critical
  'C-001': AuditSeverity.BLOCKING, // Sens des comptes
  'C-002': AuditSeverity.BLOCKING, // Provisions <= Brut
  'C-003': AuditSeverity.WARNING,
  'C-004': AuditSeverity.WARNING,
  'C-005': AuditSeverity.WARNING,
  'C-006': AuditSeverity.WARNING,  // Couverture mapping > 95%
  'C-007': AuditSeverity.WARNING,
  'C-008': AuditSeverity.INFO,
  'C-009': AuditSeverity.INFO,
  'C-010': AuditSeverity.WARNING,
  'C-011': AuditSeverity.INFO,
  'C-012': AuditSeverity.INFO,
  'C-013': AuditSeverity.INFO,
  'C-014': AuditSeverity.INFO,
  'C-015': AuditSeverity.INFO,
}

function getSeverity(controlId: string): AuditSeverity {
  if (SEVERITY_MAP[controlId]) return SEVERITY_MAP[controlId]

  // Default severity by prefix
  if (controlId.startsWith('S-') || controlId.startsWith('F-')) return AuditSeverity.BLOCKING
  if (controlId.startsWith('C-')) return AuditSeverity.WARNING
  if (controlId.startsWith('SNS-')) return AuditSeverity.WARNING
  if (controlId.startsWith('IA-')) return AuditSeverity.WARNING
  if (controlId.startsWith('YoY-')) return AuditSeverity.INFO
  if (controlId.startsWith('EF-')) return AuditSeverity.WARNING
  if (controlId.startsWith('FIS-')) return AuditSeverity.WARNING
  if (controlId.startsWith('AR-')) return AuditSeverity.INFO

  return AuditSeverity.INFO
}

/**
 * Validate audit results before allowing liasse generation.
 * Returns a structured validation result indicating whether generation can proceed.
 */
export function validateBeforeGenerate(auditResults: AuditResult[]): PreGenerationValidation {
  const enriched = auditResults.map(r => ({
    ...r,
    severity: getSeverity(r.controlId),
  }))

  const failed = enriched.filter(r => r.status === 'FAIL')
  const blockingErrors = failed.filter(r => r.severity === AuditSeverity.BLOCKING)
  const warnings = failed.filter(r => r.severity === AuditSeverity.WARNING)
  const infos = failed.filter(r => r.severity === AuditSeverity.INFO)

  return {
    canGenerate: blockingErrors.length === 0,
    blockingErrors,
    warnings,
    infos,
    totalControls: auditResults.length,
    passedControls: auditResults.filter(r => r.status === 'PASS').length,
  }
}

export { getSeverity }
