import type { SoldeIntermediaireGestion, EquilibreFinancier } from './index'

/**
 * Règles de Présentation, SIG et Équilibres Financiers - SYSCOHADA
 * Titre IX, Chapitres 2-4 (p.962-986)
 */

/**
 * Règles générales de présentation des états financiers SYSCOHADA
 */
export const REGLES_PRESENTATION = {
  principes: [
    'Les états financiers annuels comprennent le Bilan, le Compte de résultat, le Tableau des flux de trésorerie et les Notes annexes. Ils forment un tout indissociable.',
    'Les états financiers doivent être établis et présentés de façon à permettre leur comparaison dans le temps (exercice précédent) et dans l\'espace (autres entités).',
    'Le bilan est présenté avant répartition du résultat.',
    'Le classement des postes du bilan est fonctionnel : investissement, financement, exploitation.',
    'Le Compte de résultat est présenté en liste avec mise en évidence des Soldes Intermédiaires de Gestion (SIG).',
    'La compensation entre postes d\'actif et de passif ou entre postes de charges et de produits n\'est pas admise.',
    'Les rubriques et postes non chiffrés peuvent être supprimés dans la présentation.',
    'Pour chaque poste, les chiffres de l\'exercice précédent (N-1) doivent être mentionnés.',
  ],
  colonnesBilan: {
    actif: ['Brut', 'Amort/Déprec', 'Net N', 'Net N-1'],
    passif: ['Net N', 'Net N-1'],
  },
  colonnesResultat: ['Exercice N', 'Exercice N-1'],
  systemes: [
    { code: 'NORMAL', description: 'Système Normal : entités dont le CA dépasse les seuils fixés par l\'OHADA. Bilan, CR, TFT et Notes annexes obligatoires (36 notes).', seuilCA: 'Fixé par acte uniforme selon la zone' },
    { code: 'MINIMAL', description: 'Système Minimal de Trésorerie (SMT) : très petites entités sous les seuils. Bilan simplifié et Compte de résultat simplifié.', seuilCA: 'Sous le seuil fixé par acte uniforme' },
  ],
  exerciceComptable: {
    duree: '12 mois',
    dateClotureUsuelle: '31 décembre',
    exceptions: 'La durée peut être différente de 12 mois pour le premier exercice et en cas de modification de la date de clôture.',
  },
  delaiEtablissement: '4 mois après la clôture de l\'exercice pour le Système Normal.',
}

/**
 * Soldes Intermédiaires de Gestion (SIG) - Cascade du Compte de Résultat
 * Titre IX, Chapitre 3 (p.975-980)
 */
