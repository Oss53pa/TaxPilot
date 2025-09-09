/**
 * Plan Comptable SYSCOHADA Révisé - Structure Complète 9 Classes
 * Conforme au règlement SYSCOHADA révisé de 2017
 */

export interface CompteComptable {
  numero: string
  libelle: string
  classe: number
  sousClasse?: string
  nature: 'ACTIF' | 'PASSIF' | 'CHARGE' | 'PRODUIT' | 'SPECIAL'
  sens: 'DEBITEUR' | 'CREDITEUR'
  utilisation: 'OBLIGATOIRE' | 'FACULTATIF' | 'INTERDIT'
  secteurs?: string[]
  notes?: string
}

export const SYSCOHADA_REVISE_CLASSES = {
  1: {
    numero: '1',
    libelle: 'COMPTES DE RESSOURCES DURABLES',
    description: 'Capitaux propres et dettes financières à long terme'
  },
  2: {
    numero: '2', 
    libelle: 'COMPTES D\'ACTIF IMMOBILISE',
    description: 'Immobilisations incorporelles, corporelles et financières'
  },
  3: {
    numero: '3',
    libelle: 'COMPTES DE STOCKS',
    description: 'Stocks et en-cours de production'
  },
  4: {
    numero: '4',
    libelle: 'COMPTES DE TIERS',
    description: 'Créances et dettes d\'exploitation et hors exploitation'
  },
  5: {
    numero: '5',
    libelle: 'COMPTES DE TRESORERIE',
    description: 'Disponibilités et équivalents de trésorerie'
  },
  6: {
    numero: '6',
    libelle: 'COMPTES DE CHARGES DES ACTIVITES ORDINAIRES',
    description: 'Charges d\'exploitation, financières et exceptionnelles'
  },
  7: {
    numero: '7',
    libelle: 'COMPTES DE PRODUITS DES ACTIVITES ORDINAIRES', 
    description: 'Produits d\'exploitation, financiers et exceptionnels'
  },
  8: {
    numero: '8',
    libelle: 'COMPTES DES AUTRES CHARGES ET DES AUTRES PRODUITS',
    description: 'HAO (Hors Activités Ordinaires) et participations'
  },
  9: {
    numero: '9',
    libelle: 'COMPTES DE L\'EXERCICE ET COMPTABILITE ANALYTIQUE DE GESTION',
    description: 'Engagements, analytique et comptes spéciaux'
  }
}

