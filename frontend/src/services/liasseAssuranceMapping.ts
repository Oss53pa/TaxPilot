/**
 * Mapping ASSURANCE - Plan CIMA (Conference Interafricaine des Marches d'Assurances)
 * Structure specifique pour les compagnies d'assurance
 * Etats modeles CIMA : C1, C9, C10a, C10b
 */

import type { MappingEntry } from './liasseSMTMapping'

export const ASSURANCE_MAPPING = {
  // BILAN ACTIF ASSURANCE
  actif: {
    // Placements
    AA_1: { comptes: ['21', '22'], amortComptes: ['281', '282'] } as MappingEntry, // Immeubles
    AA_2: { comptes: ['23', '24'], amortComptes: ['283', '284'] } as MappingEntry, // Actions et parts sociales
    AA_3: { comptes: ['25'], amortComptes: [] } as MappingEntry, // Obligations et bons
    AA_4: { comptes: ['26', '27'], amortComptes: [] } as MappingEntry, // Prets et effets assimiles
    AA_5: { comptes: ['28'], amortComptes: [] } as MappingEntry, // Depots en banque et CCP
    AA_6: { comptes: ['29'], amortComptes: [] } as MappingEntry, // Autres placements

    // Part des reassureurs dans les provisions techniques
    AA_7: { comptes: ['30', '31'], amortComptes: [] } as MappingEntry, // Part reassureurs - provisions pour primes non acquises
    AA_8: { comptes: ['32', '33'], amortComptes: [] } as MappingEntry, // Part reassureurs - provisions sinistres
    AA_9: { comptes: ['34'], amortComptes: [] } as MappingEntry, // Part reassureurs - provisions mathematiques
    AA_10: { comptes: ['35', '36'], amortComptes: [] } as MappingEntry, // Part reassureurs - autres provisions

    // Creances
    AA_11: { comptes: ['40', '41'], amortComptes: ['49'] } as MappingEntry, // Creances nees d'operations d'assurance
    AA_12: { comptes: ['42', '43'], amortComptes: [] } as MappingEntry, // Creances nees d'operations de reassurance
    AA_13: { comptes: ['44', '45', '46'], amortComptes: [] } as MappingEntry, // Autres creances
    AA_14: { comptes: ['47'], amortComptes: [] } as MappingEntry, // Personnel et comptes rattaches

    // Autres actifs
    AA_15: { comptes: ['48'], amortComptes: [] } as MappingEntry, // Comptes de regularisation actif
    AA_16: { comptes: ['50', '51', '52', '53', '57'], amortComptes: [] } as MappingEntry, // Tresorerie
  },

  // BILAN PASSIF ASSURANCE
  passif: {
    // Capitaux propres
    AP_1: { comptes: ['10'] } as MappingEntry, // Capital ou fonds d'etablissement
    AP_2: { comptes: ['11'] } as MappingEntry, // Reserves
    AP_3: { comptes: ['12'] } as MappingEntry, // Report a nouveau
    AP_4: { comptes: ['13'] } as MappingEntry, // Resultat de l'exercice

    // Provisions techniques
    AP_5: { comptes: ['30', '31'] } as MappingEntry, // Provision pour primes non acquises
    AP_6: { comptes: ['32', '33'] } as MappingEntry, // Provision pour sinistres a payer
    AP_7: { comptes: ['34'] } as MappingEntry, // Provision mathematique (vie)
    AP_8: { comptes: ['35'] } as MappingEntry, // Provision pour participation benefices
    AP_9: { comptes: ['36', '37'] } as MappingEntry, // Provision d'egalisation et autres

    // Dettes
    AP_10: { comptes: ['40', '41'] } as MappingEntry, // Dettes d'operations d'assurance
    AP_11: { comptes: ['42', '43'] } as MappingEntry, // Dettes d'operations de reassurance
    AP_12: { comptes: ['44', '45', '46'] } as MappingEntry, // Autres dettes
    AP_13: { comptes: ['48'] } as MappingEntry, // Comptes de regularisation passif
  },

  // COMPTE TECHNIQUE - CHARGES
  chargesTechniques: {
    CT_1: { comptes: ['60'] } as MappingEntry, // Prestations et frais payes (sinistres)
    CT_2: { comptes: ['61'] } as MappingEntry, // Charges des placements
    CT_3: { comptes: ['62'] } as MappingEntry, // Charges de reassurance cedee
    CT_4: { comptes: ['63'] } as MappingEntry, // Dotations provisions techniques
    CT_5: { comptes: ['64'] } as MappingEntry, // Frais d'acquisition
    CT_6: { comptes: ['65'] } as MappingEntry, // Frais d'administration
    CT_7: { comptes: ['66'] } as MappingEntry, // Autres charges techniques
  },

  // COMPTE TECHNIQUE - PRODUITS
  produitsTechniques: {
    PT_1: { comptes: ['70'] } as MappingEntry, // Primes emises
    PT_2: { comptes: ['71'] } as MappingEntry, // Variation provisions primes non acquises
    PT_3: { comptes: ['72'] } as MappingEntry, // Primes acquises
    PT_4: { comptes: ['73'] } as MappingEntry, // Produits des placements
    PT_5: { comptes: ['74'] } as MappingEntry, // Ajustement ACAV (vie)
    PT_6: { comptes: ['75'] } as MappingEntry, // Produits de reassurance cedee
    PT_7: { comptes: ['76', '77'] } as MappingEntry, // Autres produits techniques
  },

  // COMPTE NON-TECHNIQUE
  chargesNonTechniques: {
    CNT_1: { comptes: ['67'] } as MappingEntry, // Charges non techniques courantes
    CNT_2: { comptes: ['68'] } as MappingEntry, // Dotations amortissements et provisions
    CNT_3: { comptes: ['69'] } as MappingEntry, // Charges exceptionnelles et impot
  },

  produitsNonTechniques: {
    PNT_1: { comptes: ['78'] } as MappingEntry, // Produits non techniques courants
    PNT_2: { comptes: ['79'] } as MappingEntry, // Reprises et produits exceptionnels
  },
}

