/**
 * Cadre Conceptuel SYSCOHADA Révisé
 * Titre V (p.68-140)
 * Principes comptables, conventions, règles d'évaluation,
 * caractéristiques qualitatives et éléments des états financiers
 */

export interface PostulatComptable {
  code: string
  nom: string
  description: string
  details: string[]
}

export interface ConventionComptable {
  code: string
  nom: string
  description: string
  details: string[]
}

export interface RegleEvaluation {
  code: string
  nom: string
  description: string
  details: string[]
}

export interface CaracteristiqueQualitative {
  code: string
  nom: string
  description: string
}

export interface ElementEtatFinancier {
  code: string
  nom: string
  definition: string
  criteres?: string[]
}

// ─── Objectifs du cadre conceptuel ───────────────────────────────────────────

export const OBJECTIFS_CADRE_CONCEPTUEL = [
  'Définir les concepts fondamentaux qui sous-tendent la préparation et la présentation des états financiers.',
  'Aider les normalisateurs à développer les normes comptables.',
  'Aider les préparateurs des états financiers à appliquer les normes et à traiter les sujets non couverts.',
  'Aider les auditeurs à se former une opinion sur la conformité des états financiers.',
  'Aider les utilisateurs à interpréter les informations contenues dans les états financiers.',
]

// ─── Champ d'application ─────────────────────────────────────────────────────

export const CHAMP_APPLICATION = {
  entitesVisees: 'Toute entité (personne physique ou morale) astreinte à la tenue d\'une comptabilité dans l\'espace OHADA (17 États membres).',
  systemes: [
    { code: 'NORMAL', description: 'Système Normal : entités dont le CA dépasse les seuils fixés. États financiers complets (Bilan, CR, TFT, Notes annexes avec 36 notes).', },
    { code: 'SMT', description: 'Système Minimal de Trésorerie : très petites entités sous les seuils. Bilan simplifié et CR simplifié.', },
  ],
  casParticuliers: [
    'Entités à but non lucratif (associations, fondations, ONG) : adaptation des comptes de capitaux propres.',
    'Entités d\'Intérêt Public (EIP) : obligations de publication renforcées.',
    'Comptes consolidés et comptes combinés : traités au Titre X.',
  ],
}

// ─── Postulats comptables ────────────────────────────────────────────────────

export const POSTULATS: PostulatComptable[] = [
  {
    code: 'P1',
    nom: 'Postulat de l\'entité',
    description: 'L\'entité est considérée comme un être comptable autonome et distinct de ses propriétaires.',
    details: [
      'L\'entité est un périmètre au regard duquel les transactions sont analysées.',
      'Le patrimoine de l\'entité est distinct de celui de ses propriétaires ou associés.',
      'Seuls les événements qui concernent l\'entité sont comptabilisés.',
    ],
  },
  {
    code: 'P2',
    nom: 'Comptabilité d\'engagement (ou d\'exercice)',
    description: 'Les effets des transactions et autres événements sont comptabilisés quand ces transactions ou événements se produisent et non pas lorsqu\'intervient le règlement.',
    details: [
      'Les produits sont comptabilisés lorsqu\'ils sont acquis.',
      'Les charges sont comptabilisées lorsqu\'elles sont engagées.',
      'Exception : le Système Minimal de Trésorerie utilise une comptabilité de caisse.',
    ],
  },
  {
    code: 'P3',
    nom: 'Spécialisation des exercices (ou indépendance)',
    description: 'Les charges et les produits sont rattachés à l\'exercice qui les concerne, indépendamment de leur date de paiement ou d\'encaissement.',
    details: [
      'Les charges à payer et produits à recevoir sont rattachés à l\'exercice concerné.',
      'Les charges constatées d\'avance et produits constatés d\'avance sont reportés.',
      'La durée de l\'exercice est de 12 mois, coïncidant avec l\'année civile.',
    ],
  },
  {
    code: 'P4',
    nom: 'Permanence des méthodes',
    description: 'La cohérence et la comparabilité des informations comptables au cours des périodes successives impliquent une permanence des méthodes.',
    details: [
      'Changement de méthode comptable : changement de règle ou de modalité d\'application. Comptabilisé de manière rétrospective (impact sur capitaux propres d\'ouverture, retraitement N-1).',
      'Changement d\'estimation comptable : révision d\'une estimation (durée de vie, valeur résiduelle). Comptabilisé de manière prospective, impact sur l\'exercice en cours et suivants.',
      'Changement d\'option fiscale : application prospective, pas de retraitement rétrospectif.',
      'Correction d\'erreurs : comptabilisée comme un changement de méthode (ajustement des capitaux propres d\'ouverture), avec mention en Notes annexes.',
    ],
  },
  {
    code: 'P5',
    nom: 'Prééminence de la réalité économique sur l\'apparence juridique',
    description: 'Les opérations doivent être enregistrées en conformité avec leur nature et leur réalité financière et économique.',
    details: [
      'Application limitée à 4 cas dans le SYSCOHADA révisé :',
      '1. Inscription à l\'actif des biens détenus en crédit-bail (contrat de location-acquisition).',
      '2. Inscription à l\'actif des biens détenus avec clause de réserve de propriété.',
      '3. Inscription à l\'actif des effets remis à l\'escompte et non échus.',
      '4. Comptabilisation des concessions de service public.',
    ],
  },
]

