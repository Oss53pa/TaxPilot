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

/** Amort/provisions = soldes crediteurs uniquement (abs) */
export const getAmortProv = (balance: BalanceEntry[], prefixes: readonly string[]): number => {
  let total = 0
  for (const entry of balance) {
    const compte = entry.compte.replace(/\s/g, '')
    for (const prefix of prefixes) {
      if (compte === prefix || compte.startsWith(prefix)) {
        const solde = entry.solde_debit - entry.solde_credit
        // Seuls les soldes créditeurs (négatifs) comptent comme amort/provisions
        if (solde < 0) total += Math.abs(solde)
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

/**
 * Charges NETTES = solde net (débit − crédit) sur les comptes de charges.
 * Contrairement à getCharges (débit only), intègre les RRR obtenus (comptes
 * x019/x029… créditeurs) et corrections, qui viennent en déduction des achats.
 * À utiliser pour les lignes d'achats/charges où les rabais, remises et
 * ristournes obtenus doivent réduire le montant brut.
 */
export const getChargesNettes = (balance: BalanceEntry[], prefixes: readonly string[]): number =>
  getBalanceSolde(balance, prefixes)

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

// ── Détection des anomalies comptables ──

export interface AnomalieComptable {
  compte: string
  libelle: string
  type: 'actif_crediteur' | 'passif_debiteur'
  montant: number
}

/**
 * Préfixes "mixed" — comptes pouvant avoir naturellement un solde débiteur
 * OU créditeur selon leur sous-compte spécifique. À NE PAS flagger comme
 * anomalies sur la base du préfixe seul.
 *
 * Exemples :
 *   - 43x : CNPS/IPS — actif (avances versées) OU passif (cotisations dues)
 *   - 44x : État, impôts — actif (TVA récupérable, crédit IS) OU passif (TVA collectée, IS à payer)
 *   - 46x : Associés et groupe — actif (avances aux associés) OU passif (comptes courants créditeurs)
 *   - 47x : Débiteurs et créditeurs divers — par définition mixte
 *   - 52x : Banques — actif (avoir bancaire) OU passif (découvert autorisé)
 *   - 56x : Banques EFT, crédits trésorerie — mixte selon usage
 *
 * SYSCOHADA recommande de reclasser le sens lors de la production des états
 * financiers (TVA récup en actif BJ, TVA à décaisser en passif DK), mais le
 * solde brut sur le compte d'origine n'est PAS une anomalie.
 */
const MIXED_PREFIXES: readonly string[] = ['43', '44', '46', '47', '52', '53', '54', '55', '56']

/** True si le compte appartient à un préfixe mixed (ne doit pas être flagué). */
function isMixedAccount(compte: string): boolean {
  return MIXED_PREFIXES.some((p) => compte.startsWith(p))
}

/**
 * Détecte les comptes d'actif avec solde créditeur anormal.
 *
 * Filtre les comptes "mixed" (43x, 44x, 46x, 47x) qui peuvent légitimement
 * avoir un solde créditeur (TVA collectée, IS dû, comptes courants associés
 * créditeurs, etc.). Pour ces comptes, le sens du solde indique simplement
 * leur destination dans la liasse (actif ou passif), pas une erreur.
 */
export const detecterAnomaliesActif = (
  balance: BalanceEntry[],
  prefixes: readonly string[]
): AnomalieComptable[] => {
  const anomalies: AnomalieComptable[] = []
  for (const entry of balance) {
    const compte = entry.compte.replace(/\s/g, '')
    if (isMixedAccount(compte)) continue
    for (const prefix of prefixes) {
      if (compte === prefix || compte.startsWith(prefix)) {
        const solde = entry.solde_debit - entry.solde_credit
        if (solde < 0) {
          anomalies.push({
            compte,
            libelle: entry.libelle || compte,
            type: 'actif_crediteur',
            montant: Math.abs(solde),
          })
        }
        break
      }
    }
  }
  return anomalies
}

/**
 * Détecte les comptes de passif avec solde débiteur anormal.
 *
 * Même logique : filtre les préfixes mixed (43x, 44x, 46x, 47x).
 */
export const detecterAnomaliesPassif = (
  balance: BalanceEntry[],
  prefixes: readonly string[]
): AnomalieComptable[] => {
  const anomalies: AnomalieComptable[] = []
  for (const entry of balance) {
    const compte = entry.compte.replace(/\s/g, '')
    if (isMixedAccount(compte)) continue
    for (const prefix of prefixes) {
      if (compte === prefix || compte.startsWith(prefix)) {
        const solde = entry.solde_debit - entry.solde_credit
        if (solde > 0) {
          anomalies.push({
            compte,
            libelle: entry.libelle || compte,
            type: 'passif_debiteur',
            montant: solde,
          })
        }
        break
      }
    }
  }
  return anomalies
}
