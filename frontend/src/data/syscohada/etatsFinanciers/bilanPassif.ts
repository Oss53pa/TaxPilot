import type { FormatEtatFinancier } from './index'

/**
 * Bilan Passif - Systeme Normal SYSCOHADA
 * Table de correspondance Postes/Comptes (Titre IX, Chapitre 7, p.1049)
 */
export const BILAN_PASSIF: FormatEtatFinancier = {
  code: 'BILAN_PASSIF',
  titre: 'Bilan - Passif',
  description: 'Le passif reflète les moyens de financement : capitaux propres, dettes financières, passif circulant et trésorerie-passif.',
  reglesPresentation: [
    'Le passif comprend deux colonnes : Net N et Net N-1.',
    'Le résultat net de l\'exercice figure au passif (bénéfice + ou perte -).',
    'Le bilan est présenté avant répartition du résultat.',
  ],
  rubriques: [
    // CAPITAUX PROPRES ET RESSOURCES ASSIMILEES
    { ref: 'CA', libelle: 'Capital', comptesAssocies: ['101', '102', '103', '104'], note: '13' },
    { ref: 'CB', libelle: 'Apporteurs capital non appelé (-)', comptesAssocies: ['109'], note: '13', signe: '-' },
    { ref: 'CD', libelle: 'Primes liées au capital social', comptesAssocies: ['105'], note: '14' },
    { ref: 'CE', libelle: 'Ecarts de réévaluation', comptesAssocies: ['106'], note: '3e' },
    { ref: 'CF', libelle: 'Réserves indisponibles', comptesAssocies: ['111', '112', '113'], note: '14' },
    { ref: 'CG', libelle: 'Réserves libres', comptesAssocies: ['118'], note: '14' },
    { ref: 'CH', libelle: 'Report à nouveau (+ ou -)', comptesAssocies: ['121', '129'], note: '14' },
    { ref: 'CJ', libelle: 'Résultat net de l\'exercice (bénéfice + ou perte -)', comptesAssocies: ['131', '139'] },
    { ref: 'CL', libelle: 'Subventions d\'investissement', comptesAssocies: ['14'], note: '15' },
    { ref: 'CM', libelle: 'Provisions réglementées', comptesAssocies: ['15'], note: '15' },

    { ref: 'CP', libelle: 'TOTAL CAPITAUX PROPRES ET RESSOURCES ASSIMILEES', comptesAssocies: [], formule: 'CA+CB+CD+CE+CF+CG+CH+CJ+CL+CM' },

    // DETTES FINANCIERES ET RESSOURCES ASSIMILEES
    { ref: 'DA', libelle: 'Emprunts et dettes assimilées', comptesAssocies: ['16'], note: '16' },
    { ref: 'DB', libelle: 'Dettes de location acquisition', comptesAssocies: ['17'], note: '16' },
    { ref: 'DC', libelle: 'Provisions financières pour risques et charges', comptesAssocies: ['19'], note: '16' },

    { ref: 'DD', libelle: 'TOTAL DETTES FINANCIERES ET RESSOURCES ASSIMILEES', comptesAssocies: [], formule: 'DA+DB+DC' },

    { ref: 'DF', libelle: 'TOTAL RESSOURCES STABLES', comptesAssocies: [], formule: 'CP+DD' },

    // PASSIF CIRCULANT
    { ref: 'DH', libelle: 'Dettes circulantes HAO', comptesAssocies: ['481', '484', '488p'], note: '5' },

    { ref: 'DI', libelle: 'Clients, avances reçues', comptesAssocies: ['419'], note: '7' },
    { ref: 'DJ', libelle: 'Fournisseurs d\'exploitation', comptesAssocies: ['40'], note: '17' },
    { ref: 'DK', libelle: 'Dettes fiscales et sociales', comptesAssocies: ['42', '43', '44'], note: '18' },
    { ref: 'DL', libelle: 'Autres dettes', comptesAssocies: ['45', '46', '47', '48p'], note: '19' },
    { ref: 'DM', libelle: 'Provisions pour risques à court terme', comptesAssocies: ['499'], note: '19' },

    { ref: 'DN', libelle: 'TOTAL PASSIF CIRCULANT', comptesAssocies: [], formule: 'DH+DI+DJ+DK+DL+DM' },

    // TRESORERIE-PASSIF
    { ref: 'DQ', libelle: 'Banques, crédits d\'escompte', comptesAssocies: ['56'], note: '20' },
    { ref: 'DR', libelle: 'Banques, établissements financiers et crédits de trésorerie', comptesAssocies: ['52p', '561', '566'], note: '20' },

    { ref: 'DT', libelle: 'TOTAL TRESORERIE-PASSIF', comptesAssocies: [], formule: 'DQ+DR' },

    // ECART DE CONVERSION
    { ref: 'DV', libelle: 'Ecart de conversion-Passif', comptesAssocies: ['479'], note: '11' },

    { ref: 'DZ', libelle: 'TOTAL GENERAL', comptesAssocies: [], formule: 'DF+DN+DT+DV' },
  ],
}
