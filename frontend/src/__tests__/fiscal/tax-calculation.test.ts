import { describe, it, expect, vi } from 'vitest'
import { calculateTax, type TaxCalculationInput } from '@/services/taxCalculationService'

// Mock fiscalConfigService to avoid Supabase dependency
vi.mock('@/services/fiscalConfigService', () => ({
  getFiscalConfig: vi.fn(async (code: string) => {
    const configs: Record<string, any> = {
      CI: {
        id: 'test-ci',
        countryCode: 'CI',
        countryName: "Côte d'Ivoire",
        currency: 'XOF',
        isRate: 0.25,
        isReducedRate: null,
        isReducedThreshold: null,
        imfRate: 0.01,
        imfMinimum: 3000000,
        imfMaximum: null,
        giftThresholdRate: 0.001,
        donationThresholdRate: 0.005,
        entertainmentThresholdRate: 0.01,
        lossCarryforwardYears: 5,
        vatStandardRate: 0.18,
        vatReducedRate: 0.09,
        notes: null,
      },
      SN: {
        id: 'test-sn',
        countryCode: 'SN',
        countryName: 'Sénégal',
        currency: 'XOF',
        isRate: 0.30,
        isReducedRate: null,
        isReducedThreshold: null,
        imfRate: 0.005,
        imfMinimum: 500000,
        imfMaximum: null,
        giftThresholdRate: 0.001,
        donationThresholdRate: 0.005,
        entertainmentThresholdRate: 0.01,
        lossCarryforwardYears: 3,
        vatStandardRate: 0.18,
        vatReducedRate: 0.10,
        notes: null,
      },
      BF: {
        id: 'test-bf',
        countryCode: 'BF',
        countryName: 'Burkina Faso',
        currency: 'XOF',
        isRate: 0.275,
        isReducedRate: 0.25,
        isReducedThreshold: 50000000,
        imfRate: 0.005,
        imfMinimum: 1000000,
        imfMaximum: null,
        giftThresholdRate: 0.001,
        donationThresholdRate: 0.005,
        entertainmentThresholdRate: 0.01,
        lossCarryforwardYears: 5,
        vatStandardRate: 0.18,
        vatReducedRate: 0.0,
        notes: null,
      },
      CM: {
        id: 'test-cm',
        countryCode: 'CM',
        countryName: 'Cameroun',
        currency: 'XAF',
        isRate: 0.33,
        isReducedRate: 0.28,
        isReducedThreshold: 100000000,
        imfRate: 0.022,
        imfMinimum: 1000000,
        imfMaximum: null,
        giftThresholdRate: 0.001,
        donationThresholdRate: 0.005,
        entertainmentThresholdRate: 0.01,
        lossCarryforwardYears: 4,
        vatStandardRate: 0.1925,
        vatReducedRate: 0.0,
        notes: null,
      },
    }
    if (!configs[code]) throw new Error(`Config not found: ${code}`)
    return configs[code]
  }),
}))

