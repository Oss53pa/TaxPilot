/**
 * Service de calcul automatique du tableau de passage fiscal
 * Extrait les réintégrations et déductions depuis la balance importée
 * Multi-country OHADA — uses getFiscalConfig(countryCode)
 *
 * DONE: Refactored to accept countryCode parameter and use getFiscalConfig()
 * from '@/services/fiscalConfigService' for multi-country OHADA support.
 */

import type { BalanceEntry } from './liasseDataService'
import { getFiscalConfig } from '@/services/fiscalConfigService'
import { arrondiFCFA } from '@/config/taux-fiscaux-ci'
import { fiscalApplyRate } from '@/utils/fiscal-math'

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

function formatRate(rate: number): string {
  if (rate < 0.01) return `${(rate * 1000).toFixed(0)}\u2030`
  return `${(rate * 100).toFixed(0)}%`
}

/**
 * Calcule automatiquement le tableau de passage fiscal
 * depuis la balance importée, en utilisant la config fiscale du pays.
 *
 * @param entries Balance entries
 * @param countryCode ISO country code (e.g. 'CI', 'SN', 'BF')
 */
export async function calculerPassageFiscal(entries: BalanceEntry[], countryCode: string = 'CI'): Promise<TableauPassageResult> {
  const config = await getFiscalConfig(countryCode)

  // Résultat comptable = Produits (classe 7) - Charges (classe 6) + HAO net (classe 8)
  const produits = soldeCredit(entries, ['7'])
  const charges = soldeDebit(entries, ['6'])
  const produitsHAO = soldeCredit(entries, ['82', '84', '86', '88'])
  const chargesHAO = soldeDebit(entries, ['81', '83', '85', '87'])
  const impotBenefice = soldeDebit(entries, ['89'])
  const resultat_comptable = arrondiFCFA(produits - charges + produitsHAO - chargesHAO - impotBenefice)

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

  // R03 — Cadeaux excédentaires — threshold from fiscal config (giftThresholdRate)
  const cadeaux = soldeDebit(entries, ['6234'])
  const giftRate = config.giftThresholdRate ?? 0.001
  const plafond_cadeaux = arrondiFCFA(chiffre_affaires * giftRate)
  const exces_cadeaux = Math.max(0, cadeaux - plafond_cadeaux)
  if (exces_cadeaux > 0) {
    reintegrations.push({
      code: 'R03',
      libelle: `Cadeaux excedentaires (total ${formatM(cadeaux)}, plafond ${formatRate(giftRate)} CA = ${formatM(plafond_cadeaux)})`,
      montant: exces_cadeaux,
      compte_source: '6234',
      base_legale: 'CGI Art. 18-4',
    })
  }

  // R04 — Dons excédentaires — threshold from fiscal config (donationThresholdRate)
  const dons = soldeDebit(entries, ['658'])
  const donationRate = config.donationThresholdRate ?? 0.005
  const plafond_dons = arrondiFCFA(chiffre_affaires * donationRate)
  const exces_dons = Math.max(0, dons - plafond_dons)
  if (exces_dons > 0) {
    reintegrations.push({
      code: 'R04',
      libelle: `Dons excedentaires (total ${formatM(dons)}, plafond ${formatRate(donationRate)} CA = ${formatM(plafond_dons)})`,
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
  // CI-specific: vehicle amortization cap 14M FCFA. No multi-country config field yet.
  const AMORT_VEHICULE_PLAFOND = 14_000_000
  const brut_vp = soldeDebit(entries, ['245'])
  if (brut_vp > AMORT_VEHICULE_PLAFOND) {
    const dotation_vp = soldeDebit(entries, ['6845', '68145', '2845'])
    if (dotation_vp > 0) {
      const ratio_exces = Math.max(0, (brut_vp - AMORT_VEHICULE_PLAFOND) / brut_vp)
      const amort_exces = arrondiFCFA(dotation_vp * ratio_exces)
      if (amort_exces > 0) {
        reintegrations.push({
          code: 'R06',
          libelle: `Amort. VP excedentaires (brut ${formatM(brut_vp)}, plafond ${formatM(AMORT_VEHICULE_PLAFOND)})`,
          montant: amort_exces,
          compte_source: '245/2845',
          base_legale: 'CGI Art. 18-3',
        })
      }
    }
  }

  // R07 — Frais de réception excédentaires — threshold from fiscal config (entertainmentThresholdRate)
  const receptions = soldeDebit(entries, ['627'])
  const entertainmentRate = config.entertainmentThresholdRate ?? 0.01
  const plafond_receptions = arrondiFCFA(chiffre_affaires * entertainmentRate)
  const exces_receptions = Math.max(0, receptions - plafond_receptions)
  if (exces_receptions > 0) {
    reintegrations.push({
      code: 'R07',
      libelle: `Frais de reception excedentaires (total ${formatM(receptions)}, plafond ${formatRate(entertainmentRate)} CA = ${formatM(plafond_receptions)})`,
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

  // IS computation using config rates
  const isRate = config.isRate
  const is_brut = resultat_fiscal > 0 ? fiscalApplyRate(resultat_fiscal, isRate) : 0

  // IMF computation using config rates
  let imf = fiscalApplyRate(chiffre_affaires, config.imfRate)
  if (imf < config.imfMinimum) imf = config.imfMinimum
  if (config.imfMaximum && imf > config.imfMaximum) imf = config.imfMaximum

  const is_du = Math.max(is_brut, imf)

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
    base_is: is_brut >= imf ? 'IS' : 'IMF',
  }
}
