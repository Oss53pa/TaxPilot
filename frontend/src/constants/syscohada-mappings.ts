/**
 * Source de vérité unique — Mappings SYSCOHADA Révisé 2017
 * Référence officielle : OHADA, Acte Uniforme portant organisation
 * et harmonisation des comptabilités des entreprises, révisé 2017.
 *
 * RÈGLE : Toute modification de mapping doit être faite ICI UNIQUEMENT.
 * Ne jamais déclarer de tableau de comptes dans les composants ou stores.
 *
 * Dernière vérification : 2026-03-28
 */

export interface PosteMapping {
  readonly comptes: readonly string[]
  readonly libelle: string
}

export interface ActifPosteMapping extends PosteMapping {
  readonly amort: readonly string[]
}

// ────────────────────────────────────────────────────────────────────────────
// BILAN — ACTIF
// ────────────────────────────────────────────────────────────────────────────

export const BILAN_ACTIF = {
  // Immobilisations incorporelles
  // '2810'/'2910' : capte l'amort/dépréciation incorporel SAISI AU NIVEAU PARENT
  // (compte 281000/291000 global) sans collision avec les sous-comptes 2811-2819
  // ventilés en AF/AG/AH (4e caractère distinct). Sinon orphelin → bilan déséquilibré.
  AE: { comptes: ['211', '212'], amort: ['2811', '2812', '2911', '2912'], libelle: 'Frais de développement et de prospection' },
  AF: { comptes: ['213', '214', '215'], amort: ['2813', '2814', '2815', '2913', '2914', '2915'], libelle: 'Brevets, licences, logiciels, et droits similaires' },
  AG: { comptes: ['216'], amort: ['2816', '2916'], libelle: 'Fonds commercial et droit au bail' },
  AH: { comptes: ['217', '218', '219'], amort: ['2817', '2818', '2819', '2917', '2918', '2919'], libelle: 'Autres immobilisations incorporelles' },
  // Immobilisations corporelles
  // '2810'/'2910' (amort incorporel GÉNÉRIQUE 281000, non ventilé) rattachés au
  // pool corporel : ils sont réétalés au prorata du brut (cf computeAllValues),
  // évitant de sur-amortir les incorporels qui gardent leurs amort spécifiques.
  AJ: { comptes: ['22'], amort: ['282', '292', '2810', '2910'], libelle: 'Terrains' },
  AK: { comptes: ['231', '232', '233', '234'], amort: ['2831', '2832', '2833', '2834', '2931', '2932', '2933', '2934'], libelle: 'Bâtiments' },
  AL: { comptes: ['235', '237', '238'], amort: ['2835', '2837', '2838', '2935', '2937', '2938'], libelle: 'Aménagements, agencements et installations' },
  // Tout le matériel 24x SAUF 245 (transport → AN). 246/247/248 inclus pour
  // parité avec le moteur écran (sinon "Mobilier Food Court" 248x & co orphelins).
  AM: { comptes: ['241', '242', '243', '244', '246', '247', '248'], amort: ['2841', '2842', '2843', '2844', '2846', '2847', '2848', '2941', '2942', '2943', '2944', '2946', '2947', '2948'], libelle: 'Matériel, mobilier et actifs biologiques' },
  AN: { comptes: ['245'], amort: ['2845', '2945'], libelle: 'Matériel de transport' },
  // Avances et acomptes
  AP: { comptes: ['251', '252'], amort: [], libelle: 'Avances et acomptes versés sur immobilisations' },
  // Immobilisations financières
  AR: { comptes: ['26'], amort: ['296'], libelle: 'Titres de participation' },
  AS: { comptes: ['271', '272', '273', '274', '275', '276', '277'], amort: ['297'], libelle: 'Autres immobilisations financières' },
  // Actif circulant HAO
  BA: { comptes: ['485', '486', '487', '488'], amort: ['498'], libelle: 'Actif circulant HAO' },
  // Stocks
  BB: { comptes: ['31', '32', '33', '34', '35', '36', '37', '38'], amort: ['391', '392', '393', '394', '395', '396', '397', '398'], libelle: 'Stocks et encours' },
  // Créances
  BH: { comptes: ['409'], amort: ['490'], libelle: 'Fournisseurs avances versées' },
  BI: { comptes: ['411', '412', '413', '414', '415', '416', '418'], amort: ['491'], libelle: 'Clients' },
  // '42' inclus : un solde DÉBITEUR sur la classe 42 (ex. 422 avance/trop-versé au
  // personnel) est une créance → actif. Symétrique du passif DM (42 créditeur).
  // getActifBrut ne retient que les soldes débiteurs → pas de double-comptage.
  // Sans '42' ici, ces avances disparaissaient de l'actif export (≠ écran).
  BJ: { comptes: ['42', '43', '44', '45', '46', '47'], amort: ['492', '493', '494', '495', '496', '497'], libelle: 'Autres créances' },
  // Trésorerie actif
  BQ: { comptes: ['50'], amort: ['590'], libelle: 'Titres de placement' },
  BR: { comptes: ['51'], amort: ['591'], libelle: 'Valeurs à encaisser' },
  BS: { comptes: ['52', '53', '54', '55', '56', '57', '58'], amort: ['592', '593', '594'], libelle: 'Banques, chèques postaux, caisse et assimilés' },
  // Ecart de conversion
  BU: { comptes: ['478'], amort: [], libelle: 'Ecart de conversion-Actif' },
} as const satisfies Record<string, ActifPosteMapping>

