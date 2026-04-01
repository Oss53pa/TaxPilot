import { describe, it, expect } from 'vitest'
import {
  fiscalRound,
  fiscalSum,
  fiscalMultiply,
  fiscalDivide,
  fiscalEquals,
  fiscalApplyRate,
  fiscalPercentage,
} from '@/utils/fiscal-math'

describe('Fiscal Math - Banker\'s Rounding', () => {
  describe('fiscalRound', () => {
    it('rounds 2.5 to 2 (banker rounding - round to even)', () => {
      expect(fiscalRound(2.5)).toBe(2)
    })

    it('rounds 3.5 to 4 (banker rounding - round to even)', () => {
      expect(fiscalRound(3.5)).toBe(4)
    })

    it('rounds 2.51 up normally', () => {
      expect(fiscalRound(2.51)).toBe(3)
    })

    it('rounds 2.49 down normally', () => {
      expect(fiscalRound(2.49)).toBe(2)
    })

    it('rounds negative numbers correctly with banker rounding', () => {
      expect(fiscalRound(-2.5)).toBe(-2)
      expect(fiscalRound(-3.5)).toBe(-4)
    })

    it('handles zero', () => {
      expect(fiscalRound(0)).toBe(0)
    })

    it('rounds with specified decimal places', () => {
      expect(fiscalRound(1.2350, 2)).toBe(1.24) // banker: .5 rounds to even → 4
      expect(fiscalRound(1.2250, 2)).toBe(1.22) // banker: .5 rounds to even → 2
      expect(fiscalRound(1.2345, 2)).toBe(1.23)
      expect(fiscalRound(1.2355, 2)).toBe(1.24)
    })

    it('handles large numbers', () => {
      expect(fiscalRound(1000000000.5)).toBe(1000000000) // even → rounds down
      expect(fiscalRound(1000000001.5)).toBe(1000000002) // odd → rounds up
    })

    it('handles very small values', () => {
      expect(fiscalRound(0.0001, 2)).toBe(0)
    })

    it('returns integer when decimals is 0 (default)', () => {
      expect(fiscalRound(42.7)).toBe(43)
      expect(fiscalRound(42.3)).toBe(42)
    })
  })

  describe('fiscalSum', () => {
    it('sums correctly avoiding float errors (0.1 + 0.2)', () => {
      expect(fiscalSum(0.1, 0.2)).toBe(0.30)
    })

    it('sums multiple values', () => {
      expect(fiscalSum(100, 200, 300, 400)).toBe(1000)
    })

    it('returns 0 for no arguments', () => {
      expect(fiscalSum()).toBe(0)
    })

    it('handles negative values', () => {
      expect(fiscalSum(100, -50, 25)).toBe(75)
    })

    it('treats NaN as 0 (via || 0 guard)', () => {
      // The implementation uses `val || 0`, so NaN becomes 0
      expect(fiscalSum(100, NaN)).toBe(100)
    })

    it('handles single value', () => {
      expect(fiscalSum(42.55)).toBe(42.55)
    })

    it('handles all negatives', () => {
      expect(fiscalSum(-100, -200, -300)).toBe(-600)
    })

    it('sums typical fiscal amounts', () => {
      expect(fiscalSum(1500000, 2300000, 750000)).toBe(4550000)
    })
  })

  describe('fiscalMultiply', () => {
    it('multiplies correctly', () => {
      expect(fiscalMultiply(100, 0.275)).toBe(27.50)
    })

    it('avoids float errors (0.1 * 0.2)', () => {
      expect(fiscalMultiply(0.1, 0.2)).toBe(0.02)
    })

    it('handles multiplication by zero', () => {
      expect(fiscalMultiply(1000000, 0)).toBe(0)
    })

    it('handles negative multiplication', () => {
      expect(fiscalMultiply(-100, 0.25)).toBe(-25)
    })

    it('computes IS tax base correctly', () => {
      // 53,000,000 * 0.25 = 13,250,000
      expect(fiscalMultiply(53000000, 0.25)).toBe(13250000)
    })
  })

  describe('fiscalDivide', () => {
    it('divides correctly', () => {
      expect(fiscalDivide(100, 4)).toBe(25)
    })

    it('rounds result to 2 decimals', () => {
      expect(fiscalDivide(100, 3)).toBe(33.33)
    })

    it('returns 0 for division by zero', () => {
      expect(fiscalDivide(100, 0)).toBe(0)
    })

    it('handles negative division', () => {
      expect(fiscalDivide(-100, 4)).toBe(-25)
    })

    it('handles zero numerator', () => {
      expect(fiscalDivide(0, 100)).toBe(0)
    })
  })

  describe('fiscalEquals', () => {
    it('considers equal values within default tolerance (1)', () => {
      expect(fiscalEquals(1000000, 1000000.5)).toBe(true)
    })

    it('considers not equal values outside default tolerance', () => {
      expect(fiscalEquals(1000000, 1000002)).toBe(false)
    })

    it('considers exactly equal values', () => {
      expect(fiscalEquals(42, 42)).toBe(true)
    })

    it('respects custom tolerance', () => {
      expect(fiscalEquals(100, 105, 10)).toBe(true)
      expect(fiscalEquals(100, 115, 10)).toBe(false)
    })

    it('handles negative values', () => {
      expect(fiscalEquals(-100, -100.5)).toBe(true)
      expect(fiscalEquals(-100, -102)).toBe(false)
    })

    it('considers boundary exactly at tolerance as equal', () => {
      expect(fiscalEquals(100, 101, 1)).toBe(true) // difference = 1, tolerance = 1
    })
  })

  describe('fiscalApplyRate', () => {
    it('applies IS rate correctly (25%)', () => {
      expect(fiscalApplyRate(10000000, 0.25)).toBe(2500000)
    })

    it('applies IMF rate (1%)', () => {
      expect(fiscalApplyRate(500000000, 0.01)).toBe(5000000)
    })

    it('rounds to 0 decimals using banker rounding', () => {
      // 10000001 * 0.25 = 2500000.25 → rounds to 2500000 (even)
      expect(fiscalApplyRate(10000001, 0.25)).toBe(2500000)
    })

    it('handles zero amount', () => {
      expect(fiscalApplyRate(0, 0.25)).toBe(0)
    })

    it('handles zero rate', () => {
      expect(fiscalApplyRate(10000000, 0)).toBe(0)
    })

    it('applies Cameroun IS rate (33%)', () => {
      expect(fiscalApplyRate(53000000, 0.33)).toBe(17490000)
    })

    it('applies Senegal IS rate (30%)', () => {
      expect(fiscalApplyRate(53000000, 0.30)).toBe(15900000)
    })
  })

  describe('fiscalPercentage', () => {
    it('calculates simple percentage', () => {
      expect(fiscalPercentage(25, 100)).toBe(25)
    })

    it('returns 0 when total is zero', () => {
      expect(fiscalPercentage(25, 0)).toBe(0)
    })

    it('calculates percentage with decimals', () => {
      expect(fiscalPercentage(1, 3)).toBe(33.33)
    })

    it('handles 100%', () => {
      expect(fiscalPercentage(100, 100)).toBe(100)
    })

    it('handles percentage > 100%', () => {
      expect(fiscalPercentage(150, 100)).toBe(150)
    })

    it('handles zero part', () => {
      expect(fiscalPercentage(0, 100)).toBe(0)
    })

    it('calculates effective tax rate', () => {
      // impotDu / CA * 100 → 13250000 / 500000000 * 100 = 2.65%
      expect(fiscalPercentage(13250000, 500000000)).toBe(2.65)
    })
  })
})
