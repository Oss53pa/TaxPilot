import type { CompteComptable } from '../types'

/**
 * CLASSE 5 - COMPTES DE TRESORERIE
 * Plan comptable SYSCOHADA Révisé (2017)
 */
export const CLASSE_5_COMPTES: CompteComptable[] = [
  // ============================================================
  // 50 - TITRES DE PLACEMENT
  // ============================================================
  {
    numero: '50',
    libelle: 'Titres de placement',
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
    numero: '5011',
    libelle: 'Actions cotées',
    classe: 5,
    sousClasse: '501',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '5012',
    libelle: 'Actions non cotées',
    classe: 5,
    sousClasse: '501',
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
  {
    numero: '5021',
    libelle: "Obligations émises par l'entité et rachetées",
    classe: 5,
    sousClasse: '502',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '5022',
    libelle: "Obligations d'État",
    classe: 5,
    sousClasse: '502',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '5028',
    libelle: 'Autres obligations',
    classe: 5,
    sousClasse: '502',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '503',
    libelle: 'Parts de capital dans des organismes',
    classe: 5,
    sousClasse: '50',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '504',
    libelle: 'Bons du Trésor et bons de caisse à court terme',
    classe: 5,
    sousClasse: '50',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '505',
    libelle: 'Chèques de voyage',
    classe: 5,
    sousClasse: '50',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '506',
    libelle: 'Intérêts courus',
    classe: 5,
    sousClasse: '50',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '508',
    libelle: 'Autres valeurs assimilées',
    classe: 5,
    sousClasse: '50',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 51 - VALEURS A ENCAISSER
  // ============================================================
  {
    numero: '51',
    libelle: 'Valeurs à encaisser',
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
    numero: '5111',
    libelle: 'Effets à recevoir',
    classe: 5,
    sousClasse: '511',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '5112',
    libelle: "Effets à l'encaissement",
    classe: 5,
    sousClasse: '511',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '5113',
    libelle: "Effets à l'escompte",
    classe: 5,
    sousClasse: '511',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '512',
    libelle: "Effets à l'encaissement",
    classe: 5,
    sousClasse: '51',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '513',
    libelle: 'Chèques à encaisser',
    classe: 5,
    sousClasse: '51',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '514',
    libelle: "Chèques à l'encaissement",
    classe: 5,
    sousClasse: '51',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '515',
    libelle: 'Cartes de crédit à encaisser',
    classe: 5,
    sousClasse: '51',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '518',
    libelle: 'Autres valeurs à encaisser',
    classe: 5,
    sousClasse: '51',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 52 - BANQUES
  // ============================================================
  {
    numero: '52',
    libelle: 'Banques',
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
    numero: '5211',
    libelle: 'Banque A',
    classe: 5,
    sousClasse: '521',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '5212',
    libelle: 'Banque B',
    classe: 5,
    sousClasse: '521',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '522',
    libelle: 'Banques, autres États UEMOA ou CEMAC',
    classe: 5,
    sousClasse: '52',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '523',
    libelle: 'Banques, autres États zone franc',
    classe: 5,
    sousClasse: '52',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '524',
    libelle: 'Banques hors zone franc',
    classe: 5,
    sousClasse: '52',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '525',
    libelle: 'Banques, soldes créditeurs',
    classe: 5,
    sousClasse: '52',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '526',
    libelle: 'Banques, intérêts courus',
    classe: 5,
    sousClasse: '52',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '528',
    libelle: 'Autres établissements financiers et assimilés',
    classe: 5,
    sousClasse: '52',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 53 - ETABLISSEMENTS FINANCIERS ET ASSIMILES
  // ============================================================
  {
    numero: '53',
    libelle: 'Établissements financiers et assimilés',
    classe: 5,
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '531',
    libelle: 'Chèques postaux',
    classe: 5,
    sousClasse: '53',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '532',
    libelle: 'Trésor',
    classe: 5,
    sousClasse: '53',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '533',
    libelle: "Sociétés de gestion et d'intermédiation",
    classe: 5,
    sousClasse: '53',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '538',
    libelle: 'Autres établissements financiers',
    classe: 5,
    sousClasse: '53',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 54 - INSTRUMENTS DE TRESORERIE
  // ============================================================
  {
    numero: '54',
    libelle: 'Instruments de trésorerie',
    classe: 5,
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '541',
    libelle: "Options de taux d'intérêt",
    classe: 5,
    sousClasse: '54',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '542',
    libelle: 'Options de taux de change',
    classe: 5,
    sousClasse: '54',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '543',
    libelle: 'Options de cours de matières',
    classe: 5,
    sousClasse: '54',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '544',
    libelle: "Instruments de taux d'intérêt",
    classe: 5,
    sousClasse: '54',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '545',
    libelle: 'Instruments de taux de change',
    classe: 5,
    sousClasse: '54',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '548',
    libelle: 'Autres instruments de trésorerie',
    classe: 5,
    sousClasse: '54',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 55 - REGIES D'AVANCE, ACCREDITIFS ET FONDS ATTRIBUES
  // ============================================================
  {
    numero: '55',
    libelle: "Régies d'avance, accrédits et fonds attribués",
    classe: 5,
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '551',
    libelle: "Régies d'avance",
    classe: 5,
    sousClasse: '55',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '552',
    libelle: 'Accrédits',
    classe: 5,
    sousClasse: '55',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '558',
    libelle: 'Fonds attribués',
    classe: 5,
    sousClasse: '55',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 56 - BANQUES, CREDITS DE TRESORERIE ET D'ESCOMPTE
  // ============================================================
  {
    numero: '56',
    libelle: "Banques, crédits de trésorerie et d'escompte",
    classe: 5,
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '561',
    libelle: 'Crédits de trésorerie',
    classe: 5,
    sousClasse: '56',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '562',
    libelle: "Crédits d'escompte",
    classe: 5,
    sousClasse: '56',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '564',
    libelle: 'Escompte de crédits de campagne',
    classe: 5,
    sousClasse: '56',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '565',
    libelle: 'Escompte de crédits ordinaires',
    classe: 5,
    sousClasse: '56',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '566',
    libelle: 'Banques, intérêts courus',
    classe: 5,
    sousClasse: '56',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '568',
    libelle: 'Autres crédits de trésorerie',
    classe: 5,
    sousClasse: '56',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 57 - CAISSE
  // ============================================================
  {
    numero: '57',
    libelle: 'Caisse',
    classe: 5,
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '571',
    libelle: 'Caisse siège social',
    classe: 5,
    sousClasse: '57',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '572',
    libelle: 'Caisse succursale A',
    classe: 5,
    sousClasse: '57',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '573',
    libelle: 'Caisse succursale B',
    classe: 5,
    sousClasse: '57',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '578',
    libelle: 'Autres caisses',
    classe: 5,
    sousClasse: '57',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 58 - REGIES DE RECETTES
  // ============================================================
  {
    numero: '58',
    libelle: 'Régies de recettes',
    classe: 5,
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '581',
    libelle: 'Régie de recettes siège social',
    classe: 5,
    sousClasse: '58',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '582',
    libelle: 'Régie de recettes succursale A',
    classe: 5,
    sousClasse: '58',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '588',
    libelle: 'Autres régies de recettes',
    classe: 5,
    sousClasse: '58',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 59 - DEPRECIATIONS ET RISQUES PROVISIONNES
  // ============================================================
  {
    numero: '59',
    libelle: 'Dépréciations et risques provisionnés',
    classe: 5,
    nature: 'ACTIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '591',
    libelle: 'Dépréciations des titres de placement',
    classe: 5,
    sousClasse: '59',
    nature: 'ACTIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '592',
    libelle: 'Dépréciations des valeurs à encaisser',
    classe: 5,
    sousClasse: '59',
    nature: 'ACTIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '593',
    libelle: 'Dépréciations des comptes banques',
    classe: 5,
    sousClasse: '59',
    nature: 'ACTIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '594',
    libelle: 'Dépréciations des instruments de trésorerie',
    classe: 5,
    sousClasse: '59',
    nature: 'ACTIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '598',
    libelle: 'Autres dépréciations des comptes de trésorerie',
    classe: 5,
    sousClasse: '59',
    nature: 'ACTIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '599',
    libelle: 'Risques provisionnés à caractère financier',
    classe: 5,
    sousClasse: '59',
    nature: 'ACTIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  }
]