// Totaux actif (refs calculés, pas de comptes directs)
export const BILAN_ACTIF_TOTAUX = {
  AD: { refs: ['AE', 'AF', 'AG', 'AH'], libelle: 'IMMOBILISATIONS INCORPORELLES' },
  AI: { refs: ['AJ', 'AK', 'AL', 'AM', 'AN'], libelle: 'IMMOBILISATIONS CORPORELLES' },
  AQ: { refs: ['AR', 'AS'], libelle: 'IMMOBILISATIONS FINANCIERES' },
  AZ: { refs: ['AD', 'AI', 'AP', 'AQ'], libelle: 'TOTAL ACTIF IMMOBILISE' },
  BG: { refs: ['BH', 'BI', 'BJ'], libelle: 'CREANCES ET EMPLOIS ASSIMILES' },
  BK: { refs: ['BA', 'BB', 'BG'], libelle: 'TOTAL ACTIF CIRCULANT' },
  BT: { refs: ['BQ', 'BR', 'BS'], libelle: 'TOTAL TRESORERIE-ACTIF' },
  BZ: { refs: ['AZ', 'BK', 'BT', 'BU'], libelle: 'TOTAL GENERAL' },
} as const

// ────────────────────────────────────────────────────────────────────────────
// BILAN — PASSIF
// ────────────────────────────────────────────────────────────────────────────