export const SIG: SoldeIntermediaireGestion[] = [
  {
    code: 'XA',
    libelle: 'Marge commerciale',
    formule: 'Ventes de marchandises - Achats de marchandises ± Variation de stocks de marchandises',
    interpretation: 'Mesure la performance de l\'activité de négoce. Un taux de marge commerciale élevé traduit un bon pouvoir de négociation ou un positionnement haut de gamme.',
  },
  {
    code: 'XB',
    libelle: 'Chiffre d\'affaires',
    formule: 'Ventes de marchandises + Ventes de produits fabriqués + Travaux et services vendus + Produits accessoires',
    interpretation: 'Volume d\'activité global de l\'entité. Indicateur de taille et de dynamique commerciale.',
  },
  {
    code: 'XC',
    libelle: 'Valeur ajoutée',
    formule: 'Marge commerciale + Production de l\'exercice - Consommations intermédiaires',
    interpretation: 'Richesse créée par l\'entité. Mesure la contribution de l\'entité à l\'économie nationale. Elle se répartit entre le personnel, l\'État, les prêteurs, les actionnaires et l\'entité elle-même.',
  },
  {
    code: 'XD',
    libelle: 'Excédent Brut d\'Exploitation (EBE)',
    formule: 'Valeur ajoutée - Charges de personnel',
    interpretation: 'Résultat économique brut de l\'activité courante, indépendant des politiques d\'amortissement, de financement et fiscale. C\'est le meilleur indicateur de la performance industrielle et commerciale.',
  },
  {
    code: 'XE',
    libelle: 'Résultat d\'exploitation',
    formule: 'EBE + Reprises de provisions - Dotations aux amortissements et provisions',
    interpretation: 'Performance de l\'activité d\'exploitation après prise en compte de la politique d\'amortissement et de provisionnement. Mesure la rentabilité économique avant l\'impact du financement.',
  },
  {
    code: 'XF',
    libelle: 'Résultat financier',
    formule: 'Revenus financiers + Reprises provisions financières + Transferts charges financières - Frais financiers - Dotations provisions financières',
    interpretation: 'Impact de la politique de financement sur le résultat. Un résultat financier très négatif peut signaler un endettement excessif.',
  },
  {
    code: 'XG',
    libelle: 'Résultat des Activités Ordinaires (RAO)',
    formule: 'Résultat d\'exploitation + Résultat financier',
    interpretation: 'Performance globale de l\'activité courante (exploitation + financement). C\'est le résultat récurrent de l\'entité.',
  },
  {
    code: 'XH',
    libelle: 'Résultat HAO',
    formule: 'Produits HAO - Charges HAO',
    interpretation: 'Résultat des opérations non récurrentes (cessions d\'immobilisations, opérations en capital). Ne devrait pas être significatif sur la durée.',
  },
  {
    code: 'XI',
    libelle: 'Résultat net',
    formule: 'RAO + Résultat HAO - Participation des travailleurs - Impôts sur le résultat',
    interpretation: 'Résultat final disponible pour les actionnaires (distribution ou mise en réserve). Synthèse de toutes les activités de l\'entité.',
  },
]

/**
 * Équilibres financiers fondamentaux - Analyse structurelle du bilan
 * Titre IX, Chapitre 4 (p.981-986)
 */
export const EQUILIBRES_FINANCIERS: EquilibreFinancier[] = [
  {
    nom: 'Fonds de Roulement (FR)',
    formule: 'Ressources stables (DF) - Actif immobilisé (AZ)',
    interpretation: 'Excédent des ressources stables sur les emplois durables. Un FR positif signifie que les ressources stables financent l\'intégralité des immobilisations et dégagent un excédent pour financer le cycle d\'exploitation.',
  },
  {
    nom: 'Besoin de Financement d\'Exploitation (BFE)',
    formule: 'Actif circulant d\'exploitation (BJ - BA) - Passif circulant d\'exploitation (DN - DH)',
    interpretation: 'Besoin de financement généré par le cycle d\'exploitation (stocks + créances clients - dettes fournisseurs). Un BFE élevé nécessite un FR suffisant pour être couvert.',
  },
  {
    nom: 'Besoin de Financement HAO (BF HAO)',
    formule: 'Actif circulant HAO (BA) - Passif circulant HAO (DH)',
    interpretation: 'Besoin de financement lié aux opérations hors activité ordinaire.',
  },
  {
    nom: 'Trésorerie Nette (TN)',
    formule: 'FR - BFE - BF HAO = Trésorerie-Actif (BQ) - Trésorerie-Passif (DT)',
    interpretation: 'Résultante de l\'équilibre financier global. Une TN positive indique que le FR couvre les besoins de financement. Une TN négative traduit un recours au financement bancaire à court terme.',
  },
  {
    nom: 'Capacité d\'Autofinancement Globale (CAFG)',
    formule: 'EBE - Charges décaissables (frais financiers, impôts, participation) + Produits encaissables (revenus financiers, produits HAO encaissables)',
    interpretation: 'Ressource interne dégagée par l\'activité. Mesure la capacité de l\'entité à financer ses investissements, rembourser ses emprunts et distribuer des dividendes sans recours à l\'endettement externe.',
  },
  {
    nom: 'Autofinancement',
    formule: 'CAFG - Dividendes distribués',
    interpretation: 'Part de la CAFG effectivement conservée dans l\'entité pour le financement de la croissance.',
  },
]
