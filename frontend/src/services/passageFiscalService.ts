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
  /** Origine de la ligne — 'auto' = calculée par règle, 'user' = ajout manuel, 'override' = règle auto remplacée par saisie user */
  origine?: 'auto' | 'user' | 'override'
  /** Justification fournie par l'utilisateur (si origine 'user' ou 'override') */
  justification?: string
}

export interface DeductionLigne {
  code: string
  libelle: string
  montant: number
  compte_source: string
  base_legale: string
  origine?: 'auto' | 'user' | 'override'
  justification?: string
}

/** Avertissement levé pendant le calcul automatique (à afficher à l'utilisateur). */
export interface PassageFiscalWarning {
  /** Code du contrôle qui a déclenché le warning (ex: 'W-6234', 'W-DEDUCTIBLE-MIXTE') */
  code: string
  /** Niveau d'alerte */
  severite: 'info' | 'attention' | 'critique'
  /** Message lisible */
  message: string
  /** Compte ou code de réintégration concerné */
  reference: string
  /** Action suggérée à l'utilisateur (saisie manuelle attendue) */
  suggestion: string
}

/**
 * Overrides utilisateur pour le passage fiscal.
 * Permet à l'utilisateur de corriger ou compléter les calculs automatiques.
 */
export interface PassageFiscalOverrides {
  /**
   * Reclassement par compte : "sur le compte X, Y FCFA sont effectivement non-déductibles".
   * Si fourni, remplace le calcul automatique pour ce compte.
   *
   * Exemple : `{ "6234": { nonDeductible: 400000, justification: "Cadeaux personnels du DG" } }`
   */
  reclassementsParCompte?: Record<string, {
    /** Montant reclassifié comme non-déductible (s'ajoute au excès auto si différent) */
    nonDeductible: number
    /** Note de l'utilisateur expliquant la classification */
    justification: string
  }>
  /** Réintégrations supplémentaires saisies manuellement (au-delà des règles auto) */
  reintegrationsCustom?: Array<Omit<ReintegrationLigne, 'origine'>>
  /** Déductions supplémentaires saisies manuellement */
  deductionsCustom?: Array<Omit<DeductionLigne, 'origine'>>
  /** Déficits antérieurs reportables (max N années selon CGI) */
  deficitsAnterieurs?: number
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
  /** Avertissements levés pendant le calcul automatique (saisie utilisateur conseillée) */
  warnings: PassageFiscalWarning[]
  /** Métadonnées d'audit : combien de lignes auto vs user vs override */
  audit: {
    nbAuto: number
    nbUser: number
    nbOverride: number
    /** True si le résultat fiscal est issu uniquement du calcul auto (aucune saisie user) */
    estPurementAutomatique: boolean
  }
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
 * **Phase 4 — Overrides utilisateur** : la saisie manuelle (`overrides.reclassementsParCompte`,
 * `reintegrationsCustom`, `deductionsCustom`) remplace ou complète le calcul automatique.
 * Des warnings sont levés pour les comptes mixtes (6234, 658, 627) sans reclassement user,
 * pour inciter le comptable à valider la classification.
 *
 * @param entries Balance entries
 * @param countryCode ISO country code (e.g. 'CI', 'SN', 'BF')
 * @param options Overrides utilisateur + déficits antérieurs
 */
export async function calculerPassageFiscal(
  entries: BalanceEntry[],
  countryCode: string = 'CI',
  options?: PassageFiscalOverrides | { deficitsAnterieurs?: number }
): Promise<TableauPassageResult> {
  const config = await getFiscalConfig(countryCode)
  const overrides: PassageFiscalOverrides = (options ?? {}) as PassageFiscalOverrides
  const warnings: PassageFiscalWarning[] = []

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
      origine: 'auto',
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
      origine: 'auto',
    })
  }

  // R03 — Cadeaux excédentaires — threshold from fiscal config (giftThresholdRate)
  // Compte 6234 = mixte (cadeaux clients pro + cadeaux personnels). Saisie user encouragée.
  const cadeaux = soldeDebit(entries, ['6234'])
  const giftRate = config.giftThresholdRate ?? 0.001
  const plafond_cadeaux = arrondiFCFA(chiffre_affaires * giftRate)
  const exces_cadeaux_auto = Math.max(0, cadeaux - plafond_cadeaux)
  const overrideCadeaux = overrides.reclassementsParCompte?.['6234']
  if (overrideCadeaux) {
    reintegrations.push({
      code: 'R03',
      libelle: `Cadeaux non-deductibles (saisie user, total compte ${formatM(cadeaux)})`,
      montant: arrondiFCFA(overrideCadeaux.nonDeductible),
      compte_source: '6234',
      base_legale: 'CGI Art. 18-4',
      origine: 'override',
      justification: overrideCadeaux.justification,
    })
  } else if (exces_cadeaux_auto > 0) {
    reintegrations.push({
      code: 'R03',
      libelle: `Cadeaux excedentaires (total ${formatM(cadeaux)}, plafond ${formatRate(giftRate)} CA = ${formatM(plafond_cadeaux)})`,
      montant: exces_cadeaux_auto,
      compte_source: '6234',
      base_legale: 'CGI Art. 18-4',
      origine: 'auto',
    })
    if (cadeaux > 0) {
      warnings.push({
        code: 'W-6234',
        severite: 'attention',
        message: `Compte 6234 (Cadeaux) : ${formatM(cadeaux)} FCFA. Verifiez si une partie est constituee de cadeaux personnels (100% non-deductibles). La regle automatique applique uniquement le plafond de ${formatRate(giftRate)} du CA.`,
        reference: '6234',
        suggestion: 'Si une partie est non-pro, fournissez un override : reclassementsParCompte["6234"] = { nonDeductible: <FCFA>, justification: "..." }',
      })
    }
  } else if (cadeaux > 0) {
    warnings.push({
      code: 'W-6234',
      severite: 'info',
      message: `Compte 6234 (Cadeaux) : ${formatM(cadeaux)} FCFA, sous le plafond de ${formatRate(giftRate)} CA. Verifiez tout de meme si une part personnelle existe.`,
      reference: '6234',
      suggestion: 'Override possible si vous identifiez une part non-pro.',
    })
  }

  // R04 — Dons excédentaires — threshold from fiscal config (donationThresholdRate)
  const dons = soldeDebit(entries, ['658'])
  const donationRate = config.donationThresholdRate ?? 0.005
  const plafond_dons = arrondiFCFA(chiffre_affaires * donationRate)
  const exces_dons_auto = Math.max(0, dons - plafond_dons)
  const overrideDons = overrides.reclassementsParCompte?.['658']
  if (overrideDons) {
    reintegrations.push({
      code: 'R04',
      libelle: `Dons non-deductibles (saisie user, total compte ${formatM(dons)})`,
      montant: arrondiFCFA(overrideDons.nonDeductible),
      compte_source: '658',
      base_legale: 'CGI Art. 18-5',
      origine: 'override',
      justification: overrideDons.justification,
    })
  } else if (exces_dons_auto > 0) {
    reintegrations.push({
      code: 'R04',
      libelle: `Dons excedentaires (total ${formatM(dons)}, plafond ${formatRate(donationRate)} CA = ${formatM(plafond_dons)})`,
      montant: exces_dons_auto,
      compte_source: '658',
      base_legale: 'CGI Art. 18-5',
      origine: 'auto',
    })
    if (dons > 0) {
      warnings.push({
        code: 'W-658',
        severite: 'attention',
        message: `Compte 658 (Dons et liberalites) : ${formatM(dons)} FCFA. Seuls les dons aux organismes agrees sont deductibles (limites a ${formatRate(donationRate)} du CA). Verifier la nature du beneficiaire.`,
        reference: '658',
        suggestion: 'Override si donations non-agreees presentes : reclassementsParCompte["658"]',
      })
    }
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
      origine: 'auto',
    })
  }

  // R06 — Amortissements excédentaires VP (brut > plafond)
  // Multi-country: uses config.vehicleAmortCap if available, defaults to 14M FCFA (CI)
  const AMORT_VEHICULE_PLAFOND = (config as any).vehicleAmortCap ?? 14_000_000
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
          origine: 'auto',
        })
      }
    }
  }

  // R07 — Frais de réception excédentaires — threshold from fiscal config (entertainmentThresholdRate)
  // Compte 627 = mixte (réceptions client + privées). Saisie user encouragée si > seuil pratique.
  const receptions = soldeDebit(entries, ['627'])
  const entertainmentRate = config.entertainmentThresholdRate ?? 0.01
  const plafond_receptions = arrondiFCFA(chiffre_affaires * entertainmentRate)
  const exces_receptions_auto = Math.max(0, receptions - plafond_receptions)
  const overrideReceptions = overrides.reclassementsParCompte?.['627']
  if (overrideReceptions) {
    reintegrations.push({
      code: 'R07',
      libelle: `Frais de reception non-deductibles (saisie user, total compte ${formatM(receptions)})`,
      montant: arrondiFCFA(overrideReceptions.nonDeductible),
      compte_source: '627',
      base_legale: 'CGI Art. 18-4',
      origine: 'override',
      justification: overrideReceptions.justification,
    })
  } else if (exces_receptions_auto > 0) {
    reintegrations.push({
      code: 'R07',
      libelle: `Frais de reception excedentaires (total ${formatM(receptions)}, plafond ${formatRate(entertainmentRate)} CA = ${formatM(plafond_receptions)})`,
      montant: exces_receptions_auto,
      compte_source: '627',
      base_legale: 'CGI Art. 18-4',
      origine: 'auto',
    })
    if (receptions > 0) {
      warnings.push({
        code: 'W-627',
        severite: 'attention',
        message: `Compte 627 (Frais de reception) : ${formatM(receptions)} FCFA. Verifiez si une partie est privee (deplacement personnel, anniversaire, etc.) — 100% non-deductible.`,
        reference: '627',
        suggestion: 'Override possible : reclassementsParCompte["627"]',
      })
    }
  }

  // === WARNINGS — Comptes mixtes sans override (independant des plafonds) ===

  // Compte 624 (Entretien immobilisations) — souvent contient charges privées sur véhicule personnel
  const entretien = soldeDebit(entries, ['624'])
  if (entretien > 1_000_000 && !overrides.reclassementsParCompte?.['624']) {
    warnings.push({
      code: 'W-624',
      severite: 'info',
      message: `Compte 624 (Entretien immobilisations) : ${formatM(entretien)} FCFA. Pas de plafond legal automatique, mais l'entretien de vehicules personnels est non-deductible. Verifier la liste des immobilisations entretenues.`,
      reference: '624',
      suggestion: 'Si charges privees identifiees : reclassementsParCompte["624"]',
    })
  }

  // Compte 6256 (Missions / déplacements) — risque de charges privées
  const missions = soldeDebit(entries, ['6256'])
  if (missions > 2_000_000 && !overrides.reclassementsParCompte?.['6256']) {
    warnings.push({
      code: 'W-6256',
      severite: 'info',
      message: `Compte 6256 (Missions/deplacements) : ${formatM(missions)} FCFA. Verifiez justificatifs (ordres de mission, factures hotel) et plafond per diem en vigueur.`,
      reference: '6256',
      suggestion: 'Override si frais non-justifies : reclassementsParCompte["6256"]',
    })
  }

  // Compte 626 (Frais postaux/téléphoniques) — souvent mixte pro/perso
  const fraisComm = soldeDebit(entries, ['626'])
  if (fraisComm > 1_500_000 && !overrides.reclassementsParCompte?.['626']) {
    warnings.push({
      code: 'W-626',
      severite: 'info',
      message: `Compte 626 (Frais postaux et telecoms) : ${formatM(fraisComm)} FCFA. Si telephones perso utilises, une part est non-deductible.`,
      reference: '626',
      suggestion: 'Override possible : reclassementsParCompte["626"]',
    })
  }

  // === RÉINTÉGRATIONS USER (custom) ===
  if (overrides.reintegrationsCustom && overrides.reintegrationsCustom.length > 0) {
    for (const r of overrides.reintegrationsCustom) {
      if (r.montant > 0) {
        reintegrations.push({ ...r, origine: 'user' })
      }
    }
  }

  // Réintégrations issues de reclassements pour comptes hors-règle (624, 6256, 626, etc.)
  for (const [compte, recl] of Object.entries(overrides.reclassementsParCompte ?? {})) {
    if (['6234', '658', '627'].includes(compte)) continue // déjà traité ci-dessus
    if (recl.nonDeductible > 0) {
      reintegrations.push({
        code: `R-USER-${compte}`,
        libelle: `Reclassement user compte ${compte}`,
        montant: arrondiFCFA(recl.nonDeductible),
        compte_source: compte,
        base_legale: 'CGI Art. 18 (saisie user)',
        origine: 'user',
        justification: recl.justification,
      })
    }
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
      origine: 'auto',
    })
  }

  // === DÉDUCTIONS USER (custom) ===
  if (overrides.deductionsCustom && overrides.deductionsCustom.length > 0) {
    for (const d of overrides.deductionsCustom) {
      if (d.montant > 0) {
        deductions.push({ ...d, origine: 'user' })
      }
    }
  }

  // === CALCULS FINAUX ===
  const total_reintegrations = arrondiFCFA(reintegrations.reduce((s, r) => s + r.montant, 0))
  const total_deductions = arrondiFCFA(deductions.reduce((s, d) => s + d.montant, 0))
  let resultat_fiscal = arrondiFCFA(resultat_comptable + total_reintegrations - total_deductions)

  // Loss carryforward: subtract prior-year deficits from positive resultat fiscal
  const deficitsAnterieurs = overrides.deficitsAnterieurs ?? 0
  if (deficitsAnterieurs > 0 && resultat_fiscal > 0) {
    const deductionDeficit = Math.min(deficitsAnterieurs, resultat_fiscal)
    resultat_fiscal = arrondiFCFA(resultat_fiscal - deductionDeficit)
    if (deductionDeficit > 0) {
      deductions.push({
        code: 'D02',
        libelle: `Report deficitaire anterieur (max ${config.lossCarryforwardYears ?? 5} ans)`,
        montant: deductionDeficit,
        compte_source: 'N/A',
        base_legale: 'CGI Art. 4',
        origine: 'auto',
      })
    }
  }

  // IS computation using config rates
  const isRate = config.isRate
  const is_brut = resultat_fiscal > 0 ? fiscalApplyRate(resultat_fiscal, isRate) : 0

  // IMF computation using config rates
  let imf = fiscalApplyRate(chiffre_affaires, config.imfRate)
  if (imf < config.imfMinimum) imf = config.imfMinimum
  if (config.imfMaximum && imf > config.imfMaximum) imf = config.imfMaximum

  const is_du = Math.max(is_brut, imf)

  // === AUDIT TRAIL ===
  const allLines = [...reintegrations, ...deductions]
  const nbAuto = allLines.filter((l) => l.origine === 'auto' || l.origine === undefined).length
  const nbUser = allLines.filter((l) => l.origine === 'user').length
  const nbOverride = allLines.filter((l) => l.origine === 'override').length

  return {
    resultat_comptable,
    chiffre_affaires,
    reintegrations,
    deductions,
    total_reintegrations: arrondiFCFA(reintegrations.reduce((s, r) => s + r.montant, 0)),
    total_deductions: arrondiFCFA(deductions.reduce((s, d) => s + d.montant, 0)),
    resultat_fiscal,
    is_brut,
    imf,
    is_du,
    base_is: is_brut >= imf ? 'IS' : 'IMF',
    warnings,
    audit: {
      nbAuto,
      nbUser,
      nbOverride,
      estPurementAutomatique: nbUser === 0 && nbOverride === 0,
    },
  }
}