export const BILAN_PASSIF = {
  CA: { comptes: ['101', '102', '103'], libelle: 'Capital' },
  CB: { comptes: ['109'], libelle: 'Apporteurs capital non appelé (-)', special: 'debit' as const },
  CD: { comptes: ['104', '105'], libelle: 'Primes liées au capital social' },
  CE: { comptes: ['106'], libelle: 'Ecarts de réévaluation' },
  CF: { comptes: ['111', '112'], libelle: 'Réserves indisponibles' },
  CG: { comptes: ['113', '118'], libelle: 'Réserves libres' },
  CH: { comptes: ['12'], libelle: 'Report à nouveau (+ ou -)', special: 'signed' as const },
  CJ: { comptes: ['13'], libelle: 'Résultat net de l\'exercice', special: 'signed' as const },
  CL: { comptes: ['14'], libelle: 'Subventions d\'investissement' },
  CM: { comptes: ['15'], libelle: 'Provisions réglementées' },
  // Dettes financières — Classe 16 complète (161 à 168 inclus 167)
  DA: { comptes: ['161', '162', '163', '164', '165', '166', '167', '168'], libelle: 'Emprunts et dettes financières diverses' },
  DB: { comptes: ['17'], libelle: 'Dettes de location-acquisition' },
  DC: { comptes: ['19'], libelle: 'Provisions pour risques et charges' },
  // Passif circulant
  DH: { comptes: ['481', '482', '483', '484'], libelle: 'Dettes circulantes HAO' },
  DI: { comptes: ['419'], libelle: 'Clients, avances reçues' },
  DJ: { comptes: ['401', '402', '403', '404', '405', '408'], libelle: 'Fournisseurs d\'exploitation' },
  DK: { comptes: ['43', '44'], libelle: 'Dettes fiscales et sociales' },
  // DM "Autres dettes" : classe 42 (personnel rémunérations dues) + 46x (associés créditeurs)
  // + 47x (créditeurs divers) — tous classés ici quand solde créditeur (filtre fait par getPassif).
  // Symétriquement, BILAN_ACTIF.BJ contient 46/47 pour capter leur version débitrice.
  // Sans 46/47 ici, les comptes courants associés créditeurs et 477 (produits constatés
  // d'avance) disparaissent du bilan → déséquilibre Total Actif / Total Passif.
  DM: { comptes: ['421', '422', '423', '424', '425', '426', '427', '428', '46', '47'], libelle: 'Autres dettes' },
  DN: { comptes: ['499'], libelle: 'Provisions pour risques et charges à court terme' },
  // Trésorerie passif
  DQ: { comptes: ['565'], libelle: 'Banques, crédits d\'escompte' },
  // 53/54/55/57/58 : comptes de trésorerie à double nature, portés en BS côté
  // ACTIF quand débiteurs. Leur solde CRÉDITEUR (ex. carte 554 à découvert)
  // n'avait aucune ligne passif → perdu → bilan déséquilibré. getPassif ne retient
  // que les soldes créditeurs → pas de double-comptage avec BS (sens opposé).
  DR: { comptes: ['52', '53', '54', '55', '561', '564', '57', '58'], libelle: 'Banques, établissements financiers et crédits de trésorerie' },
  // Ecart de conversion
  DV: { comptes: ['479'], libelle: 'Ecart de conversion-Passif' },
} as const

export const BILAN_PASSIF_TOTAUX = {
  CP: { refs: ['CA', '-CB', 'CD', 'CE', 'CF', 'CG', 'CH', 'CJ', 'CL', 'CM'], libelle: 'TOTAL CAPITAUX PROPRES ET RESSOURCES ASSIMILEES' },
  DD: { refs: ['DA', 'DB', 'DC'], libelle: 'TOTAL DETTES FINANCIERES ET RESSOURCES ASSIMILEES' },
  DF: { refs: ['CP', 'DD'], libelle: 'TOTAL RESSOURCES STABLES' },
  DP: { refs: ['DH', 'DI', 'DJ', 'DK', 'DM', 'DN'], libelle: 'TOTAL PASSIF CIRCULANT' },
  DT: { refs: ['DQ', 'DR'], libelle: 'TOTAL TRESORERIE-PASSIF' },
  DZ: { refs: ['DF', 'DP', 'DT', 'DV'], libelle: 'TOTAL GENERAL' },
} as const

// ────────────────────────────────────────────────────────────────────────────
// COMPTE DE RESULTAT
// ────────────────────────────────────────────────────────────────────────────

// SYSCOHADA Révisé 2017 — Classe 78/79 :
// 781 = Transferts de charges d'exploitation → poste TI uniquement
// 791 = Reprises de provisions d'exploitation → poste TJ uniquement (ne pas dupliquer dans TI)
// 797 = Reprises de provisions financières → poste TL uniquement (ne pas dupliquer dans TJ)
// 798 = Reprises d'amortissements → poste TJ
// 799 = Reprises de dépréciations → poste TJ

