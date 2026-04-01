import Decimal from 'decimal.js'

// Configure Decimal for fiscal calculations
Decimal.set({
  precision: 20,
  rounding: Decimal.ROUND_HALF_EVEN, // Banker's rounding
})

/**
 * Round a number using banker's rounding (ROUND_HALF_EVEN)
 * This is the standard for fiscal/accounting calculations.
 */
export function fiscalRound(value: number, decimals: number = 0): number {
  return new Decimal(value).toDecimalPlaces(decimals, Decimal.ROUND_HALF_EVEN).toNumber()
}

/**
 * Safely add multiple numbers avoiding floating-point errors
 */
export function fiscalSum(...values: number[]): number {
  return values
    .reduce((acc, val) => acc.plus(new Decimal(val || 0)), new Decimal(0))
    .toDecimalPlaces(2, Decimal.ROUND_HALF_EVEN)
    .toNumber()
}

/**
 * Safely multiply two numbers
 */
export function fiscalMultiply(a: number, b: number): number {
  return new Decimal(a).times(new Decimal(b)).toDecimalPlaces(2, Decimal.ROUND_HALF_EVEN).toNumber()
}

/**
 * Safely divide two numbers (returns 0 if divisor is 0)
 */
export function fiscalDivide(a: number, b: number): number {
  if (b === 0) return 0
  return new Decimal(a).dividedBy(new Decimal(b)).toDecimalPlaces(2, Decimal.ROUND_HALF_EVEN).toNumber()
}

/**
 * Compare two fiscal amounts with tolerance
 */
export function fiscalEquals(a: number, b: number, tolerance: number = 1): boolean {
  return Math.abs(new Decimal(a).minus(new Decimal(b)).toNumber()) <= tolerance
}

/**
 * Calculate percentage: (part / total) * 100
 */
export function fiscalPercentage(part: number, total: number): number {
  if (total === 0) return 0
  return new Decimal(part).dividedBy(new Decimal(total)).times(100).toDecimalPlaces(2, Decimal.ROUND_HALF_EVEN).toNumber()
}

/**
 * Apply a rate to an amount: amount * rate
 */
export function fiscalApplyRate(amount: number, rate: number): number {
  return new Decimal(amount).times(new Decimal(rate)).toDecimalPlaces(0, Decimal.ROUND_HALF_EVEN).toNumber()
}
