/**
 * Mapping BANQUE - Plan PCEC (COBAC) / PCB (BCEAO)
 * Structure des classes bancaires differente du SYSCOHADA standard
 * Classe 1: Operations de tresorerie et interbancaires
 * Classe 2: Operations avec la clientele
 * Classe 3: Operations sur titres et diverses
 * Classe 4: Valeurs immobilisees
 * Classe 5: Capitaux permanents
 * Classe 6: Charges
 * Classe 7: Produits
 */

import type { MappingEntry } from './liasseSMTMapping'

export const BANQUE_MAPPING = {
  // BILAN ACTIF BANCAIRE
  actif: {
    // Classe 1 - Tresorerie et interbancaires
    BA_1: { comptes: ['10'], amortComptes: [] } as MappingEntry, // Caisse et banques centrales
    BA_2: { comptes: ['11', '12'], amortComptes: [] } as MappingEntry, // Effets publics et assimiles
    BA_3: { comptes: ['13', '14', '15'], amortComptes: [] } as MappingEntry, // Creances sur etablissements de credit
    BA_4: { comptes: ['16', '17', '18', '19'], amortComptes: [] } as MappingEntry, // Prets et avances interbancaires

    // Classe 2 - Operations clientele
    BA_5: { comptes: ['20', '21', '22'], amortComptes: ['29'] } as MappingEntry, // Credits a la clientele
    BA_6: { comptes: ['23', '24'], amortComptes: [] } as MappingEntry, // Comptes ordinaires debiteurs
    BA_7: { comptes: ['25', '26'], amortComptes: [] } as MappingEntry, // Affacturage et operations de credit-bail
    BA_8: { comptes: ['27', '28'], amortComptes: [] } as MappingEntry, // Creances impayees et douteuses

    // Classe 3 - Operations sur titres
    BA_9: { comptes: ['30', '31', '32'], amortComptes: [] } as MappingEntry, // Titres de transaction
    BA_10: { comptes: ['33', '34'], amortComptes: [] } as MappingEntry, // Titres de placement
    BA_11: { comptes: ['35', '36'], amortComptes: [] } as MappingEntry, // Titres d'investissement
    BA_12: { comptes: ['37', '38', '39'], amortComptes: [] } as MappingEntry, // Operations diverses sur titres

    // Classe 4 - Valeurs immobilisees
    BA_13: { comptes: ['40', '41'], amortComptes: ['48'] } as MappingEntry, // Immobilisations incorporelles
    BA_14: { comptes: ['42', '43', '44'], amortComptes: ['48'] } as MappingEntry, // Immobilisations corporelles
    BA_15: { comptes: ['45', '46'], amortComptes: [] } as MappingEntry, // Immobilisations financieres
    BA_16: { comptes: ['47'], amortComptes: [] } as MappingEntry, // Actionnaires ou associes
  },

  // BILAN PASSIF BANCAIRE
  passif: {
    // Classe 1 - Tresorerie passif
    BP_1: { comptes: ['10'] } as MappingEntry, // Banques centrales (crediteur)
    BP_2: { comptes: ['13', '14', '15'] } as MappingEntry, // Dettes envers etablissements de credit
    BP_3: { comptes: ['16', '17'] } as MappingEntry, // Emprunts interbancaires

    // Classe 2 - Depots clientele
    BP_4: { comptes: ['20', '21'] } as MappingEntry, // Comptes d'epargne
    BP_5: { comptes: ['22', '23', '24'] } as MappingEntry, // Depots a vue
    BP_6: { comptes: ['25', '26'] } as MappingEntry, // Depots a terme
    BP_7: { comptes: ['27', '28'] } as MappingEntry, // Autres depots et comptes crediteurs

    // Classe 3 - Titres emis
    BP_8: { comptes: ['30', '31'] } as MappingEntry, // Titres de creances negociables emis
    BP_9: { comptes: ['32', '33'] } as MappingEntry, // Obligations emises
    BP_10: { comptes: ['37', '38', '39'] } as MappingEntry, // Autres dettes sur titres

    // Classe 5 - Capitaux permanents
    BP_11: { comptes: ['50', '51'] } as MappingEntry, // Capital
    BP_12: { comptes: ['52', '53'] } as MappingEntry, // Reserves et primes
    BP_13: { comptes: ['54'] } as MappingEntry, // Report a nouveau
    BP_14: { comptes: ['55'] } as MappingEntry, // Resultat de l'exercice
    BP_15: { comptes: ['56', '57'] } as MappingEntry, // Provisions pour risques
    BP_16: { comptes: ['58', '59'] } as MappingEntry, // Fonds pour risques bancaires generaux
  },

  // COMPTE D'EXPLOITATION BANCAIRE - CHARGES
  charges: {
    CB_1: { comptes: ['60'] } as MappingEntry, // Charges sur operations de tresorerie
    CB_2: { comptes: ['61'] } as MappingEntry, // Charges sur operations avec clientele
    CB_3: { comptes: ['62'] } as MappingEntry, // Charges sur operations sur titres
    CB_4: { comptes: ['63'] } as MappingEntry, // Charges sur operations de change
    CB_5: { comptes: ['64'] } as MappingEntry, // Charges sur operations de hors-bilan
    CB_6: { comptes: ['65'] } as MappingEntry, // Charges sur prestations de services financiers
    CB_7: { comptes: ['66'] } as MappingEntry, // Charges generales d'exploitation
    CB_8: { comptes: ['67'] } as MappingEntry, // Frais de personnel
    CB_9: { comptes: ['68'] } as MappingEntry, // Dotations amortissements et provisions
    CB_10: { comptes: ['69'] } as MappingEntry, // Charges exceptionnelles et impot
  },

  // COMPTE D'EXPLOITATION BANCAIRE - PRODUITS
  produits: {
    PB_1: { comptes: ['70'] } as MappingEntry, // Produits sur operations de tresorerie
    PB_2: { comptes: ['71'] } as MappingEntry, // Produits sur operations avec clientele
    PB_3: { comptes: ['72'] } as MappingEntry, // Produits sur operations sur titres
    PB_4: { comptes: ['73'] } as MappingEntry, // Produits sur operations de change
    PB_5: { comptes: ['74'] } as MappingEntry, // Produits sur operations de hors-bilan
    PB_6: { comptes: ['75'] } as MappingEntry, // Produits sur prestations de services financiers
    PB_7: { comptes: ['76'] } as MappingEntry, // Autres produits d'exploitation bancaire
    PB_8: { comptes: ['77'] } as MappingEntry, // Produits accessoires
    PB_9: { comptes: ['78'] } as MappingEntry, // Reprises de provisions
    PB_10: { comptes: ['79'] } as MappingEntry, // Produits exceptionnels
  },

  // HORS-BILAN
  horsBilan: {
    HB_1: { comptes: ['90'] } as MappingEntry, // Engagements de financement donnes
    HB_2: { comptes: ['91'] } as MappingEntry, // Engagements de financement recus
    HB_3: { comptes: ['92'] } as MappingEntry, // Engagements de garantie donnes
    HB_4: { comptes: ['93'] } as MappingEntry, // Engagements de garantie recus
    HB_5: { comptes: ['94', '95'] } as MappingEntry, // Engagements sur titres
    HB_6: { comptes: ['96', '97'] } as MappingEntry, // Operations en devises
    HB_7: { comptes: ['98', '99'] } as MappingEntry, // Autres engagements
  },
}