export const COMPTE_RESULTAT_MAPPING = {
  // Activité d'exploitation — Produits
  TA: { comptes: ['701'], libelle: 'Ventes de marchandises' },
  TB: { comptes: ['702', '703', '704'], libelle: 'Ventes de produits fabriqués' },
  TC: { comptes: ['705', '706', '707'], libelle: 'Travaux, services vendus' },
  TD: { comptes: ['708'], libelle: 'Produits accessoires' },
  TE: { comptes: ['73'], libelle: 'Production stockée (ou déstockage)' },
  TF: { comptes: ['72'], libelle: 'Production immobilisée' },
  TG: { comptes: ['71'], libelle: 'Subventions d\'exploitation' },
  TH: { comptes: ['75'], libelle: 'Autres produits' },
  TI: { comptes: ['781'], libelle: 'Transferts de charges d\'exploitation' },
  // Activité d'exploitation — Charges
  RA: { comptes: ['601'], libelle: 'Achats de marchandises' },
  RB: { comptes: ['6031'], libelle: 'Variation de stocks de marchandises' },
  RC: { comptes: ['602'], libelle: 'Achats de matières premières et fournitures liées' },
  RD: { comptes: ['6032'], libelle: 'Variation de stocks de matières premières' },
  RE: { comptes: ['604', '605', '608'], libelle: 'Autres achats' },
  RF: { comptes: ['6033', '6038'], libelle: 'Variation de stocks d\'autres approvisionnements' },
  RG: { comptes: ['61'], libelle: 'Transports' },
  RH: { comptes: ['62', '63'], libelle: 'Services extérieurs' },
  RI: { comptes: ['64'], libelle: 'Impôts et taxes' },
  RJ: { comptes: ['65'], libelle: 'Autres charges' },
  RK: { comptes: ['66'], libelle: 'Charges de personnel' },
  // Reprises / Dotations exploitation
  TJ: { comptes: ['791', '798', '799'], libelle: 'Reprises d\'amortissements, provisions et dépréciations' },
  RL: { comptes: ['681', '691'], libelle: 'Dotations aux amortissements, provisions et dépréciations' },
  // Activité financière
  TK: { comptes: ['77'], libelle: 'Revenus financiers et assimilés' },
  TL: { comptes: ['797'], libelle: 'Reprises de provisions et dépréciations financières' },
  TM: { comptes: ['787'], libelle: 'Transferts de charges financières' },
  RM: { comptes: ['67'], libelle: 'Frais financiers et charges assimilées' },
  RN: { comptes: ['697'], libelle: 'Dotations aux provisions et dépréciations financières' },
  // HAO
  TN: { comptes: ['82'], libelle: 'Produits des cessions d\'immobilisations' },
  TO: { comptes: ['84', '86', '88'], libelle: 'Autres produits HAO' },
  RO: { comptes: ['81'], libelle: 'Valeurs comptables des cessions d\'immobilisations' },
  RP: { comptes: ['83', '85'], libelle: 'Autres charges HAO' },  // 87 exclusif à RQ
  // Résultat
  RQ: { comptes: ['87'], libelle: 'Participation des travailleurs' },
  RS: { comptes: ['89'], libelle: 'Impôts sur le résultat' },
} as const satisfies Record<string, PosteMapping>

// ────────────────────────────────────────────────────────────────────────────
// TFT — Tableau des Flux de Trésorerie
// ────────────────────────────────────────────────────────────────────────────

export const TFT_COMPTES = {
  // Trésorerie (actif)
  TRESORERIE_ACTIF: ['50', '51', '52', '53', '54', '55', '56', '57', '58'] as readonly string[],
  TRESORERIE_ACTIF_AMORT: ['590', '591', '592', '593', '594'] as readonly string[],
  // Trésorerie (passif)
  TRESORERIE_PASSIF: ['565', '52', '561', '564'] as readonly string[],
  // CAFG composants
  DOTATIONS: ['681', '691', '697'] as readonly string[],
  REPRISES: ['791', '797', '798', '799'] as readonly string[],
  VC_CESSIONS: ['81'] as readonly string[],
  PROD_CESSIONS: ['82'] as readonly string[],
  // Variations BFR
  ACTIF_CIRCULANT_HAO: ['485', '486', '487', '488'] as readonly string[],
  STOCKS: ['31', '32', '33', '34', '35', '36', '37', '38'] as readonly string[],
  CREANCES: ['409', '411', '412', '413', '414', '415', '416', '418', '43', '44', '45', '46', '47'] as readonly string[],
  PASSIF_CIRCULANT: ['481', '482', '483', '484', '419', '401', '402', '403', '404', '405', '408', '43', '44', '421', '422', '423', '424', '425', '426', '427', '428', '499'] as readonly string[],
  // Investissements
  IMMO_INCORPORELLES: ['211', '212', '213', '214', '215', '216', '217', '218', '219'] as readonly string[],
  IMMO_CORPORELLES: ['22', '231', '232', '233', '234', '235', '237', '238', '241', '242', '243', '244', '245', '251', '252'] as readonly string[],
  IMMO_FINANCIERES: ['26', '271', '272', '273', '274', '275', '276', '277'] as readonly string[],
  // Financement
  CAPITAL: ['101', '102', '103'] as readonly string[],
  SUBVENTIONS_INVEST: ['14'] as readonly string[],
  EMPRUNTS_LT: ['161', '162', '163', '164'] as readonly string[],
  AUTRES_DETTES_FIN: ['165', '166', '167', '168', '17'] as readonly string[],
  TOUS_EMPRUNTS: ['161', '162', '163', '164', '165', '166', '167', '168', '17'] as readonly string[],
} as const