// ─── Conventions comptables ──────────────────────────────────────────────────

export const CONVENTIONS: ConventionComptable[] = [
  {
    code: 'C1',
    nom: 'Convention du coût historique',
    description: 'Les éléments d\'actif, de passif, de charges et de produits sont enregistrés en comptabilité et présentés dans les états financiers au coût historique, c\'est-à-dire sur la base de leur valeur à la date de leur constatation.',
    details: [
      'Le coût historique est le coût d\'acquisition ou de production à la date d\'entrée.',
      'Exception : la réévaluation libre ou légale des immobilisations corporelles et financières est autorisée.',
      'La juste valeur n\'est pas utilisée comme base d\'évaluation courante dans le SYSCOHADA.',
    ],
  },
  {
    code: 'C2',
    nom: 'Convention de prudence',
    description: 'Appréciation raisonnable des faits dans des conditions d\'incertitude, afin d\'éviter le risque de transférer sur des périodes futures des incertitudes présentes.',
    details: [
      'Les plus-values latentes ne sont pas comptabilisées.',
      'Les moins-values latentes sont toujours provisionnées (dépréciation).',
      'Les provisions pour risques et charges doivent être constituées dès que le risque existe.',
      'Les produits ne sont comptabilisés que s\'ils sont certains.',
      'Les charges sont comptabilisées dès qu\'elles sont probables.',
    ],
  },
  {
    code: 'C3',
    nom: 'Convention de régularité et de transparence',
    description: 'La régularité est la conformité aux règles et procédures en vigueur. La transparence est l\'information complète de l\'utilisateur.',
    details: [
      'Conformité aux dispositions de l\'Acte uniforme et du SYSCOHADA.',
      'Présentation claire et loyale des états financiers.',
      'Toute information significative doit être communiquée dans les Notes annexes.',
      'Les compensations entre actifs et passifs ou entre charges et produits ne sont pas admises.',
    ],
  },
  {
    code: 'C4',
    nom: 'Convention de la correspondance bilan de clôture – bilan d\'ouverture',
    description: 'Le bilan d\'ouverture d\'un exercice correspond au bilan de clôture de l\'exercice précédent.',
    details: [
      'Intangibilité du bilan d\'ouverture.',
      'Garantit la continuité et la cohérence entre exercices successifs.',
      'Tout ajustement d\'erreur passée affecte les capitaux propres d\'ouverture (report à nouveau).',
    ],
  },
  {
    code: 'C5',
    nom: 'Convention de l\'importance significative',
    description: 'Les états financiers doivent mettre en évidence tout élément dont l\'importance peut affecter les évaluations et les décisions.',
    details: [
      'Seuils indicatifs d\'importance significative :',
      '- 5 à 10% du total du bilan.',
      '- 10 à 20% de la variation d\'un poste d\'un exercice à l\'autre.',
      '- 10% du résultat net.',
      'L\'importance significative est une question de jugement professionnel.',
      'Les informations non significatives peuvent être regroupées.',
    ],
  },
]

// ─── Hypothèses de base ──────────────────────────────────────────────────────

