import { describe, it, expect } from 'vitest'
import { validateBeforeGenerate, getSeverity } from '@/services/preGenerationValidator'
import { AuditSeverity, type AuditResult } from '@/types/audit'

describe('Pre-Generation Validator', () => {
  describe('getSeverity', () => {
    describe('mapped controls', () => {
      it('classifies S-001 through S-006 as BLOCKING', () => {
        expect(getSeverity('S-001')).toBe(AuditSeverity.BLOCKING)
        expect(getSeverity('S-002')).toBe(AuditSeverity.BLOCKING)
        expect(getSeverity('S-003')).toBe(AuditSeverity.BLOCKING)
        expect(getSeverity('S-004')).toBe(AuditSeverity.BLOCKING)
        expect(getSeverity('S-005')).toBe(AuditSeverity.BLOCKING)
        expect(getSeverity('S-006')).toBe(AuditSeverity.BLOCKING)
      })

      it('classifies S-007 through S-009 as WARNING', () => {
        expect(getSeverity('S-007')).toBe(AuditSeverity.WARNING)
        expect(getSeverity('S-008')).toBe(AuditSeverity.WARNING)
        expect(getSeverity('S-009')).toBe(AuditSeverity.WARNING)
      })

      it('classifies S-010 as INFO', () => {
        expect(getSeverity('S-010')).toBe(AuditSeverity.INFO)
      })

      it('classifies fundamental balance controls (F-001, F-003 to F-006) as BLOCKING', () => {
        expect(getSeverity('F-001')).toBe(AuditSeverity.BLOCKING)
        expect(getSeverity('F-003')).toBe(AuditSeverity.BLOCKING)
        expect(getSeverity('F-004')).toBe(AuditSeverity.BLOCKING)
        expect(getSeverity('F-005')).toBe(AuditSeverity.BLOCKING)
        expect(getSeverity('F-006')).toBe(AuditSeverity.BLOCKING)
      })

      it('classifies F-002, F-007 to F-009 as WARNING', () => {
        expect(getSeverity('F-002')).toBe(AuditSeverity.WARNING)
        expect(getSeverity('F-007')).toBe(AuditSeverity.WARNING)
        expect(getSeverity('F-008')).toBe(AuditSeverity.WARNING)
        expect(getSeverity('F-009')).toBe(AuditSeverity.WARNING)
      })

      it('classifies F-010 through F-012 as INFO', () => {
        expect(getSeverity('F-010')).toBe(AuditSeverity.INFO)
        expect(getSeverity('F-011')).toBe(AuditSeverity.INFO)
        expect(getSeverity('F-012')).toBe(AuditSeverity.INFO)
      })

      it('classifies conformity controls (C-001, C-002) as BLOCKING', () => {
        expect(getSeverity('C-001')).toBe(AuditSeverity.BLOCKING)
        expect(getSeverity('C-002')).toBe(AuditSeverity.BLOCKING)
      })

      it('classifies C-003 through C-007, C-010 as WARNING', () => {
        expect(getSeverity('C-003')).toBe(AuditSeverity.WARNING)
        expect(getSeverity('C-004')).toBe(AuditSeverity.WARNING)
        expect(getSeverity('C-005')).toBe(AuditSeverity.WARNING)
        expect(getSeverity('C-006')).toBe(AuditSeverity.WARNING)
        expect(getSeverity('C-007')).toBe(AuditSeverity.WARNING)
        expect(getSeverity('C-010')).toBe(AuditSeverity.WARNING)
      })

      it('classifies C-008, C-009, C-011 through C-015 as INFO', () => {
        expect(getSeverity('C-008')).toBe(AuditSeverity.INFO)
        expect(getSeverity('C-009')).toBe(AuditSeverity.INFO)
        expect(getSeverity('C-011')).toBe(AuditSeverity.INFO)
        expect(getSeverity('C-012')).toBe(AuditSeverity.INFO)
        expect(getSeverity('C-013')).toBe(AuditSeverity.INFO)
        expect(getSeverity('C-014')).toBe(AuditSeverity.INFO)
        expect(getSeverity('C-015')).toBe(AuditSeverity.INFO)
      })
    })

    describe('prefix-based fallback (unmapped controls)', () => {
      it('defaults unknown S- controls to BLOCKING', () => {
        expect(getSeverity('S-999')).toBe(AuditSeverity.BLOCKING)
      })

      it('defaults unknown F- controls to BLOCKING', () => {
        expect(getSeverity('F-999')).toBe(AuditSeverity.BLOCKING)
      })

      it('defaults unknown C- controls to WARNING', () => {
        expect(getSeverity('C-999')).toBe(AuditSeverity.WARNING)
      })

      it('classifies SNS- controls as WARNING', () => {
        expect(getSeverity('SNS-001')).toBe(AuditSeverity.WARNING)
      })

      it('classifies IA- controls as WARNING', () => {
        expect(getSeverity('IA-001')).toBe(AuditSeverity.WARNING)
      })

      it('classifies YoY- controls as INFO', () => {
        expect(getSeverity('YoY-001')).toBe(AuditSeverity.INFO)
      })

      it('classifies EF- controls as WARNING', () => {
        expect(getSeverity('EF-001')).toBe(AuditSeverity.WARNING)
      })

      it('classifies FIS- controls as WARNING', () => {
        expect(getSeverity('FIS-001')).toBe(AuditSeverity.WARNING)
      })

      it('classifies AR- controls as INFO', () => {
        expect(getSeverity('AR-001')).toBe(AuditSeverity.INFO)
      })

      it('defaults completely unknown prefixes to INFO', () => {
        expect(getSeverity('UNKNOWN-001')).toBe(AuditSeverity.INFO)
        expect(getSeverity('XYZ-999')).toBe(AuditSeverity.INFO)
      })
    })
  })

  describe('validateBeforeGenerate', () => {
    const makeResult = (
      controlId: string,
      status: 'PASS' | 'FAIL'
    ): AuditResult => ({
      controlId,
      status,
      severity: AuditSeverity.INFO, // Placeholder; getSeverity will override
      message: `Control ${controlId} ${status === 'PASS' ? 'passed' : 'failed'}`,
    })

    it('allows generation when all controls pass', () => {
      const results = [
        makeResult('S-001', 'PASS'),
        makeResult('F-001', 'PASS'),
        makeResult('C-001', 'PASS'),
      ]
      const validation = validateBeforeGenerate(results)
      expect(validation.canGenerate).toBe(true)
      expect(validation.blockingErrors).toHaveLength(0)
      expect(validation.warnings).toHaveLength(0)
      expect(validation.infos).toHaveLength(0)
    })

    it('blocks generation on BLOCKING failure', () => {
      const results = [
        makeResult('S-001', 'PASS'),
        makeResult('F-001', 'FAIL'), // BLOCKING
        makeResult('C-001', 'PASS'),
      ]
      const validation = validateBeforeGenerate(results)
      expect(validation.canGenerate).toBe(false)
      expect(validation.blockingErrors).toHaveLength(1)
      expect(validation.blockingErrors[0].controlId).toBe('F-001')
    })

    it('blocks generation on multiple BLOCKING failures', () => {
      const results = [
        makeResult('S-001', 'FAIL'), // BLOCKING
        makeResult('F-001', 'FAIL'), // BLOCKING
        makeResult('F-004', 'FAIL'), // BLOCKING
      ]
      const validation = validateBeforeGenerate(results)
      expect(validation.canGenerate).toBe(false)
      expect(validation.blockingErrors).toHaveLength(3)
    })

    it('allows generation with only WARNING failures', () => {
      const results = [
        makeResult('S-001', 'PASS'),
        makeResult('F-001', 'PASS'),
        makeResult('S-007', 'FAIL'), // WARNING
        makeResult('SNS-001', 'FAIL'), // WARNING (prefix-based)
      ]
      const validation = validateBeforeGenerate(results)
      expect(validation.canGenerate).toBe(true)
      expect(validation.warnings).toHaveLength(2)
    })

    it('allows generation with only INFO failures', () => {
      const results = [
        makeResult('S-001', 'PASS'),
        makeResult('YoY-001', 'FAIL'), // INFO
        makeResult('AR-001', 'FAIL'), // INFO
      ]
      const validation = validateBeforeGenerate(results)
      expect(validation.canGenerate).toBe(true)
      expect(validation.infos).toHaveLength(2)
    })

    it('counts passed controls correctly', () => {
      const results = [
        makeResult('S-001', 'PASS'),
        makeResult('F-001', 'PASS'),
        makeResult('C-001', 'FAIL'),
      ]
      const validation = validateBeforeGenerate(results)
      expect(validation.totalControls).toBe(3)
      expect(validation.passedControls).toBe(2)
    })

    it('handles empty results', () => {
      const validation = validateBeforeGenerate([])
      expect(validation.canGenerate).toBe(true)
      expect(validation.totalControls).toBe(0)
      expect(validation.passedControls).toBe(0)
      expect(validation.blockingErrors).toHaveLength(0)
      expect(validation.warnings).toHaveLength(0)
      expect(validation.infos).toHaveLength(0)
    })

    it('separates blocking, warning, and info correctly', () => {
      const results = [
        makeResult('S-001', 'FAIL'), // BLOCKING (mapped)
        makeResult('S-007', 'FAIL'), // WARNING (mapped)
        makeResult('YoY-001', 'FAIL'), // INFO (prefix)
        makeResult('F-002', 'FAIL'), // WARNING (mapped)
        makeResult('C-002', 'FAIL'), // BLOCKING (mapped)
        makeResult('C-008', 'FAIL'), // INFO (mapped)
      ]
      const validation = validateBeforeGenerate(results)
      expect(validation.blockingErrors).toHaveLength(2)
      expect(validation.warnings).toHaveLength(2)
      expect(validation.infos).toHaveLength(2)
      expect(validation.canGenerate).toBe(false)
    })

    it('does not count PASS results in any failure category', () => {
      const results = [
        makeResult('S-001', 'PASS'), // BLOCKING severity but passed
        makeResult('F-001', 'PASS'),
        makeResult('S-007', 'PASS'), // WARNING severity but passed
      ]
      const validation = validateBeforeGenerate(results)
      expect(validation.blockingErrors).toHaveLength(0)
      expect(validation.warnings).toHaveLength(0)
      expect(validation.infos).toHaveLength(0)
      expect(validation.passedControls).toBe(3)
    })

    it('enriches results with correct severity from getSeverity', () => {
      const results = [
        makeResult('F-004', 'FAIL'), // mapped to BLOCKING
      ]
      const validation = validateBeforeGenerate(results)
      expect(validation.blockingErrors[0].severity).toBe(AuditSeverity.BLOCKING)
    })

    it('handles mix of all statuses in a realistic scenario', () => {
      const results = [
        // Structural checks
        makeResult('S-001', 'PASS'),
        makeResult('S-002', 'PASS'),
        makeResult('S-003', 'PASS'),
        makeResult('S-007', 'FAIL'), // WARNING
        // Fundamental balance
        makeResult('F-001', 'PASS'),
        makeResult('F-003', 'PASS'),
        makeResult('F-004', 'PASS'),
        // Conformity
        makeResult('C-001', 'PASS'),
        makeResult('C-006', 'FAIL'), // WARNING
        // Year-over-year
        makeResult('YoY-001', 'FAIL'), // INFO
      ]
      const validation = validateBeforeGenerate(results)
      expect(validation.canGenerate).toBe(true)
      expect(validation.totalControls).toBe(10)
      expect(validation.passedControls).toBe(7)
      expect(validation.blockingErrors).toHaveLength(0)
      expect(validation.warnings).toHaveLength(2)
      expect(validation.infos).toHaveLength(1)
    })
  })
})