// ────────────────────────────────────────────────────────────────────────────
// Préfixes pour la détection d'anomalies (Bugs #7-8)
// ────────────────────────────────────────────────────────────────────────────

// ────────────────────────────────────────────────────────────────────────────
// NOTES ANNEXES — Détail par note (granularité sub-comptes)
// ────────────────────────────────────────────────────────────────────────────

/** NOTE 01 — Dettes garanties par des sûretés réelles */
export const NOTE_01 = {
  empruntsObligConv: { comptes: ['161'] as readonly string[], libelle: 'Emprunts obligataires convertibles' },
  autresEmpruntsOblig: { comptes: ['162'] as readonly string[], libelle: 'Autres emprunts obligataires' },
  empruntsEtabCredit: { comptes: ['163', '164'] as readonly string[], libelle: 'Emprunts et dettes auprès des établissements de crédit' },
  autresDettesFinanc: { comptes: ['165', '166', '168'] as readonly string[], libelle: 'Autres dettes financières' },
  creditBailImmo: { comptes: ['171'] as readonly string[], libelle: 'Crédit-bail immobilier' },
  creditBailMob: { comptes: ['172'] as readonly string[], libelle: 'Crédit-bail mobilier' },
  locationVente: { comptes: ['173'] as readonly string[], libelle: 'Location vente' },
  autresLocAcq: { comptes: ['174', '178'] as readonly string[], libelle: 'Autres location-acquisition' },
  fournisseurs: { comptes: ['401', '402', '403', '404', '405', '408'] as readonly string[], libelle: 'Fournisseurs d\'exploitation' },
  clients: { comptes: ['419'] as readonly string[], libelle: 'Clients, avances reçues' },
  personnel: { comptes: ['42'] as readonly string[], libelle: 'Personnel' },
  securiteSociale: { comptes: ['43'] as readonly string[], libelle: 'Sécurité sociale' },
  etat: { comptes: ['44'] as readonly string[], libelle: 'État' },
  orgInternat: { comptes: ['45'] as readonly string[], libelle: 'Organismes internationaux' },
  associesGroupe: { comptes: ['46'] as readonly string[], libelle: 'Associés et groupe' },
  crediteursDivers: { comptes: ['47'] as readonly string[], libelle: 'Créditeurs divers' },
} as const

/** NOTE 3A — Immobilisations : mouvements de l'exercice (bruts) */
export const NOTE_3A = {
  fraisRD: { comptes: ['211', '212'] as readonly string[], libelle: 'Frais de recherche et développement' },
  brevetsLogiciels: { comptes: ['213', '214', '215'] as readonly string[], libelle: 'Brevets, licences, logiciels' },
  fondsCommercial: { comptes: ['216'] as readonly string[], libelle: 'Fonds commercial' },
  autresIncorporelles: { comptes: ['217', '218', '219'] as readonly string[], libelle: 'Autres immobilisations incorporelles' },
  terrains: { comptes: ['22'] as readonly string[], libelle: 'Terrains' },
  batiments: { comptes: ['231', '232'] as readonly string[], libelle: 'Bâtiments' },
  installationsAgencements: { comptes: ['233', '234'] as readonly string[], libelle: 'Installations et agencements' },
  materiel: { comptes: ['241', '242', '243', '244'] as readonly string[], libelle: 'Matériel' },
  materielTransport: { comptes: ['245'] as readonly string[], libelle: 'Matériel de transport' },
  avancesAcomptes: { comptes: ['251', '252'] as readonly string[], libelle: 'Avances et acomptes sur immobilisations' },
} as const