describe('Tax Calculation Service', () => {
  const baseInput: TaxCalculationInput = {
    countryCode: 'CI',
    resultatComptable: 50000000,
    chiffreAffaires: 500000000,
    reintegrations: 5000000,
    deductions: 2000000,
  }

  describe("Cote d'Ivoire (IS 25%, IMF 1%)", () => {
    it('calculates IS correctly for profitable company', async () => {
      const result = await calculateTax(baseInput)
      // resultatFiscal = 50M + 5M - 2M = 53M
      // IS = 53M * 0.25 = 13,250,000
      // IMF = 500M * 0.01 = 5,000,000
      // impotDu = max(13.25M, 5M) = 13,250,000
      expect(result.resultatFiscal).toBe(53000000)
      expect(result.isBrut).toBe(13250000)
      expect(result.imf).toBe(5000000)
      expect(result.impotDu).toBe(13250000)
    })

    it('applies IMF when IS is lower', async () => {
      const result = await calculateTax({
        ...baseInput,
        resultatComptable: 1000000, // Low profit
        reintegrations: 0,
        deductions: 0,
      })
      // IS = 1M * 0.25 = 250,000
      // IMF = 500M * 0.01 = 5,000,000
      // impotDu = max(250k, 5M) = 5,000,000
      expect(result.isBrut).toBe(250000)
      expect(result.imf).toBe(5000000)
      expect(result.impotDu).toBe(5000000)
      expect(result.imf).toBeGreaterThan(result.isBrut)
    })

    it('returns zero IS for deficit (negative resultat fiscal)', async () => {
      const result = await calculateTax({
        ...baseInput,
        resultatComptable: -10000000,
        reintegrations: 0,
        deductions: 0,
      })
      expect(result.resultatFiscal).toBe(-10000000)
      expect(result.isBrut).toBe(0)
      expect(result.impotDu).toBe(5000000) // IMF still applies
    })

    it('applies IMF minimum floor (3M XOF for CI)', async () => {
      const result = await calculateTax({
        ...baseInput,
        chiffreAffaires: 100000000, // 100M * 0.01 = 1M < 3M minimum
      })
      expect(result.imf).toBe(3000000)
    })

    it('handles loss carryforward (deficits anterieurs)', async () => {
      const result = await calculateTax({
        ...baseInput,
        deficitsAnterieurs: 10000000,
      })
      // resultatAvantDeficit = 50M + 5M - 2M = 53M
      // deficitsImputes = min(10M, max(0, 53M)) = 10M
      // resultatFiscal = 53M - 10M = 43M
      expect(result.resultatFiscal).toBe(43000000)
      expect(result.details.deficitsImputes).toBe(10000000)
    })

    it('deficit carryforward cannot exceed profit', async () => {
      const result = await calculateTax({
        ...baseInput,
        resultatComptable: 5000000,
        reintegrations: 0,
        deductions: 0,
        deficitsAnterieurs: 20000000,
      })
      // resultatAvantDeficit = 5M
      // deficitsImputes = min(20M, max(0, 5M)) = 5M
      expect(result.details.deficitsImputes).toBe(5000000)
      expect(result.resultatFiscal).toBe(0)
      expect(result.isBrut).toBe(0)
    })

    it('no deficit imputation when resultat is already negative', async () => {
      const result = await calculateTax({
        ...baseInput,
        resultatComptable: -5000000,
        reintegrations: 0,
        deductions: 0,
        deficitsAnterieurs: 10000000,
      })
      // resultatAvantDeficit = -5M
      // deficitsImputes = min(10M, max(0, -5M)) = min(10M, 0) = 0
      expect(result.details.deficitsImputes).toBe(0)
      expect(result.resultatFiscal).toBe(-5000000)
    })

    it('returns correct details structure', async () => {
      const result = await calculateTax(baseInput)
      expect(result.details).toEqual({
        resultatComptable: 50000000,
        reintegrations: 5000000,
        deductions: 2000000,
        deficitsImputes: 0,
        baseImposable: 53000000,
        isRate: 0.25,
        imfRate: 0.01,
        isReducedApplied: false,
        dureeMois: 12,
      })
    })

    it('computes effective rate', async () => {
      const result = await calculateTax(baseInput)
      // isEffectiveRate = impotDu / CA = 13250000 / 500000000 = 0.0265
      expect(result.isEffectiveRate).toBe(0.03) // fiscalDivide rounds to 2 decimals
    })
  })

  describe('Senegal (IS 30%, IMF 0.5%)', () => {
    it('applies correct SN rates', async () => {
      const result = await calculateTax({
        ...baseInput,
        countryCode: 'SN',
      })
      // resultatFiscal = 53M
      // IS = 53M * 0.30 = 15,900,000
      // IMF = 500M * 0.005 = 2,500,000
      expect(result.isBrut).toBe(15900000)
      expect(result.imf).toBe(2500000)
      expect(result.impotDu).toBe(15900000)
    })

    it('applies SN IMF minimum (500,000)', async () => {
      const result = await calculateTax({
        ...baseInput,
        countryCode: 'SN',
        chiffreAffaires: 50000000, // 50M * 0.005 = 250k < 500k min
      })
      expect(result.imf).toBe(500000)
    })
  })

  describe('Burkina Faso (reduced rate for SMEs)', () => {
    it('applies reduced rate for SME (CA <= 50M threshold)', async () => {
      const result = await calculateTax({
        ...baseInput,
        countryCode: 'BF',
        chiffreAffaires: 40000000, // Below 50M threshold
      })
      expect(result.details.isReducedApplied).toBe(true)
      expect(result.details.isRate).toBe(0.25)
    })

    it('applies standard rate for large company (CA > threshold)', async () => {
      const result = await calculateTax({
        ...baseInput,
        countryCode: 'BF',
        chiffreAffaires: 100000000, // Above 50M threshold
      })
      expect(result.details.isReducedApplied).toBe(false)
      expect(result.details.isRate).toBe(0.275)
    })

    it('applies reduced rate at exact threshold boundary', async () => {
      const result = await calculateTax({
        ...baseInput,
        countryCode: 'BF',
        chiffreAffaires: 50000000, // Exactly at threshold
      })
      expect(result.details.isReducedApplied).toBe(true)
      expect(result.details.isRate).toBe(0.25)
    })

    it('calculates correct IS with reduced rate', async () => {
      const result = await calculateTax({
        ...baseInput,
        countryCode: 'BF',
        chiffreAffaires: 40000000,
      })
      // IS = 53M * 0.25 = 13,250,000
      expect(result.isBrut).toBe(13250000)
    })
  })

  describe('Cameroun (IS 33%, IMF 2.2%)', () => {
    it('applies CM rates correctly', async () => {
      const result = await calculateTax({
        ...baseInput,
        countryCode: 'CM',
      })
      // IS = 53M * 0.33 = 17,490,000
      // IMF = 500M * 0.022 = 11,000,000
      expect(result.isBrut).toBe(17490000)
      expect(result.imf).toBe(11000000)
      expect(result.impotDu).toBe(17490000)
    })

    it('applies CM reduced rate for SME (CA <= 100M)', async () => {
      const result = await calculateTax({
        ...baseInput,
        countryCode: 'CM',
        chiffreAffaires: 80000000, // Below 100M threshold
      })
      expect(result.details.isReducedApplied).toBe(true)
      expect(result.details.isRate).toBe(0.28)
    })

    it('applies CM standard rate for large company', async () => {
      const result = await calculateTax({
        ...baseInput,
        countryCode: 'CM',
        chiffreAffaires: 200000000,
      })
      expect(result.details.isReducedApplied).toBe(false)
      expect(result.details.isRate).toBe(0.33)
    })
  })

  describe('Edge cases', () => {
    it('handles zero chiffre d\'affaires', async () => {
      const result = await calculateTax({
        ...baseInput,
        chiffreAffaires: 0,
      })
      expect(result.imf).toBe(3000000) // IMF minimum
      expect(result.isEffectiveRate).toBe(0) // 0 CA → 0 effective rate
    })

    it('handles all zeros', async () => {
      const result = await calculateTax({
        countryCode: 'CI',
        resultatComptable: 0,
        chiffreAffaires: 0,
        reintegrations: 0,
        deductions: 0,
      })
      expect(result.resultatFiscal).toBe(0)
      expect(result.isBrut).toBe(0)
      expect(result.impotDu).toBe(3000000) // IMF minimum
    })

    it('handles very large amounts', async () => {
      const result = await calculateTax({
        countryCode: 'CI',
        resultatComptable: 100000000000, // 100 billion
        chiffreAffaires: 500000000000,
        reintegrations: 0,
        deductions: 0,
      })
      expect(result.isBrut).toBe(25000000000)
      expect(result.imf).toBe(5000000000)
      expect(result.impotDu).toBe(25000000000)
    })

    it('reintegrations and deductions net to zero', async () => {
      const result = await calculateTax({
        ...baseInput,
        reintegrations: 5000000,
        deductions: 5000000,
      })
      // resultatFiscal = 50M + 5M - 5M = 50M
      expect(result.resultatFiscal).toBe(50000000)
    })

    it('deductions exceeding resultat produces deficit', async () => {
      const result = await calculateTax({
        countryCode: 'CI',
        resultatComptable: 10000000,
        chiffreAffaires: 500000000,
        reintegrations: 0,
        deductions: 20000000,
      })
      // resultatFiscal = 10M + 0 - 20M = -10M
      expect(result.resultatFiscal).toBe(-10000000)
      expect(result.isBrut).toBe(0) // No IS on deficit
    })

    it('throws error for unknown country code', async () => {
      await expect(
        calculateTax({ ...baseInput, countryCode: 'ZZ' })
      ).rejects.toThrow('Config not found: ZZ')
    })

    it('returns the fiscal config in result', async () => {
      const result = await calculateTax(baseInput)
      expect(result.config.countryCode).toBe('CI')
      expect(result.config.currency).toBe('XOF')
    })
  })

  describe('Fiscal year proration', () => {
    it('prorates IMF minimum for 6-month period', async () => {
      const result = await calculateTax({
        ...baseInput,
        dureeMois: 6,
        chiffreAffaires: 100000000,
      })
      // IMF min for CI = 3M, prorated = 3M * 6/12 = 1.5M
      // IMF from CA = 100M * 0.01 = 1M < 1.5M prorated min
      expect(result.imf).toBe(1500000)
    })

    it('handles 18-month period', async () => {
      const result = await calculateTax({
        ...baseInput,
        dureeMois: 18,
      })
      // IMF min prorated to 18/12 = 4.5M
      expect(result.details.dureeMois).toBe(18)
    })

    it('defaults to 12 months when not specified', async () => {
      const result = await calculateTax(baseInput)
      expect(result.details.dureeMois).toBe(12)
    })
  })
})
