import type { FormatEtatFinancier } from './index'

/**
 * Bilan Actif - Systeme Normal SYSCOHADA
 * Table de correspondance Postes/Comptes (Titre IX, Chapitre 7, p.1049)
 */
export const BILAN_ACTIF: FormatEtatFinancier = {
  code: 'BILAN_ACTIF',
  titre: 'Bilan - Actif',
  description: 'Le Bilan decrit en termes d\'actif la situation patrimoniale de l\'entite. Le SYSCOHADA preconise un bilan avant repartition du resultat et opte pour un classement fonctionnel des postes.',
  reglesPresentation: [
    'Le bilan est presente avant repartition du resultat.',
    'Classement fonctionnel: investissement, financement, exploitation.',
    'Chaque rubrique comprend: Brut, Amortissements/Depreciations, Net N, Net N-1.',
    'Les rubriques et postes non chiffres peuvent etre supprimes.',
    'Pour chaque poste, les chiffres N-1 doivent etre mentionnes.',
  ],
  rubriques: [
    // ACTIF IMMOBILISE
    { ref: 'AD', libelle: 'IMMOBILISATIONS INCORPORELLES', comptesAssocies: [], note: '3', formule: 'AE+AF+AG+AH' },
    { ref: 'AE', libelle: 'Frais de developpement et de prospection', comptesAssocies: ['211', '2181', '2191'], comptesAmortissements: ['2811', '2818p', '2911', '2918p', '2919p'] },
    { ref: 'AF', libelle: 'Brevets, licences, logiciels, et droits similaires', comptesAssocies: ['212', '213', '214', '2193'], comptesAmortissements: ['2812', '2813', '2814', '2912', '2913', '2914', '2919p'] },
    { ref: 'AG', libelle: 'Fonds commercial et droit au bail', comptesAssocies: ['215', '216'], comptesAmortissements: ['2815', '2816', '2915', '2916'] },
    { ref: 'AH', libelle: 'Autres immobilisations incorporelles', comptesAssocies: ['217', '218', '2198'], comptesAmortissements: ['2817', '2818p', '2917', '2918p', '2919p'] },

    { ref: 'AI', libelle: 'IMMOBILISATIONS CORPORELLES', comptesAssocies: [], note: '3', formule: 'AJ+AK+AL+AM+AN' },
    { ref: 'AJ', libelle: 'Terrains', comptesAssocies: ['22'], comptesAmortissements: ['282', '292'], note: 'dont Placement en Net' },
    { ref: 'AK', libelle: 'Batiments', comptesAssocies: ['231', '232', '233', '234', '237', '2395'], comptesAmortissements: ['2831', '2832', '2833', '2834', '2837', '293p'] },
    { ref: 'AL', libelle: 'Amenagements, agencements et installations', comptesAssocies: ['235', '2395p'], comptesAmortissements: ['2835', '293p'] },
    { ref: 'AM', libelle: 'Materiel, mobilier et actifs biologiques', comptesAssocies: ['24', '2398'], comptesAmortissements: ['284', '294'] },
    { ref: 'AN', libelle: 'Matériel de transport', comptesAssocies: ['245', '2398p'], comptesAmortissements: ['2845', '294p'] },

    { ref: 'AP', libelle: 'Avances et acomptes verses sur immobilisations', comptesAssocies: ['251', '252'], note: '3' },

    { ref: 'AQ', libelle: 'IMMOBILISATIONS FINANCIERES', comptesAssocies: [], note: '4', formule: 'AR+AS' },
    { ref: 'AR', libelle: 'Titres de participation', comptesAssocies: ['26'], comptesAmortissements: ['296'] },
    { ref: 'AS', libelle: 'Autres immobilisations financieres', comptesAssocies: ['27'], comptesAmortissements: ['297'] },

    { ref: 'AZ', libelle: 'TOTAL ACTIF IMMOBILISE', comptesAssocies: [], formule: 'AD+AI+AP+AQ' },

    // ACTIF CIRCULANT
    { ref: 'BA', libelle: 'ACTIF CIRCULANT HAO', comptesAssocies: ['485', '488'], note: '5' },

    { ref: 'BB', libelle: 'STOCKS ET ENCOURS', comptesAssocies: [], note: '6', formule: 'BC+BD' },
    { ref: 'BC', libelle: 'Stocks de marchandises', comptesAssocies: ['31'], comptesAmortissements: ['391'] },
    { ref: 'BD', libelle: 'Matieres premieres et autres approvisionnements', comptesAssocies: ['32', '33', '34', '35', '36', '37', '38'], comptesAmortissements: ['392', '393', '394', '395', '396', '397', '398'] },

    { ref: 'BF', libelle: 'CREANCES ET EMPLOIS ASSIMILES', comptesAssocies: [], formule: 'BG+BH+BI' },
    { ref: 'BG', libelle: 'Fournisseurs avances versees', comptesAssocies: ['409'], note: '17' },
    { ref: 'BH', libelle: 'Clients', comptesAssocies: ['41'], comptesAmortissements: ['491'], note: '7' },
    { ref: 'BI', libelle: 'Autres creances', comptesAssocies: ['42', '43', '44', '45', '46', '47', '48p'], comptesAmortissements: ['49p'], note: '8' },

    { ref: 'BJ', libelle: 'TOTAL ACTIF CIRCULANT', comptesAssocies: [], formule: 'BA+BB+BF' },

    // TRESORERIE-ACTIF
    { ref: 'BK', libelle: 'Titres de placement', comptesAssocies: ['50'], comptesAmortissements: ['590'], note: '9' },
    { ref: 'BL', libelle: 'Valeurs a encaisser', comptesAssocies: ['51'], comptesAmortissements: ['591'] },
    { ref: 'BM', libelle: 'Banques, cheques postaux, caisse et assimiles', comptesAssocies: ['52', '53', '54', '55', '57', '58'], note: '10' },

    { ref: 'BQ', libelle: 'TOTAL TRESORERIE-ACTIF', comptesAssocies: [], formule: 'BK+BL+BM' },

    // ECART DE CONVERSION
    { ref: 'BR', libelle: 'Ecart de conversion-Actif', comptesAssocies: ['478'], note: '11' },

    { ref: 'BZ', libelle: 'TOTAL GENERAL', comptesAssocies: [], formule: 'AZ+BJ+BQ+BR' },
  ],
}
