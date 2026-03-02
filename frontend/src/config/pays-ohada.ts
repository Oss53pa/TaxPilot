/**
 * Configuration Multi-Pays OHADA — 17 Pays de l'espace OHADA
 * Sources: Codes Généraux des Impôts nationaux, Lois de Finances 2024-2025
 *
 * Chaque pays partage le plan comptable SYSCOHADA Révisé mais a ses propres :
 *   - Taux d'imposition (IS, TVA, IMF)
 *   - Devise et format monétaire
 *   - Calendrier fiscal et dates limites
 *   - Autorité fiscale (DGI) et endpoints télédéclaration
 *   - Spécificités comptables
 */

// ============================================================
// Types
// ============================================================

export interface PaysOHADA {
  code: string            // ISO 3166-1 alpha-2
  nom: string
  nomComplet: string
  devise: string          // ISO 4217
  symboleDevise: string
  zoneFrancCFA: boolean   // true = XOF/XAF, false = autres (KMF, CDF)
  unionMonetaire: 'UEMOA' | 'CEMAC' | 'AUCUNE'
  fuseau: string          // IANA timezone
  langueOfficielle: string

  // Taux fiscaux principaux
  fiscalite: {
    IS: { taux_normal: number; taux_pme?: number; minimum_perception?: number }
    TVA: { taux_normal: number; taux_reduit?: number; seuil_assujettissement?: number }
    IMF: { taux: number; minimum: number; maximum: number }
    retenue_source: { taux_prestation: number; taux_loyer: number; taux_dividende: number }
  }

  // Calendrier fiscal
  calendrier: {
    exercice_debut: string  // 'MM-DD' format
    exercice_fin: string
    date_limite_liasse: string  // 'MM-DD' (après clôture)
    date_limite_is: string
    date_limite_tva: string     // jour du mois suivant
    periodicite_tva: 'mensuelle' | 'trimestrielle'
  }

  // Autorité fiscale
  dgi: {
    nom: string
    sigle: string
    url?: string
    api_teledeclaration?: string
    format_contribuable: string  // regex pattern
  }

  // Spécificités plan comptable
  comptabilite: {
    plan_comptable: 'SYSCOHADA_REVISE'  // Tous utilisent le révisé depuis 2018
    comptes_specifiques?: Record<string, string>  // comptes locaux spéciaux
    notes_annexes_obligatoires?: string[]
  }
}

// ============================================================
// Registre des 17 pays OHADA
// ============================================================

