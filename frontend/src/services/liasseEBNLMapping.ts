/**
 * Mapping EBNL/ASBL - SYCEBNL (Systeme Comptable des EBNL, effectif 2024)
 * Entites a But Non Lucratif / Associations Sans But Lucratif
 * Base SYSCOHADA avec adaptations specifiques :
 * - Fonds associatifs (au lieu de Capital)
 * - Subventions recues, Contributions, Cotisations
 * - Classes 1-8 identiques SYSCOHADA avec terminologie adaptee
 * Deux sous-systemes : SN-EBNL et SMT-EBNL
 */

import type { MappingEntry } from './liasseSMTMapping'

export const EBNL_MAPPING = {
  // BILAN ACTIF EBNL (meme structure que SYSCOHADA avec adaptations)
  actif: {
    // Immobilisations incorporelles
    EA_1: { comptes: ['21'], amortComptes: ['281', '291'] } as MappingEntry, // Logiciels, brevets
    EA_2: { comptes: ['22'], amortComptes: ['282', '292'] } as MappingEntry, // Terrains
    EA_3: { comptes: ['23'], amortComptes: ['283', '293'] } as MappingEntry, // Batiments
    EA_4: { comptes: ['24'], amortComptes: ['284', '294'] } as MappingEntry, // Materiel et equipements
    EA_5: { comptes: ['25'], amortComptes: [] } as MappingEntry, // Avances et acomptes
    EA_6: { comptes: ['26', '27'], amortComptes: ['296', '297'] } as MappingEntry, // Immobilisations financieres

    // Actif circulant
    EA_7: { comptes: ['31', '32', '33', '34', '35', '36', '37', '38'], amortComptes: ['39'] } as MappingEntry, // Stocks
    EA_8: { comptes: ['41'], amortComptes: ['491'] } as MappingEntry, // Creances (donateurs, bailleurs, adherents)
    EA_9: { comptes: ['42', '43', '44', '45', '46', '47', '48'], amortComptes: ['492', '493', '494', '495', '496', '497'] } as MappingEntry, // Autres creances

    // Tresorerie
    EA_10: { comptes: ['50', '51', '52', '53', '54', '55', '56', '57', '58'], amortComptes: ['590', '591', '592', '593', '594'] } as MappingEntry, // Tresorerie actif
  },

  // BILAN PASSIF EBNL
  passif: {
    // Fonds associatifs (equivalent capitaux propres)
    EP_1: { comptes: ['101', '102', '103'] } as MappingEntry, // Fonds associatifs sans droit de reprise
    EP_2: { comptes: ['104', '105'] } as MappingEntry, // Fonds associatifs avec droit de reprise
    EP_3: { comptes: ['106'] } as MappingEntry, // Ecarts de reevaluation
    EP_4: { comptes: ['11'] } as MappingEntry, // Reserves (reserves statutaires, autres)
    EP_5: { comptes: ['12'] } as MappingEntry, // Report a nouveau
    EP_6: { comptes: ['13'] } as MappingEntry, // Resultat de l'exercice (excedent/deficit)
    EP_7: { comptes: ['14'] } as MappingEntry, // Subventions d'investissement
    EP_8: { comptes: ['15'] } as MappingEntry, // Provisions reglementees et fonds dedies

    // Dettes
    EP_9: { comptes: ['16', '17'] } as MappingEntry, // Emprunts et dettes financieres
    EP_10: { comptes: ['40'] } as MappingEntry, // Fournisseurs
    EP_11: { comptes: ['42', '43', '44'] } as MappingEntry, // Dettes fiscales et sociales
    EP_12: { comptes: ['45', '46', '47', '48'] } as MappingEntry, // Autres dettes
    EP_13: { comptes: ['52'] } as MappingEntry, // Tresorerie passif
  },

  // COMPTE DE RESULTAT EBNL - CHARGES
  charges: {
    EC_1: { comptes: ['60'] } as MappingEntry, // Achats de biens et services
    EC_2: { comptes: ['61'] } as MappingEntry, // Transports
    EC_3: { comptes: ['62', '63'] } as MappingEntry, // Services exterieurs
    EC_4: { comptes: ['64'] } as MappingEntry, // Impots et taxes
    EC_5: { comptes: ['65'] } as MappingEntry, // Autres charges de gestion
    EC_6: { comptes: ['66'] } as MappingEntry, // Charges de personnel (salaries, benevoles indemnises)
    EC_7: { comptes: ['67'] } as MappingEntry, // Charges financieres
    EC_8: { comptes: ['68', '69'] } as MappingEntry, // Dotations amortissements et provisions
    EC_9: { comptes: ['81', '83', '85'] } as MappingEntry, // Charges HAO
    EC_10: { comptes: ['89'] } as MappingEntry, // Impot sur resultat (si applicable)
  },

  // COMPTE DE RESULTAT EBNL - PRODUITS (specifique EBNL)
  produits: {
    EP_PR_1: { comptes: ['701', '702', '703'] } as MappingEntry, // Cotisations des membres
    EP_PR_2: { comptes: ['704', '705', '706'] } as MappingEntry, // Dons et liberalites
    EP_PR_3: { comptes: ['71'] } as MappingEntry, // Subventions d'exploitation
    EP_PR_4: { comptes: ['72', '73'] } as MappingEntry, // Production de l'entite (services rendus)
    EP_PR_5: { comptes: ['75'] } as MappingEntry, // Autres produits de gestion
    EP_PR_6: { comptes: ['76', '77'] } as MappingEntry, // Produits financiers
    EP_PR_7: { comptes: ['78'] } as MappingEntry, // Transferts de charges
    EP_PR_8: { comptes: ['791', '797', '798'] } as MappingEntry, // Reprises de provisions
    EP_PR_9: { comptes: ['82', '84', '86', '88'] } as MappingEntry, // Produits HAO
  },
}

