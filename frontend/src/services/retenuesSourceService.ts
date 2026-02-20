/**
 * Service de calcul des retenues à la source
 * AIRSI, IRC, IRCM — CGI Côte d'Ivoire
 */

import type { BalanceEntry } from './liasseDataService'
import { getTauxFiscaux, arrondiFCFA } from '@/config/taux-fiscaux-ci'

export interface RetenueLigne {
  code: string
  libelle: string
  base: number
  taux: number
  montant: number
  compte_source: string
  base_legale: string
}

export interface RetenuesResult {
  retenues: RetenueLigne[]
  total: number
}

function sumDebit(entries: BalanceEntry[], prefixes: string[]): number {
  return entries
    .filter(e => prefixes.some(p => e.compte.startsWith(p)))
    .reduce((s, e) => s + Math.max(0, (e.solde_debit || e.debit || 0) - (e.solde_credit || e.credit || 0)), 0)
}

function sumCredit(entries: BalanceEntry[], prefixes: string[]): number {
  return entries
    .filter(e => prefixes.some(p => e.compte.startsWith(p)))
    .reduce((s, e) => s + Math.max(0, (e.solde_credit || e.credit || 0) - (e.solde_debit || e.debit || 0)), 0)
}

/**
 * Calcule les retenues à la source depuis la balance importée
 */
export function calculerRetenues(entries: BalanceEntry[]): RetenuesResult {
  const taux = getTauxFiscaux()
  const retenues: RetenueLigne[] = []

  // AIRSI — Acompte IS sur prestations de services (7.5%)
  // Base : charges de sous-traitance, honoraires, prestations (622, 6226, 6218, 632)
  const prestations = sumDebit(entries, ['622', '632', '6226'])
  if (prestations > 0) {
    retenues.push({
      code: 'AIRSI',
      libelle: 'Acompte IS sur prestations de services',
      base: prestations,
      taux: taux.RETENUES.airsi,
      montant: arrondiFCFA(prestations * taux.RETENUES.airsi),
      compte_source: '622/632',
      base_legale: 'CGI Art. 64',
    })
  }

  // IRC — Retenue sur loyers (15% résident)
  // Base : loyers versés (613, 614)
  const loyers = sumDebit(entries, ['613', '614'])
  if (loyers > 0) {
    retenues.push({
      code: 'IRC',
      libelle: 'Retenue sur loyers (resident)',
      base: loyers,
      taux: taux.RETENUES.irc_resident,
      montant: arrondiFCFA(loyers * taux.RETENUES.irc_resident),
      compte_source: '613/614',
      base_legale: 'CGI Art. 91',
    })
  }

  // IRCM — Retenue sur dividendes/intérêts (15%)
  // Base : dividendes versés (465, 467) + intérêts servis (661, 664)
  const dividendes = sumDebit(entries, ['465', '467'])
  const interets = sumDebit(entries, ['661', '664'])
  const baseIRCM = dividendes + interets
  if (baseIRCM > 0) {
    retenues.push({
      code: 'IRCM',
      libelle: 'Retenue sur revenus de capitaux mobiliers',
      base: baseIRCM,
      taux: taux.RETENUES.ircm,
      montant: arrondiFCFA(baseIRCM * taux.RETENUES.ircm),
      compte_source: '465/467/661/664',
      base_legale: 'CGI Art. 180',
    })
  }

  // Retenue sur honoraires (7.5%)
  // Base : honoraires versés (6226)
  const honoraires = sumDebit(entries, ['6226'])
  if (honoraires > 0) {
    retenues.push({
      code: 'RH',
      libelle: 'Retenue sur honoraires',
      base: honoraires,
      taux: taux.RETENUES.honoraires,
      montant: arrondiFCFA(honoraires * taux.RETENUES.honoraires),
      compte_source: '6226',
      base_legale: 'CGI Art. 64',
    })
  }

  // TVA retenue à la source (50% de la TVA)
  // Pour les paiements à des entreprises non résidentes — compte 4454
  const tvaRetenue = sumCredit(entries, ['4454'])
  if (tvaRetenue > 0) {
    retenues.push({
      code: 'TVA-RS',
      libelle: 'TVA retenue a la source',
      base: tvaRetenue,
      taux: 1.0,
      montant: arrondiFCFA(tvaRetenue),
      compte_source: '4454',
      base_legale: 'CGI Art. 382',
    })
  }

  const total = arrondiFCFA(retenues.reduce((s, r) => s + r.montant, 0))

  return { retenues, total }
}
