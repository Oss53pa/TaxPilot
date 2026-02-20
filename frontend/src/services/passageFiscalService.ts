/**
 * Service de calcul automatique du tableau de passage fiscal
 * Extrait les réintégrations et déductions depuis la balance importée
 * Conforme au CGI Côte d'Ivoire — Loi de Finances 2025
 */

import type { BalanceEntry } from './liasseDataService'
import { getTauxFiscaux, arrondiFCFA, calculerIS } from '@/config/taux-fiscaux-ci'

export interface ReintegrationLigne {
  code: string
  libelle: string
  montant: number
  compte_source: string
  base_legale: string
}

export interface DeductionLigne {
  code: string
  libelle: string
  montant: number
  compte_source: string
  base_legale: string
}

export interface TableauPassageResult {
  resultat_comptable: number
  chiffre_affaires: number
  reintegrations: ReintegrationLigne[]
  deductions: DeductionLigne[]
  total_reintegrations: number
  total_deductions: number
  resultat_fiscal: number
  is_brut: number
  imf: number
  is_du: number
  base_is: 'IS' | 'IMF'
}

// --- Helpers ---

function soldeDebit(entries: BalanceEntry[], prefixes: string[]): number {
  return arrondiFCFA(
    entries
      .filter(e => prefixes.some(p => e.compte.startsWith(p)))
      .reduce((sum, e) => sum + Math.max(0, (e.solde_debit || e.debit || 0) - (e.solde_credit || e.credit || 0)), 0)
  )
}

function soldeCredit(entries: BalanceEntry[], prefixes: string[]): number {
  return arrondiFCFA(
    entries
      .filter(e => prefixes.some(p => e.compte.startsWith(p)))
      .reduce((sum, e) => sum + Math.max(0, (e.solde_credit || e.credit || 0) - (e.solde_debit || e.debit || 0)), 0)
  )
}

function formatM(n: number): string {
  return Math.round(n).toLocaleString('fr-FR')
}

/**
 * Calcule automatiquement le tableau de passage fiscal
 * depuis la balance importée
 */
