/**
 * Etats Financiers SYSCOHADA - Titre IX
 * Structure officielle du Bilan, Compte de Resultat, TFT et Notes Annexes
 */

export interface RubriqueEtat {
  ref: string
  libelle: string
  comptesAssocies: string[]
  comptesAmortissements?: string[]
  formule?: string
  note?: string
  signe?: '+' | '-' | '-/+'
}

export interface FormatEtatFinancier {
  code: string
  titre: string
  description: string
  rubriques: RubriqueEtat[]
  reglesPresentation: string[]
}

export interface SoldeIntermediaireGestion {
  code: string
  libelle: string
  formule: string
  interpretation: string
}

export interface EquilibreFinancier {
  nom: string
  formule: string
  interpretation: string
}

export { BILAN_ACTIF } from './bilanActif'
export { BILAN_PASSIF } from './bilanPassif'
export { COMPTE_RESULTAT } from './compteResultat'
export { FLUX_TRESORERIE } from './fluxTresorerie'
export { NOTES_ANNEXES } from './notesAnnexes'
export { REGLES_PRESENTATION, EQUILIBRES_FINANCIERS, SIG } from './reglesPresentation'