export const ASSURANCE_LIBELLES = {
  actif: {
    AA_1: 'Immeubles',
    AA_2: 'Actions et parts sociales',
    AA_3: 'Obligations et bons',
    AA_4: 'Prets et effets assimiles',
    AA_5: 'Depots en banque et CCP',
    AA_6: 'Autres placements',
    AA_7: 'Part reassureurs - Primes non acquises',
    AA_8: 'Part reassureurs - Sinistres',
    AA_9: 'Part reassureurs - Provisions mathematiques',
    AA_10: 'Part reassureurs - Autres provisions',
    AA_11: 'Creances d\'operations d\'assurance',
    AA_12: 'Creances d\'operations de reassurance',
    AA_13: 'Autres creances',
    AA_14: 'Personnel et comptes rattaches',
    AA_15: 'Comptes de regularisation actif',
    AA_16: 'Tresorerie',
  },
  passif: {
    AP_1: 'Capital ou fonds d\'etablissement',
    AP_2: 'Reserves',
    AP_3: 'Report a nouveau',
    AP_4: 'Resultat de l\'exercice',
    AP_5: 'Provision pour primes non acquises',
    AP_6: 'Provision pour sinistres a payer',
    AP_7: 'Provision mathematique (vie)',
    AP_8: 'Provision participation benefices',
    AP_9: 'Provision d\'egalisation et autres',
    AP_10: 'Dettes d\'operations d\'assurance',
    AP_11: 'Dettes d\'operations de reassurance',
    AP_12: 'Autres dettes',
    AP_13: 'Comptes de regularisation passif',
  },
  chargesTechniques: {
    CT_1: 'Sinistres payes',
    CT_2: 'Charges des placements',
    CT_3: 'Charges de reassurance cedee',
    CT_4: 'Dotations provisions techniques',
    CT_5: 'Frais d\'acquisition',
    CT_6: 'Frais d\'administration',
    CT_7: 'Autres charges techniques',
  },
  produitsTechniques: {
    PT_1: 'Primes emises',
    PT_2: 'Variation provisions primes',
    PT_3: 'Primes acquises',
    PT_4: 'Produits des placements',
    PT_5: 'Ajustement ACAV (vie)',
    PT_6: 'Produits de reassurance cedee',
    PT_7: 'Autres produits techniques',
  },
}
