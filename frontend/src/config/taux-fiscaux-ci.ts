/**
 * Taux fiscaux Côte d'Ivoire — Code Général des Impôts
 * Dernière mise à jour : Loi de Finances 2025
 * ⚠️ TOUS les calculs fiscaux DOIVENT utiliser getTauxFiscaux() pour lire les taux
 */

import { getTauxFiscaux } from '@/store/tauxFiscauxStore'

export { getTauxFiscaux }

export const TAUX_FISCAUX_CI = {
  // === IMPÔT SUR LES BÉNÉFICES (BIC/IS) ===
  IS: {
    taux_normal: 0.25,           // 25% — CGI Art. 33
    taux_pme: 0.20,              // 20% pour PME éligibles
    taux_zone_franche: 0.00,     // Exonération zone franche
  },

  // === IMPÔT MINIMUM FORFAITAIRE (IMF) ===
  IMF: {
    taux: 0.005,                 // 0.5% du CA — CGI Art. 35
    minimum: 3_000_000,          // 3 000 000 FCFA minimum
    maximum: 35_000_000,         // 35 000 000 FCFA plafond
  },

  // === TVA ===
  TVA: {
    taux_normal: 0.18,           // 18% — CGI Art. 356
    taux_reduit: 0.09,           // 9% (produits de première nécessité)
    taux_zero: 0.00,             // Exportations
    taux_tha: 0.0075,            // Taxe sur habitation 0.75%
  },

  // === RETENUES À LA SOURCE ===
  RETENUES: {
    airsi: 0.075,                // 7.5% — Acompte IS sur prestataires
    irc_resident: 0.15,          // 15% — Retenue sur loyers (résident)
    irc_non_resident: 0.20,      // 20% — Retenue sur loyers (non-résident)
    ircm: 0.15,                  // 15% — Retenue sur dividendes/intérêts
    honoraires: 0.075,           // 7.5% — Retenue sur honoraires
    bic_non_resident: 0.20,      // 20% — BIC non-résident
  },

  // === IMPÔTS SUR SALAIRES ===
  SALAIRES: {
    is_salaire: 0.015,           // 1.5% — Impôt sur salaires (employeur)
    cn: {                        // Contribution Nationale
      tranche1: { plafond: 600_000, taux: 0.00 },
      tranche2: { plafond: 1_560_000, taux: 0.015 },
      tranche3: { plafond: 2_400_000, taux: 0.05 },
      tranche4: { plafond: Infinity, taux: 0.10 },
    },
    igr: {                       // IGR — barème progressif
      tranches: [
        { plafond: 300_000, taux: 0.00 },
        { plafond: 547_000, taux: 0.10 },
        { plafond: 979_000, taux: 0.15 },
        { plafond: 1_519_000, taux: 0.20 },
        { plafond: 2_644_000, taux: 0.25 },
        { plafond: 4_669_000, taux: 0.30 },
        { plafond: 10_106_000, taux: 0.35 },
        { plafond: Infinity, taux: 0.40 },
      ],
    },
    fpc: 0.012,                  // 1.2% — Formation professionnelle
    taxe_apprentissage: 0.004,   // 0.4%
  },

  // === CNPS ===
  CNPS: {
    retraite_employeur: 0.0765,  // 7.65%
    retraite_salarie: 0.0635,    // 6.35%
    prestations_familiales: 0.055, // 5.5% (employeur seul)
    accident_travail: 0.04,      // 2% à 5% selon secteur (4% défaut commerce)
    plafond_retraite: 2_700_000, // Plafond mensuel
    plafond_pf: 70_000,          // Plafond mensuel prestations familiales
  },

  // === IMPÔTS LOCAUX ===
  LOCAUX: {
    contribution_fonciere: {
      taux_bati: 0.15,           // 15% de la valeur locative
      taux_non_bati: 0.04,       // 4% de la valeur locative
    },
    taxe_habitation: 0.03,       // 3% de la valeur locative
    patente: {
      // Barème progressif selon CA
      tranches_ca: [
        { plafond: 5_000_000, droit_fixe: 50_000 },
        { plafond: 15_000_000, droit_fixe: 100_000 },
        { plafond: 50_000_000, droit_fixe: 250_000 },
        { plafond: 150_000_000, droit_fixe: 500_000 },
        { plafond: 500_000_000, droit_fixe: 1_000_000 },
        { plafond: Infinity, droit_fixe: 2_000_000 },
      ],
      taux_proportionnel: 0.185, // 18.5% de la valeur locative
    },
  },

  // === DROITS D'ENREGISTREMENT ===
  ENREGISTREMENT: {
    cession_immeubles: 0.10,     // 10%
    cession_fonds_commerce: 0.10,
    baux: 0.025,                 // 2.5% du loyer annuel
  },

  // === CHARGES NON DÉDUCTIBLES ===
  DEDUCTIBILITE: {
    plafond_cadeaux: 0.001,      // 1‰ du CA
    plafond_dons: 0.005,         // 5‰ du CA
    plafond_interets_cc: 0.02,   // Taux max intérêts compte courant associé
    amort_vehicule_plafond: 14_000_000, // Plafond amortissement VP
    plafond_missions: 50_000,    // Plafond par jour mission interne
  },

  // === ACOMPTES IS ===
  ACOMPTES: {
    nombre: 4,                   // 4 acomptes trimestriels
    echeances: ['15 mars', '15 juin', '15 septembre', '15 décembre'] as const,
    base: 'IS exercice précédent' as const,
    taux_acompte: 0.25,          // 25% de l'IS N-1 par acompte
  },
} as const

// === HELPER : Arrondi FCFA (0 décimales) ===
export function arrondiFCFA(montant: number): number {
  return Math.round(montant)
}

// === HELPER : Calcul IS avec IMF ===
export function calculerIS(resultatFiscal: number, chiffreAffaires: number): {
  is_brut: number
  imf: number
  is_du: number
  base: 'IS' | 'IMF'
} {
  const taux = getTauxFiscaux()
  const is_brut = Math.max(0, Math.round(resultatFiscal * taux.IS.taux_normal))
  const imf_brut = Math.round(chiffreAffaires * taux.IMF.taux)
  const imf = Math.max(taux.IMF.minimum, Math.min(imf_brut, taux.IMF.maximum))
  const is_du = Math.max(is_brut, imf)
  return { is_brut, imf, is_du, base: is_brut >= imf ? 'IS' : 'IMF' }
}

// === HELPER : Calcul TVA ===
export function calculerTVA(montantHT: number, taux?: number): {
  ht: number
  tva: number
  ttc: number
} {
  const t = taux ?? getTauxFiscaux().TVA.taux_normal
  const tva = arrondiFCFA(montantHT * t)
  return { ht: arrondiFCFA(montantHT), tva, ttc: arrondiFCFA(montantHT + tva) }
}

// === HELPER : Calcul Patente ===
export function calculerPatente(chiffreAffaires: number, valeurLocative: number): {
  droit_fixe: number
  droit_proportionnel: number
  total: number
} {
  const t = getTauxFiscaux()
  const tranches = t.LOCAUX.patente.tranches_ca
  let droit_fixe = tranches[tranches.length - 1].droit_fixe
  for (const tranche of tranches) {
    if (chiffreAffaires <= tranche.plafond) {
      droit_fixe = tranche.droit_fixe
      break
    }
  }
  const droit_proportionnel = arrondiFCFA(valeurLocative * t.LOCAUX.patente.taux_proportionnel)
  return { droit_fixe, droit_proportionnel, total: droit_fixe + droit_proportionnel }
}
