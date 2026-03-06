import type { FormatEtatFinancier } from './index'

/**
 * Compte de Résultat - Système Normal SYSCOHADA
 * Table de correspondance Postes/Comptes (Titre IX, Chapitre 7, p.1050)
 * Présentation en liste avec Soldes Intermédiaires de Gestion (SIG)
 */
export const COMPTE_RESULTAT: FormatEtatFinancier = {
  code: 'COMPTE_RESULTAT',
  titre: 'Compte de Résultat',
  description: 'Le Compte de résultat recense tous les produits et charges de l\'exercice, classés en Activité Ordinaire (exploitation + financier) et Activité HAO. La présentation en liste met en évidence les Soldes Intermédiaires de Gestion (SIG).',
  reglesPresentation: [
    'Présentation en liste avec SIG en cascade.',
    'Deux colonnes : Exercice N et Exercice N-1.',
    'Activité ordinaire = exploitation + financier.',
    'La compensation entre postes de charges et produits n\'est pas admise.',
  ],
  rubriques: [
    // ACTIVITE D'EXPLOITATION
    { ref: 'TA', libelle: 'Ventes de marchandises', comptesAssocies: ['701'], signe: '+', note: '21' },
    { ref: 'RA', libelle: 'Achats de marchandises', comptesAssocies: ['601'], signe: '-', note: '22' },
    { ref: 'RB', libelle: 'Variation de stocks de marchandises', comptesAssocies: ['6031'], signe: '-/+', note: '6' },
    { ref: 'XA', libelle: 'MARGE COMMERCIALE (Somme TA à RB)', comptesAssocies: [], formule: 'TA+RA+RB' },

    { ref: 'TB', libelle: 'Ventes de produits fabriqués', comptesAssocies: ['702', '703', '704'], signe: '+', note: '21' },
    { ref: 'TC', libelle: 'Travaux, services vendus', comptesAssocies: ['705', '706'], signe: '+', note: '21' },
    { ref: 'TD', libelle: 'Produits accessoires', comptesAssocies: ['707'], signe: '+', note: '21' },
    { ref: 'XB', libelle: 'CHIFFRE D\'AFFAIRES (A + B + C + D)', comptesAssocies: [], formule: 'TA+TB+TC+TD' },

    { ref: 'TE', libelle: 'Production stockée (ou déstockage)', comptesAssocies: ['73'], signe: '-/+', note: '6' },
    { ref: 'TF', libelle: 'Production immobilisée', comptesAssocies: ['72'], signe: '+' },
    { ref: 'TG', libelle: 'Subventions d\'exploitation', comptesAssocies: ['71'], signe: '+' },
    { ref: 'TH', libelle: 'Autres produits', comptesAssocies: ['75'], signe: '+', note: '26' },
    { ref: 'RC', libelle: 'Achats de matières premières et fournitures liées', comptesAssocies: ['602'], signe: '-', note: '22' },
    { ref: 'RD', libelle: 'Variation de stocks de matières premières', comptesAssocies: ['6032'], signe: '-/+', note: '6' },
    { ref: 'RE', libelle: 'Autres achats', comptesAssocies: ['604', '605', '608'], signe: '-', note: '22' },
    { ref: 'RF', libelle: 'Variation de stocks d\'autres approvisionnements', comptesAssocies: ['6033'], signe: '-/+', note: '6' },
    { ref: 'RG', libelle: 'Transports', comptesAssocies: ['61'], signe: '-', note: '23' },
    { ref: 'RH', libelle: 'Services extérieurs', comptesAssocies: ['62', '63'], signe: '-', note: '24' },
    { ref: 'RI', libelle: 'Impôts et taxes', comptesAssocies: ['64'], signe: '-', note: '25' },
    { ref: 'RJ', libelle: 'Autres charges', comptesAssocies: ['65'], signe: '-', note: '26' },

    { ref: 'XC', libelle: 'VALEUR AJOUTEE (XB+RA+RB) + (somme TE à RJ)', comptesAssocies: [], formule: 'XA+TB+TC+TD+TE+TF+TG+TH+RC+RD+RE+RF+RG+RH+RI+RJ' },

    { ref: 'RK', libelle: 'Charges de personnel', comptesAssocies: ['66'], signe: '-', note: '27' },
    { ref: 'XD', libelle: 'EXCEDENT BRUT D\'EXPLOITATION (XC+RK)', comptesAssocies: [], formule: 'XC+RK' },

    { ref: 'TI', libelle: 'Reprises d\'amortissements, provisions et dépréciations', comptesAssocies: ['791', '798', '799'], signe: '+' },
    { ref: 'RL', libelle: 'Dotations aux amortissements, aux provisions et dépréciations', comptesAssocies: ['681', '691'], signe: '-' },

    { ref: 'XE', libelle: 'RESULTAT D\'EXPLOITATION (XD+TI+RL)', comptesAssocies: [], formule: 'XD+TI+RL' },

    // ACTIVITE FINANCIERE
    { ref: 'TJ', libelle: 'Revenus financiers et assimilés', comptesAssocies: ['77'], signe: '+', note: '29' },
    { ref: 'TK', libelle: 'Reprises de provisions et dépréciations financières', comptesAssocies: ['797'], signe: '+' },
    { ref: 'TL', libelle: 'Transferts de charges financières', comptesAssocies: ['787'], signe: '+' },
    { ref: 'RM', libelle: 'Frais financiers et charges assimilées', comptesAssocies: ['67'], signe: '-', note: '29' },
    { ref: 'RN', libelle: 'Dotations aux provisions et aux dépréciations financières', comptesAssocies: ['697'], signe: '-' },

    { ref: 'XF', libelle: 'RESULTAT FINANCIER (somme TJ à RN)', comptesAssocies: [], formule: 'TJ+TK+TL+RM+RN' },

    { ref: 'XG', libelle: 'RESULTAT DES ACTIVITES ORDINAIRES (XE+XF)', comptesAssocies: [], formule: 'XE+XF' },

    // HORS ACTIVITES ORDINAIRES (HAO)
    { ref: 'TM', libelle: 'Produits des cessions d\'immobilisations', comptesAssocies: ['82'], signe: '+', note: '3c' },
    { ref: 'TN', libelle: 'Autres produits HAO', comptesAssocies: ['84', '86', '88'], signe: '+', note: '30' },
    { ref: 'RO', libelle: 'Valeurs comptables des cessions d\'immobilisations', comptesAssocies: ['81'], signe: '-', note: '3c' },
    { ref: 'RP', libelle: 'Autres charges HAO', comptesAssocies: ['83', '85', '87'], signe: '-', note: '30' },

    { ref: 'XH', libelle: 'RESULTAT HORS ACTIVITES ORDINAIRES (somme TM à RP)', comptesAssocies: [], formule: 'TM+TN+RO+RP' },

    // RESULTAT
    { ref: 'RQ', libelle: 'Participation des travailleurs', comptesAssocies: ['87'], signe: '-' },
    { ref: 'RS', libelle: 'Impôts sur le résultat', comptesAssocies: ['89'], signe: '-' },

    { ref: 'XI', libelle: 'RESULTAT NET (XG+XH+RQ+RS)', comptesAssocies: [], formule: 'XG+XH+RQ+RS' },
  ],
}