/** NOTE 3C — Amortissements */
export const NOTE_3C = {
  fraisRD: { comptes: ['2811', '2812'] as readonly string[], libelle: 'Frais de recherche et développement' },
  brevetsLogiciels: { comptes: ['2813', '2814', '2815'] as readonly string[], libelle: 'Brevets, licences, logiciels' },
  fondsCommercial: { comptes: ['2816'] as readonly string[], libelle: 'Fonds commercial' },
  autresIncorporelles: { comptes: ['2817', '2818', '2819'] as readonly string[], libelle: 'Autres immobilisations incorporelles' },
  terrains: { comptes: ['282'] as readonly string[], libelle: 'Terrains' },
  batiments: { comptes: ['2831', '2832'] as readonly string[], libelle: 'Bâtiments' },
  installationsAgencements: { comptes: ['2833', '2834'] as readonly string[], libelle: 'Installations et agencements' },
  materiel: { comptes: ['2841', '2842', '2843', '2844'] as readonly string[], libelle: 'Matériel' },
  materielTransport: { comptes: ['2845'] as readonly string[], libelle: 'Matériel de transport' },
} as const

/** NOTE 3C BIS — Dépréciations et provisions */
export const NOTE_3C_BIS = {
  deprecIncorporelles: { comptes: ['290', '291'] as readonly string[], libelle: 'Immobilisations incorporelles' },
  deprecCorporelles: { comptes: ['292', '293', '294'] as readonly string[], libelle: 'Immobilisations corporelles' },
  deprecFinancieres: { comptes: ['296', '297'] as readonly string[], libelle: 'Immobilisations financières' },
  deprecStocks: { comptes: ['39'] as readonly string[], libelle: 'Stocks' },
  deprecCreances: { comptes: ['49'] as readonly string[], libelle: 'Créances et emplois assimilés' },
  provRisques: { comptes: ['191', '192'] as readonly string[], libelle: 'Provisions pour risques' },
  provCharges: { comptes: ['193', '194', '195', '196', '197', '198'] as readonly string[], libelle: 'Provisions pour charges' },
} as const

/** NOTE 3D — Immobilisations financières */
export const NOTE_3D = {
  titresParticipation: { comptes: ['261', '262', '263', '264', '265'] as readonly string[], amort: ['296'] as readonly string[], libelle: 'Titres de participation' },
  pretsCreances: { comptes: ['271', '272', '273'] as readonly string[], amort: ['297'] as readonly string[], libelle: 'Prêts et créances non commerciales' },
  depotsCautionnements: { comptes: ['275'] as readonly string[], amort: [] as readonly string[], libelle: 'Dépôts et cautionnements' },
  autresTitres: { comptes: ['274', '276', '277', '278'] as readonly string[], amort: [] as readonly string[], libelle: 'Autres titres immobilisés' },
} as const

/** NOTE 3E — Informations complémentaires sur immobilisations */
export const NOTE_3E = {
  redevancesCreditBail: { comptes: ['622'] as readonly string[], libelle: 'Redevances de crédit-bail' },
  immoCreditBail: { comptes: ['17'] as readonly string[], libelle: 'Immobilisations acquises en crédit-bail' },
  immoEnCours: { comptes: ['23'] as readonly string[], libelle: 'Immobilisations en cours' },
  avancesAcomptes: { comptes: ['251', '252'] as readonly string[], libelle: 'Avances et acomptes versés sur immobilisations' },
  chargesImmobilisees: { comptes: ['201', '202'] as readonly string[], libelle: 'Charges immobilisées (HAO)' },
} as const

