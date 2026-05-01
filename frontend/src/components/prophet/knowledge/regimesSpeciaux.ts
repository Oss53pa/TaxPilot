/**
 * Knowledge — Régimes fiscaux spéciaux OHADA / CGI Côte d'Ivoire
 *
 * Détection et application des régimes dérogatoires :
 *   - PME éligible au taux réduit IS (20% au lieu de 25%) — CGI Art. 33 bis
 *   - Zone franche : exonération IS (mais IMF maintenu) — Loi sur les zones franches
 *   - EBNL (Entité à But Non Lucratif) : associations, fondations
 *   - Coopérative : régime particulier sur opérations entre membres
 *   - Franchise TVA : CA sous seuil, TVA non collectée — CGI Art. 354
 *   - Exonérations TVA : exports, services à l'étranger — CGI Art. 357
 *
 * Tous les régimes sont OPT-IN (l'utilisateur doit déclarer son éligibilité).
 * Le système détecte les opportunités et émet des suggestions, mais n'applique
 * pas les régimes spéciaux sans confirmation explicite (zoneFranche, pmeEligible, etc.).
 */

import type { Balance } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────

export type RegimeSpecifique =
  | 'NORMAL'           // IS 25%, IMF normal
  | 'PME'              // IS 20% (taux réduit PME)
  | 'ZONE_FRANCHE'     // IS 0%, IMF maintenu
  | 'EBNL'             // Association/fondation : IS 0% sur activité non-lucrative
  | 'COOPERATIVE'      // IS 0% sur opérations avec membres

export interface RegimeContext {
  type: RegimeSpecifique
  /** Référence légale du régime */
  baseLegale: string
  /** Taux IS effectif (0 si exonéré) */
  tauxIS: number
  /** Description lisible */
  description: string
  /** L'IMF reste-t-il dû ? (généralement oui, sauf EBNL stricte) */
  imfApplicable: boolean
  /** Conditions à valider pour l'éligibilité */
  conditions: string[]
}

export interface EntrepriseContext {
  nom?: string
  regime_imposition?: string
  capital?: number
  effectifs?: number
  secteur_activite?: string
  /** Opt-in : zone franche déclarée */
  zoneFranche?: boolean
  /** Opt-in : PME éligible au taux réduit (déclaration de l'utilisateur) */
  pmeEligible?: boolean
  /** Opt-in : entité à but non lucratif */
  ebnl?: boolean
  /** Opt-in : coopérative agréée */
  cooperative?: boolean
  /** Capital majoritairement détenu par personnes physiques (critère PME) */
  capitalPhysiquesMajoritaire?: boolean
}

export interface TvaSpecificites {
  /** True si éligible à la franchise (CA < seuil franchise) */
  franchiseTvaEligible: boolean
  seuilFranchiseTva: number
  /** Ventes export détectées (compte 7012, 7013) — exonérées de TVA */
  ventesExport: number
  /** Services à l'étranger (compte 7066) — exonérés */
  servicesEtranger: number
  /** Warnings sur la couverture TVA */
  warnings: string[]
}

// ─── Constantes CGI CI ────────────────────────────────────────────────

/** Seuil de CA pour éligibilité PME au taux réduit IS — CGI Art. 33 bis */
const SEUIL_CA_PME = 1_000_000_000  // 1 milliard FCFA (~ 1.5M EUR)

/** Seuil franchise TVA — CGI Art. 354 (variable selon secteur, valeur de référence) */
const SEUIL_FRANCHISE_TVA_DEFAUT = 50_000_000  // 50M FCFA

/** Taux IS PME (CGI Art. 33 bis) */
const TAUX_IS_PME = 0.20

/** Taux IS normal (CGI Art. 33) */
const TAUX_IS_NORMAL = 0.25

// ─── Detection du régime applicable ───────────────────────────────────

/**
 * Détecte le régime fiscal spécial applicable selon les déclarations utilisateur
 * et les agrégats financiers. Retourne le régime "le plus avantageux" parmi
 * ceux pour lesquels l'utilisateur s'est déclaré éligible.
 *
 * Priorité (du plus avantageux au moins) :
 *   1. ZONE_FRANCHE (IS 0%)
 *   2. EBNL (IS 0%)
 *   3. COOPERATIVE (IS 0%)
 *   4. PME (IS 20%)
 *   5. NORMAL (IS 25%)
 */