export const HYPOTHESES_DE_BASE = [
  { code: 'H1', nom: 'Continuité d\'exploitation', description: 'L\'entité est présumée poursuivre ses activités dans un avenir prévisible. Si cette hypothèse n\'est pas retenue, les états financiers sont établis en valeurs liquidatives avec mention explicite.' },
  { code: 'H2', nom: 'Comptabilité d\'engagement', description: 'Les transactions sont comptabilisées au moment où elles se produisent, indépendamment des flux de trésorerie.' },
  { code: 'H3', nom: 'Rattachement des charges aux produits', description: 'Les charges engagées pour générer des produits sont comptabilisées dans le même exercice que ces produits.' },
  { code: 'H4', nom: 'Permanence des méthodes', description: 'Les méthodes comptables sont appliquées de manière cohérente d\'un exercice à l\'autre.' },
  { code: 'H5', nom: 'Unité monétaire', description: 'La comptabilité est tenue dans la monnaie ayant cours légal dans le pays (FCFA pour la zone UEMOA/CEMAC, ou autre monnaie nationale).' },
]

// ─── Caractéristiques qualitatives ───────────────────────────────────────────

export const CARACTERISTIQUES_QUALITATIVES: CaracteristiqueQualitative[] = [
  { code: 'Q1', nom: 'Pertinence', description: 'L\'information est pertinente lorsqu\'elle influence les décisions économiques des utilisateurs en les aidant à évaluer des événements passés, présents ou futurs, ou en confirmant ou corrigeant leurs évaluations passées.' },
  { code: 'Q2', nom: 'Fidélité (fiabilité)', description: 'L\'information est fiable lorsqu\'elle est exempte d\'erreurs et de biais significatifs et que les utilisateurs peuvent lui faire confiance pour représenter ce qu\'elle est censée représenter (image fidèle).' },
  { code: 'Q3', nom: 'Comparabilité', description: 'Les utilisateurs doivent pouvoir comparer les états financiers d\'une entité au cours du temps et avec ceux d\'autres entités. La permanence des méthodes et la présentation de chiffres comparatifs N-1 concourent à la comparabilité.' },
  { code: 'Q4', nom: 'Vérifiabilité', description: 'L\'information est vérifiable lorsque des observateurs indépendants et compétents aboutiraient à un consensus sur sa fidélité.' },
  { code: 'Q5', nom: 'Rapidité (célérité)', description: 'L\'information doit être disponible en temps utile pour être utilisable dans la prise de décision. Le délai d\'établissement est de 4 mois après la clôture.' },
  { code: 'Q6', nom: 'Compréhensibilité (intelligibilité)', description: 'L\'information doit être compréhensible pour des utilisateurs ayant une connaissance raisonnable des affaires et de la comptabilité.' },
  { code: 'Q7', nom: 'Équilibre coût-avantage', description: 'Les avantages tirés de l\'information doivent être supérieurs au coût qu\'il a fallu consentir pour la produire.' },
]

// ─── Éléments des états financiers ───────────────────────────────────────────