/** NOTE 10 — Capital social */
export const NOTE_10 = {
  capitalSouscrit: { comptes: ['101'] as readonly string[], libelle: 'Capital social souscrit' },
  capitalNonAppele: { comptes: ['109'] as readonly string[], libelle: 'Capital non appelé' },
  actionsPropres: { comptes: ['102'] as readonly string[], libelle: 'Actions propres' },
  apportNature: { comptes: ['103'] as readonly string[], libelle: 'Apport en nature' },
} as const

/** NOTE 14 — Dettes financières et ressources assimilées */
export const NOTE_14 = {
  empruntsObligataires: { comptes: ['161'] as readonly string[], libelle: 'Emprunts obligataires' },
  empruntsEtabCredit: { comptes: ['162', '163', '164'] as readonly string[], libelle: 'Emprunts auprès des établissements de crédit' },
  dettesCreditBail: { comptes: ['17'] as readonly string[], libelle: 'Dettes de crédit-bail' },
  dettesFinDiverses: { comptes: ['165', '166', '168'] as readonly string[], libelle: 'Dettes financières diverses' },
  avancesEtat: { comptes: ['181'] as readonly string[], libelle: 'Avances reçues de l\'État' },
  autresDettesFinancieres: { comptes: ['182', '183', '184', '185', '186'] as readonly string[], libelle: 'Autres dettes financières' },
  provisionsRisquesCharges: { comptes: ['19'] as readonly string[], libelle: 'Provisions pour risques et charges' },
} as const

// ────────────────────────────────────────────────────────────────────────────
// Préfixes pour la détection d'anomalies (Bugs #7-8)
// ────────────────────────────────────────────────────────────────────────────

/** Tous les préfixes de comptes d'actif (pour détecter les soldes créditeurs anormaux) */
export const ALL_ACTIF_PREFIXES: readonly string[] = [
  ...BILAN_ACTIF.AE.comptes, ...BILAN_ACTIF.AF.comptes, ...BILAN_ACTIF.AG.comptes, ...BILAN_ACTIF.AH.comptes,
  ...BILAN_ACTIF.AJ.comptes, ...BILAN_ACTIF.AK.comptes, ...BILAN_ACTIF.AL.comptes, ...BILAN_ACTIF.AM.comptes,
  ...BILAN_ACTIF.AN.comptes, ...BILAN_ACTIF.AP.comptes, ...BILAN_ACTIF.AR.comptes, ...BILAN_ACTIF.AS.comptes,
  ...BILAN_ACTIF.BA.comptes, ...BILAN_ACTIF.BB.comptes,
  ...BILAN_ACTIF.BH.comptes, ...BILAN_ACTIF.BI.comptes, ...BILAN_ACTIF.BJ.comptes,
  ...BILAN_ACTIF.BQ.comptes, ...BILAN_ACTIF.BR.comptes, ...BILAN_ACTIF.BS.comptes,
  ...BILAN_ACTIF.BU.comptes,
]

/** Tous les préfixes de comptes de passif (pour détecter les soldes débiteurs anormaux) */
export const ALL_PASSIF_PREFIXES: readonly string[] = [
  ...BILAN_PASSIF.CA.comptes, ...BILAN_PASSIF.CD.comptes, ...BILAN_PASSIF.CE.comptes,
  ...BILAN_PASSIF.CF.comptes, ...BILAN_PASSIF.CG.comptes,
  ...BILAN_PASSIF.CL.comptes, ...BILAN_PASSIF.CM.comptes,
  ...BILAN_PASSIF.DA.comptes, ...BILAN_PASSIF.DB.comptes, ...BILAN_PASSIF.DC.comptes,
  ...BILAN_PASSIF.DH.comptes, ...BILAN_PASSIF.DI.comptes, ...BILAN_PASSIF.DJ.comptes,
  ...BILAN_PASSIF.DK.comptes, ...BILAN_PASSIF.DM.comptes, ...BILAN_PASSIF.DN.comptes,
  ...BILAN_PASSIF.DQ.comptes, ...BILAN_PASSIF.DR.comptes,
  ...BILAN_PASSIF.DV.comptes,
]