export function detectRegimeSpecifique(
  entreprise: EntrepriseContext | undefined,
  ca: number,
): RegimeContext {
  const e = entreprise ?? {}

  // 1. Zone franche déclarée → IS 0% (mais IMF maintenu)
  if (e.zoneFranche) {
    return {
      type: 'ZONE_FRANCHE',
      baseLegale: 'Loi sur les zones franches industrielles (Côte d\'Ivoire)',
      tauxIS: 0,
      description: 'Exonération totale d\'IS pour activités en zone franche. L\'IMF reste dû.',
      imfApplicable: true,
      conditions: [
        'Agrément zone franche en cours de validité',
        'Activité éligible (transformation, export)',
        'Justification de la part export ≥ 80% du CA',
      ],
    }
  }

  // 2. EBNL déclarée
  if (e.ebnl) {
    return {
      type: 'EBNL',
      baseLegale: 'CGI Art. 4 et statuts d\'utilité publique',
      tauxIS: 0,
      description: 'Association ou fondation : IS 0% sur les activités non-lucratives uniquement. Les activités lucratives accessoires restent imposables au taux normal.',
      imfApplicable: false,
      conditions: [
        'Statut d\'organisme à but non lucratif officiel',
        'Activité conforme aux statuts',
        'Sectorisation comptable des activités lucratives accessoires si présentes',
      ],
    }
  }

  // 3. Coopérative déclarée
  if (e.cooperative) {
    return {
      type: 'COOPERATIVE',
      baseLegale: 'CGI Art. 24 (coopératives agréées)',
      tauxIS: 0,
      description: 'Coopérative : IS 0% sur les opérations effectuées avec les membres. Les opérations avec tiers restent imposables.',
      imfApplicable: true,
      conditions: [
        'Agrément coopératif en cours',
        'Identification comptable des opérations membres vs tiers',
      ],
    }
  }

  // 4. PME éligible (CA + capital + opt-in user)
  if (e.pmeEligible && ca <= SEUIL_CA_PME && (e.capitalPhysiquesMajoritaire ?? true)) {
    return {
      type: 'PME',
      baseLegale: 'CGI Art. 33 bis',
      tauxIS: TAUX_IS_PME,
      description: `PME éligible au taux réduit IS de ${(TAUX_IS_PME * 100).toFixed(0)}% (CA ≤ ${(SEUIL_CA_PME / 1_000_000).toLocaleString('fr-FR')} M FCFA, capital majoritairement détenu par personnes physiques).`,
      imfApplicable: true,
      conditions: [
        `CA annuel ≤ ${SEUIL_CA_PME.toLocaleString('fr-FR')} FCFA`,
        'Capital détenu majoritairement (>50%) par des personnes physiques',
        'Pas de filiale d\'un groupe coté ou multinational',
      ],
    }
  }

  // 5. Régime normal (par défaut)
  return {
    type: 'NORMAL',
    baseLegale: 'CGI Art. 33',
    tauxIS: TAUX_IS_NORMAL,
    description: 'Régime IS normal au taux de 25%.',
    imfApplicable: true,
    conditions: [],
  }
}

/**
 * Détecte les opportunités de régime spécial NON déclarées par l'utilisateur.
 * Retourne des suggestions à afficher (pour inciter à vérifier l'éligibilité).
 */
export function detectOpportunitesRegimeSpecifique(
  entreprise: EntrepriseContext | undefined,
  ca: number,
): { code: string; message: string; suggestion: string }[] {
  const opportunites: { code: string; message: string; suggestion: string }[] = []
  const e = entreprise ?? {}

  // PME non-déclarée alors que CA y serait éligible
  if (!e.pmeEligible && ca > 0 && ca <= SEUIL_CA_PME) {
    opportunites.push({
      code: 'OPP-PME',
      message: `Votre CA de ${ca.toLocaleString('fr-FR')} FCFA est sous le seuil PME (${SEUIL_CA_PME.toLocaleString('fr-FR')}). Si votre capital est majoritairement détenu par des personnes physiques, vous pourriez bénéficier du taux IS réduit de 20% (au lieu de 25%) — CGI Art. 33 bis.`,
      suggestion: "Déclarer pmeEligible: true et capitalPhysiquesMajoritaire: true dans le contexte entreprise si applicable.",
    })
  }

  // Zone franche non-déclarée si secteur le suggère
  const secteur = (e.secteur_activite ?? '').toLowerCase()
  if (!e.zoneFranche && /export|transformation|industrielle|zone franche/.test(secteur)) {
    opportunites.push({
      code: 'OPP-ZONE-FRANCHE',
      message: `Votre secteur (${secteur}) pourrait être éligible au régime zone franche (exonération IS totale, IMF maintenu). À vérifier auprès du CEPICI.`,
      suggestion: 'Déclarer zoneFranche: true si vous disposez d\'un agrément en cours.',
    })
  }

  // EBNL non-déclarée si secteur ou nom le suggère
  const nomLower = (e.nom ?? '').toLowerCase()
  if (!e.ebnl && (/association|fondation|ong|fondation/.test(nomLower) || /association|ong/.test(secteur))) {
    opportunites.push({
      code: 'OPP-EBNL',
      message: `Le nom ou le secteur suggère un statut associatif. Si vous êtes une organisation à but non lucratif officiellement reconnue, déclarez ebnl: true pour bénéficier de l'exonération IS sur les activités non-lucratives.`,
      suggestion: 'Déclarer ebnl: true si statut OBNL.',
    })
  }

  return opportunites
}