export function calculerPassageFiscal(entries: BalanceEntry[]): TableauPassageResult {
  const taux = getTauxFiscaux()

  // Résultat comptable = Produits (classe 7) - Charges (classe 6)
  const produits = soldeCredit(entries, ['7'])
  const charges = soldeDebit(entries, ['6'])
  const resultat_comptable = arrondiFCFA(produits - charges)

  // Chiffre d'affaires = comptes 70x
  const chiffre_affaires = soldeCredit(entries, ['70'])

  // === RÉINTÉGRATIONS ===
  const reintegrations: ReintegrationLigne[] = []

  // R01 — Amendes et pénalités (671) — 100% non déductible
  const amendes = soldeDebit(entries, ['671'])
  if (amendes > 0) {
    reintegrations.push({
      code: 'R01',
      libelle: 'Amendes et penalites fiscales',
      montant: amendes,
      compte_source: '671',
      base_legale: 'CGI Art. 18-7',
    })
  }

  // R02 — IS comptabilisé (891) — toujours réintégré
  const is_comptabilise = soldeDebit(entries, ['891'])
  if (is_comptabilise > 0) {
    reintegrations.push({
      code: 'R02',
      libelle: 'Impot sur les benefices comptabilise',
      montant: is_comptabilise,
      compte_source: '891',
      base_legale: 'CGI Art. 18-1',
    })
  }

  // R03 — Cadeaux excédentaires (6234) — au-delà de 1‰ du CA
  const cadeaux = soldeDebit(entries, ['6234'])
  const plafond_cadeaux = arrondiFCFA(chiffre_affaires * taux.DEDUCTIBILITE.plafond_cadeaux)
  const exces_cadeaux = Math.max(0, cadeaux - plafond_cadeaux)
  if (exces_cadeaux > 0) {
    reintegrations.push({
      code: 'R03',
      libelle: `Cadeaux excedentaires (total ${formatM(cadeaux)}, plafond 1\u2030 CA = ${formatM(plafond_cadeaux)})`,
      montant: exces_cadeaux,
      compte_source: '6234',
      base_legale: 'CGI Art. 18-4',
    })
  }

  // R04 — Dons excédentaires (658) — au-delà de 5‰ du CA
  const dons = soldeDebit(entries, ['658'])
  const plafond_dons = arrondiFCFA(chiffre_affaires * taux.DEDUCTIBILITE.plafond_dons)
  const exces_dons = Math.max(0, dons - plafond_dons)
  if (exces_dons > 0) {
    reintegrations.push({
      code: 'R04',
      libelle: `Dons excedentaires (total ${formatM(dons)}, plafond 5\u2030 CA = ${formatM(plafond_dons)})`,
      montant: exces_dons,
      compte_source: '658',
      base_legale: 'CGI Art. 18-5',
    })
  }

  // R05 — Charges somptuaires (6257) — 100% non déductible
  const somptuaires = soldeDebit(entries, ['6257'])
  if (somptuaires > 0) {
    reintegrations.push({
      code: 'R05',
      libelle: 'Charges somptuaires',
      montant: somptuaires,
      compte_source: '6257',
      base_legale: 'CGI Art. 18-6',
    })
  }

  // R06 — Amortissements excédentaires VP (brut > plafond)
  const brut_vp = soldeDebit(entries, ['245'])
  if (brut_vp > taux.DEDUCTIBILITE.amort_vehicule_plafond) {
    const dotation_vp = soldeDebit(entries, ['6845', '68145', '2845'])
    if (dotation_vp > 0) {
      const ratio_exces = Math.max(0, (brut_vp - taux.DEDUCTIBILITE.amort_vehicule_plafond) / brut_vp)
      const amort_exces = arrondiFCFA(dotation_vp * ratio_exces)
      if (amort_exces > 0) {
        reintegrations.push({
          code: 'R06',
          libelle: `Amort. VP excedentaires (brut ${formatM(brut_vp)}, plafond ${formatM(taux.DEDUCTIBILITE.amort_vehicule_plafond)})`,
          montant: amort_exces,
          compte_source: '245/2845',
          base_legale: 'CGI Art. 18-3',
        })
      }
    }
  }

  // R07 — Frais de réception excédentaires (627x) — au-delà de 1% du CA
  const receptions = soldeDebit(entries, ['627'])
  const plafond_receptions = arrondiFCFA(chiffre_affaires * 0.01)
  const exces_receptions = Math.max(0, receptions - plafond_receptions)
  if (exces_receptions > 0) {
    reintegrations.push({
      code: 'R07',
      libelle: `Frais de reception excedentaires (total ${formatM(receptions)}, plafond 1% CA = ${formatM(plafond_receptions)})`,
      montant: exces_receptions,
      compte_source: '627',
      base_legale: 'CGI Art. 18-4',
    })
  }

  // === DÉDUCTIONS ===
  const deductions: DeductionLigne[] = []

  // D01 — Reprises de provisions antérieurement taxées
  const reprises = soldeCredit(entries, ['791', '797', '799'])
  if (reprises > 0) {
    deductions.push({
      code: 'D01',
      libelle: 'Reprises de provisions anterieurement taxees',
      montant: reprises,
      compte_source: '791/797/799',
      base_legale: 'CGI Art. 19',
    })
  }

  // === CALCULS FINAUX ===
  const total_reintegrations = arrondiFCFA(reintegrations.reduce((s, r) => s + r.montant, 0))
  const total_deductions = arrondiFCFA(deductions.reduce((s, d) => s + d.montant, 0))
  const resultat_fiscal = arrondiFCFA(resultat_comptable + total_reintegrations - total_deductions)

  const { is_brut, imf, is_du, base } = calculerIS(resultat_fiscal, chiffre_affaires)

  return {
    resultat_comptable,
    chiffre_affaires,
    reintegrations,
    deductions,
    total_reintegrations,
    total_deductions,
    resultat_fiscal,
    is_brut,
    imf,
    is_du,
    base_is: base,
  }
}