export const EBNL_LIBELLES = {
  actif: {
    EA_1: 'Immobilisations incorporelles',
    EA_2: 'Terrains',
    EA_3: 'Batiments et constructions',
    EA_4: 'Materiel et equipements',
    EA_5: 'Avances et acomptes',
    EA_6: 'Immobilisations financieres',
    EA_7: 'Stocks',
    EA_8: 'Creances (donateurs, bailleurs, adherents)',
    EA_9: 'Autres creances',
    EA_10: 'Tresorerie actif',
  },
  passif: {
    EP_1: 'Fonds associatifs sans droit de reprise',
    EP_2: 'Fonds associatifs avec droit de reprise',
    EP_3: 'Ecarts de reevaluation',
    EP_4: 'Reserves',
    EP_5: 'Report a nouveau',
    EP_6: 'Resultat de l\'exercice (excedent/deficit)',
    EP_7: 'Subventions d\'investissement',
    EP_8: 'Provisions reglementees et fonds dedies',
    EP_9: 'Emprunts et dettes financieres',
    EP_10: 'Fournisseurs',
    EP_11: 'Dettes fiscales et sociales',
    EP_12: 'Autres dettes',
    EP_13: 'Tresorerie passif',
  },
  charges: {
    EC_1: 'Achats de biens et services',
    EC_2: 'Transports',
    EC_3: 'Services exterieurs',
    EC_4: 'Impots et taxes',
    EC_5: 'Autres charges de gestion',
    EC_6: 'Charges de personnel',
    EC_7: 'Charges financieres',
    EC_8: 'Dotations amortissements et provisions',
    EC_9: 'Charges HAO',
    EC_10: 'Impot sur resultat',
  },
  produits: {
    EP_PR_1: 'Cotisations des membres',
    EP_PR_2: 'Dons et liberalites',
    EP_PR_3: 'Subventions d\'exploitation',
    EP_PR_4: 'Production (services rendus)',
    EP_PR_5: 'Autres produits de gestion',
    EP_PR_6: 'Produits financiers',
    EP_PR_7: 'Transferts de charges',
    EP_PR_8: 'Reprises de provisions',
    EP_PR_9: 'Produits HAO',
  },
}
