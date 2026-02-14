import type { CompteComptable } from '../types'

/**
 * CLASSE 6 - COMPTES DE CHARGES DES ACTIVITES ORDINAIRES
 * Plan comptable SYSCOHADA Révisé (2017)
 */
export const CLASSE_6_COMPTES: CompteComptable[] = [
  // ============================================================
  // 60 - ACHATS ET VARIATIONS DE STOCKS
  // ============================================================
  {
    numero: '60',
    libelle: 'Achats et variations de stocks',
    classe: 6,
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  // --- 601 Achats de marchandises ---
  {
    numero: '601',
    libelle: 'Achats de marchandises',
    classe: 6,
    sousClasse: '60',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE',
    secteurs: ['COMMERCE']
  },
  {
    numero: '6011',
    libelle: 'dans la Région',
    classe: 6,
    sousClasse: '601',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '6012',
    libelle: 'hors Région',
    classe: 6,
    sousClasse: '601',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6019',
    libelle: 'Rabais, remises et ristournes obtenus sur achats de marchandises',
    classe: 6,
    sousClasse: '601',
    nature: 'CHARGE',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 602 Achats de matières premières et fournitures liées ---
  {
    numero: '602',
    libelle: 'Achats de matières premières et fournitures liées',
    classe: 6,
    sousClasse: '60',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE',
    secteurs: ['INDUSTRIE', 'PRODUCTION']
  },
  {
    numero: '6021',
    libelle: 'Achats de matières premières',
    classe: 6,
    sousClasse: '602',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '6022',
    libelle: 'Achats de matières et fournitures consommables',
    classe: 6,
    sousClasse: '602',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '6023',
    libelle: "Achats d'emballages",
    classe: 6,
    sousClasse: '602',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6029',
    libelle: 'Rabais, remises et ristournes obtenus',
    classe: 6,
    sousClasse: '602',
    nature: 'CHARGE',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 603 Variations des stocks de biens achetés ---
  {
    numero: '603',
    libelle: 'Variations des stocks de biens achetés',
    classe: 6,
    sousClasse: '60',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '6031',
    libelle: 'Variations des stocks de marchandises',
    classe: 6,
    sousClasse: '603',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '6032',
    libelle: 'Variations des stocks de matières premières',
    classe: 6,
    sousClasse: '603',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '6033',
    libelle: "Variations des stocks d'autres approvisionnements",
    classe: 6,
    sousClasse: '603',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 604 Achats stockés de matières et fournitures consommables ---
  {
    numero: '604',
    libelle: 'Achats stockés de matières et fournitures consommables',
    classe: 6,
    sousClasse: '60',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6041',
    libelle: 'Matières consommables',
    classe: 6,
    sousClasse: '604',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6042',
    libelle: 'Matières combustibles',
    classe: 6,
    sousClasse: '604',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6043',
    libelle: "Produits d'entretien",
    classe: 6,
    sousClasse: '604',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6044',
    libelle: "Fournitures d'atelier et d'usine",
    classe: 6,
    sousClasse: '604',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6046',
    libelle: 'Fournitures de bureau',
    classe: 6,
    sousClasse: '604',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '6047',
    libelle: "Fournitures et matières d'emballages",
    classe: 6,
    sousClasse: '604',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6049',
    libelle: 'Rabais, remises et ristournes obtenus',
    classe: 6,
    sousClasse: '604',
    nature: 'CHARGE',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 605 Autres achats ---
  {
    numero: '605',
    libelle: 'Autres achats',
    classe: 6,
    sousClasse: '60',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '6051',
    libelle: 'Fournitures non stockables - eau',
    classe: 6,
    sousClasse: '605',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '6052',
    libelle: 'Fournitures non stockables - électricité',
    classe: 6,
    sousClasse: '605',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '6053',
    libelle: 'Fournitures non stockables - autres énergies',
    classe: 6,
    sousClasse: '605',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6054',
    libelle: "Fournitures d'entretien non stockables",
    classe: 6,
    sousClasse: '605',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6055',
    libelle: 'Fournitures de bureau non stockables',
    classe: 6,
    sousClasse: '605',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6056',
    libelle: 'Achats de petit matériel et outillage',
    classe: 6,
    sousClasse: '605',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6057',
    libelle: "Achats d'études et de prestations de services",
    classe: 6,
    sousClasse: '605',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6058',
    libelle: 'Achats de travaux, matériels et équipements',
    classe: 6,
    sousClasse: '605',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6059',
    libelle: 'Rabais, remises et ristournes obtenus',
    classe: 6,
    sousClasse: '605',
    nature: 'CHARGE',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 608 Achats d'emballages ---
  {
    numero: '608',
    libelle: "Achats d'emballages",
    classe: 6,
    sousClasse: '60',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 61 - TRANSPORTS
  // ============================================================
  {
    numero: '61',
    libelle: 'Transports',
    classe: 6,
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '611',
    libelle: 'Transports sur achats',
    classe: 6,
    sousClasse: '61',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '612',
    libelle: 'Transports sur ventes',
    classe: 6,
    sousClasse: '61',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '613',
    libelle: 'Transports pour le compte de tiers',
    classe: 6,
    sousClasse: '61',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '614',
    libelle: 'Transports du personnel',
    classe: 6,
    sousClasse: '61',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '616',
    libelle: 'Transports de plis',
    classe: 6,
    sousClasse: '61',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '618',
    libelle: 'Autres frais de transport',
    classe: 6,
    sousClasse: '61',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '619',
    libelle: 'Rabais, remises et ristournes obtenus sur transports',
    classe: 6,
    sousClasse: '61',
    nature: 'CHARGE',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 62 - SERVICES EXTERIEURS A
  // ============================================================
  {
    numero: '62',
    libelle: 'Services extérieurs A',
    classe: 6,
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  // --- 621 Sous-traitance générale ---
  {
    numero: '621',
    libelle: 'Sous-traitance générale',
    classe: 6,
    sousClasse: '62',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 622 Locations et charges locatives ---
  {
    numero: '622',
    libelle: 'Locations et charges locatives',
    classe: 6,
    sousClasse: '62',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '6221',
    libelle: 'Locations de terrains',
    classe: 6,
    sousClasse: '622',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6222',
    libelle: 'Locations de bâtiments',
    classe: 6,
    sousClasse: '622',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '6223',
    libelle: 'Locations de matériel et outillage',
    classe: 6,
    sousClasse: '622',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6224',
    libelle: 'Malis sur emballages',
    classe: 6,
    sousClasse: '622',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6225',
    libelle: 'Locations de matériel de transport',
    classe: 6,
    sousClasse: '622',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6228',
    libelle: 'Locations et charges locatives diverses',
    classe: 6,
    sousClasse: '622',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 623 Redevances de crédit-bail et contrats assimilés ---
  {
    numero: '623',
    libelle: 'Redevances de crédit-bail et contrats assimilés',
    classe: 6,
    sousClasse: '62',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6231',
    libelle: 'Crédit-bail immobilier',
    classe: 6,
    sousClasse: '623',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6232',
    libelle: 'Crédit-bail mobilier',
    classe: 6,
    sousClasse: '623',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6233',
    libelle: 'Contrats assimilés',
    classe: 6,
    sousClasse: '623',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 624 Entretien, réparations et maintenance ---
  {
    numero: '624',
    libelle: 'Entretien, réparations et maintenance',
    classe: 6,
    sousClasse: '62',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '6241',
    libelle: 'Entretien et réparations des biens immobiliers',
    classe: 6,
    sousClasse: '624',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '6242',
    libelle: 'Entretien et réparations des biens mobiliers',
    classe: 6,
    sousClasse: '624',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '6243',
    libelle: 'Maintenance',
    classe: 6,
    sousClasse: '624',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6248',
    libelle: 'Autres entretiens et réparations',
    classe: 6,
    sousClasse: '624',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 625 Primes d'assurance ---
  {
    numero: '625',
    libelle: "Primes d'assurance",
    classe: 6,
    sousClasse: '62',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '6251',
    libelle: 'Assurances multirisques',
    classe: 6,
    sousClasse: '625',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '6252',
    libelle: 'Assurances matériel de transport',
    classe: 6,
    sousClasse: '625',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '6253',
    libelle: "Assurances risques d'exploitation",
    classe: 6,
    sousClasse: '625',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6254',
    libelle: 'Assurances responsabilité du dirigeant',
    classe: 6,
    sousClasse: '625',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6256',
    libelle: 'Assurances transport sur achats',
    classe: 6,
    sousClasse: '625',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6258',
    libelle: "Autres primes d'assurance",
    classe: 6,
    sousClasse: '625',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 626 Études, recherches et documentation ---
  {
    numero: '626',
    libelle: 'Études, recherches et documentation',
    classe: 6,
    sousClasse: '62',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6261',
    libelle: 'Études et recherches',
    classe: 6,
    sousClasse: '626',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6265',
    libelle: 'Documentation générale',
    classe: 6,
    sousClasse: '626',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6266',
    libelle: 'Documentation technique',
    classe: 6,
    sousClasse: '626',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 627 Publicité, publications, relations publiques ---
  {
    numero: '627',
    libelle: 'Publicité, publications, relations publiques',
    classe: 6,
    sousClasse: '62',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6271',
    libelle: 'Annonces et insertions',
    classe: 6,
    sousClasse: '627',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6272',
    libelle: 'Catalogues et imprimés',
    classe: 6,
    sousClasse: '627',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6273',
    libelle: 'Échantillons',
    classe: 6,
    sousClasse: '627',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6274',
    libelle: 'Foires et expositions',
    classe: 6,
    sousClasse: '627',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6275',
    libelle: 'Publications',
    classe: 6,
    sousClasse: '627',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6276',
    libelle: 'Cadeaux à la clientèle',
    classe: 6,
    sousClasse: '627',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6277',
    libelle: 'Frais de colloques, séminaires, conférences',
    classe: 6,
    sousClasse: '627',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6278',
    libelle: 'Autres charges de publicité et de relations publiques',
    classe: 6,
    sousClasse: '627',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 628 Frais de télécommunications ---
  {
    numero: '628',
    libelle: 'Frais de télécommunications',
    classe: 6,
    sousClasse: '62',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '6281',
    libelle: 'Frais de téléphone',
    classe: 6,
    sousClasse: '628',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '6282',
    libelle: 'Frais de télécopie',
    classe: 6,
    sousClasse: '628',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6283',
    libelle: "Frais d'internet",
    classe: 6,
    sousClasse: '628',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '6288',
    libelle: 'Autres frais de télécommunications',
    classe: 6,
    sousClasse: '628',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 629 Rabais, remises et ristournes obtenus ---
  {
    numero: '629',
    libelle: 'Rabais, remises et ristournes obtenus',
    classe: 6,
    sousClasse: '62',
    nature: 'CHARGE',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 63 - SERVICES EXTERIEURS B
  // ============================================================
  {
    numero: '63',
    libelle: 'Services extérieurs B',
    classe: 6,
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  // --- 631 Frais bancaires ---
  {
    numero: '631',
    libelle: 'Frais bancaires',
    classe: 6,
    sousClasse: '63',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '6311',
    libelle: 'Frais sur titres',
    classe: 6,
    sousClasse: '631',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6312',
    libelle: 'Frais sur effets',
    classe: 6,
    sousClasse: '631',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6313',
    libelle: 'Locations de coffres',
    classe: 6,
    sousClasse: '631',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6314',
    libelle: 'Commissions sur cartes de crédit',
    classe: 6,
    sousClasse: '631',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6318',
    libelle: 'Autres frais bancaires',
    classe: 6,
    sousClasse: '631',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  // --- 632 Rémunérations d'intermédiaires et de conseils ---
  {
    numero: '632',
    libelle: "Rémunérations d'intermédiaires et de conseils",
    classe: 6,
    sousClasse: '63',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '6321',
    libelle: 'Commissions et courtages sur achats',
    classe: 6,
    sousClasse: '632',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6322',
    libelle: 'Commissions et courtages sur ventes',
    classe: 6,
    sousClasse: '632',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6324',
    libelle: 'Honoraires',
    classe: 6,
    sousClasse: '632',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '6325',
    libelle: "Frais d'actes et de contentieux",
    classe: 6,
    sousClasse: '632',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6328',
    libelle: "Autres rémunérations d'intermédiaires et de conseils",
    classe: 6,
    sousClasse: '632',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 633 Frais de formation du personnel ---
  {
    numero: '633',
    libelle: 'Frais de formation du personnel',
    classe: 6,
    sousClasse: '63',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 634 Redevances pour brevets, licences, logiciels et droits similaires ---
  {
    numero: '634',
    libelle: 'Redevances pour brevets, licences, logiciels et droits similaires',
    classe: 6,
    sousClasse: '63',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6341',
    libelle: 'Redevances pour brevets',
    classe: 6,
    sousClasse: '634',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6342',
    libelle: 'Redevances pour licences',
    classe: 6,
    sousClasse: '634',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6343',
    libelle: 'Redevances pour logiciels',
    classe: 6,
    sousClasse: '634',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6344',
    libelle: 'Redevances pour marques',
    classe: 6,
    sousClasse: '634',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6345',
    libelle: 'Redevances pour procédés',
    classe: 6,
    sousClasse: '634',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 635 Cotisations ---
  {
    numero: '635',
    libelle: 'Cotisations',
    classe: 6,
    sousClasse: '63',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6351',
    libelle: 'Cotisations',
    classe: 6,
    sousClasse: '635',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6358',
    libelle: 'Concours divers',
    classe: 6,
    sousClasse: '635',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 636 Frais de réception ---
  {
    numero: '636',
    libelle: 'Frais de réception',
    classe: 6,
    sousClasse: '63',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 637 Frais de déplacement, missions et réceptions ---
  {
    numero: '637',
    libelle: 'Frais de déplacement, missions et réceptions',
    classe: 6,
    sousClasse: '63',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '6371',
    libelle: 'Voyages et déplacements',
    classe: 6,
    sousClasse: '637',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '6372',
    libelle: 'Frais de déménagement',
    classe: 6,
    sousClasse: '637',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6373',
    libelle: 'Frais de mission',
    classe: 6,
    sousClasse: '637',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '6374',
    libelle: 'Frais de réception',
    classe: 6,
    sousClasse: '637',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 638 Autres charges externes ---
  {
    numero: '638',
    libelle: 'Autres charges externes',
    classe: 6,
    sousClasse: '63',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6381',
    libelle: 'Frais de recrutement du personnel',
    classe: 6,
    sousClasse: '638',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6382',
    libelle: 'Rémunérations transitées par des tiers',
    classe: 6,
    sousClasse: '638',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6383',
    libelle: 'Réceptions',
    classe: 6,
    sousClasse: '638',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6384',
    libelle: 'Missions',
    classe: 6,
    sousClasse: '638',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6388',
    libelle: 'Autres charges externes',
    classe: 6,
    sousClasse: '638',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 639 Rabais, remises et ristournes obtenus ---
  {
    numero: '639',
    libelle: 'Rabais, remises et ristournes obtenus',
    classe: 6,
    sousClasse: '63',
    nature: 'CHARGE',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 64 - IMPOTS ET TAXES
  // ============================================================
  {
    numero: '64',
    libelle: 'Impôts et taxes',
    classe: 6,
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  // --- 641 Impôts et taxes directs ---
  {
    numero: '641',
    libelle: 'Impôts et taxes directs',
    classe: 6,
    sousClasse: '64',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '6411',
    libelle: 'Patentes, licences, taxes annexes',
    classe: 6,
    sousClasse: '641',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '6412',
    libelle: 'Impôts fonciers et taxes annexes',
    classe: 6,
    sousClasse: '641',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6413',
    libelle: 'Taxes sur appointements et salaires',
    classe: 6,
    sousClasse: '641',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '6414',
    libelle: "Taxes d'apprentissage",
    classe: 6,
    sousClasse: '641',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6415',
    libelle: 'Formation professionnelle continue',
    classe: 6,
    sousClasse: '641',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6418',
    libelle: 'Autres impôts et taxes directs',
    classe: 6,
    sousClasse: '641',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 642 Impôts et taxes indirects ---
  {
    numero: '642',
    libelle: 'Impôts et taxes indirects',
    classe: 6,
    sousClasse: '64',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 645 Impôts et taxes sur le chiffre d'affaires non récupérables ---
  {
    numero: '645',
    libelle: "Impôts et taxes sur le chiffre d'affaires non récupérables",
    classe: 6,
    sousClasse: '64',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 646 Droits d'enregistrement ---
  {
    numero: '646',
    libelle: "Droits d'enregistrement",
    classe: 6,
    sousClasse: '64',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6461',
    libelle: 'Droits de mutation',
    classe: 6,
    sousClasse: '646',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6462',
    libelle: 'Droits de timbre',
    classe: 6,
    sousClasse: '646',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6463',
    libelle: 'Taxes sur les véhicules de société',
    classe: 6,
    sousClasse: '646',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6468',
    libelle: 'Autres droits',
    classe: 6,
    sousClasse: '646',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 647 Pénalités et amendes fiscales ---
  {
    numero: '647',
    libelle: 'Pénalités et amendes fiscales',
    classe: 6,
    sousClasse: '64',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6471',
    libelle: "Pénalités d'assiette, impôts directs",
    classe: 6,
    sousClasse: '647',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6472',
    libelle: "Pénalités d'assiette, impôts indirects",
    classe: 6,
    sousClasse: '647',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6473',
    libelle: 'Pénalités de recouvrement',
    classe: 6,
    sousClasse: '647',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6478',
    libelle: 'Autres pénalités et amendes fiscales',
    classe: 6,
    sousClasse: '647',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 648 Autres impôts et taxes ---
  {
    numero: '648',
    libelle: 'Autres impôts et taxes',
    classe: 6,
    sousClasse: '64',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 65 - AUTRES CHARGES
  // ============================================================
  {
    numero: '65',
    libelle: 'Autres charges',
    classe: 6,
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 651 Pertes sur créances clients et autres débiteurs ---
  {
    numero: '651',
    libelle: 'Pertes sur créances clients et autres débiteurs',
    classe: 6,
    sousClasse: '65',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6511',
    libelle: 'Pertes sur créances clients',
    classe: 6,
    sousClasse: '651',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6515',
    libelle: "Pertes sur créances de l'État",
    classe: 6,
    sousClasse: '651',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6518',
    libelle: 'Pertes sur autres créances',
    classe: 6,
    sousClasse: '651',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 652 Quote-part de résultat sur opérations faites en commun ---
  {
    numero: '652',
    libelle: 'Quote-part de résultat sur opérations faites en commun',
    classe: 6,
    sousClasse: '65',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6521',
    libelle: 'Quote-part transférée de bénéfice',
    classe: 6,
    sousClasse: '652',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6525',
    libelle: 'Pertes imputées par transfert',
    classe: 6,
    sousClasse: '652',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 653 Quote-part de résultat sur opérations faites pour compte ---
  {
    numero: '653',
    libelle: 'Quote-part de résultat sur opérations faites pour compte',
    classe: 6,
    sousClasse: '65',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 654 Valeurs comptables des cessions courantes d'immobilisations ---
  {
    numero: '654',
    libelle: "Valeurs comptables des cessions courantes d'immobilisations",
    classe: 6,
    sousClasse: '65',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 658 Charges diverses ---
  {
    numero: '658',
    libelle: 'Charges diverses',
    classe: 6,
    sousClasse: '65',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6581',
    libelle: "Jetons de présence et rémunérations d'administrateurs",
    classe: 6,
    sousClasse: '658',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6582',
    libelle: 'Dons',
    classe: 6,
    sousClasse: '658',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6583',
    libelle: 'Mécénat',
    classe: 6,
    sousClasse: '658',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6588',
    libelle: 'Autres charges diverses',
    classe: 6,
    sousClasse: '658',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 659 Charges provisionnées d'exploitation ---
  {
    numero: '659',
    libelle: "Charges provisionnées d'exploitation",
    classe: 6,
    sousClasse: '65',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6591',
    libelle: 'sur risques à court terme',
    classe: 6,
    sousClasse: '659',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6593',
    libelle: 'sur stocks',
    classe: 6,
    sousClasse: '659',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6594',
    libelle: 'sur créances',
    classe: 6,
    sousClasse: '659',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6598',
    libelle: 'Autres charges provisionnées',
    classe: 6,
    sousClasse: '659',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 66 - CHARGES DE PERSONNEL
  // ============================================================
  {
    numero: '66',
    libelle: 'Charges de personnel',
    classe: 6,
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  // --- 661 Rémunérations directes versées au personnel national ---
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
    numero: '6611',
    libelle: 'Appointements salaires et commissions',
    classe: 6,
    sousClasse: '661',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '6612',
    libelle: 'Primes et gratifications',
    classe: 6,
    sousClasse: '661',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '6613',
    libelle: 'Congés payés',
    classe: 6,
    sousClasse: '661',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '6614',
    libelle: "Indemnités de préavis, de licenciement et de recherche d'embauche",
    classe: 6,
    sousClasse: '661',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6615',
    libelle: 'Indemnités de maladie versées aux travailleurs',
    classe: 6,
    sousClasse: '661',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6616',
    libelle: 'Supplément familial',
    classe: 6,
    sousClasse: '661',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6617',
    libelle: 'Avantages en nature',
    classe: 6,
    sousClasse: '661',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6618',
    libelle: 'Autres rémunérations directes',
    classe: 6,
    sousClasse: '661',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 662 Rémunérations directes versées au personnel non national ---
  {
    numero: '662',
    libelle: 'Rémunérations directes versées au personnel non national',
    classe: 6,
    sousClasse: '66',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 663 Indemnités forfaitaires versées au personnel ---
  {
    numero: '663',
    libelle: 'Indemnités forfaitaires versées au personnel',
    classe: 6,
    sousClasse: '66',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '6631',
    libelle: 'Indemnités de logement',
    classe: 6,
    sousClasse: '663',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6632',
    libelle: 'Indemnités de représentation',
    classe: 6,
    sousClasse: '663',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6633',
    libelle: "Indemnités d'expatriation",
    classe: 6,
    sousClasse: '663',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6634',
    libelle: 'Indemnités de transport',
    classe: 6,
    sousClasse: '663',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6638',
    libelle: 'Autres indemnités et avantages divers',
    classe: 6,
    sousClasse: '663',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 664 Charges sociales ---
  {
    numero: '664',
    libelle: 'Charges sociales',
    classe: 6,
    sousClasse: '66',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '6641',
    libelle: 'Charges sociales sur rémunérations du personnel national',
    classe: 6,
    sousClasse: '664',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '6642',
    libelle: 'Charges sociales sur rémunérations du personnel non national',
    classe: 6,
    sousClasse: '664',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6643',
    libelle: 'Cotisations aux caisses de retraite',
    classe: 6,
    sousClasse: '664',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '6644',
    libelle: 'Cotisations aux mutuelles',
    classe: 6,
    sousClasse: '664',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6645',
    libelle: 'Assurances maladies/décès',
    classe: 6,
    sousClasse: '664',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6646',
    libelle: 'Prestations directes',
    classe: 6,
    sousClasse: '664',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6648',
    libelle: 'Autres charges sociales',
    classe: 6,
    sousClasse: '664',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 665 Charges sociales sur rémunérations de l'exploitant ---
  {
    numero: '665',
    libelle: "Charges sociales sur rémunérations de l'exploitant",
    classe: 6,
    sousClasse: '66',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 666 Rémunérations et charges sociales de l'exploitant ---
  {
    numero: '666',
    libelle: "Rémunérations et charges sociales de l'exploitant",
    classe: 6,
    sousClasse: '66',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6661',
    libelle: "Rémunérations du travail de l'exploitant",
    classe: 6,
    sousClasse: '666',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6662',
    libelle: 'Charges sociales',
    classe: 6,
    sousClasse: '666',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 667 Rémunérations transférées de personnel extérieur ---
  {
    numero: '667',
    libelle: 'Rémunérations transférées de personnel extérieur',
    classe: 6,
    sousClasse: '66',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 668 Autres charges sociales ---
  {
    numero: '668',
    libelle: 'Autres charges sociales',
    classe: 6,
    sousClasse: '66',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6681',
    libelle: "Versements aux syndicats et comités d'entreprise",
    classe: 6,
    sousClasse: '668',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6682',
    libelle: 'Médecine du travail et pharmacie',
    classe: 6,
    sousClasse: '668',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6683',
    libelle: 'Cantines, restaurants',
    classe: 6,
    sousClasse: '668',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6684',
    libelle: 'Indemnités de stages',
    classe: 6,
    sousClasse: '668',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6688',
    libelle: 'Autres charges sociales diverses',
    classe: 6,
    sousClasse: '668',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 67 - FRAIS FINANCIERS ET CHARGES ASSIMILEES
  // ============================================================
  {
    numero: '67',
    libelle: 'Frais financiers et charges assimilées',
    classe: 6,
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  // --- 671 Intérêts des emprunts ---
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
    numero: '6711',
    libelle: 'Emprunts obligataires',
    classe: 6,
    sousClasse: '671',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6712',
    libelle: 'Emprunts auprès des établissements de crédit',
    classe: 6,
    sousClasse: '671',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '6713',
    libelle: 'Avances reçues et comptes courants bloqués',
    classe: 6,
    sousClasse: '671',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 672 Intérêts dans loyers de crédit-bail et contrats assimilés ---
  {
    numero: '672',
    libelle: 'Intérêts dans loyers de crédit-bail et contrats assimilés',
    classe: 6,
    sousClasse: '67',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6721',
    libelle: 'Intérêts de location-acquisition immobilière',
    classe: 6,
    sousClasse: '672',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6722',
    libelle: 'Intérêts de location-acquisition mobilière',
    classe: 6,
    sousClasse: '672',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 673 Escomptes accordés ---
  {
    numero: '673',
    libelle: 'Escomptes accordés',
    classe: 6,
    sousClasse: '67',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 674 Autres intérêts ---
  {
    numero: '674',
    libelle: 'Autres intérêts',
    classe: 6,
    sousClasse: '67',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 675 Escomptes des effets de commerce ---
  {
    numero: '675',
    libelle: 'Escomptes des effets de commerce',
    classe: 6,
    sousClasse: '67',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 676 Pertes de change ---
  {
    numero: '676',
    libelle: 'Pertes de change',
    classe: 6,
    sousClasse: '67',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 677 Pertes sur cessions de titres de placement ---
  {
    numero: '677',
    libelle: 'Pertes sur cessions de titres de placement',
    classe: 6,
    sousClasse: '67',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 678 Pertes sur risques financiers ---
  {
    numero: '678',
    libelle: 'Pertes sur risques financiers',
    classe: 6,
    sousClasse: '67',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6781',
    libelle: 'Pertes de change sur créances commerciales',
    classe: 6,
    sousClasse: '678',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6782',
    libelle: 'Pertes de change sur dettes commerciales',
    classe: 6,
    sousClasse: '678',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6784',
    libelle: 'Pertes de change sur opérations financières',
    classe: 6,
    sousClasse: '678',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6788',
    libelle: 'Autres charges financières',
    classe: 6,
    sousClasse: '678',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 679 Charges provisionnées financières ---
  {
    numero: '679',
    libelle: 'Charges provisionnées financières',
    classe: 6,
    sousClasse: '67',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6791',
    libelle: 'Dotations aux provisions pour risques financiers',
    classe: 6,
    sousClasse: '679',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6795',
    libelle: 'Dotations aux dépréciations des titres de placement',
    classe: 6,
    sousClasse: '679',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6798',
    libelle: 'Autres charges provisionnées financières',
    classe: 6,
    sousClasse: '679',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 68 - DOTATIONS AUX AMORTISSEMENTS
  // ============================================================
  {
    numero: '68',
    libelle: 'Dotations aux amortissements',
    classe: 6,
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  // --- 681 Dotations aux amortissements d'exploitation ---
  {
    numero: '681',
    libelle: "Dotations aux amortissements d'exploitation",
    classe: 6,
    sousClasse: '68',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '6811',
    libelle: 'Dotations aux amortissements des charges immobilisées',
    classe: 6,
    sousClasse: '681',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6812',
    libelle: 'Dotations aux amortissements des immobilisations incorporelles',
    classe: 6,
    sousClasse: '681',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6813',
    libelle: 'Dotations aux amortissements des immobilisations corporelles',
    classe: 6,
    sousClasse: '681',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  // --- 687 Dotations aux amortissements à caractère financier ---
  {
    numero: '687',
    libelle: 'Dotations aux amortissements à caractère financier',
    classe: 6,
    sousClasse: '68',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6871',
    libelle: 'Dotations aux amortissements des primes de remboursement',
    classe: 6,
    sousClasse: '687',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6872',
    libelle: 'Dotations aux provisions pour dépréciation des immobilisations financières',
    classe: 6,
    sousClasse: '687',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 69 - DOTATIONS AUX PROVISIONS
  // ============================================================
  {
    numero: '69',
    libelle: 'Dotations aux provisions',
    classe: 6,
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 691 Dotations aux provisions d'exploitation ---
  {
    numero: '691',
    libelle: "Dotations aux provisions d'exploitation",
    classe: 6,
    sousClasse: '69',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6911',
    libelle: "pour risques d'exploitation",
    classe: 6,
    sousClasse: '691',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6912',
    libelle: 'pour grosses réparations',
    classe: 6,
    sousClasse: '691',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6913',
    libelle: 'pour dépréciation des immobilisations incorporelles',
    classe: 6,
    sousClasse: '691',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6914',
    libelle: 'pour dépréciation des immobilisations corporelles',
    classe: 6,
    sousClasse: '691',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 692 Dotations aux provisions à caractère financier ---
  {
    numero: '692',
    libelle: 'Dotations aux provisions à caractère financier',
    classe: 6,
    sousClasse: '69',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  // --- 697 Dotations aux provisions financières ---
  {
    numero: '697',
    libelle: 'Dotations aux provisions financières',
    classe: 6,
    sousClasse: '69',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6971',
    libelle: 'Dotations aux provisions pour risques financiers',
    classe: 6,
    sousClasse: '697',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '6972',
    libelle: 'Dotations aux dépréciations des immobilisations financières',
    classe: 6,
    sousClasse: '697',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  }
]