export const PAYS_OHADA: Record<string, PaysOHADA> = {
  // ── UEMOA (8 pays — Franc CFA XOF) ──

  CI: {
    code: 'CI',
    nom: "Côte d'Ivoire",
    nomComplet: "République de Côte d'Ivoire",
    devise: 'XOF',
    symboleDevise: 'FCFA',
    zoneFrancCFA: true,
    unionMonetaire: 'UEMOA',
    fuseau: 'Africa/Abidjan',
    langueOfficielle: 'fr',
    fiscalite: {
      IS: { taux_normal: 0.25, taux_pme: 0.20 },
      TVA: { taux_normal: 0.18, taux_reduit: 0.09 },
      IMF: { taux: 0.005, minimum: 3_000_000, maximum: 35_000_000 },
      retenue_source: { taux_prestation: 0.075, taux_loyer: 0.15, taux_dividende: 0.15 },
    },
    calendrier: {
      exercice_debut: '01-01', exercice_fin: '12-31',
      date_limite_liasse: '06-30', date_limite_is: '04-20', date_limite_tva: '15',
      periodicite_tva: 'mensuelle',
    },
    dgi: {
      nom: 'Direction Générale des Impôts',
      sigle: 'DGI-CI',
      url: 'https://www.dgi.gouv.ci',
      format_contribuable: '^\\d{7}[A-Z]$',
    },
    comptabilite: {
      plan_comptable: 'SYSCOHADA_REVISE',
      notes_annexes_obligatoires: ['Note 1', 'Note 2', 'Note 3', 'TAFIRE'],
    },
  },

  SN: {
    code: 'SN',
    nom: 'Sénégal',
    nomComplet: 'République du Sénégal',
    devise: 'XOF',
    symboleDevise: 'FCFA',
    zoneFrancCFA: true,
    unionMonetaire: 'UEMOA',
    fuseau: 'Africa/Dakar',
    langueOfficielle: 'fr',
    fiscalite: {
      IS: { taux_normal: 0.30 },
      TVA: { taux_normal: 0.18, taux_reduit: 0.10 },
      IMF: { taux: 0.005, minimum: 500_000, maximum: 5_000_000 },
      retenue_source: { taux_prestation: 0.05, taux_loyer: 0.10, taux_dividende: 0.10 },
    },
    calendrier: {
      exercice_debut: '01-01', exercice_fin: '12-31',
      date_limite_liasse: '04-30', date_limite_is: '04-30', date_limite_tva: '15',
      periodicite_tva: 'mensuelle',
    },
    dgi: {
      nom: 'Direction Générale des Impôts et des Domaines',
      sigle: 'DGID',
      url: 'https://www.dgid.sn',
      format_contribuable: '^\\d{9}$',
    },
    comptabilite: { plan_comptable: 'SYSCOHADA_REVISE' },
  },

  BF: {
    code: 'BF',
    nom: 'Burkina Faso',
    nomComplet: 'Burkina Faso',
    devise: 'XOF',
    symboleDevise: 'FCFA',
    zoneFrancCFA: true,
    unionMonetaire: 'UEMOA',
    fuseau: 'Africa/Ouagadougou',
    langueOfficielle: 'fr',
    fiscalite: {
      IS: { taux_normal: 0.275 },
      TVA: { taux_normal: 0.18 },
      IMF: { taux: 0.005, minimum: 1_000_000, maximum: 10_000_000 },
      retenue_source: { taux_prestation: 0.05, taux_loyer: 0.10, taux_dividende: 0.125 },
    },
    calendrier: {
      exercice_debut: '01-01', exercice_fin: '12-31',
      date_limite_liasse: '04-30', date_limite_is: '04-30', date_limite_tva: '20',
      periodicite_tva: 'mensuelle',
    },
    dgi: {
      nom: 'Direction Générale des Impôts',
      sigle: 'DGI-BF',
      url: 'https://www.impots.gov.bf',
      format_contribuable: '^\\d{8}$',
    },
    comptabilite: { plan_comptable: 'SYSCOHADA_REVISE' },
  },

  ML: {
    code: 'ML',
    nom: 'Mali',
    nomComplet: 'République du Mali',
    devise: 'XOF',
    symboleDevise: 'FCFA',
    zoneFrancCFA: true,
    unionMonetaire: 'UEMOA',
    fuseau: 'Africa/Bamako',
    langueOfficielle: 'fr',
    fiscalite: {
      IS: { taux_normal: 0.30 },
      TVA: { taux_normal: 0.18 },
      IMF: { taux: 0.0075, minimum: 500_000, maximum: 12_500_000 },
      retenue_source: { taux_prestation: 0.05, taux_loyer: 0.15, taux_dividende: 0.10 },
    },
    calendrier: {
      exercice_debut: '01-01', exercice_fin: '12-31',
      date_limite_liasse: '04-30', date_limite_is: '04-30', date_limite_tva: '15',
      periodicite_tva: 'mensuelle',
    },
    dgi: {
      nom: 'Direction Générale des Impôts',
      sigle: 'DGI-ML',
      format_contribuable: '^\\d{9}$',
    },
    comptabilite: { plan_comptable: 'SYSCOHADA_REVISE' },
  },

  BJ: {
    code: 'BJ',
    nom: 'Bénin',
    nomComplet: 'République du Bénin',
    devise: 'XOF',
    symboleDevise: 'FCFA',
    zoneFrancCFA: true,
    unionMonetaire: 'UEMOA',
    fuseau: 'Africa/Porto-Novo',
    langueOfficielle: 'fr',
    fiscalite: {
      IS: { taux_normal: 0.30 },
      TVA: { taux_normal: 0.18 },
      IMF: { taux: 0.01, minimum: 200_000, maximum: 20_000_000 },
      retenue_source: { taux_prestation: 0.05, taux_loyer: 0.12, taux_dividende: 0.10 },
    },
    calendrier: {
      exercice_debut: '01-01', exercice_fin: '12-31',
      date_limite_liasse: '04-30', date_limite_is: '04-30', date_limite_tva: '15',
      periodicite_tva: 'mensuelle',
    },
    dgi: {
      nom: 'Direction Générale des Impôts',
      sigle: 'DGI-BJ',
      url: 'https://www.impots.bj',
      format_contribuable: '^\\d{13}$',
    },
    comptabilite: { plan_comptable: 'SYSCOHADA_REVISE' },
  },

  TG: {
    code: 'TG',
    nom: 'Togo',
    nomComplet: 'République Togolaise',
    devise: 'XOF',
    symboleDevise: 'FCFA',
    zoneFrancCFA: true,
    unionMonetaire: 'UEMOA',
    fuseau: 'Africa/Lome',
    langueOfficielle: 'fr',
    fiscalite: {
      IS: { taux_normal: 0.27 },
      TVA: { taux_normal: 0.18 },
      IMF: { taux: 0.01, minimum: 500_000, maximum: 5_000_000 },
      retenue_source: { taux_prestation: 0.05, taux_loyer: 0.15, taux_dividende: 0.13 },
    },
    calendrier: {
      exercice_debut: '01-01', exercice_fin: '12-31',
      date_limite_liasse: '03-31', date_limite_is: '03-31', date_limite_tva: '20',
      periodicite_tva: 'mensuelle',
    },
    dgi: {
      nom: 'Office Togolais des Recettes',
      sigle: 'OTR',
      url: 'https://www.otr.tg',
      format_contribuable: '^\\d{10}$',
    },
    comptabilite: { plan_comptable: 'SYSCOHADA_REVISE' },
  },

  NE: {
    code: 'NE',
    nom: 'Niger',
    nomComplet: 'République du Niger',
    devise: 'XOF',
    symboleDevise: 'FCFA',
    zoneFrancCFA: true,
    unionMonetaire: 'UEMOA',
    fuseau: 'Africa/Niamey',
    langueOfficielle: 'fr',
    fiscalite: {
      IS: { taux_normal: 0.30 },
      TVA: { taux_normal: 0.19 },
      IMF: { taux: 0.01, minimum: 200_000, maximum: 5_000_000 },
      retenue_source: { taux_prestation: 0.05, taux_loyer: 0.10, taux_dividende: 0.10 },
    },
    calendrier: {
      exercice_debut: '01-01', exercice_fin: '12-31',
      date_limite_liasse: '04-30', date_limite_is: '04-30', date_limite_tva: '15',
      periodicite_tva: 'mensuelle',
    },
    dgi: {
      nom: 'Direction Générale des Impôts',
      sigle: 'DGI-NE',
      format_contribuable: '^\\d{8}$',
    },
    comptabilite: { plan_comptable: 'SYSCOHADA_REVISE' },
  },

  GW: {
    code: 'GW',
    nom: 'Guinée-Bissau',
    nomComplet: 'République de Guinée-Bissau',
    devise: 'XOF',
    symboleDevise: 'FCFA',
    zoneFrancCFA: true,
    unionMonetaire: 'UEMOA',
    fuseau: 'Africa/Bissau',
    langueOfficielle: 'pt',
    fiscalite: {
      IS: { taux_normal: 0.25 },
      TVA: { taux_normal: 0.15 },
      IMF: { taux: 0.01, minimum: 100_000, maximum: 2_000_000 },
      retenue_source: { taux_prestation: 0.05, taux_loyer: 0.10, taux_dividende: 0.10 },
    },
    calendrier: {
      exercice_debut: '01-01', exercice_fin: '12-31',
      date_limite_liasse: '04-30', date_limite_is: '04-30', date_limite_tva: '15',
      periodicite_tva: 'trimestrielle',
    },
    dgi: {
      nom: 'Direcção Geral dos Impostos',
      sigle: 'DGI-GW',
      format_contribuable: '^\\d{9}$',
    },
    comptabilite: { plan_comptable: 'SYSCOHADA_REVISE' },
  },

  // ── CEMAC (6 pays — Franc CFA XAF) ──

  CM: {
    code: 'CM',
    nom: 'Cameroun',
    nomComplet: 'République du Cameroun',
    devise: 'XAF',
    symboleDevise: 'FCFA',
    zoneFrancCFA: true,
    unionMonetaire: 'CEMAC',
    fuseau: 'Africa/Douala',
    langueOfficielle: 'fr',
    fiscalite: {
      IS: { taux_normal: 0.33, minimum_perception: 0.022 },
      TVA: { taux_normal: 0.1925, taux_reduit: 0.00 },  // 19.25% (TVA 17.5% + CAC 10%)
      IMF: { taux: 0.022, minimum: 2_000_000, maximum: 50_000_000 },
      retenue_source: { taux_prestation: 0.055, taux_loyer: 0.15, taux_dividende: 0.165 },
    },
    calendrier: {
      exercice_debut: '01-01', exercice_fin: '12-31',
      date_limite_liasse: '03-15', date_limite_is: '03-15', date_limite_tva: '15',
      periodicite_tva: 'mensuelle',
    },
    dgi: {
      nom: 'Direction Générale des Impôts',
      sigle: 'DGI-CM',
      url: 'https://www.impots.cm',
      format_contribuable: '^M\\d{9}[A-Z]$',
    },
    comptabilite: { plan_comptable: 'SYSCOHADA_REVISE' },
  },

  GA: {
    code: 'GA',
    nom: 'Gabon',
    nomComplet: 'République Gabonaise',
    devise: 'XAF',
    symboleDevise: 'FCFA',
    zoneFrancCFA: true,
    unionMonetaire: 'CEMAC',
    fuseau: 'Africa/Libreville',
    langueOfficielle: 'fr',
    fiscalite: {
      IS: { taux_normal: 0.30 },
      TVA: { taux_normal: 0.18, taux_reduit: 0.10 },
      IMF: { taux: 0.01, minimum: 1_000_000, maximum: 30_000_000 },
      retenue_source: { taux_prestation: 0.10, taux_loyer: 0.15, taux_dividende: 0.20 },
    },
    calendrier: {
      exercice_debut: '01-01', exercice_fin: '12-31',
      date_limite_liasse: '04-30', date_limite_is: '04-30', date_limite_tva: '20',
      periodicite_tva: 'mensuelle',
    },
    dgi: {
      nom: 'Direction Générale des Impôts',
      sigle: 'DGI-GA',
      url: 'https://www.dgi.gouv.ga',
      format_contribuable: '^\\d{10}$',
    },
    comptabilite: { plan_comptable: 'SYSCOHADA_REVISE' },
  },

  CG: {
    code: 'CG',
    nom: 'Congo',
    nomComplet: 'République du Congo',
    devise: 'XAF',
    symboleDevise: 'FCFA',
    zoneFrancCFA: true,
    unionMonetaire: 'CEMAC',
    fuseau: 'Africa/Brazzaville',
    langueOfficielle: 'fr',
    fiscalite: {
      IS: { taux_normal: 0.30 },
      TVA: { taux_normal: 0.18, taux_reduit: 0.05 },
      IMF: { taux: 0.01, minimum: 500_000, maximum: 10_000_000 },
      retenue_source: { taux_prestation: 0.05, taux_loyer: 0.15, taux_dividende: 0.15 },
    },
    calendrier: {
      exercice_debut: '01-01', exercice_fin: '12-31',
      date_limite_liasse: '04-30', date_limite_is: '04-30', date_limite_tva: '20',
      periodicite_tva: 'mensuelle',
    },
    dgi: {
      nom: 'Direction Générale des Impôts et des Domaines',
      sigle: 'DGID-CG',
      format_contribuable: '^\\d{10}$',
    },
    comptabilite: { plan_comptable: 'SYSCOHADA_REVISE' },
  },

  TD: {
    code: 'TD',
    nom: 'Tchad',
    nomComplet: 'République du Tchad',
    devise: 'XAF',
    symboleDevise: 'FCFA',
    zoneFrancCFA: true,
    unionMonetaire: 'CEMAC',
    fuseau: 'Africa/Ndjamena',
    langueOfficielle: 'fr',
    fiscalite: {
      IS: { taux_normal: 0.35 },
      TVA: { taux_normal: 0.18 },
      IMF: { taux: 0.015, minimum: 500_000, maximum: 10_000_000 },
      retenue_source: { taux_prestation: 0.075, taux_loyer: 0.15, taux_dividende: 0.15 },
    },
    calendrier: {
      exercice_debut: '01-01', exercice_fin: '12-31',
      date_limite_liasse: '03-31', date_limite_is: '03-31', date_limite_tva: '15',
      periodicite_tva: 'mensuelle',
    },
    dgi: {
      nom: 'Direction Générale des Impôts',
      sigle: 'DGI-TD',
      format_contribuable: '^\\d{8}$',
    },
    comptabilite: { plan_comptable: 'SYSCOHADA_REVISE' },
  },

  CF: {
    code: 'CF',
    nom: 'Centrafrique',
    nomComplet: 'République Centrafricaine',
    devise: 'XAF',
    symboleDevise: 'FCFA',
    zoneFrancCFA: true,
    unionMonetaire: 'CEMAC',
    fuseau: 'Africa/Bangui',
    langueOfficielle: 'fr',
    fiscalite: {
      IS: { taux_normal: 0.30 },
      TVA: { taux_normal: 0.19 },
      IMF: { taux: 0.01, minimum: 500_000, maximum: 5_000_000 },
      retenue_source: { taux_prestation: 0.05, taux_loyer: 0.15, taux_dividende: 0.15 },
    },
    calendrier: {
      exercice_debut: '01-01', exercice_fin: '12-31',
      date_limite_liasse: '04-30', date_limite_is: '04-30', date_limite_tva: '20',
      periodicite_tva: 'mensuelle',
    },
    dgi: {
      nom: 'Direction Générale des Impôts et des Domaines',
      sigle: 'DGID-CF',
      format_contribuable: '^\\d{8}$',
    },
    comptabilite: { plan_comptable: 'SYSCOHADA_REVISE' },
  },

  GQ: {
    code: 'GQ',
    nom: 'Guinée Équatoriale',
    nomComplet: 'République de Guinée Équatoriale',
    devise: 'XAF',
    symboleDevise: 'FCFA',
    zoneFrancCFA: true,
    unionMonetaire: 'CEMAC',
    fuseau: 'Africa/Malabo',
    langueOfficielle: 'es',
    fiscalite: {
      IS: { taux_normal: 0.35 },
      TVA: { taux_normal: 0.15 },
      IMF: { taux: 0.01, minimum: 1_000_000, maximum: 10_000_000 },
      retenue_source: { taux_prestation: 0.065, taux_loyer: 0.10, taux_dividende: 0.25 },
    },
    calendrier: {
      exercice_debut: '01-01', exercice_fin: '12-31',
      date_limite_liasse: '04-30', date_limite_is: '04-30', date_limite_tva: '20',
      periodicite_tva: 'trimestrielle',
    },
    dgi: {
      nom: 'Ministerio de Hacienda y Presupuestos',
      sigle: 'MHP-GQ',
      format_contribuable: '^\\d{10}$',
    },
    comptabilite: { plan_comptable: 'SYSCOHADA_REVISE' },
  },

  // ── AUTRES (3 pays — devises locales) ──

  KM: {
    code: 'KM',
    nom: 'Comores',
    nomComplet: 'Union des Comores',
    devise: 'KMF',
    symboleDevise: 'FC',
    zoneFrancCFA: false,
    unionMonetaire: 'AUCUNE',
    fuseau: 'Indian/Comoro',
    langueOfficielle: 'fr',
    fiscalite: {
      IS: { taux_normal: 0.35 },
      TVA: { taux_normal: 0.10 },
      IMF: { taux: 0.015, minimum: 200_000, maximum: 5_000_000 },
      retenue_source: { taux_prestation: 0.05, taux_loyer: 0.10, taux_dividende: 0.10 },
    },
    calendrier: {
      exercice_debut: '01-01', exercice_fin: '12-31',
      date_limite_liasse: '04-30', date_limite_is: '04-30', date_limite_tva: '15',
      periodicite_tva: 'trimestrielle',
    },
    dgi: {
      nom: "Direction Générale des Impôts",
      sigle: 'DGI-KM',
      format_contribuable: '^\\d{8}$',
    },
    comptabilite: { plan_comptable: 'SYSCOHADA_REVISE' },
  },

  CD: {
    code: 'CD',
    nom: 'RD Congo',
    nomComplet: 'République Démocratique du Congo',
    devise: 'CDF',
    symboleDevise: 'FC',
    zoneFrancCFA: false,
    unionMonetaire: 'AUCUNE',
    fuseau: 'Africa/Kinshasa',
    langueOfficielle: 'fr',
    fiscalite: {
      IS: { taux_normal: 0.30 },
      TVA: { taux_normal: 0.16 },
      IMF: { taux: 0.01, minimum: 2_500_000, maximum: 30_000_000 },
      retenue_source: { taux_prestation: 0.14, taux_loyer: 0.20, taux_dividende: 0.20 },
    },
    calendrier: {
      exercice_debut: '01-01', exercice_fin: '12-31',
      date_limite_liasse: '04-30', date_limite_is: '04-30', date_limite_tva: '15',
      periodicite_tva: 'mensuelle',
    },
    dgi: {
      nom: 'Direction Générale des Impôts',
      sigle: 'DGI-CD',
      url: 'https://www.dgi.gouv.cd',
      format_contribuable: '^\\d{10}$',
    },
    comptabilite: { plan_comptable: 'SYSCOHADA_REVISE' },
  },

  GN: {
    code: 'GN',
    nom: 'Guinée',
    nomComplet: 'République de Guinée',
    devise: 'GNF',
    symboleDevise: 'FG',
    zoneFrancCFA: false,
    unionMonetaire: 'AUCUNE',
    fuseau: 'Africa/Conakry',
    langueOfficielle: 'fr',
    fiscalite: {
      IS: { taux_normal: 0.35 },
      TVA: { taux_normal: 0.18 },
      IMF: { taux: 0.03, minimum: 15_000_000, maximum: 500_000_000 },
      retenue_source: { taux_prestation: 0.10, taux_loyer: 0.15, taux_dividende: 0.10 },
    },
    calendrier: {
      exercice_debut: '01-01', exercice_fin: '12-31',
      date_limite_liasse: '04-30', date_limite_is: '04-30', date_limite_tva: '15',
      periodicite_tva: 'mensuelle',
    },
    dgi: {
      nom: 'Direction Nationale des Impôts',
      sigle: 'DNI-GN',
      format_contribuable: '^\\d{9}$',
    },
    comptabilite: { plan_comptable: 'SYSCOHADA_REVISE' },
  },
}