export const ELEMENTS_ETATS_FINANCIERS: ElementEtatFinancier[] = [
  // Éléments du Bilan
  {
    code: 'E_ACTIF',
    nom: 'Actif',
    definition: 'Élément identifiable du patrimoine de l\'entité ayant une valeur économique positive, c\'est-à-dire générant une ressource que l\'entité contrôle du fait d\'événements passés et dont elle attend des avantages économiques futurs.',
    criteres: [
      'Identifiabilité : séparable ou résultant de droits contractuels/légaux.',
      'Contrôle : pouvoir d\'obtenir les avantages économiques futurs.',
      'Avantages économiques futurs : potentiel de contribuer aux flux de trésorerie.',
    ],
  },
  {
    code: 'E_IMMO_INCORP',
    nom: 'Immobilisations incorporelles',
    definition: 'Actif non monétaire sans substance physique, détenu pour la production, la fourniture de biens ou services, la location ou l\'utilisation à des fins administratives.',
    criteres: ['Durée d\'utilisation > 12 mois.', 'Valeur identifiable et mesurable de manière fiable.', 'Frais de développement activables sous conditions strictes.', 'Fonds commercial : non amortissable sauf durée limitée.'],
  },
  {
    code: 'E_IMMO_CORP',
    nom: 'Immobilisations corporelles',
    definition: 'Actif physique détenu pour la production, la fourniture de biens ou services, la location ou l\'utilisation à des fins administratives, et dont la durée d\'utilisation dépasse un exercice.',
    criteres: ['Composants significatifs comptabilisés séparément (approche par composants).', 'Amortissement sur la durée d\'utilité.', 'Les terrains ne sont généralement pas amortis.'],
  },
  {
    code: 'E_STOCKS',
    nom: 'Stocks',
    definition: 'Actifs détenus pour être vendus dans le cours normal de l\'activité, en cours de production pour une telle vente, ou sous forme de matières ou fournitures devant être consommées dans le processus de production ou de prestation de services.',
    criteres: ['Évaluation au coût d\'acquisition ou de production.', 'À la clôture : au plus bas du coût et de la valeur nette de réalisation.', 'Méthodes autorisées : PEPS (FIFO) ou CUMP.'],
  },
  {
    code: 'E_CHARGES_AVANCE',
    nom: 'Charges constatées d\'avance',
    definition: 'Charges enregistrées au cours de l\'exercice mais qui correspondent à des achats de biens ou services dont la fourniture ou la prestation interviendra ultérieurement.',
  },
  {
    code: 'E_ACTIF_EVENTUEL',
    nom: 'Actif éventuel',
    definition: 'Actif potentiel résultant d\'événements passés et dont l\'existence ne sera confirmée que par la survenance d\'un ou plusieurs événements futurs incertains.',
    criteres: ['Non comptabilisé au bilan.', 'Mentionné dans les Notes annexes si l\'entrée d\'avantages économiques est probable.'],
  },
  {
    code: 'E_PASSIF',
    nom: 'Passif',
    definition: 'Obligation actuelle de l\'entité résultant d\'événements passés et dont l\'extinction devrait se traduire par une sortie de ressources représentatives d\'avantages économiques.',
  },
  {
    code: 'E_CAP_PROPRES',
    nom: 'Capitaux propres',
    definition: 'Intérêt résiduel dans les actifs de l\'entité après déduction de tous ses passifs. Comprennent le capital, les réserves, le report à nouveau, le résultat et les subventions d\'investissement.',
  },
  {
    code: 'E_PASSIF_EXT',
    nom: 'Passif externe',
    definition: 'Obligations de l\'entité envers des tiers. Comprend les dettes financières, les dettes d\'exploitation, les dettes HAO et la trésorerie-passif.',
  },
  {
    code: 'E_DETTE',
    nom: 'Dette',
    definition: 'Obligation certaine de l\'entité, à échéance et montant déterminés ou déterminables.',
    criteres: ['Obligation juridique ou implicite.', 'Montant fiable.', 'Classement par nature et par échéance.'],
  },
  {
    code: 'E_PROVISION',
    nom: 'Provision',
    definition: 'Passif dont l\'échéance ou le montant est incertain. Constituée lorsqu\'il existe une obligation actuelle, qu\'une sortie de ressources est probable et que le montant peut être estimé de manière fiable.',
    criteres: [
      'Obligation actuelle (juridique ou implicite) résultant d\'un événement passé.',
      'Sortie de ressources probable (> 50%).',
      'Estimation fiable du montant.',
      'Provision pour risques : litige, garantie, restructuration.',
      'Provision pour charges : gros entretien, remise en état.',
    ],
  },
  {
    code: 'E_PASSIF_EVENTUEL',
    nom: 'Passif éventuel',
    definition: 'Obligation potentielle résultant d\'événements passés dont l\'existence ne sera confirmée que par la survenance d\'événements futurs incertains, ou obligation actuelle pour laquelle une sortie de ressources n\'est pas probable ou dont le montant ne peut être évalué avec fiabilité.',
    criteres: ['Non comptabilisé au bilan.', 'Mentionné dans les Notes annexes.'],
  },
  // Éléments du Compte de Résultat
  {
    code: 'E_CHARGES',
    nom: 'Charges',
    definition: 'Diminutions d\'avantages économiques au cours de l\'exercice, sous forme de sorties ou de diminutions d\'actifs, ou de survenance de passifs, qui ont pour résultat de diminuer les capitaux propres autrement que par des distributions aux participants aux capitaux propres.',
  },
  {
    code: 'E_PRODUITS',
    nom: 'Produits',
    definition: 'Accroissements d\'avantages économiques au cours de l\'exercice, sous forme d\'entrées ou d\'accroissements d\'actifs, ou de diminutions de passifs, qui ont pour résultat l\'augmentation des capitaux propres autrement que par des contributions des participants aux capitaux propres.',
  },
  {
    code: 'E_RESULTAT',
    nom: 'Résultat net',
    definition: 'Différence entre les produits et les charges de l\'exercice. Il est positif (bénéfice) ou négatif (perte). Il figure au passif du bilan et au bas du Compte de résultat.',
  },
  // États financiers
  {
    code: 'EF_BILAN',
    nom: 'Bilan',
    definition: 'État financier qui décrit séparément les éléments d\'actif et les éléments de passif à la date de clôture. Il fait apparaître de façon distincte les capitaux propres. Présenté avant répartition du résultat.',
  },
  {
    code: 'EF_CR',
    nom: 'Compte de résultat',
    definition: 'État financier récapitulant les charges et les produits de l\'exercice, classés en activités ordinaires (exploitation + financier) et hors activités ordinaires (HAO). Présenté en liste avec SIG.',
  },
  {
    code: 'EF_TFT',
    nom: 'Tableau des flux de trésorerie',
    definition: 'État financier présentant les entrées et sorties de trésorerie classées en trois catégories : activités opérationnelles, activités d\'investissement et activités de financement.',
  },
  {
    code: 'EF_NOTES',
    nom: 'Notes annexes',
    definition: 'Ensemble d\'informations complémentaires, explicatives et supplémentaires aux autres états financiers. 36 notes obligatoires dans le Système Normal.',
  },
]

