import { getFiscalConfig, type FiscalConfig } from './fiscalConfigService'
import { fiscalApplyRate, fiscalDivide } from '@/utils/fiscal-math'

export interface TaxCalculationInput {
  countryCode: string
  resultatComptable: number
  chiffreAffaires: number
  reintegrations: number
  deductions: number
  deficitsAnterieurs?: number
  dureeMois?: number // fiscal year duration in months, default 12
}

export interface TaxCalculationResult {
  resultatFiscal: number
  isBrut: number
  imf: number
  impotDu: number
  isEffectiveRate: number
  config: FiscalConfig
  details: {
    resultatComptable: number
    reintegrations: number
    deductions: number
    deficitsImputes: number
    baseImposable: number
    isRate: number
    imfRate: number
    isReducedApplied: boolean
    dureeMois: number
  }
}

export async function calculateTax(input: TaxCalculationInput): Promise<TaxCalculationResult> {
  const config = await getFiscalConfig(input.countryCode)
  const dureeMois = input.dureeMois || 12
  const prorata = dureeMois / 12

  // 1. Compute fiscal result
  const resultatAvantDeficit = input.resultatComptable + input.reintegrations - input.deductions

  // 2. Apply loss carryforward (deduct prior deficits)
  const deficitsImputes = Math.min(
    input.deficitsAnterieurs || 0,
    Math.max(0, resultatAvantDeficit)
  )
  const resultatFiscal = resultatAvantDeficit - deficitsImputes

  // 3. Determine IS rate (check for reduced rate for SMEs)
  let isRate = config.isRate
  let isReducedApplied = false
  if (config.isReducedRate && config.isReducedThreshold) {
    if (input.chiffreAffaires <= config.isReducedThreshold) {
      isRate = config.isReducedRate
      isReducedApplied = true
    }
  }

  // 4. Compute IS brut
  const isBrut = resultatFiscal > 0 ? fiscalApplyRate(resultatFiscal, isRate) : 0

  // 5. Compute IMF (Impot Minimum Forfaitaire) — prorate min/max for non-12-month periods
  let imfMinimum = fiscalApplyRate(config.imfMinimum, prorata)
  let imf = fiscalApplyRate(input.chiffreAffaires, config.imfRate)
  if (imf < imfMinimum) {
    imf = imfMinimum
  }
  if (config.imfMaximum) {
    const imfMax = fiscalApplyRate(config.imfMaximum, prorata)
    if (imf > imfMax) imf = imfMax
  }

  // 6. Tax due = max(IS, IMF)
  const impotDu = Math.max(isBrut, imf)

  // 7. Effective rate
  const isEffectiveRate = input.chiffreAffaires > 0 ? fiscalDivide(impotDu, input.chiffreAffaires) : 0

  return {
    resultatFiscal,
    isBrut,
    imf,
    impotDu,
    isEffectiveRate,
    config,
    details: {
      resultatComptable: input.resultatComptable,
      reintegrations: input.reintegrations,
      deductions: input.deductions,
      deficitsImputes,
      baseImposable: Math.max(0, resultatFiscal),
      isRate,
      imfRate: config.imfRate,
      isReducedApplied,
      dureeMois,
    },
  }
}
