/**
 * Types pour le référentiel SYSCOHADA Révisé complet
 * Interfaces pour le plan comptable, le fonctionnement des comptes
 * et les opérations spécifiques (41 chapitres)
 */

/** Compte comptable SYSCOHADA (rétrocompatible avec l'ancien format) */
export interface CompteComptable {
  numero: string
  libelle: string
  classe: number
  sousClasse?: string
  nature: 'ACTIF' | 'PASSIF' | 'CHARGE' | 'PRODUIT' | 'SPECIAL'
  sens: 'DEBITEUR' | 'CREDITEUR'
  utilisation: 'OBLIGATOIRE' | 'FACULTATIF' | 'INTERDIT'
  secteurs?: string[]
  notes?: string
}

/** Métadonnées d'une classe SYSCOHADA */
export interface ClasseSYSCOHADA {
  numero: string
  libelle: string
  description: string
}

/** Fonctionnement détaillé d'un compte (chargé à la demande) */
export interface FonctionnementCompte {
  numero: string
  contenu: string
  subdivisions: { numero: string; libelle: string }[]
  commentaires: string[]
  fonctionnement: {
    debit: { description: string; contrePartie: string[] }[]
    credit: { description: string; contrePartie: string[] }[]
  }
  exclusions: {
    description: string
    compteCorrige: string
    libelleCompteCorrige: string
  }[]
  elementsControle: string[]
}

/** Ligne d'écriture comptable exemple */
export interface EcritureExemple {
  numero: number
  description: string
  lignes: {
    sens: 'D' | 'C'
    compte: string
    libelleCompte: string
    montant?: number
    commentaire?: string
  }[]
}

/** Section d'un chapitre d'opérations spécifiques */
export interface SectionOperation {
  titre: string
  contenu: string
  ecritures?: EcritureExemple[]
}

/** Chapitre d'opérations spécifiques SYSCOHADA */
export interface ChapitreOperations {
  numero: number
  titre: string
  sections: SectionOperation[]
  comptesLies: string[]
}