// ─── Règles d'évaluation ─────────────────────────────────────────────────────

export const REGLES_EVALUATION: RegleEvaluation[] = [
  {
    code: 'RE1',
    nom: 'Valeur d\'entrée',
    description: 'Valeur à laquelle un élément est inscrit en comptabilité lors de sa première constatation.',
    details: [
      'Acquisition à titre onéreux : coût d\'acquisition.',
      'Production par l\'entité : coût de production.',
      'Acquisition à titre gratuit : juste valeur.',
      'Échange : juste valeur de la contrepartie donnée ou reçue.',
    ],
  },
  {
    code: 'RE2',
    nom: 'Coût d\'acquisition des immobilisations',
    description: 'Prix d\'achat + droits de douane + taxes non récupérables + frais directement attribuables à la mise en service - remises et rabais.',
    details: [
      'Inclut les coûts de démantèlement et de remise en état (si obligation).',
      'Les frais d\'acquisition (honoraires, commissions, droits de mutation) sont inclus dans le coût d\'acquisition.',
      'Les escomptes de règlement sont exclus (produit financier).',
    ],
  },
  {
    code: 'RE3',
    nom: 'Coût de production',
    description: 'Coût d\'acquisition des matières consommées + charges directes de production + quote-part de charges indirectes de production.',
    details: [
      'Les charges indirectes de production sont incorporées dans la mesure où elles se rapportent à la période de production.',
      'Sont exclus : les charges d\'administration générale, les charges de commercialisation, les charges de sous-activité, les charges financières (sauf conditions spécifiques).',
    ],
  },
  {
    code: 'RE4',
    nom: 'Coûts d\'emprunt',
    description: 'Les coûts d\'emprunt directement attribuables à l\'acquisition ou la production d\'un actif qualifié peuvent être incorporés dans le coût de cet actif.',
    details: [
      'Actif qualifié : actif exigeant une longue période de préparation avant utilisation ou vente.',
      'Option comptable : incorporation ou charge de l\'exercice.',
      'Si incorporation : uniquement pendant la période de production/construction.',
    ],
  },
  {
    code: 'RE5',
    nom: 'Évaluation des stocks',
    description: 'Les stocks sont évalués au coût d\'acquisition ou de production. Deux méthodes autorisées pour les sorties.',
    details: [
      'PEPS (FIFO) : Premier Entré, Premier Sorti.',
      'CUMP : Coût Unitaire Moyen Pondéré (calculé après chaque entrée ou sur la période).',
      'DEPS (LIFO) : interdit par le SYSCOHADA révisé.',
      'À la clôture : évaluation au plus bas du coût et de la valeur nette de réalisation.',
    ],
  },
  {
    code: 'RE6',
    nom: 'Valeur actuelle (valeur d\'inventaire)',
    description: 'Valeur la plus élevée entre la valeur vénale et la valeur d\'usage à la date d\'évaluation.',
    details: [
      'Valeur vénale : prix de vente estimé diminué des coûts de cession.',
      'Valeur d\'usage : valeur des avantages économiques futurs attendus de l\'utilisation.',
      'Utilisée à la clôture pour tester les dépréciations.',
    ],
  },
  {
    code: 'RE7',
    nom: 'Amortissement',
    description: 'Répartition systématique du montant amortissable d\'un actif sur sa durée d\'utilité.',
    details: [
      'Base amortissable = coût d\'entrée - valeur résiduelle.',
      'Méthodes autorisées : linéaire (par défaut), dégressif, unités de production, tout autre mode reflétant le rythme de consommation.',
      'L\'amortissement commence à la date de mise en service.',
      'Les terrains ne sont pas amortis (sauf terrains de gisement).',
      'Plan d\'amortissement révisable si changement significatif d\'estimation.',
    ],
  },
  {
    code: 'RE8',
    nom: 'Dépréciation',
    description: 'Constatation que la valeur actuelle d\'un actif est devenue inférieure à sa valeur nette comptable.',
    details: [
      'Test de dépréciation à chaque clôture si indice de perte de valeur.',
      'Dépréciation = VNC - Valeur actuelle (si VNC > Valeur actuelle).',
      'Réversible : reprise si les conditions de dépréciation disparaissent.',
      'Pour le fonds commercial : test annuel obligatoire.',
    ],
  },
  {
    code: 'RE9',
    nom: 'Provisions',
    description: 'Passif dont l\'échéance ou le montant est incertain.',
    details: [
      'Trois conditions cumulatives : obligation actuelle, sortie probable de ressources, estimation fiable.',
      'Évaluation à la meilleure estimation de la dépense nécessaire à l\'extinction de l\'obligation.',
      'Réexamen à chaque clôture et ajustement si nécessaire.',
      'Provisions réglementées : provisions ne correspondant pas à l\'objet normal d\'une provision (avantage fiscal). Comptabilisées en capitaux propres assimilés.',
    ],
  },
  {
    code: 'RE10',
    nom: 'Comptabilisation des produits',
    description: 'Les produits sont comptabilisés lorsque les conditions de leur acquisition sont réunies.',
    details: [
      'Vente de biens : transfert des risques et avantages, montant fiable, recouvrement probable.',
      'Prestations de services : méthode de l\'avancement si le résultat peut être estimé de façon fiable.',
      'Contrats à long terme : méthode de l\'avancement (préférentielle) ou méthode à l\'achèvement.',
      'Intérêts, redevances, dividendes : comptabilisés lorsque le droit est établi.',
    ],
  },
  {
    code: 'RE11',
    nom: 'Opérations en monnaies étrangères',
    description: 'Les transactions en devises sont converties au cours du jour de la transaction. À la clôture, les éléments monétaires sont convertis au cours de clôture.',
    details: [
      'Écarts de conversion-Actif : perte latente, provision obligatoire.',
      'Écarts de conversion-Passif : gain latent, non comptabilisé en résultat.',
      'Gains et pertes de change réalisés : comptabilisés en résultat financier.',
    ],
  },
  {
    code: 'RE12',
    nom: 'Contrats de location-acquisition (crédit-bail)',
    description: 'Les biens en location-acquisition sont inscrits à l\'actif du preneur et amortis sur la durée du contrat.',
    details: [
      'Application du principe de prééminence de la réalité économique.',
      'Actif : valeur actualisée des paiements minimaux ou juste valeur si inférieure.',
      'Passif : dette de location-acquisition (compte 17).',
      'Charges : amortissement de l\'actif + intérêts financiers.',
    ],
  },
]
