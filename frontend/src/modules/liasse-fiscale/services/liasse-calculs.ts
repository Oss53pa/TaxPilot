import type { BalanceEntry } from '../types'

export const sumCells = (values: (number | null | undefined)[]): number =>
  values.reduce<number>((acc, v) => acc + (v || 0), 0)

export const netValue = (brut: number, amort: number): number => brut - amort

export const variation = (n: number, n1: number): number =>
  n1 === 0 ? 0 : ((n - n1) / Math.abs(n1)) * 100

export const getBalanceTotal = (
  balance: BalanceEntry[],
  prefixes: readonly string[],
  side: 'debit' | 'credit'
): number => {
  let total = 0
  for (const entry of balance) {
    const compte = entry.compte.replace(/\s/g, '')
    for (const prefix of prefixes) {
      if (compte === prefix || compte.startsWith(prefix)) {
        total += side === 'debit' ? entry.solde_debit : entry.solde_credit
        break
      }
    }
  }
  return total
}

export const getBalanceSolde = (
  balance: BalanceEntry[],
  prefixes: readonly string[]
): number => {
  let total = 0
  for (const entry of balance) {
    const compte = entry.compte.replace(/\s/g, '')
    for (const prefix of prefixes) {
      if (compte === prefix || compte.startsWith(prefix)) {
        total += entry.solde_debit - entry.solde_credit
        break
      }
    }
  }
  return total
}

/** Actif brut = soldes debiteurs */
export const getActifBrut = (balance: BalanceEntry[], prefixes: readonly string[]): number => {
  let total = 0
  for (const entry of balance) {
    const compte = entry.compte.replace(/\s/g, '')
    for (const prefix of prefixes) {
      if (compte === prefix || compte.startsWith(prefix)) {
        const solde = entry.solde_debit - entry.solde_credit
        if (solde > 0) total += solde
        break
      }
    }
  }
  return total
}

/** Amort/provisions = soldes crediteurs (abs) */
export const getAmortProv = (balance: BalanceEntry[], prefixes: readonly string[]): number => {
  let total = 0
  for (const entry of balance) {
    const compte = entry.compte.replace(/\s/g, '')
    for (const prefix of prefixes) {
      if (compte === prefix || compte.startsWith(prefix)) {
        const solde = entry.solde_debit - entry.solde_credit
        total += Math.abs(solde)
        break
      }
    }
  }
  return total
}

/** Passif = soldes crediteurs (abs) */
export const getPassif = (balance: BalanceEntry[], prefixes: readonly string[]): number => {
  let total = 0
  for (const entry of balance) {
    const compte = entry.compte.replace(/\s/g, '')
    for (const prefix of prefixes) {
      if (compte === prefix || compte.startsWith(prefix)) {
        const solde = entry.solde_debit - entry.solde_credit
        if (solde < 0) total += Math.abs(solde)
        break
      }
    }
  }
  return total
}

/** Charges = soldes debiteurs */
export const getCharges = (balance: BalanceEntry[], prefixes: readonly string[]): number => {
  let total = 0
  for (const entry of balance) {
    const compte = entry.compte.replace(/\s/g, '')
    for (const prefix of prefixes) {
      if (compte === prefix || compte.startsWith(prefix)) {
        const solde = entry.solde_debit - entry.solde_credit
        if (solde > 0) total += solde
        break
      }
    }
  }
  return total
}

/** Produits = soldes crediteurs (abs) */
export const getProduits = (balance: BalanceEntry[], prefixes: readonly string[]): number => {
  let total = 0
  for (const entry of balance) {
    const compte = entry.compte.replace(/\s/g, '')
    for (const prefix of prefixes) {
      if (compte === prefix || compte.startsWith(prefix)) {
        const solde = entry.solde_debit - entry.solde_credit
        if (solde < 0) total += Math.abs(solde)
        break
      }
    }
  }
  return total
}

export const fmt = (v: number | null | undefined): string => {
  if (v === null || v === undefined || v === 0) return ''
  return Math.round(v).toLocaleString('fr-FR')
}
