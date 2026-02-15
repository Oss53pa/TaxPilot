/**
 * Fonctions de formatage centralisées
 */

/** Formate un nombre au format FR (espaces comme séparateur de milliers) */
export const formatNumber = (value: number, decimals = 0): string => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/** Formate un montant en devise (FCFA par défaut) */
export const formatCurrency = (value: number, decimals = 0): string => {
  return formatNumber(value, decimals)
}

/** Formate une date ISO (YYYY-MM-DD) en DD/MM/YYYY */
export const formatDateFR = (isoDate?: string, defaultValue = '-'): string => {
  if (!isoDate) return defaultValue
  const parts = isoDate.split('-')
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
  return isoDate
}

/** Formate un pourcentage */
export const formatPercent = (value: number, decimals = 1): string => {
  return `${value.toFixed(decimals)}%`
}