// ============================================================
// Helpers
// ============================================================

/** All country codes */
export const CODES_PAYS_OHADA = Object.keys(PAYS_OHADA)

/** Get country config by code (default: CI) */
export function getPaysConfig(code: string): PaysOHADA {
  return PAYS_OHADA[code] ?? PAYS_OHADA.CI
}

/** Get IS rate for a country */
export function getTauxIS(code: string): number {
  return getPaysConfig(code).fiscalite.IS.taux_normal
}

/** Get TVA rate for a country */
export function getTauxTVA(code: string): number {
  return getPaysConfig(code).fiscalite.TVA.taux_normal
}

/** Get IMF config for a country */
export function getIMFConfig(code: string) {
  return getPaysConfig(code).fiscalite.IMF
}

/** Calculate IMF for a country */
export function calculerIMF(code: string, chiffreAffaires: number): number {
  const imf = getIMFConfig(code)
  const montant = chiffreAffaires * imf.taux
  return Math.min(Math.max(montant, imf.minimum), imf.maximum)
}

/** Get fiscal deadline dates for a given year */
export function getDateLimiteLiasse(code: string, annee: number): Date {
  const config = getPaysConfig(code)
  const [month, day] = config.calendrier.date_limite_liasse.split('-').map(Number)
  return new Date(annee + 1, month - 1, day) // Year+1 because deadline is after year-end
}

/** Group countries by monetary union */
export function getPaysByUnion(): Record<string, PaysOHADA[]> {
  return {
    UEMOA: Object.values(PAYS_OHADA).filter(p => p.unionMonetaire === 'UEMOA'),
    CEMAC: Object.values(PAYS_OHADA).filter(p => p.unionMonetaire === 'CEMAC'),
    AUCUNE: Object.values(PAYS_OHADA).filter(p => p.unionMonetaire === 'AUCUNE'),
  }
}

/** Country select options for dropdowns */
export function getPaysOptions(): Array<{ value: string; label: string; group: string }> {
  return Object.values(PAYS_OHADA).map(p => ({
    value: p.code,
    label: `${p.nom} (${p.devise})`,
    group: p.unionMonetaire,
  }))
}
