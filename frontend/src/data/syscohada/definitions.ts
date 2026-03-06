/**
 * Définitions SYSCOHADA Révisé - Titre VI (p.141-214)
 * Termes et concepts clés pour les algorithmes d'audit et Proph3t
 * ~200 définitions les plus utiles pour la liasse fiscale
 */

export interface DefinitionSYSCOHADA {
  terme: string
  definition: string
  comptesAssocies?: string[]
}

export const DEFINITIONS_SYSCOHADA: DefinitionSYSCOHADA[] = [
  // A
  { terme: 'Abandon de créances', definition: 'Renonciation par un créancier à tout ou partie de sa créance. Charge HAO pour le créancier (compte 83), produit HAO pour le débiteur (compte 84). L\'abandon peut être assorti d\'une clause de retour à meilleure fortune.', comptesAssocies: ['83', '84'] },
  { terme: 'Actif', definition: 'Élément identifiable du patrimoine ayant une valeur économique positive pour l\'entité, c\'est-à-dire une ressource que l\'entité contrôle du fait d\'événements passés et dont elle attend des avantages économiques futurs.' },
  { terme: 'Actif circulant', definition: 'Éléments d\'actif qui, en raison de leur destination ou de leur nature, n\'ont pas vocation à rester durablement dans l\'entité. Comprend les stocks, créances et trésorerie-actif.', comptesAssocies: ['3', '4', '5'] },
  { terme: 'Actif circulant HAO', definition: 'Créances et emplois assimilés liés aux opérations hors activités ordinaires.', comptesAssocies: ['485', '488'] },
  { terme: 'Actif éventuel', definition: 'Actif potentiel résultant d\'événements passés et dont l\'existence ne sera confirmée que par la survenance d\'événements futurs incertains non totalement sous le contrôle de l\'entité. Non comptabilisé mais mentionné en notes annexes.' },
  { terme: 'Actif immobilisé', definition: 'Éléments d\'actif destinés à servir de façon durable à l\'activité de l\'entité. Comprend les immobilisations incorporelles, corporelles et financières.', comptesAssocies: ['2'] },
  { terme: 'Amortissement', definition: 'Répartition systématique du montant amortissable d\'un actif sur sa durée d\'utilité. Le montant amortissable est le coût de l\'actif diminué de sa valeur résiduelle.', comptesAssocies: ['28', '68'] },
  { terme: 'Amortissement dégressif', definition: 'Méthode d\'amortissement appliquant un taux constant à la valeur nette comptable résiduelle, ce qui produit des annuités décroissantes.' },
  { terme: 'Amortissement linéaire', definition: 'Méthode d\'amortissement répartissant de manière égale le montant amortissable sur la durée d\'utilité de l\'actif.' },
  { terme: 'Approche par composants', definition: 'Lorsque des éléments constitutifs d\'un actif ont des durées d\'utilité différentes, chaque composant significatif est comptabilisé et amorti séparément.' },
  { terme: 'Autofinancement', definition: 'Part de la Capacité d\'Autofinancement Globale (CAFG) conservée par l\'entité après distribution de dividendes. Autofinancement = CAFG - Dividendes distribués.' },

  // B
  { terme: 'Balance générale', definition: 'Document comptable récapitulatif présentant pour chaque compte le total des débits, le total des crédits et le solde. Sert de base à l\'établissement des états financiers.' },
  { terme: 'Besoin de financement d\'exploitation (BFE)', definition: 'Différence entre l\'actif circulant d\'exploitation et le passif circulant d\'exploitation. Représente le besoin de financement généré par le cycle d\'exploitation (stocks + créances - dettes fournisseurs).' },
  { terme: 'Bilan', definition: 'État financier décrivant séparément les éléments d\'actif et de passif et faisant apparaître de façon distincte les capitaux propres. Présenté avant répartition du résultat dans le SYSCOHADA.' },

  // C
  { terme: 'CAFG (Capacité d\'Autofinancement Globale)', definition: 'Ressource interne dégagée par l\'activité de l\'entité. Calculée à partir de l\'EBE en ajoutant les produits encaissables et en retranchant les charges décaissables. Exclut les plus/moins-values de cession, les reprises et dotations.', comptesAssocies: ['ZA'] },
  { terme: 'Capital social', definition: 'Montant des apports effectués par les associés ou actionnaires à la constitution ou lors d\'augmentations de capital. Représente la garantie minimale offerte aux créanciers.', comptesAssocies: ['101'] },
  { terme: 'Capitaux propres', definition: 'Intérêt résiduel dans les actifs de l\'entité après déduction de tous ses passifs. Comprennent le capital, les primes, les réserves, le report à nouveau, le résultat, les subventions d\'investissement et les provisions réglementées.', comptesAssocies: ['10', '11', '12', '13', '14', '15'] },
  { terme: 'Charges', definition: 'Diminutions d\'avantages économiques au cours de l\'exercice sous forme de sorties ou de diminutions d\'actifs, ou de survenance de passifs, ayant pour résultat de diminuer les capitaux propres autrement que par des distributions.', comptesAssocies: ['6'] },
  { terme: 'Charges constatées d\'avance', definition: 'Charges enregistrées pendant l\'exercice mais correspondant à des biens ou services dont la fourniture interviendra ultérieurement. Actif transitoire.', comptesAssocies: ['476'] },
  { terme: 'Charges HAO', definition: 'Charges résultant d\'événements ou opérations non liés à l\'activité ordinaire de l\'entité. Comprennent les valeurs comptables des cessions d\'immobilisations et les charges exceptionnelles.', comptesAssocies: ['81', '83', '85', '87'] },
  { terme: 'Chiffre d\'affaires', definition: 'Montant des ventes de biens et services liés à l\'activité ordinaire, nettes des réductions commerciales accordées. CA = Ventes de marchandises + Ventes de produits + Travaux et services + Produits accessoires.', comptesAssocies: ['70'] },
  { terme: 'Classe de comptes', definition: 'Regroupement de comptes par nature dans le plan comptable. 9 classes : 1-Capitaux, 2-Immobilisations, 3-Stocks, 4-Tiers, 5-Trésorerie, 6-Charges, 7-Produits, 8-Comptes spéciaux, 9-Analytique.' },
  { terme: 'Compte de résultat', definition: 'État financier récapitulant les produits et charges de l\'exercice, classés en activités d\'exploitation, financières et HAO, avec mise en évidence des SIG.', comptesAssocies: ['6', '7', '8'] },
  { terme: 'Comptabilité d\'engagement', definition: 'Mode de comptabilisation selon lequel les transactions sont enregistrées lorsqu\'elles se produisent, indépendamment de la date d\'encaissement ou de décaissement.' },
  { terme: 'Consolidation', definition: 'Technique comptable consistant à présenter les comptes d\'un groupe d\'entités comme s\'il s\'agissait d\'une seule entité. Trois méthodes : intégration globale, intégration proportionnelle, mise en équivalence.' },
  { terme: 'Contrôle', definition: 'Pouvoir de diriger les politiques financières et opérationnelles d\'une entité afin d\'obtenir des avantages de ses activités.' },
  { terme: 'Contrat de location-acquisition', definition: 'Contrat de location (crédit-bail) qui transfère au preneur la quasi-totalité des risques et avantages inhérents à la propriété d\'un actif. Le bien est inscrit à l\'actif du preneur.', comptesAssocies: ['17', '284'] },
  { terme: 'Coût d\'acquisition', definition: 'Prix d\'achat + droits de douane et taxes non récupérables + frais directement attribuables - rabais, remises et ristournes obtenus.' },
  { terme: 'Coût de production', definition: 'Coût d\'acquisition des matières consommées + charges directes de production + quote-part raisonnable de charges indirectes de production.' },
  { terme: 'Coût historique', definition: 'Valeur à laquelle un actif a été acquis ou produit, ou un passif a été contracté. Base d\'évaluation par défaut dans le SYSCOHADA.' },
  { terme: 'Créances', definition: 'Droits que l\'entité possède à l\'encontre de tiers qui lui doivent des sommes d\'argent. Classées en créances de l\'actif immobilisé, de l\'actif circulant ou de la trésorerie.', comptesAssocies: ['41', '42', '43', '44', '45', '46', '47'] },
  { terme: 'Crédit-bail', definition: 'Voir Contrat de location-acquisition. Opération de location d\'un bien assortie d\'une option d\'achat.', comptesAssocies: ['17'] },

  // D
  { terme: 'Dépréciation', definition: 'Constatation comptable de la perte de valeur d\'un actif lorsque sa valeur actuelle devient inférieure à sa valeur nette comptable. Réversible.', comptesAssocies: ['29', '39', '49', '59', '69'] },
  { terme: 'Dette', definition: 'Obligation certaine de l\'entité envers un tiers à échéance et montant fixés ou déterminables.', comptesAssocies: ['1', '4', '5'] },
  { terme: 'Dettes financières', definition: 'Dettes à moyen et long terme contractées auprès d\'établissements de crédit ou sur le marché financier. Font partie des ressources stables.', comptesAssocies: ['16', '17'] },
  { terme: 'Dividendes', definition: 'Part du résultat distribuée aux actionnaires. Comptabilisés en dettes lors de la décision de distribution par l\'AG.', comptesAssocies: ['465'] },
  { terme: 'Dotation aux amortissements', definition: 'Constatation comptable de la consommation des avantages économiques d\'un actif amortissable. Charge de l\'exercice non décaissable.', comptesAssocies: ['681', '68'] },

  // E
  { terme: 'EBE (Excédent Brut d\'Exploitation)', definition: 'Résultat dégagé par l\'activité courante d\'exploitation, indépendant de la politique d\'amortissement, de financement et fiscale. EBE = Valeur ajoutée - Charges de personnel.', comptesAssocies: ['XD'] },
  { terme: 'Écart de conversion', definition: 'Différence de change résultant de la conversion de créances ou dettes en devises au cours de clôture. Actif (perte latente, compte 478) ou Passif (gain latent, compte 479).', comptesAssocies: ['478', '479'] },
  { terme: 'Écart de réévaluation', definition: 'Plus-value dégagée lors de la réévaluation d\'un actif. Inscrit directement en capitaux propres (compte 106).', comptesAssocies: ['106'] },
  { terme: 'Éléments HAO', definition: 'Éléments hors activités ordinaires : produits et charges résultant d\'événements ou opérations non liés à l\'activité ordinaire et récurrente de l\'entité.' },
  { terme: 'Emprunts', definition: 'Sommes reçues de tiers en vertu de dispositions contractuelles selon lesquelles l\'entité s\'engage à rembourser le principal et payer des intérêts.', comptesAssocies: ['16'] },
  { terme: 'Entité', definition: 'Toute personne physique ou morale astreinte à la tenue d\'une comptabilité au titre du droit comptable OHADA. Être comptable autonome distinct de ses propriétaires.' },
  { terme: 'États financiers', definition: 'Ensemble de documents comptables obligatoires comprenant le Bilan, le Compte de résultat, le Tableau des flux de trésorerie et les Notes annexes (Système Normal).' },
  { terme: 'Exercice comptable', definition: 'Période de 12 mois correspondant à l\'année civile (du 1er janvier au 31 décembre), au terme de laquelle sont établis les états financiers.' },

  // F
  { terme: 'Flux de trésorerie', definition: 'Entrées et sorties de liquidités et d\'équivalents de liquidités. Classés en trois catégories : opérationnels, d\'investissement et de financement.' },
  { terme: 'Fonds commercial', definition: 'Éléments incorporels qui ne font pas l\'objet d\'une évaluation et d\'une comptabilisation séparées au bilan et qui concourent au maintien ou au développement de l\'activité. Non amortissable sauf durée d\'utilisation limitée.', comptesAssocies: ['215'] },
  { terme: 'Fonds de roulement (FR)', definition: 'Excédent des ressources stables sur l\'actif immobilisé. FR = Ressources stables - Actif immobilisé. Un FR positif signifie que les ressources stables financent l\'intégralité des immobilisations.' },
  { terme: 'Frais de développement', definition: 'Frais engagés pour l\'application de résultats de la recherche ou d\'autres connaissances à un plan ou un projet en vue de la production de matériaux, dispositifs, produits, procédés, systèmes ou services nouveaux ou sensiblement améliorés. Activables sous conditions.', comptesAssocies: ['211'] },

  // G-H
  { terme: 'Goodwill', definition: 'Voir Fonds commercial. Excédent du coût d\'acquisition sur la juste valeur des actifs nets identifiables acquis lors d\'un regroupement d\'entreprises.' },
  { terme: 'HAO (Hors Activités Ordinaires)', definition: 'Qualifie les opérations, produits et charges ne relevant pas de l\'activité ordinaire et récurrente de l\'entité. Exemple : cessions d\'immobilisations, subventions d\'équilibre, abandons de créances.', comptesAssocies: ['81', '82', '83', '84', '85', '86'] },

  // I
  { terme: 'Image fidèle', definition: 'Objectif assigné à la comptabilité et aux états financiers : représenter de façon régulière et sincère les transactions, la situation financière et le résultat de l\'entité.' },
  { terme: 'Immobilisations corporelles', definition: 'Actifs physiques détenus pour la production, la fourniture de biens ou services, la location ou l\'utilisation administrative, dont la durée d\'utilité dépasse un exercice.', comptesAssocies: ['22', '23', '24'] },
  { terme: 'Immobilisations financières', definition: 'Titres et créances destinés à être conservés durablement. Comprennent les titres de participation, titres immobilisés, prêts et créances non commerciales.', comptesAssocies: ['26', '27'] },
  { terme: 'Immobilisations incorporelles', definition: 'Actifs non monétaires sans substance physique, identifiables et contrôlés par l\'entité. Comprennent frais de développement, brevets, licences, logiciels, fonds commercial.', comptesAssocies: ['21'] },
  { terme: 'Importance significative', definition: 'Convention selon laquelle les états financiers doivent mettre en évidence tout élément susceptible d\'influencer le jugement des utilisateurs. Seuils indicatifs : 5-10% du total bilan, 10% du résultat net.' },
  { terme: 'Impôt sur le résultat', definition: 'Impôt dû par l\'entité sur son bénéfice imposable de l\'exercice. Charge de l\'exercice comptabilisée en résultat.', comptesAssocies: ['89', '44'] },

  // J-K-L
  { terme: 'Journal', definition: 'Livre comptable obligatoire dans lequel sont enregistrées chronologiquement toutes les opérations de l\'entité.' },
  { terme: 'Juste valeur', definition: 'Montant pour lequel un actif pourrait être échangé ou un passif éteint, entre parties bien informées et consentantes, dans des conditions de concurrence normale.' },
  { terme: 'Liasse fiscale', definition: 'Ensemble des états financiers et documents annexes à déposer auprès de l\'administration fiscale. Comprend le Bilan, le Compte de résultat, le TFT et les Notes annexes dans le format réglementaire.' },
  { terme: 'Livres comptables', definition: 'Documents obligatoires : livre-journal, grand livre, balance générale, livre d\'inventaire.' },
  { terme: 'Location-acquisition', definition: 'Voir Contrat de location-acquisition.' },

  // M
  { terme: 'Marge commerciale', definition: 'Différence entre les ventes de marchandises et le coût d\'achat des marchandises vendues. Premier SIG de la cascade. Pertinente uniquement pour les activités de négoce.', comptesAssocies: ['XA'] },
  { terme: 'Matériel', definition: 'Ensemble des équipements et instruments utilisés pour l\'extraction, la transformation, le façonnage, le conditionnement des matières ou fournitures, ou les prestations de services.', comptesAssocies: ['24'] },
  { terme: 'Méthode de l\'avancement', definition: 'Méthode de comptabilisation des contrats à long terme selon laquelle le chiffre d\'affaires et le résultat sont constatés au fur et à mesure de l\'avancement des travaux. Méthode préférentielle du SYSCOHADA.' },

  // N-O
  { terme: 'Notes annexes', definition: 'Partie intégrante des états financiers fournissant des informations complémentaires et explicatives. 36 notes obligatoires dans le Système Normal du SYSCOHADA.' },
  { terme: 'OHADA', definition: 'Organisation pour l\'Harmonisation en Afrique du Droit des Affaires. 17 États membres. L\'Acte uniforme relatif au droit comptable et à l\'information financière est entré en vigueur le 1er janvier 2018.' },

  // P
  { terme: 'Participation des travailleurs', definition: 'Part du résultat attribuée aux salariés dans les pays où cette obligation existe.', comptesAssocies: ['87'] },
  { terme: 'Passif', definition: 'Obligation actuelle de l\'entité résultant d\'événements passés et dont l\'extinction devrait se traduire par une sortie de ressources représentatives d\'avantages économiques.' },
  { terme: 'Passif circulant', definition: 'Dettes liées au cycle d\'exploitation ou exigibles à court terme. Comprend les dettes fournisseurs, dettes fiscales et sociales, et autres dettes.', comptesAssocies: ['40', '42', '43', '44'] },
  { terme: 'Passif éventuel', definition: 'Obligation potentielle dont l\'existence ne sera confirmée que par des événements futurs incertains, ou obligation actuelle mais sortie de ressources improbable. Non comptabilisé, mentionné en notes annexes.' },
  { terme: 'Permanence des méthodes', definition: 'Postulat selon lequel les mêmes méthodes comptables doivent être appliquées d\'un exercice à l\'autre pour assurer la comparabilité des états financiers.' },
  { terme: 'Plan comptable', definition: 'Liste méthodique des comptes classés par classe (1 à 9). Le plan comptable SYSCOHADA comprend les comptes à 2 chiffres (comptes principaux) à 4 chiffres (comptes divisionnaires).' },
  { terme: 'Plus-value de cession', definition: 'Différence positive entre le prix de cession d\'un actif et sa valeur nette comptable. Produit HAO pour les immobilisations.', comptesAssocies: ['82', '81'] },
  { terme: 'Prééminence de la réalité sur l\'apparence', definition: 'Postulat selon lequel les opérations sont enregistrées conformément à leur réalité économique, même si leur forme juridique diffère. Application limitée dans le SYSCOHADA.' },
  { terme: 'Primes liées au capital', definition: 'Différence entre la valeur d\'émission des actions et leur valeur nominale. Comprennent primes d\'émission, de fusion, d\'apport, de conversion.', comptesAssocies: ['105'] },
  { terme: 'Produits', definition: 'Accroissements d\'avantages économiques au cours de l\'exercice sous forme d\'entrées ou d\'accroissements d\'actifs, ou de diminutions de passifs, ayant pour résultat l\'augmentation des capitaux propres.', comptesAssocies: ['7'] },
  { terme: 'Produits constatés d\'avance', definition: 'Produits perçus ou comptabilisés avant que les biens ne soient livrés ou les services rendus. Passif transitoire.', comptesAssocies: ['477'] },
  { terme: 'Produits HAO', definition: 'Produits résultant d\'événements ou opérations non liés à l\'activité ordinaire. Comprennent les prix de cession d\'immobilisations, les subventions d\'équilibre.', comptesAssocies: ['82', '84', '86', '88'] },
  { terme: 'Provision', definition: 'Passif dont l\'échéance ou le montant est incertain. Constituée lorsqu\'une obligation actuelle existe, qu\'une sortie de ressources est probable et le montant estimable.', comptesAssocies: ['19', '39', '49', '59'] },
  { terme: 'Provision réglementée', definition: 'Provision ne correspondant pas à l\'objet normal d\'une provision mais résultant de dispositions légales. Classée en capitaux propres assimilés.', comptesAssocies: ['15'] },
  { terme: 'Prudence', definition: 'Convention selon laquelle les incertitudes sont prises en compte pour éviter de surévaluer les actifs ou les produits, ou de sous-évaluer les passifs ou les charges.' },

  // R
  { terme: 'Rattachement des charges aux produits', definition: 'Principe selon lequel les charges engagées pour générer des produits doivent être comptabilisées dans le même exercice que ces produits.' },
  { terme: 'Réévaluation', definition: 'Opération consistant à substituer la valeur actuelle d\'un actif à sa valeur comptable nette. L\'écart est inscrit directement en capitaux propres.', comptesAssocies: ['106'] },
  { terme: 'Report à nouveau', definition: 'Résultat ou partie de résultat des exercices précédents dont l\'affectation a été reportée. Peut être créditeur (bénéfice) ou débiteur (perte).', comptesAssocies: ['12'] },
  { terme: 'Réserves', definition: 'Bénéfices affectés durablement à l\'entité par décision des associés/actionnaires. Comprennent réserve légale, réserves statutaires, réserves facultatives.', comptesAssocies: ['11'] },
  { terme: 'Résultat de l\'exercice', definition: 'Différence entre les produits et les charges de l\'exercice. Bénéfice si positif, perte si négatif.', comptesAssocies: ['13'] },
  { terme: 'Résultat des activités ordinaires (RAO)', definition: 'Somme du résultat d\'exploitation et du résultat financier. Représente le résultat récurrent de l\'entité.', comptesAssocies: ['XG'] },
  { terme: 'Résultat d\'exploitation', definition: 'Performance de l\'activité d\'exploitation après amortissements et provisions. Résultat d\'exploitation = EBE + Reprises - Dotations.', comptesAssocies: ['XE'] },
  { terme: 'Résultat financier', definition: 'Différence entre les produits financiers et les charges financières. Reflète l\'impact de la politique de financement.', comptesAssocies: ['XF'] },
  { terme: 'Résultat HAO', definition: 'Résultat des opérations hors activités ordinaires. Produits HAO - Charges HAO.', comptesAssocies: ['XH'] },
  { terme: 'Résultat net', definition: 'Résultat final de l\'exercice après participation des travailleurs et impôt. Résultat net = RAO + Résultat HAO - Participation - Impôts.', comptesAssocies: ['XI'] },
  { terme: 'Ressources stables', definition: 'Ensemble des capitaux propres et des dettes financières à moyen et long terme. Financement permanent de l\'entité.', comptesAssocies: ['DF'] },

  // S
  { terme: 'SIG (Soldes Intermédiaires de Gestion)', definition: 'Cascade de soldes calculés à partir du Compte de résultat : marge commerciale, valeur ajoutée, EBE, résultat d\'exploitation, résultat financier, RAO, résultat HAO, résultat net.' },
  { terme: 'SMT (Système Minimal de Trésorerie)', definition: 'Système simplifié de comptabilité réservé aux très petites entités dont le CA est sous les seuils fixés par l\'OHADA. Comptabilité de caisse.' },
  { terme: 'Spécialisation des exercices', definition: 'Principe de rattachement des charges et produits à l\'exercice auquel ils se rapportent, indépendamment de leur date d\'encaissement ou de décaissement.' },
  { terme: 'Stocks', definition: 'Actifs détenus pour être vendus dans le cours normal de l\'activité, en cours de production pour une telle vente, ou sous forme de matières premières à consommer dans le processus de production.', comptesAssocies: ['31', '32', '33', '34', '35', '36', '37', '38'] },
  { terme: 'Subventions d\'investissement', definition: 'Subventions reçues pour l\'acquisition ou la création d\'immobilisations. Inscrites en capitaux propres et reprises en produits sur la durée d\'amortissement du bien financé.', comptesAssocies: ['14'] },
  { terme: 'Système Normal', definition: 'Système comptable complet applicable aux entités dont le CA dépasse les seuils fixés. Comprend 4 états financiers obligatoires et 36 notes annexes.' },
  { terme: 'SYSCOHADA', definition: 'Système Comptable OHADA. Référentiel comptable applicable dans les 17 États membres de l\'OHADA depuis le 1er janvier 2018 (version révisée).' },

  // T
  { terme: 'Tableau des flux de trésorerie (TFT)', definition: 'État financier présentant les mouvements de trésorerie classés en activités opérationnelles, d\'investissement et de financement. Méthode indirecte à partir de la CAFG.' },
  { terme: 'Terrains', definition: 'Sols et sous-sols. Les terrains nus ne sont généralement pas amortissables. Les aménagements de terrains sont amortis séparément.', comptesAssocies: ['22'] },
  { terme: 'Titres de participation', definition: 'Titres dont la possession durable est estimée utile à l\'activité de l\'entité, notamment en conférant le contrôle ou une influence notable sur la société émettrice.', comptesAssocies: ['26'] },
  { terme: 'Titres de placement', definition: 'Titres acquis en vue de réaliser un gain à brève échéance. Font partie de la trésorerie-actif.', comptesAssocies: ['50'] },
  { terme: 'Trésorerie nette', definition: 'Différence entre la trésorerie-actif et la trésorerie-passif. TN = FR - BFE - BF HAO. Résultante de l\'équilibre financier global.', comptesAssocies: ['BQ', 'DT'] },
  { terme: 'Trésorerie-actif', definition: 'Liquidités et quasi-liquidités : titres de placement, valeurs à encaisser, banques, chèques postaux et caisse.', comptesAssocies: ['50', '51', '52', '53', '54', '55', '57', '58'] },
  { terme: 'Trésorerie-passif', definition: 'Concours bancaires courants et soldes créditeurs de banque : crédits d\'escompte, crédits de trésorerie, découverts bancaires.', comptesAssocies: ['56', '52p'] },

  // V
  { terme: 'Valeur actuelle', definition: 'Valeur la plus élevée entre la valeur vénale et la valeur d\'usage d\'un actif. Utilisée pour les tests de dépréciation.' },
  { terme: 'Valeur ajoutée', definition: 'Richesse créée par l\'entité. VA = Marge commerciale + Production de l\'exercice - Consommations intermédiaires. Se répartit entre personnel, État, prêteurs, actionnaires et entité.', comptesAssocies: ['XC'] },
  { terme: 'Valeur comptable nette (VNC)', definition: 'Valeur brute d\'un actif diminuée du cumul des amortissements et des dépréciations.' },
  { terme: 'Valeur d\'usage', definition: 'Valeur des avantages économiques futurs attendus de l\'utilisation d\'un actif et de sa sortie. Généralement déterminée par actualisation des flux de trésorerie futurs.' },
  { terme: 'Valeur nette de réalisation', definition: 'Prix de vente estimé dans le cours normal de l\'activité, diminué des coûts estimés pour l\'achèvement et des coûts nécessaires pour réaliser la vente.' },
  { terme: 'Valeur résiduelle', definition: 'Montant estimé qu\'une entité obtiendrait de la cession d\'un actif à la fin de sa durée d\'utilité, après déduction des coûts de cession estimés.' },
  { terme: 'Valeur vénale', definition: 'Montant qui pourrait être obtenu de la vente d\'un actif lors d\'une transaction dans des conditions de concurrence normale.' },
  { terme: 'Variation de stocks', definition: 'Différence entre le stock final et le stock initial. Impacte le coût des marchandises vendues (classe 603) ou la production stockée (classe 73).', comptesAssocies: ['603', '73'] },
]

/**
 * Recherche une définition par terme (recherche insensible à la casse et aux accents)
 */
export function searchDefinition(terme: string): DefinitionSYSCOHADA | undefined {
  const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const normalized = normalize(terme)
  return DEFINITIONS_SYSCOHADA.find(d => normalize(d.terme) === normalized)
}

/**
 * Recherche des définitions par mot-clé dans le terme ou la définition
 */
export function searchDefinitions(keyword: string): DefinitionSYSCOHADA[] {
  const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const normalized = normalize(keyword)
  return DEFINITIONS_SYSCOHADA.filter(d =>
    normalize(d.terme).includes(normalized) ||
    normalize(d.definition).includes(normalized)
  )
}
