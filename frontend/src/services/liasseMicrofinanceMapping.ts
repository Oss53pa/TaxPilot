/**
 * Mapping MICROFINANCE - Plan SFD (Systemes Financiers Decentralises)
 * Referentiel BCEAO/COBAC pour les institutions de microfinance
 * Classe 1: Operations de tresorerie
 * Classe 2: Operations avec les membres/clients
 * Classe 3: Autres operations
 * Classe 4: Immobilisations
 * Classe 5: Provisions, fonds propres
 * Classe 6/7: Charges/Produits
 */

import type { MappingEntry } from './liasseSMTMapping'

export const MICROFINANCE_MAPPING = {
  // BILAN ACTIF SFD
  actif: {
    // Classe 1 - Operations de tresorerie
    MA_1: { comptes: ['10', '11'], amortComptes: [] } as MappingEntry, // Caisse
    MA_2: { comptes: ['12', '13'], amortComptes: [] } as MappingEntry, // Banques et correspondants
    MA_3: { comptes: ['14', '15'], amortComptes: [] } as MappingEntry, // Placements de tresorerie
    MA_4: { comptes: ['16', '17', '18', '19'], amortComptes: [] } as MappingEntry, // Prets interbancaires

    // Classe 2 - Operations avec membres/clients
    MA_5: { comptes: ['20', '21', '22'], amortComptes: ['29'] } as MappingEntry, // Credits aux membres/clients
    MA_6: { comptes: ['23', '24'], amortComptes: [] } as MappingEntry, // Credits a court terme
    MA_7: { comptes: ['25', '26'], amortComptes: [] } as MappingEntry, // Credits a moyen et long terme
    MA_8: { comptes: ['27', '28'], amortComptes: [] } as MappingEntry, // Creances en souffrance

    // Classe 3 - Autres operations
    MA_9: { comptes: ['30', '31', '32'], amortComptes: [] } as MappingEntry, // Titres de placement
    MA_10: { comptes: ['33', '34', '35'], amortComptes: [] } as MappingEntry, // Debiteurs divers
    MA_11: { comptes: ['36', '37'], amortComptes: [] } as MappingEntry, // Comptes de regularisation

    // Classe 4 - Immobilisations
    MA_12: { comptes: ['40', '41'], amortComptes: ['48'] } as MappingEntry, // Immobilisations incorporelles
    MA_13: { comptes: ['42', '43', '44'], amortComptes: ['48'] } as MappingEntry, // Immobilisations corporelles
    MA_14: { comptes: ['45', '46'], amortComptes: [] } as MappingEntry, // Immobilisations financieres
    MA_15: { comptes: ['47'], amortComptes: [] } as MappingEntry, // Immobilisations en cours
  },

  // BILAN PASSIF SFD
  passif: {
    // Classe 1 - Tresorerie passif
    MP_1: { comptes: ['10', '11'] } as MappingEntry, // Emprunts bancaires
    MP_2: { comptes: ['12', '13'] } as MappingEntry, // Refinancements

    // Classe 2 - Depots des membres/clients
    MP_3: { comptes: ['20', '21'] } as MappingEntry, // Depots a vue
    MP_4: { comptes: ['22', '23'] } as MappingEntry, // Depots a terme
    MP_5: { comptes: ['24', '25'] } as MappingEntry, // Epargne obligatoire
    MP_6: { comptes: ['26', '27'] } as MappingEntry, // Autres depots

    // Classe 3 - Autres operations
    MP_7: { comptes: ['30', '31'] } as MappingEntry, // Crediteurs divers
    MP_8: { comptes: ['36', '37'] } as MappingEntry, // Comptes de regularisation

    // Classe 5 - Capitaux permanents
    MP_9: { comptes: ['50', '51'] } as MappingEntry, // Capital / Dotations / Parts sociales
    MP_10: { comptes: ['52', '53'] } as MappingEntry, // Reserves
    MP_11: { comptes: ['54'] } as MappingEntry, // Report a nouveau
    MP_12: { comptes: ['55'] } as MappingEntry, // Resultat de l'exercice
    MP_13: { comptes: ['56', '57'] } as MappingEntry, // Provisions pour risques et charges
    MP_14: { comptes: ['58', '59'] } as MappingEntry, // Subventions et fonds affectes
  },

  // COMPTE DE RESULTAT SFD - CHARGES
  charges: {
    MC_1: { comptes: ['60'] } as MappingEntry, // Charges sur operations de tresorerie
    MC_2: { comptes: ['61'] } as MappingEntry, // Charges sur operations avec membres/clients
    MC_3: { comptes: ['62'] } as MappingEntry, // Charges sur ressources empruntees
    MC_4: { comptes: ['63'] } as MappingEntry, // Charges sur operations de change
    MC_5: { comptes: ['64'] } as MappingEntry, // Services exterieurs
    MC_6: { comptes: ['65'] } as MappingEntry, // Impots et taxes
    MC_7: { comptes: ['66'] } as MappingEntry, // Charges de personnel
    MC_8: { comptes: ['67'] } as MappingEntry, // Autres charges d'exploitation
    MC_9: { comptes: ['68'] } as MappingEntry, // Dotations amortissements et provisions
    MC_10: { comptes: ['69'] } as MappingEntry, // Charges exceptionnelles et impot
  },

  // COMPTE DE RESULTAT SFD - PRODUITS
  produits: {
    MPR_1: { comptes: ['70'] } as MappingEntry, // Produits sur operations de tresorerie
    MPR_2: { comptes: ['71'] } as MappingEntry, // Interets sur credits aux membres/clients
    MPR_3: { comptes: ['72'] } as MappingEntry, // Produits sur operations de change
    MPR_4: { comptes: ['73'] } as MappingEntry, // Commissions
    MPR_5: { comptes: ['74'] } as MappingEntry, // Cotisations
    MPR_6: { comptes: ['75'] } as MappingEntry, // Subventions d'exploitation
    MPR_7: { comptes: ['76'] } as MappingEntry, // Autres produits d'exploitation
    MPR_8: { comptes: ['78'] } as MappingEntry, // Reprises de provisions
    MPR_9: { comptes: ['79'] } as MappingEntry, // Produits exceptionnels
  },

  // HORS-BILAN SFD
  horsBilan: {
    MHB_1: { comptes: ['90'] } as MappingEntry, // Engagements de financement donnes
    MHB_2: { comptes: ['91'] } as MappingEntry, // Engagements de financement recus
    MHB_3: { comptes: ['92'] } as MappingEntry, // Garanties recues des membres
    MHB_4: { comptes: ['93'] } as MappingEntry, // Garanties donnees
    MHB_5: { comptes: ['94', '95'] } as MappingEntry, // Engagements sur operations de change
  },
}

