/**
 * Données de référence OHADA partagées (formes juridiques, pays, secteurs, etc.)
 */

export const LEGAL_FORMS = [
  'SA - Société Anonyme',
  'SARL - Société à Responsabilité Limitée',
  'SAS - Société par Actions Simplifiée',
  'SNC - Société en Nom Collectif',
  'SCS - Société en Commandite Simple',
  'GIE - Groupement d\'Intérêt Économique',
  'Entreprise Individuelle',
  'Coopérative',
] as const

export const SECTORS = [
  { code: 'A', name: 'Agriculture, sylviculture et pêche' },
  { code: 'B', name: 'Industries extractives' },
  { code: 'C', name: 'Industrie manufacturière' },
  { code: 'D', name: 'Production et distribution d\'électricité' },
  { code: 'E', name: 'Production et distribution d\'eau' },
  { code: 'F', name: 'Construction' },
  { code: 'G', name: 'Commerce' },
  { code: 'H', name: 'Transports et entreposage' },
  { code: 'I', name: 'Hébergement et restauration' },
  { code: 'J', name: 'Information et communication' },
  { code: 'K', name: 'Activités financières et d\'assurance' },
  { code: 'L', name: 'Activités immobilières' },
  { code: 'M', name: 'Activités spécialisées' },
  { code: 'N', name: 'Activités de services administratifs' },
] as const

export const TAX_REGIMES = [
  'Réel normal',
  'Réel simplifié',
  'Micro-entreprise',
  'Forfait',
] as const

export const OHADA_COUNTRIES = [
  { code: 'CI', name: 'Côte d\'Ivoire' },
  { code: 'SN', name: 'Sénégal' },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'ML', name: 'Mali' },
  { code: 'TG', name: 'Togo' },
  { code: 'BJ', name: 'Bénin' },
  { code: 'CM', name: 'Cameroun' },
  { code: 'GA', name: 'Gabon' },
  { code: 'CG', name: 'Congo' },
  { code: 'TD', name: 'Tchad' },
  { code: 'CF', name: 'Centrafrique' },
  { code: 'GQ', name: 'Guinée Équatoriale' },
  { code: 'GN', name: 'Guinée' },
  { code: 'KM', name: 'Comores' },
  { code: 'NE', name: 'Niger' },
  { code: 'GW', name: 'Guinée-Bissau' },
] as const