export const PLAN_SYSCOHADA_REVISE: CompteComptable[] = [
  // CLASSE 1 - COMPTES DE RESSOURCES DURABLES
  // Capital et réserves
  {
    numero: '10',
    libelle: 'CAPITAL ET RESERVES',
    classe: 1,
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '101',
    libelle: 'Capital social',
    classe: 1,
    sousClasse: '10',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '1011',
    libelle: 'Capital souscrit, non appelé',
    classe: 1,
    sousClasse: '101',
    nature: 'PASSIF', 
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '1012',
    libelle: 'Capital souscrit, appelé, non versé',
    classe: 1,
    sousClasse: '101',
    nature: 'PASSIF',
    sens: 'CREDITEUR', 
    utilisation: 'FACULTATIF'
  },
  {
    numero: '1013',
    libelle: 'Capital souscrit, appelé, versé, non amorti',
    classe: 1,
    sousClasse: '101',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '1018',
    libelle: 'Capital souscrit soumis à des conditions particulières',
    classe: 1,
    sousClasse: '101',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  
  // Primes et réserves
  {
    numero: '104',
    libelle: 'Primes liées au capital social',
    classe: 1,
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '1041',
    libelle: 'Primes d\'émission',
    classe: 1,
    sousClasse: '104',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '1042',
    libelle: 'Primes de fusion',
    classe: 1,
    sousClasse: '104',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '106',
    libelle: 'Réserves',
    classe: 1,
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '1061',
    libelle: 'Réserve légale',
    classe: 1,
    sousClasse: '106',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '1063',
    libelle: 'Réserves statutaires',
    classe: 1,
    sousClasse: '106',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '1068',
    libelle: 'Autres réserves',
    classe: 1,
    sousClasse: '106',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },

  // Report à nouveau et résultat
  {
    numero: '11',
    libelle: 'REPORT A NOUVEAU',
    classe: 1,
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '110',
    libelle: 'Report à nouveau créditeur',
    classe: 1,
    sousClasse: '11',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '119',
    libelle: 'Report à nouveau débiteur',
    classe: 1,
    sousClasse: '11',
    nature: 'PASSIF',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '12',
    libelle: 'RESULTAT NET DE L\'EXERCICE',
    classe: 1,
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '120',
    libelle: 'Résultat net : bénéfice',
    classe: 1,
    sousClasse: '12',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '129',
    libelle: 'Résultat net : perte',
    classe: 1,
    sousClasse: '12',
    nature: 'PASSIF',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },

  // Subventions
  {
    numero: '13',
    libelle: 'SUBVENTIONS D\'INVESTISSEMENT',
    classe: 1,
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '131',
    libelle: 'Subventions d\'équipement',
    classe: 1,
    sousClasse: '13',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '138',
    libelle: 'Autres subventions d\'investissement',
    classe: 1,
    sousClasse: '13',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },

  // Provisions réglementées et fonds assimilés
  {
    numero: '14',
    libelle: 'PROVISIONS REGLEMENTEES ET FONDS ASSIMILES',
    classe: 1,
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },

  // Provisions pour risques et charges
  {
    numero: '15',
    libelle: 'PROVISIONS POUR RISQUES ET CHARGES',
    classe: 1,
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '151',
    libelle: 'Provisions pour risques',
    classe: 1,
    sousClasse: '15',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '155',
    libelle: 'Provisions pour charges',
    classe: 1,
    sousClasse: '15',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },

  // Emprunts et dettes assimilées
  {
    numero: '16',
    libelle: 'EMPRUNTS ET DETTES ASSIMILEES',
    classe: 1,
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '161',
    libelle: 'Emprunts obligataires',
    classe: 1,
    sousClasse: '16',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '162',
    libelle: 'Emprunts et dettes auprès des établissements de crédit',
    classe: 1,
    sousClasse: '16',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '163',
    libelle: 'Avances reçues de l\'État',
    classe: 1,
    sousClasse: '16',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '164',
    libelle: 'Avances reçues et comptes courants bloqués',
    classe: 1,
    sousClasse: '16',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '165',
    libelle: 'Dépôts et cautionnements reçus',
    classe: 1,
    sousClasse: '16',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '167',
    libelle: 'Emprunts et dettes assortis de conditions particulières',
    classe: 1,
    sousClasse: '16',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '168',
    libelle: 'Autres emprunts et dettes assimilées',
    classe: 1,
    sousClasse: '16',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },

  // Dettes de location-acquisition et crédit-bail
  {
    numero: '17',
    libelle: 'DETTES DE LOCATION-ACQUISITION ET CREDIT-BAIL',
    classe: 1,
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },

  // Comptes de liaison des établissements
  {
    numero: '18',
    libelle: 'COMPTES DE LIAISON DES ETABLISSEMENTS',
    classe: 1,
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // CLASSE 2 - COMPTES D'ACTIF IMMOBILISE
  // Charges immobilisées
  {
    numero: '20',
    libelle: 'CHARGES IMMOBILISEES',
    classe: 2,
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '201',
    libelle: 'Frais de développement',
    classe: 2,
    sousClasse: '20',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '205',
    libelle: 'Concessions et droits similaires, brevets, licences',
    classe: 2,
    sousClasse: '20',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '206',
    libelle: 'Droit au bail',
    classe: 2,
    sousClasse: '20',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '207',
    libelle: 'Fonds commercial',
    classe: 2,
    sousClasse: '20',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '208',
    libelle: 'Autres immobilisations incorporelles',
    classe: 2,
    sousClasse: '20',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // Immobilisations corporelles
  {
    numero: '21',
    libelle: 'IMMOBILISATIONS CORPORELLES',
    classe: 2,
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '211',
    libelle: 'Terrains',
    classe: 2,
    sousClasse: '21',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '212',
    libelle: 'Agencements, aménagements et installations',
    classe: 2,
    sousClasse: '21',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '213',
    libelle: 'Constructions',
    classe: 2,
    sousClasse: '21',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '215',
    libelle: 'Installations techniques, matériel et outillage industriels',
    classe: 2,
    sousClasse: '21',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '218',
    libelle: 'Matériel, mobilier et actifs biologiques',
    classe: 2,
    sousClasse: '21',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },

  // Immobilisations en cours
  {
    numero: '22',
    libelle: 'IMMOBILISATIONS EN COURS',
    classe: 2,
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '221',
    libelle: 'Immobilisations corporelles en cours',
    classe: 2,
    sousClasse: '22',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '222',
    libelle: 'Immobilisations incorporelles en cours',
    classe: 2,
    sousClasse: '22',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // Immobilisations financières
  {
    numero: '26',
    libelle: 'IMMOBILISATIONS FINANCIERES',
    classe: 2,
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '261',
    libelle: 'Titres de participation',
    classe: 2,
    sousClasse: '26',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '265',
    libelle: 'Titres de placement',
    classe: 2,
    sousClasse: '26',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '267',
    libelle: 'Créances rattachées à des participations',
    classe: 2,
    sousClasse: '26',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '268',
    libelle: 'Autres créances immobilisées',
    classe: 2,
    sousClasse: '26',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // Amortissements
  {
    numero: '28',
    libelle: 'AMORTISSEMENTS',
    classe: 2,
    nature: 'ACTIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '281',
    libelle: 'Amortissements des immobilisations incorporelles',
    classe: 2,
    sousClasse: '28',
    nature: 'ACTIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '282',
    libelle: 'Amortissements des immobilisations corporelles',
    classe: 2,
    sousClasse: '28',
    nature: 'ACTIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },

  // Provisions pour dépréciation
  {
    numero: '29',
    libelle: 'PROVISIONS POUR DEPRECIATION DES IMMOBILISATIONS',
    classe: 2,
    nature: 'ACTIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },

  // CLASSE 3 - COMPTES DE STOCKS
  {
    numero: '31',
    libelle: 'MARCHANDISES',
    classe: 3,
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE',
    secteurs: ['COMMERCE', 'DISTRIBUTION']
  },
  {
    numero: '311',
    libelle: 'Marchandises A',
    classe: 3,
    sousClasse: '31',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '312',
    libelle: 'Marchandises B',
    classe: 3,
    sousClasse: '31',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // Matières premières et fournitures
  {
    numero: '32',
    libelle: 'MATIERES PREMIERES ET FOURNITURES',
    classe: 3,
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE',
    secteurs: ['INDUSTRIE', 'PRODUCTION']
  },
  {
    numero: '321',
    libelle: 'Matières premières',
    classe: 3,
    sousClasse: '32',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '322',
    libelle: 'Matières et fournitures consommables',
    classe: 3,
    sousClasse: '32',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },

  // Autres approvisionnements
  {
    numero: '33',
    libelle: 'AUTRES APPROVISIONNEMENTS',
    classe: 3,
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '331',
    libelle: 'Combustibles',
    classe: 3,
    sousClasse: '33',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '332',
    libelle: 'Produits d\'entretien',
    classe: 3,
    sousClasse: '33',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // Produits en cours
  {
    numero: '34',
    libelle: 'PRODUITS EN COURS',
    classe: 3,
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF',
    secteurs: ['INDUSTRIE', 'PRODUCTION']
  },
  {
    numero: '341',
    libelle: 'Produits en cours',
    classe: 3,
    sousClasse: '34',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // Services en cours
  {
    numero: '35',
    libelle: 'SERVICES EN COURS',
    classe: 3,
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF',
    secteurs: ['SERVICES']
  },
  {
    numero: '351',
    libelle: 'Études en cours',
    classe: 3,
    sousClasse: '35',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // Produits finis
  {
    numero: '36',
    libelle: 'PRODUITS FINIS',
    classe: 3,
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE',
    secteurs: ['INDUSTRIE', 'PRODUCTION']
  },
  {
    numero: '361',
    libelle: 'Produits finis A',
    classe: 3,
    sousClasse: '36',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },

  // Provisions pour dépréciation des stocks
  {
    numero: '39',
    libelle: 'PROVISIONS POUR DEPRECIATION DES STOCKS',
    classe: 3,
    nature: 'ACTIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },

  // CLASSE 4 - COMPTES DE TIERS
  // Fournisseurs et comptes rattachés
  {
    numero: '40',
    libelle: 'FOURNISSEURS ET COMPTES RATTACHES',
    classe: 4,
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '401',
    libelle: 'Fournisseurs, dettes en compte',
    classe: 4,
    sousClasse: '40',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '402',
    libelle: 'Fournisseurs, effets à payer',
    classe: 4,
    sousClasse: '40',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '403',
    libelle: 'Fournisseurs d\'immobilisations, dettes en compte',
    classe: 4,
    sousClasse: '40',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '408',
    libelle: 'Fournisseurs, factures non parvenues',
    classe: 4,
    sousClasse: '40',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '409',
    libelle: 'Fournisseurs débiteurs, avances et acomptes versés',
    classe: 4,
    sousClasse: '40',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // Clients et comptes rattachés
  {
    numero: '41',
    libelle: 'CLIENTS ET COMPTES RATTACHES',
    classe: 4,
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '411',
    libelle: 'Clients',
    classe: 4,
    sousClasse: '41',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '412',
    libelle: 'Clients, effets à recevoir',
    classe: 4,
    sousClasse: '41',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '413',
    libelle: 'Clients douteux',
    classe: 4,
    sousClasse: '41',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '418',
    libelle: 'Clients, produits non encore facturés',
    classe: 4,
    sousClasse: '41',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '419',
    libelle: 'Clients créditeurs, avances et acomptes reçus',
    classe: 4,
    sousClasse: '41',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },

  // Personnel
  {
    numero: '42',
    libelle: 'PERSONNEL',
    classe: 4,
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '421',
    libelle: 'Personnel, avances et acomptes',
    classe: 4,
    sousClasse: '42',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '422',
    libelle: 'Personnel, rémunérations dues',
    classe: 4,
    sousClasse: '42',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '423',
    libelle: 'Personnel, oppositions',
    classe: 4,
    sousClasse: '42',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '424',
    libelle: 'Personnel, œuvres sociales',
    classe: 4,
    sousClasse: '42',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '426',
    libelle: 'Personnel, dépôts',
    classe: 4,
    sousClasse: '42',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '427',
    libelle: 'Personnel, frais médicaux et sociaux',
    classe: 4,
    sousClasse: '42',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '428',
    libelle: 'Personnel, charges à payer et produits à recevoir',
    classe: 4,
    sousClasse: '42',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },

  // Organismes sociaux
  {
    numero: '43',
    libelle: 'ORGANISMES SOCIAUX',
    classe: 4,
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '431',
    libelle: 'Sécurité sociale',
    classe: 4,
    sousClasse: '43',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '432',
    libelle: 'Caisse de retraite',
    classe: 4,
    sousClasse: '43',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '438',
    libelle: 'Autres organismes sociaux',
    classe: 4,
    sousClasse: '43',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },

  // État et collectivités publiques
  {
    numero: '44',
    libelle: 'ETAT ET COLLECTIVITES PUBLIQUES',
    classe: 4,
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '441',
    libelle: 'État, subventions à recevoir',
    classe: 4,
    sousClasse: '44',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '442',
    libelle: 'État, impôts et taxes recouvrables sur des tiers',
    classe: 4,
    sousClasse: '44',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '443',
    libelle: 'État, TVA facturée',
    classe: 4,
    sousClasse: '44',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '444',
    libelle: 'État, impôts sur les bénéfices',
    classe: 4,
    sousClasse: '44',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '445',
    libelle: 'État, TVA récupérable',
    classe: 4,
    sousClasse: '44',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '446',
    libelle: 'État, autres impôts et taxes',
    classe: 4,
    sousClasse: '44',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '447',
    libelle: 'État, impôts retenus à la source',
    classe: 4,
    sousClasse: '44',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '448',
    libelle: 'État, charges à payer et produits à recevoir',
    classe: 4,
    sousClasse: '44',
    nature: 'SPECIAL',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },

  // Organismes internationaux
  {
    numero: '45',
    libelle: 'ORGANISMES INTERNATIONAUX',
    classe: 4,
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // Associés et groupe
  {
    numero: '46',
    libelle: 'ASSOCIES ET GROUPE',
    classe: 4,
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '461',
    libelle: 'Associés, comptes d\'apport en société',
    classe: 4,
    sousClasse: '46',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '462',
    libelle: 'Associés, comptes courants',
    classe: 4,
    sousClasse: '46',
    nature: 'SPECIAL',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '465',
    libelle: 'Associés, dividendes à payer',
    classe: 4,
    sousClasse: '46',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },

  // Débiteurs et créditeurs divers
  {
    numero: '47',
    libelle: 'DEBITEURS ET CREDITEURS DIVERS',
    classe: 4,
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '471',
    libelle: 'Compte d\'attente',
    classe: 4,
    sousClasse: '47',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '472',
    libelle: 'Créances sur cessions d\'immobilisations',
    classe: 4,
    sousClasse: '47',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '475',
    libelle: 'Créances sur cessions de titres de placement',
    classe: 4,
    sousClasse: '47',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // Créances et dettes hors activités ordinaires
  {
    numero: '48',
    libelle: 'CREANCES ET DETTES HORS ACTIVITES ORDINAIRES (H.A.O)',
    classe: 4,
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // Provisions pour dépréciation des comptes de tiers
  {
    numero: '49',
    libelle: 'PROVISIONS POUR DEPRECIATION DES COMPTES DE TIERS',
    classe: 4,
    nature: 'ACTIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '491',
    libelle: 'Provisions pour dépréciation des comptes clients',
    classe: 4,
    sousClasse: '49',
    nature: 'ACTIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },

  // CLASSE 5 - COMPTES DE TRESORERIE
  // Titres de placement
  {
    numero: '50',
    libelle: 'TITRES DE PLACEMENT',
    classe: 5,
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '501',
    libelle: 'Actions',
    classe: 5,
    sousClasse: '50',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '502',
    libelle: 'Obligations',
    classe: 5,
    sousClasse: '50',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // Valeurs à encaisser
  {
    numero: '51',
    libelle: 'VALEURS A ENCAISSER',
    classe: 5,
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '511',
    libelle: 'Effets à recevoir',
    classe: 5,
    sousClasse: '51',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '512',
    libelle: 'Effets à l\'encaissement',
    classe: 5,
    sousClasse: '51',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '513',
    libelle: 'Effets à l\'escompte',
    classe: 5,
    sousClasse: '51',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // Banques, chèques postaux, caisse et assimilés
  {
    numero: '52',
    libelle: 'BANQUES, CHEQUES POSTAUX, CAISSE ET ASSIMILES',
    classe: 5,
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '521',
    libelle: 'Banques locales',
    classe: 5,
    sousClasse: '52',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '522',
    libelle: 'Banques étrangères',
    classe: 5,
    sousClasse: '52',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '524',
    libelle: 'Chèques postaux',
    classe: 5,
    sousClasse: '52',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '531',
    libelle: 'Caisse siège social',
    classe: 5,
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '532',
    libelle: 'Caisse succursale (ou usine) A',
    classe: 5,
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // Régies d'avance et accréditifs
  {
    numero: '54',
    libelle: 'REGIES D\'AVANCE ET ACCREDITIFS',
    classe: 5,
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // Virements de fonds
  {
    numero: '55',
    libelle: 'VIREMENTS DE FONDS',
    classe: 5,
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // Banques, soldes créditeurs
  {
    numero: '56',
    libelle: 'BANQUES, SOLDES CREDITEURS',
    classe: 5,
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '561',
    libelle: 'Banques, soldes créditeurs',
    classe: 5,
    sousClasse: '56',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },

  // Caisses, soldes créditeurs
  {
    numero: '57',
    libelle: 'CAISSES, SOLDES CREDITEURS',
    classe: 5,
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },

  // Provisions pour dépréciation des éléments financiers
  {
    numero: '59',
    libelle: 'PROVISIONS POUR DEPRECIATION DES ELEMENTS FINANCIERS',
    classe: 5,
    nature: 'ACTIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },

  // CLASSE 6 - COMPTES DE CHARGES DES ACTIVITES ORDINAIRES
  // Achats de marchandises
  {
    numero: '60',
    libelle: 'ACHATS DE MARCHANDISES',
    classe: 6,
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE',
    secteurs: ['COMMERCE']
  },
  {
    numero: '601',
    libelle: 'Achats de marchandises A',
    classe: 6,
    sousClasse: '60',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '602',
    libelle: 'Achats de marchandises B',
    classe: 6,
    sousClasse: '60',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // Achats de matières premières
  {
    numero: '61',
    libelle: 'ACHATS DE MATIERES PREMIERES ET FOURNITURES',
    classe: 6,
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE',
    secteurs: ['INDUSTRIE', 'PRODUCTION']
  },
  {
    numero: '611',
    libelle: 'Achats de matières premières',
    classe: 6,
    sousClasse: '61',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '612',
    libelle: 'Achats de matières et fournitures consommables',
    classe: 6,
    sousClasse: '61',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },

  // Autres achats
  {
    numero: '62',
    libelle: 'AUTRES ACHATS',
    classe: 6,
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '621',
    libelle: 'Achats de combustibles',
    classe: 6,
    sousClasse: '62',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '622',
    libelle: 'Achats de produits d\'entretien',
    classe: 6,
    sousClasse: '62',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '623',
    libelle: 'Achats de fournitures de bureau',
    classe: 6,
    sousClasse: '62',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '624',
    libelle: 'Achats de fournitures et matières de conditionnement',
    classe: 6,
    sousClasse: '62',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '625',
    libelle: 'Achats de fournitures d\'entretien',
    classe: 6,
    sousClasse: '62',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '626',
    libelle: 'Achats de petits matériels et outillages',
    classe: 6,
    sousClasse: '62',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '628',
    libelle: 'Achats de matières et fournitures diverses',
    classe: 6,
    sousClasse: '62',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // Variations des stocks
  {
    numero: '63',
    libelle: 'VARIATIONS DES STOCKS',
    classe: 6,
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '631',
    libelle: 'Variations des stocks de marchandises',
    classe: 6,
    sousClasse: '63',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '632',
    libelle: 'Variations des stocks de matières premières et fournitures',
    classe: 6,
    sousClasse: '63',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },

  // Services extérieurs A
  {
    numero: '64',
    libelle: 'SERVICES EXTERIEURS A',
    classe: 6,
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '641',
    libelle: 'Loyers',
    classe: 6,
    sousClasse: '64',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '642',
    libelle: 'Entretien et réparations',
    classe: 6,
    sousClasse: '64',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '643',
    libelle: 'Maintenance',
    classe: 6,
    sousClasse: '64',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '644',
    libelle: 'Primes d\'assurances',
    classe: 6,
    sousClasse: '64',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '645',
    libelle: 'Études et recherches',
    classe: 6,
    sousClasse: '64',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '646',
    libelle: 'Documentation',
    classe: 6,
    sousClasse: '64',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // Services extérieurs B
  {
    numero: '65',
    libelle: 'SERVICES EXTERIEURS B',
    classe: 6,
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '651',
    libelle: 'Redevances de crédit-bail',
    classe: 6,
    sousClasse: '65',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '652',
    libelle: 'Redevances pour brevets, licences',
    classe: 6,
    sousClasse: '65',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '653',
    libelle: 'Transports',
    classe: 6,
    sousClasse: '65',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '654',
    libelle: 'Commissions et courtages',
    classe: 6,
    sousClasse: '65',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '655',
    libelle: 'Frais postaux et télécommunications',
    classe: 6,
    sousClasse: '65',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '656',
    libelle: 'Cotisations',
    classe: 6,
    sousClasse: '65',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '657',
    libelle: 'Rémunérations d\'intermédiaires et honoraires',
    classe: 6,
    sousClasse: '65',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '658',
    libelle: 'Charges diverses de gestion courante',
    classe: 6,
    sousClasse: '65',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },

  // Charges de personnel
  {
    numero: '66',
    libelle: 'CHARGES DE PERSONNEL',
    classe: 6,
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '661',
    libelle: 'Rémunérations directes versées au personnel national',
    classe: 6,
    sousClasse: '66',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '662',
    libelle: 'Rémunérations directes versées au personnel non national',
    classe: 6,
    sousClasse: '66',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '663',
    libelle: 'Indemnités et avantages divers',
    classe: 6,
    sousClasse: '66',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '664',
    libelle: 'Charges sociales sur rémunérations du personnel national',
    classe: 6,
    sousClasse: '66',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '665',
    libelle: 'Charges sociales sur rémunérations du personnel non national',
    classe: 6,
    sousClasse: '66',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '667',
    libelle: 'Rémunérations de l\'exploitant individuel',
    classe: 6,
    sousClasse: '66',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '668',
    libelle: 'Autres charges de personnel',
    classe: 6,
    sousClasse: '66',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // Frais financiers
  {
    numero: '67',
    libelle: 'FRAIS FINANCIERS ET CHARGES ASSIMILEES',
    classe: 6,
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '671',
    libelle: 'Intérêts des emprunts',
    classe: 6,
    sousClasse: '67',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '672',
    libelle: 'Intérêts dans loyers de crédit-bail',
    classe: 6,
    sousClasse: '67',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '673',
    libelle: 'Escomptes accordés',
    classe: 6,
    sousClasse: '67',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // Dotations aux amortissements
  {
    numero: '68',
    libelle: 'DOTATIONS AUX AMORTISSEMENTS',
    classe: 6,
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '681',
    libelle: 'Dotations aux amortissements des immobilisations incorporelles',
    classe: 6,
    sousClasse: '68',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '682',
    libelle: 'Dotations aux amortissements des immobilisations corporelles',
    classe: 6,
    sousClasse: '68',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },

  // Dotations aux provisions
  {
    numero: '69',
    libelle: 'DOTATIONS AUX PROVISIONS',
    classe: 6,
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '691',
    libelle: 'Dotations aux provisions d\'exploitation',
    classe: 6,
    sousClasse: '69',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '697',
    libelle: 'Dotations aux provisions financières',
    classe: 6,
    sousClasse: '69',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // CLASSE 7 - COMPTES DE PRODUITS DES ACTIVITES ORDINAIRES
  // Ventes de marchandises
  {
    numero: '70',
    libelle: 'VENTES DE MARCHANDISES',
    classe: 7,
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE',
    secteurs: ['COMMERCE']
  },
  {
    numero: '701',
    libelle: 'Ventes de marchandises A',
    classe: 7,
    sousClasse: '70',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '702',
    libelle: 'Ventes de marchandises B',
    classe: 7,
    sousClasse: '70',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },

  // Ventes de produits finis
  {
    numero: '71',
    libelle: 'VENTES DE PRODUITS FINIS',
    classe: 7,
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE',
    secteurs: ['INDUSTRIE', 'PRODUCTION']
  },
  {
    numero: '711',
    libelle: 'Ventes de produits finis A',
    classe: 7,
    sousClasse: '71',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },

  // Ventes de produits intermédiaires et déchets
  {
    numero: '72',
    libelle: 'VENTES DE PRODUITS INTERMEDIAIRES ET DECHETS',
    classe: 7,
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },

  // Services vendus
  {
    numero: '73',
    libelle: 'SERVICES VENDUS',
    classe: 7,
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE',
    secteurs: ['SERVICES']
  },
  {
    numero: '731',
    libelle: 'Services A',
    classe: 7,
    sousClasse: '73',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },

  // Production stockée
  {
    numero: '74',
    libelle: 'PRODUCTION STOCKEE OU DESTOCKEE',
    classe: 7,
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },

  // Autres produits
  {
    numero: '75',
    libelle: 'AUTRES PRODUITS',
    classe: 7,
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '751',
    libelle: 'Redevances pour brevets, licences, marques',
    classe: 7,
    sousClasse: '75',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },

  // Produits financiers
  {
    numero: '77',
    libelle: 'REVENUS FINANCIERS ET PRODUITS ASSIMILES',
    classe: 7,
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '771',
    libelle: 'Intérêts de prêts',
    classe: 7,
    sousClasse: '77',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '773',
    libelle: 'Escomptes obtenus',
    classe: 7,
    sousClasse: '77',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '776',
    libelle: 'Gains de change',
    classe: 7,
    sousClasse: '77',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },

  // Reprises d'amortissements et provisions
  {
    numero: '78',
    libelle: 'REPRISES D\'AMORTISSEMENTS ET DE PROVISIONS',
    classe: 7,
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '781',
    libelle: 'Reprises d\'amortissements',
    classe: 7,
    sousClasse: '78',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '791',
    libelle: 'Reprises de provisions d\'exploitation',
    classe: 7,
    sousClasse: '79',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },

  // CLASSE 8 - COMPTES DES AUTRES CHARGES ET PRODUITS
  // Autres charges H.A.O
  {
    numero: '81',
    libelle: 'VALEURS COMPTABLES DES CESSIONS D\'IMMOBILISATIONS',
    classe: 8,
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '82',
    libelle: 'PRODUITS DES CESSIONS D\'IMMOBILISATIONS',
    classe: 8,
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '83',
    libelle: 'CHARGES H.A.O',
    classe: 8,
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '84',
    libelle: 'PRODUITS H.A.O',
    classe: 8,
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '85',
    libelle: 'DOTATIONS H.A.O',
    classe: 8,
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '86',
    libelle: 'REPRISES H.A.O',
    classe: 8,
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '87',
    libelle: 'PARTICIPATION DES TRAVAILLEURS',
    classe: 8,
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '88',
    libelle: 'SUBVENTIONS D\'EQUILIBRE',
    classe: 8,
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '89',
    libelle: 'IMPOTS SUR LE RESULTAT',
    classe: 8,
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '891',
    libelle: 'Impôts sur les bénéfices de l\'exercice',
    classe: 8,
    sousClasse: '89',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },

  // CLASSE 9 - COMPTES SPECIAUX
  // Engagements hors bilan
  {
    numero: '91',
    libelle: 'ENGAGEMENTS HORS BILAN',
    classe: 9,
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '911',
    libelle: 'Engagements de financement en faveur de tiers',
    classe: 9,
    sousClasse: '91',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '912',
    libelle: 'Engagements de garantie donnés par l\'entreprise',
    classe: 9,
    sousClasse: '91',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // Comptabilité analytique de gestion
  {
    numero: '92',
    libelle: 'COMPTABILITE ANALYTIQUE DE GESTION',
    classe: 9,
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // Comptes de l'exercice
  {
    numero: '93',
    libelle: 'COMPTES DE L\'EXERCICE',
    classe: 9,
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
]

export const getSYSCOHADAAccountByNumber = (numero: string): CompteComptable | undefined => {
  return PLAN_SYSCOHADA_REVISE.find(compte => compte.numero === numero)
}

export const getSYSCOHADAAccountsByClass = (classe: number): CompteComptable[] => {
  return PLAN_SYSCOHADA_REVISE.filter(compte => compte.classe === classe)
}

export const getSYSCOHADAAccountsBySector = (secteur: string): CompteComptable[] => {
  return PLAN_SYSCOHADA_REVISE.filter(compte => 
    !compte.secteurs || compte.secteurs.includes(secteur)
  )
}

export const validateSYSCOHADAAccount = (numero: string): boolean => {
  return getSYSCOHADAAccountByNumber(numero) !== undefined
}