export const BANQUE_LIBELLES = {
  actif: {
    BA_1: 'Caisse et banques centrales',
    BA_2: 'Effets publics et assimiles',
    BA_3: 'Creances sur etablissements de credit',
    BA_4: 'Prets et avances interbancaires',
    BA_5: 'Credits a la clientele',
    BA_6: 'Comptes ordinaires debiteurs',
    BA_7: 'Affacturage et credit-bail',
    BA_8: 'Creances impayees et douteuses',
    BA_9: 'Titres de transaction',
    BA_10: 'Titres de placement',
    BA_11: 'Titres d\'investissement',
    BA_12: 'Operations diverses sur titres',
    BA_13: 'Immobilisations incorporelles',
    BA_14: 'Immobilisations corporelles',
    BA_15: 'Immobilisations financieres',
    BA_16: 'Actionnaires ou associes',
  },
  passif: {
    BP_1: 'Banques centrales (crediteur)',
    BP_2: 'Dettes envers etablissements de credit',
    BP_3: 'Emprunts interbancaires',
    BP_4: 'Comptes d\'epargne',
    BP_5: 'Depots a vue',
    BP_6: 'Depots a terme',
    BP_7: 'Autres depots et comptes crediteurs',
    BP_8: 'Titres de creances negociables emis',
    BP_9: 'Obligations emises',
    BP_10: 'Autres dettes sur titres',
    BP_11: 'Capital',
    BP_12: 'Reserves et primes',
    BP_13: 'Report a nouveau',
    BP_14: 'Resultat de l\'exercice',
    BP_15: 'Provisions pour risques',
    BP_16: 'Fonds pour risques bancaires generaux',
  },
  charges: {
    CB_1: 'Charges sur operations de tresorerie',
    CB_2: 'Charges sur operations avec clientele',
    CB_3: 'Charges sur operations sur titres',
    CB_4: 'Charges sur operations de change',
    CB_5: 'Charges sur operations de hors-bilan',
    CB_6: 'Charges sur prestations financieres',
    CB_7: 'Charges generales d\'exploitation',
    CB_8: 'Frais de personnel',
    CB_9: 'Dotations amortissements et provisions',
    CB_10: 'Charges exceptionnelles et impot',
  },
  produits: {
    PB_1: 'Produits sur operations de tresorerie',
    PB_2: 'Produits sur operations avec clientele',
    PB_3: 'Produits sur operations sur titres',
    PB_4: 'Produits sur operations de change',
    PB_5: 'Produits sur operations de hors-bilan',
    PB_6: 'Produits sur prestations financieres',
    PB_7: 'Autres produits d\'exploitation bancaire',
    PB_8: 'Produits accessoires',
    PB_9: 'Reprises de provisions',
    PB_10: 'Produits exceptionnels',
  },
}