// ─── Calcul IS adapté au régime ───────────────────────────────────────

export interface ISCalculRegime {
  is_brut: number
  imf: number
  is_du: number
  base: 'IS' | 'IMF' | 'EXONERE'
  regime: RegimeSpecifique
  tauxApplique: number
  /** Économie réalisée par rapport au régime normal (pour transparence) */
  economieParRapportNormal: number
}

/**
 * Calcul IS prenant en compte le régime spécial (PME, zone franche, EBNL, etc.).
 * Retourne aussi l'économie par rapport au régime normal pour traçabilité.
 */
export function calculerISAvecRegime(
  resultatFiscal: number,
  chiffreAffaires: number,
  regime: RegimeContext,
  imfMinimum: number = 3_000_000,
  imfMaximum: number = 35_000_000,
  imfRate: number = 0.005,
): ISCalculRegime {
  // IS brut au taux du régime
  const is_brut = Math.max(0, Math.round(resultatFiscal * regime.tauxIS))

  // IMF
  let imf = 0
  if (regime.imfApplicable) {
    const imf_calc = Math.round(chiffreAffaires * imfRate)
    imf = Math.max(imfMinimum, Math.min(imf_calc, imfMaximum))
  }

  // IS dû
  const is_du = Math.max(is_brut, imf)

  // Base
  let base: 'IS' | 'IMF' | 'EXONERE'
  if (regime.tauxIS === 0 && imf === 0) base = 'EXONERE'
  else if (is_brut >= imf) base = 'IS'
  else base = 'IMF'

  // Économie vs régime normal (resultatFiscal × 25% vs is_du)
  const isNormal = Math.max(
    Math.max(0, Math.round(resultatFiscal * TAUX_IS_NORMAL)),
    Math.max(imfMinimum, Math.min(Math.round(chiffreAffaires * imfRate), imfMaximum)),
  )
  const economieParRapportNormal = Math.max(0, isNormal - is_du)

  return {
    is_brut,
    imf,
    is_du,
    base,
    regime: regime.type,
    tauxApplique: regime.tauxIS,
    economieParRapportNormal,
  }
}

// ─── TVA : franchise et exonérations ──────────────────────────────────

/**
 * Détecte les spécificités TVA :
 *   - Franchise possible si CA < seuil
 *   - Ventes à l'export (700x) → exonérées
 *   - Services à l'étranger (706x) → exonérés
 */
export function detectTvaSpecificites(
  balance: Balance[],
  ca: number,
  seuilFranchise: number = SEUIL_FRANCHISE_TVA_DEFAUT,
): TvaSpecificites {
  const warnings: string[] = []

  // Franchise TVA
  const franchiseTvaEligible = ca > 0 && ca < seuilFranchise

  // Ventes export : compte 7012 (Ventes à l'étranger) ou 7013 (Ventes export)
  const ventesExport = balance
    .filter((b) => /^701[23]/.test(b.compte))
    .reduce((sum, b) => sum + Math.max(0, -b.solde), 0)

  // Services à l'étranger : compte 7066
  const servicesEtranger = balance
    .filter((b) => b.compte.startsWith('7066'))
    .reduce((sum, b) => sum + Math.max(0, -b.solde), 0)

  // Warning : si ventes export > 0 mais TVA collectée à l'export, anomalie
  const tvaCollecteeExport = balance
    .filter((b) => /^4431[23]/.test(b.compte))
    .reduce((sum, b) => sum + Math.max(0, -b.solde), 0)
  if (ventesExport > 0 && tvaCollecteeExport > 0) {
    warnings.push(`Ventes export détectées (${ventesExport.toLocaleString('fr-FR')} FCFA) avec TVA collectée non-nulle (${tvaCollecteeExport.toLocaleString('fr-FR')} FCFA). Les exports sont en principe exonérés (CGI Art. 357) — vérifier l'écriture.`)
  }

  // Warning : franchise potentiellement applicable
  if (franchiseTvaEligible) {
    warnings.push(`CA = ${ca.toLocaleString('fr-FR')} FCFA < seuil franchise TVA (${seuilFranchise.toLocaleString('fr-FR')}). Vérifier si l'option franchise est opportune (vous ne collectez pas de TVA mais ne récupérez pas la TVA déductible).`)
  }

  return {
    franchiseTvaEligible,
    seuilFranchiseTva: seuilFranchise,
    ventesExport: Math.round(ventesExport),
    servicesEtranger: Math.round(servicesEtranger),
    warnings,
  }
}
