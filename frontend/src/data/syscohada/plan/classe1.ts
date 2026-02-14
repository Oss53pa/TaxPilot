import type { CompteComptable } from '../types'

/**
 * CLASSE 1 - COMPTES DE RESSOURCES DURABLES
 * Plan comptable SYSCOHADA Révisé (2017)
 */
export const CLASSE_1_COMPTES: CompteComptable[] = [
  // ============================================================
  // 10 - CAPITAL ET RESERVES
  // ============================================================
  {
    numero: '10',
    libelle: 'Capital et réserves',
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
    utilisation: 'OBLIGATOIRE',
    notes: 'Montant du capital figurant dans les statuts de la société'
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
    numero: '1014',
    libelle: 'Capital souscrit, appelé, versé, amorti',
    classe: 1,
    sousClasse: '101',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
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
  {
    numero: '102',
    libelle: 'Capital par dotation',
    classe: 1,
    sousClasse: '10',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF',
    notes: 'Utilisé par les établissements publics et les entreprises individuelles à caractère public'
  },
  {
    numero: '1021',
    libelle: 'Dotation initiale',
    classe: 1,
    sousClasse: '102',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '1022',
    libelle: 'Dotations complémentaires',
    classe: 1,
    sousClasse: '102',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '1028',
    libelle: 'Autres dotations',
    classe: 1,
    sousClasse: '102',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '103',
    libelle: 'Capital personnel',
    classe: 1,
    sousClasse: '10',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF',
    notes: 'Utilisé par les entreprises individuelles'
  },
  {
    numero: '104',
    libelle: 'Primes liées au capital social',
    classe: 1,
    sousClasse: '10',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '1041',
    libelle: "Primes d'émission",
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
    numero: '1043',
    libelle: 'Primes de scission',
    classe: 1,
    sousClasse: '104',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '1044',
    libelle: "Primes d'apport partiel d'actif",
    classe: 1,
    sousClasse: '104',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '1045',
    libelle: "Primes de conversion d'obligations en actions",
    classe: 1,
    sousClasse: '104',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '1048',
    libelle: 'Autres primes',
    classe: 1,
    sousClasse: '104',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '105',
    libelle: 'Ecarts de réévaluation',
    classe: 1,
    sousClasse: '10',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '1051',
    libelle: 'Ecart de réévaluation libre',
    classe: 1,
    sousClasse: '105',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '1052',
    libelle: 'Ecart de réévaluation légale',
    classe: 1,
    sousClasse: '105',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '1053',
    libelle: 'Ecart de réévaluation en cours',
    classe: 1,
    sousClasse: '105',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '106',
    libelle: 'Réserves',
    classe: 1,
    sousClasse: '10',
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
    utilisation: 'OBLIGATOIRE',
    notes: 'Obligatoire dans les sociétés commerciales (10% du bénéfice jusqu\'à 20% du capital)'
  },
  {
    numero: '1062',
    libelle: 'Réserves indisponibles',
    classe: 1,
    sousClasse: '106',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '1063',
    libelle: 'Réserves statutaires ou contractuelles',
    classe: 1,
    sousClasse: '106',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '1064',
    libelle: 'Réserves réglementées',
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
  {
    numero: '109',
    libelle: 'Actionnaire, capital souscrit non appelé',
    classe: 1,
    sousClasse: '10',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF',
    notes: 'Compte à solde débiteur, figurant à l\'actif du bilan'
  },

  // ============================================================
  // 11 - REPORT A NOUVEAU
  // ============================================================
  {
    numero: '11',
    libelle: 'Report à nouveau',
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
    utilisation: 'OBLIGATOIRE',
    notes: 'Solde débiteur représentant les pertes antérieures non encore apurées'
  },

  // ============================================================
  // 12 - RESULTAT NET DE L'EXERCICE
  // ============================================================
  {
    numero: '12',
    libelle: "Résultat net de l'exercice",
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

  // ============================================================
  // 13 - SUBVENTIONS D'INVESTISSEMENT
  // ============================================================
  {
    numero: '13',
    libelle: "Subventions d'investissement",
    classe: 1,
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '131',
    libelle: "Subventions d'équipement A",
    classe: 1,
    sousClasse: '13',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '132',
    libelle: "Subventions d'équipement B",
    classe: 1,
    sousClasse: '13',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '133',
    libelle: "Subventions d'équipement C",
    classe: 1,
    sousClasse: '13',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '138',
    libelle: "Autres subventions d'investissement",
    classe: 1,
    sousClasse: '13',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '139',
    libelle: "Subventions d'investissement inscrites au compte de résultat",
    classe: 1,
    sousClasse: '13',
    nature: 'PASSIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF',
    notes: 'Compte à solde débiteur enregistrant la quote-part virée au résultat'
  },

  // ============================================================
  // 14 - PROVISIONS REGLEMENTEES ET FONDS ASSIMILES
  // ============================================================
  {
    numero: '14',
    libelle: 'Provisions réglementées et fonds assimilés',
    classe: 1,
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '141',
    libelle: 'Amortissements dérogatoires',
    classe: 1,
    sousClasse: '14',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '142',
    libelle: 'Plus-values de cession à réinvestir',
    classe: 1,
    sousClasse: '14',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '143',
    libelle: 'Fonds réglementés',
    classe: 1,
    sousClasse: '14',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '144',
    libelle: 'Provisions réglementées relatives aux stocks',
    classe: 1,
    sousClasse: '14',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '145',
    libelle: 'Provisions réglementées relatives aux immobilisations',
    classe: 1,
    sousClasse: '14',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '146',
    libelle: 'Provisions pour propre assureur',
    classe: 1,
    sousClasse: '14',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '148',
    libelle: 'Autres provisions et fonds réglementés',
    classe: 1,
    sousClasse: '14',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 15 - PROVISIONS POUR RISQUES ET CHARGES
  // ============================================================
  {
    numero: '15',
    libelle: 'Provisions pour risques et charges',
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
    numero: '1511',
    libelle: 'Provisions pour litiges',
    classe: 1,
    sousClasse: '151',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '1512',
    libelle: 'Provisions pour garanties données aux clients',
    classe: 1,
    sousClasse: '151',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '1513',
    libelle: 'Provisions pour pertes sur marchés à achèvement futur',
    classe: 1,
    sousClasse: '151',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '1514',
    libelle: 'Provisions pour amendes et pénalités',
    classe: 1,
    sousClasse: '151',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '1515',
    libelle: 'Provisions pour pertes de change',
    classe: 1,
    sousClasse: '151',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '1516',
    libelle: 'Provisions pour pertes sur contrats',
    classe: 1,
    sousClasse: '151',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '1518',
    libelle: 'Autres provisions pour risques',
    classe: 1,
    sousClasse: '151',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '152',
    libelle: 'Provisions pour pensions et obligations similaires',
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
  {
    numero: '1551',
    libelle: 'Provisions pour charges à répartir sur plusieurs exercices',
    classe: 1,
    sousClasse: '155',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '1552',
    libelle: 'Provisions pour grosses réparations',
    classe: 1,
    sousClasse: '155',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '1558',
    libelle: 'Autres provisions pour charges',
    classe: 1,
    sousClasse: '155',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '156',
    libelle: 'Provisions pour pertes de change',
    classe: 1,
    sousClasse: '15',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '157',
    libelle: 'Provisions pour charges à répartir',
    classe: 1,
    sousClasse: '15',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 16 - EMPRUNTS ET DETTES ASSIMILEES
  // ============================================================
  {
    numero: '16',
    libelle: 'Emprunts et dettes assimilées',
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
    numero: '1611',
    libelle: 'Emprunts obligataires ordinaires',
    classe: 1,
    sousClasse: '161',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '1612',
    libelle: 'Emprunts obligataires convertibles',
    classe: 1,
    sousClasse: '161',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '1618',
    libelle: 'Autres emprunts obligataires',
    classe: 1,
    sousClasse: '161',
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
    libelle: "Avances reçues de l'État",
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
    numero: '1641',
    libelle: 'Avances reçues',
    classe: 1,
    sousClasse: '164',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '1642',
    libelle: 'Comptes courants bloqués',
    classe: 1,
    sousClasse: '164',
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
    numero: '1651',
    libelle: 'Dépôts reçus',
    classe: 1,
    sousClasse: '165',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '1652',
    libelle: 'Cautionnements reçus',
    classe: 1,
    sousClasse: '165',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '166',
    libelle: 'Intérêts courus',
    classe: 1,
    sousClasse: '16',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE',
    notes: 'Intérêts courus et non échus à rattacher aux emprunts correspondants'
  },
  {
    numero: '1661',
    libelle: 'Intérêts courus sur emprunts obligataires',
    classe: 1,
    sousClasse: '166',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '1662',
    libelle: 'Intérêts courus sur emprunts et dettes bancaires',
    classe: 1,
    sousClasse: '166',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '1663',
    libelle: "Intérêts courus sur avances reçues de l'État",
    classe: 1,
    sousClasse: '166',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '1664',
    libelle: 'Intérêts courus sur comptes courants bloqués',
    classe: 1,
    sousClasse: '166',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '1665',
    libelle: 'Intérêts courus sur dépôts et cautionnements reçus',
    classe: 1,
    sousClasse: '166',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '1667',
    libelle: 'Intérêts courus sur emprunts assortis de conditions particulières',
    classe: 1,
    sousClasse: '166',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '1668',
    libelle: 'Intérêts courus sur autres emprunts et dettes',
    classe: 1,
    sousClasse: '166',
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
    numero: '1671',
    libelle: 'Emprunts participatifs',
    classe: 1,
    sousClasse: '167',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '1672',
    libelle: 'Emprunts convertibles',
    classe: 1,
    sousClasse: '167',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '1673',
    libelle: 'Obligations cautionnées',
    classe: 1,
    sousClasse: '167',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '1674',
    libelle: 'Titres participatifs',
    classe: 1,
    sousClasse: '167',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '1676',
    libelle: 'Avances assorties de conditions particulières',
    classe: 1,
    sousClasse: '167',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '1678',
    libelle: 'Autres emprunts et dettes assortis de conditions particulières',
    classe: 1,
    sousClasse: '167',
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
  {
    numero: '1681',
    libelle: 'Rentes viagères capitalisées',
    classe: 1,
    sousClasse: '168',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '1682',
    libelle: 'Billets de fonds',
    classe: 1,
    sousClasse: '168',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '1683',
    libelle: 'Dettes consécutives à des titres empruntés',
    classe: 1,
    sousClasse: '168',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '1686',
    libelle: 'Autres emprunts et dettes',
    classe: 1,
    sousClasse: '168',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '169',
    libelle: 'Primes de remboursement des obligations',
    classe: 1,
    sousClasse: '16',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF',
    notes: 'Compte à solde débiteur figurant à l\'actif du bilan, amorti sur la durée de l\'emprunt'
  },

  // ============================================================
  // 17 - DETTES DE LOCATION-ACQUISITION ET CREDIT-BAIL
  // ============================================================
  {
    numero: '17',
    libelle: 'Dettes de location-acquisition et crédit-bail',
    classe: 1,
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF',
    notes: 'Nouveau dans le SYSCOHADA Révisé 2017 - Inscription des dettes de crédit-bail au bilan'
  },
  {
    numero: '172',
    libelle: 'Emprunts équivalents de location-acquisition immobilière',
    classe: 1,
    sousClasse: '17',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '173',
    libelle: 'Emprunts équivalents de location-acquisition mobilière',
    classe: 1,
    sousClasse: '17',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '176',
    libelle: 'Intérêts courus sur dettes de location-acquisition',
    classe: 1,
    sousClasse: '17',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 18 - DETTES LIEES A DES PARTICIPATIONS ET COMPTES DE LIAISON
  // ============================================================
  {
    numero: '18',
    libelle: 'Dettes liées à des participations et comptes de liaison',
    classe: 1,
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF',
    notes: 'Comptes de nature spéciale pouvant avoir un solde débiteur ou créditeur'
  },
  {
    numero: '181',
    libelle: 'Dettes liées à des participations (groupe)',
    classe: 1,
    sousClasse: '18',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '182',
    libelle: 'Dettes liées à des participations (hors groupe)',
    classe: 1,
    sousClasse: '18',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '183',
    libelle: 'Comptes de liaison des établissements',
    classe: 1,
    sousClasse: '18',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF',
    notes: 'Compte de liaison entre établissements d\'une même entité'
  },
  {
    numero: '184',
    libelle: 'Comptes de liaison des sociétés en participation',
    classe: 1,
    sousClasse: '18',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '185',
    libelle: 'Comptes de liaison des sociétés en participation (non bloqués)',
    classe: 1,
    sousClasse: '18',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '186',
    libelle: 'Comptes de liaison charges',
    classe: 1,
    sousClasse: '18',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '187',
    libelle: 'Comptes de liaison produits',
    classe: 1,
    sousClasse: '18',
    nature: 'SPECIAL',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '188',
    libelle: 'Comptes de liaison des sociétés en participation',
    classe: 1,
    sousClasse: '18',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 19 - PROVISIONS FINANCIERES POUR RISQUES ET CHARGES
  // ============================================================
  {
    numero: '19',
    libelle: 'Provisions financières pour risques et charges',
    classe: 1,
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '191',
    libelle: 'Provisions pour risques sur opérations financières',
    classe: 1,
    sousClasse: '19',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '194',
    libelle: 'Provisions pour dépréciation des titres de participation',
    classe: 1,
    sousClasse: '19',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '195',
    libelle: 'Provisions pour risques et charges sur opérations à long terme',
    classe: 1,
    sousClasse: '19',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '196',
    libelle: 'Provisions pour pensions et obligations similaires',
    classe: 1,
    sousClasse: '19',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '197',
    libelle: 'Provisions financières pour risques et charges',
    classe: 1,
    sousClasse: '19',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  }
]