export const MICROFINANCE_LIBELLES = {
  actif: {
    MA_1: 'Caisse',
    MA_2: 'Banques et correspondants',
    MA_3: 'Placements de tresorerie',
    MA_4: 'Prets interbancaires',
    MA_5: 'Credits aux membres/clients',
    MA_6: 'Credits a court terme',
    MA_7: 'Credits a moyen et long terme',
    MA_8: 'Creances en souffrance',
    MA_9: 'Titres de placement',
    MA_10: 'Debiteurs divers',
    MA_11: 'Comptes de regularisation',
    MA_12: 'Immobilisations incorporelles',
    MA_13: 'Immobilisations corporelles',
    MA_14: 'Immobilisations financieres',
    MA_15: 'Immobilisations en cours',
  },
  passif: {
    MP_1: 'Emprunts bancaires',
    MP_2: 'Refinancements',
    MP_3: 'Depots a vue',
    MP_4: 'Depots a terme',
    MP_5: 'Epargne obligatoire',
    MP_6: 'Autres depots',
    MP_7: 'Crediteurs divers',
    MP_8: 'Comptes de regularisation',
    MP_9: 'Capital / Dotations / Parts sociales',
    MP_10: 'Reserves',
    MP_11: 'Report a nouveau',
    MP_12: 'Resultat de l\'exercice',
    MP_13: 'Provisions pour risques et charges',
    MP_14: 'Subventions et fonds affectes',
  },
  charges: {
    MC_1: 'Charges sur operations de tresorerie',
    MC_2: 'Charges sur operations avec membres',
    MC_3: 'Charges sur ressources empruntees',
    MC_4: 'Charges sur operations de change',
    MC_5: 'Services exterieurs',
    MC_6: 'Impots et taxes',
    MC_7: 'Charges de personnel',
    MC_8: 'Autres charges d\'exploitation',
    MC_9: 'Dotations amortissements et provisions',
    MC_10: 'Charges exceptionnelles et impot',
  },
  produits: {
    MPR_1: 'Produits sur operations de tresorerie',
    MPR_2: 'Interets sur credits aux membres',
    MPR_3: 'Produits sur operations de change',
    MPR_4: 'Commissions',
    MPR_5: 'Cotisations',
    MPR_6: 'Subventions d\'exploitation',
    MPR_7: 'Autres produits d\'exploitation',
    MPR_8: 'Reprises de provisions',
    MPR_9: 'Produits exceptionnels',
  },
}
