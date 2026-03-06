/**
 * Notes Annexes - Système Normal SYSCOHADA
 * Titre IX, Chapitre 6 (p.997-1044)
 * 36 notes obligatoires + informations sociales/environnementales/sociétales
 */

export interface NoteAnnexe {
  numero: number
  titre: string
  description: string
  rubriques: string[]
  commentaireObligatoire?: string
}

export const NOTES_ANNEXES: NoteAnnexe[] = [
  { numero: 1, titre: 'Dérogations aux principes comptables fondamentaux', description: 'Indication et justification des dérogations aux principes comptables, avec estimation de leur incidence sur le patrimoine, la situation financière et le résultat.', rubriques: ['Principes dérogatoires appliqués', 'Justification', 'Incidence'] },
  { numero: 2, titre: 'Changements de méthodes comptables', description: 'Indication de tout changement de méthode comptable, avec justification et impact.', rubriques: ['Nature du changement', 'Justification', 'Impact sur résultat', 'Impact sur capitaux propres'] },
  { numero: 3, titre: 'Informations complémentaires relatives au Bilan', description: 'Tableaux des immobilisations, amortissements, dépréciations et plus/moins-values de cession.', rubriques: ['3A: Actif immobilisé brut', '3B: Amortissements', '3C: Plus-values et moins-values de cession', '3D: Informations sur réévaluations', '3E: Dépréciations et provisions'], commentaireObligatoire: 'Indiquer les méthodes d\'amortissement utilisées et les durées de vie.' },
  { numero: 4, titre: 'Immobilisations financières', description: 'Détail des titres de participation, créances rattachées et autres immobilisations financières.', rubriques: ['Titres de participation', 'Titres immobilisés de l\'activité de portefeuille', 'Autres titres immobilisés', 'Prêts et créances non commerciales', 'Dépôts et cautionnements'] },
  { numero: 5, titre: 'Actif circulant et passif circulant HAO', description: 'Détail des éléments HAO de l\'actif et du passif circulant.', rubriques: ['Créances HAO', 'Dettes HAO', 'Nature et origine des éléments HAO'] },
  { numero: 6, titre: 'Stocks et en-cours', description: 'Mouvements de stocks par catégorie avec variation.', rubriques: ['Marchandises', 'Matières premières', 'Autres approvisionnements', 'En-cours de production', 'Produits intermédiaires et finis', 'Produits résiduels'], commentaireObligatoire: 'Indiquer les méthodes de valorisation des stocks (FIFO, CUMP).' },
  { numero: 7, titre: 'Clients', description: 'Détail des créances clients par échéance.', rubriques: ['Clients douteux ou litigieux', 'Créances à un an au plus', 'Créances à plus d\'un an', 'Effets escomptés non échus'] },
  { numero: 8, titre: 'Autres créances', description: 'Détail des créances hors clients.', rubriques: ['8A: Personnel', '8B: État et collectivités', '8C: Organismes internationaux', 'Créances sur cessions d\'immobilisations', 'Charges constatées d\'avance'] },
  { numero: 9, titre: 'Titres de placement et valeurs à encaisser', description: 'Détail des titres de placement, nature et valeur.', rubriques: ['Actions', 'Obligations', 'Autres titres', 'Valeurs à encaisser'] },
  { numero: 10, titre: 'Banques, chèques postaux, caisse', description: 'Détail de la trésorerie-actif.', rubriques: ['Banques en monnaie nationale', 'Banques en devises', 'Chèques postaux', 'Caisse'] },
  { numero: 11, titre: 'Écarts de conversion', description: 'Détail des écarts de conversion actif et passif.', rubriques: ['Écart de conversion-Actif (perte latente)', 'Écart de conversion-Passif (gain latent)', 'Provision pour risques de change'] },
  { numero: 12, titre: 'Événements postérieurs à la clôture', description: 'Événements significatifs survenus entre la clôture et l\'arrêté des comptes.', rubriques: ['Nature de l\'événement', 'Estimation de l\'impact financier', 'Traitement comptable'] },
  { numero: 13, titre: 'Capital et actionnariat', description: 'Informations sur le capital social, sa composition et l\'actionnariat.', rubriques: ['Nombre d\'actions', 'Valeur nominale', 'Capital appelé/non appelé', 'Principaux actionnaires'] },
  { numero: 14, titre: 'Primes et réserves', description: 'Composition des primes liées au capital et des réserves.', rubriques: ['Primes d\'émission', 'Primes de fusion', 'Réserve légale', 'Réserves statutaires', 'Réserves facultatives', 'Report à nouveau'] },
  { numero: 15, titre: 'Subventions et provisions réglementées', description: 'Mouvements des subventions d\'investissement et provisions réglementées.', rubriques: ['Subventions reçues', 'Reprises de l\'exercice', 'Provisions réglementées constituées'] },
  { numero: 16, titre: 'Emprunts et dettes assimilées', description: 'Détail des emprunts par nature et échéance.', rubriques: ['Emprunts obligataires', 'Emprunts bancaires', 'Dettes de location-acquisition', 'Échéancier des remboursements'] },
  { numero: 17, titre: 'Fournisseurs d\'exploitation', description: 'Détail des dettes fournisseurs.', rubriques: ['Fournisseurs', 'Fournisseurs effets à payer', 'Fournisseurs factures non parvenues', 'Avances et acomptes versés'] },
  { numero: 18, titre: 'Dettes fiscales et sociales', description: 'Détail des dettes envers l\'État et les organismes sociaux.', rubriques: ['Impôt sur les bénéfices', 'TVA due', 'Autres impôts et taxes', 'Organismes sociaux', 'Personnel'] },
  { numero: 19, titre: 'Autres dettes et provisions pour risques à court terme', description: 'Détail des autres dettes et provisions à court terme.', rubriques: ['Dettes sur immobilisations', 'Dettes diverses', 'Produits constatés d\'avance', 'Provisions pour risques'] },
  { numero: 20, titre: 'Banques, crédits d\'escompte et de trésorerie', description: 'Détail de la trésorerie-passif.', rubriques: ['Crédits d\'escompte', 'Crédits de trésorerie', 'Découverts bancaires'] },
  { numero: 21, titre: 'Chiffre d\'affaires et autres produits', description: 'Ventilation du chiffre d\'affaires par activité et zone géographique.', rubriques: ['Ventes de marchandises', 'Ventes de produits fabriqués', 'Travaux et services', 'Produits accessoires', 'Ventilation géographique'] },
  { numero: 22, titre: 'Achats', description: 'Détail des achats de l\'exercice.', rubriques: ['Achats de marchandises', 'Achats de matières premières', 'Autres achats', 'Achats importés/locaux'] },
  { numero: 23, titre: 'Transports', description: 'Détail des charges de transport.', rubriques: ['Transports sur achats', 'Transports sur ventes', 'Autres transports'] },
  { numero: 24, titre: 'Services extérieurs', description: 'Détail des charges de services extérieurs.', rubriques: ['Sous-traitance', 'Locations', 'Entretien et réparations', 'Assurances', 'Études et recherches', 'Documentation', 'Rémunérations d\'intermédiaires et honoraires'] },
  { numero: 25, titre: 'Impôts et taxes', description: 'Détail des impôts et taxes.', rubriques: ['Impôts et taxes directs', 'Impôts et taxes indirects', 'Droits d\'enregistrement'] },
  { numero: 26, titre: 'Autres charges', description: 'Détail des autres charges d\'exploitation.', rubriques: ['Pertes sur créances clients', 'Valeur comptable cessions courantes', 'Indemnités administrateurs', 'Dons et mécénat', 'Charges provisionnées exploitation'], commentaireObligatoire: 'Indiquer la date du PV fixant les rémunérations des administrateurs et les organismes bénéficiaires des dons.' },
  { numero: 27, titre: 'Charges de personnel et effectifs', description: 'Ventilation des charges de personnel et effectifs.', rubriques: ['27A: Charges de personnel', '27B: Effectifs et masse salariale'], commentaireObligatoire: 'Ventiler par qualification (cadres, techniciens, employés) et par sexe (M/F).' },
  { numero: 28, titre: 'Provisions et dépréciations inscrites au bilan', description: 'Mouvements de l\'exercice pour toutes provisions et dépréciations.', rubriques: ['Provisions réglementées', 'Provisions financières', 'Dépréciations immobilisations', 'Dépréciations stocks', 'Dépréciations créances', 'Dépréciations titres placement'] },
  { numero: 29, titre: 'Charges et revenus financiers', description: 'Détail des charges et produits financiers.', rubriques: ['Intérêts des emprunts', 'Escomptes', 'Pertes/gains de change', 'Revenus de participations', 'Revenus de placements'], commentaireObligatoire: 'Indiquer le montant des intérêts non comptabilisés en cas de paiement à terme.' },
  { numero: 30, titre: 'Autres charges et produits HAO', description: 'Détail des éléments hors activité ordinaire.', rubriques: ['Charges HAO détaillées', 'Pertes sur créances HAO', 'Dons accordés/reçus', 'Abandons de créances', 'Produits HAO détaillés'] },
  { numero: 31, titre: 'Répartition du résultat', description: 'Projet de répartition soumis à l\'AG ou répartition décidée.', rubriques: ['Résultat de l\'exercice', 'Report à nouveau antérieur', 'Réserve légale', 'Réserves statutaires', 'Dividendes', 'Report à nouveau'] },
  { numero: 32, titre: 'Production de l\'exercice vendue', description: 'Ventilation des ventes de produits en quantité et valeur.', rubriques: ['Produits vendus dans le pays', 'Produits vendus dans les pays OHADA', 'Produits vendus hors OHADA', 'Production immobilisée', 'Stocks ouverture/clôture'] },
  { numero: 33, titre: 'Achats destinés à la production', description: 'Détail des achats de matières et fournitures pour la production.', rubriques: ['Produits de l\'État', 'Produits importés', 'Variation des stocks'] },
  { numero: 34, titre: 'Analyse de l\'activité et SIG', description: 'Soldes intermédiaires de gestion, CAFG, autofinancement et ratios.', rubriques: ['SIG en cascade', 'Détermination CAFG', 'Autofinancement', 'Rentabilité économique et financière', 'Structure financière (FR, BFE, BF HAO, TN)'] },
  { numero: 35, titre: 'Tableau des cinq derniers exercices', description: 'Informations financières résumées sur 5 exercices.', rubriques: ['Structure du capital', 'Opérations et résultats', 'Résultat distribué', 'Personnel et politique salariale'] },
  { numero: 36, titre: 'Nomenclature des comptes et codes des états financiers', description: 'Tables de codification officielle.', rubriques: ['Codes rubriques Bilan', 'Codes rubriques CR', 'Codes rubriques TFT', 'Nomenclature activités', 'Codes formes juridiques', 'Codes pays'] },
]
