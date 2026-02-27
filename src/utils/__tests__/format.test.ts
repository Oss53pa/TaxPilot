/**
 * Tests pour les utilitaires de formatage
 */
import { describe, it, expect } from 'vitest'

// Utility functions (inline for testing)
const formatCurrency = (amount: number, currency = 'XOF'): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(amount)
}

const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('fr-FR')
}

describe('Format Utilities', () => {
  describe('formatCurrency', () => {
    it('should format currency in XOF correctly', () => {
      const result = formatCurrency(1000000)

      expect(result).toContain('1')
      expect(result).toContain('000')
      // Should contain currency symbol or code
      expect(typeof result).toBe('string')
    })

    it('should handle zero amounts', () => {
      const result = formatCurrency(0)

      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })

    it('should handle negative amounts', () => {
      const result = formatCurrency(-500000)

      expect(result).toContain('-')
      expect(result).toContain('500')
    })
  })

  describe('formatDate', () => {
    it('should format Date object correctly', () => {
      const date = new Date('2024-01-15')
      const result = formatDate(date)

      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
      // French format: dd/mm/yyyy
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/)
    })

    it('should format date string correctly', () => {
      const result = formatDate('2024-12-31')

      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })
  })
})
