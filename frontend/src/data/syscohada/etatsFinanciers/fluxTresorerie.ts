import type { FormatEtatFinancier } from './index'

/**
 * Tableau des Flux de Trésorerie - Système Normal SYSCOHADA
 * Titre IX, Chapitre 5 (p.987-996)
 * Trois catégories : opérationnelles, investissement, financement
 */
export const FLUX_TRESORERIE: FormatEtatFinancier = {
  code: 'FLUX_TRESORERIE',
  titre: 'Tableau des Flux de Trésorerie',
  description: 'Le Tableau des flux de trésorerie présente les entrées et sorties de trésorerie classées en trois catégories : activités opérationnelles, d\'investissement et de financement.',
  reglesPresentation: [
    'Méthode indirecte à partir de la CAFG.',
    'Trois catégories de flux : opérationnelles (A), investissement (B), financement (C).',
    'Variation trésorerie = A + B + C.',
    'Trésorerie nette = Trésorerie-actif - Trésorerie-passif.',
  ],
  rubriques: [
    // A - FLUX DE TRESORERIE PROVENANT DES ACTIVITES OPERATIONNELLES
    { ref: 'ZA', libelle: 'Capacité d\'Autofinancement Globale (CAFG)', comptesAssocies: [], formule: 'EBE - VC cessions courantes + Produits cessions courantes + Revenus financiers + Gains de change + Transferts charges financières + Produits HAO + Transferts charges HAO - Frais financiers - Pertes de change - Participation - Impôts sur résultat' },
    { ref: 'ZB', libelle: 'Variation de l\'actif circulant HAO', comptesAssocies: ['485', '488'], signe: '-' },
    { ref: 'ZC', libelle: 'Variation des stocks', comptesAssocies: ['31', '32', '33', '34', '35', '36', '37', '38'], signe: '-' },
    { ref: 'ZD', libelle: 'Variation des créances', comptesAssocies: ['41', '42', '43', '44', '45', '46', '47'], signe: '-' },
    { ref: 'ZE', libelle: 'Variation du passif circulant', comptesAssocies: ['40', '42', '43', '44', '45', '46', '47'], signe: '+' },
    { ref: 'FA', libelle: 'Flux de trésorerie provenant des activités opérationnelles (A)', comptesAssocies: [], formule: 'ZA-ZB-ZC-ZD+ZE' },

    // B - FLUX DE TRESORERIE PROVENANT DES ACTIVITES D'INVESTISSEMENT
    { ref: 'FF', libelle: 'Décaissements liés aux acquisitions d\'immobilisations incorporelles', comptesAssocies: ['21'], signe: '-' },
    { ref: 'FG', libelle: 'Décaissements liés aux acquisitions d\'immobilisations corporelles', comptesAssocies: ['22', '23', '24'], signe: '-' },
    { ref: 'FH', libelle: 'Décaissements liés aux acquisitions d\'immobilisations financières', comptesAssocies: ['26', '27'], signe: '-' },
    { ref: 'FI', libelle: 'Encaissements liés aux cessions d\'immobilisations incorporelles et corporelles', comptesAssocies: ['82'], signe: '+' },
    { ref: 'FJ', libelle: 'Encaissements liés aux cessions d\'immobilisations financières', comptesAssocies: ['82p'], signe: '+' },
    { ref: 'FB', libelle: 'Flux de trésorerie provenant des activités d\'investissement (B)', comptesAssocies: [], formule: 'FF+FG+FH+FI+FJ' },

    // C - FLUX DE TRESORERIE PROVENANT DES ACTIVITES DE FINANCEMENT
    { ref: 'FK', libelle: 'Augmentations de capital par apports nouveaux', comptesAssocies: ['101', '104'], signe: '+' },
    { ref: 'FL', libelle: 'Subventions d\'investissement reçues', comptesAssocies: ['14'], signe: '+' },
    { ref: 'FM', libelle: 'Prélèvements sur le capital', comptesAssocies: ['101'], signe: '-' },
    { ref: 'FN', libelle: 'Dividendes versés', comptesAssocies: ['465'], signe: '-' },
    { ref: 'FO', libelle: 'Emprunts', comptesAssocies: ['16'], signe: '+' },
    { ref: 'FP', libelle: 'Remboursements des emprunts et dettes assimilées', comptesAssocies: ['16'], signe: '-' },
    { ref: 'FC', libelle: 'Flux de trésorerie provenant des activités de financement (C)', comptesAssocies: [], formule: 'FK+FL+FM+FN+FO+FP' },

    // VARIATION DE TRESORERIE
    { ref: 'FD', libelle: 'VARIATION DE LA TRESORERIE NETTE DE LA PERIODE (A+B+C)', comptesAssocies: [], formule: 'FA+FB+FC' },
    { ref: 'FE', libelle: 'Trésorerie nette au 1er janvier', comptesAssocies: ['50', '51', '52', '53', '54', '55', '57', '58', '56'], formule: 'Trésorerie-Actif(N-1) - Trésorerie-Passif(N-1)' },
    { ref: 'FG_TOTAL', libelle: 'Trésorerie nette au 31 décembre (= FE + FD)', comptesAssocies: [], formule: 'FE+FD' },
    { ref: 'FG_CTRL', libelle: 'Contrôle: Trésorerie-Actif - Trésorerie-Passif au 31/12', comptesAssocies: [], formule: 'BQ-DT' },
  ],
}
